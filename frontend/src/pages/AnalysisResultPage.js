import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Progress } from '../components/ui/progress';
import { 
  Loader2, Download, ArrowLeft, CheckCircle2, 
  AlertCircle, TrendingUp, TrendingDown, Minus,
  Globe, Zap, FileText, Layout, RefreshCw
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts';
import axios from 'axios';
import { toast } from 'sonner';

const API_URL = process.env.REACT_APP_BACKEND_URL;

export default function AnalysisResultPage() {
  const { id } = useParams();
  const { getAuthHeader } = useAuth();
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    fetchAnalysis();
    
    // Poll for updates if processing
    const interval = setInterval(() => {
      if (analysis?.status === 'processing' || analysis?.status === 'pending') {
        fetchAnalysis(true);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [id]);

  useEffect(() => {
    if (analysis?.status === 'processing' || analysis?.status === 'pending') {
      const interval = setInterval(() => fetchAnalysis(true), 5000);
      return () => clearInterval(interval);
    }
  }, [analysis?.status]);

  const fetchAnalysis = async (silent = false) => {
    try {
      const response = await axios.get(
        `${API_URL}/api/analyses/${id}`,
        { headers: getAuthHeader() }
      );
      setAnalysis(response.data);
    } catch (error) {
      if (!silent) {
        toast.error('Failed to load analysis');
      }
    } finally {
      setLoading(false);
    }
  };

  const downloadReport = async () => {
    setDownloading(true);
    try {
      const response = await axios.get(
        `${API_URL}/api/analyses/${id}/report`,
        { 
          headers: getAuthHeader(),
          responseType: 'blob'
        }
      );
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `analysis_report_${id.slice(0, 8)}.txt`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      toast.success('Report downloaded successfully');
    } catch (error) {
      toast.error('Failed to download report');
    } finally {
      setDownloading(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 70) return 'text-green-600 dark:text-green-400';
    if (score >= 50) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getScoreBg = (score) => {
    if (score >= 70) return 'bg-green-100 dark:bg-green-900/30';
    if (score >= 50) return 'bg-yellow-100 dark:bg-yellow-900/30';
    return 'bg-red-100 dark:bg-red-900/30';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" data-testid="analysis-loading">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground">Loading analysis...</p>
        </div>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="min-h-screen flex items-center justify-center" data-testid="analysis-not-found">
        <div className="text-center space-y-4">
          <AlertCircle className="w-12 h-12 text-destructive mx-auto" />
          <h2 className="text-xl font-semibold">Analysis Not Found</h2>
          <Link to="/dashboard">
            <Button>Return to Dashboard</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (analysis.status === 'pending' || analysis.status === 'processing') {
    return (
      <div className="min-h-screen flex items-center justify-center" data-testid="analysis-processing">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="p-8 text-center space-y-6">
            <div className="relative">
              <Loader2 className="w-16 h-16 animate-spin text-primary mx-auto" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Globe className="w-6 h-6 text-primary" />
              </div>
            </div>
            <div>
              <h2 className="text-xl font-semibold mb-2">Analysis in Progress</h2>
              <p className="text-muted-foreground text-sm">
                We're scraping and analyzing the websites. This usually takes 1-2 minutes.
              </p>
            </div>
            <div className="space-y-2">
              <Progress value={analysis.status === 'processing' ? 60 : 20} className="h-2" />
              <p className="text-xs text-muted-foreground">
                {analysis.status === 'processing' ? 'Analyzing data...' : 'Starting analysis...'}
              </p>
            </div>
            <p className="text-xs text-muted-foreground">
              Analyzing: {analysis.user_site_url}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (analysis.status === 'failed') {
    return (
      <div className="min-h-screen flex items-center justify-center" data-testid="analysis-failed">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="p-8 text-center space-y-6">
            <AlertCircle className="w-16 h-16 text-destructive mx-auto" />
            <div>
              <h2 className="text-xl font-semibold mb-2">Analysis Failed</h2>
              <p className="text-muted-foreground text-sm">
                {analysis.ai_suggestions || 'Unable to complete the analysis. Please try again.'}
              </p>
            </div>
            <div className="flex gap-4 justify-center">
              <Link to="/dashboard">
                <Button variant="outline">Dashboard</Button>
              </Link>
              <Link to="/analyze">
                <Button>Try Again</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Prepare chart data
  const scores = analysis.user_site_scores;
  const comparisonData = [
    { name: 'Your Site', ...scores, fill: 'hsl(var(--primary))' },
    ...analysis.competitors.map((comp, i) => ({
      name: new URL(comp.url.startsWith('http') ? comp.url : `https://${comp.url}`).hostname.replace('www.', ''),
      ...comp.scores,
      fill: `hsl(var(--chart-${(i % 4) + 2}))`
    }))
  ];

  const barChartData = comparisonData.map(site => ({
    name: site.name.length > 15 ? site.name.slice(0, 15) + '...' : site.name,
    SEO: site.seo_score,
    Speed: site.speed_score,
    Content: site.content_score,
    UX: site.ux_score
  }));

  const radarData = [
    { metric: 'SEO', ...Object.fromEntries(comparisonData.map(s => [s.name, s.seo_score])) },
    { metric: 'Speed', ...Object.fromEntries(comparisonData.map(s => [s.name, s.speed_score])) },
    { metric: 'Content', ...Object.fromEntries(comparisonData.map(s => [s.name, s.content_score])) },
    { metric: 'UX', ...Object.fromEntries(comparisonData.map(s => [s.name, s.ux_score])) }
  ];

  return (
    <div className="min-h-screen pb-12" data-testid="analysis-result-page">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div className="flex items-center gap-4">
            <Link to="/dashboard">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight truncate max-w-md">
                {analysis.user_site_url}
              </h1>
              <p className="text-sm text-muted-foreground">
                Analyzed on {new Date(analysis.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => fetchAnalysis()} data-testid="refresh-btn">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
            <Button 
              size="sm" 
              onClick={downloadReport} 
              disabled={downloading}
              className="gap-2"
              data-testid="download-report-btn"
            >
              {downloading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Download className="w-4 h-4" />
              )}
              Download Report
            </Button>
          </div>
        </div>

        {/* Overall Score Card */}
        <Card className="mb-8" data-testid="overall-score-card">
          <CardContent className="p-6">
            <div className="grid md:grid-cols-5 gap-6 items-center">
              {/* Main Score */}
              <div className="md:col-span-1 text-center">
                <div className={`inline-flex items-center justify-center w-24 h-24 rounded-full ${getScoreBg(scores.overall_score)}`}>
                  <span className={`text-4xl font-bold ${getScoreColor(scores.overall_score)}`}>
                    {scores.overall_score}
                  </span>
                </div>
                <p className="mt-2 text-sm font-medium">Overall Score</p>
              </div>
              
              {/* Individual Scores */}
              <div className="md:col-span-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: 'SEO', score: scores.seo_score, icon: Globe },
                  { label: 'Speed', score: scores.speed_score, icon: Zap },
                  { label: 'Content', score: scores.content_score, icon: FileText },
                  { label: 'UX', score: scores.ux_score, icon: Layout }
                ].map(item => (
                  <div key={item.label} className="text-center p-4 rounded-lg bg-muted/50">
                    <item.icon className="w-5 h-5 mx-auto text-muted-foreground mb-2" />
                    <p className={`text-2xl font-bold ${getScoreColor(item.score)}`}>{item.score}</p>
                    <p className="text-xs text-muted-foreground mt-1">{item.label}</p>
                    <Progress 
                      value={item.score} 
                      className="h-1 mt-2"
                    />
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs defaultValue="comparison" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:inline-grid">
            <TabsTrigger value="comparison" data-testid="tab-comparison">Comparison</TabsTrigger>
            <TabsTrigger value="suggestions" data-testid="tab-suggestions">AI Suggestions</TabsTrigger>
            <TabsTrigger value="details" data-testid="tab-details">Details</TabsTrigger>
          </TabsList>

          {/* Comparison Tab */}
          <TabsContent value="comparison" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Bar Chart */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Score Comparison</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={barChartData} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis type="number" domain={[0, 100]} />
                        <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 12 }} />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: 'hsl(var(--card))',
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '8px'
                          }}
                        />
                        <Legend />
                        <Bar dataKey="SEO" fill="hsl(var(--chart-1))" radius={[0, 4, 4, 0]} />
                        <Bar dataKey="Speed" fill="hsl(var(--chart-2))" radius={[0, 4, 4, 0]} />
                        <Bar dataKey="Content" fill="hsl(var(--chart-3))" radius={[0, 4, 4, 0]} />
                        <Bar dataKey="UX" fill="hsl(var(--chart-4))" radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Radar Chart */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Performance Radar</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart data={radarData}>
                        <PolarGrid className="stroke-muted" />
                        <PolarAngleAxis dataKey="metric" tick={{ fontSize: 12 }} />
                        <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fontSize: 10 }} />
                        {comparisonData.map((site, i) => (
                          <Radar
                            key={site.name}
                            name={site.name}
                            dataKey={site.name}
                            stroke={i === 0 ? 'hsl(var(--primary))' : `hsl(var(--chart-${(i % 4) + 2}))`}
                            fill={i === 0 ? 'hsl(var(--primary))' : `hsl(var(--chart-${(i % 4) + 2}))`}
                            fillOpacity={0.2}
                          />
                        ))}
                        <Legend />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Competitor Cards */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Competitor Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analysis.competitors.map((comp, index) => (
                    <div 
                      key={index}
                      className="p-4 rounded-lg border bg-muted/30"
                      data-testid={`competitor-card-${index}`}
                    >
                      <div className="flex flex-col sm:flex-row justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium truncate">{comp.url}</h4>
                          {comp.title && (
                            <p className="text-sm text-muted-foreground truncate mt-1">{comp.title}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-6">
                          <div className="text-center">
                            <p className={`text-2xl font-bold ${getScoreColor(comp.scores.overall_score)}`}>
                              {comp.scores.overall_score}
                            </p>
                            <p className="text-xs text-muted-foreground">Overall</p>
                          </div>
                          <div className="flex items-center gap-1 text-sm">
                            {comp.scores.overall_score > scores.overall_score ? (
                              <>
                                <TrendingUp className="w-4 h-4 text-red-500" />
                                <span className="text-red-500">+{comp.scores.overall_score - scores.overall_score}</span>
                              </>
                            ) : comp.scores.overall_score < scores.overall_score ? (
                              <>
                                <TrendingDown className="w-4 h-4 text-green-500" />
                                <span className="text-green-500">{comp.scores.overall_score - scores.overall_score}</span>
                              </>
                            ) : (
                              <>
                                <Minus className="w-4 h-4 text-muted-foreground" />
                                <span className="text-muted-foreground">0</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* AI Suggestions Tab */}
          <TabsContent value="suggestions" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Zap className="w-5 h-5 text-primary" />
                  AI-Powered Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  <div 
                    className="whitespace-pre-wrap text-sm leading-relaxed"
                    data-testid="ai-suggestions"
                  >
                    {analysis.ai_suggestions || 'No suggestions available.'}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Action Plan */}
            {analysis.action_plan && analysis.action_plan.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                    Action Plan
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3" data-testid="action-plan">
                    {analysis.action_plan.map((action, index) => (
                      <li key={index} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-medium flex items-center justify-center">
                          {index + 1}
                        </span>
                        <span className="text-sm">{action}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Details Tab */}
          <TabsContent value="details" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* SEO Details */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Globe className="w-5 h-5" />
                    SEO Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <DetailRow label="Title" value={scores.seo_details?.title || 'N/A'} />
                  <DetailRow label="Title Length" value={`${scores.seo_details?.title_length || 0} chars`} />
                  <DetailRow label="Meta Description" value={`${scores.seo_details?.meta_description_length || 0} chars`} />
                  <DetailRow label="H1 Tags" value={scores.seo_details?.h1_count || 0} />
                  <DetailRow label="H2 Tags" value={scores.seo_details?.h2_count || 0} />
                  <DetailRow label="Image Alt Ratio" value={`${scores.seo_details?.image_alt_ratio || 0}%`} />
                  <DetailRow label="Structured Data" value={scores.seo_details?.structured_data ? 'Yes' : 'No'} />
                </CardContent>
              </Card>

              {/* Speed Details */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Zap className="w-5 h-5" />
                    Speed Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <DetailRow label="Load Time" value={`${scores.speed_details?.load_time || 0}s`} />
                  <DetailRow label="Page Size" value={`${scores.speed_details?.page_size_kb || 0} KB`} />
                  <DetailRow label="CSS Files" value={scores.speed_details?.css_files || 0} />
                  <DetailRow label="JS Files" value={scores.speed_details?.js_files || 0} />
                  <DetailRow label="Images" value={scores.speed_details?.image_count || 0} />
                  <DetailRow label="Compression" value={scores.speed_details?.has_compression ? 'Yes' : 'No'} />
                  <DetailRow label="Caching" value={scores.speed_details?.has_caching ? 'Yes' : 'No'} />
                </CardContent>
              </Card>

              {/* Content Details */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Content Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <DetailRow label="Word Count" value={scores.content_details?.word_count || 0} />
                  <DetailRow label="Unique Words" value={scores.content_details?.unique_words || 0} />
                  <DetailRow label="Paragraphs" value={scores.content_details?.paragraph_count || 0} />
                  <DetailRow label="Avg Paragraph Length" value={`${scores.content_details?.avg_paragraph_length || 0} words`} />
                  <DetailRow label="Has Blog" value={scores.content_details?.has_blog ? 'Yes' : 'No'} />
                  <DetailRow label="Has FAQ" value={scores.content_details?.has_faq ? 'Yes' : 'No'} />
                </CardContent>
              </Card>

              {/* UX Details */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Layout className="w-5 h-5" />
                    UX Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <DetailRow label="Mobile Viewport" value={scores.ux_details?.has_viewport_meta ? 'Yes' : 'No'} />
                  <DetailRow label="Favicon" value={scores.ux_details?.has_favicon ? 'Yes' : 'No'} />
                  <DetailRow label="Navigation" value={scores.ux_details?.navigation_elements || 0} />
                  <DetailRow label="Forms" value={scores.ux_details?.form_count || 0} />
                  <DetailRow label="Has Search" value={scores.ux_details?.has_search ? 'Yes' : 'No'} />
                  <DetailRow label="Social Links" value={scores.ux_details?.has_social_links ? 'Yes' : 'No'} />
                  <DetailRow label="Contact Info" value={scores.ux_details?.has_contact_info ? 'Yes' : 'No'} />
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function DetailRow({ label, value }) {
  return (
    <div className="flex justify-between py-1.5 border-b border-border/50 last:border-0">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium font-mono text-xs">{value}</span>
    </div>
  );
}
