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
- `/app/backend/competitor_detector.py` - AI-powered competitor auto-detection

### Frontend (React + Tailwind CSS)
- Landing page with hero section
- Auth pages (login/register)
- Dashboard with stats overview
- Analysis creation page with auto-detect competitors feature
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
- [x] **NEW: Auto-detect competitors using AI**

## What's Been Implemented (Feb 2026)

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
- **NEW: Auto-detect competitors API (`POST /api/competitors/detect`)**
- **NEW: Industry insights generation**

### Frontend
- Landing page with hero, features, how-it-works sections
- User registration and login
- Dashboard with stats (total, completed, avg/best scores)
- New analysis form with URL validation
- **NEW: Auto-detect competitors button**
- **NEW: Industry insights display (green-tinted box)**
- **NEW: Emerald green button colors**
- **NEW: Larger logo (80x80px) without circular wrapper**
- Analysis results page with:
  - Overall score display
  - Bar chart comparison (Recharts)
  - Radar chart for performance visualization
  - AI Suggestions tab with GPT-5.2 recommendations
  - Action plan with prioritized items
  - Details tab with metric breakdowns
- History page with search and delete functionality

### UI Components
- `/app/frontend/src/components/Logo.js` - Updated logo (larger, no circle)
- `/app/frontend/src/components/StarBorder.js` - New animated border component (created, not yet integrated)
- `/app/frontend/src/components/ShinyText.js` - Brand text effect
- `/app/frontend/src/components/Navbar.js` - Navigation with dropdown menus

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login user |
| GET | `/api/auth/me` | Get current user |
| POST | `/api/analyses` | Create new analysis |
| GET | `/api/analyses` | List user analyses |
| GET | `/api/analyses/{id}` | Get specific analysis |
| DELETE | `/api/analyses/{id}` | Delete analysis |
| GET | `/api/analyses/{id}/report` | Download report |
| GET | `/api/dashboard/stats` | Get dashboard stats |
| **POST** | **`/api/competitors/detect`** | **Auto-detect competitors (NEW)** |

## Prioritized Backlog

### P0 (Critical) - DONE
- [x] User authentication
- [x] Website analysis core flow
- [x] Score comparison
- [x] AI suggestions
- [x] Auto-detect competitors

### P1 (Important)
- [ ] PDF report generation (currently text format)
- [ ] Improved error handling for scraping failures
- [ ] "AI Growth Advisor" - proactive strategic advice based on competitor trends
- [ ] Functional navigation links (Blog, Documentation, Support pages)

### P2 (Nice to Have)
- [ ] Dashboard charts showing score trends over time
- [ ] Email notifications when analysis completes
- [ ] Export analysis data to CSV
- [ ] Compare specific pages (not just homepages)
- [ ] Light/Dark mode toggle
- [ ] User settings page

### P3 (Future)
- [ ] Continuous monitoring (SaaS feature)
- [ ] Weekly AI strategy reports
- [ ] Auto improvement checklist tracking
- [ ] Integrate StarBorder component into key buttons

## Testing Status
- Backend: 100% pass rate (20 tests)
- Frontend: 100% pass rate (UI verification)
- Test report: `/app/test_reports/iteration_3.json`

## Next Tasks
1. Consider adding PDF report generation using a library like reportlab
2. Implement "AI Growth Advisor" feature for proactive advice
3. Create basic pages for navigation links (Blog, Documentation, Support)
4. Add loading skeletons for better perceived performance
