import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { TrendingUp, Target, BarChart3, Lightbulb, Users, Rocket, ArrowRight, CheckCircle } from 'lucide-react';

export default function ForMarketersPage() {
  const benefits = [
    {
      icon: Target,
      title: 'Competitive Intelligence',
      description: 'Understand what your competitors are doing right and identify gaps in their strategy you can exploit.'
    },
    {
      icon: BarChart3,
      title: 'Performance Benchmarks',
      description: 'Set realistic goals based on industry benchmarks and competitor performance data.'
    },
    {
      icon: Lightbulb,
      title: 'AI-Powered Insights',
      description: 'Get actionable recommendations powered by GPT to improve your marketing strategy.'
    },
    {
      icon: TrendingUp,
      title: 'Growth Opportunities',
      description: 'Discover untapped opportunities in SEO, content, and user experience.'
    }
  ];

  const useCases = [
    'Compare landing page performance against competitors',
    'Identify content gaps and keyword opportunities',
    'Benchmark website speed and user experience',
    'Track competitor changes over time',
    'Generate reports for stakeholder presentations',
    'Prioritize optimization efforts based on impact'
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 via-transparent to-transparent" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-500/10 border border-orange-500/20 mb-6">
              <TrendingUp className="w-4 h-4 text-orange-400" />
              <span className="text-sm font-medium text-orange-400">For Marketers</span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-foreground mb-6">
              Outsmart Your Competition
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
              Get the competitive insights you need to make data-driven marketing decisions. Understand what works for your competitors and do it better.
            </p>
            <Link to="/register">
              <Button size="lg" className="rounded-full bg-orange-600 hover:bg-orange-500 gap-2">
                Start Free Trial
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Benefits Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-2xl font-bold text-foreground text-center mb-12">Why Marketers Love SITERANK AI</h2>
        <div className="grid md:grid-cols-2 gap-6">
          {benefits.map((benefit) => (
            <Card key={benefit.title} className="bg-card border-border hover:border-orange-500/50 transition-colors">
              <CardContent className="p-6">
                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-lg bg-orange-500/10 flex items-center justify-center flex-shrink-0">
                    <benefit.icon className="w-6 h-6 text-orange-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">{benefit.title}</h3>
                    <p className="text-muted-foreground text-sm">{benefit.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Use Cases */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-6">Perfect for Marketing Teams</h2>
            <div className="space-y-4">
              {useCases.map((useCase) => (
                <div key={useCase} className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-orange-400 flex-shrink-0" />
                  <span className="text-muted-foreground">{useCase}</span>
                </div>
              ))}
            </div>
          </div>
          <Card className="bg-gradient-to-br from-orange-500/10 to-red-500/10 border-orange-500/20">
            <CardContent className="p-8">
              <Users className="w-12 h-12 text-orange-400 mb-4" />
              <h3 className="text-xl font-bold text-foreground mb-2">Join 1,000+ Marketers</h3>
              <p className="text-muted-foreground mb-6">
                Marketing teams use SITERANK AI to stay ahead of competitors and drive growth.
              </p>
              <Link to="/register">
                <Button className="w-full rounded-full bg-orange-600 hover:bg-orange-500">
                  Get Started Free
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
