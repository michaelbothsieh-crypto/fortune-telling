

import React from 'react';
import { useFortuneTelling } from './hooks/useFortuneTelling';
import { LoadingView } from './components/LoadingView';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { AnalysisForm } from './components/AnalysisForm';
import { ResultDisplay } from './components/ResultDisplay';
import { Info, ScrollText, Compass, History, Heart } from 'lucide-react';
import { AnalysisMode } from './types';
import MethodologyModal from './components/MethodologyModal';

import { DailyFortuneWidget } from './components/DailyFortuneWidget';

const App: React.FC = () => {
  const {
    input, setInput, secondInput, setSecondInput, apiKey, setApiKey, mode, loading, result, error,
    handleNavClick, handleSubmit, resetResult
  } = useFortuneTelling();

  const loadingRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (loading && loadingRef.current) {
      loadingRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [loading]);

  const [isMethodologyOpen, setIsMethodologyOpen] = React.useState(false);

  const handleReload = () => window.location.reload();

  return (
    <div className="min-h-screen bg-mystic-900 font-serif text-gray-200 selection:bg-mystic-accent selection:text-white pb-20">
      <Header mode={mode} onNavClick={handleNavClick} onReload={handleReload} />

      {/* Daily Fortune Widget */}
      <DailyFortuneWidget apiKey={apiKey} />

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-12">


        {/* Intro Section */}
        {!result && !loading && (
          <section className="text-center space-y-6 py-10 animate-fade-in">
            <h2 className="text-4xl md:text-5xl font-calligraphy text-mystic-gold drop-shadow-lg leading-tight">
              {mode === AnalysisMode.BASIC && '批八字 · 斷吉凶 · 決疑難'}
              {mode === AnalysisMode.YEARLY && '乙巳丙午 · 流年禍福 · 先知'}
              {mode === AnalysisMode.SCHOLARLY && '窮通寶鑑 · 滴天髓 · 考據'}
              {mode === AnalysisMode.COMPATIBILITY && '八字合婚 · 天作之合 · 緣分'}
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto leading-loose text-lg">
              {mode === AnalysisMode.BASIC && (
                <span>
                  本站採正宗子平法，融合《滴天髓》之哲理、《窮通寶鑑》之調候。傳承三十年實務經驗，為您精確排盤，並以徐樂吾大師風格進行深度剖析。
                  <br />
                  <span
                    className="inline-block mt-2 text-mystic-gold hover:text-white cursor-pointer border-b border-mystic-gold hover:border-white transition-colors"
                    onClick={(e) => handleNavClick(e, AnalysisMode.COMPATIBILITY)}
                  >
                    👉 想測算兩人緣分？點此切換至「雙人合盤」模式
                  </span>
                </span>
              )}
              {mode === AnalysisMode.YEARLY && '針對 2025 乙巳年與 2026 丙午年進行深度流年分析。運用梁湘潤流年流月秘法，預判事業、財運、健康之關鍵轉折。'}
              {mode === AnalysisMode.SCHOLARLY && '專為命理研究者設計。大師將引用《三命通會》、《神峰通考》原文，探討格局高低，考證神煞真偽，還原八字學術原貌。'}
              {mode === AnalysisMode.COMPATIBILITY && '深度分析兩人命盤之契合度。從五行互補、日主強弱、刑沖會合等角度，評估感情穩定度與相處模式。'}
            </p>
          </section>
        )}

        {/* Process Card & Form */}
        <div className={`transition-all duration-700 ${result ? 'hidden' : 'block'}`}>
          {/* Process Explanation Card */}
          <div className="bg-mystic-800/50 border border-mystic-700 rounded-xl p-6 mb-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              {mode === AnalysisMode.BASIC && <ScrollText size={100} />}
              {mode === AnalysisMode.YEARLY && <Compass size={100} />}
              {mode === AnalysisMode.SCHOLARLY && <History size={100} />}
              {mode === AnalysisMode.COMPATIBILITY && <Heart size={100} />}
            </div>
            <h3 className="text-mystic-gold font-bold mb-4 flex items-center gap-2">
              <Info size={18} />
              {mode === AnalysisMode.BASIC && '本站論命七大步驟'}
              {mode === AnalysisMode.YEARLY && '流年推算重點'}
              {mode === AnalysisMode.SCHOLARLY && '古法考據流程'}
              {mode === AnalysisMode.COMPATIBILITY && '八字合婚重點'}
            </h3>

            <div className="mb-6 p-4 bg-black/20 rounded-lg text-xs text-gray-400 border border-white/5">
              <span className="text-mystic-gold font-bold block mb-1">💡 為什麼算出來的結果會不同？</span>
              此為三種完全不同的演算法，針對不同需求設計：
              <ul className="list-disc list-inside mt-1 space-y-1">
                <li><span className="text-gray-300">八字論命 (Basic)</span>：看「一生總體潛力」。(如：你是一輛法拉利)</li>
                <li><span className="text-gray-300">流年運勢 (Yearly)</span>：看「這兩年的路況」。(如：但今年遇到爛泥路)</li>
                <li><span className="text-gray-300">古籍考據 (Scholarly)</span>：看「古書如何定義你」。(如：古書歸類為千里馬)</li>
              </ul>
              <div className="mt-2 text-gray-500 italic">因此，可能出現「命很好 (Basic高分) 但流年很差 (Yearly低分)」的情況，屬正常現象。</div>
            </div>

            <ol className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-gray-400 list-decimal list-inside">
              {mode === AnalysisMode.BASIC && (
                <>
                  <li><span className="text-gray-300 font-bold">精確排盤</span>：換算真太陽時與節氣</li>
                  <li><span className="text-gray-300 font-bold">強弱定格</span>：依《子平真詮》定格局</li>
                  <li><span className="text-gray-300 font-bold">扶抑用神</span>：尋求命局五行平衡</li>
                  <li><span className="text-gray-300 font-bold">病藥取用</span>：依《神峰通考》去病</li>
                  <li><span className="text-gray-300 font-bold">調候潤局</span>：依《窮通寶鑑》調氣候</li>
                  <li><span className="text-gray-300 font-bold">神煞空亡</span>：梁湘潤古法考據</li>
                  <li><span className="text-gray-300 font-bold">流年斷事</span>：推算2026丙午年運勢</li>
                </>
              )}
              {mode === AnalysisMode.YEARLY && (
                <>
                  <li><span className="text-gray-300 font-bold">大運審查</span>：判斷目前十年大運吉凶</li>
                  <li><span className="text-gray-300 font-bold">流年干支</span>：分析乙巳、丙午年之進氣</li>
                  <li><span className="text-gray-300 font-bold">刑沖會合</span>：流年與原局之交互作用</li>
                  <li><span className="text-gray-300 font-bold">太歲神煞</span>：查察流年神煞之影響</li>
                  <li><span className="text-gray-300 font-bold">事業財運</span>：針對性預測職場變動</li>
                  <li><span className="text-gray-300 font-bold">健康提醒</span>：五行太過或不及之症</li>
                </>
              )}
              {mode === AnalysisMode.SCHOLARLY && (
                <>
                  <li><span className="text-gray-300 font-bold">格局辨析</span>：引用《真詮》原文定格</li>
                  <li><span className="text-gray-300 font-bold">古籍對照</span>：檢索《三命通會》類似命造</li>
                  <li><span className="text-gray-300 font-bold">詩訣驗證</span>：引用古詩訣印證吉凶</li>
                  <li><span className="text-gray-300 font-bold">特殊格局</span>：檢查是否為專旺或從格</li>
                  <li><span className="text-gray-300 font-bold">納音五行</span>：輔以古法納音論命</li>
                </>
              )}
              {mode === AnalysisMode.COMPATIBILITY && (
                <>
                  <li><span className="text-gray-300 font-bold">日主適配</span>：分析甲乙雙方日元屬性</li>
                  <li><span className="text-gray-300 font-bold">五行喜忌</span>：檢查雙方五行是否互補</li>
                  <li><span className="text-gray-300 font-bold">地支刑沖</span>：察看配偶宮是否有沖合</li>
                  <li><span className="text-gray-300 font-bold">性格互動</span>：預判相處模式與氣氛</li>
                  <li><span className="text-gray-300 font-bold">衝突熱點</span>：提點可能吵架之原因</li>
                  <li><span className="text-gray-300 font-bold">維繫建議</span>：給予經營關係之具體方針</li>
                </>
              )}
            </ol>
          </div>

          <AnalysisForm
            input={input}
            setInput={setInput}
            secondInput={secondInput}
            setSecondInput={setSecondInput}
            handleSubmit={handleSubmit}
            loading={loading}
            mode={mode}
            apiKey={apiKey}
            setApiKey={setApiKey}
          />

          {error && (
            <div className="mt-6 p-4 bg-red-900/30 border border-red-800 text-red-200 rounded text-center animate-pulse">
              {error}
            </div>
          )}
        </div>

        {loading && (
          <div ref={loadingRef}>
            <LoadingView />
          </div>
        )}

        {result && (
          <ResultDisplay
            result={result}
            mode={mode}
            onReset={resetResult}
            apiKey={apiKey}
          />
        )}
      </main>

      <Footer onOpenMethodology={() => setIsMethodologyOpen(true)} />

      <MethodologyModal
        isOpen={isMethodologyOpen}
        onClose={() => setIsMethodologyOpen(false)}
      />
    </div>
  );
};


export default App;