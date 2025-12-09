
import { GoogleGenAI, Type, Schema } from "@google/genai";
import { UserInput, AnalysisResponse, ChatMessage, CalendarType } from "../types";

// Updated Schema for structured separation of content
const analysisSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    chart: {
      type: Type.OBJECT,
      description: "精準計算的四柱八字。必須依據天文曆法精確換算節氣。",
      properties: {
        year: {
          type: Type.OBJECT,
          properties: { stem: { type: Type.STRING }, branch: { type: Type.STRING } },
        },
        month: {
          type: Type.OBJECT,
          properties: { stem: { type: Type.STRING }, branch: { type: Type.STRING } },
        },
        day: {
          type: Type.OBJECT,
          properties: { stem: { type: Type.STRING }, branch: { type: Type.STRING } },
        },
        hour: {
          type: Type.OBJECT,
          properties: { stem: { type: Type.STRING }, branch: { type: Type.STRING } },
        },
        currentDaYun: { type: Type.STRING, description: "當前大運" },
        me: { type: Type.STRING, description: "日元" },
      },
    },
    classical: {
      type: Type.STRING,
      description: "徐樂吾風格的專業命理分析（Markdown格式）。包含原局強弱、格局、病藥、調候之古文論斷。",
    },
    modern: {
      type: Type.STRING,
      description: "給現代人看的白話文深度解讀（Markdown格式）。解釋個性、優缺點、並詳細分析2026年運勢。",
    },
    summary: {
      type: Type.STRING,
      description: "一句話的精闢總結（約20-30字），一針見血。",
    },
  },
  required: ["chart", "classical", "modern", "summary"],
};

export const analyzeBaZi = async (
  apiKey: string,
  input: UserInput
): Promise<AnalysisResponse> => {
  const genAI = new GoogleGenAI({ apiKey });

  const systemInstruction = `
    【身分設定】
    你是一位鑽研八字三十年的命理宗師，師承《滴天髓》、《子平真詮》及近代大師徐樂吾、梁湘潤。
    
    【核心任務】
    請對命主進行八字論命，嚴格遵守下列流程，並將輸出分為「專業古文」與「白話解讀」兩部分。
    
    【重要：曆法換算】
    若命主提供的是「農曆」日期，你必須先運用你的曆法知識，將其轉換為對應年份的「國曆（西元）」日期，並以此推算真太陽時的節氣，以決定正確的月柱與年柱分界（立春）。

    【論命七步驟】
    1. **排四柱**：精確計算干支（注意節氣）。
    2. **判斷強弱與格局**：依《子平真詮》定格（如七殺格、食神生財格），看日主得令得地情形。
    3. **取用神**：
       - 扶抑用神（平衡）
       - 通關用神（疏通）
       - 病藥用神（依《神峰通考》，有病方為貴）
       - 調候用神（依《窮通寶鑑》，寒暖濕燥）
    4. **查空亡**：依梁湘潤古法，檢查四柱地支空亡。
    5. **看神煞**：標註關鍵神煞。
    6. **大運流年**：推算當前大運，並重點分析 **2026 丙午年**。
    7. **總結**。

    【輸出風格要求】
    1. **classical (徐樂吾風格)**：
       - 使用半文半白，模仿《徐樂吾自評》語氣。
       - 語氣肯定、直斷（例如：「金水傷官喜見官，此命貴氣所在」）。
       - 引用經典（如：「書云...」）。
    2. **modern (現代白話)**：
       - 用溫暖、易懂的現代語言解釋上述專業內容。
       - 著重於「個性特質」、「事業財運建議」、「2026年具體運勢」。
       - 必須解釋為什麼這樣說（例如：「因為你命中缺火，所以...」）。
  `;

  const userPrompt = `
    命主資料：
    輸入日期類型：${input.calendarType} ${input.calendarType === CalendarType.LUNAR && input.isLeapMonth ? '(閏月)' : ''}
    輸入日期：${input.birthDate}
    出生時間：${input.birthTime}
    性別：${input.gender}

    請注意：若為農曆，請務必精準換算為對應的太陽曆節氣來排八字。
    請開始排盤並論命。
  `;

  try {
    const chat = genAI.chats.create({
        model: "gemini-2.5-flash",
        config: {
          systemInstruction: systemInstruction,
          responseMimeType: "application/json",
          responseSchema: analysisSchema,
          temperature: 0.85,
        },
    });

    const response = await chat.sendMessage({ message: userPrompt });

    if (response.text) {
      return JSON.parse(response.text) as AnalysisResponse;
    }
    throw new Error("大師正在沉思中，請稍後再試...");
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};

export const chatWithMaster = async (
  apiKey: string,
  history: ChatMessage[],
  newMessage: string,
  chartContext: AnalysisResponse
): Promise<string> => {
  const genAI = new GoogleGenAI({ apiKey });

  // Construct context from the chart analysis
  const systemPrompt = `
    你現在正與命主進行對話。你已經為他算完八字。
    
    【命主八字資訊】
    日元：${chartContext.chart.me}
    格局與分析重點：${chartContext.summary}
    古文判詞參考：${chartContext.classical.substring(0, 500)}...
    
    【對話規則】
    1. 保持「三十年經驗命理大師」的人設。
    2. 語氣可以比論命時輕鬆一點，但仍需帶有專業權威感。
    3. 針對使用者的問題，依據八字原理回答。
    4. 若使用者問及2026年運勢，請再次強調流年丙午的影響。
  `;

  // Use ai.chats.create to start a new chat session with history
  const chat = genAI.chats.create({
    model: "gemini-2.5-flash",
    config: {
      systemInstruction: systemPrompt,
    },
    history: history.map(msg => ({
      role: msg.role,
      parts: [{ text: msg.content }]
    })),
  });

  const result = await chat.sendMessage({ message: newMessage });
  return result.text || "";
};
