import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { 
  GraduationCap, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  ArrowRight, 
  Layers, 
  Sparkles, 
  RotateCcw, 
  Lightbulb,
  Check,
  ChevronRight,
  TrendingUp,
  BrainCircuit,
  History
} from 'lucide-react';

const DOMAINS = [
  {
    id: 'frontend',
    name: 'Frontend Web Development',
    skills: ['HTML5 & Semantics', 'CSS3 & Tailwind', 'JavaScript (ES6+)', 'React.js', 'State Management', 'Web Performance']
  },
  {
    id: 'backend',
    name: 'Backend & API Engineering',
    skills: ['Python & FastAPI', 'Node.js & Express', 'RESTful API Design', 'MongoDB', 'Authentication & JWT', 'Docker Basics']
  },
  {
    id: 'fullstack',
    name: 'Full Stack Engineering',
    skills: ['React.js', 'FastAPI / Node.js', 'MongoDB / SQL', 'Git & GitHub', 'REST APIs', 'Full Stack Deployment']
  },
  {
    id: 'datascience',
    name: 'Data Science & Machine Learning',
    skills: ['Python Basics', 'Pandas & NumPy', 'Data Visualization', 'Scikit-Learn', 'LLM Prompt Engineering', 'Model Evaluation']
  },
  {
    id: 'cloud_devops',
    name: 'Cloud & DevOps Engineering',
    skills: ['Linux Commands', 'Docker Containers', 'CI/CD Pipelines', 'AWS Fundamentals', 'Kubernetes Basics', 'Networking']
  }
];

