
import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { analyzeBaZi } from './services/geminiService';
import { UserInput, Gender, AnalysisResponse, CalendarType } from './types';
import { PillarCard } from './components/PillarCard';
import { LoadingView } from './components/LoadingView';
import { ChatInterface } from './components/ChatInterface';
import ReactMarkdown from 'react-markdown';
import { Search, Sparkles, BookOpen, ScrollText, Key, Info, MessageCircle, Feather, Calendar } from 'lucide-react';

const App: React.FC = () => {
  const [apiKey, setApiKey] = useState(process.env.API_KEY || '');
  const [input, setInput] = useState<UserInput>({
    birthDate: '1989-02-10',
    birthTime: '13:30', 
    gender: Gender.MALE,
    calendarType: CalendarType.GREGORIAN,
    isLeapMonth: false,
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'modern' | 'classical'>('modern');

  const handleNavClick = (e: React.MouseEvent, feature: string) => {
    e.preventDefault();
    alert(`【${feature}】功能即將上線，敬請期待大師更新！`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiKey) {
      setError("請輸入 Gemini API Key 以啟動大師引擎");
      return;
    }
    
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const data = await analyzeBaZi(apiKey, input);
      setResult(data);
    } catch (err: any) {
      setError(err.message || "論命過程中發生錯誤，請稍後再試。");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-mystic-900 font-serif text-gray-200 selection:bg-mystic-accent selection:text-white pb-20">
      {/* Header */}
      <header className="border-b border-mystic-700 bg-mystic-900/95 sticky top-0 z-50 backdrop-blur-md shadow-md">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => window.location.reload()}>
            <div className="bg-mystic-gold text-mystic-900 p-2 rounded-full border-2 border-mystic-700">
              <span className="font-calligraphy text-2xl font-bold">天機</span>
            </div>
            <div className="flex flex-col">
              <h1 className="text-xl font-bold tracking-widest text-mystic-gold">八字正宗</h1>
              <span className="text-xs text-gray-500 uppercase tracking-widest">Master BaZi</span>
            </div>
          </div>
          <nav className="hidden md:flex space-x-6 text-sm text-gray-400">
            <a href="#" className="text-mystic-gold font-bold border-b border-mystic-gold pb-1">八字論命</a>
            <a href="#" onClick={(e) => handleNavClick(e, '流年運勢')} className="hover:text-mystic-gold transition-colors pb-1 border-b border-transparent hover:border-mystic-gold">流年運勢</a>
            <a href="#" onClick={(e) => handleNavClick(e, '古籍考據')} className="hover:text-mystic-gold transition-colors pb-1 border-b border-transparent hover:border-mystic-gold">古籍考據</a>
          </nav>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-12">
        
        {/* Intro Section */}
        {!result && !loading && (
          <section className="text-center space-y-6 py-10 animate-fade-in">
            <h2 className="text-4xl md:text-5xl font-calligraphy text-mystic-gold drop-shadow-lg leading-tight">
              批八字 · 斷吉凶 · 決疑難
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto leading-loose text-lg">
              本站採正宗子平法，融合《滴天髓》之哲理、《窮通寶鑑》之調候、《神峰通考》之病藥。
              <br/>
              傳承三十年實務經驗，為您精確排盤，並以徐樂吾大師風格進行深度剖析。
            </p>
          </section>
        )}

        {/* API Key Input */}
        {!process.env.API_KEY && (
           <div className="bg-mystic-800 p-4 rounded-lg border border-mystic-700 max-w-lg mx-auto mb-8 shadow-inner">
             <label className="block text-xs uppercase tracking-wider text-gray-500 mb-2 flex items-center gap-2">
               <Key size={14} /> Gemini API Key
             </label>
             <input
               type="password"
               value={apiKey}
               onChange={(e) => setApiKey(e.target.value)}
               placeholder="請在此輸入您的 Gemini API Key"
               className="w-full bg-mystic-900 border border-mystic-700 rounded px-3 py-2 text-white focus:border-mystic-gold focus:outline-none transition-colors"
             />
           </div>
        )}

        {/* Process Card & Form */}
        <div className={`transition-all duration-700 ${result ? 'hidden' : 'block'}`}>
          {/* Process Explanation Card */}
          <div className="bg-mystic-800/50 border border-mystic-700 rounded-xl p-6 mb-8 relative overflow-hidden">
             <div className="absolute top-0 right-0 p-4 opacity-10">
               <ScrollText size={100} />
             </div>
             <h3 className="text-mystic-gold font-bold mb-4 flex items-center gap-2">
               <Info size={18} /> 本站論命七大步驟
             </h3>
             <ol className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-gray-400 list-decimal list-inside">
               <li><span className="text-gray-300 font-bold">精確排盤</span>：換算真太陽時與節氣</li>
               <li><span className="text-gray-300 font-bold">強弱定格</span>：依《子平真詮》定格局</li>
               <li><span className="text-gray-300 font-bold">扶抑用神</span>：尋求命局五行平衡</li>
               <li><span className="text-gray-300 font-bold">病藥取用</span>：依《神峰通考》去病</li>
               <li><span className="text-gray-300 font-bold">調候潤局</span>：依《窮通寶鑑》調氣候</li>
               <li><span className="text-gray-300 font-bold">神煞空亡</span>：梁湘潤古法考據</li>
               <li><span className="text-gray-300 font-bold">流年斷事</span>：推算2026丙午年運勢</li>
             </ol>
          </div>

          {/* Input Form */}
          <section className="bg-mystic-800 rounded-xl border border-mystic-700 shadow-2xl p-6 md:p-8">
            <div className="flex items-center space-x-2 mb-6 border-b border-mystic-700 pb-4">
              <Search className="text-mystic-accent" size={20} />
              <h3 className="text-lg font-bold text-gray-200">輸入命主八字資料</h3>
            </div>
            
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Calendar Type Toggle */}
              <div className="md:col-span-2">
                <label className="block text-sm text-gray-400 mb-2 flex items-center gap-2">
                  <Calendar size={14} /> 出生曆法 (請選擇您輸入的日期類型)
                </label>
                <div className="flex space-x-4">
                  <button
                    type="button"
                    onClick={() => setInput({...input, calendarType: CalendarType.GREGORIAN, isLeapMonth: false})}
                    className={`flex-1 py-3 rounded border transition-all ${input.calendarType === CalendarType.GREGORIAN ? 'bg-mystic-700 text-mystic-gold border-mystic-gold font-bold shadow-lg' : 'bg-mystic-900 border-mystic-700 text-gray-400 hover:border-gray-500'}`}
                  >
                    國曆 (西元)
                  </button>
                  <button
                    type="button"
                    onClick={() => setInput({...input, calendarType: CalendarType.LUNAR})}
                    className={`flex-1 py-3 rounded border transition-all ${input.calendarType === CalendarType.LUNAR ? 'bg-mystic-700 text-mystic-gold border-mystic-gold font-bold shadow-lg' : 'bg-mystic-900 border-mystic-700 text-gray-400 hover:border-gray-500'}`}
                  >
                    農曆 (舊曆)
                  </button>
                </div>
              </div>

              {/* Date Input */}
              <div className="space-y-2">
                <label className="block text-sm text-gray-400">出生日期 ({input.calendarType})</label>
                <input 
                  type="date" 
                  required
                  value={input.birthDate}
                  onChange={(e) => setInput({...input, birthDate: e.target.value})}
                  className="w-full bg-mystic-900 border border-mystic-700 rounded px-4 py-3 text-white focus:border-mystic-gold focus:outline-none transition-colors hover:border-gray-600"
                />
                {input.calendarType === CalendarType.LUNAR && (
                  <div className="mt-2 flex items-center space-x-2">
                    <input 
                      type="checkbox" 
                      id="leapMonth"
                      checked={input.isLeapMonth}
                      onChange={(e) => setInput({...input, isLeapMonth: e.target.checked})}
                      className="w-4 h-4 rounded border-gray-600 text-mystic-gold focus:ring-mystic-accent bg-mystic-900"
                    />
                    <label htmlFor="leapMonth" className="text-sm text-mystic-gold cursor-pointer select-none">
                      我是該年的「閏月」出生
                    </label>
                  </div>
                )}
              </div>

              {/* Time Input */}
              <div className="space-y-2">
                <label className="block text-sm text-gray-400">出生時間 (需精準到時辰)</label>
                <div className="flex flex-col">
                  <input 
                    type="time" 
                    required
                    value={input.birthTime}
                    onChange={(e) => setInput({...input, birthTime: e.target.value})}
                    className="w-full bg-mystic-900 border border-mystic-700 rounded px-4 py-3 text-white focus:border-mystic-gold focus:outline-none transition-colors hover:border-gray-600"
                  />
                  <span className="text-xs text-gray-500 mt-1 pl-1">
                    * 系統將自動換算真太陽時與時柱
                  </span>
                </div>
              </div>

              {/* Gender */}
              <div className="space-y-2 md:col-span-2">
                <label className="block text-sm text-gray-400">性別</label>
                <div className="flex space-x-4">
                  <button
                    type="button"
                    onClick={() => setInput({...input, gender: Gender.MALE})}
                    className={`flex-1 py-3 rounded border transition-all ${input.gender === Gender.MALE ? 'bg-mystic-gold text-mystic-900 border-mystic-gold font-bold shadow-[0_0_10px_rgba(212,175,55,0.3)]' : 'bg-mystic-900 border-mystic-700 text-gray-400 hover:border-gray-500'}`}
                  >
                    乾造 (男)
                  </button>
                  <button
                    type="button"
                    onClick={() => setInput({...input, gender: Gender.FEMALE})}
                    className={`flex-1 py-3 rounded border transition-all ${input.gender === Gender.FEMALE ? 'bg-mystic-gold text-mystic-900 border-mystic-gold font-bold shadow-[0_0_10px_rgba(212,175,55,0.3)]' : 'bg-mystic-900 border-mystic-700 text-gray-400 hover:border-gray-500'}`}
                  >
                    坤造 (女)
                  </button>
                </div>
              </div>

              {/* Submit */}
              <div className="md:col-span-2 pt-4">
                <button 
                  type="submit" 
                  disabled={loading || !apiKey}
                  className="w-full bg-gradient-to-r from-mystic-accent to-amber-700 hover:from-amber-600 hover:to-amber-800 text-white font-bold py-4 rounded-lg shadow-lg transform transition-all hover:scale-[1.01] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 border border-amber-900/50"
                >
                  <Sparkles size={18} />
                  <span>{loading ? '大師正在推算天機...' : '開始排盤論命'}</span>
                </button>
              </div>
            </form>

            {error && (
              <div className="mt-6 p-4 bg-red-900/30 border border-red-800 text-red-200 rounded text-center animate-pulse">
                {error}
              </div>
            )}
          </section>
        </div>

        {/* Loading View */}
        {loading && <LoadingView />}

        {/* Result Section */}
        {result && (
          <div className="space-y-8 animate-fade-in-up">
            
            {/* Chart Section */}
            <section className="bg-mystic-800/50 rounded-xl border border-mystic-700 p-6 md:p-8 relative overflow-hidden">
               <div className="absolute inset-0 opacity-5 pointer-events-none" style={{backgroundImage: 'radial-gradient(circle at 2px 2px, #d4af37 1px, transparent 0)', backgroundSize: '24px 24px'}}></div>
               
               <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 relative z-10 gap-4">
                 <div className="flex items-center space-x-2">
                    <ScrollText className="text-mystic-gold" size={24} />
                    <h3 className="text-xl font-bold text-mystic-gold">八字原局</h3>
                 </div>
                 <div className="bg-mystic-900/80 border border-mystic-700 px-4 py-2 rounded-lg text-sm text-gray-300 italic border-l-4 border-l-mystic-accent">
                   大師總評：{result.summary}
                 </div>
              </div>
              
              <div className="flex justify-center gap-3 md:gap-8 mb-6 overflow-x-auto pb-2 relative z-10 px-2">
                <PillarCard label="年柱" stem={result.chart.year.stem} branch={result.chart.year.branch} />
                <PillarCard label="月柱" stem={result.chart.month.stem} branch={result.chart.month.branch} />
                <PillarCard label="日柱" stem={result.chart.day.stem} branch={result.chart.day.branch} />
                <PillarCard label="時柱" stem={result.chart.hour.stem} branch={result.chart.hour.branch} />
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-center text-sm text-gray-400 mt-6 border-t border-mystic-700 pt-4 relative z-10">
                <div>
                   <span className="block text-gray-500 mb-1 tracking-widest uppercase text-xs">日元 (Day Master)</span>
                   <span className="text-2xl text-white font-calligraphy">{result.chart.me}</span>
                </div>
                <div>
                   <span className="block text-gray-500 mb-1 tracking-widest uppercase text-xs">當前大運 (Current Luck)</span>
                   <span className="text-2xl text-white font-calligraphy">{result.chart.currentDaYun}</span>
                </div>
              </div>
            </section>

            {/* Analysis Tabs */}
            <div className="flex space-x-1 bg-mystic-800 p-1 rounded-lg border border-mystic-700">
               <button 
                 onClick={() => setActiveTab('modern')}
                 className={`flex-1 py-2 px-4 rounded-md font-bold text-sm transition-all flex items-center justify-center gap-2 ${activeTab === 'modern' ? 'bg-mystic-gold text-mystic-900 shadow-sm' : 'text-gray-400 hover:text-gray-200'}`}
               >
                 <MessageCircle size={16} />
                 白話解讀 (容易懂)
               </button>
               <button 
                 onClick={() => setActiveTab('classical')}
                 className={`flex-1 py-2 px-4 rounded-md font-bold text-sm transition-all flex items-center justify-center gap-2 ${activeTab === 'classical' ? 'bg-mystic-gold text-mystic-900 shadow-sm' : 'text-gray-400 hover:text-gray-200'}`}
               >
                 <Feather size={16} />
                 古籍專業 (徐樂吾風格)
               </button>
            </div>

            {/* Analysis Content */}
            <section className="bg-[#fdfbf7] text-gray-800 rounded-xl border-4 border-double border-mystic-700 p-6 md:p-8 shadow-2xl relative overflow-hidden min-h-[500px]">
               {/* Decorative stamp */}
               <div className="absolute top-4 right-4 opacity-10 pointer-events-none">
                 <div className="border-4 border-red-800 rounded-sm w-32 h-32 flex items-center justify-center transform rotate-12">
                   <span className="font-calligraphy text-4xl text-red-800">命理<br/>正宗</span>
                 </div>
               </div>

               <div className="flex items-center space-x-2 mb-6 border-b-2 border-gray-300 pb-4">
                <BookOpen className="text-mystic-900" size={24} />
                <h3 className="text-2xl font-calligraphy font-bold text-mystic-900">
                  {activeTab === 'modern' ? '大師白話詳解' : '徐樂吾自評風格'}
                </h3>
              </div>

              <div className="prose prose-stone prose-lg max-w-none font-serif leading-loose animate-fade-in">
                <ReactMarkdown
                  components={{
                    h1: ({node, ...props}) => <h1 className="text-2xl font-bold text-red-900 mt-10 mb-6 font-calligraphy border-b border-red-800/20 pb-2 text-center" {...props} />,
                    h2: ({node, ...props}) => <h2 className="text-xl font-bold text-mystic-900 mt-8 mb-4 font-calligraphy border-l-4 border-mystic-accent pl-3" {...props} />,
                    h3: ({node, ...props}) => <h3 className="text-lg font-bold text-gray-800 mt-6 mb-2" {...props} />,
                    strong: ({node, ...props}) => <strong className="text-red-900 font-bold mx-1" {...props} />,
                    ul: ({node, ...props}) => <ul className="list-disc pl-5 space-y-2 mb-4 text-gray-700 bg-gray-50/50 p-4 rounded-lg" {...props} />,
                    li: ({node, ...props}) => <li className="pl-1" {...props} />,
                    p: ({node, ...props}) => <p className="mb-4 text-justify text-gray-700 tracking-wide" {...props} />,
                    blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-mystic-gold pl-4 italic text-gray-600 my-6 py-2 bg-amber-50 rounded-r" {...props} />,
                  }}
                >
                  {activeTab === 'modern' ? result.modern : result.classical}
                </ReactMarkdown>
              </div>

              {activeTab === 'classical' && (
                <div className="mt-12 text-right">
                  <p className="font-calligraphy text-xl text-gray-600">天機算命館 謹批</p>
                  <div className="inline-block mt-2 border-2 border-red-800 text-red-800 px-3 py-1 font-calligraphy text-sm rotate-[-2deg] opacity-80 rounded-sm">
                    鐵口直斷
                  </div>
                </div>
              )}
            </section>

            {/* Chat Interface */}
            <ChatInterface apiKey={apiKey} chartContext={result} />
            
            <div className="text-center pt-8">
              <button 
                onClick={() => setResult(null)} 
                className="text-gray-500 hover:text-white underline underline-offset-4"
              >
                重新排盤
              </button>
            </div>
          </div>
        )}
      </main>

      <footer className="text-center py-8 text-gray-600 text-sm border-t border-mystic-800 mt-12 bg-mystic-900">
        <p>© 2025 天機算命 - 宗法古籍，正宗傳承</p>
      </footer>
    </div>
  );
};

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
