
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

  const sendMessage = async (message: string) => {
    if (!message.trim() || isLoading) return;

    setHistory(prev => [...prev, { role: 'user', content: message }]);
    setIsLoading(true);

    try {
      const response = await chatWithMaster(history, message, chartContext, apiKey);
      setHistory(prev => [...prev, { role: 'model', content: response }]);
    } catch (error) {
      setHistory(prev => [...prev, { role: 'model', content: "大師暫時去休息了，請稍後再問。" }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    await sendMessage(input.trim());
  };

  return (
    <div className={`bg-mystic-800 rounded-xl border border-mystic-700 shadow-2xl overflow-hidden flex flex-col h-[600px] print:h-auto print:shadow-none print:border-none ${history.length === 0 ? 'print:hidden' : ''} chat-interface`}>
      <div className="p-4 border-b border-mystic-700 bg-mystic-900/50 flex items-center space-x-2 print:border-b-2 print:border-gray-200">
        <Sparkles className="text-mystic-accent" size={20} />
        <h3 className="font-bold text-gray-200 print:text-black">向大師追問</h3>
        <span className="text-xs text-gray-500 ml-auto print:hidden">針對本次命盤深入探討</span>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-6 bg-mystic-900/30 scroll-custom print:bg-white print:overflow-visible">
        {history.length === 0 && (
          <div className="text-center text-gray-500 py-10 opacity-70 print:hidden">
            <p className="mb-4">您可以詢問以下問題，或自行輸入：</p>

            {chartContext.suggestedQuestions && chartContext.suggestedQuestions.length > 0 ? (
              <div className="flex flex-col gap-3 max-w-sm mx-auto">
                {chartContext.suggestedQuestions.map((q, idx) => (
                  <button
                    key={idx}
                      // but state update is async. Better to refactor or just set input.
                      // For UX, clicking usually populates input or sends immediately.
                      // Let's make it auto-send.
                      // Since handleSend relies on `input` state, we need a separate trigger function or pass msg to function.
                      // I will refactor handleSend to accept optional overrides.
                      // But for now, let's just populate input + auto-focus, or use a helper.
                      // Actually, I can just call a send helper.
                    }}
                    // Correction: I can't easily call handleSend with event if I want to pass string.
                    // Let's create `sendMessage(text)` function.
                    className="p-3 bg-mystic-700/50 hover:bg-mystic-gold hover:text-mystic-900 border border-mystic-600 rounded-lg text-sm transition-all text-left flex items-center gap-2 group"
                  >
                    <Sparkles size={16} className="text-mystic-gold group-hover:text-mystic-900" />
                    {q}
                  </button>
                ))}
              </div>
            ) : (
              <ul className="text-sm mt-2 space-y-1">
                <li>「我的適合做什麼行業？」</li>
                <li>「2026年要注意什麼細節？」</li>
                <li>「我的感情運勢如何？」</li>
              </ul>
            )}
          </div>
        )}

        {history.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} print:block print:mb-4`}>
            <div className={`max-w-[85%] rounded-lg p-3 print:max-w-full print:p-0 print:bg-transparent print:text-black ${msg.role === 'user'
              ? 'bg-mystic-700 text-white rounded-br-none print:font-bold'
              : 'bg-[#fdfbf7] text-gray-800 rounded-bl-none border-l-4 border-mystic-gold print:border-none'
              }`}>
              {msg.role === 'user' && <span className="hidden print:inline font-bold mr-2">問：</span>}
              {msg.role === 'model' && <span className="hidden print:inline font-bold mr-2">答：</span>}

              {msg.role === 'model' ? (
                <div className="prose prose-sm max-w-none print:prose-stone">
                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                </div>
              ) : (
                <p>{msg.content}</p>
              )}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start print:hidden">
            <div className="bg-[#fdfbf7] p-3 rounded-lg rounded-bl-none border-l-4 border-mystic-gold flex items-center space-x-2">
              <div className="w-2 h-2 bg-mystic-gold rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-mystic-gold rounded-full animate-bounce delay-75"></div>
              <div className="w-2 h-2 bg-mystic-gold rounded-full animate-bounce delay-150"></div>
            </div>
          </div>
        )}
      </div>

      <form onSubmit={handleSend} className="p-4 bg-mystic-800 border-t border-mystic-700 flex space-x-2 print:hidden">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="請輸入您的問題..."
          disabled={isLoading}
          rows={1}
          className="flex-1 bg-mystic-900 border border-mystic-600 rounded px-4 py-2 text-white focus:border-mystic-gold focus:outline-none resize-none min-h-[42px] max-h-[120px]"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSend(e);
            }
          }}
        />
        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          className="bg-mystic-gold hover:bg-yellow-600 text-mystic-900 font-bold p-2 rounded transition-colors disabled:opacity-50"
        >
          <Send size={20} />
        </button>
      </form>
    </div >
  );
};
