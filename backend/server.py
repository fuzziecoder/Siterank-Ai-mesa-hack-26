from fastapi import FastAPI, APIRouter, HTTPException, Depends, BackgroundTasks, status
from fastapi.responses import StreamingResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
import json
from pathlib import Path
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from datetime import datetime, timezone
import io
import zipfile

from models import (
    UserCreate, UserLogin, User, UserResponse, TokenResponse,
    AnalysisCreate, AnalysisResult, AnalysisResponse, AnalysisSummary,
    WebsiteScore, CompetitorData
)
from auth import hash_password, verify_password, create_access_token, get_current_user
from scraper import scrape_website
from analyzer import analyze_scraped_data, compare_all
from llm_engine import generate_ai_suggestions
from competitor_detector import detect_competitors, get_industry_insights
from optimization_engine import generate_optimization_blueprint
from seo_analyzer import analyze_seo
from speed_analyzer import analyze_speed
from content_analyzer import analyze_content


# ==================== Competitor Detection ====================

class CompetitorDetectRequest(BaseModel):
    user_site_url: str
    industry_hint: Optional[str] = ""


class CompetitorDetectResponse(BaseModel):
    competitors: List[str]
    industry_insights: Optional[dict] = None


# ==================== SEO Analysis ====================

class SEOAnalyzeRequest(BaseModel):
    url: str


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app
app = FastAPI(title="AI Website Competitor Analyzer")

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


# ==================== Auth Routes ====================

@api_router.post("/auth/register", response_model=TokenResponse)
async def register(user_data: UserCreate):
    """Register a new user"""
    # Check if user already exists
    existing_user = await db.users.find_one({"email": user_data.email}, {"_id": 0})
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Create new user
    user = User(
        email=user_data.email,
        name=user_data.name
    )
    
    # Store user with hashed password
    user_doc = user.model_dump()
    user_doc['password_hash'] = hash_password(user_data.password)
    user_doc['created_at'] = user_doc['created_at'].isoformat()
    
    await db.users.insert_one(user_doc)
    
    # Generate token
    token = create_access_token(user.id, user.email)
    
    return TokenResponse(
        access_token=token,
        user=UserResponse(
            id=user.id,
            email=user.email,
            name=user.name,
            created_at=user_doc['created_at']
        )
    )


@api_router.post("/auth/login", response_model=TokenResponse)
async def login(credentials: UserLogin):
    """Login user and return JWT token"""
    # Find user
    user_doc = await db.users.find_one({"email": credentials.email}, {"_id": 0})
    if not user_doc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )
    
    # Verify password
    if not verify_password(credentials.password, user_doc.get('password_hash', '')):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )
    
    # Generate token
    token = create_access_token(user_doc['id'], user_doc['email'])
    
    return TokenResponse(
        access_token=token,
        user=UserResponse(
            id=user_doc['id'],
            email=user_doc['email'],
            name=user_doc['name'],
            created_at=user_doc['created_at']
        )
    )


@api_router.get("/auth/me", response_model=UserResponse)
async def get_me(current_user: dict = Depends(get_current_user)):
    """Get current user info"""
    user_doc = await db.users.find_one({"id": current_user['user_id']}, {"_id": 0})
    if not user_doc:
        raise HTTPException(status_code=404, detail="User not found")
    
    return UserResponse(
        id=user_doc['id'],
        email=user_doc['email'],
        name=user_doc['name'],
        created_at=user_doc['created_at']
    )


# ==================== Analysis Routes ====================

async def run_analysis(analysis_id: str, user_site_url: str, competitor_urls: List[str]):
    """Background task to run website analysis"""
    try:
        logger.info(f"Starting analysis {analysis_id}")
        
        # Update status to processing
        await db.analyses.update_one(
            {"id": analysis_id},
            {"$set": {"status": "processing"}}
        )
        
        # Scrape user's website
        success, user_data = scrape_website(user_site_url)
        if not success:
            raise Exception(f"Failed to scrape user website: {user_site_url}")
        
        user_scores = analyze_scraped_data(user_data)
        
        # Scrape competitor websites
        competitors = []
        competitor_score_objects = []
        
        for comp_url in competitor_urls:
            try:
                success, comp_data = scrape_website(comp_url)
                if success:
                    comp_scores = analyze_scraped_data(comp_data)
                    competitor_score_objects.append(comp_scores)
                    competitors.append(CompetitorData(
                        url=comp_url,
                        scores=comp_scores,
                        title=comp_data.get('title', ''),
                        meta_description=comp_data.get('seo', {}).get('meta_description', '')
                    ))
                else:
                    # Add with zero scores if scraping fails
                    competitors.append(CompetitorData(
                        url=comp_url,
                        scores=WebsiteScore(),
                        title="Unable to scrape"
                    ))
            except Exception as e:
                logger.error(f"Error scraping competitor {comp_url}: {str(e)}")
                competitors.append(CompetitorData(
                    url=comp_url,
                    scores=WebsiteScore(),
                    title="Error during scraping"
                ))
        
        # Compare websites
        comparison = compare_all(user_scores, competitor_score_objects)
        
        # Generate AI suggestions
        user_scores_dict = user_scores.model_dump()
        competitors_dict = [{"url": c.url, "scores": c.scores.model_dump()} for c in competitors]
        
        ai_suggestions, action_plan = await generate_ai_suggestions(
            user_site_url,
            user_scores_dict,
            competitors_dict,
            comparison
        )
        
        # Update analysis with results
        completed_at = datetime.now(timezone.utc)
        await db.analyses.update_one(
            {"id": analysis_id},
            {"$set": {
                "status": "completed",
                "user_site_scores": user_scores.model_dump(),
                "competitors": [c.model_dump() for c in competitors],
                "ai_suggestions": ai_suggestions,
                "action_plan": action_plan,
                "completed_at": completed_at.isoformat()
            }}
        )
        
        logger.info(f"Analysis {analysis_id} completed successfully")
        
    except Exception as e:
        logger.error(f"Analysis {analysis_id} failed: {str(e)}")
        await db.analyses.update_one(
            {"id": analysis_id},
            {"$set": {
                "status": "failed",
                "ai_suggestions": f"Analysis failed: {str(e)}",
                "completed_at": datetime.now(timezone.utc).isoformat()
            }}
        )


