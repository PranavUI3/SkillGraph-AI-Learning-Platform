import uuid
from datetime import datetime
from typing import List, Dict, Any
from fastapi import APIRouter, HTTPException, status, Depends
from app.database.connection import get_database
from app.core.security import get_current_user_id
from app.services.groq_service import groq_service
from app.models.skill import (
    SkillItem, AddSkillsRequest, AssessmentGenerateRequest,
    AssessmentQuestion, AssessmentSubmitRequest, AssessmentFeedback
)

router = APIRouter(prefix="/api/skills", tags=["Skills & Assessment"])

# Predefined domain catalog for student onboarding & selection
DOMAINS_CATALOG = [
    {
        "id": "frontend",
        "name": "Frontend Web Development",
        "icon": "Layout",
        "description": "User interfaces, responsive design, browser mechanics, modern frameworks",
        "skills": ["HTML5 & Semantics", "CSS3 & Tailwind", "JavaScript (ES6+)", "React.js", "TypeScript", "Next.js", "State Management (Redux/Zustand)", "Web Performance & SEO"]
    },
    {
        "id": "backend",
        "name": "Backend & API Engineering",
        "icon": "Server",
        "description": "Server architecture, microservices, REST & GraphQL APIs, authentication, databases",
        "skills": ["Python / FastAPI", "Node.js / Express", "RESTful API Design", "MongoDB", "PostgreSQL", "JWT & Auth Security", "Docker", "Redis Caching"]
    },
    {
        "id": "fullstack",
        "name": "Full Stack Software Engineering",
        "icon": "Layers",
        "description": "End-to-end web applications combining modern frontend, robust backend, and cloud databases",
        "skills": ["React.js", "FastAPI / Node.js", "MongoDB", "SQL / Relational DBs", "Git & GitHub", "API Integration", "CI/CD & Deployment", "System Architecture"]
    },
    {
        "id": "datascience",
        "name": "Data Science & Machine Learning",
        "icon": "Brain",
        "description": "Data analytics, machine learning pipelines, deep learning, NLP, LLMs",
        "skills": ["Python for Data Science", "Pandas & NumPy", "Data Visualization", "Scikit-Learn", "Deep Learning (PyTorch/TensorFlow)", "Prompt Engineering & LLMs", "Feature Engineering", "Model Evaluation"]
    },
    {
        "id": "cloud_devops",
        "name": "Cloud Computing & DevOps",
        "icon": "Cloud",
        "description": "Infrastructure, containerization, orchestration, continuous delivery, monitoring",
        "skills": ["Linux & Bash", "Docker & Containers", "Kubernetes", "AWS Fundamentals", "GitHub Actions / CI-CD", "Terraform / IaC", "Networking Basics", "Monitoring & Observability"]
    }
]

@router.get("/catalog")
def get_catalog():
    """Return catalog of domains and popular skills."""
    return {"catalog": DOMAINS_CATALOG}

@router.get("", response_model=List[SkillItem])
def get_user_skills(user_id: str = Depends(get_current_user_id)):
    """Fetch skills added/verified for the authenticated student."""
    db = get_database()
    cursor = db["skills"].find({"user_id": user_id})
    skills = []
    for doc in cursor:
        skills.append(SkillItem(
            name=doc["name"],
            category=doc.get("category", "General"),
            proficiency=doc.get("proficiency", "Beginner"),
            verified=doc.get("verified", False),
            score=doc.get("score"),
            last_assessed=doc.get("last_assessed")
        ))
    return skills

@router.post("")
def save_user_skills(payload: AddSkillsRequest, user_id: str = Depends(get_current_user_id)):
    """Batch add or update student skills."""
    db = get_database()
    skills_col = db["skills"]
    now = datetime.utcnow()

    for item in payload.skills:
        skills_col.update_one(
            {"user_id": user_id, "name": item.name},
            {
                "$set": {
                    "user_id": user_id,
                    "name": item.name,
                    "category": item.category,
                    "proficiency": item.proficiency,
                    "verified": item.verified,
                    "score": item.score,
                    "updated_at": now
                },
                "$setOnInsert": {
                    "created_at": now
                }
            },
            upsert=True
        )

    return {"message": f"Successfully updated {len(payload.skills)} skills."}

