import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { 
  Eye, Globe, Loader2, CheckCircle, TrendingUp, TrendingDown,
  AlertTriangle, Lightbulb, Search, Zap, FileText, ArrowRight,
  Target, Award, BarChart3
} from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';

const API_URL = process.env.REACT_APP_BACKEND_URL;

export default function CompetitorAnalysisPage() {
  const { isAuthenticated, getAuthHeader } = useAuth();
  const [searchParams] = useSearchParams();
  const [competitorUrl, setCompetitorUrl] = useState(searchParams.get('url') || '');
  const [myUrl, setMyUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState(null);

  const handleAnalyze = async () => {
    if (!competitorUrl || !isAuthenticated) return;
    
    setLoading(true);
    setAnalysis(null);
    
    try {
      // Analyze competitor
      const [seoRes, speedRes, contentRes] = await Promise.all([
        axios.post(`${API_URL}/api/seo/analyze`, { url: competitorUrl }, { headers: getAuthHeader() }),
        axios.post(`${API_URL}/api/speed/analyze`, { url: competitorUrl }, { headers: getAuthHeader() }),
        axios.post(`${API_URL}/api/content/analyze`, { url: competitorUrl }, { headers: getAuthHeader() })
      ]);
      
      // If user provided their URL, analyze it too for comparison
      let myAnalysis = null;
      if (myUrl) {
        const [mySeo, mySpeed, myContent] = await Promise.all([
          axios.post(`${API_URL}/api/seo/analyze`, { url: myUrl }, { headers: getAuthHeader() }),
          axios.post(`${API_URL}/api/speed/analyze`, { url: myUrl }, { headers: getAuthHeader() }),
          axios.post(`${API_URL}/api/content/analyze`, { url: myUrl }, { headers: getAuthHeader() })
        ]);
        myAnalysis = {
          seo: mySeo.data,
          speed: mySpeed.data,
          content: myContent.data,
          overallScore: Math.round((mySeo.data.score + mySpeed.data.score + myContent.data.score) / 3)
        };
      }
      
      setAnalysis({
        competitor: {
          url: competitorUrl,
          seo: seoRes.data,
          speed: speedRes.data,
          content: contentRes.data,
          overallScore: Math.round((seoRes.data.score + speedRes.data.score + contentRes.data.score) / 3)
        },
        mine: myAnalysis,
        insights: generateInsights(seoRes.data, speedRes.data, contentRes.data, myAnalysis)
      });
      
      toast.success('Competitor analysis complete!');
    } catch (error) {
      toast.error('Failed to analyze competitor');
    } finally {
      setLoading(false);
    }
  };

  const generateInsights = (seo, speed, content, myAnalysis) => {
    const insights = [];
    
    // What competitor does well
    if (seo.score >= 80) {
      insights.push({
        type: 'strength',
        category: 'SEO',
        title: 'Strong SEO Foundation',
        description: 'This competitor has excellent SEO. Check their meta tags and schema markup.',
        action: 'Review their title tags and descriptions for inspiration.'
      });
    }
    
    if (speed.score >= 80) {
      insights.push({
        type: 'strength',
        category: 'Speed',
        title: 'Fast Loading Website',
        description: 'Competitor loads quickly, providing better user experience.',
        action: 'Implement caching and image optimization on your site.'
      });
    }
    
    if (content.metrics?.word_count >= 1500) {
      insights.push({
        type: 'strength',
        category: 'Content',
        title: 'In-Depth Content',
        description: `They have ${content.metrics.word_count} words of content. Comprehensive coverage helps rankings.`,
        action: 'Create longer, more detailed content on your pages.'
      });
    }
    
    // What competitor could improve (your opportunity)
    if (seo.score < 60) {
      insights.push({
        type: 'opportunity',
        category: 'SEO',
        title: 'SEO Weakness Detected',
        description: 'Competitor has poor SEO. This is your chance to outrank them.',
        action: 'Focus on optimizing your meta tags and site structure.'
      });
    }
    
    if (speed.score < 60) {
      insights.push({
        type: 'opportunity',
        category: 'Speed',
        title: 'Speed Advantage Available',
        description: 'Competitor site is slow. A faster site will rank better.',
        action: 'Ensure your site loads under 3 seconds.'
      });
    }
    
    // Comparison insights if user provided their URL
    if (myAnalysis) {
      const scoreDiff = myAnalysis.overallScore - Math.round((seo.score + speed.score + content.score) / 3);
      if (scoreDiff > 10) {
        insights.push({
          type: 'win',
          category: 'Overall',
          title: 'You\'re Ahead!',
          description: `Your site scores ${scoreDiff} points higher overall.`,
          action: 'Maintain your advantage by continuously improving.'
        });
      } else if (scoreDiff < -10) {
        insights.push({
          type: 'gap',
          category: 'Overall',
          title: 'Room for Improvement',
          description: `Competitor is ${Math.abs(scoreDiff)} points ahead of you.`,
          action: 'Focus on the weakest areas to close the gap.'
        });
      }
    }
    
    return insights;
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-emerald-400';
    if (score >= 60) return 'text-yellow-400';
    if (score >= 40) return 'text-orange-400';
    return 'text-red-400';
  };

  const getInsightIcon = (type) => {
    switch (type) {
      case 'strength': return <Award className="w-5 h-5 text-emerald-400" />;
      case 'opportunity': return <Target className="w-5 h-5 text-yellow-400" />;
      case 'win': return <TrendingUp className="w-5 h-5 text-emerald-400" />;
      case 'gap': return <TrendingDown className="w-5 h-5 text-orange-400" />;
      default: return <Lightbulb className="w-5 h-5 text-purple-400" />;
    }
  };

  const getInsightColor = (type) => {
    switch (type) {
      case 'strength': return 'border-emerald-500/30 bg-emerald-500/5';
      case 'opportunity': return 'border-yellow-500/30 bg-yellow-500/5';
      case 'win': return 'border-emerald-500/30 bg-emerald-500/5';
      case 'gap': return 'border-orange-500/30 bg-orange-500/5';
      default: return 'border-purple-500/30 bg-purple-500/5';
    }
  };

  return (
    <div className="min-h-screen bg-background" data-testid="competitor-analysis-page">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center">
            <Eye className="w-6 h-6 text-purple-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Competitor Intelligence</h1>
            <p className="text-muted-foreground">Discover what your competitors do well (and where they're weak)</p>
          </div>
        </div>

        {/* Input Section */}
        <Card className="bg-card border-border mb-8">
          <CardContent className="p-6 space-y-4">
            <div>
              <label className="text-sm text-muted-foreground mb-2 block">Competitor URL *</label>
              <div className="relative">
                <Eye className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-purple-400" />
                <Input
                  type="text"
                  placeholder="Enter competitor website URL"
                  value={competitorUrl}
                  onChange={(e) => setCompetitorUrl(e.target.value)}
                  className="pl-10 bg-muted border-border h-12"
                />
              </div>
            </div>
            
            <div>
              <label className="text-sm text-muted-foreground mb-2 block">Your URL (optional - for comparison)</label>
              <div className="relative">
                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-400" />
                <Input
                  type="text"
                  placeholder="Enter your website URL for comparison"
                  value={myUrl}
                  onChange={(e) => setMyUrl(e.target.value)}
                  className="pl-10 bg-muted border-border h-12"
                />
              </div>
            </div>
            
            <Button
              onClick={handleAnalyze}
              disabled={loading || !competitorUrl || !isAuthenticated}
              className="w-full h-12 bg-purple-600 hover:bg-purple-500 gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Analyzing Competitor...
                </>
              ) : (
                <>
                  <Eye className="w-5 h-5" />
                  Analyze Competitor
                </>
              )}
            </Button>
            
            {!isAuthenticated && (
              <p className="text-sm text-muted-foreground text-center">
                Please <a href="/login" className="text-purple-400 hover:underline">login</a> to continue
              </p>
            )}
          </CardContent>
        </Card>

        {/* Results */}
        {analysis && (
          <div className="space-y-6">
            {/* Score Comparison */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Competitor Scores */}
              <Card className="bg-gradient-to-br from-purple-500/10 to-purple-500/5 border-purple-500/30">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-purple-400">
                    <Eye className="w-5 h-5" />
                    Competitor
                  </CardTitle>
                  <p className="text-sm text-muted-foreground truncate">{analysis.competitor.url}</p>
                </CardHeader>
                <CardContent>
                  <div className="text-center mb-4">
                    <div className={`text-5xl font-bold ${getScoreColor(analysis.competitor.overallScore)}`}>
                      {analysis.competitor.overallScore}
                    </div>
                    <div className="text-sm text-muted-foreground">Overall Score</div>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <Search className="w-4 h-4 text-emerald-400 mx-auto mb-1" />
                      <div className={`font-bold ${getScoreColor(analysis.competitor.seo.score)}`}>
                        {analysis.competitor.seo.score}
                      </div>
                      <div className="text-xs text-muted-foreground">SEO</div>
                    </div>
                    <div>
                      <Zap className="w-4 h-4 text-cyan-400 mx-auto mb-1" />
                      <div className={`font-bold ${getScoreColor(analysis.competitor.speed.score)}`}>
                        {analysis.competitor.speed.score}
                      </div>
                      <div className="text-xs text-muted-foreground">Speed</div>
                    </div>
                    <div>
                      <FileText className="w-4 h-4 text-purple-400 mx-auto mb-1" />
                      <div className={`font-bold ${getScoreColor(analysis.competitor.content.score)}`}>
                        {analysis.competitor.content.score}
                      </div>
                      <div className="text-xs text-muted-foreground">Content</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Your Scores (if provided) */}
              {analysis.mine ? (
                <Card className="bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 border-emerald-500/30">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-emerald-400">
                      <Globe className="w-5 h-5" />
                      Your Site
                    </CardTitle>
                    <p className="text-sm text-muted-foreground truncate">{myUrl}</p>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center mb-4">
                      <div className={`text-5xl font-bold ${getScoreColor(analysis.mine.overallScore)}`}>
                        {analysis.mine.overallScore}
                      </div>
                      <div className="text-sm text-muted-foreground">Overall Score</div>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <Search className="w-4 h-4 text-emerald-400 mx-auto mb-1" />
                        <div className={`font-bold ${getScoreColor(analysis.mine.seo.score)}`}>
                          {analysis.mine.seo.score}
                        </div>
                        <div className="text-xs text-muted-foreground">SEO</div>
                      </div>
                      <div>
                        <Zap className="w-4 h-4 text-cyan-400 mx-auto mb-1" />
                        <div className={`font-bold ${getScoreColor(analysis.mine.speed.score)}`}>
                          {analysis.mine.speed.score}
                        </div>
                        <div className="text-xs text-muted-foreground">Speed</div>
                      </div>
                      <div>
                        <FileText className="w-4 h-4 text-purple-400 mx-auto mb-1" />
                        <div className={`font-bold ${getScoreColor(analysis.mine.content.score)}`}>
                          {analysis.mine.content.score}
                        </div>
                        <div className="text-xs text-muted-foreground">Content</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card className="bg-card border-border border-dashed flex items-center justify-center">
                  <CardContent className="text-center py-12">
                    <Globe className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                    <p className="text-muted-foreground mb-4">Add your URL above to compare scores</p>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Intelligence Insights */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="w-5 h-5 text-yellow-400" />
                  Competitive Intelligence
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {analysis.insights.map((insight, i) => (
                  <div key={i} className={`p-4 rounded-lg border ${getInsightColor(insight.type)}`}>
                    <div className="flex items-start gap-3">
                      {getInsightIcon(insight.type)}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-foreground">{insight.title}</span>
                          <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                            {insight.category}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{insight.description}</p>
                        <div className="flex items-center gap-2 text-sm">
                          <ArrowRight className="w-4 h-4 text-emerald-400" />
                          <span className="text-emerald-400 font-medium">{insight.action}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* What They Have */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-purple-400" />
                  What Competitor Has
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-4 bg-muted/30 rounded-lg text-center">
                    <div className="text-2xl font-bold text-foreground">
                      {analysis.competitor.content.metrics?.word_count || 0}
                    </div>
                    <div className="text-sm text-muted-foreground">Words</div>
                  </div>
                  <div className="p-4 bg-muted/30 rounded-lg text-center">
                    <div className="text-2xl font-bold text-foreground">
                      {analysis.competitor.content.metrics?.headings || 0}
                    </div>
                    <div className="text-sm text-muted-foreground">Headings</div>
                  </div>
                  <div className="p-4 bg-muted/30 rounded-lg text-center">
                    <div className="text-2xl font-bold text-foreground">
                      {analysis.competitor.speed.metrics?.load_time?.toFixed(1) || 0}s
                    </div>
                    <div className="text-sm text-muted-foreground">Load Time</div>
                  </div>
                  <div className="p-4 bg-muted/30 rounded-lg text-center">
                    <div className="text-2xl font-bold text-foreground">
                      {analysis.competitor.seo.meta?.title ? '✓' : '✗'}
                    </div>
                    <div className="text-sm text-muted-foreground">Meta Title</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Call to Action */}
            <Card className="bg-gradient-to-r from-emerald-500/10 via-cyan-500/10 to-purple-500/10 border-emerald-500/20">
              <CardContent className="p-6 text-center">
                <h3 className="text-xl font-bold text-foreground mb-2">Ready to Outrank Them?</h3>
                <p className="text-muted-foreground mb-4">
                  Use these insights to improve YOUR website. Generate fixes for your own site.
                </p>
                <Button
                  onClick={() => window.location.href = '/analyze/my-site'}
                  className="bg-emerald-600 hover:bg-emerald-500 gap-2"
                >
                  Analyze My Site
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
