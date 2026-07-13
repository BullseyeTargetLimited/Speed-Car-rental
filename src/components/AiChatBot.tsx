import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Phone, Sparkles, AlertCircle, HelpCircle } from 'lucide-react';
import { TRANSLATIONS } from '../data';

export default function AiChatBot({ lang }: { lang: 'en' | 'ar' | 'fr' }) {
  const t = TRANSLATIONS[lang];
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant'; text: string }>>([]);
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Suggested starter queries
  const quickQuestions = {
    en: [
      'What 4WD is best for Jebel Shams?',
      'How much does a Rooftop Tent cost?',
      'Tell me about the desert safari.'
    ],
    ar: [
      'ما هي أفضل سيارة دفع رباعي لجبل شمس؟',
      'كم تكلفة استئجار خيمة السقف؟',
      'حدثني عن رحلة سفاري الصحراء.'
    ],
    fr: [
      'Quel 4x4 choisir pour le Jebel Shams ?',
      'Combien coûte la tente de toit ?',
      'Parlez-moi du safari dans le désert.'
    ]
  };

  useEffect(() => {
    // Add default initial message
    setMessages([
      { role: 'assistant', text: t.welcomeMessage }
    ]);
  }, [lang]);

  useEffect(() => {
    // Auto-scroll on new messages
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen]);

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || isLoading) return;

    const userMessage = textToSend.trim();
    setUserInput('');
    setMessages((prev) => [...prev, { role: 'user', text: userMessage }]);
    setIsLoading(true);

    try {
      const response = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage,
          history: messages
        })
      });

      const data = await response.json();
      setMessages((prev) => [...prev, { role: 'assistant', text: data.text }]);
    } catch (err) {
      console.error('Chat error:', err);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          text: 'Thank you for your question! I am temporarily operating in offline backup mode. Please call or WhatsApp us directly at +96893070770 for immediate live assist!'
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Chat Trigger Button in the corner */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3.5">
        {/* WhatsApp direct launch bubble */}
        <a
          href="https://wa.me/96893070770?text=Hello%20SPEED%20Car%20Rental%20Oman%2C%20I%20would%20like%20to%20inquire%20about%20your%20services."
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center bg-[#25D366] hover:bg-[#20ba5a] text-white p-3.5 rounded-full shadow-2xl hover:scale-110 active:scale-95 transition-all duration-300 border border-emerald-400/30"
          title="WhatsApp SPEED Support"
        >
          <svg className="h-6 w-6 fill-current" viewBox="0 0 24 24">
            <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.455L0 24zm6.59-4.846c1.665.989 3.3 1.478 5.357 1.479 5.437 0 9.859-4.42 9.862-9.859.002-2.636-1.023-5.111-2.884-6.974C17.26 1.936 14.78 1.9 12.012 1.9c-5.44 0-9.863 4.419-9.866 9.86 0 2.128.556 4.195 1.61 6.012l-.995 3.633 3.731-.978zm11.367-7.234c-.3-.15-1.772-.875-2.046-.975-.275-.1-.475-.15-.674.15-.199.3-.773.975-.948 1.175-.175.2-.35.225-.65.075-1.205-.6-2.099-1.077-2.933-2.51-.219-.375.219-.348.627-1.156.075-.15.038-.282-.019-.394-.056-.113-.475-1.144-.65-1.569-.171-.413-.342-.356-.475-.362-.122-.006-.263-.008-.403-.008-.14 0-.368.053-.56.263-.193.21-.738.72-7.38.72s1.147 1.417 1.302 1.625c.156.208 2.229 3.403 5.4 4.767.753.325 1.341.519 1.8.663.757.241 1.448.207 1.993.125.607-.09 1.772-.725 2.022-1.391.25-.666.25-1.238.175-1.391-.075-.153-.275-.253-.575-.403z"/>
          </svg>
        </a>

        {/* AI Travel bot trigger bubble */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="bg-gradient-to-tr from-[#1E2229] to-[#2B323D] hover:from-[#2B323D] hover:to-[#384150] text-white p-4 rounded-full shadow-2xl border border-slate-700/60 hover:scale-105 active:scale-95 transition-all relative cursor-pointer"
        >
          {isOpen ? (
            <X className="h-6 w-6 text-teal-400" />
          ) : (
            <div className="relative">
              <MessageSquare className="h-6 w-6 text-white" />
              <span className="absolute -top-1.5 -right-1.5 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-teal-500"></span>
              </span>
            </div>
          )}
        </button>
      </div>

      {/* Expandable Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-[360px] sm:w-[400px] h-[500px] bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl z-50 flex flex-col overflow-hidden text-white animate-fade-in">
          {/* Header */}
          <div className="bg-gradient-to-r from-slate-950 to-slate-900 px-4 py-3.5 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-teal-500/20 flex items-center justify-center border border-teal-500/30">
                <Sparkles className="h-4 w-4 text-teal-400 animate-spin-slow" />
              </div>
              <div>
                <p className="text-sm font-bold text-white">SPEED Oman AI Guide</p>
                <div className="flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span className="text-[10px] text-slate-400">Online & Grounded in Oman Data</span>
                </div>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-white p-1 rounded-full transition"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Messages Console */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-950/45">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-3.5 py-2 text-xs leading-relaxed ${
                    m.role === 'user'
                      ? 'bg-teal-500 text-slate-950 font-medium rounded-tr-none'
                      : 'bg-slate-800 text-slate-200 border border-slate-700/50 rounded-tl-none'
                  }`}
                >
                  {m.text}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-slate-800 border border-slate-700/50 text-slate-400 rounded-2xl rounded-tl-none px-4 py-2.5 text-xs flex items-center gap-2">
                  <span className="h-1.5 w-1.5 bg-teal-400 rounded-full animate-bounce"></span>
                  <span className="h-1.5 w-1.5 bg-teal-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                  <span className="h-1.5 w-1.5 bg-teal-400 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Suggested Starter Bubbles */}
          {messages.length === 1 && (
            <div className="px-4 py-2 bg-slate-950 border-t border-slate-800/40">
              <p className="text-[10px] text-slate-400 mb-1.5 font-semibold flex items-center gap-1">
                <HelpCircle className="h-3 w-3" /> Popular Inquiries:
              </p>
              <div className="flex flex-col gap-1.5">
                {quickQuestions[lang].map((q, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendMessage(q)}
                    className="text-left bg-slate-800/60 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white px-2.5 py-1.5 rounded-lg text-[11px] transition"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* User Input controls */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage(userInput);
            }}
            className="p-3 bg-slate-900 border-t border-slate-800 flex items-center gap-2"
          >
            <input
              type="text"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              placeholder="Ask about wadis, 4x4s, Jebel Shams..."
              className="flex-1 bg-slate-950 border border-slate-700 focus:border-teal-500 rounded-lg px-3 py-2 text-xs text-white focus:outline-none"
            />
            <button
              type="submit"
              disabled={!userInput.trim() || isLoading}
              className={`p-2 rounded-lg transition-all cursor-pointer ${
                userInput.trim() && !isLoading
                  ? 'bg-teal-500 hover:bg-teal-600 text-slate-950'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed'
              }`}
            >
              <Send className="h-3.5 w-3.5 fill-current" />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
