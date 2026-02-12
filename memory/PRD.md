# SITERANK AI - PRD

## Original Problem Statement
Build an AI Website Competitor Analyzer where business owners can:
- Upload their website URL and competitor website URLs
- System scrapes and extracts SEO, UI, performance, content info
- AI analyzes differences
- Dashboard shows score comparison, weakness areas, AI suggestions, action plan
- Features: URL input, auto competitor scrape, score comparison chart, AI suggestion text, download PDF report

## User Choices
- AI Provider: OpenAI GPT-5.2 with Emergent LLM key
- Scraping: BeautifulSoup (basic, lighter)
- Performance Metrics: Built-in estimation
- Authentication: JWT-based (email/password)
- Branding: SITERANK AI with hexagonal cube logo
- No SaaS scaling features (monitoring, weekly reports)

## Architecture

### Backend (FastAPI + MongoDB)
- `/app/backend/server.py` - Main API server with routes
- `/app/backend/models.py` - Pydantic models
- `/app/backend/scraper.py` - BeautifulSoup web scraper
- `/app/backend/analyzer.py` - Score calculation engine
- `/app/backend/llm_engine.py` - GPT-5.2 integration for AI suggestions
- `/app/backend/auth.py` - JWT authentication

### Frontend (React + Tailwind CSS)
- Landing page with hero section
- Auth pages (login/register)
- Dashboard with stats overview
- Analysis creation page
- Analysis results with charts (Recharts)
- History page with search/delete

## User Personas
1. **Business Owner** - Wants to understand website performance vs competitors
2. **Marketing Manager** - Needs actionable SEO/content recommendations
3. **SEO Professional** - Requires detailed metrics and comparison data

## Core Requirements (Static)
- [x] User authentication (JWT)
- [x] URL input for user site + competitors (up to 5)
- [x] Website scraping (SEO, speed, content, UX metrics)
- [x] Score calculation (weighted: SEO 30%, Speed 20%, Content 30%, UX 20%)
- [x] Competitor comparison with charts
- [x] AI-powered improvement suggestions (GPT-5.2)
- [x] Action plan generation
- [x] Report download (text format)

## What's Been Implemented (Jan 2026)

### Backend
- FastAPI server with JWT authentication (7-day token expiry)
- MongoDB integration for users and analyses
- Website scraper using BeautifulSoup extracting:
  - SEO: title, meta tags, headings, structured data, links, images
  - Speed: load time, page size, resources, compression
  - Content: word count, paragraphs, blog/FAQ detection
  - UX: mobile viewport, navigation, forms, accessibility
- Scoring engine with weighted overall score
- GPT-5.2 integration via emergentintegrations library
- Background task processing for analyses
- Report download endpoint

### Frontend
- Landing page with hero, features, how-it-works sections
- User registration and login
- Dashboard with stats (total, completed, avg/best scores)
- New analysis form with URL validation
- Analysis results page with:
  - Overall score display
  - Bar chart comparison (Recharts)
  - Radar chart for performance visualization
  - AI Suggestions tab with GPT-5.2 recommendations
  - Action plan with prioritized items
  - Details tab with metric breakdowns
- History page with search and delete functionality

## Prioritized Backlog

### P0 (Critical) - DONE
- [x] User authentication
- [x] Website analysis core flow
- [x] Score comparison
- [x] AI suggestions

### P1 (Important)
- [ ] PDF report generation (currently text format)
- [ ] Analysis re-run capability
- [ ] Improved error handling for scraping failures

### P2 (Nice to Have)
- [ ] Dashboard charts showing score trends over time
- [ ] Email notifications when analysis completes
- [ ] Export analysis data to CSV
- [ ] Compare specific pages (not just homepages)

### P3 (Future)
- [ ] Continuous monitoring (SaaS feature)
- [ ] Weekly AI strategy reports
- [ ] Auto improvement checklist tracking

## Next Tasks
1. Consider adding PDF report generation using a library like reportlab
2. Add re-analyze button to run analysis again with latest data
3. Implement better error states for failed competitor scrapes
4. Add loading skeletons for better perceived performance
