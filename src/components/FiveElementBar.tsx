import React from 'react';
import { FiveElementsData } from '../types';

interface FiveElementBarProps {
    data: FiveElementsData;
}

export const FiveElementBar: React.FC<FiveElementBarProps> = ({ data }) => {
    const elements = [
        { key: 'wood', name: '木', color: 'bg-green-600', textColor: 'text-green-500', percent: data.wood },
        { key: 'fire', name: '火', color: 'bg-red-600', textColor: 'text-red-500', percent: data.fire },
        { key: 'earth', name: '土', color: 'bg-yellow-600', textColor: 'text-yellow-500', percent: data.earth },
        { key: 'gold', name: '金', color: 'bg-gray-400', textColor: 'text-gray-400', percent: data.gold },
        { key: 'water', name: '水', color: 'bg-blue-600', textColor: 'text-blue-500', percent: data.water },
    ];

    /* 
      Calculate dominant element for fun insight later? 
      For now, just simple stacked bar + individual bars.
    */

    return (
        <div className="bg-mystic-900/50 p-4 rounded-xl border border-mystic-700/50">
            <h4 className="text-gray-400 text-xs font-bold mb-3 uppercase tracking-widest">五行能量分佈 (Five Elements Balance)</h4>

            {/* Visual Stacked Bar */}
            <div className="flex w-full h-4 rounded-full overflow-hidden mb-4 shadow-inner bg-black/50">
                {elements.map((el) => (
                    <div
                        key={el.key}
                        style={{ width: `${el.percent}%` }}
                        className={`h-full ${el.color} transition-all duration-1000`}
                        title={`${el.name}: ${el.percent}%`}
                    />
                ))}
            </div>

            {/* Numerical Breakdown */}
            <div className="grid grid-cols-5 gap-2 text-center">
                {elements.map((el) => (
                    <div key={el.key} className="flex flex-col items-center">
                        <span className={`text-xs font-bold ${el.textColor}`}>{el.name}</span>
                        <span className="text-lg font-mono text-gray-200">{el.percent}%</span>
                    </div>
                ))}
            </div>
        </div>
    );
};
