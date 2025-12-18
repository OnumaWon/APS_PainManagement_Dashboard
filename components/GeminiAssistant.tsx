import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, Sparkles, BrainCircuit } from 'lucide-react';
import { sendChatMessage } from '../services/geminiService';
import { ChatMessage } from '../types';

export const GeminiAssistant: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: '1', role: 'model', text: 'Hello! I am your APS Data Assistant. How can I help you analyze the pain management data today?', timestamp: new Date() }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [useThinking, setUseThinking] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', text: input, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
        const history = messages.map(m => ({ role: m.role, parts: [{ text: m.text }] }));
        const responseText = await sendChatMessage(history, userMsg.text, useThinking);
        
        const botMsg: ChatMessage = { 
            id: (Date.now() + 1).toString(), 
            role: 'model', 
            text: responseText, 
            timestamp: new Date(),
            isThinking: useThinking
        };
        setMessages(prev => [...prev, botMsg]);
    } catch (error) {
        setMessages(prev => [...prev, { id: Date.now().toString(), role: 'model', text: "Sorry, I encountered an error. Please check your API key or connection.", timestamp: new Date() }]);
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <>
      {/* Trigger Button */}
      <button 
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 p-4 rounded-full shadow-lg transition-all duration-300 z-50 ${isOpen ? 'scale-0 opacity-0' : 'scale-100 opacity-100 bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:shadow-blue-500/50'}`}
      >
        <MessageCircle size={28} />
      </button>

      {/* Chat Window */}
      <div className={`fixed bottom-6 right-6 w-96 h-[600px] bg-white dark:bg-slate-900 rounded-2xl shadow-2xl flex flex-col transition-all duration-300 z-50 transform border border-slate-200 dark:border-slate-700 ${isOpen ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0 pointer-events-none'}`}>
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4 rounded-t-2xl flex justify-between items-center text-white">
          <div className="flex items-center gap-2">
            <Bot size={20} />
            <h3 className="font-semibold">APS AI Assistant</h3>
          </div>
          <button onClick={() => setIsOpen(false)} className="hover:bg-white/20 p-1 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50 dark:bg-slate-800 custom-scrollbar">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${msg.role === 'user' ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-100 rounded-tl-none shadow-sm'}`}>
                {msg.isThinking && (
                    <div className="flex items-center gap-1 text-xs text-indigo-500 dark:text-indigo-400 mb-1 font-semibold">
                        <BrainCircuit size={12} />
                        <span>Thinking...</span>
                    </div>
                )}
                <p className="whitespace-pre-wrap">{msg.text}</p>
                <p className={`text-[10px] mt-1 ${msg.role === 'user' ? 'text-blue-200' : 'text-slate-400 dark:text-slate-400'}`}>
                    {msg.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </p>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
                <div className="bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 p-4 rounded-2xl rounded-tl-none shadow-sm">
                    <div className="flex gap-2">
                        <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce delay-100"></div>
                        <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce delay-200"></div>
                    </div>
                </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-700 rounded-b-2xl">
          <div className="flex items-center justify-between mb-2">
              <label className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 cursor-pointer hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                  <input 
                    type="checkbox" 
                    checked={useThinking} 
                    onChange={(e) => setUseThinking(e.target.checked)}
                    className="rounded border-slate-300 dark:border-slate-600 text-indigo-600 focus:ring-indigo-500 bg-slate-100 dark:bg-slate-800"
                  />
                  <BrainCircuit size={14} />
                  <span>Deep Thinking Mode</span>
              </label>
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask about the data..."
              className="flex-1 px-4 py-2 bg-slate-100 dark:bg-slate-800 border-none rounded-full text-sm text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:outline-none placeholder-slate-400 dark:placeholder-slate-500"
            />
            <button 
                onClick={handleSend}
                disabled={isLoading || !input.trim()}
                className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      </div>
    </>
  );
};