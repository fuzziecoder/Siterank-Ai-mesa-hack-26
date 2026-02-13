import { useState } from 'react';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { HelpCircle, MessageSquare, Mail, ChevronDown, ChevronUp, Search, Clock, CheckCircle } from 'lucide-react';

export default function SupportPage() {
  const [openFaq, setOpenFaq] = useState(null);

  const faqs = [
    {
      question: 'How does the competitor auto-detect feature work?',
      answer: 'Our AI analyzes your website URL and uses GPT to identify the top 5 most relevant competitors in your industry. It considers factors like business model, target audience, and market positioning to find the best matches.'
    },
    {
      question: 'How long does an analysis take?',
      answer: 'Most analyses complete within 2-5 minutes depending on the number of competitors and website complexity. You\'ll be notified when your results are ready.'
    },
    {
      question: 'What metrics do you analyze?',
      answer: 'We analyze SEO (meta tags, headings, structured data), Speed (load time, page size), Content (word count, readability), and UX (mobile-friendliness, accessibility). Each category contributes to your overall score.'
    },
    {
      question: 'Can I analyze any website?',
      answer: 'Yes, you can analyze most publicly accessible websites. Some sites with heavy bot protection or login requirements may have limited data available.'
    },
    {
      question: 'How often should I run competitive analyses?',
      answer: 'We recommend running analyses monthly to track changes and trends. For highly competitive industries, bi-weekly analysis can help you stay ahead.'
    },
    {
      question: 'Is my data secure?',
      answer: 'Yes, we use industry-standard encryption and security practices. Your analysis data is private and never shared with third parties.'
    }
  ];

  const contactMethods = [
    {
      icon: MessageSquare,
      title: 'Live Chat',
      description: 'Get instant help from our team',
      action: 'Start Chat',
      available: true
    },
    {
      icon: Mail,
      title: 'Email Support',
      description: 'support@siterankai.com',
      action: 'Send Email',
      available: true
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/10 border border-green-500/20 mb-6">
            <HelpCircle className="w-4 h-4 text-green-400" />
            <span className="text-sm font-medium text-green-400">Support</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-foreground mb-4">
            How can we help?
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
            Find answers to common questions or get in touch with our support team.
          </p>
          
          {/* Search Bar */}
          <div className="max-w-xl mx-auto relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search for help..."
              className="w-full pl-12 pr-4 py-3 rounded-full bg-muted border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-green-500"
            />
          </div>
        </div>

        {/* Contact Methods */}
        <div className="grid sm:grid-cols-2 gap-6 mb-12 max-w-2xl mx-auto">
          {contactMethods.map((method) => (
            <Card key={method.title} className="bg-card border-border hover:border-green-500/50 transition-colors">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-4">
                  <method.icon className="w-6 h-6 text-green-400" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-1">{method.title}</h3>
                <p className="text-muted-foreground text-sm mb-4">{method.description}</p>
                <Button variant="outline" className="rounded-full border-green-500/50 text-green-400 hover:bg-green-500/10">
                  {method.action}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Response Time */}
        <div className="flex items-center justify-center gap-6 mb-12 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-green-400" />
            <span>Average response: &lt;2 hours</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-400" />
            <span>98% satisfaction rate</span>
          </div>
        </div>

        {/* FAQs */}
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-foreground text-center mb-8">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <Card 
                key={index} 
                className={`bg-card border-border cursor-pointer transition-colors ${openFaq === index ? 'border-green-500/50' : ''}`}
                onClick={() => setOpenFaq(openFaq === index ? null : index)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium text-foreground pr-4">{faq.question}</h3>
                    {openFaq === index ? (
                      <ChevronUp className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                    )}
                  </div>
                  {openFaq === index && (
                    <p className="mt-4 text-muted-foreground text-sm">{faq.answer}</p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Contact Form */}
        <Card className="mt-12 max-w-2xl mx-auto bg-gradient-to-r from-green-500/10 to-emerald-500/10 border-green-500/20">
          <CardContent className="p-8">
            <h2 className="text-xl font-bold text-foreground text-center mb-6">Still need help?</h2>
            <form className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <Input 
                  placeholder="Your name" 
                  className="bg-muted border-border"
                />
                <Input 
                  type="email" 
                  placeholder="Your email" 
                  className="bg-muted border-border"
                />
              </div>
              <Input 
                placeholder="Subject" 
                className="bg-muted border-border"
              />
              <textarea
                placeholder="How can we help you?"
                rows={4}
                className="w-full px-4 py-2 rounded-lg bg-muted border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-green-500 resize-none"
              />
              <Button className="w-full rounded-full bg-green-600 hover:bg-green-500">
                Send Message
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
