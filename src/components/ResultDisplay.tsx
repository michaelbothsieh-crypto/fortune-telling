import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { BookOpen, ScrollText, MessageCircle, Feather } from 'lucide-react';
import { AnalysisResponse, AnalysisMode } from '../types';
import { PillarCard } from './PillarCard';
import { ChatInterface } from './ChatInterface';
import { CircularScore } from './CircularScore';
import { RadarChart } from './RadarChart';
import { Download } from 'lucide-react';

interface ResultDisplayProps {
    result: AnalysisResponse;
    mode: AnalysisMode;
    onReset: () => void;
    apiKey: string;
}

import html2pdf from 'html2pdf.js';

// ... (ResultDisplayProps definition)

export const ResultDisplay: React.FC<ResultDisplayProps> = ({ result, mode, onReset, apiKey }) => {
    const [activeTab, setActiveTab] = useState<'modern' | 'classical'>('modern');
    const contentRef = React.useRef<HTMLDivElement>(null);

    const handleExport = () => {
        if (!contentRef.current) return;

        const opt = {
            margin: 10,
            filename: 'master-bazi-report.pdf',
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2, useCORS: true },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };

        // Temporarily show hidden elements for print (if any) or handle specific styling
        // For now, simple export
        const button = document.getElementById('export-btn');
        if (button) button.style.display = 'none';

        html2pdf().set(opt).from(contentRef.current).save().then(() => {
            if (button) button.style.display = 'flex';
        });
    };

    return (
        <div ref={contentRef} className="space-y-8 animate-fade-in-up p-4 bg-mystic-900">
            {/* Added wrapper bg-mystic-900 to ensure background color in PDF if needed, though html2canvas captures element style */}

            {/* Chart Section */}
            <section className="bg-mystic-800/50 rounded-xl border border-mystic-700 p-6 md:p-8 relative overflow-hidden">
                <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, #d4af37 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>

                <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 relative z-10 gap-4">
                    <div className="flex items-center space-x-2">
                        <ScrollText className="text-mystic-gold" size={24} />
                        <h3 className="text-xl font-bold text-mystic-gold whitespace-nowrap">八字原局</h3>
                    </div>
                    <div className="bg-mystic-900/80 border border-mystic-700 px-4 py-2 rounded-lg text-sm text-gray-300 italic border-l-4 border-l-mystic-accent flex items-center gap-4">
                        <div className="flex-1">
                            大師總評：{result.summary}
                        </div>
                        {result.score !== undefined && (
                            <div className="shrink-0 flex items-center gap-4">
                                <div className="hidden md:block">
                                    {result.radar && <RadarChart data={result.radar} />}
                                </div>
                                <CircularScore score={result.score} />
                            </div>
                        )}
                    </div>
                </div>

                {/* Mobile Radar (visible only on small screens) */}
                {result.radar && (
                    <div className="md:hidden flex justify-center mb-6 relative z-10">
                        <div className="bg-mystic-900/50 p-4 rounded-xl border border-mystic-700/50">
                            <RadarChart data={result.radar} />
                        </div>
                    </div>
                )}

                <div className="absolute top-4 right-4 z-20">
                    <button
                        id="export-btn"
                        onClick={handleExport}
                        className="flex items-center gap-2 px-3 py-1 bg-mystic-gold/20 hover:bg-mystic-gold/40 text-mystic-gold rounded-full text-sm transition-colors print:hidden"
                        title="下載 PDF 報告"
                    >
                        <Download size={16} />
                        下載報告
                    </button>
                </div>

                <div className="flex flex-col gap-8 mb-6 relative z-10 px-2">
                    {/* Person A */}
                    <div className={result.chart2 ? "border-b border-mystic-700/50 pb-6" : ""}>
                        {result.chart2 && <h4 className="text-mystic-gold font-bold mb-3 text-sm ml-2">甲方 (Person A)</h4>}
                        <div className="flex justify-center gap-3 md:gap-8 overflow-x-auto pb-2">
                            <PillarCard label="年柱" stem={result.chart.year.stem} branch={result.chart.year.branch} />
                            <PillarCard label="月柱" stem={result.chart.month.stem} branch={result.chart.month.branch} />
                            <PillarCard label="日柱" stem={result.chart.day.stem} branch={result.chart.day.branch} />
                            <PillarCard label="時柱" stem={result.chart.hour.stem} branch={result.chart.hour.branch} />
                        </div>
                    </div>

                    {/* Person B (only if chart2 exists) */}
                    {result.chart2 && (
                        <div>
                            <h4 className="text-mystic-gold font-bold mb-3 text-sm ml-2">乙方 (Person B)</h4>
                            <div className="flex justify-center gap-3 md:gap-8 overflow-x-auto pb-2">
                                <PillarCard label="年柱" stem={result.chart2.year.stem} branch={result.chart2.year.branch} />
                                <PillarCard label="月柱" stem={result.chart2.month.stem} branch={result.chart2.month.branch} />
                                <PillarCard label="日柱" stem={result.chart2.day.stem} branch={result.chart2.day.branch} />
                                <PillarCard label="時柱" stem={result.chart2.hour.stem} branch={result.chart2.hour.branch} />
                            </div>
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-2 gap-4 text-center text-sm text-gray-400 mt-6 border-t border-mystic-700 pt-4 relative z-10">
                    <div>
                        <span className="block text-gray-500 mb-1 tracking-widest uppercase text-xs">日元 (Day Master)</span>
                        <div className="flex justify-center gap-4">
                            <span className="text-2xl text-white font-calligraphy">{result.chart.me}</span>
                            {result.chart2 && <span className="text-2xl text-white font-calligraphy opacity-70"> / {result.chart2.me}</span>}
                        </div>
                    </div>
                    <div>
                        <span className="block text-gray-500 mb-1 tracking-widest uppercase text-xs">當前大運 (Current Luck)</span>
                        <div className="flex justify-center gap-4">
                            <span className="text-2xl text-white font-calligraphy">{result.chart.currentDaYun}</span>
                            {result.chart2 && <span className="text-2xl text-white font-calligraphy opacity-70"> / {result.chart2.currentDaYun}</span>}
                        </div>
                    </div>
                </div>
        </div>

                {/* Luck Tips Section */ }
    {
        result.luckTips && result.luckTips.length > 0 && (
            <div className="mt-6 border-t border-mystic-700 pt-4 relative z-10">
                <h4 className="flex items-center gap-2 text-mystic-gold font-bold mb-3">
                    <span className="text-xl">💡</span>
                    開運錦囊 (Luck Boost)
                </h4>
                <div className="flex flex-wrap gap-3">
                    {result.luckTips.map((tip, idx) => (
                        <div key={idx} className="group relative">
                            <button className="bg-mystic-700/50 hover:bg-mystic-gold hover:text-mystic-900 border border-mystic-600 text-gray-200 px-4 py-2 rounded-full text-sm transition-all flex items-center gap-2 shadow-sm">
                                <span>{tip.title}</span>
                            </button>
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 bg-black/90 text-white text-xs p-3 rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                                {tip.content}
                                <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-black/90"></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        )
    }
            </section >

    {/* Analysis Tabs */ }
    < div className = "flex space-x-1 bg-mystic-800 p-1 rounded-lg border border-mystic-700" >
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
            </div >

    {/* Analysis Content */ }
    < section className = "bg-[#fdfbf7] text-gray-800 rounded-xl border-4 border-double border-mystic-700 p-6 md:p-8 shadow-2xl relative overflow-hidden min-h-[500px]" >
        {/* Decorative stamp */ }
        < div className = "absolute top-4 right-4 opacity-10 pointer-events-none" >
            <div className="border-4 border-red-800 rounded-sm w-32 h-32 flex items-center justify-center transform rotate-12">
                <span className="font-calligraphy text-4xl text-red-800">
                    {mode === AnalysisMode.BASIC && '命理\n正宗'}
                    {mode === AnalysisMode.YEARLY && '流年\n吉凶'}
                    {mode === AnalysisMode.SCHOLARLY && '古法\n考據'}
                </span>
            </div>
                </div >

                <div className="flex items-center space-x-2 mb-6 border-b-2 border-gray-300 pb-4">
                    <BookOpen className="text-mystic-900" size={24} />
                    <h3 className="text-2xl font-calligraphy font-bold text-mystic-900">
                        {activeTab === 'modern' ? '大師白話詳解' : '徐樂吾自評風格'}
                    </h3>
                </div>

                <div className="prose prose-stone prose-lg max-w-none font-serif leading-loose animate-fade-in">
                    <ReactMarkdown
                        components={{
                            h1: ({ node, ...props }) => <h1 className="text-2xl font-bold text-red-900 mt-10 mb-6 font-calligraphy border-b border-red-800/20 pb-2 text-center" {...props} />,
                            h2: ({ node, ...props }) => <h2 className="text-xl font-bold text-mystic-900 mt-8 mb-4 font-calligraphy border-l-4 border-mystic-accent pl-3" {...props} />,
                            h3: ({ node, ...props }) => <h3 className="text-lg font-bold text-gray-800 mt-6 mb-2" {...props} />,
                            strong: ({ node, ...props }) => <strong className="text-red-700 font-bold mx-1 bg-red-50 px-1 rounded border-b-2 border-red-200" {...props} />,
                            ul: ({ node, ...props }) => <ul className="list-disc pl-5 space-y-2 mb-4 text-gray-700 bg-gray-50/50 p-4 rounded-lg" {...props} />,
                            li: ({ node, ...props }) => <li className="pl-1" {...props} />,
                            p: ({ node, ...props }) => <p className="mb-4 text-justify text-gray-700 tracking-wide" {...props} />,
                            blockquote: ({ node, ...props }) => <blockquote className="border-l-4 border-mystic-gold pl-4 italic text-gray-600 my-6 py-2 bg-amber-50 rounded-r" {...props} />,
                        }}
                    >
                        {activeTab === 'modern' ? result.modern : result.classical}
                    </ReactMarkdown>
                </div>

{
    activeTab === 'classical' && (
        <div className="mt-12 text-right">
            <p className="font-calligraphy text-xl text-gray-600">天機算命館 謹批</p>
            <div className="inline-block mt-2 border-2 border-red-800 text-red-800 px-3 py-1 font-calligraphy text-sm rotate-[-2deg] opacity-80 rounded-sm">
                鐵口直斷
            </div>
        </div>
    )
}
            </section >

    {/* Chat Interface */ }
    < ChatInterface chartContext = { result } apiKey = { apiKey } />


        <div className="text-center pt-8 pb-4">
            <button
                onClick={onReset}
                className="text-gray-500 hover:text-white underline underline-offset-4 mb-4"
            >
                重新排盤
            </button>

            {result.usedModel && (
                <div className="text-xs text-mystic-700 font-mono opacity-50">
                    AI Model: {result.usedModel}
                </div>
            )}
        </div>
        </div >
    );
};
