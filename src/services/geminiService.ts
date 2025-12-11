
import { GoogleGenAI, Type, Schema } from "@google/genai";
import { UserInput, AnalysisResponse, ChatMessage, AnalysisMode } from "../types";

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
          year: { type: Type.OBJECT, properties: { stem: { type: Type.STRING }, branch: { type: Type.STRING }, element: { type: Type.STRING } } },
          month: { type: Type.OBJECT, properties: { stem: { type: Type.STRING }, branch: { type: Type.STRING }, element: { type: Type.STRING } } },
          day: { type: Type.OBJECT, properties: { stem: { type: Type.STRING }, branch: { type: Type.STRING }, element: { type: Type.STRING } } },
          hour: { type: Type.OBJECT, properties: { stem: { type: Type.STRING }, branch: { type: Type.STRING }, element: { type: Type.STRING } } },
          currentDaYun: { type: Type.STRING, description: "當前大運" },
          me: { type: Type.STRING, description: "日元" },
        },
      },
      chart2: {
        type: Type.OBJECT,
        properties: {
          year: { type: Type.OBJECT, properties: { stem: { type: Type.STRING }, branch: { type: Type.STRING }, element: { type: Type.STRING } } },
          month: { type: Type.OBJECT, properties: { stem: { type: Type.STRING }, branch: { type: Type.STRING }, element: { type: Type.STRING } } },
          day: { type: Type.OBJECT, properties: { stem: { type: Type.STRING }, branch: { type: Type.STRING }, element: { type: Type.STRING } } },
          hour: { type: Type.OBJECT, properties: { stem: { type: Type.STRING }, branch: { type: Type.STRING }, element: { type: Type.STRING } } },
          currentDaYun: { type: Type.STRING },
          me: { type: Type.STRING },
        },
        nullable: true,
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
      luckTips: {
        type: Type.ARRAY,
        description: "3-4個具體的改運錦囊",
        items: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING, description: "錦囊標題 (如：缺火補運法)" },
            content: { type: Type.STRING, description: "具體實行方法 (20字內)" },
          },
          required: ["title", "content"]
        }
      },
      suggestedQuestions: {
        type: Type.ARRAY,
        description: "3個使用者可能會想問的追問 (針對最急迫、最容易改善的運勢)",
        items: { type: Type.STRING }
      }
    },
    required: ["chart", "classical", "modern", "summary", "score", "radar", "luckTips", "suggestedQuestions"],
  };

  const genAI = new GoogleGenAI({ apiKey: finalApiKey });
  const prioritizedModels = await getPrioritizedModels(finalApiKey);

  let specificInstruction = "";
  if (mode === AnalysisMode.YEARLY) {
    specificInstruction = `
    【特殊任務：流年運勢模式】
    請針對 2026 年的流年運勢進行詳細分析。
    **評分 (score) 重點**：請針對「2026 流年運勢的吉凶」進行評分。分數越高代表流年越順遂，分數低則代表需保守防禦。
    **雷達圖 (radar) 重點**：請針對「2026 流年運勢的各面向」來評分。
    **luckTips (開運錦囊)**：針對2026流年煞氣或不足之處，提供三個化解小撇步（例如：配戴紅繩、多往南方走）。
    **suggestedQuestions (建議提問)**：從使用者的角度，提出三個針對「當下最急迫改善」的追問（例如：「我今年要注意什麼血光之災？」、「如何提升今年的偏財運？」）。
    
    1. **classical (古文)**：...
    `;
  } else if (mode === AnalysisMode.SCHOLARLY) {
    specificInstruction = `
    【特殊任務：學術研究模式】
    請以嚴謹的學術態度，深入探討命主的八字格局，並引用經典理論進行論證。
    **評分 (score) 重點**：請針對「本命格局的高低層次」進行評分。
    **雷達圖 (radar) 重點**：請針對「本命（原局）的潛質」來評分。
    **luckTips (開運錦囊)**：提供古法補運之建議（例如：祭拜某神祇、閱讀某經典）。
    **suggestedQuestions (建議提問)**：提出三個專業的學術追問（例如：「此造是用神無力還是格局被破？」）。
    `;
  } else {
    specificInstruction = `
    ...
    **luckTips (開運錦囊)**：針對八字五行缺憾提供補運建議（例如：缺水者多穿黑衣、佩戴黑曜石）。
    **suggestedQuestions (建議提問)**：提出三個命主最想知道、且「最容易執行」的改運追問（例如：「我適合養貓還是養狗來旺運？」、「辦公桌要放什麼能防小人？」）。
    `;
  }

  // ... (rest of function until execution)

  // ... (AnalyzeBaZi implementation logic same as before, ensuring schema matches)

  // ...

  const systemInstruction = `
    【角色設定】
    你是一位精通《三命通會》、《淵海子平》、《滴天髓》的八字命理大師。
    
    【任務】
    請分析以下八字，並回傳符合Schema的JSON格式。
    
    ${specificInstruction}

    【評分標準 (Scoring Rubric)】
    基準分為 60 分。
    1. **格局層次 (Pattern)**:
       - 成格且用神有力 (+10-15分)
       - 成格但有瑕疵 (+5-10分)
       - 普通格局 (+0-5分)
    2. **日主強弱與用神 (Day Master & Useful God)**:
       - 日主中和，用神得力 (+10分)
       - 日主偏強/偏弱，但有藥可醫 (+5分)
       - 過旺或過弱，且無救應 (-5分)
    3. **刑沖會合 (Clashes & Combinations)**:
       - 帶天乙貴人、天德月德 (+5分)
       - 帶桃花、文昌 (+2-3分)
       - 地支沖剋嚴重且無解救 (-5~-10分)
       
    總分最高 95 分 (極貴之命)，最低 60 分。請務必客觀。
  `;

  // Start Analysis
  const { result: analysisResult, model } = await executeWithRetry(async (model) => {
    const chat = genAI.chats.create({
      model,
      config: {
        responseMimeType: "application/json",
        responseSchema: analysisSchema,
      },
    });

    const response = await chat.sendMessage({
      message: systemInstruction + "\n\n用戶輸入:\n" + JSON.stringify(input)
    });

    if (!response.text) {
      throw new Error("Empty response from AI");
    }
    return JSON.parse(response.text) as AnalysisResponse;
  }, prioritizedModels);

  analysisResult.usedModel = model;
  return analysisResult;
};


