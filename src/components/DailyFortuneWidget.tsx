import React, { useState } from 'react';
import { Sparkles, X, Gift } from 'lucide-react';
import { DailyFortune } from '../types';
import { getDailyQuote } from '../services/geminiService';

interface DailyFortuneWidgetProps {
    apiKey: string;
}

export const DailyFortuneWidget: React.FC<DailyFortuneWidgetProps> = ({ apiKey }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [fortune, setFortune] = useState<DailyFortune | null>(null);
    const [loading, setLoading] = useState(false);

    const handleDraw = async () => {
        if (!apiKey) {
            alert('請先輸入 API Key 或稍後再試');
            return;
        }
        setLoading(true);
        try {
            const data = await getDailyQuote(apiKey);
            setFortune(data);
        } catch (e) {
            console.error(e);
            alert('大師正在忙碌中，請稍後再試');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end print:hidden">
            {/* Expanded Card */}
            {isOpen && (
                <div className="mb-4 bg-mystic-900 border border-mystic-gold rounded-lg shadow-2xl p-6 w-80 animate-fade-in-up relative overflow-hidden">
                    <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 10px 10px, #d4af37 1px, transparent 0)', backgroundSize: '16px 16px' }}></div>

                    <button
                        onClick={() => setIsOpen(false)}
                        className="absolute top-2 right-2 text-gray-400 hover:text-white"
                    >
                        <X size={18} />
                    </button>

                    <h3 className="text-xl font-bold text-mystic-gold mb-4 flex items-center gap-2">
                        <Sparkles size={20} />
                        今日靈籤
                    </h3>

                    {loading ? (
                        <div className="text-center py-8 text-gray-400 animate-pulse">
                            正在感應天機...
                        </div>
                    ) : fortune ? (
                        <div className="space-y-4">
                            <div className="text-center">
                                <span className="text-4xl font-calligraphy text-white block mb-2">{fortune.luckyNumber}</span>
                                <span className="text-xs text-gray-500 uppercase tracking-widest">Lucky Number</span>
                            </div>

                            <div className="grid grid-cols-2 gap-2 text-center text-sm">
                                <div className="bg-mystic-800 p-2 rounded">
                                    <span className="block text-gray-500 text-xs">幸運色</span>
                                    <span className="text-white font-bold">{fortune.luckyColor}</span>
                                </div>
                                <div className="bg-mystic-800 p-2 rounded">
                                    <span className="block text-gray-500 text-xs">吉位</span>
                                    <span className="text-white font-bold">{fortune.luckyDirection}</span>
                                </div>
                            </div>

                            <div className="border-t border-mystic-700 pt-3 mt-2">
                                <p className="text-mystic-gold font-serif italic text-lg mb-2">
                                    "{fortune.quote}"
                                </p>
                                <p className="text-gray-400 text-sm leading-relaxed">
                                    大師指引：{fortune.advice}
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-6">
                            <p className="text-gray-300 mb-4">今日運勢如何？誠心祈求，靈籤自來。</p>
                            <button
                                onClick={handleDraw}
                                className="bg-mystic-gold text-mystic-900 px-6 py-2 rounded-full font-bold hover:bg-white transition-colors shadow-lg"
                            >
                                開始抽籤
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* Floating Button */}
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    className="bg-mystic-gold hover:bg-white text-mystic-900 p-4 rounded-full shadow-lg transition-all transform hover:scale-110 flex items-center justify-center group"
                >
                    <Gift size={28} className="group-hover:rotate-12 transition-transform" />
                    <span className="absolute right-full mr-3 bg-black/80 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                        今日開運
                    </span>
                </button>
            )}
        </div>
    );
};
