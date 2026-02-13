import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { FileText, BookOpen, AlignLeft, List, MessageSquare, Eye, ArrowRight } from 'lucide-react';

export default function ContentScorePage() {
  const features = [
    {
      icon: FileText,
      title: 'Word Count Analysis',
      description: 'Compare content length with competitors to ensure comprehensive coverage of topics.'
    },
    {
      icon: BookOpen,
      title: 'Readability Score',
      description: 'Evaluate reading level and complexity to match your target audience preferences.'
    },
    {
      icon: AlignLeft,
      title: 'Content Structure',
      description: 'Analyze paragraph distribution, whitespace usage, and content organization.'
    },
    {
      icon: List,
      title: 'List & Media Usage',
      description: 'Check usage of bullet points, numbered lists, images, and videos for engagement.'
    },
    {
      icon: MessageSquare,
      title: 'FAQ Detection',
      description: 'Identify FAQ sections and question-answer patterns for featured snippets potential.'
    },
    {
      icon: Eye,
      title: 'Content Freshness',
      description: 'Analyze publication dates and update frequency compared to competitors.'
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-transparent to-transparent" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20 mb-6">
              <FileText className="w-4 h-4 text-purple-400" />
              <span className="text-sm font-medium text-purple-400">Content Score</span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-foreground mb-6">
              Content Quality Analysis
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
              Content is king. Analyze your content quality, depth, and engagement factors compared to competitors. Create content that ranks and converts.
            </p>
            <Link to="/register">
              <Button size="lg" className="rounded-full bg-purple-600 hover:bg-purple-500 gap-2">
                Analyze Your Content
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-2xl font-bold text-foreground text-center mb-12">Content Metrics We Evaluate</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => (
            <Card key={feature.title} className="bg-card border-border hover:border-purple-500/50 transition-colors">
              <CardContent className="p-6">
                <div className="w-12 h-12 rounded-lg bg-purple-500/10 flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-purple-400" />
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
        <Card className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-purple-500/20">
          <CardContent className="p-8 sm:p-12 text-center">
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-4">
              Create content that outranks competitors
            </h2>
            <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
              Get detailed insights on how to improve your content strategy based on competitor analysis.
            </p>
            <Link to="/register">
              <Button size="lg" className="rounded-full bg-purple-600 hover:bg-purple-500">
                Start Content Analysis
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
