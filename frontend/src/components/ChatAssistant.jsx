import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader, Sparkles } from 'lucide-react';

export default function ChatAssistant({ resumeText, jobDescription, apiKey }) {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Hello! I'm your AI Resume Coach. I've analyzed your resume and the target job description. Ask me anything, like: 'How can I highlight my database experience?' or 'What projects can I add to show cloud skills?'"
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('https://ai-resume-analyzer-and-ats-optimizer.onrender.com/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          resume_text: resumeText,
          job_description: jobDescription,
          messages: [...messages, userMessage],
          api_key: apiKey
        })
      });

      if (!response.ok) {
        throw new Error('Failed to get response from AI coach');
      }

      const data = await response.json();
      setMessages(prev => [...prev, data]);
    } catch (err) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `Error: ${err.message || 'Something went wrong. Please check if the backend server is running.'}`
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[520px] bg-slate-900/40 rounded-xl border border-white/5 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-white/5 bg-slate-900/60">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-violet-600/20 text-violet-400">
            <Bot size={18} />
          </div>
          <div>
            <h4 className="font-semibold text-sm text-slate-200">AI Resume Advisor</h4>
            <p className="text-[11px] text-slate-400">Contextual optimizations & interview prep</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-[11px] bg-violet-500/10 text-violet-300 px-2 py-0.5 rounded-full border border-violet-500/20 font-medium">
          <Sparkles size={10} /> Live Coach
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex gap-3 max-w-[85%] ${msg.role === 'user' ? 'ml-auto flex-row-reverse' : ''}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border ${
              msg.role === 'user' 
                ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20' 
                : 'bg-violet-500/10 text-violet-400 border-violet-500/20'
            }`}>
              {msg.role === 'user' ? <User size={14} /> : <Bot size={14} />}
            </div>
            
            <div className={`p-3.5 rounded-2xl text-xs leading-relaxed ${
              msg.role === 'user'
                ? 'bg-cyan-600/20 text-cyan-50 border border-cyan-500/15 rounded-tr-none'
                : 'bg-slate-800/60 text-slate-300 border border-white/5 rounded-tl-none'
            }`}>
              {msg.content}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex gap-3 max-w-[80%]">
            <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 bg-violet-500/10 text-violet-400 border border-violet-500/20">
              <Bot size={14} />
            </div>
            <div className="p-3.5 rounded-2xl text-xs bg-slate-800/60 text-slate-400 border border-white/5 rounded-tl-none flex items-center gap-2">
              <Loader size={12} className="animate-spin text-violet-400" />
              <span>Analyzing context...</span>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Form */}
      <form onSubmit={handleSend} className="p-3 border-t border-white/5 bg-slate-900/60 flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask a question or request a rewrite..."
          className="flex-1 bg-slate-950/65 text-xs text-slate-200 placeholder-slate-500 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-1 focus:ring-violet-500/50 border border-white/5"
        />
        <button
          type="submit"
          disabled={!input.trim() || isLoading}
          className="bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white p-2.5 rounded-xl transition duration-150 flex items-center justify-center"
        >
          <Send size={15} />
        </button>
      </form>
    </div>
  );
}
