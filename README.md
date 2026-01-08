# 天機算命 - AI 八字大師

[![Live Demo](https://img.shields.io/badge/Live-Demo-brightgreen.svg)](https://michaelbothsieh-crypto.github.io/fortune-telling/)
[![License](https://img.shields.io/github/license/michaelbothsieh-crypto/fortune-telling)](LICENSE)

**結合傳統子平八字學理與 Google Gemini AI 的現代化算命應用。**

這是一個全繁體中文介面的命理分析平台，旨在探索傳統命理與人工智慧的結合可能。我們承諾「無伺服器儲存」，確保您的命盤隱私僅在瀏覽器與 Google API 間傳輸。

🔗 **立即體驗**：[https://michaelbothsieh-crypto.github.io/fortune-telling/](https://michaelbothsieh-crypto.github.io/fortune-telling/)

---

## 🔮 特色功能

### 1. 正宗八字排盤
- **精確換算**：支援 1900-2100 年真太陽時與節氣計算。
- **三柱推算**：在不知時辰的情況下也能進行精準分析。
- **視覺化圖表**：**[NEW]** 新增「五行能量視覺化」圖表，強弱一目瞭然。

### 2. AI 大師論命
由 Google Gemini 2.0 Flash 驅動，提供多維度的命理解析：
- **八字格局**：深入分析格局、用神與個性特質。
- **流年運勢**：針對 2025 (乙巳)、2026 (丙午) 等流年進行吉凶預測，解析太歲互動。
- **古籍考據**：引用《三命通會》、《滴天髓》等古文進行深度學術探討。
- **雙人合盤**：分析兩人契合度與相處建議的「合婚/合盤」模式。
- **風格切換**：可選擇「白話解讀」適合大眾，或「古籍專業」模仿徐樂吾大師風格。

### 3. 貼心實用工具
- **每日靈籤**：**[NEW]** 每日一抽，獲取今日運勢指引與開運顏色/數字。
- **神煞列表**：**[NEW]** 直接顯示每柱神煞（如天乙貴人、咸池），不再只有文字描述。
- **互動追問**：**[NEW]** AI 自動生成 3 個最迫切的改運建議問題，一鍵深入了解。

### 4. 現代化體驗
- **PWA 支援**：可安裝至手機桌面，享受原生 App 般的體驗。
- **隱私優先**：完全前端運算，資料不落地。

---

## 🛠️ 技術架構

本專案採用現代化前端技術棧構建：

- **Frontend Core**: React 18, TypeScript, Vite
- **UI Framework**: Tailwind CSS
- **AI Engine**: Google Gemini 2.0 Flash (via `@google/genai`)
- **Deployment**: GitHub Pages

---

## ⚙️ 環境變數設定

本專案支援透過環境變數設定預設的 Gemini API Key，讓使用者可以直接使用而無需自行申請。

### 本地開發

1. 複製 `.env.example` 為 `.env`：
   ```bash
   cp .env.example .env
   ```

2. 編輯 `.env` 並填入您的 API Key：
   ```
   GEMINI_API_KEY=your_gemini_api_key_here
   ```

3. 啟動開發伺服器：
   ```bash
   npm run dev
   ```

### 部署設定

在各平台的環境變數設定中添加：

| 變數名稱 | 說明 |
|---------|------|
| `GEMINI_API_KEY` | Google Gemini API Key（[取得連結](https://aistudio.google.com/app/apikey)）|

> **注意**：若未設定環境變數，使用者需自行輸入 API Key 才能使用 AI 功能。

## 👨‍💻 關於作者

本專案由 AI 協作開發，致力於將傳統智慧以現代科技重新呈現。如果您對本專案有興趣或建議，歡迎透過 GitHub Issues 提出。
