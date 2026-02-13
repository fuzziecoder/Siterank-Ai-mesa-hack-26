import { useState, useRef, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { X, Send, User, Sparkles } from 'lucide-react';

const SITE_KNOWLEDGE = {
  greetings: [
    "Hi! I'm your SITERANK AI assistant. How can I help you today?",
    "Welcome! I can help you understand how to use our website analyzer. What would you like to know?"
  ],
  features: {
    optimize: "The **Optimize My Site** feature is our most powerful tool! Just enter your website URL and click the button. It will:\n\n• Auto-detect your competitors\n• Analyze SEO, speed, content & UX\n• Generate a full optimization blueprint\n• Give you Critical Fixes, Quick Wins, and a 30-day strategy",
    seo: "The **SEO Analysis** page analyzes your website's SEO health:\n\n• Checks meta tags (title, description)\n• Analyzes heading structure\n• Generates Schema.org markup\n• Provides AI-generated fixes you can copy with one click",
    speed: "The **Speed Metrics** page analyzes your site's performance:\n\n• Measures load time and page size\n• Checks image optimization opportunities\n• Recommends compression and caching\n• Provides code snippets for improvements",
    content: "The **Content Score** page evaluates your content quality:\n\n• Analyzes word count and readability\n• Detects thin content issues\n• Generates blog ideas to outrank competitors\n• Suggests keywords to target",
    analyze: "The **New Analysis** feature lets you compare your site against competitors:\n\n• Enter your website URL\n• Add competitor URLs (or use Auto-Detect)\n• Get detailed score comparisons\n• See AI-powered improvement suggestions",
    dashboard: "Your **Dashboard** shows:\n\n• Total analyses you've run\n• Average and best scores\n• Quick access to recent analyses\n• Links to run new analyses"
  },
  howTo: {
    start: "Here's how to get started:\n\n1. **Register** or **Login** to your account\n2. Click **Optimize My Site** for a full analysis\n3. Or use specific tools (SEO, Speed, Content)\n4. Review the AI recommendations\n5. Copy fixes and implement them!",
    competitors: "To analyze competitors:\n\n1. Go to **New Analysis**\n2. Enter your website URL\n3. Either add competitor URLs manually OR\n4. Click **Auto-Detect** to let AI find them\n5. Click **Start Analysis**",
    copy: "To copy any recommendation:\n\n1. Look for the **copy icon** next to AI suggestions\n2. Click it to copy the text/code\n3. Paste it into your website's code\n4. Re-run analysis to verify improvements!"
  },
  pricing: "SITERANK AI currently offers free access to all features! Just register and start optimizing.",
  support: "Need more help? Visit our **Support** page or email support@siterankai.com"
};

function getBotResponse(message) {
  const msg = message.toLowerCase();
  
  // Greetings
  if (msg.match(/^(hi|hello|hey|help|start)/)) {
    return SITE_KNOWLEDGE.greetings[Math.floor(Math.random() * SITE_KNOWLEDGE.greetings.length)] + 
      "\n\nYou can ask me about:\n• How to optimize your site\n• SEO, Speed, or Content analysis\n• How to use specific features\n• Getting started";
  }
  
  // Optimize feature
  if (msg.includes('optimize') || msg.includes('blueprint') || msg.includes('main feature')) {
    return SITE_KNOWLEDGE.features.optimize;
  }
  
  // SEO
  if (msg.includes('seo') || msg.includes('meta') || msg.includes('schema') || msg.includes('title tag')) {
    return SITE_KNOWLEDGE.features.seo;
  }
  
  // Speed
  if (msg.includes('speed') || msg.includes('performance') || msg.includes('load time') || msg.includes('fast')) {
    return SITE_KNOWLEDGE.features.speed;
  }
  
  // Content
  if (msg.includes('content') || msg.includes('blog') || msg.includes('keyword') || msg.includes('writing')) {
    return SITE_KNOWLEDGE.features.content;
  }
  
  // Analysis/Compare
  if (msg.includes('analyz') || msg.includes('compare') || msg.includes('competitor')) {
    return SITE_KNOWLEDGE.features.analyze;
  }
  
  // Dashboard
  if (msg.includes('dashboard') || msg.includes('history') || msg.includes('past')) {
    return SITE_KNOWLEDGE.features.dashboard;
  }
  
  // How to get started
  if (msg.includes('start') || msg.includes('begin') || msg.includes('how do i') || msg.includes('how to use')) {
    return SITE_KNOWLEDGE.howTo.start;
  }
  
  // How to add competitors
  if (msg.includes('add competitor') || msg.includes('find competitor') || msg.includes('auto detect') || msg.includes('auto-detect')) {
    return SITE_KNOWLEDGE.howTo.competitors;
  }
  
  // How to copy
  if (msg.includes('copy') || msg.includes('implement') || msg.includes('use the fix')) {
    return SITE_KNOWLEDGE.howTo.copy;
  }
  
  // Pricing
  if (msg.includes('price') || msg.includes('cost') || msg.includes('free') || msg.includes('pay')) {
    return SITE_KNOWLEDGE.pricing;
  }
  
  // Support
  if (msg.includes('support') || msg.includes('contact') || msg.includes('email') || msg.includes('help me')) {
    return SITE_KNOWLEDGE.support;
  }
  
  // What can you do
  if (msg.includes('what can') || msg.includes('features') || msg.includes('what does')) {
    return "SITERANK AI helps you optimize your website! Here's what you can do:\n\n" +
      "🚀 **Optimize My Site** - Full AI analysis with 30-day strategy\n" +
      "🔍 **SEO Analysis** - Fix meta tags, headings, schema\n" +
      "⚡ **Speed Metrics** - Optimize load time and performance\n" +
      "📝 **Content Score** - Improve content and get blog ideas\n" +
      "📊 **Competitor Analysis** - Compare against competitors\n\n" +
      "What would you like to learn more about?";
  }
  
  // Default response
  return "I'm not sure I understand. Here are some things you can ask me:\n\n" +
    "• \"How do I get started?\"\n" +
    "• \"What does Optimize My Site do?\"\n" +
    "• \"How do I analyze SEO?\"\n" +
    "• \"How do I find competitors?\"\n" +
    "• \"What features do you have?\"\n\n" +
    "Or visit our **Support** page for more help!";
}

export default function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      type: 'bot',
      text: "Hi! 👋 I'm your SITERANK AI assistant. How can I help you today?\n\nYou can ask me about:\n• How to use the site\n• Features like SEO, Speed, Content analysis\n• Getting started with optimization"
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

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage = input.trim();
    setInput('');
    
    // Add user message
    setMessages(prev => [...prev, { type: 'user', text: userMessage }]);
    
    // Simulate typing
    setIsTyping(true);
    
    setTimeout(() => {
      const response = getBotResponse(userMessage);
      setMessages(prev => [...prev, { type: 'bot', text: response }]);
      setIsTyping(false);
    }, 500 + Math.random() * 500);
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

  return (
    <>
      {/* Chat Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-20 right-6 z-[9999] w-16 h-16 rounded-full transition-all duration-300 flex items-center justify-center ${
          isOpen 
            ? 'bg-gray-800 hover:bg-gray-700 border border-gray-600' 
            : 'bg-gradient-to-br from-gray-700 via-gray-800 to-black hover:from-gray-600 hover:via-gray-700 hover:to-gray-900 hover:scale-105 border border-gray-600'
        }`}
        data-testid="chat-bot-btn"
      >
        {isOpen ? (
          <X className="w-7 h-7 text-white" />
        ) : (
          <AppLogoIcon className="w-8 h-8 text-white" />
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
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 border border-emerald-500/30 flex items-center justify-center">
              <AppLogoIcon className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <h3 className="font-semibold text-white">SITERANK Assistant</h3>
              <p className="text-xs text-gray-400">Ask me anything about the site</p>
            </div>
          </div>

          {/* Messages */}}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg, index) => (
              <div 
                key={index} 
                className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex items-start gap-2 max-w-[85%] ${msg.type === 'user' ? 'flex-row-reverse' : ''}`}>
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${
                    msg.type === 'user' 
                      ? 'bg-emerald-500/20' 
                      : 'bg-cyan-500/20'
                  }`}>
                    {msg.type === 'user' ? (
                      <User className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <Sparkles className="w-4 h-4 text-cyan-400" />
                    )}
                  </div>
                  <div className={`p-3 rounded-2xl text-sm ${
                    msg.type === 'user'
                      ? 'bg-emerald-600 text-white rounded-tr-sm'
                      : 'bg-muted text-foreground rounded-tl-sm'
                  }`}>
                    <div className="whitespace-pre-wrap" dangerouslySetInnerHTML={{ 
                      __html: msg.text
                        .replace(/\*\*(.*?)\*\*/g, '<strong class="text-emerald-400">$1</strong>')
                        .replace(/\n/g, '<br/>')
                    }} />
                  </div>
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="flex justify-start">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-cyan-500/20 flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-cyan-400" />
                  </div>
                  <div className="bg-muted p-3 rounded-2xl rounded-tl-sm">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                      <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                      <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                    </div>
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
                  onClick={() => {
                    setInput(q);
                    setTimeout(() => {
                      setMessages(prev => [...prev, { type: 'user', text: q }]);
                      setIsTyping(true);
                      setTimeout(() => {
                        const response = getBotResponse(q);
                        setMessages(prev => [...prev, { type: 'bot', text: response }]);
                        setIsTyping(false);
                      }, 500);
                    }, 100);
                    setInput('');
                  }}
                  className="px-3 py-1.5 text-xs rounded-full bg-muted border border-border text-muted-foreground hover:text-foreground hover:border-emerald-500/50 transition-colors"
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
                data-testid="chat-input"
              />
              <Button
                onClick={handleSend}
                disabled={!input.trim()}
                className="h-10 w-10 p-0 rounded-full bg-emerald-600 hover:bg-emerald-500"
                data-testid="chat-send-btn"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
