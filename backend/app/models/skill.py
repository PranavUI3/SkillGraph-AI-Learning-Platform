from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime

class SkillItem(BaseModel):
    name: str
    category: str
    proficiency: str = "Beginner" # Beginner, Intermediate, Advanced
    verified: bool = False
    score: Optional[int] = None
    last_assessed: Optional[datetime] = None

class AddSkillsRequest(BaseModel):
    skills: List[SkillItem]

class AssessmentGenerateRequest(BaseModel):
    domain: str
    skills: List[str]
    proficiency: str = "Beginner"
    question_count: Optional[int] = 5

class AssessmentQuestion(BaseModel):
    id: int
    question: str
    code_snippet: Optional[str] = None
    options: List[str]
    skill_tag: str
    difficulty: str

class AssessmentGeneratedResponse(BaseModel):
    assessment_id: str
    domain: str
    proficiency: str
    questions: List[AssessmentQuestion]

class UserAnswer(BaseModel):
    question_id: int
    selected_option: int # 0-indexed
    question_text: Optional[str] = None
    selected_text: Optional[str] = None

class AssessmentSubmitRequest(BaseModel):
    assessment_id: str
    domain: str
    proficiency: str
    skills: List[str]
    answers: List[UserAnswer]

class AssessmentFeedback(BaseModel):
    assessment_id: str
    score_percentage: float
    total_questions: int
    correct_count: int
    summary: str
    strong_areas: List[str]
    weak_areas: List[str]
    detailed_evaluations: List[Dict[str, Any]]
    recommendations: List[str]
    created_at: datetime = Field(default_factory=datetime.utcnow)
