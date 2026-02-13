import { Link } from 'react-router-dom';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { BookOpen, Clock, ArrowRight, TrendingUp, Search, Zap } from 'lucide-react';

export default function BlogPage() {
  const posts = [
    {
      title: 'How to Analyze Your Competitors in 2025',
      excerpt: 'Learn the essential steps to conduct a thorough competitive analysis and stay ahead in your market.',
      category: 'Strategy',
      readTime: '8 min read',
      date: 'Feb 10, 2025',
      icon: TrendingUp,
      color: 'emerald'
    },
    {
      title: '10 SEO Metrics That Actually Matter',
      excerpt: 'Cut through the noise and focus on the SEO metrics that drive real business results.',
      category: 'SEO',
      readTime: '6 min read',
      date: 'Feb 8, 2025',
      icon: Search,
      color: 'cyan'
    },
    {
      title: 'Website Speed: Why Every Millisecond Counts',
      excerpt: 'Discover how page speed impacts your rankings, conversions, and user experience.',
      category: 'Performance',
      readTime: '5 min read',
      date: 'Feb 5, 2025',
      icon: Zap,
      color: 'orange'
    },
    {
      title: 'Content Strategy Lessons from Top Performers',
      excerpt: 'What the best-ranking websites do differently with their content strategy.',
      category: 'Content',
      readTime: '7 min read',
      date: 'Feb 2, 2025',
      icon: BookOpen,
      color: 'purple'
    }
  ];

  const colorMap = {
    emerald: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    cyan: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
    orange: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
    purple: 'bg-purple-500/10 text-purple-400 border-purple-500/20'
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-6">
            <BookOpen className="w-4 h-4 text-emerald-400" />
            <span className="text-sm font-medium text-emerald-400">Blog</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-foreground mb-4">
            Insights & Resources
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Expert tips on competitive analysis, SEO, performance optimization, and growing your online presence.
          </p>
        </div>

        {/* Blog Posts Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {posts.map((post) => (
            <Card key={post.title} className="bg-card border-border hover:border-muted-foreground/30 transition-colors group cursor-pointer">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${colorMap[post.color]}`}>
                    <post.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <span className={`text-xs font-medium px-2 py-1 rounded ${colorMap[post.color]}`}>
                      {post.category}
                    </span>
                  </div>
                </div>
                <h2 className="text-xl font-semibold text-foreground mb-2 group-hover:text-emerald-400 transition-colors">
                  {post.title}
                </h2>
                <p className="text-muted-foreground text-sm mb-4">{post.excerpt}</p>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {post.readTime}
                  </div>
                  <span>{post.date}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Newsletter CTA */}
        <Card className="mt-12 bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 border-emerald-500/20">
          <CardContent className="p-8 sm:p-12 text-center">
            <h2 className="text-2xl font-bold text-foreground mb-4">
              Stay Updated
            </h2>
            <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
              Get the latest competitive analysis tips and industry insights delivered to your inbox.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-2 rounded-full bg-muted border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-emerald-500"
              />
              <Button className="rounded-full bg-emerald-600 hover:bg-emerald-500">
                Subscribe
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
