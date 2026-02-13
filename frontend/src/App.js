import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Toaster } from './components/ui/sonner';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import AnalyzePage from './pages/AnalyzePage';
import AnalysisResultPage from './pages/AnalysisResultPage';
import HistoryPage from './pages/HistoryPage';
// Feature Pages
import SEOAnalysisPage from './pages/SEOAnalysisPage';
import SpeedMetricsPage from './pages/SpeedMetricsPage';
import ContentScorePage from './pages/ContentScorePage';
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
      {isAuthenticated && <Navbar />}
      <Routes>
        {/* Public Routes */}
        <Route 
          path="/" 
          element={
            isAuthenticated ? <Navigate to="/dashboard" replace /> : (
              <>
                <Navbar />
                <LandingPage />
              </>
            )
          } 
        />
        <Route 
          path="/login" 
          element={
            <PublicRoute>
              <Navbar />
              <LoginPage />
            </PublicRoute>
          } 
        />
        <Route 
          path="/register" 
          element={
            <PublicRoute>
              <Navbar />
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
        
        {/* Feature Pages (Public with Navbar) */}
        <Route path="/features/seo" element={<><Navbar /><SEOAnalysisPage /></>} />
        <Route path="/features/speed" element={<><Navbar /><SpeedMetricsPage /></>} />
        <Route path="/features/content" element={<><Navbar /><ContentScorePage /></>} />
        
        {/* Solution Pages (Public with Navbar) */}
        <Route path="/solutions/marketers" element={<><Navbar /><ForMarketersPage /></>} />
        <Route path="/solutions/agencies" element={<><Navbar /><ForAgenciesPage /></>} />
        <Route path="/solutions/enterprise" element={<><Navbar /><ForEnterprisePage /></>} />
        
        {/* Resource Pages (Public with Navbar) */}
        <Route path="/blog" element={<><Navbar /><BlogPage /></>} />
        <Route path="/docs" element={<><Navbar /><DocumentationPage /></>} />
        <Route path="/support" element={<><Navbar /><SupportPage /></>} />
        
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
          <Toaster position="top-right" richColors />
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
