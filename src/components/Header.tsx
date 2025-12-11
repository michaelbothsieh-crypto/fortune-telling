import React, { useState } from 'react';
import { AnalysisMode } from '../types';
import { Menu, X } from 'lucide-react';

interface HeaderProps {
  mode: AnalysisMode;
  onNavClick: (e: React.MouseEvent, mode: AnalysisMode) => void;
  onReload: () => void;
}

export const Header: React.FC<HeaderProps> = ({ mode, onNavClick, onReload }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleMobileNavClick = (e: React.MouseEvent, selectedMode: AnalysisMode) => {
    onNavClick(e, selectedMode);
    setIsMenuOpen(false); // Close menu after selection
  };

  return (
    <header className="border-b border-mystic-700 bg-mystic-900/95 sticky top-0 z-50 backdrop-blur-md shadow-md">
      <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-3 cursor-pointer" onClick={onReload}>
          <div className="bg-mystic-gold text-mystic-900 p-2 rounded-full border-2 border-mystic-700">
            <span className="font-calligraphy text-2xl font-bold">天機</span>
          </div>
          <div className="flex flex-col">
            <h1 className="text-xl font-bold tracking-widest text-mystic-gold">八字正宗</h1>
            <span className="text-xs text-gray-500 uppercase tracking-widest">Master BaZi</span>
          </div>
        </div>

        {/* Desktop Nav */}
        <nav className="hidden md:flex space-x-6 text-sm text-gray-400">
          <button
            onClick={(e) => onNavClick(e, AnalysisMode.BASIC)}
            className={`transition-colors pb-1 border-b-2 ${mode === AnalysisMode.BASIC ? 'text-mystic-gold border-mystic-gold font-bold' : 'border-transparent hover:text-mystic-gold'}`}
          >
            八字論命
          </button>
          <button
            onClick={(e) => onNavClick(e, AnalysisMode.YEARLY)}
            className={`transition-colors pb-1 border-b-2 ${mode === AnalysisMode.YEARLY ? 'text-mystic-gold border-mystic-gold font-bold' : 'border-transparent hover:text-mystic-gold'}`}
          >
            流年運勢
          </button>
          <button
            onClick={(e) => onNavClick(e, AnalysisMode.SCHOLARLY)}
            className={`transition-colors pb-1 border-b-2 ${mode === AnalysisMode.SCHOLARLY ? 'text-mystic-gold border-mystic-gold font-bold' : 'border-transparent hover:text-mystic-gold'}`}
          >
            古籍考據
          </button>
          <button
            onClick={(e) => onNavClick(e, AnalysisMode.COMPATIBILITY)}
            className={`transition-colors pb-1 border-b-2 ${mode === AnalysisMode.COMPATIBILITY ? 'text-mystic-gold border-mystic-gold font-bold' : 'border-transparent hover:text-mystic-gold'}`}
          >
            雙人合盤
          </button>
        </nav>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden text-mystic-gold p-2"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Nav Dropdown */}
      {isMenuOpen && (
        <nav className="md:hidden border-t border-mystic-700 bg-mystic-900 animate-fade-in-down">
          <div className="flex flex-col p-4 space-y-4 text-sm text-gray-400">
            <button
              onClick={(e) => handleMobileNavClick(e, AnalysisMode.BASIC)}
              className={`text-left px-4 py-2 rounded-lg transition-colors ${mode === AnalysisMode.BASIC ? 'bg-mystic-800 text-mystic-gold font-bold border border-mystic-gold' : 'hover:bg-mystic-800 hover:text-mystic-gold'}`}
            >
              📜 八字論命
            </button>
            <button
              onClick={(e) => handleMobileNavClick(e, AnalysisMode.YEARLY)}
              className={`text-left px-4 py-2 rounded-lg transition-colors ${mode === AnalysisMode.YEARLY ? 'bg-mystic-800 text-mystic-gold font-bold border border-mystic-gold' : 'hover:bg-mystic-800 hover:text-mystic-gold'}`}
            >
              🧭 流年運勢
            </button>
            <button
              onClick={(e) => handleMobileNavClick(e, AnalysisMode.SCHOLARLY)}
              className={`text-left px-4 py-2 rounded-lg transition-colors ${mode === AnalysisMode.SCHOLARLY ? 'bg-mystic-800 text-mystic-gold font-bold border border-mystic-gold' : 'hover:bg-mystic-800 hover:text-mystic-gold'}`}
            >
              📚 古籍考據
            </button>
            <button
              onClick={(e) => handleMobileNavClick(e, AnalysisMode.COMPATIBILITY)}
              className={`text-left px-4 py-2 rounded-lg transition-colors ${mode === AnalysisMode.COMPATIBILITY ? 'bg-mystic-800 text-mystic-gold font-bold border border-mystic-gold' : 'hover:bg-mystic-800 hover:text-mystic-gold'}`}
            >
              💞 雙人合盤
            </button>
          </div>
        </nav>
      )}
    </header>
  );
};