@api_router.post("/analyses", response_model=AnalysisResponse)
async def create_analysis(
    analysis_data: AnalysisCreate,
    background_tasks: BackgroundTasks,
    current_user: dict = Depends(get_current_user)
):
    """Create a new website analysis"""
    # Validate URLs
    if not analysis_data.user_site_url:
        raise HTTPException(status_code=400, detail="User site URL is required")
    
    if len(analysis_data.competitor_urls) > 5:
        raise HTTPException(status_code=400, detail="Maximum 5 competitor URLs allowed")
    
    # Create analysis record
    analysis = AnalysisResult(
        user_id=current_user['user_id'],
        user_site_url=analysis_data.user_site_url,
        user_site_scores=WebsiteScore(),
        competitors=[],
        status="pending"
    )
    
    # Store in database
    analysis_doc = analysis.model_dump()
    analysis_doc['created_at'] = analysis_doc['created_at'].isoformat()
    if analysis_doc.get('completed_at'):
        analysis_doc['completed_at'] = analysis_doc['completed_at'].isoformat()
    
    await db.analyses.insert_one(analysis_doc)
    
    # Start background analysis
    background_tasks.add_task(
        run_analysis,
        analysis.id,
        analysis_data.user_site_url,
        analysis_data.competitor_urls
    )
    
    return AnalysisResponse(
        id=analysis.id,
        user_id=analysis.user_id,
        user_site_url=analysis.user_site_url,
        user_site_scores=analysis.user_site_scores,
        competitors=analysis.competitors,
        ai_suggestions=analysis.ai_suggestions,
        action_plan=analysis.action_plan,
        status=analysis.status,
        created_at=analysis_doc['created_at'],
        completed_at=analysis_doc.get('completed_at')
    )


@api_router.get("/analyses", response_model=List[AnalysisSummary])
async def get_analyses(
    current_user: dict = Depends(get_current_user),
    limit: int = 20,
    skip: int = 0
):
    """Get list of user's analyses"""
    cursor = db.analyses.find(
        {"user_id": current_user['user_id']},
        {
            "_id": 0,
            "id": 1,
            "user_site_url": 1,
            "user_site_scores.overall_score": 1,
            "competitors": 1,
            "status": 1,
            "created_at": 1
        }
    ).sort("created_at", -1).skip(skip).limit(limit)
    
    analyses = await cursor.to_list(length=limit)
    
    return [
        AnalysisSummary(
            id=a['id'],
            user_site_url=a['user_site_url'],
            overall_score=a.get('user_site_scores', {}).get('overall_score', 0),
            competitor_count=len(a.get('competitors', [])),
            status=a['status'],
            created_at=a['created_at']
        )
        for a in analyses
    ]


