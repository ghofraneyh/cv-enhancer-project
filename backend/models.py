from pydantic import BaseModel, Field, validator
from typing import List, Optional
from datetime import datetime

class CVAnalysisRequest(BaseModel):
    candidate_cv_text: str = Field(..., min_length=50, max_length=50000)
    
    @validator('candidate_cv_text')
    def validate_cv_text(cls, v):
        if not v.strip():
            raise ValueError('CV text cannot be empty')
        return v.strip()

class SkillGap(BaseModel):
    skill: str
    suggestion: str
    priority: str = "medium"  # low, medium, high

class CVOptimizationResponse(BaseModel):
    original_cv_score: int = Field(..., ge=0, le=100)
    optimized_cv_score: int = Field(..., ge=0, le=100)
    optimized_cv_text: str
    improvements: List[str] = []
    ats_keywords: List[str] = []
    timestamp: datetime = Field(default_factory=datetime.now)

class SkillGapRequest(BaseModel):
    cv_text: str = Field(..., min_length=50)
    jd_text: Optional[str] = ""

class SkillGapResponse(BaseModel):
    skill_gaps: List[SkillGap]
    match_score: Optional[int] = None
    timestamp: datetime = Field(default_factory=datetime.now)

class ExtractionResponse(BaseModel):
    cv_text: str
    jd_text: Optional[str] = ""
    file_type: str
    word_count: int