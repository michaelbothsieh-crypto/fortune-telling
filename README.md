# 天機算命 - AI 八字大師 (Master BaZi)

![App Screenshot](https://via.placeholder.com/800x400?text=Master+BaZi+App)

這是一個結合傳統命理學與現代 AI 技術的八字論命應用程式。透過 Google Gemini 強大的語言模型，模擬一位擁有 30 年經驗的命理宗師，為使用者提供精準的八字排盤、格局分析、流年運勢預測及古籍考據。

## ✨ 核心特色

*   **宗師級 AI 人設**：
    *   嚴格遵循《子平真詮》、《滴天髓》、《神峰通考》等經典理論。
    *   模仿民國初年命理泰斗「徐樂吾」的自評風格進行論斷。
    *   融合「梁湘潤」大師的古法神煞與流年流月考據。

*   **三大論命模式**：
    1.  **八字正宗 (Basic Analysis)**：全方位分析本命局、強弱、格局、病藥與調候。
    2.  **流年運勢 (Yearly Fortune)**：針對 2025 (乙巳)、2026 (丙午) 等流年進行吉凶預測。
    3.  **古籍考據 (Scholarly Research)**：深度引用古文經典，探討命造之學術價值與特殊格局。

*   **精準排盤系統**：
    *   支援 **國曆/農曆** 雙曆法輸入。
    *   支援 **農曆閏月** 處理。
    *   自動進行 **真太陽時** 節氣換算，確保四柱排列精準無誤。

*   **沈浸式體驗**：
    *   **神秘東方美學**：深色石材背景搭配金石篆刻風格 UI。
    *   **動態思考展示**：可視化大師的「排盤 -> 定格 -> 取用」思考過程。
    *   **雙語解讀**：同時提供「古文專業版」與「白話白話版」分析。
    *   **大師對話**：算完後可透過對話視窗向大師追問細節。

## 🛠 技術架構

本專案為單頁應用程式 (SPA)，無需傳統後端伺服器，直接利用瀏覽器呼叫 AI 模型。

*   **前端框架**：React 19 + TypeScript + Vite
*   **樣式庫**：Tailwind CSS (自定義 Mystic 主題)
*   **AI 整合**：Google Gemini API (`@google/genai` SDK)
*   **Markdown 渲染**：`react-markdown`
*   **圖標庫**：`lucide-react`

## 🚀 快速開始

### 1. 取得 Gemini API Key
請前往 [Google AI Studio](https://aistudio.google.com/) 申請免費的 API Key。

### 2. 環境變數設定
您可以將 API Key 設定在環境變數中，或是在網頁介面上直接輸入。

### 3. 安裝與執行

```bash
# 安裝依賴
npm install

# 啟動開發伺服器
npm run dev
```

### 4. 部署
本專案支援部署至任何靜態網站託管服務（如 GitHub Pages, Vercel, Netlify）。

## 📜 專案結構

```
├── src/
│   ├── components/      # UI 組件 (PillarCard, ChatInterface, LoadingView...)
│   ├── services/        # 業務邏輯與 API 串接 (geminiService.ts)
│   ├── types.ts         # TypeScript 型別定義
│   ├── App.tsx          # 主應用程式
│   └── index.tsx        # 入口點
├── index.html           # HTML 模板
└── vite.config.ts       # Vite 設定
```

## 🤝 貢獻
歡迎提交 Issue 或 Pull Request 來改進論命演算法或擴充古籍資料庫。

---
*注意：本程式僅供娛樂與學術研究參考，命運掌握在自己手中。*
