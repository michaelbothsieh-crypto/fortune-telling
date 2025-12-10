import React from 'react';
import { RadarData } from '../types';

interface RadarChartProps {
    data: RadarData;
}

export const RadarChart: React.FC<RadarChartProps> = ({ data }) => {
    const size = 200;
    const radius = 80;
    const center = size / 2;
    const levels = 4;

    // Dimensions order: Career, Wealth, Love, Health, Social, Family
    const keys: (keyof RadarData)[] = ['career', 'wealth', 'love', 'health', 'social', 'family'];
    const labels = ['事業', '財運', '感情', '健康', '人際', '家庭'];

    const angleSlice = (Math.PI * 2) / 6;

    // Helpers to calculate points
    const getPoint = (value: number, index: number, max: number = 100) => {
        const angle = index * angleSlice - Math.PI / 2; // Start from top
        const r = (value / max) * radius;
        const x = center + r * Math.cos(angle);
        const y = center + r * Math.sin(angle);
        return { x, y };
    };

    // Generate grid points
    const gridPoints = Array.from({ length: levels }).map((_, levelIndex) => {
        const levelValue = ((levelIndex + 1) / levels) * 100;
        return keys.map((_, i) => getPoint(levelValue, i));
    });

    // Generate data points
    const dataPoints = keys.map((key, i) => getPoint(data[key], i));
    const polyPoints = dataPoints.map(p => `${p.x},${p.y}`).join(' ');

    return (
        <div className="flex flex-col items-center">
            <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="overflow-visible">
                {/* Grid */}
                {gridPoints.map((points, level) => (
                    <polygon
                        key={level}
                        points={points.map(p => `${p.x},${p.y}`).join(' ')}
                        fill="none"
                        stroke="#d4af37" // Mystic gold
                        strokeOpacity="0.2"
                        strokeWidth="1"
                    />
                ))}

                {/* Axes */}
                {keys.map((_, i) => {
                    const p = getPoint(100, i);
                    return (
                        <line
                            key={i}
                            x1={center}
                            y1={center}
                            x2={p.x}
                            y2={p.y}
                            stroke="#d4af37"
                            strokeOpacity="0.2"
                            strokeWidth="1"
                        />
                    );
                })}

                {/* Data Polygon */}
                <polygon
                    points={polyPoints}
                    fill="rgba(212, 175, 55, 0.4)" // Mystic Gold with opacity
                    stroke="#d4af37"
                    strokeWidth="2"
                />

                {/* Labels */}
                {labels.map((label, i) => {
                    const angle = i * angleSlice - Math.PI / 2;
                    const labelRadius = radius + 20;
                    const x = center + labelRadius * Math.cos(angle);
                    const y = center + labelRadius * Math.sin(angle);

                    return (
                        <text
                            key={i}
                            x={x}
                            y={y}
                            textAnchor="middle"
                            dominantBaseline="middle"
                            className="text-xs fill-gray-400 font-serif"
                            style={{ fontSize: '10px' }}
                        >
                            {label}
                        </text>
                    );
                })}
            </svg>
        </div>
    );

};