export const analyzeCompatibility = async (
  input1: UserInput,
  input2: UserInput,
  apiKey?: string
): Promise<AnalysisResponse> => {
  const finalApiKey = apiKey || import.meta.env.VITE_API_KEY;
  if (!finalApiKey) {
    throw new Error("請輸入 Google Gemini API Key 或設定環境變數");
  }

  const genAI = new GoogleGenAI({ apiKey: finalApiKey });
  const prioritizedModels = await getPrioritizedModels(finalApiKey);

  const systemInstruction = `
    【身分設定】
    你是一位精通《三命通會》、《合婚寶鑑》的八字合婚專家。
    
    【核心任務】
    請對兩位命主（甲方、乙方）進行「八字合盤（Compatibility Analysis）」，並依照 schema 回傳 JSON。

    【分析邏輯】
    1. **排盤**：分別排出甲、乙雙方的八字。若時辰不詳 (isTimeUnknown=true)，請僅用三柱，並在其部分註明準確度折損。
    2. **日主適配**：分析雙方日元屬性（如：強金配弱木）、五行喜忌是否互補。這點非常重要，請詳細說明。
       - 例如：若甲方喜火，乙方八字火旺，則乙方對甲方有「幫夫/幫妻」之運。
    3. **刑沖會合**：檢查年柱（根基）、日支（配偶宮）是否有六合、三合（大吉）或六沖、刑害（需注意）。
    4. **評分機制**：
       - score (0-100)：綜合契合度。
       - radar (六維)：
         - career: 事業互助指數
         - wealth: 財運互旺指數
         - love: 情感契合指數
         - health: 健康互補指數
         - social: 溝通默契指數
         - family: 價值觀/家庭指數

    【輸出風格要求】
    - **summary**: 一句話形容這段關係（例如：「天作之合，五行互補極佳」或「需多磨合，個性南轅北轍，動火氣」）。
    - **classical (古文合婚)**：引用古籍口訣（如：「金土夫妻好姻緣...」），並解釋其在兩人命盤的應驗。
    - **modern (現代白話，必須Markdown)**：
      **必須使用 Markdown 結構化輸出，禁止擠在同一段。**
      1. **### ❤️ 性格互動與氣氛**：兩個人在一起會是什麼氣氛？是互補還是競爭？
      2. **### ⚡️ 衝突熱點 (地雷區)**：最容易吵架的原因是什麼？（例如：一個急驚風，一個慢郎中）。
      3. **### 🔮 五行互補建議**：針對五行強弱給予建議（例如：多用綠色，或多去南方旅遊）。
      4. **### 💡 經營關係金句**：一句給這對伴侶的專屬建議。
  `;

  // Re-define schema inside this scope if specific overrides needed, 
  // but we are re-using the dynamically defined one from analyzeBaZi?
  // Actually analyzeBaZi defined it locally. We need to copy/define it here or move it out.
  // For simplicity, let's redefine the schema partially or call a shared helper?
  // No, let's just re-define the essential schema here to avoid refactoring the whole file yet.

  const scoreDesc = "針對兩人契合度、五行互補性的綜合評分 (0-100)。";

  const compatibilitySchema: Schema = {
    type: Type.OBJECT,
    properties: {
      chart: { type: Type.OBJECT, properties: { year: { type: Type.OBJECT, properties: { stem: { type: Type.STRING }, branch: { type: Type.STRING }, element: { type: Type.STRING } } }, month: { type: Type.OBJECT, properties: { stem: { type: Type.STRING }, branch: { type: Type.STRING }, element: { type: Type.STRING } } }, day: { type: Type.OBJECT, properties: { stem: { type: Type.STRING }, branch: { type: Type.STRING }, element: { type: Type.STRING } } }, hour: { type: Type.OBJECT, properties: { stem: { type: Type.STRING }, branch: { type: Type.STRING }, element: { type: Type.STRING } } }, currentDaYun: { type: Type.STRING }, me: { type: Type.STRING } } },
      chart2: { type: Type.OBJECT, properties: { year: { type: Type.OBJECT, properties: { stem: { type: Type.STRING }, branch: { type: Type.STRING }, element: { type: Type.STRING } } }, month: { type: Type.OBJECT, properties: { stem: { type: Type.STRING }, branch: { type: Type.STRING }, element: { type: Type.STRING } } }, day: { type: Type.OBJECT, properties: { stem: { type: Type.STRING }, branch: { type: Type.STRING }, element: { type: Type.STRING } } }, hour: { type: Type.OBJECT, properties: { stem: { type: Type.STRING }, branch: { type: Type.STRING }, element: { type: Type.STRING } } }, currentDaYun: { type: Type.STRING }, me: { type: Type.STRING } } },
      classical: { type: Type.STRING, description: "合婚古文分析" },
      modern: { type: Type.STRING, description: "現代相處建議" },
      summary: { type: Type.STRING, description: "關係一句話總結" },
      score: { type: Type.NUMBER, description: scoreDesc },
      radar: { type: Type.OBJECT, properties: { career: { type: Type.NUMBER }, wealth: { type: Type.NUMBER }, love: { type: Type.NUMBER }, health: { type: Type.NUMBER }, social: { type: Type.NUMBER }, family: { type: Type.NUMBER } }, required: ["career", "wealth", "love", "health", "social", "family"] },
    },
    required: ["chart", "chart2", "classical", "modern", "summary", "score", "radar"],
  };

  const userPrompt = `
    【甲方資料 (Person A)】
    日期類型：${input1.calendarType} ${input1.isLeapMonth ? '(閏月)' : ''}
    出生日期：${input1.birthDate}
    出生時間：${input1.isTimeUnknown ? '時辰不詳' : input1.birthTime}
    性別：${input1.gender}

    【乙方資料 (Person B)】
    日期類型：${input2.calendarType} ${input2.isLeapMonth ? '(閏月)' : ''}
    出生日期：${input2.birthDate}
    出生時間：${input2.isTimeUnknown ? '時辰不詳' : input2.birthTime}
    性別：${input2.gender}

    請進行八字合婚分析。
  `;

  const { result } = await executeWithRetry(async (model) => {
    const chat = genAI.chats.create({
      model: model,
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        responseSchema: compatibilitySchema,
        temperature: 0.6, // Balanced for consistenty and creativity
      },
    });

    const response = await chat.sendMessage({ message: userPrompt });

    if (response.text) {
      return JSON.parse(response.text) as AnalysisResponse;
    }
    throw new Error("大師正在沉思中，請稍後再試...");
  }, prioritizedModels);

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


