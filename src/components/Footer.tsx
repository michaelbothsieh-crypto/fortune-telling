
import React from 'react';
import { ShieldCheck } from 'lucide-react';

interface FooterProps {
    onOpenMethodology?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenMethodology }) => {
    return (
        <footer className="bg-mystic-900 border-t border-mystic-800 text-center py-8 px-4 mt-12">
            <div className="max-w-4xl mx-auto flex flex-col items-center gap-4">

                {/* Privacy Badge */}
                <div className="flex items-center gap-2 px-4 py-2 bg-mystic-800/50 rounded-full border border-mystic-700/50 text-xs text-gray-400 max-w-lg">
                    <ShieldCheck size={14} className="text-green-500 shrink-0" />
                    <span>隱私承諾：您的命盤僅於瀏覽器與 Google API 間加密傳輸，本站絕不儲存任何個資。</span>
                </div>

                <p className="text-gray-500 text-sm">
                    © {new Date().getFullYear()} AI 八字命理大師 (AI Bazi Master). All rights reserved.
                </p>
                {onOpenMethodology && (
                    <button
                        onClick={onOpenMethodology}
                        className="text-mystic-gold/60 hover:text-mystic-gold text-xs underline decoration-dotted underline-offset-4 transition-colors"
                    >
                        關於大師與技術 (Methodology)
                    </button>
                )}
            </div>
        </footer>
    );
};
