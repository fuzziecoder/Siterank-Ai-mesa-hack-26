import { Link } from 'react-router-dom';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { FileText, Code, Zap, BookOpen, ArrowRight, Search, BarChart3, Settings } from 'lucide-react';

export default function DocumentationPage() {
  const sections = [
    {
      icon: Zap,
      title: 'Getting Started',
      description: 'Learn the basics and run your first competitive analysis in minutes.',
      links: ['Quick Start Guide', 'Creating Your Account', 'Your First Analysis']
    },
    {
      icon: Search,
      title: 'Website Analysis',
      description: 'Deep dive into how we analyze websites and what each metric means.',
      links: ['SEO Metrics Explained', 'Speed Score Breakdown', 'Content Analysis Guide']
    },
    {
      icon: BarChart3,
      title: 'Understanding Results',
      description: 'Learn how to interpret your analysis results and take action.',
      links: ['Reading Your Dashboard', 'Competitor Comparison', 'AI Recommendations']
    },
    {
      icon: Code,
      title: 'API Reference',
      description: 'Integrate SITERANK AI into your applications and workflows.',
      links: ['Authentication', 'Endpoints Reference', 'Rate Limits']
    }
  ];

  const guides = [
    { title: 'How to add competitors', icon: Search },
    { title: 'Auto-detect competitors feature', icon: Zap },
    { title: 'Understanding your SEO score', icon: BarChart3 },
    { title: 'Exporting reports', icon: FileText },
    { title: 'Account settings', icon: Settings },
    { title: 'Billing and plans', icon: BookOpen }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 mb-6">
            <FileText className="w-4 h-4 text-blue-400" />
            <span className="text-sm font-medium text-blue-400">Documentation</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-foreground mb-4">
            Documentation
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
            Everything you need to know about using SITERANK AI effectively.
          </p>
          
          {/* Search Bar */}
          <div className="max-w-xl mx-auto relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search documentation..."
              className="w-full pl-12 pr-4 py-3 rounded-full bg-muted border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        {/* Main Sections */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          {sections.map((section) => (
            <Card key={section.title} className="bg-card border-border hover:border-blue-500/50 transition-colors">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                    <section.icon className="w-6 h-6 text-blue-400" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-lg font-semibold text-foreground mb-2">{section.title}</h2>
                    <p className="text-muted-foreground text-sm mb-4">{section.description}</p>
                    <div className="space-y-2">
                      {section.links.map((link) => (
                        <div key={link} className="flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 cursor-pointer">
                          <ArrowRight className="w-3 h-3" />
                          {link}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Popular Guides */}
        <div className="mb-12">
          <h2 className="text-xl font-bold text-foreground mb-6">Popular Guides</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {guides.map((guide) => (
              <Card key={guide.title} className="bg-card border-border hover:border-blue-500/50 transition-colors cursor-pointer group">
                <CardContent className="p-4 flex items-center gap-3">
                  <guide.icon className="w-5 h-5 text-muted-foreground group-hover:text-blue-400 transition-colors" />
                  <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                    {guide.title}
                  </span>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Help CTA */}
        <Card className="bg-gradient-to-r from-blue-500/10 to-indigo-500/10 border-blue-500/20">
          <CardContent className="p-8 text-center">
            <h2 className="text-xl font-bold text-foreground mb-2">Can't find what you're looking for?</h2>
            <p className="text-muted-foreground mb-4">Our support team is here to help.</p>
            <Link to="/support">
              <Button className="rounded-full bg-blue-600 hover:bg-blue-500">
                Contact Support
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
