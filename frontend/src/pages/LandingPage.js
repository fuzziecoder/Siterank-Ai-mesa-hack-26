import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { 
  Search, Zap, Target, TrendingUp, 
  ArrowRight, Globe, Shield, Clock
} from 'lucide-react';
import ShinyText from '../components/ShinyText';
import Logo from '../components/Logo';

const features = [
  {
    icon: Search,
    title: 'Deep Website Analysis',
    description: 'Comprehensive scraping of SEO, speed, content, and UX metrics from any website.'
  },
  {
    icon: Target,
    title: 'Competitor Comparison',
    description: 'Side-by-side comparison with up to 5 competitors to identify gaps and opportunities.'
  },
  {
    icon: Zap,
    title: 'AI-Powered Insights',
    description: 'GPT-5.2 powered analysis generates actionable recommendations tailored to your needs.'
  },
  {
    icon: TrendingUp,
    title: 'Action Plans',
    description: 'Prioritized action items to help you outrank competitors systematically.'
  }
];

const metrics = [
  { label: 'SEO Score', value: 85 },
  { label: 'Speed Score', value: 72 },
  { label: 'Content Score', value: 90 },
  { label: 'UX Score', value: 78 }
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background" data-testid="landing-page">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-accent/50 via-background to-background" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-24 lg:py-32">
          <div className="grid lg:grid-cols-12 gap-12 items-center">
            {/* Hero Content */}
            <div className="lg:col-span-7 space-y-8">
              <div className="space-y-4">
                <Badge variant="secondary" className="gap-2 bg-accent text-muted-foreground">
                  <Zap className="w-3 h-3" />
                  AI-Powered Analysis
                </Badge>
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground">
                  Outrank Your
                  <span className="text-gray-400 block">Competitors</span>
                </h1>
                <p className="text-lg text-muted-foreground max-w-xl">
                  Analyze your website against competitors with AI-powered insights. 
                  Get actionable recommendations to improve SEO, speed, content, and user experience.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/register">
                  <Button size="lg" className="rounded-full gap-2 text-base px-8" data-testid="hero-cta">
                    Start Free Analysis
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
                <Link to="/login">
                  <Button variant="outline" size="lg" className="rounded-full text-base px-8" data-testid="hero-login">
                    Sign In
                  </Button>
                </Link>
              </div>

              {/* Trust indicators */}
              <div className="flex flex-wrap items-center gap-6 pt-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-gray-500" />
                  <span>Secure Analysis</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-gray-500" />
                  <span>Results in Minutes</span>
                </div>
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-gray-500" />
                  <span>Any Website</span>
                </div>
              </div>
            </div>

            {/* Hero Visual */}
            <div className="lg:col-span-5 hidden lg:block">
              <Card className="bg-card border-border shadow-2xl">
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-muted-foreground">Your Website Score</span>
                    <span className="text-3xl font-bold text-foreground">81</span>
                  </div>
                  <div className="space-y-3">
                    {metrics.map((metric) => (
                      <div key={metric.label} className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="font-medium text-muted-foreground">{metric.label}</span>
                          <span className="text-muted-foreground">{metric.value}/100</span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gray-500 rounded-full transition-all duration-1000"
                            style={{ width: `${metric.value}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-accent/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4 text-foreground">
              Everything You Need to Win
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Comprehensive analysis tools powered by AI to help you understand 
              and outperform your competition.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Card 
                key={feature.title}
                className="bg-card hover:bg-accent/50 transition-all duration-300 border-border"
                data-testid={`feature-card-${index}`}
              >
                <CardContent className="p-6 space-y-4">
                  <div className="w-12 h-12 bg-muted rounded-xl flex items-center justify-center">
                    <feature.icon className="w-6 h-6 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4 text-foreground">
              How It Works
            </h2>
            <p className="text-lg text-muted-foreground">
              Three simple steps to get actionable insights
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: '01', title: 'Enter URLs', desc: 'Add your website and competitor URLs' },
              { step: '02', title: 'AI Analysis', desc: 'Our AI scrapes and analyzes all metrics' },
              { step: '03', title: 'Get Results', desc: 'Receive detailed comparison and action plan' }
            ].map((item, index) => (
              <Card key={item.step} className="text-center border-none shadow-none bg-transparent" data-testid={`step-${index + 1}`}>
                <CardContent className="space-y-4 pt-6">
                  <div className="text-5xl font-extrabold text-gray-700">{item.step}</div>
                  <h3 className="text-xl font-semibold text-foreground">{item.title}</h3>
                  <p className="text-muted-foreground">{item.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-accent/30">
        <div className="max-w-4xl mx-auto px-4 text-center space-y-8">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
            Ready to Outrank Your Competition?
          </h2>
          <p className="text-lg text-muted-foreground">
            Start analyzing your website today and get AI-powered recommendations 
            to improve your online presence.
          </p>
          <Link to="/register">
            <Button size="lg" className="rounded-full gap-2 text-base px-8" data-testid="cta-bottom">
              Get Started Free
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-3">
              <Logo size="lg" circular />
              <span className="font-bold" style={{ fontFamily: "'Zen Dots', cursive" }}>
                <ShinyText 
                  text="SITERANK AI" 
                  speed={3} 
                  color="#9ca3af" 
                  shineColor="#e5e7eb"
                  spread={100}
                />
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2024 SITERANK AI. AI-powered website competitor analysis.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