@router.post("/assessment/generate")
def generate_assessment(payload: AssessmentGenerateRequest, user_id: str = Depends(get_current_user_id)):
    """Generate diagnostic assessment questions using Groq API."""
    db = get_database()
    assessments_col = db["assessments"]

    try:
        raw_questions = groq_service.generate_assessment_questions(
            domain=payload.domain,
            skills=payload.skills,
            proficiency=payload.proficiency,
            question_count=payload.question_count or 5
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate assessment questions with Groq AI: {str(e)}"
        )

    assessment_id = str(uuid.uuid4())
    now = datetime.utcnow()

    # Save to database including answers so evaluation can reference it
    assessment_doc = {
        "assessment_id": assessment_id,
        "user_id": user_id,
        "domain": payload.domain,
        "proficiency": payload.proficiency,
        "skills": payload.skills,
        "questions": raw_questions,
        "status": "pending",
        "created_at": now
    }
    assessments_col.insert_one(assessment_doc)

    # Sanitize questions for the student (hide correct_option_index)
    public_questions = []
    for q in raw_questions:
        public_questions.append({
            "id": q.get("id"),
            "question": q.get("question"),
            "code_snippet": q.get("code_snippet"),
            "options": q.get("options", []),
            "skill_tag": q.get("skill_tag", ""),
            "difficulty": q.get("difficulty", payload.proficiency)
        })

    return {
        "assessment_id": assessment_id,
        "domain": payload.domain,
        "proficiency": payload.proficiency,
        "skills": payload.skills,
        "questions": public_questions
    }

@router.post("/assessment/submit", response_model=AssessmentFeedback)
def submit_assessment(payload: AssessmentSubmitRequest, user_id: str = Depends(get_current_user_id)):
    """Evaluate submitted assessment answers with Groq and persist diagnostics."""
    db = get_database()
    assessments_col = db["assessments"]

    assessment_doc = assessments_col.find_one({"assessment_id": payload.assessment_id, "user_id": user_id})
    if not assessment_doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Assessment session not found or does not belong to this user."
        )

    questions = assessment_doc.get("questions", [])
    user_answers_dict = [a.model_dump() for a in payload.answers]

    try:
        evaluation = groq_service.evaluate_assessment(
            domain=payload.domain,
            proficiency=payload.proficiency,
            skills=payload.skills,
            questions=questions,
            user_answers=user_answers_dict
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to evaluate assessment with Groq AI: {str(e)}"
        )

    now = datetime.utcnow()

    # Update assessment record in DB
    assessments_col.update_one(
        {"assessment_id": payload.assessment_id},
        {
            "$set": {
                "status": "completed",
                "score_percentage": evaluation["score_percentage"],
                "total_questions": evaluation["total_questions"],
                "correct_count": evaluation["correct_count"],
                "summary": evaluation["summary"],
                "strong_areas": evaluation["strong_areas"],
                "weak_areas": evaluation["weak_areas"],
                "recommendations": evaluation["recommendations"],
                "detailed_evaluations": evaluation["detailed_evaluations"],
                "completed_at": now
            }
        }
    )

    # Automatically update/verify student's skills in skills collection
    skills_col = db["skills"]
    for s_name in payload.skills:
        skills_col.update_one(
            {"user_id": user_id, "name": s_name},
            {
                "$set": {
                    "user_id": user_id,
                    "name": s_name,
                    "category": payload.domain,
                    "proficiency": payload.proficiency,
                    "verified": True if evaluation["score_percentage"] >= 60 else False,
                    "score": int(evaluation["score_percentage"]),
                    "last_assessed": now,
                    "updated_at": now
                },
                "$setOnInsert": {
                    "created_at": now
                }
            },
            upsert=True
        )

    return AssessmentFeedback(
        assessment_id=payload.assessment_id,
        score_percentage=evaluation["score_percentage"],
        total_questions=evaluation["total_questions"],
        correct_count=evaluation["correct_count"],
        summary=evaluation["summary"],
        strong_areas=evaluation["strong_areas"],
        weak_areas=evaluation["weak_areas"],
        detailed_evaluations=evaluation["detailed_evaluations"],
        recommendations=evaluation["recommendations"],
        created_at=now
    )

@router.get("/assessments")
def get_assessment_history(user_id: str = Depends(get_current_user_id)):
    """Fetch completed assessments history for current student."""
    db = get_database()
    cursor = db["assessments"].find({"user_id": user_id, "status": "completed"}).sort("completed_at", -1).limit(10)
    
    results = []
    for doc in cursor:
        results.append({
            "assessment_id": doc["assessment_id"],
            "domain": doc["domain"],
            "proficiency": doc["proficiency"],
            "skills": doc.get("skills", []),
            "score_percentage": doc.get("score_percentage", 0),
            "total_questions": doc.get("total_questions", 0),
            "correct_count": doc.get("correct_count", 0),
            "summary": doc.get("summary", ""),
            "strong_areas": doc.get("strong_areas", []),
            "weak_areas": doc.get("weak_areas", []),
            "recommendations": doc.get("recommendations", []),
            "completed_at": doc.get("completed_at", doc.get("created_at"))
        })
    return results
