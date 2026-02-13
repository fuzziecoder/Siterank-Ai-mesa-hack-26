import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Building, Shield, Lock, BarChart3, Users, Globe, ArrowRight, CheckCircle } from 'lucide-react';

export default function ForEnterprisePage() {
  const features = [
    {
      icon: Shield,
      title: 'Enterprise Security',
      description: 'SOC 2 compliant with SSO integration, role-based access, and audit logs.'
    },
    {
      icon: Users,
      title: 'Team Collaboration',
      description: 'Unlimited team members with customizable permissions and workspaces.'
    },
    {
      icon: Globe,
      title: 'Global Scale',
      description: 'Analyze competitors across multiple regions and languages.'
    },
    {
      icon: BarChart3,
      title: 'Advanced Analytics',
      description: 'Custom dashboards, API access, and data export capabilities.'
    }
  ];

  const enterpriseFeatures = [
    'Dedicated account manager',
    'Custom API integrations',
    'SLA guarantees (99.9% uptime)',
    'Priority 24/7 support',
    'Custom training and onboarding',
    'Volume-based pricing',
    'Private cloud deployment options',
    'Advanced security controls'
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-500/10 via-transparent to-transparent" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-500/10 border border-violet-500/20 mb-6">
              <Building className="w-4 h-4 text-violet-400" />
              <span className="text-sm font-medium text-violet-400">Enterprise</span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-foreground mb-6">
              Enterprise-Grade Analysis
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
              Powerful competitive intelligence for large organizations. Security, scale, and support built for enterprise needs.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/register">
                <Button size="lg" className="rounded-full bg-violet-600 hover:bg-violet-500 gap-2">
                  Request Demo
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="rounded-full border-violet-500/50 text-violet-400 hover:bg-violet-500/10">
                Contact Sales
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-2xl font-bold text-foreground text-center mb-12">Enterprise Capabilities</h2>
        <div className="grid md:grid-cols-2 gap-6">
          {features.map((feature) => (
            <Card key={feature.title} className="bg-card border-border hover:border-violet-500/50 transition-colors">
              <CardContent className="p-6">
                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-lg bg-violet-500/10 flex items-center justify-center flex-shrink-0">
                    <feature.icon className="w-6 h-6 text-violet-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">{feature.title}</h3>
                    <p className="text-muted-foreground text-sm">{feature.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Enterprise Features List */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-6">Everything You Need at Scale</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {enterpriseFeatures.map((feature) => (
                <div key={feature} className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-violet-400 flex-shrink-0" />
                  <span className="text-muted-foreground text-sm">{feature}</span>
                </div>
              ))}
            </div>
          </div>
          <Card className="bg-gradient-to-br from-violet-500/10 to-purple-500/10 border-violet-500/20">
            <CardContent className="p-8">
              <Lock className="w-12 h-12 text-violet-400 mb-4" />
              <h3 className="text-xl font-bold text-foreground mb-2">Trusted by Industry Leaders</h3>
              <p className="text-muted-foreground mb-6">
                Join enterprises that rely on SITERANK AI for competitive intelligence.
              </p>
              <Button className="w-full rounded-full bg-violet-600 hover:bg-violet-500">
                Schedule a Call
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
