# SkillGraph — AI-Powered Personalized Learning Platform

[![Python](https://img.shields.io/badge/Python-3.11%2B%20%7C%203.14-blue.svg)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110%2B-009688.svg)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-18-61DAFB.svg)](https://react.dev/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC.svg)](https://tailwindcss.com/)
[![Groq](https://img.shields.io/badge/Groq-High--Speed%20LLM%20Inference-f55036.svg)](https://groq.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Local%20%2F%20Atlas-47A248.svg)](https://www.mongodb.com/)

> **SkillGraph** is a modern, responsive, full-stack educational SaaS platform designed to eliminate "tutorial hell" for software engineering students. It diagnoses current technical proficiency, pinpoints knowledge gaps, generates personalized milestone-driven learning roadmaps, provides a 24/7 multi-turn AI coding tutor (**SkillGraph AI Assistant**), and tests student knowledge through adaptive quizzes powered by real **Groq API** high-speed LLM inference.

---

## 📋 Table of Contents

- [Problem Statement](#-problem-statement)
- [Project Objectives](#-project-objectives)
- [Key Features](#-key-features)
- [System Architecture](#-system-architecture)
- [Technology Stack](#-technology-stack)
- [Database Schema (MongoDB)](#-database-schema-mongodb)
- [Project Folder Structure](#-project-folder-structure)
- [Installation & Quickstart](#-installation--quickstart)
  - [Prerequisites](#prerequisites)
  - [Backend Setup](#1-backend-setup)
  - [Frontend Setup](#2-frontend-setup)
- [Environment Variables](#-environment-variables)
- [API Reference](#-api-reference)
- [Demonstration & Walkthrough](#-demonstration--walkthrough)
- [Future Enhancements](#-future-enhancements)
- [License](#-license)

---

## 🎯 Problem Statement

Computer science and software engineering students today are overwhelmed by fragmented online tutorials, YouTube videos, and generic roadmaps. They struggle with:
1. **Tutorial Hell & Lack of Direction**: Following generic 40-hour video courses without knowing which skills they actually lack.
2. **Undiagnosed Knowledge Blindspots**: Believing they know a concept (e.g., asynchronous programming or React lifecycle) while failing fundamental technical interviews and real-world implementations.
3. **Absence of 24/7 Personalized Mentoring**: Getting stuck on compiler errors, logic flaws, or conceptual questions without immediate, calibrated explanations.
4. **Lack of Progress Verification**: No mechanism to adaptively test whether a student has truly mastered a milestone topic before proceeding.

---

## 🚀 Project Objectives

- **Automated Skill Diagnosis**: Assess student knowledge through diagnostic assessments evaluated by Groq AI to return structured feedback and pinpoint weak vs. strong areas.
- **Dynamic Personalized Roadmaps**: Generate customized milestone curricula considering the student's existing skills, target career role, proficiency, and weekly hours.
- **24/7 Conversational AI Tutor**: A dedicated ChatGPT-style technical assistant with persistent multi-turn conversational memory, code block syntax highlighting, and one-click copy buttons.
- **Adaptive Knowledge Testing**: Topic-specific multiple-choice quizzes with instant scoring, pass/fail thresholds (≥70%), and in-depth conceptual explanations.
- **Measurable Progress Analytics**: Track topic completions, quiz accuracy history, verified skill badges, and personalized study recommendations.
- **Academic & Enterprise SaaS Standards**: Built with a clean separation of concerns, secure JWT authentication, password hashing, and modern dark-mode UI/UX.

---

## ✨ Key Features

### 1. 🔐 Secure Authentication & Profile Management
- Student registration, login, and logout.
- Bcrypt password hashing and stateless JWT bearer token authorization.
- Personalized student profiles with target role (`Full Stack Developer`, `Frontend Specialist`, `Backend Engineer`, `Data Scientist / AI Engineer`, `Cloud & DevOps Engineer`), experience level (`Beginner`, `Intermediate`, `Advanced`), weekly study commitment, and bio.
- Protected private routes across the entire learning workspace.

### 2. 📊 Student Dashboard
- Dynamic greeting and career track badges.
- Core KPIs: Total Skills Added, Verified Competencies, Overall Roadmap Progress %, Completed Topics, and Quiz Average Score.
- Active Roadmap tracker with quick action to jump straight into the next unfinished topic.
- AI Recommendation card highlighting immediate focus areas and study tips.
- Recent quiz performance history.

### 3. 🎯 Diagnostic Skill Assessment
- Domain catalog selection: *Frontend Web Development*, *Backend & API Engineering*, *Full Stack Engineering*, *Data Science & Machine Learning*, *Cloud & DevOps*.
- Multi-skill chip selector and self-reported proficiency setting.
- Instant Groq LLM generation of diagnostic scenario and conceptual questions.
- Comprehensive diagnostic report:
  - Percentage score and correctness rating.
  - Demonstrated strengths.
  - Identified knowledge gaps (weak areas).
  - High-priority learning recommendations.
  - Question-by-question review with student choices vs. correct answers.
  - Automatic skill badge verification in database.

### 4. 🗺️ AI-Powered Learning Roadmaps
- Input student target goal, background skills, hours/week, and target duration.
- Generates 3–4 logical modules containing focused topics, prerequisites, estimated hours, learning objectives, and practical hands-on exercises with deliverables.
- Real-time progress updates: Interactive checkboxes to mark topics completed, dynamically recalculating roadmap completion percentage.

### 5. 🤖 SkillGraph AI Assistant (Main Chatbot Feature)
- Dedicated ChatGPT-style conversational interface.
- Left sidebar with conversation history list, new conversation button, and delete options.
- Multi-turn conversation context preserved across sessions in MongoDB.
- Suggested prompt pills for quick onboarding (`Explain React useEffect`, `Teach me Python functions`, `Test my JavaScript knowledge`, `Help me understand REST APIs`).
- GitHub-flavored Markdown rendering with syntax highlighting and a "Copy Code" button.
- Proficiency level calibration: Switch explanations between Beginner, Intermediate, and Advanced.

### 6. 🏆 Adaptive Quizzes
- Test any technical topic (presets or custom user queries).
- Choose difficulty (Beginner, Intermediate, Advanced) and question count (3, 5, 10).
- Timed and tracked test runner with code snippet support.
- Instant grading with pass/fail evaluation (≥70%) and explanations for every question.
- Full quiz attempt history saved in MongoDB.

### 7. 📈 Learning Progress Analytics
- Visual tracking of completed topics and curriculum completion rate.
- Quiz score trends and pass rates.
- Growth areas & diagnosed weaknesses breakdown.
- Verified vs. self-rated technical skill inventory.

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                 SkillGraph Frontend (React.js)                 │
│         Tailwind CSS • React Router • Lucide • Axios            │
└────────────────────────────────┬────────────────────────────────┘
                                 │ HTTP / JSON (Bearer JWT)
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│               SkillGraph REST API (FastAPI Backend)             │
│        App Routes: Auth, Skills, Roadmap, Tutor, Quiz, Stats    │
└──────────────┬──────────────────────────────────┬───────────────┘
               │                                  │
               ▼                                  ▼
┌──────────────────────────────┐  ┌───────────────────────────────┐
│       MongoDB Database       │  │        Groq AI Service        │
│  - users                     │  │  - Official Groq Python SDK   │
│  - skills                    │  │  - Configurable Models:       │
│  - assessments               │  │    openai/gpt-oss-120b        │
│  - roadmaps                  │  │    openai/gpt-oss-20b         │
│  - tutor_conversations       │  │    qwen/qwen3.8-27b           │
│  - quiz_attempts             │  │  - Robust JSON Repair         │
└──────────────────────────────┘  └───────────────────────────────┘
```

---

## 💻 Technology Stack

### Frontend
- **React.js (JavaScript - No TypeScript)**: Component-driven architecture.
- **Tailwind CSS (v4)**: Modern dark-mode UI with customized palettes, glassmorphism, and responsive layout.
- **React Router DOM (v7)**: Client-side routing with protected route guards.
- **Axios**: Configured HTTP client with request & response interceptors for JWT management.
- **Lucide React**: Clean icons throughout the platform.
- **React Markdown**: Rendering structured AI answers, code snippets, and lists.

### Backend
- **Python (3.11+ / 3.14)**: Clean asynchronous backend.
- **FastAPI**: High-performance REST API with automatic OpenAPI documentation.
- **Pydantic (v2)**: Strict schema validation and serialization.
- **PyMongo**: MongoDB driver for persistent document storage.
- **Bcrypt & PyJWT**: Secure password hashing and token generation.
- **Json-Repair**: Automated repair and validation of structured LLM outputs.
- **Uvicorn**: Asynchronous ASGI web server.

### AI Integration
- **Groq API & Official Groq Python SDK**: Ultra-low-latency LLM inference.
- **Supported Models**: `openai/gpt-oss-120b`, `openai/gpt-oss-20b`, `qwen/qwen3.8-27b`.
- **System Prompts**: Purpose-built system prompts for Roadmap Architect, Diagnostic Evaluator, AI Tutor, and Quiz Generator.

---

## 🗄️ Database Schema (MongoDB)

All records are scoped by authenticated `user_id` to enforce strict data isolation:

1. **`users`**:
   - `user_id`, `name`, `email`, `hashed_password`, `target_role`, `experience_level`, `bio`, `weekly_study_hours`, `created_at`.
2. **`skills`**:
   - `user_id`, `name`, `category`, `proficiency`, `verified`, `score`, `last_assessed`.
3. **`assessments`**:
   - `assessment_id`, `user_id`, `domain`, `proficiency`, `skills`, `questions`, `score_percentage`, `strong_areas`, `weak_areas`, `recommendations`, `detailed_evaluations`, `completed_at`.
4. **`roadmaps`**:
   - `id`, `user_id`, `goal`, `current_proficiency`, `available_hours_per_week`, `total_weeks`, `modules` (with nested `topics` and `practical_exercises`), `progress_percentage`, `completed_topics`, `total_topics`, `updated_at`.
5. **`tutor_conversations`**:
   - `conversation_id`, `user_id`, `title`, `proficiency_level`, `messages` (list of `role`, `content`, `timestamp`), `last_message`, `updated_at`.
6. **`quiz_attempts`**:
   - `attempt_id`, `quiz_id`, `user_id`, `topic`, `difficulty`, `score_percentage`, `correct_count`, `total_questions`, `passed`, `results` (with explanations), `created_at`.

---

## 📁 Project Folder Structure

```
SkillGraph/
├── frontend/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   │   ├── Navbar.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   └── ProtectedRoute.jsx
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │   ├── layouts/
│   │   │   └── AppLayout.jsx
│   │   ├── pages/
│   │   │   ├── LandingPage.jsx
│   │   │   ├── LoginPage.jsx
│   │   │   ├── RegisterPage.jsx
│   │   │   ├── DashboardPage.jsx
│   │   │   ├── AssessmentPage.jsx
│   │   │   ├── RoadmapPage.jsx
│   │   │   ├── TutorPage.jsx
│   │   │   ├── QuizPage.jsx
│   │   │   ├── AnalyticsPage.jsx
│   │   │   └── ProfilePage.jsx
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
│
├── backend/
│   ├── app/
│   │   ├── core/
│   │   │   ├── config.py
│   │   │   └── security.py
│   │   ├── database/
│   │   │   └── connection.py
│   │   ├── models/
│   │   │   ├── user.py
│   │   │   ├── skill.py
│   │   │   ├── roadmap.py
│   │   │   ├── tutor.py
│   │   │   └── quiz.py
│   │   ├── routes/
│   │   │   ├── auth.py
│   │   │   ├── skills.py
│   │   │   ├── roadmap.py
│   │   │   ├── tutor.py
│   │   │   ├── quiz.py
│   │   │   └── dashboard.py
│   │   ├── services/
│   │   │   └── groq_service.py
│   │   └── main.py
│   ├── test_e2e.py
│   ├── requirements.txt
│   ├── .env.example
│   └── .env
│
├── README.md
└── .gitignore
```

---

## 🚀 Installation & Quickstart

### Prerequisites
- **Node.js** (v18+) & **npm**
- **Python** (3.11+)
- **MongoDB** running locally on port `27017` (or MongoDB Atlas URI)
- **Groq API Key** (from [console.groq.com](https://console.groq.com))

---

### 1. Backend Setup

1. Open a terminal and navigate to the `backend/` directory:
   ```bash
   cd backend
   ```

2. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Configure your environment variables in `backend/.env`:
   ```bash
   cp .env.example .env
   ```
   Add your `GROQ_API_KEY`:
   ```env
   GROQ_API_KEY=gsk_your_actual_groq_api_key
   GROQ_MODEL=openai/gpt-oss-120b
   MONGODB_URI=mongodb://localhost:27017
   DATABASE_NAME=skillgraph_db
   JWT_SECRET=skillgraph_super_secret_jwt_key_2026_academic_saas
   ```

4. Start the FastAPI server:
   ```bash
   python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
   ```
   Backend will be running at: `http://127.0.0.1:8000`  
   Interactive API docs (Swagger): `http://127.0.0.1:8000/docs`

---

### 2. Frontend Setup

1. In a second terminal, navigate to the `frontend/` directory:
   ```bash
   cd frontend
   ```

2. Install npm dependencies:
   ```bash
   npm install
   ```

3. Start the Vite development server:
   ```bash
   npm run dev -- --port 5173
   ```
   Frontend will be running at: `http://127.0.0.1:5173`

---

## ⚙️ Environment Variables

### Backend (`backend/.env`)

| Variable | Description | Default / Example |
| :--- | :--- | :--- |
| `GROQ_API_KEY` | Official Groq API key | `gsk_...` |
| `GROQ_MODEL` | Configurable LLM model | `openai/gpt-oss-120b` |
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017` |
| `DATABASE_NAME` | MongoDB database name | `skillgraph_db` |
| `JWT_SECRET` | Secret key for signing JWTs | `skillgraph_super_secret...` |
| `JWT_ALGORITHM` | JWT hashing algorithm | `HS256` |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Token expiration duration | `1440` (24 Hours) |
| `PORT` | Backend server port | `8000` |
| `HOST` | Backend server host | `127.0.0.1` |

---

## 📡 API Reference

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :---: |
| `POST` | `/api/auth/register` | Register new student account | No |
| `POST` | `/api/auth/login` | Login and obtain JWT token | No |
| `GET` | `/api/auth/me` | Fetch authenticated student profile | Yes |
| `PUT` | `/api/auth/profile` | Update profile information | Yes |
| `GET` | `/api/skills/catalog` | Get catalog of domains and skills | No |
| `GET` | `/api/skills` | Fetch student's tracked skills | Yes |
| `POST` | `/api/skills` | Add/update student skills | Yes |
| `POST` | `/api/skills/assessment/generate` | Generate diagnostic assessment via Groq | Yes |
| `POST` | `/api/skills/assessment/submit` | Evaluate assessment answers via Groq | Yes |
| `GET` | `/api/skills/assessments` | Fetch student's past assessments | Yes |
| `POST` | `/api/roadmap/generate` | Generate personalized roadmap via Groq | Yes |
| `GET` | `/api/roadmap` | Fetch active roadmap | Yes |
| `PATCH` | `/api/roadmap/{id}/progress` | Mark topic completed/uncompleted | Yes |
| `POST` | `/api/tutor/chat` | Send message to AI Assistant (Groq) | Yes |
| `GET` | `/api/tutor/history` | List all conversation threads | Yes |
| `GET` | `/api/tutor/history/{id}` | Get messages of a specific thread | Yes |
| `DELETE` | `/api/tutor/history/{id}` | Delete a conversation thread | Yes |
| `POST` | `/api/quiz/generate` | Generate adaptive MCQs via Groq | Yes |
| `POST` | `/api/quiz/submit` | Submit quiz and get explanations | Yes |
| `GET` | `/api/quiz/history` | List past quiz attempts | Yes |
| `GET` | `/api/dashboard/stats` | Comprehensive student metrics & next steps | Yes |

---

## 🧪 Testing and Verification

Run the automated end-to-end integration test suite verifying all 12 key platform functionalities:

```bash
python backend/test_e2e.py
```

Output:
```
============================================================
SKILLGRAPH END-TO-END SYSTEM INTEGRATION TESTS
============================================================
✅ Health Check passed
✅ Registration passed
✅ Login & JWT generation passed
✅ Auth /me passed
✅ Profile Update passed
✅ Skill Catalog passed
✅ Add Skills passed
✅ Groq Assessment Generated & Evaluated passed
✅ SkillGraph AI Assistant multi-turn conversation passed
✅ Tutor Conversation History retrieved passed
✅ Groq Roadmap generated & Topic Progress update passed
✅ AI Quiz Generation & Submission passed
✅ Dashboard Stats retrieved successfully
============================================================
ALL 12 END-TO-END TESTS PASSED WITH 100% SUCCESS!
============================================================
```

---

## 🔮 Future Enhancements

- **FastAPI Server-Sent Events (SSE)**: Streaming token-by-token output for SkillGraph AI Assistant.
- **Interactive Code Runner / Sandbox**: Run Python and JavaScript code snippets directly in the browser.
- **Peer Collaborative Study Groups**: Group roadmaps and peer benchmarks.
- **Resume & LinkedIn Skill Exporter**: Export verified skills and completed modules into verifiable digital badges and resume bullets.

---

## 📄 License

This project was built for academic evaluation and portfolio demonstration under the MIT License.
