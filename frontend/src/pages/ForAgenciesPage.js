import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Building2, Users, FileBarChart, Clock, Shield, Zap, ArrowRight, CheckCircle } from 'lucide-react';

export default function ForAgenciesPage() {
  const benefits = [
    {
      icon: Users,
      title: 'Multi-Client Management',
      description: 'Manage competitive analysis for multiple clients from a single dashboard.'
    },
    {
      icon: FileBarChart,
      title: 'White-Label Reports',
      description: 'Generate professional reports you can share with clients under your brand.'
    },
    {
      icon: Clock,
      title: 'Save Hours Weekly',
      description: 'Automate competitor research that used to take hours of manual work.'
    },
    {
      icon: Shield,
      title: 'Impress Clients',
      description: 'Deliver data-driven insights that demonstrate your expertise and value.'
    }
  ];

  const features = [
    'Bulk website analysis for client portfolios',
    'Automated competitor tracking and alerts',
    'Customizable PDF report generation',
    'AI-powered recommendations for each client',
    'Historical data and trend analysis',
    'Priority support for agency accounts'
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-transparent to-transparent" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 mb-6">
              <Building2 className="w-4 h-4 text-blue-400" />
              <span className="text-sm font-medium text-blue-400">For Agencies</span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-foreground mb-6">
              Scale Your Agency with AI
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
              Deliver exceptional competitive analysis to your clients. Save time, impress stakeholders, and grow your agency with data-driven insights.
            </p>
            <Link to="/register">
              <Button size="lg" className="rounded-full bg-blue-600 hover:bg-blue-500 gap-2">
                Start Agency Trial
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Benefits Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-2xl font-bold text-foreground text-center mb-12">Built for Agency Workflows</h2>
        <div className="grid md:grid-cols-2 gap-6">
          {benefits.map((benefit) => (
            <Card key={benefit.title} className="bg-card border-border hover:border-blue-500/50 transition-colors">
              <CardContent className="p-6">
                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                    <benefit.icon className="w-6 h-6 text-blue-400" />
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

      {/* Features List */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <Card className="bg-gradient-to-br from-blue-500/10 to-indigo-500/10 border-blue-500/20">
            <CardContent className="p-8">
              <Zap className="w-12 h-12 text-blue-400 mb-4" />
              <h3 className="text-xl font-bold text-foreground mb-2">Agency-Grade Tools</h3>
              <p className="text-muted-foreground mb-6">
                Everything you need to deliver competitive analysis at scale for your clients.
              </p>
              <Link to="/register">
                <Button className="w-full rounded-full bg-blue-600 hover:bg-blue-500">
                  Get Agency Access
                </Button>
              </Link>
            </CardContent>
          </Card>
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-6">Agency Features</h2>
            <div className="space-y-4">
              {features.map((feature) => (
                <div key={feature} className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-blue-400 flex-shrink-0" />
                  <span className="text-muted-foreground">{feature}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