export const getDailyQuote = async (apiKey: string): Promise<import("../types").DailyFortune> => {
  const finalApiKey = apiKey || import.meta.env.VITE_API_KEY;
  if (!finalApiKey) throw new Error("API Key required");

  // Get date string (e.g. "2023-10-27")
  const today = new Date().toISOString().split('T')[0];

  const systemPrompt = `
    你是一位每日開運大師。請給我今天的運勢靈籤。
    日期：${today}
    
    請回傳 JSON 格式：
    {
       "luckyColor": "幸運色 (e.g. 珊瑚紅)",
       "luckyNumber": "幸運數字 (0-99)",
       "luckyDirection": "吉方 (e.g. 西北方)",
       "quote": "一句充滿禪意的開運詩句 (10-15字)",
       "advice": "一句具體的行動建議 (20字內)"
    }
  `;

  const genAI = new GoogleGenAI({ apiKey: finalApiKey });
  const prioritizedModels = await getPrioritizedModels(finalApiKey);

  const { result } = await executeWithRetry(async (model) => {
    const chat = genAI.chats.create({
      model,
      config: { responseMimeType: "application/json" }
    });
    const response = await chat.sendMessage({ message: systemPrompt });
    if (response.text) return JSON.parse(response.text) as import("../types").DailyFortune;
    throw new Error("Empty response");
  }, prioritizedModels);

  return result;
};
