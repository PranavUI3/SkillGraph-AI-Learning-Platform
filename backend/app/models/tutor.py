from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime

class ChatMessage(BaseModel):
    id: Optional[str] = None
    role: str # "user" or "assistant" or "system"
    content: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class ChatRequest(BaseModel):
    conversation_id: Optional[str] = None
    message: str
    proficiency_level: Optional[str] = "Beginner"
    topic_context: Optional[str] = None

class ChatResponse(BaseModel):
    conversation_id: str
    message: ChatMessage
    title: Optional[str] = None

class ConversationSummary(BaseModel):
    conversation_id: str
    title: str
    last_message: str
    updated_at: datetime
    created_at: datetime
    message_count: int

class ConversationDetail(BaseModel):
    conversation_id: str
    user_id: str
    title: str
    proficiency_level: str
    messages: List[ChatMessage]
    created_at: datetime
    updated_at: datetime
