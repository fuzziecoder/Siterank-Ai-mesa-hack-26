import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from './ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from './ui/sheet';
import { Search, BarChart3, History, LogOut, User, Menu } from 'lucide-react';
import { useState } from 'react';
import ShinyText from './ShinyText';
import Logo from './Logo';

export const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border" data-testid="navbar">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3" data-testid="logo-link">
            <Logo size="default" />
            <span className="font-bold text-lg tracking-tight hidden sm:block" style={{ fontFamily: "'Zen Dots', cursive" }}>
              <ShinyText 
                text="SITERANK AI" 
                speed={3} 
                color="#9ca3af" 
                shineColor="#e5e7eb"
                spread={100}
              />
            </span>
          </Link>

          {/* Desktop Navigation */}
          {isAuthenticated && (
            <div className="hidden md:flex items-center gap-6">
              <Link 
                to="/dashboard" 
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                data-testid="nav-dashboard"
              >
                Dashboard
              </Link>
              <Link 
                to="/analyze" 
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                data-testid="nav-analyze"
              >
                New Analysis
              </Link>
              <Link 
                to="/history" 
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                data-testid="nav-history"
              >
                History
              </Link>
            </div>
          )}

          {/* Right Side */}
          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <>
                <Link to="/analyze" className="hidden sm:block">
                  <Button size="sm" className="rounded-full gap-2" data-testid="new-analysis-btn">
                    <Search className="w-4 h-4" />
                    Analyze
                  </Button>
                </Link>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="rounded-full" data-testid="user-menu-btn">
                      <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
                        <User className="w-4 h-4 text-muted-foreground" />
                      </div>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <div className="px-2 py-1.5">
                      <p className="text-sm font-medium">{user?.name}</p>
                      <p className="text-xs text-muted-foreground">{user?.email}</p>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => navigate('/dashboard')} data-testid="menu-dashboard">
                      <BarChart3 className="w-4 h-4 mr-2" />
                      Dashboard
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/history')} data-testid="menu-history">
                      <History className="w-4 h-4 mr-2" />
                      History
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} className="text-destructive" data-testid="menu-logout">
                      <LogOut className="w-4 h-4 mr-2" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Mobile menu */}
                <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                  <SheetTrigger asChild className="md:hidden">
                    <Button variant="ghost" size="icon" data-testid="mobile-menu-btn">
                      <Menu className="w-5 h-5" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="right" className="w-64">
                    <div className="flex flex-col gap-4 mt-8">
                      <Link 
                        to="/dashboard" 
                        className="px-4 py-2 text-sm font-medium hover:bg-muted rounded-lg"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Dashboard
                      </Link>
                      <Link 
                        to="/analyze" 
                        className="px-4 py-2 text-sm font-medium hover:bg-muted rounded-lg"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        New Analysis
                      </Link>
                      <Link 
                        to="/history" 
                        className="px-4 py-2 text-sm font-medium hover:bg-muted rounded-lg"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        History
                      </Link>
                    </div>
                  </SheetContent>
                </Sheet>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login">
                  <Button variant="ghost" size="sm" data-testid="login-btn">Login</Button>
                </Link>
                <Link to="/register">
                  <Button size="sm" className="rounded-full" data-testid="signup-btn">Get Started</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};
