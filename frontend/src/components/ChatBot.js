import { useState, useRef, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { X, Send, User, Sparkles, Loader2 } from 'lucide-react';

const API_URL = process.env.REACT_APP_BACKEND_URL;

export default function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      type: 'bot',
      text: "Hi! 👋 I'm your SITERANK AI assistant. How can I help?\n\n• How to use the site\n• SEO, Speed, Content analysis\n• Getting started"
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Close chat on escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) setIsOpen(false);
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen]);

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;

    const userMessage = input.trim();
    setInput('');
    
    setMessages(prev => [...prev, { type: 'user', text: userMessage }]);
    setIsTyping(true);
    
    try {
      const conversationHistory = messages
        .filter(m => m.text)
        .map(m => ({
          role: m.type === 'user' ? 'user' : 'assistant',
          content: m.text
        }));
      
      conversationHistory.push({ role: 'user', content: userMessage });
      
      const response = await fetch(`${API_URL}/api/chatbot`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: conversationHistory }),
      });
      
      if (!response.ok) throw new Error('Failed to get response');
      
      const data = await response.json();
      setMessages(prev => [...prev, { type: 'bot', text: data.response }]);
      
    } catch (error) {
      console.error('Chatbot error:', error);
      setMessages(prev => [...prev, { 
        type: 'bot', 
        text: "I'm having trouble connecting. Please try again." 
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const quickQuestions = [
    "How to start?",
    "What's Optimize?",
    "Analyze SEO"
  ];

  const handleQuickQuestion = async (question) => {
    if (isTyping) return;
    setInput('');
    
    setMessages(prev => [...prev, { type: 'user', text: question }]);
    setIsTyping(true);
    
    try {
      const conversationHistory = messages
        .filter(m => m.text)
        .map(m => ({
          role: m.type === 'user' ? 'user' : 'assistant',
          content: m.text
        }));
      
      conversationHistory.push({ role: 'user', content: question });
      
      const response = await fetch(`${API_URL}/api/chatbot`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: conversationHistory }),
      });
      
      if (!response.ok) throw new Error('Failed to get response');
      
      const data = await response.json();
      setMessages(prev => [...prev, { type: 'bot', text: data.response }]);
      
    } catch (error) {
      console.error('Chatbot error:', error);
      setMessages(prev => [...prev, { 
        type: 'bot', 
        text: "I'm having trouble connecting. Please try again." 
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <>
      {/* Chat Button - Responsive positioning */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed z-[9999] rounded-full transition-all duration-300 flex items-center justify-center overflow-hidden
          bottom-4 right-4 w-12 h-12
          sm:bottom-6 sm:right-6 sm:w-14 sm:h-14
          md:bottom-8 md:right-8 md:w-16 md:h-16
          ${isOpen 
            ? 'bg-gray-800 hover:bg-gray-700 border border-gray-600' 
            : 'bg-black hover:bg-gray-900 hover:scale-105 border border-gray-600'
          }`}
        data-testid="chat-bot-btn"
        aria-label={isOpen ? "Close chat" : "Open chat"}
      >
        {isOpen ? (
          <X className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 text-white" />
        ) : (
          <img src="/bot-icon.png" alt="Chat" className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 object-contain" />
        )}
      </button>

      {/* Chat Window - Fully responsive */}
      {isOpen && (
        <div 
          className="fixed z-[9998] bg-background border border-border rounded-2xl shadow-2xl flex flex-col overflow-hidden
            inset-4 sm:inset-auto
            sm:bottom-24 sm:right-6 sm:w-[340px] sm:h-[450px]
            md:bottom-28 md:right-8 md:w-[360px] md:h-[500px]"
          data-testid="chat-bot-window"
        >
          {/* Header */}
          <div className="bg-gray-900 border-b border-gray-700 p-3 sm:p-4 flex items-center gap-3 flex-shrink-0">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-black border border-gray-600 flex items-center justify-center overflow-hidden">
              <img src="/bot-icon.png" alt="Bot" className="w-6 h-6 sm:w-8 sm:h-8 object-contain" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-white text-sm sm:text-base truncate">SITERANK Assistant</h3>
              <p className="text-xs text-gray-400 truncate">Powered by DeepSeek AI</p>
            </div>
            {/* Mobile close button */}
            <button 
              onClick={() => setIsOpen(false)}
              className="sm:hidden w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center"
              aria-label="Close chat"
            >
              <X className="w-4 h-4 text-gray-400" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 sm:space-y-4">
            {messages.map((msg, index) => (
              <div 
                key={index} 
                className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex items-start gap-2 max-w-[90%] sm:max-w-[85%] ${msg.type === 'user' ? 'flex-row-reverse' : ''}`}>
                  <div className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center flex-shrink-0 ${
                    msg.type === 'user' ? 'bg-gray-700' : 'bg-gray-800'
                  }`}>
                    {msg.type === 'user' ? (
                      <User className="w-3 h-3 sm:w-4 sm:h-4 text-gray-300" />
                    ) : (
                      <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 text-gray-300" />
                    )}
                  </div>
                  <div className={`p-2.5 sm:p-3 rounded-2xl text-xs sm:text-sm ${
                    msg.type === 'user'
                      ? 'bg-gray-700 text-white rounded-tr-sm'
                      : 'bg-muted text-foreground rounded-tl-sm'
                  }`}>
                    <div className="whitespace-pre-wrap break-words" dangerouslySetInnerHTML={{ 
                      __html: msg.text
                        .replace(/\*\*(.*?)\*\*/g, '<strong class="text-white font-semibold">$1</strong>')
                        .replace(/\n/g, '<br/>')
                    }} />
                  </div>
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="flex justify-start">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-gray-800 flex items-center justify-center">
                    <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 text-gray-300" />
                  </div>
                  <div className="bg-muted p-2.5 sm:p-3 rounded-2xl rounded-tl-sm flex items-center gap-2">
                    <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 animate-spin text-gray-400" />
                    <span className="text-xs sm:text-sm text-gray-400">Thinking...</span>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Questions */}
          {messages.length <= 2 && (
            <div className="px-3 sm:px-4 pb-2 flex flex-wrap gap-1.5 sm:gap-2 flex-shrink-0">
              {quickQuestions.map((q, i) => (
                <button
                  key={i}
                  onClick={() => handleQuickQuestion(q)}
                  disabled={isTyping}
                  className="px-2.5 sm:px-3 py-1 sm:py-1.5 text-xs rounded-full bg-muted border border-border text-muted-foreground hover:text-foreground hover:border-gray-500 transition-colors disabled:opacity-50"
                >
                  {q}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="p-3 sm:p-4 border-t border-border flex-shrink-0">
            <div className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your question..."
                className="flex-1 bg-muted border-border h-9 sm:h-10 text-sm"
                disabled={isTyping}
                data-testid="chat-input"
              />
              <Button
                onClick={handleSend}
                disabled={!input.trim() || isTyping}
                className="h-9 w-9 sm:h-10 sm:w-10 p-0 rounded-full bg-gray-700 hover:bg-gray-600 flex-shrink-0"
                data-testid="chat-send-btn"
              >
                {isTyping ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
