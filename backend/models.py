from pydantic import BaseModel, Field, EmailStr, ConfigDict
from typing import List, Optional, Dict, Any
from datetime import datetime, timezone
import uuid


# Auth Models
class UserCreate(BaseModel):
    email: EmailStr
    password: str
    name: str


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class User(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: EmailStr
    name: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class UserResponse(BaseModel):
    id: str
    email: str
    name: str
    created_at: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


# Analysis Models
class WebsiteScore(BaseModel):
    seo_score: int = 0
    speed_score: int = 0
    content_score: int = 0
    ux_score: int = 0
    overall_score: int = 0
    
    # Detailed metrics
    seo_details: Dict[str, Any] = {}
    speed_details: Dict[str, Any] = {}
    content_details: Dict[str, Any] = {}
    ux_details: Dict[str, Any] = {}


class CompetitorData(BaseModel):
    url: str
    scores: WebsiteScore
    title: Optional[str] = None
    meta_description: Optional[str] = None


class AnalysisCreate(BaseModel):
    user_site_url: str
    competitor_urls: List[str]


class AnalysisResult(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    user_site_url: str
    user_site_scores: WebsiteScore
    competitors: List[CompetitorData]
    ai_suggestions: str = ""
    action_plan: List[str] = []
    status: str = "pending"  # pending, processing, completed, failed
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    completed_at: Optional[datetime] = None


class AnalysisResponse(BaseModel):
    id: str
    user_id: str
    user_site_url: str
    user_site_scores: WebsiteScore
    competitors: List[CompetitorData]
    ai_suggestions: str
    action_plan: List[str]
    status: str
    created_at: str
    completed_at: Optional[str] = None


class AnalysisSummary(BaseModel):
    id: str
    user_site_url: str
    overall_score: int
    competitor_count: int
    status: str
    created_at: str
