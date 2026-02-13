import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Search, Tag, FileText, Link2, Image, Code, ArrowRight } from 'lucide-react';

export default function SEOAnalysisPage() {
  const features = [
    {
      icon: Tag,
      title: 'Meta Tags Analysis',
      description: 'Evaluate title tags, meta descriptions, and Open Graph tags for optimal search visibility.'
    },
    {
      icon: FileText,
      title: 'Heading Structure',
      description: 'Analyze H1-H6 hierarchy to ensure proper content organization and keyword placement.'
    },
    {
      icon: Link2,
      title: 'Link Analysis',
      description: 'Review internal and external links, anchor text distribution, and broken link detection.'
    },
    {
      icon: Image,
      title: 'Image Optimization',
      description: 'Check alt tags, image sizes, and lazy loading implementation for better SEO.'
    },
    {
      icon: Code,
      title: 'Structured Data',
      description: 'Validate Schema.org markup and rich snippets for enhanced search results.'
    },
    {
      icon: Search,
      title: 'Keyword Density',
      description: 'Analyze keyword usage and distribution across your page content.'
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-transparent to-transparent" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-6">
              <Search className="w-4 h-4 text-emerald-400" />
              <span className="text-sm font-medium text-emerald-400">SEO Analysis</span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-foreground mb-6">
              Comprehensive SEO Analysis
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
              Uncover SEO opportunities and issues with our in-depth analysis. Compare your SEO performance against competitors and get actionable recommendations.
            </p>
            <Link to="/register">
              <Button size="lg" className="rounded-full bg-emerald-600 hover:bg-emerald-500 gap-2">
                Start Free Analysis
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-2xl font-bold text-foreground text-center mb-12">What We Analyze</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => (
            <Card key={feature.title} className="bg-card border-border hover:border-emerald-500/50 transition-colors">
              <CardContent className="p-6">
                <div className="w-12 h-12 rounded-lg bg-emerald-500/10 flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-emerald-400" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">{feature.title}</h3>
                <p className="text-muted-foreground text-sm">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <Card className="bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 border-emerald-500/20">
          <CardContent className="p-8 sm:p-12 text-center">
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-4">
              Ready to improve your SEO?
            </h2>
            <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
              Get a detailed SEO comparison between your website and competitors in minutes.
            </p>
            <Link to="/register">
              <Button size="lg" className="rounded-full bg-emerald-600 hover:bg-emerald-500">
                Get Started Free
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
