
import React from 'react';
import { X, BookOpen, Cpu, Sparkles, Map, User } from 'lucide-react';

interface MethodologyModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const MethodologyModal: React.FC<MethodologyModalProps> = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
            <div className="relative w-full max-w-2xl bg-mystic-900 border border-mystic-gold/30 rounded-lg shadow-2xl max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="sticky top-0 z-10 flex items-center justify-between p-4 border-b bg-mystic-900/95 border-mystic-gold/20 backdrop-blur">
                    <h2 className="text-xl font-serif text-mystic-gold flex items-center gap-2">
                        <BookOpen className="w-5 h-5" />
                        關於本命理系統
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-1 text-gray-400 hover:text-white transition-colors rounded-full hover:bg-white/10"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <div className="p-6 space-y-8 text-gray-300">

                    {/* Technology Section */}
                    <section className="space-y-3">
                        <h3 className="flex items-center gap-2 text-lg font-medium text-white border-l-2 border-purple-500 pl-3">
                            <Cpu className="w-5 h-5 text-purple-400" />
                            核心技術 (Technology)
                        </h3>
                        <p className="text-sm leading-relaxed">
                            本系統並非單純的亂數生成，而是採用最先進的
                            <span className="font-bold text-purple-300 mx-1">Google Gemini 2.0 / 1.5 Pro</span>
                            大型語言模型，結合
                            <span className="font-bold text-purple-300 mx-1">RAG (檢索增強生成)</span>
                            技術。每一個論斷都經過嚴謹的邏輯推理，模擬真實命理師的思考路徑。
                        </p>
                    </section>

                    {/* Sources Section */}
                    <section className="space-y-3">
                        <h3 className="flex items-center gap-2 text-lg font-medium text-white border-l-2 border-amber-500 pl-3">
                            <User className="w-5 h-5 text-amber-400" />
                            學術傳承 (Lineage)
                        </h3>
                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="bg-white/5 p-3 rounded border border-white/10">
                                <div className="text-amber-300 font-medium mb-1">宗師法脈</div>
                                <ul className="text-sm space-y-1 list-disc list-inside text-gray-400">
                                    <li>徐樂吾 (近代子平權威)</li>
                                    <li>梁湘潤 (台灣命理泰斗)</li>
                                    <li>韋千里 (民國命學大師)</li>
                                </ul>
                            </div>
                            <div className="bg-white/5 p-3 rounded border border-white/10">
                                <div className="text-amber-300 font-medium mb-1">引用古籍</div>
                                <ul className="text-sm space-y-1 list-disc list-inside text-gray-400">
                                    <li>《滴天髓》 (八字之精微)</li>
                                    <li>《子平真詮》 (格局之規範)</li>
                                    <li>《三命通會》 (體系之集大成)</li>
                                </ul>
                            </div>
                        </div>
                    </section>

                    {/* Holistic Analysis / Roadmap */}
                    <section className="space-y-3">
                        <h3 className="flex items-center gap-2 text-lg font-medium text-white border-l-2 border-teal-500 pl-3">
                            <Map className="w-5 h-5 text-teal-400" />
                            全方位命理展望 (Integrated Analysis)
                        </h3>
                        <p className="text-sm text-gray-400 mb-2">
                            八字主要論斷人生格局與流年大運，若需更全面的生命解析，傳統上會搭配：
                        </p>
                        <div className="grid grid-cols-2 gap-3">
                            {[
                                { name: '紫微斗數', desc: '星曜佈局，細論十二宮細節', icon: '🌌' },
                                { name: '面相學', desc: '觀氣察色，即時運勢判斷', icon: '👀' },
                                { name: '易經卜卦', desc: '針對單一事件之吉凶決策', icon: '☯️' },
                                { name: '地理風水', desc: '環境磁場對運勢之影響', icon: '🧭' },
                            ].map((item) => (
                                <div key={item.name} className="flex items-start gap-2 p-2 bg-gradient-to-br from-teal-900/20 to-transparent rounded border border-teal-500/20">
                                    <span className="text-xl">{item.icon}</span>
                                    <div>
                                        <div className="text-teal-200 text-sm font-medium">{item.name}</div>
                                        <div className="text-xs text-gray-500">{item.desc}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    <div className="text-center pt-4 border-t border-white/5">
                        <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-mystic-gold/10 text-mystic-gold text-xs">
                            <Sparkles className="w-3 h-3" />
                            <span>AI 算命僅供參考，命運掌握在自己手中</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MethodologyModal;
