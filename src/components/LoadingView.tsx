
import React, { useState, useEffect } from 'react';

const STEPS = [
  "正在排四柱八字...",
  "分析日元強弱與得令...",
  "查閱《子平真詮》定格局...",
  "翻閱《窮通寶鑑》取調候...",
  "依《神峰通考》尋病藥...",
  "推算大運與流年吉凶...",
  "綜合論斷撰寫命書..."
];

export const LoadingView: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStep((prev) => (prev + 1) % STEPS.length);
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] text-mystic-gold space-y-8 animate-fade-in">
      <div className="relative w-28 h-28">
        {/* Outer Ring */}
        <div className="absolute inset-0 border-4 border-mystic-700 rounded-full opacity-30"></div>
        {/* Spinning Ring */}
        <div className="absolute inset-0 border-t-4 border-mystic-gold rounded-full animate-spin"></div>
        
        {/* Inner Tai Chi Symbol (Simplified with CSS) */}
        <div className="absolute inset-2 bg-mystic-800 rounded-full border-2 border-mystic-gold flex items-center justify-center overflow-hidden">
             <div className="w-full h-1/2 bg-mystic-gold absolute top-0"></div>
             <div className="w-1/2 h-full bg-mystic-gold absolute right-0"></div>
             <div className="w-4 h-4 bg-mystic-900 rounded-full absolute top-6 z-10"></div>
             <div className="w-4 h-4 bg-mystic-gold rounded-full absolute bottom-6 z-10 border border-mystic-900"></div>
        </div>
      </div>

      <div className="text-center space-y-4 max-w-xs mx-auto">
        <h3 className="text-2xl font-serif font-bold tracking-widest text-white">天機推演中</h3>
        
        <div className="h-8 overflow-hidden relative">
          <p key={currentStep} className="text-mystic-accent text-sm font-bold tracking-wider animate-slide-up">
            {STEPS[currentStep]}
          </p>
        </div>
        
        <p className="text-gray-500 text-xs mt-4">
          請稍候，大師正在為您調用三十年畢生功力...
        </p>
      </div>
    </div>
  );
};
