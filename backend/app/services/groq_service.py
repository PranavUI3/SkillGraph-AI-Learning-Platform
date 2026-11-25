import os
import json
import re
import logging
from typing import List, Dict, Any, Optional
import groq
from json_repair import repair_json
from app.core.config import settings

logger = logging.getLogger("skillgraph.groq")

class GroqService:
    def __init__(self):
        self.api_key = settings.GROQ_API_KEY
        self.primary_model = settings.GROQ_MODEL
        self.fallback_models = settings.GROQ_FALLBACK_MODELS
        self._client: Optional[groq.Groq] = None

    def get_client(self) -> groq.Groq:
        if not self._client:
            if not self.api_key:
                logger.error("GROQ_API_KEY is not set in environment!")
                raise ValueError("GROQ_API_KEY is not configured in backend .env")
            self._client = groq.Groq(api_key=self.api_key)
        return self._client

    def _call_llm_with_fallback(
        self,
        messages: List[Dict[str, str]],
        temperature: float = 0.4,
        max_tokens: int = 4096,
        response_format: Optional[Dict[str, str]] = None
    ) -> str:
        """Call Groq API with automatic fallback across available models upon error/rate limit."""
        client = self.get_client()
        models_to_try = [self.primary_model] + [m for m in self.fallback_models if m != self.primary_model]
        
        last_error = None
        for model in models_to_try:
            try:
                kwargs = {
                    "model": model,
                    "messages": messages,
                    "temperature": temperature,
                    "max_tokens": max_tokens,
                }
                if response_format:
                    kwargs["response_format"] = response_format
                
                completion = client.chat.completions.create(**kwargs)
                content = completion.choices[0].message.content
                if content:
                    return content
            except Exception as e:
                logger.warning(f"Groq model {model} failed with error: {e}. Trying fallback if available...")
                last_error = e

        raise RuntimeError(f"All Groq models failed. Last error: {last_error}")

    def _parse_json(self, raw_text: str) -> Any:
        """Extract, repair, and parse JSON from LLM response safely."""
        cleaned = self._clean_json_string(raw_text)
        try:
            return json.loads(cleaned)
        except Exception:
            # Use json_repair to fix unescaped characters, missing commas or brackets
            try:
                repaired = repair_json(cleaned, return_objects=True)
                if repaired is not None:
                    return repaired
            except Exception as e:
                logger.warning(f"json_repair failed: {e}")
            raise

    def _clean_json_string(self, text: str) -> str:
        """Extract and clean valid JSON from LLM response which might have markdown fences."""
        text = text.strip()
        # Match ```json ... ``` or ``` ... ```
        fence_match = re.search(r"```(?:json)?\s*([\s\S]*?)\s*```", text, re.IGNORECASE)
        if fence_match:
            text = fence_match.group(1).strip()
        
        # If text still contains non-json leading/trailing content
        first_bracket = text.find('[')
        first_brace = text.find('{')
        
        if first_brace != -1 and (first_bracket == -1 or first_brace < first_bracket):
            last_brace = text.rfind('}')
            if last_brace != -1:
                text = text[first_brace:last_brace + 1]
        elif first_bracket != -1:
            last_bracket = text.rfind(']')
            if last_bracket != -1:
                text = text[first_bracket:last_bracket + 1]
                
        return text

    # ==========================================
    # 1. SKILL ASSESSMENT GENERATION & EVALUATION
    # ==========================================
    def generate_assessment_questions(
        self,
        domain: str,
        skills: List[str],
        proficiency: str,
        question_count: int = 5
    ) -> List[Dict[str, Any]]:
        """Generate diagnostic assessment questions for specified domain and skills."""
        system_prompt = (
            "You are an expert technical interviewer and educator for SkillGraph. "
            "Generate rigorous, accurate multiple-choice assessment questions to diagnose a student's current skill level. "
            "Respond ONLY with a valid JSON array of objects. Do not include introductory or explanatory prose."
        )

        user_prompt = f"""
Generate {question_count} diagnostic multiple choice questions for:
Domain: {domain}
Skills to test: {", ".join(skills)}
Student's self-reported proficiency: {proficiency}

Format each question as an object in a JSON array:
[
  {{
    "id": 1,
    "question": "Clear and conceptual or scenario-based question",
    "code_snippet": "Optional code snippet if relevant, otherwise null",
    "options": ["Option A text", "Option B text", "Option C text", "Option D text"],
    "correct_option_index": 0,
    "skill_tag": "Specific skill name (e.g. React hooks)",
    "difficulty": "{proficiency}"
  }}
]
Ensure each question has exactly 4 options and exactly one correct option index (0 to 3).
"""

        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt}
        ]

        raw = self._call_llm_with_fallback(messages, temperature=0.3)
        data = self._parse_json(raw)
        if isinstance(data, dict) and "questions" in data:
            data = data["questions"]
        return data

    def evaluate_assessment(
        self,
        domain: str,
        proficiency: str,
        skills: List[str],
        questions: List[Dict[str, Any]],
        user_answers: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """Evaluate student assessment answers and provide structured gap analysis."""
        # Calculate base score deterministically first
        answer_map = {ans["question_id"]: ans["selected_option"] for ans in user_answers}
        total = len(questions)
        correct_count = 0
        detailed_evals = []

        for q in questions:
            qid = q.get("id")
            selected = answer_map.get(qid, -1)
            correct_idx = q.get("correct_option_index", 0)
            is_correct = (selected == correct_idx)
            if is_correct:
                correct_count += 1
            
            opts = q.get("options", [])
            selected_str = opts[selected] if 0 <= selected < len(opts) else "No Answer"
            correct_str = opts[correct_idx] if 0 <= correct_idx < len(opts) else ""

            detailed_evals.append({
                "question_id": qid,
                "question": q.get("question", ""),
                "skill_tag": q.get("skill_tag", "General"),
                "selected_option": selected,
                "selected_text": selected_str,
                "correct_option": correct_idx,
                "correct_text": correct_str,
                "is_correct": is_correct
            })

        score_percentage = round((correct_count / total * 100) if total > 0 else 0, 1)

        system_prompt = (
            "You are SkillGraph's AI Learning Diagnosis Engine. Analyze student assessment performance "
            "and output a structured gap analysis in JSON. Return strictly a JSON object with no wrapping commentary."
        )

        user_prompt = f"""
Student Assessment Performance:
Domain: {domain}
Proficiency Claimed: {proficiency}
Skills Assessed: {", ".join(skills)}
Score: {correct_count}/{total} ({score_percentage}%)

Question by Question results:
{json.dumps(detailed_evals, indent=2)}

Provide JSON response with this exact structure:
{{
  "summary": "2-3 sentences evaluating their overall current grasp and readiness.",
  "strong_areas": ["List 2-4 strong competencies or demonstrated concepts"],
  "weak_areas": ["List 2-4 specific knowledge gaps or misunderstood concepts"],
  "recommendations": ["List 3 actionable, high-priority learning recommendations"]
}}
"""

        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt}
        ]

        raw = self._call_llm_with_fallback(messages, temperature=0.3)
        feedback_json = self._parse_json(raw)

        return {
            "score_percentage": score_percentage,
            "total_questions": total,
            "correct_count": correct_count,
            "summary": feedback_json.get("summary", f"Completed assessment with a score of {score_percentage}%."),
            "strong_areas": feedback_json.get("strong_areas", []),
            "weak_areas": feedback_json.get("weak_areas", []),
            "recommendations": feedback_json.get("recommendations", []),
            "detailed_evaluations": detailed_evals
        }

    # ==========================================
    # 2. ROADMAP GENERATION
    # ==========================================
    def generate_roadmap(
        self,
        goal: str,
        current_skills: List[str],
        current_proficiency: str,
        available_hours_per_week: int = 10,
        preferred_duration_weeks: int = 8
    ) -> Dict[str, Any]:
        """Generate a modular, personalized roadmap based on goals and skills."""
        system_prompt = (
            "You are SkillGraph's master technical curriculum architect. "
            "You design world-class, practical, outcome-driven learning roadmaps tailored to the student's background. "
            "Output strictly a JSON object conforming to the requested schema. No commentary outside JSON."
        )

        user_prompt = f"""
Design a personalized learning roadmap for this student:
Target Career/Goal: {goal}
Current Skills: {", ".join(current_skills) if current_skills else "Absolute Beginner (No prior skills)"}
Current Proficiency: {current_proficiency}
Weekly Time Commitment: {available_hours_per_week} hours/week
Target Duration: {preferred_duration_weeks} weeks

Generate a structured roadmap broken into 3 to 4 logical modules.
Each module must have 2 focused topics.
Each topic must have clear learning objectives, prerequisites, estimated hours, and a concrete practical exercise. Keep descriptions and exercises concise.

Format strictly as JSON:
{{
  "goal": "{goal}",
  "total_weeks": {preferred_duration_weeks},
  "modules": [
    {{
      "id": "mod_1",
      "title": "Module Title (e.g. Core Fundamentals & Tooling)",
      "description": "Brief description of the module focus",
      "week_number": 1,
      "estimated_duration": "2 Weeks",
      "topics": [
        {{
          "id": "top_1_1",
          "title": "Topic Name",
          "description": "Clear conceptual overview",
          "estimated_hours": 3.5,
          "difficulty": "Beginner",
          "prerequisites": ["Prereq 1"],
          "learning_objectives": ["Objective 1", "Objective 2"],
          "practical_exercises": [
            {{
              "title": "Exercise Name",
              "description": "What the student builds or writes",
              "deliverable": "GitHub repo or runnable snippet"
            }}
          ]
        }}
      ]
    }}
  ]
}}
"""

        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt}
        ]

        raw = self._call_llm_with_fallback(messages, temperature=0.3, max_tokens=4096)
        return self._parse_json(raw)

    # ==========================================
    # 3. AI TUTOR CHATBOT
    # ==========================================
    def generate_chat_reply(
        self,
        history: List[Dict[str, str]],
        student_proficiency: str = "Beginner",
        topic_context: Optional[str] = None
    ) -> str:
        """Generate pedagogical, engaging, multi-turn AI tutor response."""
        system_prompt = (
            "You are SkillGraph AI Assistant, a friendly, encouraging, and world-class technical mentor. "
            "You excel at explaining complex computer science, programming, system design, and software concepts "
            f"calibrated for a student at the '{student_proficiency}' level. "
            "\nGuidelines for your answers:"
            "\n1. Format your responses with clean GitHub-flavored Markdown."
            "\n2. Provide concise, high-clarity conceptual explanations with intuitive analogies."
            "\n3. Provide runnable, well-commented code snippets with appropriate language tags (e.g. ```python, ```javascript)."
            "\n4. If the student has errors or code debugging questions, identify the root cause clearly and suggest fixes."
            "\n5. End responses with a quick check-for-understanding or a thoughtful follow-up question to encourage learning."
        )

        if topic_context:
            system_prompt += f"\nCurrent active learning topic context: {topic_context}"

        messages = [{"role": "system", "content": system_prompt}] + history

        reply = self._call_llm_with_fallback(messages, temperature=0.6, max_tokens=2048)
        return reply

    # ==========================================
    # 4. QUIZ GENERATION
    # ==========================================
    def generate_quiz(
        self,
        topic: str,
        difficulty: str = "Beginner",
        num_questions: int = 5
    ) -> List[Dict[str, Any]]:
        """Generate multiple choice quiz questions with explanations using Groq."""
        system_prompt = (
            "You are SkillGraph's automated quiz creator. "
            "You produce high-quality multiple choice technical questions that test deep understanding rather than mere syntax memorization. "
            "Output strictly a JSON array of question objects. Do not include any markdown fences or introductory text outside JSON."
        )

        user_prompt = f"""
Generate {num_questions} multiple choice quiz questions for:
Topic: {topic}
Difficulty: {difficulty}

Each question must test conceptual mastery, edge cases, or code behavior.
Output format:
[
  {{
    "id": 1,
    "question": "Question statement?",
    "code_snippet": "Optional code snippet if relevant, otherwise null",
    "options": [
      "Option A",
      "Option B",
      "Option C",
      "Option D"
    ],
    "correct_option_index": 1,
    "explanation": "Detailed explanation of why this answer is correct and why other options are incorrect."
  }}
]
Ensure correct_option_index is an integer from 0 to 3.
"""

        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt}
        ]

        raw = self._call_llm_with_fallback(messages, temperature=0.4)
        data = self._parse_json(raw)
        if isinstance(data, dict) and "questions" in data:
            data = data["questions"]
        return data

    # ==========================================
    # 5. DASHBOARD RECOMMENDATIONS
    # ==========================================
    def generate_recommendations(
        self,
        skills: List[str],
        completed_topics: List[str],
        recent_quiz_scores: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """Generate dynamic personalized recommendations based on student's current progress."""
        system_prompt = (
            "You are SkillGraph's student success adviser. "
            "Based on the student's progress and recent quiz performance, suggest the optimal next topic and study tip. "
            "Output strictly a JSON object."
        )

        user_prompt = f"""
Student Profile:
Added Skills: {", ".join(skills) if skills else "None yet"}
Completed Topics: {", ".join(completed_topics) if completed_topics else "None yet"}
Recent Quizzes: {json.dumps(recent_quiz_scores)}

Output strictly in JSON:
{{
  "recommended_next_topic": "Specific next topic name",
  "reason": "1-2 sentence motivating reason why this is the best next step",
  "recommended_focus_area": "Key skill or concept to practice",
  "study_tip": "Practical advice for mastering this"
}}
"""
        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt}
        ]

        try:
            raw = self._call_llm_with_fallback(messages, temperature=0.4, max_tokens=1000)
            return self._parse_json(raw)
        except Exception as e:
            logger.warning(f"Could not generate dynamic recommendation: {e}")
            return {
                "recommended_next_topic": "Modern JavaScript ES6+ & Asynchronous Concepts",
                "reason": "Mastering asynchronous workflows and promises prepares you for full-stack integration.",
                "recommended_focus_area": "Event Loop & Promises",
                "study_tip": "Build a small CLI or fetch wrapper to solidify your async/await intuition."
            }

groq_service = GroqService()