const AssessmentPage = () => {
  const [selectedDomain, setSelectedDomain] = useState(DOMAINS[0]);
  const [selectedSkills, setSelectedSkills] = useState(['JavaScript (ES6+)', 'React.js']);
  const [proficiency, setProficiency] = useState('Beginner');
  const [questionCount, setQuestionCount] = useState(5);

  // Assessment runner state
  const [assessmentState, setAssessmentState] = useState('idle'); // idle | generating | active | evaluating | completed
  const [currentAssessmentId, setCurrentAssessmentId] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({}); // question_id -> option_index
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [feedback, setFeedback] = useState(null);
  const [pastAssessments, setPastAssessments] = useState([]);
  const [activeTab, setActiveTab] = useState('new'); // new | history
  const [error, setError] = useState('');

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const res = await api.get('/skills/assessments');
      setPastAssessments(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDomainChange = (domain) => {
    setSelectedDomain(domain);
    setSelectedSkills(domain.skills.slice(0, 3));
  };

  const toggleSkill = (skill) => {
    if (selectedSkills.includes(skill)) {
      if (selectedSkills.length > 1) {
        setSelectedSkills(selectedSkills.filter(s => s !== skill));
      }
    } else {
      setSelectedSkills([...selectedSkills, skill]);
    }
  };

  const startAssessment = async () => {
    setError('');
    setAssessmentState('generating');
    try {
      const res = await api.post('/skills/assessment/generate', {
        domain: selectedDomain.name,
        skills: selectedSkills,
        proficiency,
        question_count: questionCount
      });
      setCurrentAssessmentId(res.data.assessment_id);
      setQuestions(res.data.questions);
      setAnswers({});
      setCurrentQIndex(0);
      setAssessmentState('active');
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.detail || 'Failed to generate diagnostic assessment questions.');
      setAssessmentState('idle');
    }
  };

  const handleOptionSelect = (optionIndex) => {
    const qid = questions[currentQIndex].id;
    setAnswers({ ...answers, [qid]: optionIndex });
  };

  const submitAssessment = async () => {
    setError('');
    setAssessmentState('evaluating');
    try {
      const formattedAnswers = questions.map(q => ({
        question_id: q.id,
        selected_option: answers[q.id] !== undefined ? answers[q.id] : -1,
        question_text: q.question,
        selected_text: answers[q.id] !== undefined && q.options[answers[q.id]] ? q.options[answers[q.id]] : "No Answer"
      }));

      const res = await api.post('/skills/assessment/submit', {
        assessment_id: currentAssessmentId,
        domain: selectedDomain.name,
        proficiency,
        skills: selectedSkills,
        answers: formattedAnswers
      });

      setFeedback(res.data);
      setAssessmentState('completed');
      fetchHistory();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.detail || 'Failed to submit and evaluate assessment.');
      setAssessmentState('active');
    }
  };

  const resetAll = () => {
    setAssessmentState('idle');
    setQuestions([]);
    setAnswers({});
    setFeedback(null);
    setCurrentQIndex(0);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <GraduationCap className="w-6 h-6 text-indigo-400" />
            <span>AI Skill Diagnostic Assessment</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Test your technical knowledge with Groq-generated questions to diagnose weak points and strengths.
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex items-center p-1 rounded-xl bg-slate-900 border border-slate-800">
          <button
            onClick={() => { setActiveTab('new'); resetAll(); }}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'new' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            Take Assessment
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
              activeTab === 'history' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Past Results ({pastAssessments.length})</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm flex items-center gap-2.5">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* TAB 1: NEW ASSESSMENT FLOW */}
      {activeTab === 'new' && (
        <>
          {/* STEP 1: CONFIGURATION (IDLE) */}
          {assessmentState === 'idle' && (
            <div className="space-y-6">
              {/* Domain selection */}
              <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-6 backdrop-blur-sm">
                <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-400 mb-3">
                  Step 1: Choose Technical Domain
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {DOMAINS.map((domain) => (
                    <button
                      key={domain.id}
                      onClick={() => handleDomainChange(domain)}
                      className={`p-4 rounded-xl text-left border transition-all ${
                        selectedDomain.id === domain.id
                          ? 'bg-indigo-950/40 border-indigo-500 shadow-md shadow-indigo-500/10'
                          : 'bg-slate-800/40 border-slate-700/60 hover:bg-slate-800 hover:border-slate-600'
                      }`}
                    >
                      <h4 className="text-sm font-semibold text-white">{domain.name}</h4>
                      <p className="text-xs text-slate-400 mt-1">{domain.skills.length} core topics available</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Skills selection */}
              <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-6 backdrop-blur-sm">
                <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-400 mb-3">
                  Step 2: Choose Skills to Test
                </h3>
                <p className="text-xs text-slate-400 mb-3">
                  Click to select or deselect specific competencies for this diagnostic run.
                </p>
                <div className="flex flex-wrap gap-2">
                  {selectedDomain.skills.map((skill) => {
                    const isSelected = selectedSkills.includes(skill);
                    return (
                      <button
                        key={skill}
                        type="button"
                        onClick={() => toggleSkill(skill)}
                        className={`px-3.5 py-2 rounded-xl text-xs font-medium border transition-all flex items-center gap-2 ${
                          isSelected
                            ? 'bg-indigo-600 text-white border-indigo-500 shadow-sm'
                            : 'bg-slate-800/60 text-slate-300 border-slate-700/70 hover:bg-slate-800 hover:border-slate-600'
                        }`}
                      >
                        {isSelected && <Check className="w-3.5 h-3.5" />}
                        <span>{skill}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Proficiency Level & Count */}
              <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-6 backdrop-blur-sm">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-400 mb-2">
                      Self-Reported Proficiency
                    </h3>
                    <div className="grid grid-cols-3 gap-2">
                      {['Beginner', 'Intermediate', 'Advanced'].map((lvl) => (
                        <button
                          key={lvl}
                          type="button"
                          onClick={() => setProficiency(lvl)}
                          className={`py-2 rounded-xl text-xs font-semibold border transition-all ${
                            proficiency === lvl
                              ? 'bg-indigo-600 text-white border-indigo-500'
                              : 'bg-slate-800/60 text-slate-300 border-slate-700 hover:bg-slate-800'
                          }`}
                        >
                          {lvl}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-400 mb-2">
                      Question Count
                    </h3>
                    <div className="grid grid-cols-3 gap-2">
                      {[3, 5, 8].map((cnt) => (
                        <button
                          key={cnt}
                          type="button"
                          onClick={() => setQuestionCount(cnt)}
                          className={`py-2 rounded-xl text-xs font-semibold border transition-all ${
                            questionCount === cnt
                              ? 'bg-indigo-600 text-white border-indigo-500'
                              : 'bg-slate-800/60 text-slate-300 border-slate-700 hover:bg-slate-800'
                          }`}
                        >
                          {cnt} Questions
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-slate-800 flex justify-end">
                  <button
                    onClick={startAssessment}
                    className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm shadow-lg shadow-indigo-600/30 transition-all flex items-center gap-2"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>Generate AI Diagnostic Assessment</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* GENERATING LOADER */}
          {assessmentState === 'generating' && (
            <div className="text-center py-20 rounded-2xl bg-slate-900/60 border border-slate-800 p-8">
              <div className="w-12 h-12 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mx-auto mb-4" />
              <h3 className="text-lg font-bold text-white">Generating Diagnostic Questions...</h3>
              <p className="text-xs text-slate-400 mt-2 max-w-sm mx-auto">
                Groq LLM is tailoring conceptual questions specifically for {selectedSkills.join(', ')} at the {proficiency} level.
              </p>
            </div>
          )}

          {/* ACTIVE TEST RUNNER */}
          {assessmentState === 'active' && questions.length > 0 && (
            <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-6 sm:p-8 backdrop-blur-sm space-y-6">
              {/* Question progress */}
              <div className="flex items-center justify-between text-xs text-slate-400 pb-3 border-b border-slate-800">
                <span className="font-semibold text-indigo-400">
                  Question {currentQIndex + 1} of {questions.length}
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-slate-300">
                  {questions[currentQIndex].skill_tag || selectedDomain.name}
                </span>
              </div>

              {/* Question text */}
              <div>
                <h3 className="text-base sm:text-lg font-bold text-white leading-snug">
                  {questions[currentQIndex].question}
                </h3>
                {questions[currentQIndex].code_snippet && (
                  <pre className="mt-3 p-4 rounded-xl bg-[#060a13] border border-slate-800 text-xs font-mono text-indigo-200 overflow-x-auto">
                    <code>{questions[currentQIndex].code_snippet}</code>
                  </pre>
                )}
              </div>

              {/* Options */}
              <div className="space-y-3 pt-2">
                {questions[currentQIndex].options.map((opt, optIdx) => {
                  const qid = questions[currentQIndex].id;
                  const isSelected = answers[qid] === optIdx;
                  return (
                    <button
                      key={optIdx}
                      type="button"
                      onClick={() => handleOptionSelect(optIdx)}
                      className={`w-full text-left p-4 rounded-xl text-sm border transition-all flex items-start gap-3.5 ${
                        isSelected
                          ? 'bg-indigo-950/40 border-indigo-500 text-white shadow-md shadow-indigo-500/10'
                          : 'bg-slate-800/40 border-slate-700/60 text-slate-300 hover:bg-slate-800 hover:border-slate-600'
                      }`}
                    >
                      <div className={`w-6 h-6 rounded-lg text-xs font-bold flex items-center justify-center shrink-0 mt-0.5 ${
                        isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-700 text-slate-400'
                      }`}>
                        {String.fromCharCode(65 + optIdx)}
                      </div>
                      <span className="leading-relaxed">{opt}</span>
                    </button>
                  );
                })}
              </div>

              {/* Navigation controls */}
              <div className="flex items-center justify-between pt-6 border-t border-slate-800">
                <button
                  type="button"
                  disabled={currentQIndex === 0}
                  onClick={() => setCurrentQIndex(currentQIndex - 1)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium disabled:opacity-40"
                >
                  Previous Question
                </button>

                {currentQIndex < questions.length - 1 ? (
                  <button
                    type="button"
                    onClick={() => setCurrentQIndex(currentQIndex + 1)}
                    className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-indigo-600/20"
                  >
                    <span>Next</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={submitAssessment}
                    className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md shadow-emerald-600/20"
                  >
                    Submit & Evaluate with AI
                  </button>
                )}
              </div>
            </div>
          )}

          {/* EVALUATING LOADER */}
          {assessmentState === 'evaluating' && (
            <div className="text-center py-20 rounded-2xl bg-slate-900/60 border border-slate-800 p-8">
              <div className="w-12 h-12 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mx-auto mb-4" />
              <h3 className="text-lg font-bold text-white">Analyzing Knowledge Gaps with Groq...</h3>
              <p className="text-xs text-slate-400 mt-2 max-w-sm mx-auto">
                SkillGraph is evaluating your responses, identifying strong points, and calculating targeted recommendations.
              </p>
            </div>
          )}

          {/* COMPLETED REPORT */}
          {assessmentState === 'completed' && feedback && (
            <div className="space-y-6">
              {/* Score Banner */}
              <div className="rounded-2xl bg-gradient-to-r from-indigo-950/60 via-purple-950/40 to-slate-900 border border-indigo-500/30 p-6 sm:p-8 backdrop-blur-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">
                      Assessment Result
                    </span>
                    <h2 className="text-2xl font-extrabold text-white mt-1">Diagnostic Report</h2>
                    <p className="text-xs text-slate-300 mt-1 max-w-lg leading-relaxed">
                      {feedback.summary}
                    </p>
                  </div>

                  <div className="flex items-center gap-4 shrink-0">
                    <div className="text-center px-6 py-4 rounded-2xl bg-slate-800/80 border border-slate-700/80">
                      <span className="text-3xl font-black text-indigo-400">
                        {feedback.score_percentage}%
                      </span>
                      <p className="text-[11px] text-slate-400 mt-1">
                        {feedback.correct_count} of {feedback.total_questions} Correct
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Strengths & Weaknesses 2-Column */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-6 rounded-2xl bg-slate-900/80 border border-emerald-500/30">
                  <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-3">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Demonstrated Strengths</span>
                  </div>
                  <ul className="space-y-2">
                    {feedback.strong_areas.map((str, idx) => (
                      <li key={idx} className="text-xs text-slate-300 flex items-start gap-2">
                        <span className="text-emerald-400">•</span>
                        <span>{str}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-6 rounded-2xl bg-slate-900/80 border border-rose-500/30">
                  <div className="flex items-center gap-2 text-rose-400 text-xs font-bold uppercase tracking-wider mb-3">
                    <XCircle className="w-4 h-4" />
                    <span>Identified Knowledge Gaps (Weak Areas)</span>
                  </div>
                  <ul className="space-y-2">
                    {feedback.weak_areas.map((wk, idx) => (
                      <li key={idx} className="text-xs text-slate-300 flex items-start gap-2">
                        <span className="text-rose-400">•</span>
                        <span>{wk}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Actionable Recommendations */}
              <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800">
                <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold uppercase tracking-wider mb-3">
                  <Lightbulb className="w-4 h-4" />
                  <span>AI Learning Recommendations</span>
                </div>
                <div className="space-y-2.5">
                  {feedback.recommendations.map((rec, idx) => (
                    <div key={idx} className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/50 text-xs text-slate-300 flex items-start gap-3">
                      <span className="w-5 h-5 rounded-md bg-indigo-500/20 text-indigo-400 font-bold flex items-center justify-center shrink-0">
                        {idx + 1}
                      </span>
                      <span className="leading-relaxed">{rec}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Detailed Question Review */}
              <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
                <h4 className="text-sm font-bold text-white">Question by Question Review</h4>
                <div className="space-y-3">
                  {feedback.detailed_evaluations.map((item, idx) => (
                    <div
                      key={idx}
                      className={`p-4 rounded-xl border text-xs ${
                        item.is_correct
                          ? 'bg-emerald-950/20 border-emerald-500/30'
                          : 'bg-rose-950/20 border-rose-500/30'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="font-semibold text-white">Q{idx + 1}: {item.question}</span>
                        {item.is_correct ? (
                          <span className="text-emerald-400 font-bold flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Correct
                          </span>
                        ) : (
                          <span className="text-rose-400 font-bold flex items-center gap-1">
                            <XCircle className="w-3.5 h-3.5" /> Missed
                          </span>
                        )}
                      </div>
                      <div className="text-slate-400 space-y-0.5 mt-2">
                        <p>Your choice: <span className="text-slate-200 font-medium">{item.selected_text}</span></p>
                        {!item.is_correct && (
                          <p>Correct answer: <span className="text-emerald-400 font-medium">{item.correct_text}</span></p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Next Steps Buttons */}
              <div className="flex flex-wrap items-center justify-between gap-4 pt-4">
                <button
                  onClick={resetAll}
                  className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-2"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Take Another Assessment</span>
                </button>

                <div className="flex items-center gap-3">
                  <a
                    href="/roadmap"
                    className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/30"
                  >
                    Generate Custom Roadmap
                  </a>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* TAB 2: PAST ASSESSMENTS */}
      {activeTab === 'history' && (
        <div className="space-y-4">
          {pastAssessments.length > 0 ? (
            pastAssessments.map((item) => (
              <div
                key={item.assessment_id}
                className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-sm"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-white">{item.domain}</span>
                      <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                        {item.proficiency}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">
                      Assessed Skills: {item.skills?.join(', ')}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-lg font-bold text-indigo-400">{item.score_percentage}%</span>
                    <p className="text-[10px] text-slate-500">
                      {new Date(item.completed_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800/80 text-xs text-slate-300">
                  <p className="line-clamp-2">{item.summary}</p>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12 border border-dashed border-slate-800 rounded-2xl">
              <GraduationCap className="w-10 h-10 text-slate-600 mx-auto mb-2" />
              <p className="text-sm text-slate-400">No past assessments found.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AssessmentPage;
