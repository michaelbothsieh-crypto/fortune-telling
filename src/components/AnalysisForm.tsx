import React from 'react';
import { Search, Sparkles, Calendar } from 'lucide-react';
import { UserInput, Gender, CalendarType, AnalysisMode } from '../types';


interface AnalysisFormProps {
    input: UserInput;
    setInput: (input: UserInput) => void;
    secondInput?: UserInput; // For Compatibility Mode
    setSecondInput?: (input: UserInput) => void; // For Compatibility Mode
    handleSubmit: (e: React.FormEvent) => void;
    loading: boolean;
    mode: AnalysisMode;
    apiKey: string;
    setApiKey: (key: string) => void;
}

export const AnalysisForm: React.FC<AnalysisFormProps> = ({
    input, setInput, secondInput, setSecondInput, handleSubmit, loading, mode, apiKey, setApiKey
}) => {
    // Tab state for Dual Mode
    const [activeTab, setActiveTab] = React.useState<1 | 2>(1);

    const getButtonText = () => {
        switch (mode) {
            case AnalysisMode.YEARLY: return '開始推算流年吉凶';
            case AnalysisMode.SCHOLARLY: return '開始進行古法考據';
            case AnalysisMode.COMPATIBILITY: return '開始分析雙人合盤';
            default: return '開始排盤論命';
        }
    };

    // Helper to render a complete input set
    const renderInputSet = (
        currentInput: UserInput,
        setCurrentInput: (i: UserInput) => void,
        label: string
    ) => (
        <div className="space-y-6 animate-fade-in">
            <div className="flex items-center space-x-2 border-b border-mystic-700 pb-2 mb-4">
                <span className="text-mystic-gold font-bold text-lg">{label}</span>
            </div>

            {/* Calendar Type */}
            <div>
                <label className="block text-sm text-gray-400 mb-2 flex items-center gap-2">
                    <Calendar size={14} /> 出生曆法
                </label>
                <div className="flex space-x-4">
                    <button
                        type="button"
                        onClick={() => setCurrentInput({ ...currentInput, calendarType: CalendarType.GREGORIAN, isLeapMonth: false })}
                        className={`flex-1 py-2 rounded border transition-all text-sm ${currentInput.calendarType === CalendarType.GREGORIAN ? 'bg-mystic-700 text-mystic-gold border-mystic-gold font-bold' : 'bg-mystic-900 border-mystic-700 text-gray-400'}`}
                    >
                        國曆 (西元)
                    </button>
                    <button
                        type="button"
                        onClick={() => setCurrentInput({ ...currentInput, calendarType: CalendarType.LUNAR })}
                        className={`flex-1 py-2 rounded border transition-all text-sm ${currentInput.calendarType === CalendarType.LUNAR ? 'bg-mystic-700 text-mystic-gold border-mystic-gold font-bold' : 'bg-mystic-900 border-mystic-700 text-gray-400'}`}
                    >
                        農曆 (舊曆)
                    </button>
                </div>
            </div>

            {/* Date Input */}
            <div className="space-y-2">
                <label className="block text-sm text-gray-400">出生日期</label>
                <input
                    type="date"
                    required
                    value={currentInput.birthDate}
                    onChange={(e) => setCurrentInput({ ...currentInput, birthDate: e.target.value })}
                    className="w-full bg-mystic-900 border border-mystic-700 rounded px-4 py-3 text-white focus:border-mystic-gold focus:outline-none transition-colors"
                />
                {currentInput.calendarType === CalendarType.LUNAR && (
                    <div className="mt-2 flex items-center space-x-2">
                        <input
                            type="checkbox"
                            checked={currentInput.isLeapMonth}
                            onChange={(e) => setCurrentInput({ ...currentInput, isLeapMonth: e.target.checked })}
                            className="w-4 h-4 rounded border-gray-600 text-mystic-gold focus:ring-mystic-accent bg-mystic-900"
                        />
                        <span className="text-sm text-mystic-gold cursor-pointer select-none">我是該年的「閏月」出生</span>
                    </div>
                )}
            </div>

            {/* Time Input */}
            <div className="space-y-2">
                <label className="block text-sm text-gray-400">出生時間</label>
                <div className="flex flex-col space-y-2">
                    <div className="flex items-center space-x-2 mb-1">
                        <input
                            type="checkbox"
                            checked={currentInput.isTimeUnknown || false}
                            onChange={(e) => {
                                const isUnknown = e.target.checked;
                                setCurrentInput({
                                    ...currentInput,
                                    isTimeUnknown: isUnknown,
                                    birthTime: isUnknown ? "12:00" : currentInput.birthTime
                                })
                            }}
                            className="w-4 h-4 rounded border-gray-600 text-mystic-gold focus:ring-mystic-accent bg-mystic-900"
                        />
                        <span className="text-sm text-mystic-gold cursor-pointer select-none">時辰不詳 (Unknown Time)</span>
                    </div>

                    {!currentInput.isTimeUnknown && (
                        <>
                            <input
                                type="time"
                                required={!currentInput.isTimeUnknown}
                                value={currentInput.birthTime}
                                onChange={(e) => setCurrentInput({ ...currentInput, birthTime: e.target.value })}
                                className="w-full bg-mystic-900 border border-mystic-700 rounded px-4 py-3 text-white focus:border-mystic-gold focus:outline-none transition-colors"
                            />
                            <span className="text-xs text-gray-500 mt-1 pl-1">
                                * 系統將自動換算真太陽時與時柱
                            </span>
                        </>
                    )}
                    {currentInput.isTimeUnknown && (
                        <div className="p-3 bg-mystic-900/40 border border-mystic-800 rounded text-xs text-gray-500 italic">
                            * 將採用「三柱論命」法，分析準確率約七成
                        </div>
                    )}
                </div>
            </div>

            {/* Gender */}
            <div className="space-y-2">
                <label className="block text-sm text-gray-400">性別</label>
                <div className="flex space-x-4">
                    <button
                        type="button"
                        onClick={() => setCurrentInput({ ...currentInput, gender: Gender.MALE })}
                        className={`flex-1 py-2 rounded border transition-all text-sm ${currentInput.gender === Gender.MALE ? 'bg-mystic-gold text-mystic-900 font-bold border-mystic-gold' : 'bg-mystic-900 border-mystic-700 text-gray-400'}`}
                    >
                        乾造 (男)
                    </button>
                    <button
                        type="button"
                        onClick={() => setCurrentInput({ ...currentInput, gender: Gender.FEMALE })}
                        className={`flex-1 py-2 rounded border transition-all text-sm ${currentInput.gender === Gender.FEMALE ? 'bg-mystic-gold text-mystic-900 font-bold border-mystic-gold' : 'bg-mystic-900 border-mystic-700 text-gray-400'}`}
                    >
                        坤造 (女)
                    </button>
                </div>
            </div>
        </div>
    );

    return (
        <section className="bg-mystic-800 rounded-xl border border-mystic-700 shadow-2xl p-6 md:p-8">
            <div className="flex items-center space-x-2 mb-6 border-b border-mystic-700 pb-4">
                <Search className="text-mystic-accent" size={20} />
                <h3 className="text-lg font-bold text-gray-200">
                    {mode === AnalysisMode.COMPATIBILITY ? '輸入雙方八字資料' : '輸入命主八字資料'}
                </h3>
            </div>

            {/* API Key Input (Always Global) */}
            <div className="bg-mystic-900/50 p-4 rounded-lg border border-mystic-700 mb-6">
                <label className="block text-sm text-gray-400 mb-2">Google Gemini API Key (選填)</label>
                <input
                    type="password"
                    placeholder="若無環境變數設定，請在此輸入"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    className="w-full bg-mystic-900 border border-mystic-700 rounded px-4 py-2 text-white focus:border-mystic-gold focus:outline-none transition-colors text-sm"
                />
                <p className="text-xs text-gray-500 mt-2">
                    * 註：本系統之「排盤論命」與「大師對話」功能皆需呼叫 AI 運算生成內容，故需消耗 API 配額。若您有自己的 Key 可在此輸入 (不會儲存於伺服器)。
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">

                {mode === AnalysisMode.COMPATIBILITY && secondInput && setSecondInput ? (
                    <div className="border border-mystic-700 rounded-lg p-4 bg-mystic-900/30">
                        {/* Custom Tabs for Dual Mode */}
                        <div className="flex space-x-2 mb-6 border-b border-mystic-700 pb-2">
                            <button
                                type="button"
                                onClick={() => setActiveTab(1)}
                                className={`flex-1 pb-2 text-center transition-colors ${activeTab === 1 ? 'border-b-2 border-mystic-gold text-mystic-gold font-bold' : 'text-gray-500 hover:text-gray-300'}`}
                            >
                                甲方 (Person A)
                            </button>
                            <button
                                type="button"
                                onClick={() => setActiveTab(2)}
                                className={`flex-1 pb-2 text-center transition-colors ${activeTab === 2 ? 'border-b-2 border-mystic-gold text-mystic-gold font-bold' : 'text-gray-500 hover:text-gray-300'}`}
                            >
                                乙方 (Person B)
                            </button>
                        </div>

                        {activeTab === 1 && renderInputSet(input, setInput, '甲方資料')}
                        {activeTab === 2 && renderInputSet(secondInput, setSecondInput, '乙方資料')}
                    </div>
                ) : (
                    // Standard Single Mode
                    renderInputSet(input, setInput, '命主資料')
                )}

                {/* Submit */}
                <div className="pt-4">
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
