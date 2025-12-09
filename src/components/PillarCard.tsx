import React from 'react';

interface PillarCardProps {
  label: string;
  stem: string;
  branch: string;
}

const getStemColor = (stem: string) => {
  const map: Record<string, string> = {
    '甲': 'text-green-500', '乙': 'text-green-500',
    '丙': 'text-red-500', '丁': 'text-red-500',
    '戊': 'text-yellow-600', '己': 'text-yellow-600',
    '庚': 'text-gray-300', '辛': 'text-gray-300',
    '壬': 'text-blue-500', '癸': 'text-blue-500',
  };
  return map[stem] || 'text-mystic-gold';
};

const getBranchColor = (branch: string) => {
   // Simplified elemental mapping for branches
   const map: Record<string, string> = {
     '寅': 'text-green-500', '卯': 'text-green-500',
     '巳': 'text-red-500', '午': 'text-red-500',
     '辰': 'text-yellow-600', '戌': 'text-yellow-600', '丑': 'text-yellow-600', '未': 'text-yellow-600',
     '申': 'text-gray-300', '酉': 'text-gray-300',
     '亥': 'text-blue-500', '子': 'text-blue-500',
   };
   return map[branch] || 'text-mystic-gold';
}

export const PillarCard: React.FC<PillarCardProps> = ({ label, stem, branch }) => {
  return (
    <div className="flex flex-col items-center bg-mystic-800 border-2 border-mystic-700 p-4 rounded-lg shadow-lg min-w-[80px]">
      <span className="text-xs text-gray-400 mb-2 uppercase tracking-widest">{label}</span>
      <div className="flex flex-col items-center font-calligraphy text-4xl space-y-2">
        <span className={`${getStemColor(stem)} drop-shadow-md`}>{stem}</span>
        <span className={`${getBranchColor(branch)} drop-shadow-md`}>{branch}</span>
      </div>
    </div>
  );
};
