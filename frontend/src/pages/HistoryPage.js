import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { 
  Loader2, Search, Plus, History, Trash2,
  CheckCircle2, AlertCircle, Clock, ExternalLink
} from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../components/ui/alert-dialog';
import axios from 'axios';
import { toast } from 'sonner';

const API_URL = process.env.REACT_APP_BACKEND_URL;

export default function HistoryPage() {
  const { getAuthHeader } = useAuth();
  const [analyses, setAnalyses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchAnalyses();
  }, []);

  const fetchAnalyses = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/api/analyses?limit=100`,
        { headers: getAuthHeader() }
      );
      setAnalyses(response.data);
    } catch (error) {
      toast.error('Failed to load history');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    
    setDeleting(true);
    try {
      await axios.delete(
        `${API_URL}/api/analyses/${deleteId}`,
        { headers: getAuthHeader() }
      );
      setAnalyses(prev => prev.filter(a => a.id !== deleteId));
      toast.success('Analysis deleted');
    } catch (error) {
      toast.error('Failed to delete analysis');
    } finally {
      setDeleting(false);
      setDeleteId(null);
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      completed: 'bg-green-900/30 text-green-400',
      processing: 'bg-blue-900/30 text-blue-400',
      pending: 'bg-yellow-900/30 text-yellow-400',
      failed: 'bg-red-900/30 text-red-400'
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

  const filteredAnalyses = analyses.filter(a =>
    a.user_site_url.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background" data-testid="history-loading">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background" data-testid="history-page">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              Analysis History
            </h1>
            <p className="text-muted-foreground mt-1">
              View and manage your past analyses
            </p>
          </div>
          <Link to="/analyze">
            <Button className="rounded-full gap-2" data-testid="new-analysis-btn">
              <Plus className="w-4 h-4" />
              New Analysis
            </Button>
          </Link>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search by URL..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-muted border-border"
            data-testid="search-input"
          />
        </div>

        {/* Analyses List */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2 text-foreground">
              <History className="w-5 h-5 text-gray-400" />
              All Analyses ({filteredAnalyses.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filteredAnalyses.length === 0 ? (
              <div className="text-center py-12">
                <History className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
                <h3 className="font-medium mb-2 text-foreground">
                  {searchQuery ? 'No matching analyses' : 'No analyses yet'}
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {searchQuery 
                    ? 'Try a different search term' 
                    : 'Start by analyzing your first website'}
                </p>
                {!searchQuery && (
                  <Link to="/analyze">
                    <Button className="rounded-full gap-2">
                      <Plus className="w-4 h-4" />
                      Start Analysis
                    </Button>
                  </Link>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                {filteredAnalyses.map((analysis) => (
                  <div 
                    key={analysis.id}
                    className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-accent/30 transition-colors"
                    data-testid={`history-item-${analysis.id}`}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium truncate text-foreground">{analysis.user_site_url}</p>
                        {getStatusBadge(analysis.status)}
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                        <span>{analysis.competitor_count} competitor{analysis.competitor_count !== 1 ? 's' : ''}</span>
                        <span>•</span>
                        <span>{new Date(analysis.created_at).toLocaleDateString()}</span>
                        <span>•</span>
                        <span>{new Date(analysis.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {analysis.status === 'completed' && (
                        <div className="text-right hidden sm:block">
                          <p className="text-xl font-bold text-foreground">{analysis.overall_score}</p>
                          <p className="text-xs text-muted-foreground">Score</p>
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <Link to={`/analysis/${analysis.id}`}>
                          <Button variant="ghost" size="icon" data-testid={`view-btn-${analysis.id}`}>
                            <ExternalLink className="w-4 h-4 text-muted-foreground" />
                          </Button>
                        </Link>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => setDeleteId(analysis.id)}
                          data-testid={`delete-btn-${analysis.id}`}
                        >
                          <Trash2 className="w-4 h-4 text-muted-foreground hover:text-destructive" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-foreground">Delete Analysis?</AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              This action cannot be undone. This will permanently delete the analysis and all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting} className="border-border">Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete} 
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              data-testid="confirm-delete-btn"
            >
              {deleting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
