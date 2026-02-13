import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { 
  Building2, Globe, Loader2, CheckCircle, Download, FileText,
  AlertTriangle, Search, Zap, Copy, Check, Mail, Package
} from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';
import jsPDF from 'jspdf';

const API_URL = process.env.REACT_APP_BACKEND_URL;

export default function ClientSiteAnalysisPage() {
  const { isAuthenticated, getAuthHeader } = useAuth();
  const [searchParams] = useSearchParams();
  const [url, setUrl] = useState(searchParams.get('url') || '');
  const [clientName, setClientName] = useState('');
  const [agencyName, setAgencyName] = useState('');
  const [loading, setLoading] = useState(false);
  const [generatingFixes, setGeneratingFixes] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [fixes, setFixes] = useState({ seo: [], speed: [], content: [] });
  const [copiedId, setCopiedId] = useState(null);

  const handleAnalyze = async () => {
    if (!url || !isAuthenticated) return;
    
    setLoading(true);
    setAnalysis(null);
    setFixes({ seo: [], speed: [], content: [] });
    
    try {
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
      
      toast.success('Client site analysis complete!');
    } catch (error) {
      toast.error('Failed to analyze website');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateAllFixes = async () => {
    if (!analysis) return;
    
    setGeneratingFixes(true);
    try {
      const [seoFixes, speedFixes, contentFixes] = await Promise.all([
        axios.post(`${API_URL}/api/fix/seo`, {
          url,
          issues: analysis.seo.issues?.map(i => i.issue || i.name) || [],
          page_title: analysis.seo.meta?.title || ''
        }),
        axios.post(`${API_URL}/api/fix/speed`, {
          url,
          issues: analysis.speed.issues?.map(i => i.issue || i.name) || [],
          server_type: 'nginx'
        }),
        axios.post(`${API_URL}/api/fix/content`, {
          url,
          issues: analysis.content.issues?.map(i => i.issue || i.name) || [],
          current_content: analysis.content.content_preview || ''
        })
      ]);
      
      setFixes({
        seo: seoFixes.data.fixes || [],
        speed: speedFixes.data.fixes || [],
        content: contentFixes.data.fixes || []
      });
      
      toast.success('All fix recommendations generated!');
    } catch (error) {
      toast.error('Failed to generate fixes');
    } finally {
      setGeneratingFixes(false);
    }
  };

  const generatePDFReport = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    let yPos = 20;
    
    // Header
    doc.setFontSize(20);
    doc.setTextColor(16, 185, 129); // Emerald
    doc.text(agencyName || 'Website Audit Report', pageWidth / 2, yPos, { align: 'center' });
    yPos += 10;
    
    doc.setFontSize(12);
    doc.setTextColor(100);
    doc.text(`Prepared for: ${clientName || 'Client'}`, pageWidth / 2, yPos, { align: 'center' });
    yPos += 8;
    doc.text(`Website: ${url}`, pageWidth / 2, yPos, { align: 'center' });
    yPos += 8;
    doc.text(`Date: ${new Date().toLocaleDateString()}`, pageWidth / 2, yPos, { align: 'center' });
    yPos += 20;
    
    // Overall Score
    doc.setFontSize(16);
    doc.setTextColor(0);
    doc.text('Overall Website Score', 20, yPos);
    yPos += 10;
    
    doc.setFontSize(40);
    const scoreColor = analysis.overallScore >= 80 ? [16, 185, 129] : 
                       analysis.overallScore >= 60 ? [234, 179, 8] : [239, 68, 68];
    doc.setTextColor(...scoreColor);
    doc.text(`${analysis.overallScore}/100`, 20, yPos);
    yPos += 20;
    
    // Score Breakdown
    doc.setFontSize(12);
    doc.setTextColor(0);
    doc.text(`SEO Score: ${analysis.seo.score}/100`, 20, yPos);
    yPos += 8;
    doc.text(`Speed Score: ${analysis.speed.score}/100`, 20, yPos);
    yPos += 8;
    doc.text(`Content Score: ${analysis.content.score}/100`, 20, yPos);
    yPos += 20;
    
    // Issues Summary
    doc.setFontSize(16);
    doc.text('Issues Found', 20, yPos);
    yPos += 10;
    
    const totalIssues = (analysis.seo.issues?.length || 0) + 
                        (analysis.speed.issues?.length || 0) + 
                        (analysis.content.issues?.length || 0);
    
    doc.setFontSize(12);
    doc.text(`Total Issues: ${totalIssues}`, 20, yPos);
    yPos += 8;
    doc.text(`• SEO Issues: ${analysis.seo.issues?.length || 0}`, 25, yPos);
    yPos += 6;
    doc.text(`• Speed Issues: ${analysis.speed.issues?.length || 0}`, 25, yPos);
    yPos += 6;
    doc.text(`• Content Issues: ${analysis.content.issues?.length || 0}`, 25, yPos);
    yPos += 15;
    
    // SEO Issues
    if (analysis.seo.issues?.length > 0) {
      doc.setFontSize(14);
      doc.setTextColor(16, 185, 129);
      doc.text('SEO Issues', 20, yPos);
      yPos += 8;
      
      doc.setFontSize(10);
      doc.setTextColor(0);
      analysis.seo.issues.forEach((issue, i) => {
        if (yPos > 270) {
          doc.addPage();
          yPos = 20;
        }
        doc.text(`${i + 1}. ${issue.issue || issue.name}`, 25, yPos);
        yPos += 5;
        if (issue.description) {
          const desc = doc.splitTextToSize(issue.description, pageWidth - 50);
          doc.setTextColor(100);
          doc.text(desc, 30, yPos);
          yPos += desc.length * 4 + 3;
          doc.setTextColor(0);
        }
      });
      yPos += 10;
    }
    
    // Speed Issues
    if (analysis.speed.issues?.length > 0) {
      if (yPos > 250) {
        doc.addPage();
        yPos = 20;
      }
      doc.setFontSize(14);
      doc.setTextColor(6, 182, 212);
      doc.text('Speed Issues', 20, yPos);
      yPos += 8;
      
      doc.setFontSize(10);
      doc.setTextColor(0);
      analysis.speed.issues.forEach((issue, i) => {
        if (yPos > 270) {
          doc.addPage();
          yPos = 20;
        }
        doc.text(`${i + 1}. ${issue.issue || issue.name}`, 25, yPos);
        yPos += 5;
        if (issue.description) {
          const desc = doc.splitTextToSize(issue.description, pageWidth - 50);
          doc.setTextColor(100);
          doc.text(desc, 30, yPos);
          yPos += desc.length * 4 + 3;
          doc.setTextColor(0);
        }
      });
      yPos += 10;
    }
    
    // Content Issues
    if (analysis.content.issues?.length > 0) {
      if (yPos > 250) {
        doc.addPage();
        yPos = 20;
      }
      doc.setFontSize(14);
      doc.setTextColor(168, 85, 247);
      doc.text('Content Issues', 20, yPos);
      yPos += 8;
      
      doc.setFontSize(10);
      doc.setTextColor(0);
      analysis.content.issues.forEach((issue, i) => {
        if (yPos > 270) {
          doc.addPage();
          yPos = 20;
        }
        doc.text(`${i + 1}. ${issue.issue || issue.name}`, 25, yPos);
        yPos += 5;
        if (issue.description) {
          const desc = doc.splitTextToSize(issue.description, pageWidth - 50);
          doc.setTextColor(100);
          doc.text(desc, 30, yPos);
          yPos += desc.length * 4 + 3;
          doc.setTextColor(0);
        }
      });
    }
    
    // Footer
    doc.addPage();
    doc.setFontSize(14);
    doc.setTextColor(0);
    doc.text('Next Steps', 20, 20);
    doc.setFontSize(10);
    doc.text('1. Review the issues identified in this report', 25, 30);
    doc.text('2. Download the fix code package (included separately)', 25, 36);
    doc.text('3. Have your development team implement the fixes', 25, 42);
    doc.text('4. Re-run the analysis to verify improvements', 25, 48);
    
    doc.setFontSize(8);
    doc.setTextColor(100);
    doc.text(`Generated by SITERANK AI | ${new Date().toISOString()}`, pageWidth / 2, 280, { align: 'center' });
    
    // Save
    doc.save(`${clientName || 'client'}-website-audit.pdf`);
    toast.success('PDF report downloaded!');
  };

  const downloadFixPackage = async () => {
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
      a.download = `${clientName || 'client'}-fix-package.zip`;
      a.click();
      window.URL.revokeObjectURL(downloadUrl);
      toast.success('Fix package downloaded!');
    } catch (error) {
      toast.error('Download failed');
    }
  };

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success('Copied!');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-emerald-400';
    if (score >= 60) return 'text-yellow-400';
    if (score >= 40) return 'text-orange-400';
    return 'text-red-400';
  };

  const totalFixes = fixes.seo.length + fixes.speed.length + fixes.content.length;

  return (
    <div className="min-h-screen bg-background" data-testid="client-site-analysis-page">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-xl bg-cyan-500/20 flex items-center justify-center">
            <Building2 className="w-6 h-6 text-cyan-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Client Website Audit</h1>
            <p className="text-muted-foreground">Generate professional reports and fix packages for your clients</p>
          </div>
        </div>

        {/* Input Section */}
        <Card className="bg-card border-border mb-6">
          <CardContent className="p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-muted-foreground mb-2 block">Client Website URL *</label>
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="https://clientsite.com"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    className="pl-10 bg-muted border-border h-12"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-2 block">Client Name</label>
                <Input
                  type="text"
                  placeholder="Acme Inc."
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  className="bg-muted border-border h-12"
                />
              </div>
            </div>
            <div>
              <label className="text-sm text-muted-foreground mb-2 block">Your Agency Name (for branding)</label>
              <Input
                type="text"
                placeholder="Your Agency Name"
                value={agencyName}
                onChange={(e) => setAgencyName(e.target.value)}
                className="bg-muted border-border"
              />
            </div>
            <Button
              onClick={handleAnalyze}
              disabled={loading || !url || !isAuthenticated}
              className="w-full h-12 bg-cyan-600 hover:bg-cyan-500 gap-2"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
              Analyze Client Site
            </Button>
          </CardContent>
        </Card>

        {/* Results */}
        {analysis && (
          <div className="space-y-6">
            {/* Score Overview */}
            <Card className="bg-gradient-to-br from-cyan-500/10 to-cyan-500/5 border-cyan-500/30">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                  <div className="text-center md:text-left">
                    <div className={`text-5xl font-bold ${getScoreColor(analysis.overallScore)}`}>
                      {analysis.overallScore}/100
                    </div>
                    <div className="text-muted-foreground">Overall Website Score</div>
                    <div className="flex gap-6 mt-4">
                      <div>
                        <span className="text-emerald-400 font-bold">{analysis.seo.score}</span>
                        <span className="text-muted-foreground text-sm ml-1">SEO</span>
                      </div>
                      <div>
                        <span className="text-cyan-400 font-bold">{analysis.speed.score}</span>
                        <span className="text-muted-foreground text-sm ml-1">Speed</span>
                      </div>
                      <div>
                        <span className="text-purple-400 font-bold">{analysis.content.score}</span>
                        <span className="text-muted-foreground text-sm ml-1">Content</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-3">
                    <Button
                      onClick={generatePDFReport}
                      className="bg-cyan-600 hover:bg-cyan-500 gap-2"
                    >
                      <FileText className="w-4 h-4" />
                      Download PDF Report
                    </Button>
                    <Button
                      onClick={handleGenerateAllFixes}
                      disabled={generatingFixes}
                      variant="outline"
                      className="gap-2"
                    >
                      {generatingFixes ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Package className="w-4 h-4" />
                      )}
                      Generate Fix Package
                    </Button>
                    {totalFixes > 0 && (
                      <Button
                        onClick={downloadFixPackage}
                        variant="outline"
                        className="gap-2"
                      >
                        <Download className="w-4 h-4" />
                        Download Fixes ({totalFixes})
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Issues Summary for Client */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-orange-400" />
                  Issues to Address ({(analysis.seo.issues?.length || 0) + (analysis.speed.issues?.length || 0) + (analysis.content.issues?.length || 0)})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* SEO Issues */}
                  {analysis.seo.issues?.length > 0 && (
                    <div>
                      <h4 className="font-medium text-emerald-400 mb-2 flex items-center gap-2">
                        <Search className="w-4 h-4" />
                        SEO Issues ({analysis.seo.issues.length})
                      </h4>
                      {analysis.seo.issues.map((issue, i) => (
                        <div key={i} className="ml-6 mb-2 p-3 bg-muted/30 rounded-lg">
                          <div className="font-medium text-foreground">{issue.issue || issue.name}</div>
                          <div className="text-sm text-muted-foreground">{issue.description}</div>
                          {fixes.seo[i] && (
                            <div className="mt-2 relative">
                              <pre className="bg-gray-900 border border-gray-700 rounded p-2 text-xs text-gray-300 overflow-x-auto">
                                {fixes.seo[i].fixed_code?.slice(0, 200)}...
                              </pre>
                              <Button
                                onClick={() => copyToClipboard(fixes.seo[i].fixed_code, `seo-${i}`)}
                                size="sm"
                                variant="ghost"
                                className="absolute top-1 right-1 h-6 bg-gray-800"
                              >
                                {copiedId === `seo-${i}` ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                              </Button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {/* Speed Issues */}
                  {analysis.speed.issues?.length > 0 && (
                    <div>
                      <h4 className="font-medium text-cyan-400 mb-2 flex items-center gap-2">
                        <Zap className="w-4 h-4" />
                        Speed Issues ({analysis.speed.issues.length})
                      </h4>
                      {analysis.speed.issues.map((issue, i) => (
                        <div key={i} className="ml-6 mb-2 p-3 bg-muted/30 rounded-lg">
                          <div className="font-medium text-foreground">{issue.issue || issue.name}</div>
                          <div className="text-sm text-muted-foreground">{issue.description}</div>
                          {fixes.speed[i] && (
                            <div className="mt-2 relative">
                              <pre className="bg-gray-900 border border-gray-700 rounded p-2 text-xs text-gray-300 overflow-x-auto">
                                {fixes.speed[i].fixed_code?.slice(0, 200)}...
                              </pre>
                              <Button
                                onClick={() => copyToClipboard(fixes.speed[i].fixed_code, `speed-${i}`)}
                                size="sm"
                                variant="ghost"
                                className="absolute top-1 right-1 h-6 bg-gray-800"
                              >
                                {copiedId === `speed-${i}` ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                              </Button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {/* Content Issues */}
                  {analysis.content.issues?.length > 0 && (
                    <div>
                      <h4 className="font-medium text-purple-400 mb-2 flex items-center gap-2">
                        <FileText className="w-4 h-4" />
                        Content Issues ({analysis.content.issues.length})
                      </h4>
                      {analysis.content.issues.map((issue, i) => (
                        <div key={i} className="ml-6 mb-2 p-3 bg-muted/30 rounded-lg">
                          <div className="font-medium text-foreground">{issue.issue || issue.name}</div>
                          <div className="text-sm text-muted-foreground">{issue.description}</div>
                          {fixes.content[i] && (
                            <div className="mt-2 relative">
                              <pre className="bg-gray-900 border border-gray-700 rounded p-2 text-xs text-gray-300 overflow-x-auto whitespace-pre-wrap">
                                {fixes.content[i].fixed_code?.slice(0, 200)}...
                              </pre>
                              <Button
                                onClick={() => copyToClipboard(fixes.content[i].fixed_code, `content-${i}`)}
                                size="sm"
                                variant="ghost"
                                className="absolute top-1 right-1 h-6 bg-gray-800"
                              >
                                {copiedId === `content-${i}` ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                              </Button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Send to Client */}
            <Card className="bg-card border-border">
              <CardContent className="p-6 text-center">
                <Mail className="w-10 h-10 text-cyan-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">Ready to Send to Client</h3>
                <p className="text-muted-foreground mb-4">
                  Download the PDF report and fix package, then send to your client's development team.
                </p>
                <div className="flex justify-center gap-3">
                  <Button onClick={generatePDFReport} className="gap-2">
                    <FileText className="w-4 h-4" />
                    PDF Report
                  </Button>
                  {totalFixes > 0 && (
                    <Button onClick={downloadFixPackage} variant="outline" className="gap-2">
                      <Package className="w-4 h-4" />
                      Fix Package
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
