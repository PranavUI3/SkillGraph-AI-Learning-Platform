import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { 
  BarChart3, 
  TrendingUp, 
  CheckCircle2, 
  Award, 
  Target, 
  AlertTriangle, 
  BookOpen, 
  Clock, 
  Layers,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import { Link } from 'react-router-dom';

const AnalyticsPage = () => {
  const [statsData, setStatsData] = useState(null);
  const [skills, setSkills] = useState([]);
  const [quizHistory, setQuizHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      const [statsRes, skillsRes, quizRes] = await Promise.all([
        api.get('/dashboard/stats'),
        api.get('/skills'),
        api.get('/quiz/history')
      ]);

      setStatsData(statsRes.data);
      setSkills(skillsRes.data);
      setQuizHistory(quizRes.data);
    } catch (err) {
      console.error('Failed to fetch analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <div className="w-10 h-10 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
        <p className="text-sm text-slate-400">Loading progress analytics...</p>
      </div>
    );
  }

  const stats = statsData?.stats || {};
  const currentRoadmap = statsData?.current_roadmap;
  const insights = statsData?.skill_insights || { weak_areas: [], strong_areas: [] };
  const recommendation = statsData?.recommendation;

  const passedQuizzesCount = quizHistory.filter(q => q.passed).length;
  const quizPassRate = quizHistory.length > 0 
    ? Math.round((passedQuizzesCount / quizHistory.length) * 100) 
    : 0;

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="border-b border-slate-800 pb-5">
        <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
          <BarChart3 className="w-6 h-6 text-indigo-400" />
          <span>Learning Analytics & Progress</span>
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Real-time metrics tracking your technical mastery, quiz accuracy, and curriculum completion.
        </p>
      </div>

      {/* Top 4 KPI Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Curriculum Progress</span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-extrabold text-white">{stats.roadmap_progress || 0}%</span>
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full mt-3 overflow-hidden">
            <div
              className="bg-indigo-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${stats.roadmap_progress || 0}%` }}
            />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Completed Topics</span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-extrabold text-emerald-400">{stats.completed_topics || 0}</span>
            <span className="text-xs text-slate-400">/ {stats.total_topics || 0}</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">Tracked in active roadmap</p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Avg Quiz Score</span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-extrabold text-amber-400">{stats.average_quiz_score || 0}%</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">{quizHistory.length} assessments completed</p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Quiz Pass Rate</span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-extrabold text-purple-400">{quizPassRate}%</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">{passedQuizzesCount} tests passed (≥70%)</p>
        </div>
      </div>

      {/* 2-Column Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Growth & Weak Areas */}
        <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
          <div className="flex items-center gap-2 text-rose-400 text-xs font-bold uppercase tracking-wider">
            <AlertTriangle className="w-4 h-4" />
            <span>Target Growth Areas (Diagnosed Gaps)</span>
          </div>

          {insights.weak_areas && insights.weak_areas.length > 0 ? (
            <div className="space-y-2.5">
              {insights.weak_areas.map((weak, idx) => (
                <div key={idx} className="p-3.5 rounded-xl bg-rose-950/20 border border-rose-500/20 text-xs flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-rose-500/20 text-rose-400 font-bold flex items-center justify-center shrink-0">
                    !
                  </span>
                  <div>
                    <h5 className="font-semibold text-rose-300">{weak}</h5>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Identified during skill diagnosis. Review foundational concepts or request a walkthrough from AI Tutor.
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-400 py-4">
              No critical weak areas identified yet. Take a diagnostic assessment in the Skill Assessment section!
            </p>
          )}

          <div className="pt-2">
            <Link
              to="/assessment"
              className="inline-flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 font-semibold"
            >
              <span>Retake Diagnostic Assessment</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Demonstrated Strengths */}
        <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4" />
            <span>Demonstrated Strong Competencies</span>
          </div>

          {insights.strong_areas && insights.strong_areas.length > 0 ? (
            <div className="space-y-2.5">
              {insights.strong_areas.map((strong, idx) => (
                <div key={idx} className="p-3.5 rounded-xl bg-emerald-950/20 border border-emerald-500/20 text-xs flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                  <div>
                    <h5 className="font-semibold text-emerald-300">{strong}</h5>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Verified through high scoring in relevant quiz and assessment questions.
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-400 py-4">
              Take an assessment to confirm and highlight your verified strengths.
            </p>
          )}
        </div>
      </div>

      {/* Skills Inventory & Verification Status */}
      <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800">
        <h3 className="text-sm font-bold text-white mb-4 flex items-center justify-between">
          <span>Tracked Technical Skills ({skills.length})</span>
          <span className="text-xs font-normal text-slate-400">
            {skills.filter(s => s.verified).length} verified via assessment
          </span>
        </h3>

        {skills.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {skills.map((skill, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-xl bg-slate-800/40 border border-slate-700/60 flex items-center justify-between"
              >
                <div>
                  <h5 className="text-xs font-semibold text-white">{skill.name}</h5>
                  <span className="text-[10px] text-slate-400">{skill.category}</span>
                </div>
                <div>
                  {skill.verified ? (
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                      Verified {skill.score ? `${skill.score}%` : ''}
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-700/50 text-slate-400">
                      Self-Rated
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 text-xs text-slate-400">
            No skills logged yet. Skills will automatically appear as you run assessments.
          </div>
        )}
      </div>

      {/* Suggested Next Topics Banner */}
      {recommendation && (
        <div className="p-6 rounded-2xl bg-gradient-to-r from-indigo-950/60 to-purple-950/40 border border-indigo-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">
              Recommended Next Step
            </span>
            <h4 className="text-base font-bold text-white mt-1">{recommendation.topic}</h4>
            <p className="text-xs text-slate-300 mt-1">{recommendation.reason}</p>
          </div>

          <Link
            to="/roadmap"
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/30 shrink-0 text-center"
          >
            Go to Roadmap
          </Link>
        </div>
      )}
    </div>
  );
};

export default AnalyticsPage;
