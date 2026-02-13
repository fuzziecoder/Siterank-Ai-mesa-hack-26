import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { 
  Rocket, Loader2, Globe, Zap, Target, Calendar, TrendingUp, 
  AlertTriangle, CheckCircle, Clock, ArrowRight, Sparkles,
  ChevronDown, ChevronUp, Copy, Check
} from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';

const API_URL = process.env.REACT_APP_BACKEND_URL;

export default function OptimizePage() {
  const { getAuthHeader } = useAuth();
  const navigate = useNavigate();
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [blueprint, setBlueprint] = useState(null);
  const [userScores, setUserScores] = useState(null);
  const [competitors, setCompetitors] = useState([]);
  const [expandedSections, setExpandedSections] = useState({
    critical: true,
    quickWins: true,
    sevenDay: false,
    thirtyDay: false,
    competitor: false
  });
  const [copiedId, setCopiedId] = useState(null);

  const handleOptimize = async () => {
    if (!url) {
      toast.error('Please enter a website URL');
      return;
    }

    setLoading(true);
    setBlueprint(null);

    try {
      const response = await axios.post(
        `${API_URL}/api/optimize`,
        { 
          user_site_url: url,
          auto_detect_competitors: true
        },
        { headers: getAuthHeader() }
      );

      setBlueprint(response.data.blueprint);
      setUserScores(response.data.user_scores);
      setCompetitors(response.data.competitors);
      toast.success('Optimization blueprint generated!');
    } catch (error) {
      const message = error.response?.data?.detail || 'Failed to generate optimization';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const toggleSection = (section) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success('Copied to clipboard!');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'critical': return 'text-red-400 bg-red-500/10 border-red-500/20';
      case 'needs_work': return 'text-orange-400 bg-orange-500/10 border-orange-500/20';
      case 'good': return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
      case 'excellent': return 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20';
      default: return 'text-gray-400 bg-gray-500/10 border-gray-500/20';
    }
  };

  const getImpactColor = (impact) => {
    switch (impact) {
      case 'critical': return 'bg-red-500/20 text-red-400';
      case 'high': return 'bg-orange-500/20 text-orange-400';
      case 'medium': return 'bg-yellow-500/20 text-yellow-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case 'seo': return 'bg-emerald-500/20 text-emerald-400';
      case 'speed': return 'bg-cyan-500/20 text-cyan-400';
      case 'content': return 'bg-purple-500/20 text-purple-400';
      case 'ux': return 'bg-orange-500/20 text-orange-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  return (
    <div className="min-h-screen bg-background" data-testid="optimize-page">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 border border-emerald-500/20 mb-4">
            <Rocket className="w-4 h-4 text-emerald-400" />
            <span className="text-sm font-medium text-emerald-400">AI Optimization Engine</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground mb-3">
            Optimize Your Website
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Get a comprehensive AI-powered optimization blueprint with critical fixes, quick wins, and a 30-day growth strategy.
          </p>
        </div>

        {/* URL Input */}
        {!blueprint && (
          <Card className="bg-card border-border max-w-2xl mx-auto mb-8">
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative">
                  <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Enter your website URL (e.g., example.com)"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    disabled={loading}
                    className="pl-10 bg-muted border-border h-12"
                    data-testid="optimize-url-input"
                  />
                </div>
                <Button
                  onClick={handleOptimize}
                  disabled={loading || !url}
                  className="h-12 px-8 rounded-full bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 gap-2"
                  data-testid="optimize-btn"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5" />
                      Optimize My Site
                    </>
                  )}
                </Button>
              </div>
              {loading && (
                <div className="mt-4 text-center">
                  <p className="text-sm text-muted-foreground">
                    Analyzing your website, detecting competitors, and generating AI recommendations...
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">This may take 30-60 seconds</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Blueprint Results */}
        {blueprint && (
          <div className="space-y-6">
            {/* Overall Health Card */}
            <Card className={`border ${getStatusColor(blueprint.overall_health?.status)}`}>
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className={`w-20 h-20 rounded-2xl flex items-center justify-center ${getStatusColor(blueprint.overall_health?.status)}`}>
                      <span className="text-3xl font-bold">{blueprint.overall_health?.score || 0}</span>
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-foreground capitalize">
                        {blueprint.overall_health?.status?.replace('_', ' ') || 'Analysis Complete'}
                      </h2>
                      <p className="text-muted-foreground text-sm mt-1">
                        {blueprint.overall_health?.summary}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setBlueprint(null);
                        setUrl('');
                      }}
                      className="border-border"
                    >
                      New Analysis
                    </Button>
                  </div>
                </div>

                {/* Predicted Improvements */}
                {blueprint.predicted_improvements && (
                  <div className="mt-6 grid grid-cols-2 sm:grid-cols-5 gap-4">
                    <div className="text-center p-3 rounded-lg bg-emerald-500/10">
                      <p className="text-lg font-bold text-emerald-400">{blueprint.predicted_improvements.seo_score}</p>
                      <p className="text-xs text-muted-foreground">SEO</p>
                    </div>
                    <div className="text-center p-3 rounded-lg bg-cyan-500/10">
                      <p className="text-lg font-bold text-cyan-400">{blueprint.predicted_improvements.speed_score}</p>
                      <p className="text-xs text-muted-foreground">Speed</p>
                    </div>
                    <div className="text-center p-3 rounded-lg bg-purple-500/10">
                      <p className="text-lg font-bold text-purple-400">{blueprint.predicted_improvements.content_score}</p>
                      <p className="text-xs text-muted-foreground">Content</p>
                    </div>
                    <div className="text-center p-3 rounded-lg bg-orange-500/10">
                      <p className="text-lg font-bold text-orange-400">{blueprint.predicted_improvements.overall_score}</p>
                      <p className="text-xs text-muted-foreground">Overall</p>
                    </div>
                    <div className="text-center p-3 rounded-lg bg-pink-500/10">
                      <p className="text-lg font-bold text-pink-400">{blueprint.predicted_improvements.estimated_traffic_increase}</p>
                      <p className="text-xs text-muted-foreground">Traffic</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Critical Fixes */}
            <Card className="bg-card border-border">
              <CardHeader 
                className="cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => toggleSection('critical')}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center">
                      <AlertTriangle className="w-5 h-5 text-red-400" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">Critical Fixes</CardTitle>
                      <CardDescription>Top 5 issues to fix immediately</CardDescription>
                    </div>
                  </div>
                  {expandedSections.critical ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </div>
              </CardHeader>
              {expandedSections.critical && (
                <CardContent className="pt-0 space-y-4">
                  {blueprint.critical_fixes?.map((fix, index) => (
                    <div key={fix.id || index} className="p-4 rounded-lg bg-muted/50 border border-border">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className={`px-2 py-0.5 rounded text-xs font-medium ${getCategoryColor(fix.category)}`}>
                              {fix.category?.toUpperCase()}
                            </span>
                            <span className={`px-2 py-0.5 rounded text-xs font-medium ${getImpactColor(fix.impact)}`}>
                              {fix.impact?.toUpperCase()} IMPACT
                            </span>
                          </div>
                          <h4 className="font-semibold text-foreground">{fix.title}</h4>
                          <p className="text-sm text-muted-foreground mt-1">{fix.description}</p>
                          <div className="mt-3 p-3 rounded bg-background border border-border">
                            <p className="text-xs text-muted-foreground mb-1">Fix:</p>
                            <p className="text-sm text-foreground">{fix.fix}</p>
                          </div>
                          <p className="text-xs text-emerald-400 mt-2">
                            Expected: {fix.expected_improvement}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => copyToClipboard(fix.fix, `fix-${index}`)}
                          className="flex-shrink-0"
                        >
                          {copiedId === `fix-${index}` ? (
                            <Check className="w-4 h-4 text-emerald-400" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  ))}
                </CardContent>
              )}
            </Card>

            {/* Quick Wins */}
            <Card className="bg-card border-border">
              <CardHeader 
                className="cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => toggleSection('quickWins')}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                      <Zap className="w-5 h-5 text-emerald-400" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">Quick Wins (24 Hours)</CardTitle>
                      <CardDescription>Fast improvements you can make today</CardDescription>
                    </div>
                  </div>
                  {expandedSections.quickWins ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </div>
              </CardHeader>
              {expandedSections.quickWins && (
                <CardContent className="pt-0">
                  <div className="grid md:grid-cols-2 gap-4">
                    {blueprint.quick_wins?.map((win, index) => (
                      <div key={win.id || index} className="p-4 rounded-lg bg-muted/50 border border-border">
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`px-2 py-0.5 rounded text-xs font-medium ${getCategoryColor(win.category)}`}>
                            {win.category?.toUpperCase()}
                          </span>
                          <span className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock className="w-3 h-3" />
                            {win.time_to_implement}
                          </span>
                        </div>
                        <h4 className="font-semibold text-foreground">{win.title}</h4>
                        <p className="text-sm text-muted-foreground mt-1">{win.description}</p>
                        <div className="mt-3 space-y-1">
                          {win.action_steps?.map((step, i) => (
                            <div key={i} className="flex items-center gap-2 text-sm">
                              <CheckCircle className="w-3 h-3 text-emerald-400 flex-shrink-0" />
                              <span className="text-muted-foreground">{step}</span>
                            </div>
                          ))}
                        </div>
                        <p className="text-xs text-emerald-400 mt-2">{win.expected_result}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              )}
            </Card>

            {/* 7-Day Plan */}
            <Card className="bg-card border-border">
              <CardHeader 
                className="cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => toggleSection('sevenDay')}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-cyan-500/10 flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-cyan-400" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">7-Day Action Plan</CardTitle>
                      <CardDescription>Day-by-day optimization roadmap</CardDescription>
                    </div>
                  </div>
                  {expandedSections.sevenDay ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </div>
              </CardHeader>
              {expandedSections.sevenDay && (
                <CardContent className="pt-0">
                  <div className="space-y-3">
                    {blueprint.seven_day_plan?.map((day, index) => (
                      <div key={index} className="flex gap-4 p-4 rounded-lg bg-muted/50 border border-border">
                        <div className="w-12 h-12 rounded-lg bg-cyan-500/10 flex items-center justify-center flex-shrink-0">
                          <span className="text-lg font-bold text-cyan-400">{day.day}</span>
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-foreground">{day.focus}</h4>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {day.tasks?.map((task, i) => (
                              <span key={i} className="px-2 py-1 rounded text-xs bg-background border border-border text-muted-foreground">
                                {task}
                              </span>
                            ))}
                          </div>
                          <p className="text-xs text-cyan-400 mt-2">Goal: {day.goal}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              )}
            </Card>

            {/* 30-Day Strategy */}
            <Card className="bg-card border-border">
              <CardHeader 
                className="cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => toggleSection('thirtyDay')}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                      <Target className="w-5 h-5 text-purple-400" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">30-Day Growth Strategy</CardTitle>
                      <CardDescription>Long-term optimization roadmap</CardDescription>
                    </div>
                  </div>
                  {expandedSections.thirtyDay ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </div>
              </CardHeader>
              {expandedSections.thirtyDay && (
                <CardContent className="pt-0">
                  <div className="grid md:grid-cols-2 gap-4">
                    {Object.entries(blueprint.thirty_day_strategy || {}).map(([week, data], index) => (
                      <div key={week} className="p-4 rounded-lg bg-muted/50 border border-border">
                        <div className="flex items-center gap-2 mb-3">
                          <div className="w-8 h-8 rounded-full bg-purple-500/10 flex items-center justify-center">
                            <span className="text-sm font-bold text-purple-400">{index + 1}</span>
                          </div>
                          <h4 className="font-semibold text-foreground capitalize">{week.replace(/(\d)/, ' $1')}</h4>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{data.theme}</p>
                        <div className="space-y-1 mb-2">
                          {data.objectives?.map((obj, i) => (
                            <div key={i} className="flex items-center gap-2 text-sm">
                              <ArrowRight className="w-3 h-3 text-purple-400" />
                              <span className="text-muted-foreground">{obj}</span>
                            </div>
                          ))}
                        </div>
                        <p className="text-xs text-purple-400">{data.expected_outcome}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              )}
            </Card>

            {/* Competitor Insights */}
            <Card className="bg-card border-border">
              <CardHeader 
                className="cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => toggleSection('competitor')}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center">
                      <TrendingUp className="w-5 h-5 text-orange-400" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">Competitor Insights</CardTitle>
                      <CardDescription>How to outrank your competition</CardDescription>
                    </div>
                  </div>
                  {expandedSections.competitor ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </div>
              </CardHeader>
              {expandedSections.competitor && blueprint.competitor_insights && (
                <CardContent className="pt-0">
                  <div className="grid md:grid-cols-2 gap-4 mb-4">
                    <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                      <h4 className="font-semibold text-emerald-400 mb-2">Your Advantages</h4>
                      <div className="space-y-1">
                        {blueprint.competitor_insights.your_advantages?.map((adv, i) => (
                          <div key={i} className="flex items-center gap-2 text-sm">
                            <CheckCircle className="w-3 h-3 text-emerald-400" />
                            <span className="text-muted-foreground">{adv}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="p-4 rounded-lg bg-orange-500/10 border border-orange-500/20">
                      <h4 className="font-semibold text-orange-400 mb-2">Areas to Improve</h4>
                      <div className="space-y-1">
                        {blueprint.competitor_insights.areas_to_improve?.map((area, i) => (
                          <div key={i} className="flex items-center gap-2 text-sm">
                            <AlertTriangle className="w-3 h-3 text-orange-400" />
                            <span className="text-muted-foreground">{area}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="p-4 rounded-lg bg-muted/50 border border-border">
                    <h4 className="font-semibold text-foreground mb-2">Outrank Strategy</h4>
                    <p className="text-sm text-muted-foreground">{blueprint.competitor_insights.outrank_strategy}</p>
                  </div>
                </CardContent>
              )}
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
