import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { 
  BarChart3, TrendingUp, History, Plus, 
  ArrowRight, Loader2, AlertCircle, CheckCircle2, Clock
} from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart
} from 'recharts';
import axios from 'axios';
import { toast } from 'sonner';

const API_URL = process.env.REACT_APP_BACKEND_URL;

export default function DashboardPage() {
  const { user, getAuthHeader } = useAuth();
  const [stats, setStats] = useState(null);
  const [recentAnalyses, setRecentAnalyses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [statsRes, analysesRes] = await Promise.all([
        axios.get(`${API_URL}/api/dashboard/stats`, { headers: getAuthHeader() }),
        axios.get(`${API_URL}/api/analyses?limit=10`, { headers: getAuthHeader() })
      ]);
      setStats(statsRes.data);
      setRecentAnalyses(analysesRes.data);
    } catch (error) {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      completed: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
      processing: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      pending: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
      failed: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
    };
    const icons = {
      completed: <CheckCircle2 className="w-3 h-3" />,
      processing: <Loader2 className="w-3 h-3 animate-spin" />,
      pending: <Clock className="w-3 h-3" />,
      failed: <AlertCircle className="w-3 h-3" />
    };
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${styles[status] || styles.pending}`}>
        {icons[status]}
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  // Prepare chart data from recent analyses
  const chartData = recentAnalyses
    .filter(a => a.status === 'completed' && a.overall_score > 0)
    .slice(0, 7)
    .reverse()
    .map((a, index) => ({
      name: new Date(a.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      score: a.overall_score,
      url: a.user_site_url
    }));

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" data-testid="dashboard-loading">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen" data-testid="dashboard-page">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Welcome back, {user?.name?.split(' ')[0]}
            </h1>
            <p className="text-muted-foreground mt-1">
              Here's an overview of your website analysis activity
            </p>
          </div>
          <Link to="/analyze">
            <Button className="rounded-full gap-2" data-testid="new-analysis-cta">
              <Plus className="w-4 h-4" />
              New Analysis
            </Button>
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card data-testid="stat-total">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Analyses</p>
                  <p className="text-3xl font-bold mt-1">{stats?.total_analyses || 0}</p>
                </div>
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                  <BarChart3 className="w-6 h-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card data-testid="stat-completed">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Completed</p>
                  <p className="text-3xl font-bold mt-1">{stats?.completed_analyses || 0}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card data-testid="stat-avg-score">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Avg. Score</p>
                  <p className="text-3xl font-bold mt-1">{stats?.avg_score || 0}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card data-testid="stat-best-score">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Best Score</p>
                  <p className="text-3xl font-bold mt-1">{stats?.best_score || 0}</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Score Trend Chart */}
        {chartData.length > 1 && (
          <Card className="mb-8" data-testid="score-trend-chart">
            <CardHeader>
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                Score Trend
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis 
                      dataKey="name" 
                      tick={{ fontSize: 12 }}
                      className="text-muted-foreground"
                    />
                    <YAxis 
                      domain={[0, 100]} 
                      tick={{ fontSize: 12 }}
                      className="text-muted-foreground"
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                      formatter={(value, name) => [value, 'Score']}
                      labelFormatter={(label) => `Date: ${label}`}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="score" 
                      stroke="hsl(var(--primary))" 
                      strokeWidth={2}
                      fill="url(#scoreGradient)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Recent Analyses */}
        <Card data-testid="recent-analyses">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-semibold">Recent Analyses</CardTitle>
            <Link to="/history">
              <Button variant="ghost" size="sm" className="gap-1" data-testid="view-all-btn">
                View All
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {recentAnalyses.length === 0 ? (
              <div className="text-center py-12">
                <History className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
                <h3 className="font-medium mb-2">No analyses yet</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Start by analyzing your first website
                </p>
                <Link to="/analyze">
                  <Button className="rounded-full gap-2" data-testid="empty-state-cta">
                    <Plus className="w-4 h-4" />
                    Start Analysis
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {recentAnalyses.slice(0, 5).map((analysis) => (
                  <Link 
                    key={analysis.id}
                    to={`/analysis/${analysis.id}`}
                    className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors"
                    data-testid={`analysis-item-${analysis.id}`}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{analysis.user_site_url}</p>
                      <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                        <span>{analysis.competitor_count} competitors</span>
                        <span>•</span>
                        <span>{new Date(analysis.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      {analysis.status === 'completed' && (
                        <div className="text-right hidden sm:block">
                          <p className="text-2xl font-bold">{analysis.overall_score}</p>
                          <p className="text-xs text-muted-foreground">Score</p>
                        </div>
                      )}
                      {getStatusBadge(analysis.status)}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
