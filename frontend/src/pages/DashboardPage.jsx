import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { 
  Sparkles, 
  Map, 
  GraduationCap, 
  Award, 
  CheckCircle2, 
  ArrowRight, 
  Clock, 
  TrendingUp, 
  Layers, 
  BookOpen, 
  HelpCircle,
  Lightbulb,
  AlertTriangle
} from 'lucide-react';

const DashboardPage = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await api.get('/dashboard/stats');
      setData(res.data);
    } catch (err) {
      console.error(err);
      setError('Could not fetch student dashboard statistics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <div className="w-10 h-10 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
        <p className="text-sm text-slate-400">Loading your personalized dashboard...</p>
      </div>
    );
  }

  const stats = data?.stats || {
    total_skills: 0,
    verified_skills: 0,
    total_topics: 0,
    completed_topics: 0,
    roadmap_progress: 0,
    total_quizzes: 0,
    average_quiz_score: 0
  };

  const currentRoadmap = data?.current_roadmap;
  const recentQuizzes = data?.recent_quizzes || [];
  const recommendation = data?.recommendation;

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Personalized Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-900/60 via-purple-900/40 to-slate-900 border border-indigo-500/30 p-6 sm:p-8 backdrop-blur-xl shadow-xl">
        <div className="absolute right-0 top-0 -mt-10 -mr-10 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs font-semibold mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Personalized Student Workspace</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Welcome back, {user?.name || "Student"}!
            </h1>
            <p className="text-sm text-slate-300 mt-1 max-w-xl">
              Targeting: <span className="text-white font-medium">{user?.target_role || "Full Stack Developer"}</span> • Level:{' '}
              <span className="text-indigo-400 font-medium">{user?.experience_level || "Beginner"}</span>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              to="/tutor"
              className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 transition-all flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>Ask AI Tutor</span>
            </Link>
            <Link
              to="/assessment"
              className="px-4 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 text-xs font-semibold border border-slate-700/70 transition-all flex items-center gap-2"
            >
              <GraduationCap className="w-4 h-4 text-indigo-400" />
              <span>Diagnostic Test</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800/80 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Skills Logged</span>
            <Layers className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-white">{stats.total_skills}</span>
            <span className="text-xs text-slate-400">({stats.verified_skills} verified)</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Diagnosed or added</p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800/80 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Roadmap Progress</span>
            <TrendingUp className="w-4 h-4 text-purple-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-white">{stats.roadmap_progress}%</span>
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
            <div 
              className="bg-purple-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, stats.roadmap_progress)}%` }}
            />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800/80 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Completed Topics</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-white">{stats.completed_topics}</span>
            <span className="text-xs text-slate-400">/ {stats.total_topics}</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Modules mastered</p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800/80 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Quiz Accuracy</span>
            <Award className="w-4 h-4 text-amber-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-white">{stats.average_quiz_score}%</span>
            <span className="text-xs text-slate-400">({stats.total_quizzes} tests)</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Average score</p>
        </div>
      </div>

      {/* Main 2-Column Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Active Roadmap + Next Topic (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Active Roadmap Card */}
          <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-6 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <Map className="w-5 h-5 text-indigo-400" />
                <h3 className="text-base font-bold text-white">Active Learning Roadmap</h3>
              </div>
              <Link
                to="/roadmap"
                className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1"
              >
                <span>View Full Roadmap</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {currentRoadmap ? (
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/60">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <span className="text-xs font-medium text-slate-400">Target Goal</span>
                      <h4 className="text-sm font-semibold text-white">{currentRoadmap.goal}</h4>
                    </div>
                    <div className="text-right">
                      <span className="text-xs text-slate-400">Overall Completion</span>
                      <p className="text-sm font-bold text-indigo-400">{currentRoadmap.progress_percentage}%</p>
                    </div>
                  </div>

                  <div className="w-full bg-slate-700 h-2 rounded-full mt-3 overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-indigo-500 to-purple-500 h-full rounded-full transition-all duration-500"
                      style={{ width: `${currentRoadmap.progress_percentage}%` }}
                    />
                  </div>
                </div>

                {currentRoadmap.next_topic ? (
                  <div className="p-4 rounded-xl bg-indigo-950/20 border border-indigo-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400">
                        Up Next to Master
                      </span>
                      <h5 className="text-sm font-bold text-white mt-0.5">
                        {currentRoadmap.next_topic.title}
                      </h5>
                      <p className="text-xs text-slate-400 mt-1 line-clamp-1">
                        {currentRoadmap.next_topic.description}
                      </p>
                    </div>
                    <Link
                      to="/roadmap"
                      className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shrink-0 text-center shadow-md shadow-indigo-600/20 transition-all"
                    >
                      Study Topic
                    </Link>
                  </div>
                ) : (
                  <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/30 text-center">
                    <CheckCircle2 className="w-6 h-6 text-emerald-400 mx-auto mb-1" />
                    <p className="text-xs font-semibold text-emerald-300">Congratulations! You've completed all topics in this roadmap.</p>
                  </div>
                )}
              </div>
            ) : (
              /* Meaningful Empty State */
              <div className="text-center py-8 px-4 border border-dashed border-slate-800 rounded-xl">
                <Map className="w-10 h-10 text-slate-600 mx-auto mb-2" />
                <h4 className="text-sm font-semibold text-white">No active roadmap generated yet</h4>
                <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1 mb-4">
                  Tell SkillGraph what tech stack or engineering goal you wish to achieve, and Groq will craft your step-by-step curriculum.
                </p>
                <Link
                  to="/roadmap"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/30 transition-all"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Generate Your First Roadmap</span>
                </Link>
              </div>
            )}
          </div>

          {/* AI Recommended Focus Area */}
          {recommendation && (
            <div className="rounded-2xl bg-gradient-to-br from-slate-900 to-indigo-950/40 border border-indigo-500/20 p-5 shadow-sm">
              <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold uppercase tracking-wider mb-2">
                <Lightbulb className="w-4 h-4" />
                <span>AI Recommendation Engine</span>
              </div>
              <h4 className="text-base font-bold text-white">{recommendation.topic}</h4>
              <p className="text-xs text-slate-300 mt-1">{recommendation.reason}</p>
              
              <div className="mt-3 p-3 rounded-xl bg-slate-800/60 border border-slate-700/50 flex items-start gap-2.5">
                <span className="text-xs font-semibold text-indigo-400 shrink-0">Study Tip:</span>
                <p className="text-xs text-slate-400">{recommendation.tip}</p>
              </div>

              <div className="mt-4 flex items-center gap-3">
                <Link
                  to={`/tutor`}
                  className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-sm transition-all"
                >
                  Ask AI Tutor About This
                </Link>
                <Link
                  to={`/quiz`}
                  className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 transition-all"
                >
                  Take a Quiz on Topic
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Recent Quizzes & Quick Links (1 col) */}
        <div className="space-y-6">
          {/* Recent Quiz Performance */}
          <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-6 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-bold text-white">Recent Quizzes</h3>
              </div>
              <Link to="/quiz" className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold">
                Test Skills
              </Link>
            </div>

            {recentQuizzes.length > 0 ? (
              <div className="space-y-3">
                {recentQuizzes.map((q) => (
                  <div
                    key={q.attempt_id}
                    className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/50 flex items-center justify-between"
                  >
                    <div className="min-w-0 pr-2">
                      <h5 className="text-xs font-semibold text-white truncate">{q.topic}</h5>
                      <span className="text-[10px] text-slate-400 uppercase tracking-wider">{q.difficulty}</span>
                    </div>
                    <div className="text-right shrink-0">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                        q.passed
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                          : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                      }`}>
                        {q.score_percentage}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 border border-dashed border-slate-800 rounded-xl">
                <Award className="w-8 h-8 text-slate-600 mx-auto mb-1.5" />
                <p className="text-xs text-slate-400">No quiz attempts yet.</p>
                <Link
                  to="/quiz"
                  className="mt-3 inline-block px-3 py-1.5 rounded-lg bg-indigo-600/80 hover:bg-indigo-600 text-white text-xs font-medium"
                >
                  Generate Quiz
                </Link>
              </div>
            )}
          </div>

          {/* Quick Platform Launchpad */}
          <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-6 backdrop-blur-sm">
            <h3 className="text-sm font-bold text-white mb-3">Quick Navigation</h3>
            <div className="space-y-2">
              <Link
                to="/assessment"
                className="flex items-center justify-between p-3 rounded-xl bg-slate-800/40 hover:bg-slate-800/80 border border-slate-700/50 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <GraduationCap className="w-4 h-4 text-indigo-400" />
                  <span className="text-xs font-medium text-slate-200">Take Skill Diagnostic</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
              </Link>

              <Link
                to="/roadmap"
                className="flex items-center justify-between p-3 rounded-xl bg-slate-800/40 hover:bg-slate-800/80 border border-slate-700/50 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <Map className="w-4 h-4 text-purple-400" />
                  <span className="text-xs font-medium text-slate-200">Curriculum Roadmap</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
              </Link>

              <Link
                to="/tutor"
                className="flex items-center justify-between p-3 rounded-xl bg-slate-800/40 hover:bg-slate-800/80 border border-slate-700/50 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span className="text-xs font-medium text-slate-200">SkillGraph AI Assistant</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
