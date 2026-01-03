import { GoogleGenAI, Type } from "@google/genai";
import { PlantAnalysisResult } from "./types";

// Helper to remove the data URL prefix for the API
const cleanBase64 = (base64: string) => {
  // More robust cleanup: split by comma and take the second part
  if (base64.includes(',')) {
    return base64.split(',')[1];
  }
  return base64;
};

const getMimeType = (base64: string) => {
  const match = base64.match(/^data:(image\/[a-zA-Z+]+);base64,/);
  return match ? match[1] : "image/jpeg";
};

// Helper to clean JSON string from Markdown code blocks
const cleanJsonString = (text: string): string => {
  let cleaned = text.replace(/```json/g, '').replace(/```/g, '');
  const firstBrace = cleaned.indexOf('{');
  const lastBrace = cleaned.lastIndexOf('}');
  
  if (firstBrace !== -1 && lastBrace !== -1) {
    cleaned = cleaned.substring(firstBrace, lastBrace + 1);
  }
  return cleaned.trim();
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
  // 1. Check for API Key immediately (outside try/catch to propagate specific error)
  if (!process.env.API_KEY || process.env.API_KEY === '""') {
    console.error("API_KEY is missing in process.env");
    throw new Error("Configuração de API ausente. Verifique as variáveis de ambiente no Vercel.");
  }

  try {
    // 2. Check Local Cache using Image Hash
    try {
      const imageHash = await generateImageHash(base64Image);
      const cacheKey = `${CACHE_PREFIX}${imageHash}`;
      const cachedData = localStorage.getItem(cacheKey);

      if (cachedData) {
        console.log("Serving analysis from local cache");
        const result = JSON.parse(cachedData) as PlantAnalysisResult;
        result.id = crypto.randomUUID();
        result.date = new Date().toISOString();
        return result;
      }
    } catch (e) {
      console.warn("Cache check failed, proceeding to API", e);
    }

    // 3. Prepare API Call
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
      throw new Error("A IA retornou uma resposta vazia. Tente novamente.");
    }

    let result: PlantAnalysisResult;
    try {
      const cleanedText = cleanJsonString(response.text);
      result = JSON.parse(cleanedText) as PlantAnalysisResult;
    } catch (parseError) {
      console.error("JSON Parse Error:", parseError, "Raw Text:", response.text);
      throw new Error("Erro ao interpretar a resposta da IA. O formato recebido foi inválido.");
    }
    
    // 4. Save to Cache
    try {
      const imageHash = await generateImageHash(base64Image);
      const cacheKey = `${CACHE_PREFIX}${imageHash}`;
      localStorage.setItem(cacheKey, JSON.stringify(result));
    } catch (e) {
      console.warn("Could not save analysis to cache", e);
    }

    result.id = crypto.randomUUID();
    result.date = new Date().toISOString();
    
    return result;

  } catch (error: any) {
    console.error("Gemini API Error Full Details:", error);
    
    // If it's already an Error with a message we threw above, rethrow it
    if (error.message === "Configuração de API ausente. Verifique as variáveis de ambiente no Vercel." || 
        error.message.includes("resposta vazia") || 
        error.message.includes("interpretar a resposta")) {
      throw error;
    }

    // Handle API-specific errors
    let errorMessage = "Falha ao analisar a imagem. Verifique sua conexão.";
    if (error.message?.includes("403") || error.message?.includes("permission")) {
      errorMessage = "Erro de permissão (API Key inválida ou sem créditos).";
    } else if (error.message?.includes("429")) {
      errorMessage = "Muitas requisições. Tente novamente em alguns segundos.";
    } else if (error.message?.includes("500") || error.message?.includes("503")) {
      errorMessage = "Serviço da IA indisponível temporariamente.";
    }

    throw new Error(errorMessage);
  }
};