import { GoogleGenAI, Type } from "@google/genai";
import { PlantAnalysisResult } from "./types";

// Helper to remove the data URL prefix for the API
const cleanBase64 = (base64: string) => {
  return base64.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, "");
};

const getMimeType = (base64: string) => {
  const match = base64.match(/^data:image\/(png|jpeg|jpg|webp);base64,/);
  return match ? `image/${match[1]}` : "image/jpeg";
};

// Generate a SHA-256 hash of the base64 image string to use as a cache key
const generateImageHash = async (base64: string): Promise<string> => {
  const msgBuffer = new TextEncoder().encode(base64);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};

const CACHE_PREFIX = 'drplant_analysis_cache_v1_';

export const analyzePlantImage = async (base64Image: string): Promise<PlantAnalysisResult> => {
  try {
    // 1. Check Local Cache using Image Hash
    const imageHash = await generateImageHash(base64Image);
    const cacheKey = `${CACHE_PREFIX}${imageHash}`;
    const cachedData = localStorage.getItem(cacheKey);

    if (cachedData) {
      console.log("Serving analysis from local cache");
      const result = JSON.parse(cachedData) as PlantAnalysisResult;
      
      // Refresh ID and Date so it appears as a fresh entry in the session/history
      // even though the diagnostic data is cached.
      result.id = crypto.randomUUID();
      result.date = new Date().toISOString();
      return result;
    }

    // 2. Prepare API Call
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const mimeType = getMimeType(base64Image);
    const cleanData = cleanBase64(base64Image);

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: {
        parts: [
          {
            inlineData: {
              data: cleanData,
              mimeType: mimeType,
            },
          },
          {
            text: `Você é um agrônomo especialista e fitopatologista. Analise esta imagem.
            
            1. Verifique se a imagem contém uma planta, hortaliça, legume, verdura, fruta ou parte deles (folha, caule, fruto, raiz).
            2. Se NÃO for uma planta/vegetal, defina 'isPlant' como false e forneça uma mensagem amigável em 'description'.
            3. Se FOR uma planta ou hortaliça, identifique possíveis doenças, pragas ou deficiências nutricionais.
            4. Se a cultura estiver saudável, indique isso.
            5. Identifique se há sinais visuais claros de deficiências nutricionais (ex: nitrogênio, ferro, potássio). Para cada uma, forneça o nome e uma solução prática de correção.
            6. Identifique a planta hospedeira (cultura) e forneça informações detalhadas em 'cultureInfo'. Inclua nome, taxonomia.
            7. Em 'idealConditions', detalhe o clima geral, e especificamente o tipo de solo ideal, a faixa de pH e a umidade preferida para esta hortaliça ou planta.
            8. Separe listas de principais pragas e principais doenças especificamente para esta cultura.
            
            Responda APENAS com um objeto JSON seguindo estritamente este esquema.`,
          },
        ],
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            isPlant: {
              type: Type.BOOLEAN,
              description: "Indica se a imagem contém uma planta ou hortaliça.",
            },
            diagnosis: {
              type: Type.STRING,
              description: "Nome da doença, praga ou condição (ex: 'Saudável', 'Oídio', 'Deficiência de Nitrogênio').",
            },
            scientificName: {
              type: Type.STRING,
              description: "Nome científico do patógeno ou planta (diagnóstico), se aplicável.",
            },
            confidence: {
              type: Type.NUMBER,
              description: "Nível de confiança da análise de 0 a 100.",
            },
            description: {
              type: Type.STRING,
              description: "Uma breve descrição do problema identificado ou do estado da cultura.",
            },
            symptoms: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Lista de sintomas visuais identificados.",
            },
            causes: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Lista de possíveis causas (fungos, bactérias, manejo, etc).",
            },
            nutritionalDeficiencies: {
              type: Type.ARRAY,
              items: { 
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING, description: "Nome da deficiência (ex: Deficiência de Ferro)." },
                  solution: { type: Type.STRING, description: "Solução recomendada ou fertilizante indicado para corrigir." }
                },
                required: ["name", "solution"]
              },
              description: "Lista de deficiências nutricionais com soluções.",
            },
            treatment: {
              type: Type.OBJECT,
              properties: {
                biological: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: "Opções de tratamento orgânico ou biológico.",
                },
                chemical: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: "Opções de tratamento químico (defensivos), se necessário.",
                },
                prevention: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: "Dicas de prevenção para o futuro.",
                },
              },
              required: ["biological", "chemical", "prevention"],
            },
            cultureInfo: {
              type: Type.OBJECT,
              properties: {
                commonName: { type: Type.STRING, description: "Nome comum da planta ou hortaliça (ex: Tomate, Alface)." },
                scientificName: { type: Type.STRING, description: "Nome científico da planta hospedeira." },
                family: { type: Type.STRING, description: "Família botânica da planta." },
                description: { type: Type.STRING, description: "Breve descrição sobre a cultura." },
                idealConditions: { 
                  type: Type.OBJECT, 
                  properties: {
                    description: { type: Type.STRING, description: "Resumo das condições climáticas e de luz ideais." },
                    soil: { type: Type.STRING, description: "Tipo de solo preferido." },
                    ph: { type: Type.STRING, description: "Faixa de pH ideal." },
                    humidity: { type: Type.STRING, description: "Necessidades de umidade e rega." }
                  },
                  required: ["description", "soil", "ph", "humidity"],
                  description: "Condições ideais de cultivo." 
                },
                commonPests: { 
                  type: Type.ARRAY, 
                  items: { type: Type.STRING }, 
                  description: "Lista de 3-5 pragas (insetos, ácaros) muito comuns nesta cultura." 
                },
                commonDiseases: { 
                  type: Type.ARRAY, 
                  items: { type: Type.STRING }, 
                  description: "Lista de 3-5 doenças (fungos, vírus, bactérias) muito comuns nesta cultura." 
                }
              },
              required: ["commonName", "description", "commonPests", "commonDiseases", "idealConditions"]
            }
          },
          required: ["isPlant", "diagnosis", "confidence", "description", "treatment"],
        },
      },
    });

    if (!response.text) {
      throw new Error("Resposta vazia da IA");
    }

    const result = JSON.parse(response.text) as PlantAnalysisResult;
    
    // 3. Save to Cache
    // We try to save it to localStorage. If quota is exceeded, we just ignore.
    try {
      localStorage.setItem(cacheKey, JSON.stringify(result));
    } catch (e) {
      console.warn("Could not save analysis to cache (quota exceeded?)", e);
    }

    // Add Metadata client-side for the current session interaction
    result.id = crypto.randomUUID();
    result.date = new Date().toISOString();
    
    return result;

  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("Falha ao analisar a imagem. Tente novamente.");
  }
};