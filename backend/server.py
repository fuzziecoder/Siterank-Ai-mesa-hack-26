from fastapi import FastAPI, APIRouter, HTTPException, Depends, BackgroundTasks, status
from fastapi.responses import StreamingResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from datetime import datetime, timezone
import io

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
