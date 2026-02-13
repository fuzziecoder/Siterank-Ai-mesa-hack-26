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
      text: "Hi! 👋 I'm your SITERANK AI assistant powered by DeepSeek. How can I help you today?\n\nYou can ask me about:\n• How to use the site\n• Features like SEO, Speed, Content analysis\n• Getting started with optimization"
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

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;

    const userMessage = input.trim();
    setInput('');
    
    // Add user message
    setMessages(prev => [...prev, { type: 'user', text: userMessage }]);
    
    // Show typing indicator
    setIsTyping(true);
    
    try {
      // Build conversation history for API
      const conversationHistory = messages
        .filter(m => m.text)
        .map(m => ({
          role: m.type === 'user' ? 'user' : 'assistant',
          content: m.text
        }));
      
      // Add current user message
      conversationHistory.push({ role: 'user', content: userMessage });
      
      const response = await fetch(`${API_URL}/api/chatbot`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ messages: conversationHistory }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to get response');
      }
      
      const data = await response.json();
      setMessages(prev => [...prev, { type: 'bot', text: data.response }]);
      
    } catch (error) {
      console.error('Chatbot error:', error);
      setMessages(prev => [...prev, { 
        type: 'bot', 
        text: "I'm having trouble connecting right now. Please try again in a moment, or visit our **Support** page for help." 
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
    "How do I get started?",
    "What does Optimize do?",
    "How to analyze SEO?"
  ];

  const handleQuickQuestion = async (question) => {
    if (isTyping) return;
    setInput('');
    
    // Add user message
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
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ messages: conversationHistory }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to get response');
      }
      
      const data = await response.json();
      setMessages(prev => [...prev, { type: 'bot', text: data.response }]);
      
    } catch (error) {
      console.error('Chatbot error:', error);
      setMessages(prev => [...prev, { 
        type: 'bot', 
        text: "I'm having trouble connecting right now. Please try again." 
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <>
      {/* Chat Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-20 right-6 z-[9999] w-16 h-16 rounded-full transition-all duration-300 flex items-center justify-center overflow-hidden ${
          isOpen 
            ? 'bg-gray-800 hover:bg-gray-700 border border-gray-600' 
            : 'bg-black hover:bg-gray-900 hover:scale-105 border border-gray-600'
        }`}
        data-testid="chat-bot-btn"
      >
        {isOpen ? (
          <X className="w-7 h-7 text-white" />
        ) : (
          <img src="/bot-icon.png" alt="Chat" className="w-12 h-12 object-contain" />
        )}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div 
          className="fixed bottom-40 right-6 z-[9998] w-[360px] h-[500px] bg-background border border-border rounded-2xl shadow-2xl flex flex-col overflow-hidden"
          data-testid="chat-bot-window"
        >
          {/* Header - Dark Theme */}
          <div className="bg-gray-900 border-b border-gray-700 p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-black border border-gray-600 flex items-center justify-center overflow-hidden">
              <img src="/bot-icon.png" alt="Bot" className="w-8 h-8 object-contain" />
            </div>
            <div>
              <h3 className="font-semibold text-white">SITERANK Assistant</h3>
              <p className="text-xs text-gray-400">Powered by DeepSeek AI</p>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg, index) => (
              <div 
                key={index} 
                className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex items-start gap-2 max-w-[85%] ${msg.type === 'user' ? 'flex-row-reverse' : ''}`}>
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${
                    msg.type === 'user' 
                      ? 'bg-gray-700' 
                      : 'bg-gray-800'
                  }`}>
                    {msg.type === 'user' ? (
                      <User className="w-4 h-4 text-gray-300" />
                    ) : (
                      <Sparkles className="w-4 h-4 text-gray-300" />
                    )}
                  </div>
                  <div className={`p-3 rounded-2xl text-sm ${
                    msg.type === 'user'
                      ? 'bg-gray-700 text-white rounded-tr-sm'
                      : 'bg-muted text-foreground rounded-tl-sm'
                  }`}>
                    <div className="whitespace-pre-wrap" dangerouslySetInnerHTML={{ 
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
                  <div className="w-7 h-7 rounded-full bg-gray-800 flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-gray-300" />
                  </div>
                  <div className="bg-muted p-3 rounded-2xl rounded-tl-sm flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                    <span className="text-sm text-gray-400">Thinking...</span>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Questions */}
          {messages.length <= 2 && (
            <div className="px-4 pb-2 flex flex-wrap gap-2">
              {quickQuestions.map((q, i) => (
                <button
                  key={i}
                  onClick={() => handleQuickQuestion(q)}
                  disabled={isTyping}
                  className="px-3 py-1.5 text-xs rounded-full bg-muted border border-border text-muted-foreground hover:text-foreground hover:border-gray-500 transition-colors disabled:opacity-50"
                >
                  {q}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="p-4 border-t border-border">
            <div className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your question..."
                className="flex-1 bg-muted border-border h-10"
                disabled={isTyping}
                data-testid="chat-input"
              />
              <Button
                onClick={handleSend}
                disabled={!input.trim() || isTyping}
                className="h-10 w-10 p-0 rounded-full bg-gray-700 hover:bg-gray-600"
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
