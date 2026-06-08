
import { GoogleGenAI, Type, Schema } from "@google/genai";
import { UserInput, AnalysisResponse, ChatMessage, AnalysisMode, BaZiChart, Pillar, RadarData, FiveElementsData } from "../types";
import { calculateBaZi } from "./baziCalculator";

const EMPTY_PILLAR: Pillar = {
  stem: "未知",
  branch: "未知",
  shenSha: [],
};

const EMPTY_RADAR: RadarData = {
  career: 0,
  wealth: 0,
  love: 0,
  health: 0,
  social: 0,
  family: 0,
};

const EMPTY_FIVE_ELEMENTS: FiveElementsData = {
  gold: 0,
  wood: 0,
  water: 0,
  fire: 0,
  earth: 0,
};

const normalizePillar = (value: unknown): Pillar => {
  if (!value || typeof value !== "object") return { ...EMPTY_PILLAR };

  const pillar = value as Partial<Pillar>;
  return {
    stem: typeof pillar.stem === "string" && pillar.stem ? pillar.stem : EMPTY_PILLAR.stem,
    branch: typeof pillar.branch === "string" && pillar.branch ? pillar.branch : EMPTY_PILLAR.branch,
    element: typeof pillar.element === "string" ? pillar.element : undefined,
    shenSha: Array.isArray(pillar.shenSha) ? pillar.shenSha.filter((item): item is string => typeof item === "string") : [],
  };
};

const normalizeChart = (value: unknown): BaZiChart => {
  const chart = value && typeof value === "object" ? value as Partial<BaZiChart> : {};

  return {
    year: normalizePillar(chart.year),
    month: normalizePillar(chart.month),
    day: normalizePillar(chart.day),
    hour: normalizePillar(chart.hour),
    currentDaYun: typeof chart.currentDaYun === "string" ? chart.currentDaYun : "未知",
    me: typeof chart.me === "string" ? chart.me : "未知",
  };
};

const getFiniteNumber = (value: unknown, fallback = 0): number => {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
};

const normalizeRadar = (value: unknown): RadarData => {
  const radar = value && typeof value === "object" ? value as Partial<RadarData> : {};

  return {
    career: getFiniteNumber(radar.career),
    wealth: getFiniteNumber(radar.wealth),
    love: getFiniteNumber(radar.love),
    health: getFiniteNumber(radar.health),
    social: getFiniteNumber(radar.social),
    family: getFiniteNumber(radar.family),
  };
};

const normalizeFiveElements = (value: unknown): FiveElementsData => {
  const fiveElements = value && typeof value === "object" ? value as Partial<FiveElementsData> : {};

  return {
    gold: getFiniteNumber(fiveElements.gold),
    wood: getFiniteNumber(fiveElements.wood),
    water: getFiniteNumber(fiveElements.water),
    fire: getFiniteNumber(fiveElements.fire),
    earth: getFiniteNumber(fiveElements.earth),
  };
};

const normalizeAnalysisResponse = (value: unknown): AnalysisResponse => {
  const response = value && typeof value === "object" ? value as Partial<AnalysisResponse> : {};
  const chart2 = response.chart2 && typeof response.chart2 === "object" ? normalizeChart(response.chart2) : undefined;

  return {
    chart: normalizeChart(response.chart),
    chart2,
    classical: typeof response.classical === "string" ? response.classical : "",
    modern: typeof response.modern === "string" ? response.modern : "",
    summary: typeof response.summary === "string" ? response.summary : "分析資料不完整，請重新送出。",
    score: typeof response.score === "number" && Number.isFinite(response.score) ? response.score : 0,
    radar: normalizeRadar(response.radar || EMPTY_RADAR),
    fiveElements: normalizeFiveElements(response.fiveElements || EMPTY_FIVE_ELEMENTS),
    luckTips: Array.isArray(response.luckTips) ? response.luckTips : undefined,
    suggestedQuestions: Array.isArray(response.suggestedQuestions) ? response.suggestedQuestions.filter((item): item is string => typeof item === "string") : undefined,
    usedModel: response.usedModel,
  };
};

