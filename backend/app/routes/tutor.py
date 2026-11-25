import uuid
from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, HTTPException, status, Depends
from app.database.connection import get_database
from app.core.security import get_current_user_id
from app.services.groq_service import groq_service
from app.models.tutor import (
    ChatRequest, ChatResponse, ChatMessage, ConversationSummary, ConversationDetail
)

router = APIRouter(prefix="/api/tutor", tags=["AI Tutor"])

@router.post("/chat", response_model=ChatResponse)
def chat_with_tutor(payload: ChatRequest, user_id: str = Depends(get_current_user_id)):
    """Send message to SkillGraph AI Assistant with multi-turn memory."""
    db = get_database()
    conv_col = db["tutor_conversations"]
    now = datetime.utcnow()

    conversation_id = payload.conversation_id
    is_new = False

    if not conversation_id:
        conversation_id = str(uuid.uuid4())
        is_new = True
        conv_doc = None
    else:
        conv_doc = conv_col.find_one({"conversation_id": conversation_id, "user_id": user_id})
        if not conv_doc:
            is_new = True

    # Build existing messages list
    messages_history = []
    if conv_doc and "messages" in conv_doc:
        messages_history = conv_doc["messages"]

    # User message
    user_msg_id = str(uuid.uuid4())
    user_msg = {
        "id": user_msg_id,
        "role": "user",
        "content": payload.message.strip(),
        "timestamp": now
    }
    messages_history.append(user_msg)

    # Format history for LLM (roles 'user' and 'assistant')
    llm_history = []
    # Send last 12 messages for rich context without overloading tokens
    recent_context = messages_history[-12:]
    for m in recent_context:
        llm_history.append({
            "role": m["role"],
            "content": m["content"]
        })

    # Call Groq AI service
    try:
        reply_text = groq_service.generate_chat_reply(
            history=llm_history,
            student_proficiency=payload.proficiency_level or "Beginner",
            topic_context=payload.topic_context
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"SkillGraph AI Assistant failed to generate response: {str(e)}"
        )

    assistant_msg_id = str(uuid.uuid4())
    assistant_now = datetime.utcnow()
    assistant_msg = {
        "id": assistant_msg_id,
        "role": "assistant",
        "content": reply_text,
        "timestamp": assistant_now
    }
    messages_history.append(assistant_msg)

    # Generate title if new conversation
    title = conv_doc.get("title") if conv_doc else None
    if not title:
        # Generate concise 4-6 word title from first prompt
        clean_prompt = payload.message.strip().replace("\n", " ")
        title = clean_prompt[:35] + ("..." if len(clean_prompt) > 35 else "")

    conv_col.update_one(
        {"conversation_id": conversation_id, "user_id": user_id},
        {
            "$set": {
                "user_id": user_id,
                "conversation_id": conversation_id,
                "title": title,
                "proficiency_level": payload.proficiency_level or "Beginner",
                "messages": messages_history,
                "last_message": reply_text[:120],
                "updated_at": assistant_now
            },
            "$setOnInsert": {
                "created_at": now
            }
        },
        upsert=True
    )

    return ChatResponse(
        conversation_id=conversation_id,
        title=title,
        message=ChatMessage(
            id=assistant_msg_id,
            role="assistant",
            content=reply_text,
            timestamp=assistant_now
        )
    )

@router.get("/history", response_model=List[ConversationSummary])
def get_conversations(user_id: str = Depends(get_current_user_id)):
    """Fetch all conversation threads for student."""
    db = get_database()
    cursor = db["tutor_conversations"].find({"user_id": user_id}).sort("updated_at", -1)
    
    summaries = []
    for doc in cursor:
        summaries.append(ConversationSummary(
            conversation_id=doc["conversation_id"],
            title=doc.get("title", "New Conversation"),
            last_message=doc.get("last_message", ""),
            updated_at=doc.get("updated_at", doc.get("created_at")),
            created_at=doc.get("created_at"),
            message_count=len(doc.get("messages", []))
        ))
    return summaries

@router.get("/history/{conversation_id}", response_model=ConversationDetail)
def get_conversation_by_id(conversation_id: str, user_id: str = Depends(get_current_user_id)):
    """Fetch full message thread for a specific conversation."""
    db = get_database()
    doc = db["tutor_conversations"].find_one({"conversation_id": conversation_id, "user_id": user_id})
    if not doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Conversation not found.")

    messages = [
        ChatMessage(
            id=m.get("id"),
            role=m.get("role"),
            content=m.get("content"),
            timestamp=m.get("timestamp")
        )
        for m in doc.get("messages", [])
    ]

    return ConversationDetail(
        conversation_id=doc["conversation_id"],
        user_id=doc["user_id"],
        title=doc.get("title", "Conversation"),
        proficiency_level=doc.get("proficiency_level", "Beginner"),
        messages=messages,
        created_at=doc.get("created_at"),
        updated_at=doc.get("updated_at")
    )

@router.delete("/history/{conversation_id}")
def delete_conversation(conversation_id: str, user_id: str = Depends(get_current_user_id)):
    """Delete a conversation thread."""
    db = get_database()
    result = db["tutor_conversations"].delete_one({"conversation_id": conversation_id, "user_id": user_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Conversation not found.")
    return {"message": "Conversation successfully deleted."}
