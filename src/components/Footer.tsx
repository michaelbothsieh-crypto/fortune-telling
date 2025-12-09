import React from 'react';

interface FooterProps {
    onOpenMethodology?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenMethodology }) => {
    return (
        <footer className="text-center py-8 text-gray-600 text-sm border-t border-mystic-800 mt-12 bg-mystic-900 space-y-2">
            <p>© 2025 天機算命 - 宗法古籍，正宗傳承</p>
            {onOpenMethodology && (
                <button
                    onClick={onOpenMethodology}
                    className="text-mystic-gold/60 hover:text-mystic-gold text-xs underline decoration-dotted underline-offset-4 transition-colors"
                >
                    關於大師與技術 (Methodology)
                </button>
            )}
        </footer>
    );
};