/// 取得優先採用的模型列表
const getPrioritizedModels = async (apiKey: string): Promise<string[]> => {
  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    if (!response.ok) return ["gemini-2.0-flash", "gemini-1.5-flash"];

    const data = await response.json();
    const models = (data.models || []).map((m: any) => m.name.replace('models/', ''));

    const candidates = models.filter((name: string) =>
      name.includes('gemini') &&
      !name.includes('vision') &&
      !name.includes('embedding') &&
      !name.includes('tts') &&
      !name.includes('audio')
    );

    candidates.sort((a: string, b: string) => {
      const getVersion = (n: string) => {
        const match = n.match(/(\d+\.\d+)/);
        return match ? parseFloat(match[1]) : 0;
      };
      const vA = getVersion(a);
      const vB = getVersion(b);
      if (vA !== vB) return vB - vA;

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

/// 執行附帶重試機制的 AI 請求
const executeWithRetry = async <T>(
  action: (model: string) => Promise<T>,
  modelModels: string[]
): Promise<{ result: T; model: string }> => {
  let lastError: any;

  if (modelModels.length === 0) modelModels.push("gemini-2.0-flash");

  for (const model of modelModels) {
    try {
      console.log(`[Gemini Service] Attempting execution with model: ${model}`);
      const result = await action(model);
      return { result, model };
    } catch (error: any) {
      console.warn(`[Gemini Service] Model ${model} failed.`, error);
      lastError = error;

      const isCriticalError = error.message?.includes("API key not valid") || error.message?.includes("PERMISSION_DENIED");

      if (isCriticalError) {
        throw error;
      }

      continue;
    }
  }
  throw lastError;
};

/// 進行單人八字命盤深度分析
export const analyzeBaZi = async (
  input: UserInput,
  mode: AnalysisMode,
  apiKey?: string
): Promise<AnalysisResponse> => {
  const finalApiKey = apiKey || import.meta.env.GEMINI_API_KEY;
  if (!finalApiKey) {
    throw new Error("請輸入 Google Gemini API Key 或設定環境變數");
  }

  const exactChart = calculateBaZi(input);

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
          year: { type: Type.OBJECT, properties: { stem: { type: Type.STRING }, branch: { type: Type.STRING }, element: { type: Type.STRING }, shenSha: { type: Type.ARRAY, items: { type: Type.STRING } } } },
          month: { type: Type.OBJECT, properties: { stem: { type: Type.STRING }, branch: { type: Type.STRING }, element: { type: Type.STRING }, shenSha: { type: Type.ARRAY, items: { type: Type.STRING } } } },
          day: { type: Type.OBJECT, properties: { stem: { type: Type.STRING }, branch: { type: Type.STRING }, element: { type: Type.STRING }, shenSha: { type: Type.ARRAY, items: { type: Type.STRING } } } },
          hour: { type: Type.OBJECT, properties: { stem: { type: Type.STRING }, branch: { type: Type.STRING }, element: { type: Type.STRING }, shenSha: { type: Type.ARRAY, items: { type: Type.STRING } } } },
          currentDaYun: { type: Type.STRING, description: "當前大運" },
          me: { type: Type.STRING, description: "日元" },
        },
        required: ["year", "month", "day", "hour", "currentDaYun", "me"],
      },
      chart2: {
        type: Type.OBJECT,
        properties: {
          year: { type: Type.OBJECT, properties: { stem: { type: Type.STRING }, branch: { type: Type.STRING }, element: { type: Type.STRING }, shenSha: { type: Type.ARRAY, items: { type: Type.STRING } } } },
          month: { type: Type.OBJECT, properties: { stem: { type: Type.STRING }, branch: { type: Type.STRING }, element: { type: Type.STRING }, shenSha: { type: Type.ARRAY, items: { type: Type.STRING } } } },
          day: { type: Type.OBJECT, properties: { stem: { type: Type.STRING }, branch: { type: Type.STRING }, element: { type: Type.STRING }, shenSha: { type: Type.ARRAY, items: { type: Type.STRING } } } },
          hour: { type: Type.OBJECT, properties: { stem: { type: Type.STRING }, branch: { type: Type.STRING }, element: { type: Type.STRING }, shenSha: { type: Type.ARRAY, items: { type: Type.STRING } } } },
          currentDaYun: { type: Type.STRING },
          me: { type: Type.STRING },
        },
        required: ["year", "month", "day", "hour", "currentDaYun", "me"],
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
      fiveElements: {
        type: Type.OBJECT,
        description: "五行能量百分比總和需為100 (gold, wood, water, fire, earth)",
        properties: {
          gold: { type: Type.NUMBER },
          wood: { type: Type.NUMBER },
          water: { type: Type.NUMBER },
          fire: { type: Type.NUMBER },
          earth: { type: Type.NUMBER },
        },
        required: ["gold", "wood", "water", "fire", "earth"],
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
  let scoringRubric = "";

  if (mode === AnalysisMode.YEARLY) {
    specificInstruction = `
    【特殊任務：流年運勢模式】
    請針對 2026 年的流年運勢進行詳細分析。
    **雷達圖 (radar) 重點**：請針對「2026 流年運勢的各面向」來評分。
    **luckTips (開運錦囊)**：針對2026流年煞氣或不足之處，提供三個化解小撇步（例如：配戴紅繩、多往南方走）。
    **suggestedQuestions (建議提問)**：從使用者的角度，提出三個針對「當下最急迫改善」的追問（例如：「我今年要注意什麼血光之災？」、「如何提升今年的偏財運？」）。
    `;
    scoringRubric = `
    【評分標準 (Scoring Rubric) - 流年專用】
    基準分為 60 分。
    1. **太歲互動 (Tai Sui Interaction)**:
       - 與流年（丙午）五行相生相助 (+10-15分)
       - 無明顯刑沖且有貴人解救 (+5-10分)
       - 原局與流年天剋地沖，或犯太歲嚴重且無解 (-5~-10分)
    2. **五行流通 (Elemental Flow)**:
       - 流年補足原局缺憾（如：寒命見火） (+10分)
       - 流年加劇原局失衡（如：燥土見火） (-5分)
    3. **神煞吉凶 (Shen Sha)**:
       - 帶天乙貴人、祿神入命 (+5分)
       - 帶羊刃、七殺且無制 (-5分)
    `;
  } else if (mode === AnalysisMode.SCHOLARLY) {
    specificInstruction = `
    【特殊任務：學術研究模式】
    請以嚴謹的學術態度，深入探討命主的八字格局，並引用經典理論進行論證。
    **雷達圖 (radar) 重點**：請針對「本命（原局）的潛質」來評分。
    **luckTips (開運錦囊)**：提供古法補運之建議（例如：祭拜某神祇、閱讀某經典）。
    **suggestedQuestions (建議提問)**：提出三個專業的學術追問（例如：「此造是用神無力還是格局被破？」）。
    `;
    scoringRubric = `
    【評分標準 (Scoring Rubric) - 學術專用】
    基準分為 60 分。
    1. **格局清純度 (Pattern Purity)**:
       - 格局清純，無破格，或有病有藥 (+15分)
       - 格局偏枯，濁而不清 (+0-5分)
    2. **用神有力程度 (Useful God Strength)**:
       - 用神得令得地，且透干 (+10分)
       - 用神藏支或受制 (-5分)
    3. **經典論斷 (Classical Criteria)**:
       - 符合「三奇」、「魁罡」等特殊貴格 (+5-10分)
       - 刑沖太過，六親無緣 (-5~-10分)
    `;
  } else {
    specificInstruction = `
    【標準任務：八字正宗模式】
    請依據標準七步驟進行全面論斷：強弱、格局、用神、病藥、調候、神煞、大運流年。
    **雷達圖 (radar) 重點**：請針對「本命（原局）的潛質」來評分。例如身強財旺則財運分高。
    **luckTips (開運錦囊)**：針對八字五行缺憾提供補運建議（例如：缺水者多穿黑衣、佩戴黑曜石）。
    **suggestedQuestions (建議提問)**：提出三個命主最想知道、且「最容易執行」的改運追問（例如：「我適合養貓還是養狗來旺運？」、「辦公桌要放什麼能防小人？」）。
    `;
    scoringRubric = `
    【評分標準 (Scoring Rubric) - 標準正宗】
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
    `;
  }

  const systemInstruction = `
    【角色設定】
    你是一位精通《三命通會》、《淵海子平》、《滴天髓》、《窮通寶鑑》的子平八字命理大師。
    
    【任務】
    請分析以下八字，並回傳符合Schema的JSON格式。
    
    ${specificInstruction}

    ${scoringRubric}
       
    【強判定規則：子平正宗定格】
    請依據以下步驟確立格局與分析用神：
    1. **月令定格**：以月支藏干透出天干者為先（如寅月透丙火為食神格）。若無透出，以月支本氣定格。亦需判斷是否符合從革、從財、從殺、專旺等外格。
    2. **日主強弱與用神**：依據得令、得地、得助與否判定日干強弱。身強者宜剋洩折中，身弱者宜扶抑印比。
    3. **病藥與調候**：寒木忌水多（需火暖局）、燥土喜水潤（需水滋養），結合《窮通寶鑑》之調候喜忌取用神。

    【重要：精確排盤數據】
    這是經由精密曆法計算出的命主八字，請務必採用此排盤作為你回答中 "chart" 欄位的值，切勿自行更改天干地支（你只需為各柱補上合理的 shenSha 神煞列表，如天乙貴人、驛馬、文昌、羊刃等）：
    ${JSON.stringify(exactChart, null, 2)}

    總分最高 95 分 (極貴之命)，最低 60 分。請務必客觀。
  `;

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
    return normalizeAnalysisResponse(JSON.parse(response.text));
  }, prioritizedModels);

  analysisResult.usedModel = model;
  return analysisResult;
};


/// 進行甲乙雙方八字合婚分析
export const analyzeCompatibility = async (
  input1: UserInput,
  input2: UserInput,
  apiKey?: string
): Promise<AnalysisResponse> => {
  const finalApiKey = apiKey || import.meta.env.GEMINI_API_KEY;
  if (!finalApiKey) {
    throw new Error("請輸入 Google Gemini API Key 或設定環境變數");
  }

  const exactChart1 = calculateBaZi(input1);
  const exactChart2 = calculateBaZi(input2);

  const genAI = new GoogleGenAI({ apiKey: finalApiKey });
  const prioritizedModels = await getPrioritizedModels(finalApiKey);

  const systemInstruction = `
    【身分設定】
    你是一位精通《三命通會》、《合婚寶鑑》、《滴天髓》的八字合婚專家。
    
    【核心任務】
    請對兩位命主（甲方、乙方）進行「八字合盤（Compatibility Analysis）」，並依照 schema 回傳 JSON。

    【重要：精確排盤數據】
    這是經由精密曆法計算出的雙方八字，請務必採用此數據作為你回答中 "chart" (甲方) 與 "chart2" (乙方) 欄位的值，切勿自行更改天干地支（你只需為各柱補上合理的 shenSha 神煞列表）：
    - 甲方八字: ${JSON.stringify(exactChart1, null, 2)}
    - 乙方八字: ${JSON.stringify(exactChart2, null, 2)}

    【分析與評分邏輯】
    請從以下三大關鍵維度進行嚴格評分與合盤分析，總分為 100 分（基準分為 60 分，依據表現加減分，最高 95 分，最低 60 分）：

    1. **五行互補性 (Elemental Balance) - 佔 40%**:
       - 互補喜用 (+15-20分)：分析甲方喜用神是否為乙方所旺五行，或乙方喜用為甲方所旺，形成互補。
       - 調候互補 (+10分)：一燥一濕、一寒一暖是否能互相調節。
       - 同忌同旺 (-10分)：若雙方皆忌某五行（如皆忌火）且雙方八字中該五行皆極旺，則扣分。

    2. **日柱契合度 (Day Pillar Chemistry) - 佔 30%**:
       - 夫妻宮相合 (+10-15分)：日支呈六合、三合，代表內心契合、相處甜蜜。
       - 日干化合 (+5-10分)：日干呈現五合（如甲己合、乙庚合），代表宿世因緣與默契。
       - 夫妻宮相沖 (-10分)：日支相沖（如子午沖、寅申沖）或相刑，代表婚姻宮受損，日常容易摩擦。

    3. **宮位刑沖合化 (Palace Interactions & Clashes) - 佔 30%**:
       - 根基契合 (+5-10分)：年支相合（如三合、六合），代表長輩支持、家庭根基穩固。
       - 價值觀契合 (+5-10分)：月支相合，代表處事態度與生活節奏容易同步。
       - 宮位多處刑沖 (-5~-10分)：若多處干剋支沖，則代表雙方家庭或外部環境阻力大。

    【輸出風格要求】
    - **summary**: 一句話形容這段關係（例如：「天作之合，五行互補極佳」或「需多磨合，個性南轅北轍，動火氣」）。
    - **classical (古文合婚)**：引用古籍口訣（如：「金土夫妻好姻緣...」），並解釋其在兩人命盤的應驗。
    - **modern (現代白話，必須Markdown)**：
      **必須使用 Markdown 結構化輸出，禁止擠在同一段。**
      - **### ❤️ 性格互動與氣氛**：兩個人在一起會是什麼氣氛？是互補還是競爭？
      - **### ⚡️ 衝突熱點 (地雷區)**：最容易吵架的原因是什麼？（例如：一個急驚風，一個慢郎中）。
      - **### 🔮 五行互補建議**：針對五行強弱給予建議（例如：多用綠色，或多去南方旅遊）。
      - **### 💡 經營關係金句**：一句給這對伴侶的專屬建議。
  `;

  const scoreDesc = "針對兩人契合度、五行互補性的綜合評分 (0-100)。";

  const compatibilitySchema: Schema = {
    type: Type.OBJECT,
    properties: {
      chart: { type: Type.OBJECT, properties: { year: { type: Type.OBJECT, properties: { stem: { type: Type.STRING }, branch: { type: Type.STRING }, element: { type: Type.STRING }, shenSha: { type: Type.ARRAY, items: { type: Type.STRING } } }, required: ["stem", "branch", "shenSha"] }, month: { type: Type.OBJECT, properties: { stem: { type: Type.STRING }, branch: { type: Type.STRING }, element: { type: Type.STRING }, shenSha: { type: Type.ARRAY, items: { type: Type.STRING } } }, required: ["stem", "branch", "shenSha"] }, day: { type: Type.OBJECT, properties: { stem: { type: Type.STRING }, branch: { type: Type.STRING }, element: { type: Type.STRING }, shenSha: { type: Type.ARRAY, items: { type: Type.STRING } } }, required: ["stem", "branch", "shenSha"] }, hour: { type: Type.OBJECT, properties: { stem: { type: Type.STRING }, branch: { type: Type.STRING }, element: { type: Type.STRING }, shenSha: { type: Type.ARRAY, items: { type: Type.STRING } } }, required: ["stem", "branch", "shenSha"] }, currentDaYun: { type: Type.STRING }, me: { type: Type.STRING } }, required: ["year", "month", "day", "hour", "currentDaYun", "me"] },
      chart2: { type: Type.OBJECT, properties: { year: { type: Type.OBJECT, properties: { stem: { type: Type.STRING }, branch: { type: Type.STRING }, element: { type: Type.STRING }, shenSha: { type: Type.ARRAY, items: { type: Type.STRING } } }, required: ["stem", "branch", "shenSha"] }, month: { type: Type.OBJECT, properties: { stem: { type: Type.STRING }, branch: { type: Type.STRING }, element: { type: Type.STRING }, shenSha: { type: Type.ARRAY, items: { type: Type.STRING } } }, required: ["stem", "branch", "shenSha"] }, day: { type: Type.OBJECT, properties: { stem: { type: Type.STRING }, branch: { type: Type.STRING }, element: { type: Type.STRING }, shenSha: { type: Type.ARRAY, items: { type: Type.STRING } } }, required: ["stem", "branch", "shenSha"] }, hour: { type: Type.OBJECT, properties: { stem: { type: Type.STRING }, branch: { type: Type.STRING }, element: { type: Type.STRING }, shenSha: { type: Type.ARRAY, items: { type: Type.STRING } } }, required: ["stem", "branch", "shenSha"] }, currentDaYun: { type: Type.STRING }, me: { type: Type.STRING } }, required: ["year", "month", "day", "hour", "currentDaYun", "me"] },
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
        temperature: 0.6,
      },
    });

    const response = await chat.sendMessage({ message: userPrompt });

    if (response.text) {
      return normalizeAnalysisResponse(JSON.parse(response.text));
    }
    throw new Error("大師正在沉思中，請稍後再試...");
  }, prioritizedModels);

  return result;
};

/// 與命理大師進行互動對話
export const chatWithMaster = async (
  history: ChatMessage[],
  newMessage: string,
  chartContext: AnalysisResponse,
  apiKey?: string
): Promise<string> => {
  const finalApiKey = apiKey || import.meta.env.GEMINI_API_KEY;
  if (!finalApiKey) {
    throw new Error("請輸入 Google Gemini API Key 或設定環境變數");
  }
  const genAI = new GoogleGenAI({ apiKey: finalApiKey });
  const prioritizedModels = await getPrioritizedModels(finalApiKey);

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


/// 取得今日開運靈籤與建議
export const getDailyQuote = async (apiKey: string): Promise<import("../types").DailyFortune> => {
  const finalApiKey = apiKey || import.meta.env.GEMINI_API_KEY;
  if (!finalApiKey) throw new Error("API Key required");

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
