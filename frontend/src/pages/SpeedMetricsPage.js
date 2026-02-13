import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { 
  Zap, Globe, Loader2, AlertTriangle, CheckCircle, Copy, Check,
  Wand2, Download, ChevronDown, ChevronUp, Timer, HardDrive, Image, Server
} from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';

const API_URL = process.env.REACT_APP_BACKEND_URL;

export default function SpeedMetricsPage() {
  const { isAuthenticated, getAuthHeader } = useAuth();
  const [url, setUrl] = useState('');
  const [serverType, setServerType] = useState('nginx');
  const [loading, setLoading] = useState(false);
  const [fixingAll, setFixingAll] = useState(false);
  const [fixingIssue, setFixingIssue] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [fixes, setFixes] = useState(null);
  const [copiedId, setCopiedId] = useState(null);
  const [expandedFixes, setExpandedFixes] = useState({});

  const handleAnalyze = async () => {
    if (!url) {
      toast.error('Please enter a website URL');
      return;
    }

    if (!isAuthenticated) {
      toast.error('Please login to use the speed analyzer');
      return;
    }

    setLoading(true);
    setAnalysis(null);
    setFixes(null);

    try {
      const response = await axios.post(
        `${API_URL}/api/speed/analyze`,
        { url },
        { headers: getAuthHeader() }
      );
      setAnalysis(response.data);
      toast.success('Speed analysis complete!');
    } catch (error) {
      const message = error.response?.data?.detail || 'Failed to analyze website';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleFixAll = async () => {
    if (!analysis?.issues?.length) return;
    
    setFixingAll(true);
    try {
      const issueNames = analysis.issues.map(i => i.issue || i.name || i.type);
      const response = await axios.post(`${API_URL}/api/fix/speed`, {
        url: url,
        issues: issueNames,
        server_type: serverType
      });
      
      setFixes(response.data.fixes);
      const expanded = {};
      response.data.fixes.forEach((_, i) => expanded[i] = true);
      setExpandedFixes(expanded);
      toast.success(`Generated ${response.data.fixes.length} fixes!`);
    } catch (error) {
      toast.error('Failed to generate fixes');
    } finally {
      setFixingAll(false);
    }
  };

  const handleFixSingle = async (issue, index) => {
    setFixingIssue(index);
    try {
      const response = await axios.post(`${API_URL}/api/fix/speed`, {
        url: url,
        issues: [issue.issue || issue.name || issue.type],
        server_type: serverType
      });
      
      const newFix = response.data.fixes[0];
      setFixes(prev => {
        const updated = prev ? [...prev] : [];
        updated[index] = newFix;
        return updated;
      });
      setExpandedFixes(prev => ({ ...prev, [index]: true }));
      toast.success('Fix generated!');
    } catch (error) {
      toast.error('Failed to generate fix');
    } finally {
      setFixingIssue(null);
    }
  };

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success('Copied to clipboard!');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const downloadAllFixes = () => {
    if (!fixes?.length) return;
    
    let content = `# SITERANK AI - Speed Fixes for ${url}\n`;
    content += `# Server Type: ${serverType}\n`;
    content += `# Generated: ${new Date().toISOString()}\n\n`;
    
    fixes.forEach((fix, i) => {
      content += `# Fix ${i + 1}: ${fix.issue}\n`;
      content += `# ${fix.instructions}\n`;
      if (fix.config_type) content += `# Config: ${fix.config_type}\n`;
      content += `${fix.fixed_code}\n\n`;
    });
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url_blob = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url_blob;
    a.download = `speed-fixes-${serverType}.conf`;
    a.click();
    URL.revokeObjectURL(url_blob);
    toast.success('Fixes downloaded!');
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-emerald-400';
    if (score >= 60) return 'text-yellow-400';
    if (score >= 40) return 'text-orange-400';
    return 'text-red-400';
  };

  const getMetricStatus = (value, good, bad) => {
    if (value <= good) return 'text-emerald-400';
    if (value >= bad) return 'text-red-400';
    return 'text-yellow-400';
  };

  return (
    <div className="min-h-screen bg-background" data-testid="speed-metrics-page">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/20 mb-4">
            <Zap className="w-4 h-4 text-cyan-400" />
            <span className="text-sm font-medium text-cyan-400">AI Performance Optimizer</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground mb-3">
            Speed Metrics & Auto-Fix
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Analyze performance → Get server configs & code → Copy & deploy
          </p>
        </div>

        {/* URL Input */}
        <Card className="bg-card border-border max-w-3xl mx-auto mb-8">
          <CardContent className="p-6 space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Enter website URL (e.g., example.com)"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  disabled={loading}
                  className="pl-10 bg-muted border-border h-12"
                  data-testid="speed-url-input"
                />
              </div>
              <Button
                onClick={handleAnalyze}
                disabled={loading || !url || !isAuthenticated}
                className="h-12 px-8 rounded-full bg-cyan-600 hover:bg-cyan-500 gap-2"
                data-testid="speed-analyze-btn"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Zap className="w-5 h-5" />
                    Analyze Speed
                  </>
                )}
              </Button>
            </div>
            
            {/* Server Type Selection */}
            <div className="flex items-center gap-4">
              <Server className="w-5 h-5 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Server Type:</span>
              <div className="flex gap-2">
                {['nginx', 'apache', 'node'].map(type => (
                  <button
                    key={type}
                    onClick={() => setServerType(type)}
                    className={`px-3 py-1 rounded-full text-sm transition-colors ${
                      serverType === type 
                        ? 'bg-cyan-600 text-white' 
                        : 'bg-muted text-muted-foreground hover:bg-muted/80'
                    }`}
                  >
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </button>
                ))}
              </div>
            </div>
            
            {!isAuthenticated && (
              <p className="text-sm text-muted-foreground text-center">
                Please <a href="/login" className="text-cyan-400 hover:underline">login</a> to use the speed analyzer
              </p>
            )}
          </CardContent>
        </Card>

        {/* Results */}
        {analysis && (
          <div className="space-y-6">
            {/* Metrics Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="bg-card border-border">
                <CardContent className="p-4 text-center">
                  <Timer className="w-6 h-6 text-cyan-400 mx-auto mb-2" />
                  <div className={`text-2xl font-bold ${getMetricStatus(analysis.metrics?.load_time || 0, 2, 5)}`}>
                    {analysis.metrics?.load_time?.toFixed(2) || '0'}s
                  </div>
                  <div className="text-sm text-muted-foreground">Load Time</div>
                </CardContent>
              </Card>
              <Card className="bg-card border-border">
                <CardContent className="p-4 text-center">
                  <HardDrive className="w-6 h-6 text-cyan-400 mx-auto mb-2" />
                  <div className={`text-2xl font-bold ${getMetricStatus(analysis.metrics?.page_size || 0, 1000, 3000)}`}>
                    {((analysis.metrics?.page_size || 0) / 1024).toFixed(0)}KB
                  </div>
                  <div className="text-sm text-muted-foreground">Page Size</div>
                </CardContent>
              </Card>
              <Card className="bg-card border-border">
                <CardContent className="p-4 text-center">
                  <Image className="w-6 h-6 text-cyan-400 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-foreground">
                    {analysis.metrics?.images || 0}
                  </div>
                  <div className="text-sm text-muted-foreground">Images</div>
                </CardContent>
              </Card>
              <Card className="bg-card border-border">
                <CardContent className="p-4 text-center">
                  <Zap className="w-6 h-6 text-cyan-400 mx-auto mb-2" />
                  <div className={`text-2xl font-bold ${getScoreColor(analysis.score)}`}>
                    {analysis.score}/100
                  </div>
                  <div className="text-sm text-muted-foreground">Speed Score</div>
                </CardContent>
              </Card>
            </div>

            {/* Fix All Button */}
            {analysis.issues?.length > 0 && (
              <Card className="bg-card border-border">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-semibold text-foreground">
                        {analysis.issues.length} Performance Issues Found
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Generate optimized configs for {serverType.charAt(0).toUpperCase() + serverType.slice(1)}
                      </p>
                    </div>
                    <div className="flex gap-3">
                      <Button
                        onClick={handleFixAll}
                        disabled={fixingAll}
                        className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 gap-2"
                        data-testid="fix-all-speed-btn"
                      >
                        {fixingAll ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Generating...
                          </>
                        ) : (
                          <>
                            <Wand2 className="w-4 h-4" />
                            Fix All Issues
                          </>
                        )}
                      </Button>
                      {fixes?.length > 0 && (
                        <Button
                          onClick={downloadAllFixes}
                          variant="outline"
                          className="gap-2"
                        >
                          <Download className="w-4 h-4" />
                          Download Config
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Issues List */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-orange-400" />
                  Performance Issues
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {analysis.issues?.length === 0 ? (
                  <div className="flex items-center gap-3 p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                    <CheckCircle className="w-5 h-5 text-emerald-400" />
                    <span className="text-emerald-400">Great! No major performance issues detected.</span>
                  </div>
                ) : (
                  analysis.issues?.map((issue, index) => (
                    <div key={index} className="border border-border rounded-lg overflow-hidden">
                      {/* Issue Header */}
                      <div className="p-4 bg-muted/30 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Zap className="w-5 h-5 text-orange-400" />
                          <div>
                            <h4 className="font-medium text-foreground">
                              {issue.issue || issue.name || issue.type}
                            </h4>
                            <p className="text-sm text-muted-foreground">{issue.description}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {fixes?.[index] ? (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setExpandedFixes(prev => ({ ...prev, [index]: !prev[index] }))}
                              className="gap-1"
                            >
                              {expandedFixes[index] ? (
                                <>Hide Fix <ChevronUp className="w-4 h-4" /></>
                              ) : (
                                <>Show Fix <ChevronDown className="w-4 h-4" /></>
                              )}
                            </Button>
                          ) : (
                            <Button
                              onClick={() => handleFixSingle(issue, index)}
                              disabled={fixingIssue === index || fixingAll}
                              size="sm"
                              className="bg-cyan-600 hover:bg-cyan-500 gap-1"
                            >
                              {fixingIssue === index ? (
                                <>
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                  Fixing...
                                </>
                              ) : (
                                <>
                                  <Zap className="w-4 h-4" />
                                  Fix This
                                </>
                              )}
                            </Button>
                          )}
                        </div>
                      </div>
                      
                      {/* Fix Result */}
                      {fixes?.[index] && expandedFixes[index] && (
                        <div className="p-4 border-t border-border bg-background">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <CheckCircle className="w-4 h-4 text-emerald-400" />
                              <span className="text-sm font-medium text-emerald-400">Fix Generated</span>
                              {fixes[index].config_type && (
                                <span className="text-xs bg-cyan-500/20 text-cyan-400 px-2 py-0.5 rounded">
                                  {fixes[index].config_type}
                                </span>
                              )}
                            </div>
                            {fixes[index].impact && (
                              <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                                {fixes[index].impact}
                              </span>
                            )}
                          </div>
                          
                          <p className="text-sm text-muted-foreground mb-3">
                            <strong>Instructions:</strong> {fixes[index].instructions}
                          </p>
                          
                          {/* Code Block */}
                          <div className="relative">
                            <pre className="bg-gray-900 border border-gray-700 rounded-lg p-4 overflow-x-auto text-sm text-gray-300">
                              <code>{fixes[index].fixed_code}</code>
                            </pre>
                            <Button
                              onClick={() => copyToClipboard(fixes[index].fixed_code, `fix-${index}`)}
                              size="sm"
                              variant="ghost"
                              className="absolute top-2 right-2 h-8 gap-1 bg-gray-800 hover:bg-gray-700"
                            >
                              {copiedId === `fix-${index}` ? (
                                <>
                                  <Check className="w-4 h-4 text-emerald-400" />
                                  Copied!
                                </>
                              ) : (
                                <>
                                  <Copy className="w-4 h-4" />
                                  Copy
                                </>
                              )}
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            {/* Fixes Summary */}
            {fixes?.length > 0 && (
              <Card className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border-cyan-500/20">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-cyan-500/20 flex items-center justify-center">
                      <Wand2 className="w-5 h-5 text-cyan-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">Performance Fixes Ready</h3>
                      <p className="text-sm text-muted-foreground">
                        {fixes.length} optimizations for {serverType}
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-background/50 rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold text-cyan-400">{fixes.length}</div>
                      <div className="text-sm text-muted-foreground">Total Fixes</div>
                    </div>
                    <div className="bg-background/50 rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold text-emerald-400">40-60%</div>
                      <div className="text-sm text-muted-foreground">Est. Speed Boost</div>
                    </div>
                    <div className="bg-background/50 rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold text-yellow-400">-500ms</div>
                      <div className="text-sm text-muted-foreground">Est. Load Time</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
