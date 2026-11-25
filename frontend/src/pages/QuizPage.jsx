import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { 
  Award, 
  Sparkles, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  ChevronRight, 
  RotateCcw, 
  History, 
  BookOpen, 
  Check, 
  Clock,
  Layers,
  ArrowRight
} from 'lucide-react';

const TOPIC_PRESETS = [
  "React Hooks & Lifecycle",
  "Python Async & FastAPI",
  "MongoDB & Query Optimization",
  "RESTful API & HTTP Protocols",
  "JavaScript Event Loop & Closures",
  "System Design & Scalability",
  "Docker & Containerization"
];

const QuizPage = () => {
  const [activeTab, setActiveTab] = useState('quiz'); // 'quiz' | 'history'
  const [topic, setTopic] = useState(TOPIC_PRESETS[0]);
  const [customTopic, setCustomTopic] = useState('');
  const [difficulty, setDifficulty] = useState('Beginner');
  const [numQuestions, setNumQuestions] = useState(5);

  // Runner state
  const [state, setState] = useState('idle'); // 'idle' | 'generating' | 'active' | 'submitting' | 'result'
  const [currentQuizId, setCurrentQuizId] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [userAnswers, setUserAnswers] = useState({}); // qid -> optionIndex
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const res = await api.get('/quiz/history');
      setHistory(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleStartQuiz = async () => {
    const finalTopic = customTopic.trim() || topic;
    if (!finalTopic) return;

    setError('');
    setState('generating');

    try {
      const res = await api.post('/quiz/generate', {
        topic: finalTopic,
        difficulty,
        num_questions: numQuestions
      });

      setCurrentQuizId(res.data.quiz_id);
      setQuestions(res.data.questions);
      setUserAnswers({});
      setCurrentQIndex(0);
      setState('active');
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.detail || 'Failed to generate quiz questions with Groq AI.');
      setState('idle');
    }
  };

  const handleSelectOption = (optionIndex) => {
    const qid = questions[currentQIndex].id;
    setUserAnswers({ ...userAnswers, [qid]: optionIndex });
  };

  const handleSubmitQuiz = async () => {
    setError('');
    setState('submitting');

    try {
      const formattedAnswers = questions.map(q => ({
        question_id: q.id,
        selected_option_index: userAnswers[q.id] !== undefined ? userAnswers[q.id] : -1
      }));

      const res = await api.post('/quiz/submit', {
        quiz_id: currentQuizId,
        answers: formattedAnswers
      });

      setResult(res.data);
      setState('result');
      fetchHistory();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.detail || 'Failed to submit quiz.');
      setState('active');
    }
  };

  const viewPastAttempt = async (attemptId) => {
    try {
      const res = await api.get(`/quiz/${attemptId}`);
      setResult(res.data);
      setState('result');
      setActiveTab('quiz');
    } catch (err) {
      console.error(err);
    }
  };

  const resetQuiz = () => {
    setState('idle');
    setQuestions([]);
    setUserAnswers({});
    setResult(null);
    setCurrentQIndex(0);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <Award className="w-6 h-6 text-amber-400" />
            <span>AI Adaptive Technical Quizzes</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Test your programming mastery with dynamic Groq-generated questions and instant explanations.
          </p>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center p-1 rounded-xl bg-slate-900 border border-slate-800">
          <button
            onClick={() => { setActiveTab('quiz'); resetQuiz(); }}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'quiz' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            Take Quiz
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
              activeTab === 'history' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Attempts History ({history.length})</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm flex items-center gap-2.5">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* TAB 1: QUIZ RUNNER */}
      {activeTab === 'quiz' && (
        <>
          {/* STEP 1: CONFIGURE & GENERATE (IDLE) */}
          {state === 'idle' && (
            <div className="space-y-6">
              {/* Presets Grid */}
              <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-6 backdrop-blur-sm">
                <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-400 mb-3">
                  Step 1: Select Topic
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 mb-4">
                  {TOPIC_PRESETS.map((t) => (
                    <button
                      key={t}
                      onClick={() => { setTopic(t); setCustomTopic(''); }}
                      className={`p-3 rounded-xl text-left border text-xs font-medium transition-all ${
                        topic === t && !customTopic
                          ? 'bg-indigo-950/40 border-indigo-500 text-white shadow-md shadow-indigo-500/10'
                          : 'bg-slate-800/40 border-slate-700/60 text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                    Or Enter Any Custom Topic
                  </label>
                  <input
                    type="text"
                    value={customTopic}
                    onChange={(e) => setCustomTopic(e.target.value)}
                    placeholder="e.g. Redux Toolkit, SQL Subqueries, Rust Memory Safety"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* Difficulty & Count */}
              <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-6 backdrop-blur-sm">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-400 mb-2">
                      Difficulty Level
                    </h3>
                    <div className="grid grid-cols-3 gap-2">
                      {['Beginner', 'Intermediate', 'Advanced'].map((lvl) => (
                        <button
                          key={lvl}
                          type="button"
                          onClick={() => setDifficulty(lvl)}
                          className={`py-2 rounded-xl text-xs font-semibold border transition-all ${
                            difficulty === lvl
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
                      Number of Questions
                    </h3>
                    <div className="grid grid-cols-3 gap-2">
                      {[3, 5, 10].map((cnt) => (
                        <button
                          key={cnt}
                          type="button"
                          onClick={() => setNumQuestions(cnt)}
                          className={`py-2 rounded-xl text-xs font-semibold border transition-all ${
                            numQuestions === cnt
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
                    onClick={handleStartQuiz}
                    className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm shadow-lg shadow-indigo-600/30 transition-all flex items-center gap-2"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>Generate AI Quiz</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* GENERATING LOADER */}
          {state === 'generating' && (
            <div className="text-center py-20 rounded-2xl bg-slate-900/60 border border-slate-800 p-8">
              <div className="w-12 h-12 border-4 border-amber-500/30 border-t-amber-500 rounded-full animate-spin mx-auto mb-4" />
              <h3 className="text-lg font-bold text-white">Generating Quiz with Groq...</h3>
              <p className="text-xs text-slate-400 mt-2 max-w-sm mx-auto">
                Creating conceptual questions, code snippets, and distractor options for {customTopic || topic} ({difficulty}).
              </p>
            </div>
          )}

          {/* ACTIVE TEST RUNNER */}
          {state === 'active' && questions.length > 0 && (
            <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-6 sm:p-8 backdrop-blur-sm space-y-6">
              {/* Progress */}
              <div className="flex items-center justify-between text-xs text-slate-400 pb-3 border-b border-slate-800">
                <span className="font-semibold text-indigo-400">
                  Question {currentQIndex + 1} of {questions.length}
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-slate-300">
                  {difficulty}
                </span>
              </div>

              {/* Question Text */}
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
                  const isSelected = userAnswers[qid] === optIdx;
                  return (
                    <button
                      key={optIdx}
                      type="button"
                      onClick={() => handleSelectOption(optIdx)}
                      className={`w-full text-left p-4 rounded-xl text-sm border transition-all flex items-start gap-3.5 ${
                        isSelected
                          ? 'bg-indigo-950/40 border-indigo-500 text-white shadow-md shadow-indigo-500/10'
                          : 'bg-slate-800/40 border-slate-700/60 text-slate-300 hover:bg-slate-800'
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
                  Previous
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
                    onClick={handleSubmitQuiz}
                    className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md shadow-emerald-600/20"
                  >
                    Submit Quiz
                  </button>
                )}
              </div>
            </div>
          )}

          {/* SUBMITTING LOADER */}
          {state === 'submitting' && (
            <div className="text-center py-20 rounded-2xl bg-slate-900/60 border border-slate-800 p-8">
              <div className="w-12 h-12 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin mx-auto mb-4" />
              <h3 className="text-lg font-bold text-white">Grading Quiz & Recording Attempt...</h3>
            </div>
          )}

          {/* RESULTS VIEW */}
          {state === 'result' && result && (
            <div className="space-y-6">
              {/* Score Card */}
              <div className="rounded-2xl bg-gradient-to-r from-indigo-950/60 via-purple-950/40 to-slate-900 border border-indigo-500/30 p-6 sm:p-8 backdrop-blur-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">
                      Quiz Completed
                    </span>
                    <h2 className="text-2xl font-extrabold text-white mt-1">{result.topic}</h2>
                    <p className="text-xs text-slate-300 mt-1">
                      Difficulty: {result.difficulty} • {result.correct_count} of {result.total_questions} questions correct
                    </p>
                  </div>

                  <div className="flex items-center gap-4 shrink-0">
                    <div className="text-center px-6 py-4 rounded-2xl bg-slate-800/80 border border-slate-700/80">
                      <span className={`text-3xl font-black ${result.passed ? 'text-emerald-400' : 'text-amber-400'}`}>
                        {result.score_percentage}%
                      </span>
                      <p className="text-[11px] font-bold uppercase tracking-wider mt-1">
                        {result.passed ? (
                          <span className="text-emerald-400">Passed</span>
                        ) : (
                          <span className="text-amber-400">Needs Review</span>
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Question by Question Review with Explanations */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-white">Question Explanations</h3>
                {result.results.map((q, idx) => (
                  <div
                    key={q.question_id || idx}
                    className={`p-5 rounded-2xl border text-xs ${
                      q.is_correct
                        ? 'bg-emerald-950/15 border-emerald-500/30'
                        : 'bg-rose-950/15 border-rose-500/30'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <h4 className="font-semibold text-white text-sm">
                        Q{idx + 1}: {q.question}
                      </h4>
                      {q.is_correct ? (
                        <span className="px-2.5 py-1 rounded-md bg-emerald-500/20 text-emerald-400 font-bold shrink-0 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Correct
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-md bg-rose-500/20 text-rose-400 font-bold shrink-0 flex items-center gap-1">
                          <XCircle className="w-3.5 h-3.5" /> Incorrect
                        </span>
                      )}
                    </div>

                    {q.code_snippet && (
                      <pre className="my-2.5 p-3 rounded-lg bg-[#060a13] border border-slate-800 text-[11px] font-mono text-indigo-200 overflow-x-auto">
                        <code>{q.code_snippet}</code>
                      </pre>
                    )}

                    <div className="space-y-1 mt-3 text-slate-300">
                      <p>
                        Your answer:{' '}
                        <span className={q.is_correct ? 'text-emerald-400 font-medium' : 'text-rose-400 font-medium'}>
                          {q.selected_option_index !== -1 ? q.options[q.selected_option_index] : "Skipped"}
                        </span>
                      </p>
                      {!q.is_correct && (
                        <p>
                          Correct answer:{' '}
                          <span className="text-emerald-400 font-medium">
                            {q.options[q.correct_option_index]}
                          </span>
                        </p>
                      )}
                    </div>

                    <div className="mt-3 p-3 rounded-xl bg-slate-900/90 border border-slate-800 text-slate-300 text-xs">
                      <span className="font-semibold text-indigo-400">Why: </span>
                      {q.explanation}
                    </div>
                  </div>
                ))}
              </div>

              {/* Actions */}
              <div className="pt-4 flex items-center justify-between">
                <button
                  onClick={resetQuiz}
                  className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-2"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Take Another Quiz</span>
                </button>

                <a
                  href="/tutor"
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/30 flex items-center gap-1.5"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Discuss Weak Areas with AI Tutor</span>
                </a>
              </div>
            </div>
          )}
        </>
      )}

      {/* TAB 2: ATTEMPTS HISTORY */}
      {activeTab === 'history' && (
        <div className="space-y-3">
          {history.length > 0 ? (
            history.map((att) => (
              <div
                key={att.attempt_id}
                onClick={() => viewPastAttempt(att.attempt_id)}
                className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-indigo-500/40 hover:bg-slate-850 transition-all cursor-pointer flex items-center justify-between"
              >
                <div>
                  <h4 className="text-sm font-semibold text-white">{att.topic}</h4>
                  <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
                    <span className="uppercase text-[10px] font-semibold">{att.difficulty}</span>
                    <span>•</span>
                    <span>{att.correct_count} / {att.total_questions} correct</span>
                    <span>•</span>
                    <span>{new Date(att.created_at).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <span className={`text-base font-bold ${att.passed ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {att.score_percentage}%
                  </span>
                  <ChevronRight className="w-4 h-4 text-slate-500" />
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12 border border-dashed border-slate-800 rounded-2xl">
              <Award className="w-10 h-10 text-slate-600 mx-auto mb-2" />
              <p className="text-sm text-slate-400">No past quiz attempts found.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default QuizPage;
