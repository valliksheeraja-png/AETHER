import React, { useState, useRef, useEffect } from 'react';
import {
  Bot,
  Send,
  Sparkles,
  ShieldCheck,
  ArrowRight,
  Database,
  HelpCircle,
  ExternalLink,
  User,
  Flame,
  CheckCircle2
} from 'lucide-react';
import { api } from '../services/api';
import { ChatMessage, FeedbackEvidence } from '../types';

interface AnalystPageProps {
  onOpenEvidence: (evidence: FeedbackEvidence[], title?: string) => void;
}

const SUGGESTED_PROMPTS = [
  'What are the biggest emerging issues?',
  'What are customers complaining about?',
  'What changed after the latest release?',
  'Show me feedback related to payment.',
  'Which feature has the most negative feedback?',
  'Summarize customer complaints from the last 30 days.'
];

export const AnalystPage: React.FC<AnalystPageProps> = ({ onOpenEvidence }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      text: "Hello! I am AETHER's AI Product Analyst. I have instant access to your persistent feedback memory and SQL database. Every statistic and trend I cite is grounded in actual customer verbatim records. What would you like to explore?",
      suggested_followups: [
        'What are the biggest emerging issues?',
        'What changed after the latest release?',
        'What are customers complaining about?'
      ],
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (queryText?: string) => {
    const textToSend = (queryText || input).trim();
    if (!textToSend || isSending) return;

    setInput('');
    const userMsg: ChatMessage = {
      id: `user_${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsSending(true);

    try {
      const response = await api.chatWithAnalyst(textToSend);
      const assistantMsg: ChatMessage = {
        id: `ai_${Date.now()}`,
        sender: 'assistant',
        text: response.answer,
        metrics: response.metrics,
        evidence: response.evidence,
        suggested_followups: response.suggested_followups,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        is_demo_mode: response.is_demo_mode,
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: `err_${Date.now()}`,
        sender: 'assistant',
        text: "I encountered an error querying the memory store. Please ensure the backend is running.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] max-w-5xl mx-auto p-4 sm:p-6 space-y-4">
      {/* Top Banner */}
      <div className="p-3.5 rounded-xl bg-[#121522] border border-white/10 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center text-white">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-semibold text-white">AETHER Conversational Analyst</h3>
            <span className="text-[11px] text-slate-400">
              Zero hallucination guarantee: answers backed by verified database & vector evidence
            </span>
          </div>
        </div>

        <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
          <ShieldCheck className="w-3 h-3 text-emerald-400" /> Evidence Grounding Active
        </span>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-1">
        {messages.map((msg) => {
          const isUser = msg.sender === 'user';
          return (
            <div
              key={msg.id}
              className={`flex gap-3 text-xs leading-relaxed animate-fade-in ${
                isUser ? 'justify-end' : 'justify-start'
              }`}
            >
              {!isUser && (
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 text-white flex items-center justify-center shrink-0 shadow-md">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-2xl rounded-2xl p-4 space-y-3 ${
                  isUser
                    ? 'bg-gradient-to-r from-cyan-600 to-indigo-600 text-white'
                    : 'bg-[#121522] border border-white/10 text-slate-200'
                }`}
              >
                {/* Text Content */}
                <div className="whitespace-pre-line text-[13px] leading-relaxed">
                  {msg.text}
                </div>

                {/* Grounding Evidence Action Button */}
                {!isUser && msg.evidence && msg.evidence.length > 0 && (
                  <div className="pt-2 border-t border-white/10 flex items-center justify-between">
                    <span className="text-[11px] text-slate-400 flex items-center gap-1">
                      <Database className="w-3 h-3 text-cyan-400" />
                      <span>{msg.evidence.length} supporting customer records found</span>
                    </span>

                    <button
                      onClick={() => onOpenEvidence(msg.evidence!, 'Supporting Customer Records')}
                      className="px-3 py-1.5 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 font-semibold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
                    >
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                      <span>View Supporting Feedback</span>
                    </button>
                  </div>
                )}

                {/* Suggested Followups */}
                {!isUser && msg.suggested_followups && msg.suggested_followups.length > 0 && (
                  <div className="pt-2 border-t border-white/5 space-y-1.5">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                      Suggested Inquiries:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {msg.suggested_followups.map((sug, i) => (
                        <button
                          key={i}
                          onClick={() => handleSend(sug)}
                          className="text-[11px] px-2.5 py-1 rounded-lg bg-white/5 hover:bg-cyan-500/10 hover:text-cyan-300 border border-white/10 text-slate-300 transition-all text-left cursor-pointer"
                        >
                          {sug}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Timestamp */}
                <div className={`text-[10px] text-right ${isUser ? 'text-cyan-100/70' : 'text-slate-500'}`}>
                  {msg.timestamp}
                </div>
              </div>

              {isUser && (
                <div className="w-8 h-8 rounded-xl bg-slate-700 text-white flex items-center justify-center shrink-0">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          );
        })}

        {isSending && (
          <div className="flex gap-3 text-xs justify-start animate-fade-in">
            <div className="w-8 h-8 rounded-xl bg-cyan-600/30 text-cyan-400 border border-cyan-500/30 flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4" />
            </div>
            <div className="p-3.5 rounded-2xl bg-[#121522] border border-white/10 flex items-center gap-2 text-slate-400 text-xs">
              <div className="w-3.5 h-3.5 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
              <span>Querying database & vector memory for grounded evidence...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Quick Prompts */}
      <div className="flex items-center gap-1.5 overflow-x-auto py-1 text-xs">
        <span className="text-[10px] uppercase font-bold text-slate-500 shrink-0">Quick Ask:</span>
        {SUGGESTED_PROMPTS.slice(0, 3).map((prompt, i) => (
          <button
            key={i}
            onClick={() => handleSend(prompt)}
            className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 text-[11px] whitespace-nowrap transition-all cursor-pointer"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Input Box */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="flex gap-2"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask anything about customer issues, release impact, or sentiment..."
          className="flex-1 px-4 py-3 rounded-xl bg-[#121522] border border-white/10 focus:border-cyan-400 focus:outline-none text-xs sm:text-sm text-slate-200 placeholder:text-slate-500 transition-all"
        />
        <button
          type="submit"
          disabled={!input.trim() || isSending}
          className="px-5 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:opacity-90 disabled:opacity-50 text-white font-semibold text-xs flex items-center gap-2 transition-all cursor-pointer shadow-md shadow-cyan-500/20"
        >
          <Send className="w-4 h-4" />
          <span className="hidden sm:inline">Ask AI</span>
        </button>
      </form>
    </div>
  );
};
