from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime

class QuizGenerateRequest(BaseModel):
    topic: str
    difficulty: str = "Beginner" # Beginner, Intermediate, Advanced
    num_questions: int = 5

class QuizQuestionOption(BaseModel):
    text: str
    is_correct: Optional[bool] = None # Hidden during test generation

class QuizQuestionItem(BaseModel):
    id: int
    question: str
    code_snippet: Optional[str] = None
    options: List[str]
    correct_option_index: int
    explanation: str

class QuizGeneratedPublicQuestion(BaseModel):
    id: int
    question: str
    code_snippet: Optional[str] = None
    options: List[str]

class QuizGenerateResponse(BaseModel):
    quiz_id: str
    topic: str
    difficulty: str
    questions: List[QuizGeneratedPublicQuestion]

class UserQuizAnswer(BaseModel):
    question_id: int
    selected_option_index: int

class QuizSubmitRequest(BaseModel):
    quiz_id: str
    answers: List[UserQuizAnswer]

class QuestionResult(BaseModel):
    question_id: int
    question: str
    code_snippet: Optional[str] = None
    options: List[str]
    selected_option_index: int
    correct_option_index: int
    is_correct: bool
    explanation: str

class QuizResultResponse(BaseModel):
    attempt_id: str
    quiz_id: str
    topic: str
    difficulty: str
    score_percentage: float
    correct_count: int
    total_questions: int
    passed: bool
    results: List[QuestionResult]
    created_at: datetime = Field(default_factory=datetime.utcnow)

class QuizHistoryItem(BaseModel):
    attempt_id: str
    quiz_id: str
    topic: str
    difficulty: str
    score_percentage: float
    correct_count: int
    total_questions: int
    passed: bool
    created_at: datetime
