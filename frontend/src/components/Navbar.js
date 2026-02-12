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
import { User, LogOut, BarChart3, History, Search, Menu, X } from 'lucide-react';
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

  const navItems = isAuthenticated 
    ? [
        { 
          label: 'Dashboard', 
          href: '/dashboard',
          bgColor: '#0D0716',
          links: []
        },
        { 
          label: 'Analyze', 
          href: '/analyze',
          bgColor: '#170D27',
          links: []
        },
        { 
          label: 'History', 
          href: '/history',
          bgColor: '#271E37',
          links: []
        }
      ]
    : [
        {
          label: 'Features',
          bgColor: '#0D0716',
          textColor: '#fff',
          links: [
            { label: 'SEO Analysis', href: '#', ariaLabel: 'SEO Analysis' },
            { label: 'Speed Metrics', href: '#', ariaLabel: 'Speed Metrics' },
            { label: 'Content Score', href: '#', ariaLabel: 'Content Score' },
          ]
        },
        {
          label: 'Solutions',
          bgColor: '#170D27',
          textColor: '#fff',
          links: [
            { label: 'For Marketers', href: '#', ariaLabel: 'For Marketers' },
            { label: 'For Agencies', href: '#', ariaLabel: 'For Agencies' },
            { label: 'For Enterprise', href: '#', ariaLabel: 'For Enterprise' },
          ]
        },
        {
          label: 'Resources',
          bgColor: '#271E37',
          textColor: '#fff',
          links: [
            { label: 'Blog', href: '#', ariaLabel: 'Blog' },
            { label: 'Documentation', href: '#', ariaLabel: 'Documentation' },
            { label: 'Support', href: '#', ariaLabel: 'Support' },
          ]
        }
      ];

  useLayoutEffect(() => {
    if (isOpen && !isAuthenticated) {
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
  }, [isOpen, isAuthenticated]);

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
      {isOpen && !isAuthenticated && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border" data-testid="navbar">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3" data-testid="logo-link">
              <Logo size="lg" circular />
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
            <div className="hidden md:flex items-center gap-1">
              {isAuthenticated ? (
                // Authenticated nav items
                navItems.map((item) => (
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
                ))
              ) : (
                // Non-authenticated nav items with hover dropdown
                navItems.map((item, index) => (
                  <button
                    key={item.label}
                    onMouseEnter={() => {
                      setIsOpen(true);
                      setHoveredItem(index);
                    }}
                    className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-muted"
                  >
                    {item.label}
                  </button>
                ))
              )}
            </div>

            {/* Right Side */}
            <div className="flex items-center gap-3">
              {isAuthenticated ? (
                <>
                  <Link to="/analyze" className="hidden sm:block">
                    <Button size="sm" className="rounded-full gap-2 bg-gray-700 hover:bg-gray-600" data-testid="new-analysis-btn">
                      <Search className="w-4 h-4" />
                      Analyze
                    </Button>
                  </Link>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="rounded-full" data-testid="user-menu-btn">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-gray-600 to-gray-800 p-0.5">
                          <div className="w-full h-full rounded-full bg-background flex items-center justify-center">
                            <User className="w-4 h-4 text-gray-400" />
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

        {/* Dropdown Menu for non-authenticated */}
        {!isAuthenticated && (
          <div
            ref={menuRef}
            className="absolute left-0 right-0 overflow-hidden h-0 opacity-0 bg-background border-b border-border"
            onMouseLeave={() => setIsOpen(false)}
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {navItems.map((item, index) => (
                  <div
                    key={item.label}
                    ref={(el) => (cardsRef.current[index] = el)}
                    onMouseEnter={() => handleCardHover(index)}
                    onMouseLeave={() => handleCardLeave(index)}
                    className="rounded-2xl p-6 transition-all cursor-pointer"
                    style={{
                      backgroundColor: item.bgColor,
                      color: item.textColor,
                    }}
                  >
                    <h3 className="text-lg font-semibold mb-4">{item.label}</h3>
                    <div className="space-y-1">
                      {item.links?.map((link) => (
                        <a
                          key={link.label}
                          href={link.href}
                          aria-label={link.ariaLabel}
                          className="group flex items-center justify-between py-3 px-4 rounded-lg hover:bg-white/10 transition-colors"
                        >
                          <span className="text-sm font-medium">{link.label}</span>
                          <GoArrowUpRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </a>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden border-t border-border bg-background">
            <div className="px-4 py-4 space-y-2">
              {isAuthenticated ? (
                <>
                  <Link
                    to="/dashboard"
                    className="block px-4 py-3 rounded-lg text-sm font-medium hover:bg-muted"
                    onClick={() => setIsOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <Link
                    to="/analyze"
                    className="block px-4 py-3 rounded-lg text-sm font-medium hover:bg-muted"
                    onClick={() => setIsOpen(false)}
                  >
                    New Analysis
                  </Link>
                  <Link
                    to="/history"
                    className="block px-4 py-3 rounded-lg text-sm font-medium hover:bg-muted"
                    onClick={() => setIsOpen(false)}
                  >
                    History
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="block px-4 py-3 rounded-lg text-sm font-medium hover:bg-muted"
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
                </>
              )}
            </div>
          </div>
        )}
      </nav>
    </>
  );
};

export default Navbar;
