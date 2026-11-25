from datetime import datetime
from typing import Dict, Any, List
from fastapi import APIRouter, Depends
from app.database.connection import get_database
from app.core.security import get_current_user_id
from app.services.groq_service import groq_service

router = APIRouter(prefix="/api/dashboard", tags=["Dashboard"])

@router.get("/stats")
def get_dashboard_stats(user_id: str = Depends(get_current_user_id)):
    """Fetch comprehensive dashboard metrics, roadmap status, quiz stats and recommendations."""
    db = get_database()
    
    # 1. User Info
    user_doc = db["users"].find_one({"user_id": user_id})
    user_name = user_doc.get("name", "Student") if user_doc else "Student"
    target_role = user_doc.get("target_role", "Software Developer") if user_doc else "Software Developer"
    experience_level = user_doc.get("experience_level", "Beginner") if user_doc else "Beginner"

    # 2. Skills
    user_skills_cursor = list(db["skills"].find({"user_id": user_id}))
    total_skills = len(user_skills_cursor)
    verified_skills = sum(1 for s in user_skills_cursor if s.get("verified"))
    skills_names = [s.get("name") for s in user_skills_cursor]

    # 3. Roadmap & Topic Progress
    latest_roadmap = db["roadmaps"].find_one({"user_id": user_id}, sort=[("updated_at", -1)])
    
    roadmap_progress = 0.0
    total_topics = 0
    completed_topics = 0
    roadmap_goal = None
    roadmap_id = None
    next_incomplete_topic = None
    active_module_title = None

    if latest_roadmap:
        roadmap_id = latest_roadmap.get("id")
        roadmap_goal = latest_roadmap.get("goal")
        roadmap_progress = latest_roadmap.get("progress_percentage", 0.0)
        total_topics = latest_roadmap.get("total_topics", 0)
        completed_topics = latest_roadmap.get("completed_topics", 0)
        
        # Locate next pending topic
        for mod in latest_roadmap.get("modules", []):
            if next_incomplete_topic:
                break
            for top in mod.get("topics", []):
                if not top.get("completed"):
                    next_incomplete_topic = {
                        "id": top.get("id"),
                        "title": top.get("title"),
                        "description": top.get("description"),
                        "estimated_hours": top.get("estimated_hours", 2),
                        "module_title": mod.get("title")
                    }
                    active_module_title = mod.get("title")
                    break

    # 4. Quizzes
    recent_quizzes_cursor = list(db["quiz_attempts"].find({"user_id": user_id}).sort("created_at", -1).limit(5))
    total_quizzes = db["quiz_attempts"].count_documents({"user_id": user_id})
    
    avg_quiz_score = 0.0
    if total_quizzes > 0:
        all_attempts = list(db["quiz_attempts"].find({"user_id": user_id}, {"score_percentage": 1}))
        total_score = sum(a.get("score_percentage", 0) for a in all_attempts)
        avg_quiz_score = round(total_score / len(all_attempts), 1)

    recent_quizzes = [
        {
            "attempt_id": q["attempt_id"],
            "topic": q.get("topic"),
            "difficulty": q.get("difficulty"),
            "score_percentage": q.get("score_percentage"),
            "passed": q.get("passed", False),
            "created_at": q.get("created_at")
        }
        for q in recent_quizzes_cursor
    ]

    # 5. Assessments
    latest_assessment = db["assessments"].find_one({"user_id": user_id, "status": "completed"}, sort=[("completed_at", -1)])
    weak_areas = latest_assessment.get("weak_areas", []) if latest_assessment else []
    strong_areas = latest_assessment.get("strong_areas", []) if latest_assessment else []

    # 6. Recommendation
    if next_incomplete_topic:
        rec_topic = next_incomplete_topic["title"]
        rec_reason = f"Next topic in your personalized roadmap: {active_module_title}."
        rec_focus = "Roadmap Progression"
        rec_tip = "Spend 30 minutes reading the core concept and implementing the practical exercise."
    elif weak_areas:
        rec_topic = f"Deep Dive: {weak_areas[0]}"
        rec_reason = "Identified as a growth opportunity in your recent technical diagnostic assessment."
        rec_focus = weak_areas[0]
        rec_tip = "Ask SkillGraph AI Assistant to explain edge cases and walk through code examples."
    else:
        rec_topic = "Frontend Architecture & Asynchronous Patterns"
        rec_reason = "Strengthen foundational engineering practices before taking advanced project tracks."
        rec_focus = "Asynchronous JavaScript & API Integration"
        rec_tip = "Ask SkillGraph AI Assistant: 'Explain React useEffect with an example'."

    return {
        "user": {
            "name": user_name,
            "target_role": target_role,
            "experience_level": experience_level
        },
        "stats": {
            "total_skills": total_skills,
            "verified_skills": verified_skills,
            "total_topics": total_topics,
            "completed_topics": completed_topics,
            "roadmap_progress": roadmap_progress,
            "total_quizzes": total_quizzes,
            "average_quiz_score": avg_quiz_score
        },
        "current_roadmap": {
            "id": roadmap_id,
            "goal": roadmap_goal,
            "progress_percentage": roadmap_progress,
            "completed_topics": completed_topics,
            "total_topics": total_topics,
            "next_topic": next_incomplete_topic
        } if latest_roadmap else None,
        "recent_quizzes": recent_quizzes,
        "skill_insights": {
            "weak_areas": weak_areas,
            "strong_areas": strong_areas
        },
        "recommendation": {
            "topic": rec_topic,
            "reason": rec_reason,
            "focus_area": rec_focus,
            "tip": rec_tip
        }
    }
