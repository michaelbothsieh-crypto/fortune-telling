
import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles } from 'lucide-react';
import { ChatMessage, AnalysisResponse } from '../types';
import { chatWithMaster } from '../services/geminiService';
import ReactMarkdown from 'react-markdown';

interface ChatInterfaceProps {
  chartContext: AnalysisResponse;
  apiKey: string;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ chartContext, apiKey }) => {
  const [history, setHistory] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [history, isLoading]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMsg = input.trim();
    setInput('');
    setHistory(prev => [...prev, { role: 'user', content: userMsg }]);
    setIsLoading(true);

    try {
      const response = await chatWithMaster(history, userMsg, chartContext, apiKey);
      setHistory(prev => [...prev, { role: 'model', content: response }]);
    } catch (error) {
      setHistory(prev => [...prev, { role: 'model', content: "大師暫時去休息了，請稍後再問。" }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-mystic-800 rounded-xl border border-mystic-700 shadow-2xl overflow-hidden flex flex-col h-[600px]">
      <div className="p-4 border-b border-mystic-700 bg-mystic-900/50 flex items-center space-x-2">
        <Sparkles className="text-mystic-accent" size={20} />
        <h3 className="font-bold text-gray-200">向大師追問</h3>
        <span className="text-xs text-gray-500 ml-auto">針對本次命盤深入探討</span>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-6 bg-mystic-900/30 scroll-custom">
        {history.length === 0 && (
          <div className="text-center text-gray-500 py-10 opacity-70">
            <p>您可以詢問：</p>
            <ul className="text-sm mt-2 space-y-1">
              <li>「我的適合做什麼行業？」</li>
              <li>「2026年要注意什麼細節？」</li>
              <li>「我的感情運勢如何？」</li>
            </ul>
          </div>
        )}

        {history.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] rounded-lg p-3 ${msg.role === 'user'
              ? 'bg-mystic-700 text-white rounded-br-none'
              : 'bg-[#fdfbf7] text-gray-800 rounded-bl-none border-l-4 border-mystic-gold'
              }`}>
              {msg.role === 'model' ? (
                <div className="prose prose-sm max-w-none">
                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                </div>
              ) : (
                <p>{msg.content}</p>
              )}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-[#fdfbf7] p-3 rounded-lg rounded-bl-none border-l-4 border-mystic-gold flex items-center space-x-2">
              <div className="w-2 h-2 bg-mystic-gold rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-mystic-gold rounded-full animate-bounce delay-75"></div>
              <div className="w-2 h-2 bg-mystic-gold rounded-full animate-bounce delay-150"></div>
            </div>
          </div>
        )}
      </div>

      <form onSubmit={handleSend} className="p-4 bg-mystic-800 border-t border-mystic-700 flex space-x-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="請輸入您的問題..."
          disabled={isLoading}
          className="flex-1 bg-mystic-900 border border-mystic-600 rounded px-4 py-2 text-white focus:border-mystic-gold focus:outline-none"
        />
        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          className="bg-mystic-gold hover:bg-yellow-600 text-mystic-900 font-bold p-2 rounded transition-colors disabled:opacity-50"
        >
          <Send size={20} />
        </button>
      </form>
    </div>
  );
};
