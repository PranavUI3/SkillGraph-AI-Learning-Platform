import urllib.request
import json
import sys

BASE_URL = "http://127.0.0.1:8000/api"

def request(endpoint, method="GET", data=None, token=None):
    url = f"{BASE_URL}{endpoint}"
    req = urllib.request.Request(url, method=method)
    req.add_header("Content-Type", "application/json")
    if token:
        req.add_header("Authorization", f"Bearer {token}")
    
    body = json.dumps(data).encode("utf-8") if data else None
    try:
        with urllib.request.urlopen(req, data=body, timeout=60) as resp:
            content = resp.read().decode("utf-8")
            return resp.status, json.loads(content) if content else {}
    except urllib.error.HTTPError as e:
        err_body = e.read().decode("utf-8")
        print(f"HTTPError on {method} {endpoint}: {e.code} - {err_body}")
        try:
            return e.code, json.loads(err_body)
        except Exception:
            return e.code, {"detail": err_body}
    except Exception as e:
        print(f"Exception on {method} {endpoint}: {e}")
        return 500, {"detail": str(e)}

def run_tests():
    print("=" * 60)
    print("SKILLGRAPH END-TO-END SYSTEM INTEGRATION TESTS")
    print("=" * 60)

    # 1. Health check
    code, res = request("/health")
    assert code == 200, f"Health check failed: {res}"
    print("✅ Health Check passed:", res)

    # 2. Register new student
    test_email = f"test.student.{int(__import__('time').time())}@skillgraph.edu"
    reg_payload = {
        "name": "Jordan Lee",
        "email": test_email,
        "password": "securepassword123",
        "target_role": "Full Stack Developer",
        "experience_level": "Beginner"
    }
    code, reg_res = request("/auth/register", method="POST", data=reg_payload)
    assert code == 201, f"Registration failed: {reg_res}"
    token = reg_res["access_token"]
    user_id = reg_res["user"]["id"]
    print("✅ Registration passed:", reg_res["user"]["name"], f"(ID: {user_id})")

    # 3. Login
    code, login_res = request("/auth/login", method="POST", data={"email": test_email, "password": "securepassword123"})
    assert code == 200, f"Login failed: {login_res}"
    print("✅ Login & JWT generation passed:", login_res["token_type"])

    # 4. Auth Me
    code, me_res = request("/auth/me", token=token)
    assert code == 200, f"Auth Me failed: {me_res}"
    print("✅ Auth /me passed for user:", me_res["email"])

    # 5. Profile Update
    code, prof_res = request("/auth/profile", method="PUT", data={"bio": "Passionate learner sharpening skills.", "weekly_study_hours": 15}, token=token)
    assert code == 200, f"Profile update failed: {prof_res}"
    assert prof_res["weekly_study_hours"] == 15
    print("✅ Profile Update passed: weekly_study_hours =", prof_res["weekly_study_hours"])

    # 6. Skill Catalog
    code, cat_res = request("/skills/catalog", token=token)
    assert code == 200 and "catalog" in cat_res
    print(f"✅ Skill Catalog passed: {len(cat_res['catalog'])} domains available.")

    # 7. Add Student Skills
    code, add_skills_res = request("/skills", method="POST", data={"skills": [
        {"name": "JavaScript", "category": "Frontend", "proficiency": "Intermediate"},
        {"name": "Python", "category": "Backend", "proficiency": "Beginner"}
    ]}, token=token)
    assert code == 200
    print("✅ Add Skills passed:", add_skills_res["message"])

    # 8. Skill Assessment Generation & Submission with Groq
    print("\n⏳ Testing Skill Assessment with Groq LLM...")
    code, assess_gen_res = request("/skills/assessment/generate", method="POST", data={
        "domain": "Frontend Web Development",
        "skills": ["JavaScript (ES6+)", "React.js"],
        "proficiency": "Beginner",
        "question_count": 3
    }, token=token)
    assert code == 200, f"Assessment generate failed: {assess_gen_res}"
    assessment_id = assess_gen_res["assessment_id"]
    questions = assess_gen_res["questions"]
    print(f"✅ Groq Assessment Generated: {len(questions)} questions (ID: {assessment_id})")

    # Submit answers
    answers = [{"question_id": q["id"], "selected_option": 0} for q in questions]
    code, assess_sub_res = request("/skills/assessment/submit", method="POST", data={
        "assessment_id": assessment_id,
        "domain": "Frontend Web Development",
        "proficiency": "Beginner",
        "skills": ["JavaScript (ES6+)", "React.js"],
        "answers": answers
    }, token=token)
    assert code == 200, f"Assessment submit failed: {assess_sub_res}"
    print(f"✅ Groq Assessment Evaluation passed: Score: {assess_sub_res['score_percentage']}%")
    print("   Summary:", assess_sub_res["summary"][:100], "...")

    # 9. AI Tutor Chat with Multi-turn Memory
    print("\n⏳ Testing SkillGraph AI Assistant multi-turn conversation with Groq...")
    code, chat1_res = request("/tutor/chat", method="POST", data={
        "message": "Explain React useEffect in two concise sentences.",
        "proficiency_level": "Beginner"
    }, token=token)
    assert code == 200, f"Chat turn 1 failed: {chat1_res}"
    conv_id = chat1_res["conversation_id"]
    print(f"✅ AI Tutor Turn 1 passed (Conv ID: {conv_id}):")
    print("   AI:", chat1_res["message"]["content"][:120], "...")

    # Turn 2
    code, chat2_res = request("/tutor/chat", method="POST", data={
        "conversation_id": conv_id,
        "message": "Can you give a 3-line code example of that?",
        "proficiency_level": "Beginner"
    }, token=token)
    assert code == 200, f"Chat turn 2 failed: {chat2_res}"
    print("✅ AI Tutor Turn 2 (multi-turn memory) passed:")
    print("   AI:", chat2_res["message"]["content"][:120], "...")

    # Chat history
    code, hist_res = request("/tutor/history", token=token)
    assert code == 200 and len(hist_res) >= 1
    print(f"✅ Tutor Conversation History retrieved: {len(hist_res)} conversations.")

    # 10. AI Roadmap Generation with Groq
    print("\n⏳ Testing AI Roadmap Generation with Groq...")
    code, road_res = request("/roadmap/generate", method="POST", data={
        "goal": "Full Stack React & FastAPI Developer",
        "current_skills": ["HTML", "Basic JS", "Python"],
        "current_proficiency": "Beginner",
        "available_hours_per_week": 10,
        "preferred_duration_weeks": 6
    }, token=token)
    assert code == 200, f"Roadmap generation failed: {road_res}"
    roadmap_id = road_res["id"]
    modules = road_res["modules"]
    first_topic_id = modules[0]["topics"][0]["id"]
    print(f"✅ Groq Roadmap generated: {len(modules)} modules, {road_res['total_topics']} topics (ID: {roadmap_id})")

    # Toggle topic progress
    code, prog_res = request(f"/roadmap/{roadmap_id}/progress", method="PATCH", data={
        "topic_id": first_topic_id,
        "completed": True
    }, token=token)
    assert code == 200 and prog_res["completed"] is True
    print(f"✅ Roadmap Topic Progress update passed: {prog_res['completed_topics']}/{prog_res['total_topics']} completed ({prog_res['progress_percentage']}%)")

    # 11. AI Quiz Generation & Submission
    print("\n⏳ Testing AI Quiz Generation with Groq...")
    code, quiz_gen_res = request("/quiz/generate", method="POST", data={
        "topic": "Python Functions & Scope",
        "difficulty": "Beginner",
        "num_questions": 2
    }, token=token)
    assert code == 200, f"Quiz generation failed: {quiz_gen_res}"
    quiz_id = quiz_gen_res["quiz_id"]
    quiz_questions = quiz_gen_res["questions"]
    print(f"✅ Groq Quiz generated: {len(quiz_questions)} questions (ID: {quiz_id})")

    # Submit quiz
    quiz_answers = [{"question_id": q["id"], "selected_option_index": 0} for q in quiz_questions]
    code, quiz_sub_res = request("/quiz/submit", method="POST", data={
        "quiz_id": quiz_id,
        "answers": quiz_answers
    }, token=token)
    assert code == 200, f"Quiz submit failed: {quiz_sub_res}"
    print(f"✅ Quiz Evaluation passed: Score: {quiz_sub_res['score_percentage']}%, Passed: {quiz_sub_res['passed']}")

    # 12. Dashboard Stats
    code, dash_res = request("/dashboard/stats", token=token)
    assert code == 200, f"Dashboard stats failed: {dash_res}"
    print("\n✅ Dashboard Stats retrieved successfully:")
    print("   Total Skills:", dash_res["stats"]["total_skills"])
    print("   Completed Topics:", dash_res["stats"]["completed_topics"])
    print("   Roadmap Progress:", dash_res["stats"]["roadmap_progress"], "%")
    print("   Total Quizzes Attempted:", dash_res["stats"]["total_quizzes"])
    print("   Recommended Topic:", dash_res["recommendation"]["topic"])

    print("\n" + "=" * 60)
    print("ALL 12 END-TO-END TESTS PASSED WITH 100% SUCCESS!")
    print("=" * 60)

if __name__ == "__main__":
    run_tests()
