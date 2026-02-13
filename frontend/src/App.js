import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Toaster } from './components/ui/sonner';
import ChatBot from './components/ChatBot';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import AnalyzePage from './pages/AnalyzePage';
import AnalysisResultPage from './pages/AnalysisResultPage';
import HistoryPage from './pages/HistoryPage';
import OptimizePage from './pages/OptimizePage';
// Feature Pages
import SEOAnalysisPage from './pages/SEOAnalysisPage';
import SpeedMetricsPage from './pages/SpeedMetricsPage';
import ContentScorePage from './pages/ContentScorePage';
import DownloadFixesPage from './pages/DownloadFixesPage';
// Smart Analysis Pages
import SmartAnalyzePage from './pages/SmartAnalyzePage';
import MySiteAnalysisPage from './pages/MySiteAnalysisPage';
import ClientSiteAnalysisPage from './pages/ClientSiteAnalysisPage';
import CompetitorAnalysisPage from './pages/CompetitorAnalysisPage';
// Solution Pages
import ForMarketersPage from './pages/ForMarketersPage';
import ForAgenciesPage from './pages/ForAgenciesPage';
import ForEnterprisePage from './pages/ForEnterprisePage';
// Resource Pages
import BlogPage from './pages/BlogPage';
import DocumentationPage from './pages/DocumentationPage';
import SupportPage from './pages/SupportPage';
import './App.css';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

// Public Route (redirects to dashboard if authenticated)
const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }
  
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return children;
};

function AppRoutes() {
  const { isAuthenticated } = useAuth();
  
  return (
    <>
      {/* Always show Navbar */}
      <Navbar />
      <Routes>
        {/* Public Routes */}
        <Route 
          path="/" 
          element={
            isAuthenticated ? <Navigate to="/dashboard" replace /> : <LandingPage />
          } 
        />
        <Route 
          path="/login" 
          element={
            <PublicRoute>
              <LoginPage />
            </PublicRoute>
          } 
        />
        <Route 
          path="/register" 
          element={
            <PublicRoute>
              <RegisterPage />
            </PublicRoute>
          } 
        />
        
        {/* Protected Routes */}
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/optimize" 
          element={
            <ProtectedRoute>
              <OptimizePage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/analyze" 
          element={
            <ProtectedRoute>
              <AnalyzePage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/analysis/:id" 
          element={
            <ProtectedRoute>
              <AnalysisResultPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/history" 
          element={
            <ProtectedRoute>
              <HistoryPage />
            </ProtectedRoute>
          } 
        />
        
        {/* Feature Pages (Public) */}
        <Route path="/features/seo" element={<SEOAnalysisPage />} />
        <Route path="/features/speed" element={<SpeedMetricsPage />} />
        <Route path="/features/content" element={<ContentScorePage />} />
        <Route path="/features/download" element={<DownloadFixesPage />} />
        
        {/* Smart Analysis Flow */}
        <Route path="/smart-analyze" element={<SmartAnalyzePage />} />
        <Route path="/analyze/my-site" element={<MySiteAnalysisPage />} />
        <Route path="/analyze/client-site" element={<ClientSiteAnalysisPage />} />
        <Route path="/analyze/competitor" element={<CompetitorAnalysisPage />} />
        
        {/* Solution Pages (Public) */}
        <Route path="/solutions/marketers" element={<ForMarketersPage />} />
        <Route path="/solutions/agencies" element={<ForAgenciesPage />} />
        <Route path="/solutions/enterprise" element={<ForEnterprisePage />} />
        
        {/* Resource Pages (Public) */}
        <Route path="/blog" element={<BlogPage />} />
        <Route path="/docs" element={<DocumentationPage />} />
        <Route path="/support" element={<SupportPage />} />
        
        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="min-h-screen bg-background">
          <AppRoutes />
          <ChatBot />
          <Toaster position="top-right" richColors />
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
