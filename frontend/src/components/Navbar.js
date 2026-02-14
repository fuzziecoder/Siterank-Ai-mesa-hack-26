import React, { useLayoutEffect, useRef, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { gsap } from 'gsap';
import { GoArrowUpRight } from 'react-icons/go';
import { useAuth } from '../context/AuthContext';
import { Button } from './ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { User, LogOut, BarChart3, History, Search, Menu, X, Plus, Sparkles } from 'lucide-react';
import Logo from './Logo';
import ShinyText from './ShinyText';

export const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [hoveredItem, setHoveredItem] = useState(null);
  const menuRef = useRef(null);
  const cardsRef = useRef([]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Main navigation items (same for both authenticated and non-authenticated)
  const mainNavItems = [
    {
      label: 'Analyze',
      bgColor: '#0D0716',
      textColor: '#fff',
      links: [
        { label: 'Smart Analyze', href: '/smart-analyze', ariaLabel: 'Smart Analyze - Choose your analysis type' },
        { label: 'My Website', href: '/analyze/my-site', ariaLabel: 'Analyze your own website' },
        { label: 'Client Website', href: '/analyze/client-site', ariaLabel: 'Analyze client website' },
        { label: 'Competitor', href: '/analyze/competitor', ariaLabel: 'Competitor intelligence' },
      ]
    },
    {
      label: 'Features',
      bgColor: '#0D0716',
      textColor: '#fff',
      links: [
        { label: 'SEO Analysis', href: '/features/seo', ariaLabel: 'SEO Analysis' },
        { label: 'Speed Metrics', href: '/features/speed', ariaLabel: 'Speed Metrics' },
        { label: 'Content Score', href: '/features/content', ariaLabel: 'Content Score' },
        { label: 'Download All Fixes', href: '/features/download', ariaLabel: 'Download All Fixes' },
      ]
    },
    {
      label: 'Solutions',
      bgColor: '#170D27',
      textColor: '#fff',
      links: [
        { label: 'For Marketers', href: '/solutions/marketers', ariaLabel: 'For Marketers' },
        { label: 'For Agencies', href: '/solutions/agencies', ariaLabel: 'For Agencies' },
        { label: 'For Enterprise', href: '/solutions/enterprise', ariaLabel: 'For Enterprise' },
      ]
    },
    {
      label: 'Resources',
      bgColor: '#271E37',
      textColor: '#fff',
      links: [
        { label: 'Blog', href: '/blog', ariaLabel: 'Blog' },
        { label: 'Documentation', href: '/docs', ariaLabel: 'Documentation' },
        { label: 'Support', href: '/support', ariaLabel: 'Support' },
      ]
    }
  ];

  // Authenticated user quick links
  const authNavItems = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Analyze', href: '/analyze' },
    { label: 'History', href: '/history' },
  ];

  useLayoutEffect(() => {
    if (isOpen) {
      gsap.to(menuRef.current, {
        height: 'auto',
        opacity: 1,
        duration: 0.4,
        ease: 'power3.out',
      });
      gsap.fromTo(
        cardsRef.current.filter(Boolean),
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.4, stagger: 0.1, ease: 'power3.out' }
      );
    } else {
      gsap.to(menuRef.current, {
        height: 0,
        opacity: 0,
        duration: 0.3,
        ease: 'power3.out',
      });
    }
  }, [isOpen]);

  const handleCardHover = (index) => {
    setHoveredItem(index);
    if (cardsRef.current[index]) {
      gsap.to(cardsRef.current[index], {
        scale: 1.02,
        duration: 0.2,
        ease: 'power3.out',
      });
    }
  };

  const handleCardLeave = (index) => {
    setHoveredItem(null);
    if (cardsRef.current[index]) {
      gsap.to(cardsRef.current[index], {
        scale: 1,
        duration: 0.2,
        ease: 'power3.out',
      });
    }
  };

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border" data-testid="navbar">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo - Increased size */}
            <Link to="/" className="flex items-center gap-2 flex-shrink-0" data-testid="logo-link">
              <Logo size="2xl" />
              <span className="font-bold text-xl tracking-tight hidden sm:block whitespace-nowrap" style={{ fontFamily: "'Zen Dots', cursive" }}>
                <ShinyText 
                  text="SITERANK AI" 
                  speed={3} 
                  color="#9ca3af" 
                  shineColor="#e5e7eb"
                  spread={120}
                />
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-1">
              {/* Main nav items with dropdown */}
              {mainNavItems.map((item, index) => (
                <button
                  key={item.label}
                  onMouseEnter={() => setIsOpen(true)}
                  className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-muted"
                >
                  {item.label}
                </button>
              ))}
              
              {/* Authenticated quick links */}
              {isAuthenticated && (
                <>
                  <div className="w-px h-6 bg-border mx-2" />
                  {authNavItems.map((item) => (
                    <Link
                      key={item.label}
                      to={item.href}
                      className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                        location.pathname === item.href
                          ? 'text-foreground bg-muted'
                          : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                      }`}
                      data-testid={`nav-${item.label.toLowerCase()}`}
                    >
                      {item.label}
                    </Link>
                  ))}
                </>
              )}
            </div>

            {/* Right Side */}
            <div className="flex items-center gap-3">
              {isAuthenticated ? (
                <>
                  <Link to="/optimize" className="hidden sm:block">
                    <Button size="sm" className="rounded-full gap-2 bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white" data-testid="optimize-btn">
                      <Sparkles className="w-4 h-4" />
                      Optimize My Site
                    </Button>
                  </Link>
                  <Link to="/analyze" className="hidden md:block">
                    <Button size="sm" variant="outline" className="rounded-full gap-2 border-border text-muted-foreground hover:text-foreground" data-testid="new-analysis-btn">
                      <Plus className="w-4 h-4" />
                      New Analysis
                    </Button>
                  </Link>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="rounded-full" data-testid="user-menu-btn">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-600 to-gray-800 p-0.5">
                          <div className="w-full h-full rounded-full bg-background flex items-center justify-center">
                            <User className="w-5 h-5 text-gray-400" />
                          </div>
                        </div>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48 bg-card border-border">
                      <div className="px-2 py-1.5">
                        <p className="text-sm font-medium text-foreground">{user?.name}</p>
                        <p className="text-xs text-muted-foreground">{user?.email}</p>
                      </div>
                      <DropdownMenuSeparator className="bg-border" />
                      <DropdownMenuItem onClick={() => navigate('/dashboard')} className="text-muted-foreground hover:text-foreground" data-testid="menu-dashboard">
                        <BarChart3 className="w-4 h-4 mr-2" />
                        Dashboard
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => navigate('/history')} className="text-muted-foreground hover:text-foreground" data-testid="menu-history">
                        <History className="w-4 h-4 mr-2" />
                        History
                      </DropdownMenuItem>
                      <DropdownMenuSeparator className="bg-border" />
                      <DropdownMenuItem onClick={handleLogout} className="text-red-400 hover:text-red-300" data-testid="menu-logout">
                        <LogOut className="w-4 h-4 mr-2" />
                        Logout
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              ) : (
                <>
                  <Link to="/login" className="hidden sm:block">
                    <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground" data-testid="login-btn">
                      Login
                    </Button>
                  </Link>
                  <Link to="/register">
                    <Button size="sm" className="rounded-full bg-gray-700 hover:bg-gray-600 text-white" data-testid="signup-btn">
                      Get Started
                    </Button>
                  </Link>
                </>
              )}

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="md:hidden p-2 rounded-lg hover:bg-muted transition-colors"
                data-testid="mobile-menu-btn"
                aria-label="Toggle menu"
              >
                {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Dropdown Menu - Always available */}
        <div
          ref={menuRef}
          className="absolute left-0 right-0 overflow-hidden h-0 opacity-0 bg-background border-b border-border"
          onMouseLeave={() => setIsOpen(false)}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {mainNavItems.map((item, index) => (
                <div
                  key={item.label}
                  ref={(el) => (cardsRef.current[index] = el)}
                  onMouseEnter={() => handleCardHover(index)}
                  onMouseLeave={() => handleCardLeave(index)}
                  className="rounded-2xl p-6 transition-all"
                  style={{
                    backgroundColor: item.bgColor,
                    color: item.textColor,
                  }}
                >
                  <h3 className="text-lg font-semibold mb-4">{item.label}</h3>
                  <div className="space-y-1">
                    {item.links?.map((link) => (
                      <Link
                        key={link.label}
                        to={link.href}
                        aria-label={link.ariaLabel}
                        onClick={() => setIsOpen(false)}
                        className="group flex items-center justify-between py-3 px-4 rounded-lg hover:bg-white/10 transition-colors"
                      >
                        <span className="text-sm font-medium">{link.label}</span>
                        <GoArrowUpRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden border-t border-border bg-background">
            <div className="px-4 py-4 space-y-2">
              {/* Main nav items for mobile */}
              {mainNavItems.map((item) => (
                <div key={item.label} className="mb-4">
                  <p className="px-4 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">{item.label}</p>
                  {item.links.map((link) => (
                    <Link
                      key={link.label}
                      to={link.href}
                      className="block px-4 py-2 rounded-lg text-sm font-medium hover:bg-muted"
                      onClick={() => setIsOpen(false)}
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              ))}
              
              {/* Auth specific mobile links */}
              {isAuthenticated ? (
                <>
                  <div className="border-t border-border pt-4 mt-4">
                    <p className="px-4 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Quick Actions</p>
                    {authNavItems.map((item) => (
                      <Link
                        key={item.label}
                        to={item.href}
                        className="block px-4 py-2 rounded-lg text-sm font-medium hover:bg-muted"
                        onClick={() => setIsOpen(false)}
                      >
                        {item.label}
                      </Link>
                    ))}
                  </div>
                </>
              ) : (
                <div className="border-t border-border pt-4 mt-4 space-y-2">
                  <Link
                    to="/login"
                    className="block px-4 py-3 rounded-lg text-sm font-medium hover:bg-muted text-center"
                    onClick={() => setIsOpen(false)}
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="block px-4 py-3 rounded-lg text-sm font-medium bg-gray-700 text-white text-center"
                    onClick={() => setIsOpen(false)}
                  >
                    Get Started
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>
    </>
  );
};

export default Navbar;
