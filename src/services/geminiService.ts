
import { GoogleGenAI, Type, Schema } from "@google/genai";
import { UserInput, AnalysisResponse, ChatMessage, CalendarType, AnalysisMode } from "../types";

// Helper: Get Prioritized Models List
const getPrioritizedModels = async (apiKey: string): Promise<string[]> => {
  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    if (!response.ok) return ["gemini-2.0-flash", "gemini-1.5-flash"];

    const data = await response.json();
    const models = (data.models || []).map((m: any) => m.name.replace('models/', ''));

    // Filter usable models
    const candidates = models.filter((name: string) =>
      name.includes('gemini') &&
      !name.includes('vision') &&
      !name.includes('embedding') &&
      !name.includes('tts') &&    // Exclude Text-to-Speech only models
      !name.includes('audio')     // Exclude Audio-focused models if they don't support text
    );

    // Sort by Heuristic
    candidates.sort((a: string, b: string) => {
      // 1. Version Check
      const getVersion = (n: string) => {
        const match = n.match(/(\d+\.\d+)/);
        return match ? parseFloat(match[1]) : 0;
      };
      const vA = getVersion(a);
      const vB = getVersion(b);
      if (vA !== vB) return vB - vA; // Higher version first

      // 2. Tier Check
      const getTierScore = (n: string) => {
        if (n.includes('ultra')) return 3;
        if (n.includes('pro')) return 2;
        if (n.includes('flash')) return 1;
        return 0;
      };
      return getTierScore(b) - getTierScore(a);
    });

    return candidates.length > 0 ? candidates : ["gemini-2.0-flash"];
  } catch (e) {
    console.warn("Model resolution error, using fallback.");
    return ["gemini-2.0-flash"];
  }
};

// Retry Helper
const executeWithRetry = async <T>(
  action: (model: string) => Promise<T>,
  modelModels: string[]
): Promise<{ result: T; model: string }> => {
  let lastError: any;

  // Ensure we have at least one fallback
  if (modelModels.length === 0) modelModels.push("gemini-2.0-flash");

  for (const model of modelModels) {
    try {
      console.log(`[Gemini Service] Attempting execution with model: ${model}`);
      const result = await action(model);
      return { result, model };
    } catch (error: any) {
      console.warn(`[Gemini Service] Model ${model} failed.`, error);
      lastError = error;

      console.warn(`[Gemini Service] Model ${model} failed.`, error);
      lastError = error;

      // User requested: "If error received, skip to next model"
      // We explicitly allow 400 (Invalid Argument) to trigger a retry/skip.
      // In fact, we should basically continue on almost any error except maybe auth failure if we want to be super resilient,
      // but let's stick to the user's "skip to next" instruction.
      const isCriticalError = error.message?.includes("API key not valid") || error.message?.includes("PERMISSION_DENIED");

      if (isCriticalError) {
        throw error; // Stop if API key is wrong
      }

      // Continue to next model for 400, 404, 429, 503, etc.
      continue;
    }
  }
  throw lastError;
};

