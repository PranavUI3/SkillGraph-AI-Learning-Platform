import uuid
from datetime import datetime
from fastapi import APIRouter, HTTPException, status, Depends
from app.database.connection import get_database
from app.core.security import hash_password, verify_password, create_access_token, get_current_user_id
from app.models.user import UserRegister, UserLogin, UserProfileUpdate, UserResponse, TokenResponse

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
def register(payload: UserRegister):
    db = get_database()
    users_col = db["users"]

    # Check if email is already taken
    existing = users_col.find_one({"email": payload.email.lower()})
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A student account with this email address already exists."
        )

    user_id = str(uuid.uuid4())
    hashed_pwd = hash_password(payload.password)
    now = datetime.utcnow()

    user_doc = {
        "user_id": user_id,
        "name": payload.name.strip(),
        "email": payload.email.lower().strip(),
        "hashed_password": hashed_pwd,
        "target_role": payload.target_role or "Full Stack Developer",
        "experience_level": payload.experience_level or "Beginner",
        "bio": f"Aspiring {payload.target_role or 'Developer'} sharpening skills on SkillGraph.",
        "weekly_study_hours": 10,
        "created_at": now,
        "updated_at": now
    }
    users_col.insert_one(user_doc)

    # Issue JWT token
    access_token = create_access_token({"sub": user_id, "email": user_doc["email"]})

    user_resp = UserResponse(
        id=user_id,
        name=user_doc["name"],
        email=user_doc["email"],
        target_role=user_doc["target_role"],
        experience_level=user_doc["experience_level"],
        bio=user_doc["bio"],
        weekly_study_hours=user_doc["weekly_study_hours"],
        created_at=user_doc["created_at"]
    )
    return TokenResponse(access_token=access_token, user=user_resp)

@router.post("/login", response_model=TokenResponse)
def login(payload: UserLogin):
    db = get_database()
    users_col = db["users"]

    user_doc = users_col.find_one({"email": payload.email.lower().strip()})
    if not user_doc or not verify_password(payload.password, user_doc.get("hashed_password", "")):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password."
        )

    access_token = create_access_token({"sub": user_doc["user_id"], "email": user_doc["email"]})

    user_resp = UserResponse(
        id=user_doc["user_id"],
        name=user_doc["name"],
        email=user_doc["email"],
        target_role=user_doc.get("target_role", "Full Stack Developer"),
        experience_level=user_doc.get("experience_level", "Beginner"),
        bio=user_doc.get("bio", ""),
        weekly_study_hours=user_doc.get("weekly_study_hours", 10),
        created_at=user_doc.get("created_at")
    )
    return TokenResponse(access_token=access_token, user=user_resp)

@router.get("/me", response_model=UserResponse)
def get_me(user_id: str = Depends(get_current_user_id)):
    db = get_database()
    user_doc = db["users"].find_one({"user_id": user_id})
    if not user_doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User account not found.")

    return UserResponse(
        id=user_doc["user_id"],
        name=user_doc["name"],
        email=user_doc["email"],
        target_role=user_doc.get("target_role", "Full Stack Developer"),
        experience_level=user_doc.get("experience_level", "Beginner"),
        bio=user_doc.get("bio", ""),
        weekly_study_hours=user_doc.get("weekly_study_hours", 10),
        created_at=user_doc.get("created_at")
    )

@router.put("/profile", response_model=UserResponse)
def update_profile(payload: UserProfileUpdate, user_id: str = Depends(get_current_user_id)):
    db = get_database()
    users_col = db["users"]

    updates = {}
    if payload.name is not None:
        updates["name"] = payload.name.strip()
    if payload.target_role is not None:
        updates["target_role"] = payload.target_role.strip()
    if payload.experience_level is not None:
        updates["experience_level"] = payload.experience_level
    if payload.bio is not None:
        updates["bio"] = payload.bio
    if payload.weekly_study_hours is not None:
        updates["weekly_study_hours"] = payload.weekly_study_hours

    updates["updated_at"] = datetime.utcnow()

    users_col.update_one({"user_id": user_id}, {"$set": updates})
    updated_user = users_col.find_one({"user_id": user_id})

    return UserResponse(
        id=updated_user["user_id"],
        name=updated_user["name"],
        email=updated_user["email"],
        target_role=updated_user.get("target_role", "Full Stack Developer"),
        experience_level=updated_user.get("experience_level", "Beginner"),
        bio=updated_user.get("bio", ""),
        weekly_study_hours=updated_user.get("weekly_study_hours", 10),
        created_at=updated_user.get("created_at")
    )
