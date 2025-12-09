import React from 'react';
import { Search, Sparkles, Calendar } from 'lucide-react';
import { UserInput, Gender, CalendarType, AnalysisMode } from '../types';

interface AnalysisFormProps {
    input: UserInput;
    setInput: (input: UserInput) => void;
    handleSubmit: (e: React.FormEvent) => void;
    loading: boolean;
    mode: AnalysisMode;
}

export const AnalysisForm: React.FC<AnalysisFormProps> = ({ input, setInput, handleSubmit, loading, mode }) => {
    const getButtonText = () => {
        switch (mode) {
            case AnalysisMode.YEARLY: return '開始推算流年吉凶';
            case AnalysisMode.SCHOLARLY: return '開始進行古法考據';
            default: return '開始排盤論命';
        }
    };

    return (
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
                            onClick={() => setInput({ ...input, calendarType: CalendarType.GREGORIAN, isLeapMonth: false })}
                            className={`flex-1 py-3 rounded border transition-all ${input.calendarType === CalendarType.GREGORIAN ? 'bg-mystic-700 text-mystic-gold border-mystic-gold font-bold shadow-lg' : 'bg-mystic-900 border-mystic-700 text-gray-400 hover:border-gray-500'}`}
                        >
                            國曆 (西元)
                        </button>
                        <button
                            type="button"
                            onClick={() => setInput({ ...input, calendarType: CalendarType.LUNAR })}
                            className={`flex-1 py-3 rounded border transition-all ${input.calendarType === CalendarType.LUNAR ? 'bg-mystic-700 text-mystic-gold border-mystic-gold font-bold shadow-lg' : 'bg-mystic-900 border-mystic-700 text-gray-400 hover:border-gray-500'}`}
                        >
                            農曆 (舊曆)
                        </button>
                    </div>
                </div>

                {/* Date Input */}
                <div className="space-y-2">
                    <label className="block text-sm text-gray-400">出生日期 ({input.calendarType === CalendarType.GREGORIAN ? '西元' : '農曆'})</label>
                    <input
                        type="date"
                        required
                        value={input.birthDate}
                        onChange={(e) => setInput({ ...input, birthDate: e.target.value })}
                        className="w-full bg-mystic-900 border border-mystic-700 rounded px-4 py-3 text-white focus:border-mystic-gold focus:outline-none transition-colors hover:border-gray-600"
                    />
                    {input.calendarType === CalendarType.LUNAR && (
                        <div className="mt-2 flex items-center space-x-2">
                            <input
                                type="checkbox"
                                id="leapMonth"
                                checked={input.isLeapMonth}
                                onChange={(e) => setInput({ ...input, isLeapMonth: e.target.checked })}
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
                            onChange={(e) => setInput({ ...input, birthTime: e.target.value })}
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
                            onClick={() => setInput({ ...input, gender: Gender.MALE })}
                            className={`flex-1 py-3 rounded border transition-all ${input.gender === Gender.MALE ? 'bg-mystic-gold text-mystic-900 border-mystic-gold font-bold shadow-[0_0_10px_rgba(212,175,55,0.3)]' : 'bg-mystic-900 border-mystic-700 text-gray-400 hover:border-gray-500'}`}
                        >
                            乾造 (男)
                        </button>
                        <button
                            type="button"
                            onClick={() => setInput({ ...input, gender: Gender.FEMALE })}
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
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-mystic-accent to-amber-700 hover:from-amber-600 hover:to-amber-800 text-white font-bold py-4 rounded-lg shadow-lg transform transition-all hover:scale-[1.01] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 border border-amber-900/50"
                    >
                        <Sparkles size={18} />
                        <span>{loading ? '大師正在推算天機...' : getButtonText()}</span>
                    </button>
                </div>
            </form>
        </section>
    );
};
