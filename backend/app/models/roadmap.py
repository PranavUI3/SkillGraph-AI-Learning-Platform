from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime

class RoadmapGenerateRequest(BaseModel):
    goal: str # e.g. "Become a Full Stack React & Node Developer"
    current_skills: List[str] # e.g. ["HTML", "CSS", "Basic JavaScript"]
    current_proficiency: str = "Beginner" # Beginner, Intermediate, Advanced
    available_hours_per_week: int = 10
    preferred_duration_weeks: Optional[int] = 8

class PracticalExercise(BaseModel):
    title: str
    description: str
    deliverable: str

class TopicItem(BaseModel):
    id: str
    title: str
    description: str
    estimated_hours: float
    difficulty: str # Beginner, Intermediate, Advanced
    prerequisites: List[str] = []
    learning_objectives: List[str] = []
    practical_exercises: List[PracticalExercise] = []
    completed: bool = False
    completed_at: Optional[datetime] = None

class ModuleItem(BaseModel):
    id: str
    title: str
    description: str
    week_number: Optional[int] = 1
    estimated_duration: str
    topics: List[TopicItem]

class RoadmapInDB(BaseModel):
    id: str
    user_id: str
    goal: str
    current_proficiency: str
    available_hours_per_week: int
    total_weeks: int
    modules: List[ModuleItem]
    progress_percentage: float = 0.0
    total_topics: int = 0
    completed_topics: int = 0
    created_at: datetime
    updated_at: datetime

class RoadmapProgressUpdate(BaseModel):
    topic_id: str
    completed: bool
