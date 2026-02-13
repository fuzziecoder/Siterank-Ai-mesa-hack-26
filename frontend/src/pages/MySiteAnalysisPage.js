import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { 
  User, Globe, Loader2, CheckCircle, Copy, Check, Wand2, Download,
  ChevronDown, ChevronUp, AlertTriangle, Shield, Link2, FileCode,
  Server, Zap, FileText, Search
} from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';

const API_URL = process.env.REACT_APP_BACKEND_URL;

export default function MySiteAnalysisPage() {
  const { isAuthenticated, getAuthHeader, user } = useAuth();
  const [searchParams] = useSearchParams();
  const [url, setUrl] = useState(searchParams.get('url') || '');
  const [targetKeyword, setTargetKeyword] = useState('');
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const [fixes, setFixes] = useState({ seo: [], speed: [], content: [] });
  const [copiedId, setCopiedId] = useState(null);
  const [expandedSections, setExpandedSections] = useState({ seo: true, speed: true, content: true });
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    // Generate unique verification code for this user/URL
    if (url && user) {
      const code = `siterank-verify-${btoa(url + user.email).slice(0, 16)}`;
      setVerificationCode(code);
    }
  }, [url, user]);

  const handleAnalyze = async () => {
    if (!url || !isAuthenticated) return;
    
    setLoading(true);
    setAnalysis(null);
    setFixes({ seo: [], speed: [], content: [] });
    
    try {
      // Run all three analyses in parallel
      const [seoRes, speedRes, contentRes] = await Promise.all([
        axios.post(`${API_URL}/api/seo/analyze`, { url }, { headers: getAuthHeader() }),
        axios.post(`${API_URL}/api/speed/analyze`, { url }, { headers: getAuthHeader() }),
        axios.post(`${API_URL}/api/content/analyze`, { url }, { headers: getAuthHeader() })
      ]);
      
      setAnalysis({
        seo: seoRes.data,
        speed: speedRes.data,
        content: contentRes.data,
        overallScore: Math.round((seoRes.data.score + speedRes.data.score + contentRes.data.score) / 3)
      });
      
      toast.success('Analysis complete!');
    } catch (error) {
      toast.error('Failed to analyze website');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateFixes = async (type) => {
    if (!analysis) return;
    
    try {
      let response;
      const issues = analysis[type].issues?.map(i => i.issue || i.name || i.type) || [];
      
      if (type === 'seo') {
        response = await axios.post(`${API_URL}/api/fix/seo`, {
          url, issues, target_keyword: targetKeyword,
          page_title: analysis.seo.meta?.title || '',
          page_description: analysis.seo.meta?.description || ''
        });
      } else if (type === 'speed') {
        response = await axios.post(`${API_URL}/api/fix/speed`, {
          url, issues, server_type: 'nginx'
        });
      } else {
        response = await axios.post(`${API_URL}/api/fix/content`, {
          url, issues, target_keyword: targetKeyword,
          current_content: analysis.content.content_preview || ''
        });
      }
      
      setFixes(prev => ({ ...prev, [type]: response.data.fixes || [] }));
      toast.success(`${type.toUpperCase()} fixes generated!`);
    } catch (error) {
      toast.error(`Failed to generate ${type} fixes`);
    }
  };

  const handleVerifyOwnership = async () => {
    setVerifying(true);
    try {
      // In production, this would check for DNS TXT record or file existence
      // For demo, we'll simulate verification
      await new Promise(r => setTimeout(r, 2000));
      setIsVerified(true);
      toast.success('Ownership verified! You can now use CMS integrations.');
    } catch (error) {
      toast.error('Verification failed. Please check your DNS/file setup.');
    } finally {
      setVerifying(false);
    }
  };

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success('Copied!');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const downloadAllFixes = async () => {
    try {
      const response = await axios.post(
        `${API_URL}/api/fix/download-zip`,
        {
          url,
          seo_fixes: fixes.seo,
          speed_fixes: fixes.speed,
          content_fixes: fixes.content,
          server_type: 'nginx'
        },
        { responseType: 'blob', headers: getAuthHeader() }
      );
      
      const blob = new Blob([response.data], { type: 'application/zip' });
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = `my-site-fixes.zip`;
      a.click();
      window.URL.revokeObjectURL(downloadUrl);
      toast.success('Fixes downloaded!');
    } catch (error) {
      toast.error('Download failed');
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-emerald-400';
    if (score >= 60) return 'text-yellow-400';
    if (score >= 40) return 'text-orange-400';
    return 'text-red-400';
  };

  const totalFixes = fixes.seo.length + fixes.speed.length + fixes.content.length;

  return (
    <div className="min-h-screen bg-background" data-testid="my-site-analysis-page">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center">
            <User className="w-6 h-6 text-emerald-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">My Website Analysis</h1>
            <p className="text-muted-foreground">Generate fixes you can apply to your own site</p>
          </div>
        </div>

        {/* URL Input + Analyze */}
        <Card className="bg-card border-border mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Your website URL"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="pl-10 bg-muted border-border h-12"
                />
              </div>
              <Input
                type="text"
                placeholder="Target keyword (optional)"
                value={targetKeyword}
                onChange={(e) => setTargetKeyword(e.target.value)}
                className="md:w-64 bg-muted border-border h-12"
              />
              <Button
                onClick={handleAnalyze}
                disabled={loading || !url || !isAuthenticated}
                className="h-12 px-6 bg-emerald-600 hover:bg-emerald-500 gap-2"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
                Analyze My Site
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Ownership Verification Card */}
        <Card className="bg-gradient-to-br from-emerald-500/5 to-cyan-500/5 border-emerald-500/20 mb-6">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                <Shield className="w-5 h-5 text-emerald-400" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-foreground mb-1">
                  {isVerified ? '✓ Ownership Verified' : 'Verify Ownership (Optional)'}
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {isVerified 
                    ? 'You can now connect your CMS for direct fix application.'
                    : 'Verify you own this site to unlock CMS integrations and auto-apply fixes.'
                  }
                </p>
                
                {!isVerified && (
                  <div className="space-y-3">
                    <div className="p-3 bg-background/50 rounded-lg">
                      <p className="text-xs text-muted-foreground mb-2">Option 1: Add DNS TXT Record</p>
                      <code className="text-sm text-emerald-400 bg-gray-900 px-2 py-1 rounded">
                        {verificationCode}
                      </code>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(verificationCode, 'dns')}
                        className="ml-2"
                      >
                        {copiedId === 'dns' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      </Button>
                    </div>
                    <div className="p-3 bg-background/50 rounded-lg">
                      <p className="text-xs text-muted-foreground mb-2">Option 2: Upload verification file</p>
                      <code className="text-sm text-cyan-400">
                        {url}/.well-known/siterank-verify.txt
                      </code>
                    </div>
                    <Button
                      onClick={handleVerifyOwnership}
                      disabled={verifying}
                      variant="outline"
                      className="gap-2"
                    >
                      {verifying ? <Loader2 className="w-4 h-4 animate-spin" /> : <Shield className="w-4 h-4" />}
                      Verify My Ownership
                    </Button>
                  </div>
                )}
                
                {isVerified && (
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" disabled className="gap-2">
                      <Link2 className="w-4 h-4" />
                      Connect WordPress (Coming Soon)
                    </Button>
                    <Button variant="outline" size="sm" disabled className="gap-2">
                      <Link2 className="w-4 h-4" />
                      Connect Shopify (Coming Soon)
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Analysis Results */}
        {analysis && (
          <div className="space-y-6">
            {/* Score Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="bg-card border-border">
                <CardContent className="p-4 text-center">
                  <div className={`text-3xl font-bold ${getScoreColor(analysis.overallScore)}`}>
                    {analysis.overallScore}
                  </div>
                  <div className="text-sm text-muted-foreground">Overall Score</div>
                </CardContent>
              </Card>
              <Card className="bg-card border-border">
                <CardContent className="p-4 text-center">
                  <Search className="w-5 h-5 text-emerald-400 mx-auto mb-1" />
                  <div className={`text-xl font-bold ${getScoreColor(analysis.seo.score)}`}>
                    {analysis.seo.score}/100
                  </div>
                  <div className="text-xs text-muted-foreground">SEO</div>
                </CardContent>
              </Card>
              <Card className="bg-card border-border">
                <CardContent className="p-4 text-center">
                  <Zap className="w-5 h-5 text-cyan-400 mx-auto mb-1" />
                  <div className={`text-xl font-bold ${getScoreColor(analysis.speed.score)}`}>
                    {analysis.speed.score}/100
                  </div>
                  <div className="text-xs text-muted-foreground">Speed</div>
                </CardContent>
              </Card>
              <Card className="bg-card border-border">
                <CardContent className="p-4 text-center">
                  <FileText className="w-5 h-5 text-purple-400 mx-auto mb-1" />
                  <div className={`text-xl font-bold ${getScoreColor(analysis.content.score)}`}>
                    {analysis.content.score}/100
                  </div>
                  <div className="text-xs text-muted-foreground">Content</div>
                </CardContent>
              </Card>
            </div>

            {/* Actions Bar */}
            <Card className="bg-card border-border">
              <CardContent className="p-4 flex flex-wrap items-center justify-between gap-4">
                <div className="text-sm text-muted-foreground">
                  {analysis.seo.issues?.length + analysis.speed.issues?.length + analysis.content.issues?.length || 0} issues found
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={() => {
                      handleGenerateFixes('seo');
                      handleGenerateFixes('speed');
                      handleGenerateFixes('content');
                    }}
                    className="bg-emerald-600 hover:bg-emerald-500 gap-2"
                  >
                    <Wand2 className="w-4 h-4" />
                    Generate All Fix Code
                  </Button>
                  {totalFixes > 0 && (
                    <Button onClick={downloadAllFixes} variant="outline" className="gap-2">
                      <Download className="w-4 h-4" />
                      Download All ({totalFixes})
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* SEO Section */}
            <Card className="bg-card border-border">
              <CardHeader className="cursor-pointer" onClick={() => setExpandedSections(p => ({ ...p, seo: !p.seo }))}>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Search className="w-5 h-5 text-emerald-400" />
                    SEO Issues ({analysis.seo.issues?.length || 0})
                  </div>
                  {expandedSections.seo ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </CardTitle>
              </CardHeader>
              {expandedSections.seo && (
                <CardContent className="space-y-4">
                  {analysis.seo.issues?.length === 0 ? (
                    <div className="flex items-center gap-2 text-emerald-400">
                      <CheckCircle className="w-5 h-5" />
                      No SEO issues found!
                    </div>
                  ) : (
                    <>
                      {!fixes.seo.length && (
                        <Button onClick={() => handleGenerateFixes('seo')} size="sm" className="bg-emerald-600 hover:bg-emerald-500 gap-2">
                          <Wand2 className="w-4 h-4" />
                          Generate SEO Fix Code
                        </Button>
                      )}
                      {analysis.seo.issues?.map((issue, i) => (
                        <div key={i} className="p-4 bg-muted/30 rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <AlertTriangle className="w-4 h-4 text-orange-400" />
                            <span className="font-medium text-foreground">{issue.issue || issue.name}</span>
                          </div>
                          <p className="text-sm text-muted-foreground mb-3">{issue.description}</p>
                          {fixes.seo[i] && (
                            <div className="relative mt-3">
                              <pre className="bg-gray-900 border border-gray-700 rounded p-3 text-sm text-gray-300 overflow-x-auto">
                                {fixes.seo[i].fixed_code}
                              </pre>
                              <Button
                                onClick={() => copyToClipboard(fixes.seo[i].fixed_code, `seo-${i}`)}
                                size="sm"
                                variant="ghost"
                                className="absolute top-2 right-2 bg-gray-800"
                              >
                                {copiedId === `seo-${i}` ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                              </Button>
                            </div>
                          )}
                        </div>
                      ))}
                    </>
                  )}
                </CardContent>
              )}
            </Card>

            {/* Speed Section */}
            <Card className="bg-card border-border">
              <CardHeader className="cursor-pointer" onClick={() => setExpandedSections(p => ({ ...p, speed: !p.speed }))}>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Zap className="w-5 h-5 text-cyan-400" />
                    Speed Issues ({analysis.speed.issues?.length || 0})
                  </div>
                  {expandedSections.speed ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </CardTitle>
              </CardHeader>
              {expandedSections.speed && (
                <CardContent className="space-y-4">
                  {analysis.speed.issues?.length === 0 ? (
                    <div className="flex items-center gap-2 text-emerald-400">
                      <CheckCircle className="w-5 h-5" />
                      No speed issues found!
                    </div>
                  ) : (
                    <>
                      {!fixes.speed.length && (
                        <Button onClick={() => handleGenerateFixes('speed')} size="sm" className="bg-cyan-600 hover:bg-cyan-500 gap-2">
                          <Wand2 className="w-4 h-4" />
                          Generate Speed Fix Code
                        </Button>
                      )}
                      {analysis.speed.issues?.map((issue, i) => (
                        <div key={i} className="p-4 bg-muted/30 rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <AlertTriangle className="w-4 h-4 text-orange-400" />
                            <span className="font-medium text-foreground">{issue.issue || issue.name}</span>
                          </div>
                          <p className="text-sm text-muted-foreground mb-3">{issue.description}</p>
                          {fixes.speed[i] && (
                            <div className="relative mt-3">
                              <pre className="bg-gray-900 border border-gray-700 rounded p-3 text-sm text-gray-300 overflow-x-auto">
                                {fixes.speed[i].fixed_code}
                              </pre>
                              <Button
                                onClick={() => copyToClipboard(fixes.speed[i].fixed_code, `speed-${i}`)}
                                size="sm"
                                variant="ghost"
                                className="absolute top-2 right-2 bg-gray-800"
                              >
                                {copiedId === `speed-${i}` ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                              </Button>
                            </div>
                          )}
                        </div>
                      ))}
                    </>
                  )}
                </CardContent>
              )}
            </Card>

            {/* Content Section */}
            <Card className="bg-card border-border">
              <CardHeader className="cursor-pointer" onClick={() => setExpandedSections(p => ({ ...p, content: !p.content }))}>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-purple-400" />
                    Content Issues ({analysis.content.issues?.length || 0})
                  </div>
                  {expandedSections.content ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </CardTitle>
              </CardHeader>
              {expandedSections.content && (
                <CardContent className="space-y-4">
                  {analysis.content.issues?.length === 0 ? (
                    <div className="flex items-center gap-2 text-emerald-400">
                      <CheckCircle className="w-5 h-5" />
                      No content issues found!
                    </div>
                  ) : (
                    <>
                      {!fixes.content.length && (
                        <Button onClick={() => handleGenerateFixes('content')} size="sm" className="bg-purple-600 hover:bg-purple-500 gap-2">
                          <Wand2 className="w-4 h-4" />
                          Generate Content Improvements
                        </Button>
                      )}
                      {analysis.content.issues?.map((issue, i) => (
                        <div key={i} className="p-4 bg-muted/30 rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <AlertTriangle className="w-4 h-4 text-orange-400" />
                            <span className="font-medium text-foreground">{issue.issue || issue.name}</span>
                          </div>
                          <p className="text-sm text-muted-foreground mb-3">{issue.description}</p>
                          {fixes.content[i] && (
                            <div className="relative mt-3">
                              <pre className="bg-gray-900 border border-gray-700 rounded p-3 text-sm text-gray-300 overflow-x-auto whitespace-pre-wrap">
                                {fixes.content[i].fixed_code}
                              </pre>
                              <Button
                                onClick={() => copyToClipboard(fixes.content[i].fixed_code, `content-${i}`)}
                                size="sm"
                                variant="ghost"
                                className="absolute top-2 right-2 bg-gray-800"
                              >
                                {copiedId === `content-${i}` ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                              </Button>
                            </div>
                          )}
                        </div>
                      ))}
                    </>
                  )}
                </CardContent>
              )}
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
