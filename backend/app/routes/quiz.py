import uuid
from datetime import datetime
from typing import List, Dict, Any
from fastapi import APIRouter, HTTPException, status, Depends
from app.database.connection import get_database
from app.core.security import get_current_user_id
from app.services.groq_service import groq_service
from app.models.quiz import (
    QuizGenerateRequest, QuizGenerateResponse, QuizGeneratedPublicQuestion,
    QuizSubmitRequest, QuizResultResponse, QuestionResult, QuizHistoryItem
)

router = APIRouter(prefix="/api/quiz", tags=["AI Quiz Generator"])

@router.post("/generate", response_model=QuizGenerateResponse)
def generate_quiz_endpoint(payload: QuizGenerateRequest, user_id: str = Depends(get_current_user_id)):
    """Generate adaptive multiple choice questions using Groq API."""
    db = get_database()
    quizzes_col = db["quizzes"]

    try:
        raw_questions = groq_service.generate_quiz(
            topic=payload.topic,
            difficulty=payload.difficulty,
            num_questions=payload.num_questions or 5
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate quiz questions with Groq AI: {str(e)}"
        )

    quiz_id = str(uuid.uuid4())
    now = datetime.utcnow()

    # Save to MongoDB with correct answers and explanations
    quiz_doc = {
        "quiz_id": quiz_id,
        "user_id": user_id,
        "topic": payload.topic,
        "difficulty": payload.difficulty,
        "questions": raw_questions,
        "created_at": now
    }
    quizzes_col.insert_one(quiz_doc)

    # Return public sanitized questions without correct answers
    public_questions = [
        QuizGeneratedPublicQuestion(
            id=q.get("id"),
            question=q.get("question"),
            code_snippet=q.get("code_snippet"),
            options=q.get("options", [])
        )
        for q in raw_questions
    ]

    return QuizGenerateResponse(
        quiz_id=quiz_id,
        topic=payload.topic,
        difficulty=payload.difficulty,
        questions=public_questions
    )

@router.post("/submit", response_model=QuizResultResponse)
def submit_quiz_endpoint(payload: QuizSubmitRequest, user_id: str = Depends(get_current_user_id)):
    """Submit quiz answers, calculate score, return explanations, and record attempt."""
    db = get_database()
    quizzes_col = db["quizzes"]
    attempts_col = db["quiz_attempts"]

    quiz_doc = quizzes_col.find_one({"quiz_id": payload.quiz_id, "user_id": user_id})
    if not quiz_doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Quiz session not found.")

    stored_questions = quiz_doc.get("questions", [])
    user_answer_map = {ans.question_id: ans.selected_option_index for ans in payload.answers}

    results = []
    correct_count = 0
    total_questions = len(stored_questions)

    for q in stored_questions:
        qid = q.get("id")
        selected = user_answer_map.get(qid, -1)
        correct_idx = q.get("correct_option_index", 0)
        is_correct = (selected == correct_idx)
        if is_correct:
            correct_count += 1

        results.append(QuestionResult(
            question_id=qid,
            question=q.get("question", ""),
            code_snippet=q.get("code_snippet"),
            options=q.get("options", []),
            selected_option_index=selected,
            correct_option_index=correct_idx,
            is_correct=is_correct,
            explanation=q.get("explanation", "The designated option is logically and technically correct.")
        ))

    score_pct = round((correct_count / total_questions * 100) if total_questions > 0 else 0, 1)
    passed = score_pct >= 70.0
    attempt_id = str(uuid.uuid4())
    now = datetime.utcnow()

    attempt_doc = {
        "attempt_id": attempt_id,
        "quiz_id": payload.quiz_id,
        "user_id": user_id,
        "topic": quiz_doc.get("topic", "Technical Assessment"),
        "difficulty": quiz_doc.get("difficulty", "Beginner"),
        "score_percentage": score_pct,
        "correct_count": correct_count,
        "total_questions": total_questions,
        "passed": passed,
        "results": [r.model_dump() for r in results],
        "created_at": now
    }
    attempts_col.insert_one(attempt_doc)

    return QuizResultResponse(
        attempt_id=attempt_id,
        quiz_id=payload.quiz_id,
        topic=quiz_doc.get("topic", "Technical Assessment"),
        difficulty=quiz_doc.get("difficulty", "Beginner"),
        score_percentage=score_pct,
        correct_count=correct_count,
        total_questions=total_questions,
        passed=passed,
        results=results,
        created_at=now
    )

@router.get("/history", response_model=List[QuizHistoryItem])
def get_quiz_history(user_id: str = Depends(get_current_user_id)):
    """Fetch history of student quiz attempts."""
    db = get_database()
    cursor = db["quiz_attempts"].find({"user_id": user_id}).sort("created_at", -1)
    
    history = []
    for doc in cursor:
        history.append(QuizHistoryItem(
            attempt_id=doc["attempt_id"],
            quiz_id=doc["quiz_id"],
            topic=doc.get("topic", ""),
            difficulty=doc.get("difficulty", "Beginner"),
            score_percentage=doc.get("score_percentage", 0.0),
            correct_count=doc.get("correct_count", 0),
            total_questions=doc.get("total_questions", 0),
            passed=doc.get("passed", False),
            created_at=doc["created_at"]
        ))
    return history

@router.get("/{attempt_id}", response_model=QuizResultResponse)
def get_quiz_attempt(attempt_id: str, user_id: str = Depends(get_current_user_id)):
    """Fetch full review and explanation for a specific quiz attempt."""
    db = get_database()
    doc = db["quiz_attempts"].find_one({"attempt_id": attempt_id, "user_id": user_id})
    if not doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Quiz attempt not found.")

    return QuizResultResponse(
        attempt_id=doc["attempt_id"],
        quiz_id=doc["quiz_id"],
        topic=doc.get("topic", ""),
        difficulty=doc.get("difficulty", "Beginner"),
        score_percentage=doc.get("score_percentage", 0.0),
        correct_count=doc.get("correct_count", 0),
        total_questions=doc.get("total_questions", 0),
        passed=doc.get("passed", False),
        results=doc.get("results", []),
        created_at=doc["created_at"]
    )