export const analyzeBaZi = async (
  input: UserInput,
  mode: AnalysisMode,
  apiKey?: string
): Promise<AnalysisResponse> => {
  const finalApiKey = apiKey || import.meta.env.VITE_API_KEY;
  if (!finalApiKey) {
    throw new Error("請輸入 Google Gemini API Key 或設定環境變數");
  }

  // Dynamic Schema Definition based on Mode to ensure clear scoring criteria
  const getScoreDescription = () => {
    if (mode === AnalysisMode.YEARLY) {
      return "針對 2025-2026 流年運勢吉凶的綜合評分 (0-100)。分數越高代表流年越順遂，分數低則代表需保守防禦。";
    }
    return "針對本命八字格局層次、強弱與一生總運的綜合評分 (0-100)。分數越高代表格局越好、阻礙越少。";
  };

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
      score: {
        type: Type.NUMBER,
        description: getScoreDescription(),
      },
      radar: {
        type: Type.OBJECT,
        description: "六維運勢分析 (0-100分)",
        properties: {
          career: { type: Type.NUMBER, description: "事業運/官殺強度" },
          wealth: { type: Type.NUMBER, description: "財運/財星強度" },
          love: { type: Type.NUMBER, description: "感情/夫妻宮狀態" },
          health: { type: Type.NUMBER, description: "健康/五行平衡度" },
          social: { type: Type.NUMBER, description: "人際/比劫助力" },
          family: { type: Type.NUMBER, description: "家庭/印星食傷狀態" },
        },
        required: ["career", "wealth", "love", "health", "social", "family"],
      },
    },
    required: ["chart", "classical", "modern", "summary", "score", "radar"],
  };

  const genAI = new GoogleGenAI({ apiKey: finalApiKey });
  // Model priority is already handled here:
  // 1. Logic inside getPrioritizedModels sorts by version (2.0 > 1.5) and Tier (Pro > Flash)
  // 2. executeWithRetry handles the fallback.
  // The user requirement "Highest Pro -> Flash" is naturally satisfied by our sorting logic.
  const prioritizedModels = await getPrioritizedModels(finalApiKey);

  let specificInstruction = "";
  if (mode === AnalysisMode.YEARLY) {
    specificInstruction = `
    【特殊任務：流年運勢模式】
    請將分析重點放在 **2025年 (乙巳)** 與 **2026年 (丙午)** 的運勢預測。
    **評分 (score) 重點**：請針對「這兩年的流年運勢」進行評分，而非本命格局。
    **雷達圖 (radar) 重點**：請針對「這兩年的運勢變化」來給予六大構面評分。
    
    1. **classical (古文)**：重點分析流年干支與原局的刑沖會合。例如「乙巳流年，巳為火之臨官，與原局...」。需引用梁湘潤流年法。
    2. **modern (白話)**：
       - **必須**使用 Markdown 格式進行結構化輸出（使用 '###' 分段，使用 '-' 條列）。
       - **嚴禁**將所有內容擠在同一段落。每一個運勢重點（事業、財運、感情）都要分段。
       - **重點標註**：請將關鍵結論（例如：**大吉**、**需注意**、**貴人運強**）使用 Markdown 的粗體語法 '**重點**' 包起來，以便讓讀者一眼看到。
       - 詳細說明這兩年的事業升遷機會、財運起伏、感情變化。
       - 提醒具體的月份（例如：農曆五月火旺之時...）。
       - 給出具體的趨吉避凶建議。
    `;
  } else if (mode === AnalysisMode.SCHOLARLY) {
    // ... scholarly instructions ...
    specificInstruction = `
    【特殊任務：古籍考據模式】
    請化身為考據學家，將重點放在學術探討。
    **雷達圖 (radar) 重點**：依據格局高低與五行強弱來進行學術性量化。
    
    1. **classical (古文)**：
    // ...
    `;
  } else {
    // Basic mode instructions
    specificInstruction = `
    【標準任務：八字正宗模式】
    請依據標準七步驟進行全面論斷：強弱、格局、用神、病藥、調候、神煞、大運流年。
    **評分 (score) 重點**：請針對「本命格局的高低層次」進行評分。如果是一品貴格，分數應高；若是貧賤之造，分數應低。
    **雷達圖 (radar) 重點**：請針對「本命（原局）的潛質」來評分。例如身強財旺則財運分高。
    `;
  }

  const systemInstruction = `
    【身分設定】
    你是一位鑽研八字三十年的命理宗師，師承《滴天髓》、《子平真詮》及近代大師徐樂吾、梁湘潤。
    
    【核心任務】
    請對命主進行八字論命，嚴格遵守下列流程，並將輸出分為「專業古文」與「白話解讀」兩部分。
    
    【重要：曆法換算】
    若命主提供的是「農曆」日期，你必須先運用你的曆法知識，將其轉換為對應年份的「國曆（西元）」日期，並以此推算真太陽時的節氣，以決定正確的月柱與年柱分界（立春）。

    ${specificInstruction}

    【評分標準 (score)】
    請依據以下標準給予 0-100 的綜合評分：
    - 90-100：格局清純、用神有力、行運大吉。
    - 80-89：格局有成、雖有瑕疵但運程可補。
    - 70-79：普通命造、運程平順。
    - 60-69：稍有波折、需後天努力。
    - <60：運途多舛、需保守應對。

    【輸出風格要求】
    1. **classical (徐樂吾風格)**：
       - 使用半文半白，模仿《徐樂吾自評》語氣。
       - 語氣肯定、直斷（例如：「金水傷官喜見官，此命貴氣所在」）。
       - 引用經典（如：「書云...」）。
    2. **modern (現代白話)**：
       - **絕對禁止合併段落**：請務必使用 Markdown 的標題、清單、粗體。
       - **每一點都要換行**：不要把所有吉凶判斷寫在同一段。
       - **重點標註**：關鍵結論務必用粗體。
       - 用溫暖、易懂的現代語言解釋上述專業內容。
       - 著重於「個性特質」、「事業財運建議」、「2026年具體運勢」。
       - 必須解釋為什麼這樣說（例如：「因為你命中缺火，所以...」）。
  `;

  const userPrompt = `
    命主資料：
    分析模式：${mode}
    輸入日期類型：${input.calendarType} ${input.calendarType === CalendarType.LUNAR && input.isLeapMonth ? '(閏月)' : ''}
    輸入日期：${input.birthDate}
    出生時間：${input.birthTime}
    性別：${input.gender}

    請注意：若為農曆，請務必精準換算為對應的太陽曆節氣來排八字。
    請開始排盤並論命。
  `;

  // Use Execute with Retry Logic
  const { result, model } = await executeWithRetry(async (model) => {
    const chat = genAI.chats.create({
      model: model,
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
  }, prioritizedModels);

  result.usedModel = model;
  return result;
};

export const chatWithMaster = async (
  history: ChatMessage[],
  newMessage: string,
  chartContext: AnalysisResponse,
  apiKey?: string
): Promise<string> => {
  const finalApiKey = apiKey || import.meta.env.VITE_API_KEY;
  if (!finalApiKey) {
    throw new Error("請輸入 Google Gemini API Key 或設定環境變數");
  }
  const genAI = new GoogleGenAI({ apiKey: finalApiKey });
  const prioritizedModels = await getPrioritizedModels(finalApiKey);

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

  const { result } = await executeWithRetry(async (model) => {
    const chat = genAI.chats.create({
      model: model,
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
  }, prioritizedModels);

  return result;
};
