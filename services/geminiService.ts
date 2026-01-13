import { GoogleGenAI, Type } from "@google/genai";
import { SYSTEM_PROMPT } from "../constants";
import { AnalysisResult } from "../types";

export const analyzeGiftMedia = async (
  file: File, 
  apiKey: string
): Promise<AnalysisResult> => {
  const ai = new GoogleGenAI({ apiKey });
  
  // Convert file to Base64
  const base64Data = await fileToGenerativePart(file);
  const isImage = file.type.startsWith('image/');
  
  // Use a model capable of multimodal analysis. 
  // gemini-3-flash-preview is good for complex reasoning and multimodal.
  const modelId = "gemini-3-flash-preview"; 

  const prompt = "请分析此礼物特效文件，并根据系统指令提供中文定价建议。";

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: {
        parts: [
          {
            inlineData: {
              data: base64Data,
              mimeType: file.type,
            }
          },
          { text: prompt }
        ]
      },
      config: {
        systemInstruction: SYSTEM_PROMPT,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            estimatedDuration: { type: Type.STRING, description: "预计时长 (例如 '4s', '12s')" },
            screenCoverage: { type: Type.STRING, description: "1/4, 2/4, 3/4, 或 全屏" },
            transitionCount: { type: Type.INTEGER, description: "视觉转场次数" },
            visualComplexity: { type: Type.STRING, description: "低, 中, 或 高" },
            suggestedLevel: { type: Type.INTEGER, description: "建议等级 (1-5)" },
            suggestedPriceUsd: { type: Type.NUMBER, description: "建议美元价格" },
            suggestedDiamonds: { type: Type.INTEGER, description: "建议钻石价格" },
            reasoning: { type: Type.STRING, description: "基于规则的定价理由 (中文)" },
            warnings: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING },
              description: "关于质量或缺失标准的警告 (中文)"
            }
          },
          required: ["estimatedDuration", "screenCoverage", "transitionCount", "suggestedPriceUsd", "suggestedDiamonds", "reasoning"]
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    
    return JSON.parse(text) as AnalysisResult;

  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    throw error;
  }
};

const fileToGenerativePart = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = (reader.result as string).split(',')[1];
      resolve(base64String);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};