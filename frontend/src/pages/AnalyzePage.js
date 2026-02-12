import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Plus, Trash2, Loader2, Globe, AlertCircle } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';

const API_URL = process.env.REACT_APP_BACKEND_URL;

export default function AnalyzePage() {
  const { getAuthHeader } = useAuth();
  const navigate = useNavigate();
  const [userSiteUrl, setUserSiteUrl] = useState('');
  const [competitorUrls, setCompetitorUrls] = useState(['']);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validateUrl = (url) => {
    if (!url) return false;
    try {
      const urlToTest = url.startsWith('http') ? url : `https://${url}`;
      new URL(urlToTest);
      return true;
    } catch {
      return false;
    }
  };

  const addCompetitor = () => {
    if (competitorUrls.length < 5) {
      setCompetitorUrls([...competitorUrls, '']);
    }
  };

  const removeCompetitor = (index) => {
    const newUrls = competitorUrls.filter((_, i) => i !== index);
    setCompetitorUrls(newUrls.length ? newUrls : ['']);
  };

  const updateCompetitor = (index, value) => {
    const newUrls = [...competitorUrls];
    newUrls[index] = value;
    setCompetitorUrls(newUrls);
    
    if (errors[`competitor_${index}`]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[`competitor_${index}`];
        return newErrors;
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const newErrors = {};
    if (!validateUrl(userSiteUrl)) {
      newErrors.userSite = 'Please enter a valid URL';
    }

    const validCompetitors = competitorUrls.filter(url => url.trim());
    validCompetitors.forEach((url, index) => {
      if (!validateUrl(url)) {
        newErrors[`competitor_${index}`] = 'Invalid URL';
      }
    });

    if (validCompetitors.length === 0) {
      newErrors.competitors = 'Add at least one competitor URL';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.error('Please fix the errors before submitting');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(
        `${API_URL}/api/analyses`,
        {
          user_site_url: userSiteUrl,
          competitor_urls: validCompetitors
        },
        { headers: getAuthHeader() }
      );

      toast.success('Analysis started! You will be redirected to results.');
      navigate(`/analysis/${response.data.id}`);
    } catch (error) {
      const message = error.response?.data?.detail || 'Failed to start analysis';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background" data-testid="analyze-page">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            New Website Analysis
          </h1>
          <p className="text-muted-foreground mt-2">
            Enter your website and competitor URLs to get a comprehensive comparison
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Your Website */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2 text-foreground">
                <Globe className="w-5 h-5 text-gray-400" />
                Your Website
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                Enter the URL of the website you want to analyze
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="userSite" className="text-muted-foreground">Website URL</Label>
                <Input
                  id="userSite"
                  type="text"
                  placeholder="example.com or https://example.com"
                  value={userSiteUrl}
                  onChange={(e) => {
                    setUserSiteUrl(e.target.value);
                    if (errors.userSite) {
                      setErrors(prev => ({ ...prev, userSite: undefined }));
                    }
                  }}
                  disabled={loading}
                  className={`bg-muted border-border ${errors.userSite ? 'border-destructive' : ''}`}
                  data-testid="user-site-input"
                />
                {errors.userSite && (
                  <p className="text-sm text-destructive flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.userSite}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Competitor Websites */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2 text-foreground">
                <Globe className="w-5 h-5 text-muted-foreground" />
                Competitor Websites
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                Add up to 5 competitor websites to compare against (at least 1 required)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {competitorUrls.map((url, index) => (
                <div key={index} className="flex gap-2">
                  <div className="flex-1 space-y-1">
                    <Input
                      type="text"
                      placeholder={`competitor${index + 1}.com`}
                      value={url}
                      onChange={(e) => updateCompetitor(index, e.target.value)}
                      disabled={loading}
                      className={`bg-muted border-border ${errors[`competitor_${index}`] ? 'border-destructive' : ''}`}
                      data-testid={`competitor-input-${index}`}
                    />
                    {errors[`competitor_${index}`] && (
                      <p className="text-xs text-destructive">{errors[`competitor_${index}`]}</p>
                    )}
                  </div>
                  {competitorUrls.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeCompetitor(index)}
                      disabled={loading}
                      data-testid={`remove-competitor-${index}`}
                    >
                      <Trash2 className="w-4 h-4 text-muted-foreground hover:text-destructive" />
                    </Button>
                  )}
                </div>
              ))}
              
              {errors.competitors && (
                <p className="text-sm text-destructive flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.competitors}
                </p>
              )}

              {competitorUrls.length < 5 && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addCompetitor}
                  disabled={loading}
                  className="w-full border-border"
                  data-testid="add-competitor-btn"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Competitor
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Submit */}
          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/dashboard')}
              disabled={loading}
              className="border-border"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={loading}
              className="rounded-full gap-2 min-w-[140px]"
              data-testid="start-analysis-btn"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Starting...
                </>
              ) : (
                'Start Analysis'
              )}
            </Button>
          </div>
        </form>

        {/* Info Card */}
        <Card className="mt-8 bg-accent/30 border-border">
          <CardContent className="p-6">
            <h3 className="font-semibold mb-2 text-foreground">What we analyze:</h3>
            <ul className="grid sm:grid-cols-2 gap-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-gray-500" />
                SEO: Meta tags, headings, structured data
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-gray-500" />
                Speed: Load time, page size, optimization
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-gray-500" />
                Content: Word count, readability, structure
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-gray-500" />
                UX: Mobile-friendliness, accessibility
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
