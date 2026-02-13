import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Zap, Clock, HardDrive, Gauge, FileCode, Server, ArrowRight } from 'lucide-react';

export default function SpeedMetricsPage() {
  const metrics = [
    {
      icon: Clock,
      title: 'Load Time Analysis',
      description: 'Measure total page load time and time to first byte (TTFB) for performance insights.'
    },
    {
      icon: HardDrive,
      title: 'Page Size Audit',
      description: 'Analyze total page weight including HTML, CSS, JavaScript, and media assets.'
    },
    {
      icon: FileCode,
      title: 'Resource Optimization',
      description: 'Identify unminified scripts, uncompressed assets, and render-blocking resources.'
    },
    {
      icon: Gauge,
      title: 'Core Web Vitals',
      description: 'Track LCP, FID, and CLS metrics that impact user experience and rankings.'
    },
    {
      icon: Server,
      title: 'Server Response',
      description: 'Evaluate server response times and identify backend performance bottlenecks.'
    },
    {
      icon: Zap,
      title: 'Caching Analysis',
      description: 'Check browser caching, CDN usage, and compression settings for faster delivery.'
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-transparent to-transparent" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/20 mb-6">
              <Zap className="w-4 h-4 text-cyan-400" />
              <span className="text-sm font-medium text-cyan-400">Speed Metrics</span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-foreground mb-6">
              Performance Speed Analysis
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
              Speed matters. Analyze your website's performance metrics and see how you stack up against competitors. Faster sites rank higher and convert better.
            </p>
            <Link to="/register">
              <Button size="lg" className="rounded-full bg-cyan-600 hover:bg-cyan-500 gap-2">
                Test Your Speed
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-2xl font-bold text-foreground text-center mb-12">Performance Metrics We Track</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {metrics.map((metric) => (
            <Card key={metric.title} className="bg-card border-border hover:border-cyan-500/50 transition-colors">
              <CardContent className="p-6">
                <div className="w-12 h-12 rounded-lg bg-cyan-500/10 flex items-center justify-center mb-4">
                  <metric.icon className="w-6 h-6 text-cyan-400" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">{metric.title}</h3>
                <p className="text-muted-foreground text-sm">{metric.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Stats Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid sm:grid-cols-3 gap-8 text-center">
          <div>
            <div className="text-4xl font-bold text-cyan-400 mb-2">53%</div>
            <p className="text-muted-foreground">of visitors leave if a page takes more than 3 seconds to load</p>
          </div>
          <div>
            <div className="text-4xl font-bold text-cyan-400 mb-2">2x</div>
            <p className="text-muted-foreground">faster sites see double the conversion rates</p>
          </div>
          <div>
            <div className="text-4xl font-bold text-cyan-400 mb-2">100ms</div>
            <p className="text-muted-foreground">delay can decrease conversions by 7%</p>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <Card className="bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border-cyan-500/20">
          <CardContent className="p-8 sm:p-12 text-center">
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-4">
              Is your site fast enough?
            </h2>
            <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
              Compare your website speed against competitors and get recommendations to improve.
            </p>
            <Link to="/register">
              <Button size="lg" className="rounded-full bg-cyan-600 hover:bg-cyan-500">
                Analyze Speed Now
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