@api_router.get("/analyses/{analysis_id}", response_model=AnalysisResponse)
async def get_analysis(
    analysis_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Get a specific analysis by ID"""
    analysis = await db.analyses.find_one(
        {"id": analysis_id, "user_id": current_user['user_id']},
        {"_id": 0}
    )
    
    if not analysis:
        raise HTTPException(status_code=404, detail="Analysis not found")
    
    return AnalysisResponse(
        id=analysis['id'],
        user_id=analysis['user_id'],
        user_site_url=analysis['user_site_url'],
        user_site_scores=WebsiteScore(**analysis.get('user_site_scores', {})),
        competitors=[CompetitorData(**c) for c in analysis.get('competitors', [])],
        ai_suggestions=analysis.get('ai_suggestions', ''),
        action_plan=analysis.get('action_plan', []),
        status=analysis['status'],
        created_at=analysis['created_at'],
        completed_at=analysis.get('completed_at')
    )


@api_router.delete("/analyses/{analysis_id}")
async def delete_analysis(
    analysis_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Delete an analysis"""
    result = await db.analyses.delete_one(
        {"id": analysis_id, "user_id": current_user['user_id']}
    )
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Analysis not found")
    
    return {"message": "Analysis deleted successfully"}


@api_router.get("/analyses/{analysis_id}/report")
async def download_report(
    analysis_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Download analysis report as text file"""
    analysis = await db.analyses.find_one(
        {"id": analysis_id, "user_id": current_user['user_id']},
        {"_id": 0}
    )
    
    if not analysis:
        raise HTTPException(status_code=404, detail="Analysis not found")
    
    if analysis['status'] != 'completed':
        raise HTTPException(status_code=400, detail="Analysis not yet completed")
    
    # Generate report content
    scores = analysis.get('user_site_scores', {})
    report = f"""
================================================================================
                    AI WEBSITE COMPETITOR ANALYSIS REPORT
================================================================================

Generated: {datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M:%S UTC')}
Website Analyzed: {analysis['user_site_url']}

--------------------------------------------------------------------------------
                              OVERALL SCORES
--------------------------------------------------------------------------------

Your Website Performance:
  • Overall Score: {scores.get('overall_score', 0)}/100
  • SEO Score: {scores.get('seo_score', 0)}/100
  • Speed Score: {scores.get('speed_score', 0)}/100
  • Content Score: {scores.get('content_score', 0)}/100
  • UX Score: {scores.get('ux_score', 0)}/100

--------------------------------------------------------------------------------
                           COMPETITOR COMPARISON
--------------------------------------------------------------------------------
"""
    
    for i, comp in enumerate(analysis.get('competitors', []), 1):
        comp_scores = comp.get('scores', {})
        report += f"""
Competitor {i}: {comp.get('url', 'Unknown')}
  • Overall: {comp_scores.get('overall_score', 0)}/100
  • SEO: {comp_scores.get('seo_score', 0)}/100 | Speed: {comp_scores.get('speed_score', 0)}/100
  • Content: {comp_scores.get('content_score', 0)}/100 | UX: {comp_scores.get('ux_score', 0)}/100
"""

    report += f"""
--------------------------------------------------------------------------------
                           AI RECOMMENDATIONS
--------------------------------------------------------------------------------

{analysis.get('ai_suggestions', 'No suggestions available')}

--------------------------------------------------------------------------------
                              ACTION PLAN
--------------------------------------------------------------------------------
"""
    
    for i, action in enumerate(analysis.get('action_plan', []), 1):
        report += f"\n{i}. {action}"
    
    report += """

================================================================================
                         END OF REPORT
================================================================================
"""
    
    # Create file response
    buffer = io.BytesIO(report.encode('utf-8'))
    buffer.seek(0)
    
    filename = f"analysis_report_{analysis_id[:8]}.txt"
    
    return StreamingResponse(
        buffer,
        media_type="text/plain",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )


# ==================== Dashboard Stats ====================

class DashboardStats(BaseModel):
    total_analyses: int
    completed_analyses: int
    avg_score: int
    best_score: int


@api_router.get("/dashboard/stats", response_model=DashboardStats)
async def get_dashboard_stats(current_user: dict = Depends(get_current_user)):
    """Get dashboard statistics for user"""
    # Get all user analyses
    cursor = db.analyses.find(
        {"user_id": current_user['user_id']},
        {"_id": 0, "status": 1, "user_site_scores": 1}
    )
    analyses = await cursor.to_list(length=1000)
    
    total = len(analyses)
    completed = sum(1 for a in analyses if a.get('status') == 'completed')
    
    scores = [
        a.get('user_site_scores', {}).get('overall_score', 0)
        for a in analyses
        if a.get('status') == 'completed'
    ]
    
    avg_score = int(sum(scores) / len(scores)) if scores else 0
    best_score = max(scores) if scores else 0
    
    return DashboardStats(
        total_analyses=total,
        completed_analyses=completed,
        avg_score=avg_score,
        best_score=best_score
    )


# ==================== Health Check ====================

@api_router.get("/")
async def root():
    return {"message": "AI Website Competitor Analyzer API", "status": "running"}


@api_router.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.now(timezone.utc).isoformat()}


# ==================== SEO Analysis ====================

@api_router.post("/seo/analyze")
async def seo_analyze_endpoint(
    request: SEOAnalyzeRequest,
    current_user: dict = Depends(get_current_user)
):
    """Comprehensive SEO analysis with AI-generated fixes"""
    if not request.url:
        raise HTTPException(status_code=400, detail="URL is required")
    
    try:
        result = await analyze_seo(request.url)
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"SEO analysis failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"SEO analysis failed: {str(e)}")


# ==================== Speed Analysis ====================

@api_router.post("/speed/analyze")
async def speed_analyze_endpoint(
    request: SEOAnalyzeRequest,
    current_user: dict = Depends(get_current_user)
):
    """Comprehensive speed analysis with optimization recommendations"""
    if not request.url:
        raise HTTPException(status_code=400, detail="URL is required")
    
    try:
        result = await analyze_speed(request.url)
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Speed analysis failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Speed analysis failed: {str(e)}")


# ==================== Content Analysis ====================

@api_router.post("/content/analyze")
async def content_analyze_endpoint(
    request: SEOAnalyzeRequest,
    current_user: dict = Depends(get_current_user)
):
    """Comprehensive content analysis with AI enhancement suggestions"""
    if not request.url:
        raise HTTPException(status_code=400, detail="URL is required")
    
    try:
        result = await analyze_content(request.url)
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Content analysis failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Content analysis failed: {str(e)}")


# ==================== Competitor Detection ====================

@api_router.post("/competitors/detect", response_model=CompetitorDetectResponse)
async def detect_competitors_endpoint(
    request: CompetitorDetectRequest,
    current_user: dict = Depends(get_current_user)
):
    """Auto-detect competitors for a given website using AI"""
    if not request.user_site_url:
        raise HTTPException(status_code=400, detail="User site URL is required")
    
    try:
        # Detect competitors using AI
        competitors = await detect_competitors(
            request.user_site_url,
            request.industry_hint
        )
        
        # Optionally get industry insights
        industry_insights = None
        if competitors:
            industry_insights = await get_industry_insights(
                request.user_site_url,
                competitors
            )
        
        return CompetitorDetectResponse(
            competitors=competitors,
            industry_insights=industry_insights
        )
    except Exception as e:
        logger.error(f"Competitor detection failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to detect competitors: {str(e)}")


# ==================== Optimization Blueprint ====================

class OptimizeRequest(BaseModel):
    user_site_url: str
    competitor_urls: Optional[List[str]] = []
    auto_detect_competitors: Optional[bool] = True


@api_router.post("/optimize")
async def generate_optimization(
    request: OptimizeRequest,
    current_user: dict = Depends(get_current_user)
):
    """Generate a comprehensive AI-powered optimization blueprint"""
    if not request.user_site_url:
        raise HTTPException(status_code=400, detail="User site URL is required")
    
    try:
        logger.info(f"Starting optimization for {request.user_site_url}")
        
        # Step 1: Scrape user's website
        success, user_data = scrape_website(request.user_site_url)
        if not success:
            error_msg = user_data.get('error', 'Failed to fetch website')
            raise HTTPException(status_code=400, detail=f"{error_msg}")
        
        user_scores = analyze_scraped_data(user_data)
        
        # Step 2: Get competitors (auto-detect or use provided)
        competitor_urls = request.competitor_urls or []
        if request.auto_detect_competitors and len(competitor_urls) < 3:
            detected = await detect_competitors(request.user_site_url)
            competitor_urls = list(set(competitor_urls + detected))[:5]
        
        # Step 3: Analyze competitors
        competitors = []
        for comp_url in competitor_urls:
            try:
                success, comp_data = scrape_website(comp_url)
                if success:
                    comp_scores = analyze_scraped_data(comp_data)
                    competitors.append({
                        "url": comp_url,
                        "scores": comp_scores.model_dump()
                    })
            except Exception as e:
                logger.warning(f"Failed to analyze competitor {comp_url}: {str(e)}")
        
        # Step 4: Generate AI optimization blueprint
        blueprint = await generate_optimization_blueprint(
            request.user_site_url,
            user_scores.model_dump(),
            competitors,
            user_data
        )
        
        # Step 5: Save optimization to database
        optimization_doc = {
            "user_id": current_user['user_id'],
            "user_site_url": request.user_site_url,
            "user_scores": user_scores.model_dump(),
            "competitors": competitors,
            "blueprint": blueprint,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        
        await db.optimizations.insert_one(optimization_doc)
        
        return {
            "success": True,
            "user_site_url": request.user_site_url,
            "user_scores": user_scores.model_dump(),
            "competitors": competitors,
            "blueprint": blueprint
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Optimization failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Optimization failed: {str(e)}")


@api_router.get("/optimizations")
async def get_optimizations(
    current_user: dict = Depends(get_current_user),
    limit: int = 10
):
    """Get user's optimization history"""
    cursor = db.optimizations.find(
        {"user_id": current_user['user_id']},
        {"_id": 0}
    ).sort("created_at", -1).limit(limit)
    
    optimizations = await cursor.to_list(length=limit)
    return optimizations


# ==================== Chatbot API ====================

class ChatMessage(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    messages: List[ChatMessage]

class ChatResponse(BaseModel):
    response: str
    reasoning: Optional[str] = None

@api_router.post("/chatbot", response_model=ChatResponse)
async def chatbot_endpoint(request: ChatRequest):
    """AI-powered chatbot using NVIDIA DeepSeek API"""
    from openai import OpenAI
    
    nvidia_api_key = os.environ.get('NVIDIA_API_KEY')
    nvidia_base_url = os.environ.get('NVIDIA_BASE_URL', 'https://integrate.api.nvidia.com/v1')
    
    if not nvidia_api_key:
        raise HTTPException(status_code=500, detail="NVIDIA API key not configured")
    
    try:
        client_ai = OpenAI(
            base_url=nvidia_base_url,
            api_key=nvidia_api_key
        )
        
        # Build system message for SITERANK AI context
        system_message = {
            "role": "system",
            "content": """You are the SITERANK AI Assistant, a helpful chatbot for a website competitor analysis platform. 

Your knowledge includes:
- **Optimize My Site**: Full AI analysis with optimization blueprint, auto-detects competitors, generates 30-day strategy
- **SEO Analysis**: Checks meta tags, heading structure, generates Schema.org markup, provides AI fixes
- **Speed Metrics**: Measures load time, page size, image optimization, caching recommendations
- **Content Score**: Analyzes word count, readability, detects thin content, generates blog ideas
- **Competitor Analysis**: Compare your site against competitors with detailed score comparisons

How to get started:
1. Register or Login to your account
2. Click "Optimize My Site" for a full analysis
3. Or use specific tools (SEO, Speed, Content)
4. Review the AI recommendations
5. Copy fixes and implement them!

Be helpful, concise, and guide users to the right features. SITERANK AI is currently free to use."""
        }
        
        # Convert messages to API format
        api_messages = [system_message]
        for msg in request.messages:
            api_messages.append({"role": msg.role, "content": msg.content})
        
        # Call NVIDIA DeepSeek API
        completion = client_ai.chat.completions.create(
            model="deepseek-ai/deepseek-v3.2",
            messages=api_messages,
            temperature=0.7,
            top_p=0.95,
            max_tokens=1024,
            stream=False
        )
        
        response_text = completion.choices[0].message.content
        
        return ChatResponse(response=response_text)
        
    except Exception as e:
        logger.error(f"Chatbot API error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Chatbot error: {str(e)}")


# ==================== Auto-Fix APIs ====================

from auto_fix_engine import (
    SEOFixRequest, SpeedFixRequest, ContentFixRequest, FixResponse,
    generate_seo_fixes, generate_speed_fixes, generate_content_fixes
)

@api_router.post("/fix/seo", response_model=FixResponse)
async def fix_seo_issues(request: SEOFixRequest):
    """Generate AI-powered SEO fixes for detected issues"""
    try:
        result = await generate_seo_fixes(request)
        return result
    except Exception as e:
        logger.error(f"SEO fix error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to generate SEO fixes: {str(e)}")


@api_router.post("/fix/speed", response_model=FixResponse)
async def fix_speed_issues(request: SpeedFixRequest):
    """Generate AI-powered speed optimization fixes"""
    try:
        result = await generate_speed_fixes(request)
        return result
    except Exception as e:
        logger.error(f"Speed fix error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to generate speed fixes: {str(e)}")


@api_router.post("/fix/content", response_model=FixResponse)
async def fix_content_issues(request: ContentFixRequest):
    """Generate AI-powered content fixes and rewrites"""
    try:
        result = await generate_content_fixes(request)
        return result
    except Exception as e:
        logger.error(f"Content fix error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to generate content fixes: {str(e)}")


# ==================== Download All Fixes as ZIP ====================

class AllFixesRequest(BaseModel):
    url: str
    seo_fixes: Optional[List[Dict[str, Any]]] = []
    speed_fixes: Optional[List[Dict[str, Any]]] = []
    content_fixes: Optional[List[Dict[str, Any]]] = []
    server_type: Optional[str] = "nginx"

@api_router.post("/fix/download-zip")
async def download_all_fixes_zip(request: AllFixesRequest):
    """Generate a ZIP file containing all fixes"""
    
    # Create in-memory ZIP file
    zip_buffer = io.BytesIO()
    
    with zipfile.ZipFile(zip_buffer, 'w', zipfile.ZIP_DEFLATED) as zip_file:
        # Add README
        readme_content = f"""# SITERANK AI - Website Fixes Package
# Generated: {datetime.now().isoformat()}
# URL: {request.url}

## Contents:
- seo-fixes.html - SEO improvements (meta tags, schema, etc.)
- speed-fixes.conf - Performance configurations ({request.server_type})
- content-fixes.html - Content improvements and rewrites

## How to Use:
1. Open each file and review the fixes
2. Copy the relevant code snippets
3. Implement in your website
4. Re-run analysis to verify improvements

## Support:
Visit https://siterankai.com for more help
"""
        zip_file.writestr("README.md", readme_content)
        
        # Add SEO fixes
        if request.seo_fixes:
            seo_content = f"""<!-- SITERANK AI - SEO Fixes for {request.url} -->
<!-- Generated: {datetime.now().isoformat()} -->

"""
            for i, fix in enumerate(request.seo_fixes, 1):
                seo_content += f"""
<!-- ==================== Fix {i}: {fix.get('issue', 'Unknown')} ==================== -->
<!-- Instructions: {fix.get('instructions', 'N/A')} -->
<!-- Placement: {fix.get('placement', 'N/A')} -->
<!-- Impact: {fix.get('impact', 'N/A')} -->

{fix.get('fixed_code', '')}

"""
            zip_file.writestr("seo-fixes.html", seo_content)
        
        # Add Speed fixes
        if request.speed_fixes:
            speed_content = f"""# SITERANK AI - Speed Fixes for {request.url}
# Server Type: {request.server_type}
# Generated: {datetime.now().isoformat()}

"""
            for i, fix in enumerate(request.speed_fixes, 1):
                speed_content += f"""
# ==================== Fix {i}: {fix.get('issue', 'Unknown')} ====================
# Instructions: {fix.get('instructions', 'N/A')}
# Impact: {fix.get('impact', 'N/A')}

{fix.get('fixed_code', '')}

"""
            
            # Set appropriate extension based on server type
            ext = ".conf" if request.server_type in ["nginx", "apache"] else ".js"
            zip_file.writestr(f"speed-fixes{ext}", speed_content)
        
        # Add Content fixes
        if request.content_fixes:
            content_content = f"""<!-- SITERANK AI - Content Fixes for {request.url} -->
<!-- Generated: {datetime.now().isoformat()} -->

"""
            for i, fix in enumerate(request.content_fixes, 1):
                content_content += f"""
<!-- ==================== Fix {i}: {fix.get('issue', 'Unknown')} ==================== -->
<!-- Section: {fix.get('section', 'N/A')} -->
<!-- Instructions: {fix.get('instructions', 'N/A')} -->
<!-- Word Count Change: {fix.get('word_count_delta', 'N/A')} -->

{fix.get('fixed_code', '')}

"""
            zip_file.writestr("content-fixes.html", content_content)
        
        # Add a summary JSON file
        summary = {
            "url": request.url,
            "generated_at": datetime.now().isoformat(),
            "total_fixes": len(request.seo_fixes or []) + len(request.speed_fixes or []) + len(request.content_fixes or []),
            "seo_fixes_count": len(request.seo_fixes or []),
            "speed_fixes_count": len(request.speed_fixes or []),
            "content_fixes_count": len(request.content_fixes or []),
            "server_type": request.server_type
        }
        zip_file.writestr("summary.json", json.dumps(summary, indent=2))
    
    # Prepare response
    zip_buffer.seek(0)
    
    # Generate filename
    domain = request.url.replace("https://", "").replace("http://", "").replace("/", "_")[:30]
    filename = f"siterank-fixes-{domain}.zip"
    
    return StreamingResponse(
        zip_buffer,
        media_type="application/zip",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )


# ==================== Ownership Verification ====================

import dns.resolver
import hashlib

class VerificationRequest(BaseModel):
    url: str
    user_email: str

class VerificationResponse(BaseModel):
    verified: bool
    method: Optional[str] = None
    message: str
    verification_code: str

def generate_verification_code(url: str, email: str) -> str:
    """Generate a unique verification code for a URL/user combination"""
    data = f"{url}:{email}:siterank-verify"
    return f"siterank-verify-{hashlib.sha256(data.encode()).hexdigest()[:16]}"

@api_router.post("/verify/generate-code", response_model=VerificationResponse)
async def generate_verification_code_endpoint(request: VerificationRequest):
    """Generate a verification code for domain ownership"""
    code = generate_verification_code(request.url, request.user_email)
    
    return VerificationResponse(
        verified=False,
        method=None,
        message="Add this TXT record to your DNS or create a verification file",
        verification_code=code
    )

@api_router.post("/verify/check", response_model=VerificationResponse)
async def check_ownership_verification(request: VerificationRequest):
    """Check if domain ownership is verified via DNS TXT or file"""
    import httpx
    
    code = generate_verification_code(request.url, request.user_email)
    
    # Extract domain from URL
    domain = request.url.replace("https://", "").replace("http://", "").split("/")[0]
    
    # Method 1: Check DNS TXT record
    try:
        answers = dns.resolver.resolve(domain, 'TXT')
        for rdata in answers:
            txt_value = str(rdata).strip('"')
            if code in txt_value:
                return VerificationResponse(
                    verified=True,
                    method="dns",
                    message="Domain ownership verified via DNS TXT record!",
                    verification_code=code
                )
    except Exception as e:
        logger.debug(f"DNS check failed for {domain}: {e}")
    
    # Method 2: Check verification file
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            file_url = f"https://{domain}/.well-known/siterank-verify.txt"
            response = await client.get(file_url)
            if response.status_code == 200 and code in response.text:
                return VerificationResponse(
                    verified=True,
                    method="file",
                    message="Domain ownership verified via verification file!",
                    verification_code=code
                )
    except Exception as e:
        logger.debug(f"File check failed for {domain}: {e}")
    
    return VerificationResponse(
        verified=False,
        method=None,
        message="Verification not found. Please add the DNS TXT record or upload the verification file.",
        verification_code=code
    )


# ==================== CMS Integration APIs ====================

class WordPressConnectRequest(BaseModel):
    site_url: str
    username: str
    app_password: str  # WordPress Application Password

class WordPressFixRequest(BaseModel):
    site_url: str
    username: str
    app_password: str
    fixes: List[Dict[str, Any]]
    fix_type: str  # 'seo', 'content'

class CMSConnectionResponse(BaseModel):
    connected: bool
    site_name: Optional[str] = None
    site_url: str
    message: str

@api_router.post("/cms/wordpress/connect", response_model=CMSConnectionResponse)
async def connect_wordpress(request: WordPressConnectRequest):
    """Test WordPress connection using REST API"""
    import httpx
    import base64
    
    try:
        # Create auth header
        credentials = f"{request.username}:{request.app_password}"
        auth_header = base64.b64encode(credentials.encode()).decode()
        
        async with httpx.AsyncClient(timeout=15.0) as client:
            # Test connection by getting site info
            api_url = f"{request.site_url}/wp-json/wp/v2/settings"
            response = await client.get(
                api_url,
                headers={"Authorization": f"Basic {auth_header}"}
            )
            
            if response.status_code == 200:
                data = response.json()
                return CMSConnectionResponse(
                    connected=True,
                    site_name=data.get('title', 'WordPress Site'),
                    site_url=request.site_url,
                    message="Successfully connected to WordPress!"
                )
            elif response.status_code == 401:
                return CMSConnectionResponse(
                    connected=False,
                    site_url=request.site_url,
                    message="Authentication failed. Check your username and application password."
                )
            else:
                return CMSConnectionResponse(
                    connected=False,
                    site_url=request.site_url,
                    message=f"Connection failed with status {response.status_code}"
                )
                
    except Exception as e:
        logger.error(f"WordPress connection error: {e}")
        return CMSConnectionResponse(
            connected=False,
            site_url=request.site_url,
            message=f"Connection error: {str(e)}"
        )

@api_router.post("/cms/wordpress/apply-seo")
async def apply_wordpress_seo_fixes(request: WordPressFixRequest):
    """Apply SEO fixes to WordPress using Yoast/RankMath API or custom meta"""
    import httpx
    import base64
    
    try:
        credentials = f"{request.username}:{request.app_password}"
        auth_header = base64.b64encode(credentials.encode()).decode()
        
        results = []
        
        async with httpx.AsyncClient(timeout=30.0) as client:
            for fix in request.fixes:
                # For SEO meta, we'd need to update post meta or use Yoast API
                # This is a simplified example
                if 'meta_description' in fix.get('issue', '').lower():
                    # Update site description via settings (requires admin)
                    try:
                        response = await client.post(
                            f"{request.site_url}/wp-json/wp/v2/settings",
                            headers={
                                "Authorization": f"Basic {auth_header}",
                                "Content-Type": "application/json"
                            },
                            json={"description": fix.get('fixed_value', '')}
                        )
                        results.append({
                            "issue": fix.get('issue'),
                            "applied": response.status_code == 200,
                            "message": "Updated site description" if response.status_code == 200 else "Failed to update"
                        })
                    except Exception as e:
                        results.append({
                            "issue": fix.get('issue'),
                            "applied": False,
                            "message": str(e)
                        })
                else:
                    results.append({
                        "issue": fix.get('issue'),
                        "applied": False,
                        "message": "This fix requires manual implementation or a supported SEO plugin"
                    })
        
        return {
            "success": True,
            "results": results,
            "message": f"Processed {len(results)} fixes"
        }
        
    except Exception as e:
        logger.error(f"WordPress fix application error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# ==================== White-Label PDF Report ====================

class WhiteLabelPDFRequest(BaseModel):
    url: str
    client_name: str
    agency_name: str
    agency_logo_url: Optional[str] = None
    agency_website: Optional[str] = None
    agency_email: Optional[str] = None
    primary_color: Optional[str] = "#10B981"  # Emerald by default
    seo_data: Dict[str, Any]
    speed_data: Dict[str, Any]
    content_data: Dict[str, Any]
    include_fixes: bool = True
    seo_fixes: Optional[List[Dict[str, Any]]] = []
    speed_fixes: Optional[List[Dict[str, Any]]] = []
    content_fixes: Optional[List[Dict[str, Any]]] = []

@api_router.post("/report/white-label-pdf")
async def generate_white_label_pdf(request: WhiteLabelPDFRequest):
    """Generate a white-label PDF report for agencies"""
    from reportlab.lib import colors
    from reportlab.lib.pagesizes import letter
    from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
    from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
    from reportlab.lib.units import inch
    
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=letter, topMargin=0.5*inch, bottomMargin=0.5*inch)
    
    styles = getSampleStyleSheet()
    story = []
    
    # Custom styles
    title_style = ParagraphStyle(
        'CustomTitle',
        parent=styles['Heading1'],
        fontSize=24,
        spaceAfter=20,
        textColor=colors.HexColor(request.primary_color)
    )
    
    heading_style = ParagraphStyle(
        'CustomHeading',
        parent=styles['Heading2'],
        fontSize=16,
        spaceBefore=15,
        spaceAfter=10,
        textColor=colors.HexColor(request.primary_color)
    )
    
    # Header
    story.append(Paragraph(request.agency_name or "Website Audit Report", title_style))
    story.append(Paragraph(f"Prepared for: <b>{request.client_name}</b>", styles['Normal']))
    story.append(Paragraph(f"Website: {request.url}", styles['Normal']))
    story.append(Paragraph(f"Date: {datetime.now().strftime('%B %d, %Y')}", styles['Normal']))
    story.append(Spacer(1, 20))
    
    # Overall Score
    overall_score = round((request.seo_data.get('score', 0) + 
                          request.speed_data.get('score', 0) + 
                          request.content_data.get('score', 0)) / 3)
    
    story.append(Paragraph("Executive Summary", heading_style))
    story.append(Paragraph(f"Overall Website Health Score: <b>{overall_score}/100</b>", styles['Normal']))
    story.append(Spacer(1, 10))
    
    # Score breakdown table
    score_data = [
        ['Category', 'Score', 'Status'],
        ['SEO', f"{request.seo_data.get('score', 0)}/100", 'Needs Work' if request.seo_data.get('score', 0) < 70 else 'Good'],
        ['Speed', f"{request.speed_data.get('score', 0)}/100", 'Needs Work' if request.speed_data.get('score', 0) < 70 else 'Good'],
        ['Content', f"{request.content_data.get('score', 0)}/100", 'Needs Work' if request.content_data.get('score', 0) < 70 else 'Good'],
    ]
    
    score_table = Table(score_data, colWidths=[2*inch, 1.5*inch, 1.5*inch])
    score_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor(request.primary_color)),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 12),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
        ('BACKGROUND', (0, 1), (-1, -1), colors.HexColor('#f3f4f6')),
        ('GRID', (0, 0), (-1, -1), 1, colors.HexColor('#e5e7eb')),
    ]))
    story.append(score_table)
    story.append(Spacer(1, 20))
    
    # Issues Found
    total_issues = (len(request.seo_data.get('issues', [])) + 
                   len(request.speed_data.get('issues', [])) + 
                   len(request.content_data.get('issues', [])))
    
    story.append(Paragraph(f"Issues Identified: {total_issues}", heading_style))
    
    # SEO Issues
    if request.seo_data.get('issues'):
        story.append(Paragraph("SEO Issues", heading_style))
        for i, issue in enumerate(request.seo_data['issues'][:5], 1):
            story.append(Paragraph(f"{i}. <b>{issue.get('issue', issue.get('name', 'Issue'))}</b>", styles['Normal']))
            if issue.get('description'):
                story.append(Paragraph(f"   {issue['description']}", styles['Normal']))
            story.append(Spacer(1, 5))
    
    # Speed Issues
    if request.speed_data.get('issues'):
        story.append(Paragraph("Performance Issues", heading_style))
        for i, issue in enumerate(request.speed_data['issues'][:5], 1):
            story.append(Paragraph(f"{i}. <b>{issue.get('issue', issue.get('name', 'Issue'))}</b>", styles['Normal']))
            if issue.get('description'):
                story.append(Paragraph(f"   {issue['description']}", styles['Normal']))
            story.append(Spacer(1, 5))
    
    # Content Issues
    if request.content_data.get('issues'):
        story.append(Paragraph("Content Issues", heading_style))
        for i, issue in enumerate(request.content_data['issues'][:5], 1):
            story.append(Paragraph(f"{i}. <b>{issue.get('issue', issue.get('name', 'Issue'))}</b>", styles['Normal']))
            if issue.get('description'):
                story.append(Paragraph(f"   {issue['description']}", styles['Normal']))
            story.append(Spacer(1, 5))
    
    # Recommendations
    story.append(Paragraph("Recommended Next Steps", heading_style))
    story.append(Paragraph("1. Address critical SEO issues (missing meta tags, schema markup)", styles['Normal']))
    story.append(Paragraph("2. Optimize page speed (image compression, caching)", styles['Normal']))
    story.append(Paragraph("3. Improve content depth and quality", styles['Normal']))
    story.append(Paragraph("4. Implement provided fix code snippets", styles['Normal']))
    story.append(Paragraph("5. Re-run analysis to verify improvements", styles['Normal']))
    
    # Footer
    story.append(Spacer(1, 30))
    if request.agency_website or request.agency_email:
        footer_text = f"Report generated by {request.agency_name}"
        if request.agency_website:
            footer_text += f" | {request.agency_website}"
        if request.agency_email:
            footer_text += f" | {request.agency_email}"
        story.append(Paragraph(footer_text, styles['Normal']))
    
    # Build PDF
    doc.build(story)
    buffer.seek(0)
    
    filename = f"{request.client_name.replace(' ', '-').lower()}-audit-report.pdf"
    
    return StreamingResponse(
        buffer,
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )


# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
