import React from 'react';
import { Link } from 'react-router-dom';
import { 
  BrainCircuit, 
  Sparkles, 
  Compass, 
  Award, 
  ArrowRight, 
  CheckCircle2, 
  Code2, 
  Target, 
  Layers, 
  Zap,
  TrendingUp,
  Cpu
} from 'lucide-react';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-[#080d1a] text-slate-100 overflow-hidden">
      {/* Background ambient glowing orbs */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[550px] overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-150px] left-1/4 w-[500px] h-[500px] bg-indigo-600/15 rounded-full blur-[120px]" />
        <div className="absolute top-[-80px] right-1/4 w-[450px] h-[450px] bg-purple-600/15 rounded-full blur-[120px]" />
      </div>

      {/* Hero Section */}
      <section className="relative z-10 pt-16 pb-20 md:pt-24 md:pb-28 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Release / Innovation Pill */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-800/80 border border-slate-700/70 text-xs font-medium text-slate-300 mb-8 shadow-sm">
          <span className="flex h-2 w-2 rounded-full bg-indigo-400 animate-pulse" />
          <span className="text-indigo-400 font-semibold">SkillGraph 2.0</span>
          <span className="text-slate-500">•</span>
          <span>Powered by Groq High-Speed LLM Inference</span>
          <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
        </div>

        {/* Main Headline */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-[1.12]">
          Master Tech Skills with{' '}
          <span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-purple-400 bg-clip-text text-transparent">
            AI-Personalized
          </span>{' '}
          Roadmaps & Tutoring
        </h1>

        {/* Subtitle */}
        <p className="mt-6 text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
          Diagnose your technical knowledge gaps, generate structured step-by-step learning roadmaps, 
          chat with your 24/7 AI tutor, and test your skills through adaptive quizzes.
        </p>

        {/* Call to Actions */}
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            to="/register"
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold shadow-lg shadow-indigo-600/30 hover:shadow-indigo-600/40 transition-all flex items-center justify-center gap-2 group text-base"
          >
            <span>Start Learning for Free</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>

          <Link
            to="/login"
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-slate-800/90 hover:bg-slate-700/90 text-slate-200 font-semibold border border-slate-700/80 transition-all text-base"
          >
            Sign In to Dashboard
          </Link>
        </div>

        {/* Value Proof Badges */}
        <div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Zero Generic Advice</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Actual Groq LLM Intelligence</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Multi-turn AI Assistant</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Interactive Code Explanations</span>
          </div>
        </div>

        {/* Hero Visual Mockup */}
        <div className="mt-16 relative max-w-5xl mx-auto rounded-2xl border border-slate-800 bg-slate-900/60 p-3 sm:p-4 backdrop-blur-xl shadow-2xl shadow-indigo-500/10">
          <div className="rounded-xl overflow-hidden border border-slate-800/80 bg-[#0a0f1d] p-6 text-left">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-6">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-rose-500/80" />
                <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                <span className="ml-2 text-xs font-mono text-slate-400">SkillGraph AI Curriculum Engine</span>
              </div>
              <span className="text-xs px-2.5 py-1 rounded-md bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-medium">
                Active Roadmap • Full Stack Web
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50">
                <span className="text-[11px] font-semibold uppercase text-indigo-400">Module 1 • Fundamentals</span>
                <h4 className="text-sm font-semibold text-white mt-1">Modern JavaScript & Async Control</h4>
                <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
                  <span>3 Topics • 7.5 hrs</span>
                  <span className="text-emerald-400 font-medium">100% Done</span>
                </div>
                <div className="w-full bg-slate-700 h-1.5 rounded-full mt-2 overflow-hidden">
                  <div className="bg-emerald-500 h-full w-full rounded-full" />
                </div>
              </div>

              <div className="p-4 rounded-xl bg-indigo-950/30 border border-indigo-500/30">
                <span className="text-[11px] font-semibold uppercase text-indigo-400">Module 2 • In Progress</span>
                <h4 className="text-sm font-semibold text-white mt-1">React State & Custom Hooks</h4>
                <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
                  <span>4 Topics • 10.0 hrs</span>
                  <span className="text-indigo-400 font-medium">50% Done</span>
                </div>
                <div className="w-full bg-slate-700 h-1.5 rounded-full mt-2 overflow-hidden">
                  <div className="bg-indigo-500 h-full w-1/2 rounded-full" />
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50">
                <span className="text-[11px] font-semibold uppercase text-slate-400">Module 3 • Upcoming</span>
                <h4 className="text-sm font-semibold text-white mt-1">FastAPI Backend & MongoDB</h4>
                <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
                  <span>3 Topics • 8.0 hrs</span>
                  <span className="text-slate-400 font-medium">Pending</span>
                </div>
                <div className="w-full bg-slate-700 h-1.5 rounded-full mt-2 overflow-hidden">
                  <div className="bg-slate-600 h-full w-0 rounded-full" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Features Grid */}
      <section className="py-20 border-t border-slate-800/80 bg-[#070b16] relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-bold uppercase tracking-widest text-indigo-400 mb-3">
              Comprehensive Learning Ecosystem
            </h2>
            <h3 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
              Everything You Need to Bridge Your Technical Skill Gaps
            </h3>
            <p className="mt-4 text-slate-400 text-base">
              Say goodbye to fragmented tutorials and tutorial hell. SkillGraph unifies skill diagnosis, 
              custom path generation, and real-time AI mentoring.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Feature 1 */}
            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-indigo-500/40 transition-all group">
              <div className="w-12 h-12 rounded-xl bg-indigo-600/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <Target className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-semibold text-white mb-2">Diagnostic Skill Assessment</h4>
              <p className="text-sm text-slate-400 leading-relaxed">
                Take AI-generated diagnostic tests across Frontend, Backend, AI, and DevOps. Uncover your precise blindspots.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-indigo-500/40 transition-all group">
              <div className="w-12 h-12 rounded-xl bg-purple-600/10 text-purple-400 border border-purple-500/20 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <Compass className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-semibold text-white mb-2">Personalized Roadmaps</h4>
              <p className="text-sm text-slate-400 leading-relaxed">
                Generates a customized curriculum tailored to your available hours, background, and career targets with hands-on exercises.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-6 rounded-2xl bg-slate-900/60 border border-indigo-500/40 bg-gradient-to-b from-indigo-950/20 to-slate-900/60 transition-all group">
              <div className="w-12 h-12 rounded-xl bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <Sparkles className="w-6 h-6 text-indigo-400" />
              </div>
              <h4 className="text-lg font-semibold text-white mb-2">SkillGraph AI Assistant</h4>
              <p className="text-sm text-slate-400 leading-relaxed">
                ChatGPT-style technical tutor with multi-turn memory. Ask conceptual questions, debug code, and prepare for interviews.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-indigo-500/40 transition-all group">
              <div className="w-12 h-12 rounded-xl bg-emerald-600/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <Award className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-semibold text-white mb-2">Adaptive Quizzes</h4>
              <p className="text-sm text-slate-400 leading-relaxed">
                Dynamic quizzes on any topic and difficulty level. Receive instant scoring and detailed code explanations.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-xs font-bold uppercase tracking-widest text-indigo-400 mb-3">
            Workflow
          </h2>
          <h3 className="text-3xl font-bold text-white">How SkillGraph Accelerates Learning</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
          <div className="flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-2xl bg-slate-800 border border-slate-700 text-indigo-400 font-bold flex items-center justify-center text-lg mb-4 shadow-md">
              1
            </div>
            <h4 className="text-base font-semibold text-white mb-1">Select Domain & Goal</h4>
            <p className="text-xs text-slate-400">
              Pick your target tech stack and self-rate your current proficiency.
            </p>
          </div>

          <div className="flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-2xl bg-slate-800 border border-slate-700 text-indigo-400 font-bold flex items-center justify-center text-lg mb-4 shadow-md">
              2
            </div>
            <h4 className="text-base font-semibold text-white mb-1">Diagnose Knowledge Gaps</h4>
            <p className="text-xs text-slate-400">
              Take an AI assessment to pinpoint exact weak areas and strengths.
            </p>
          </div>

          <div className="flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-2xl bg-slate-800 border border-slate-700 text-indigo-400 font-bold flex items-center justify-center text-lg mb-4 shadow-md">
              3
            </div>
            <h4 className="text-base font-semibold text-white mb-1">Follow Dynamic Roadmap</h4>
            <p className="text-xs text-slate-400">
              Execute structured modules with practical deliverables and track progress.
            </p>
          </div>

          <div className="flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white font-bold flex items-center justify-center text-lg mb-4 shadow-lg shadow-indigo-600/30">
              4
            </div>
            <h4 className="text-base font-semibold text-white mb-1">Learn with AI Tutor</h4>
            <p className="text-xs text-slate-400">
              Get 24/7 unblocked assistance and test mastery with adaptive quizzes.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 border-t border-slate-800 bg-gradient-to-b from-indigo-950/20 to-[#080d1a]">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h3 className="text-3xl font-bold text-white">Ready to elevate your engineering career?</h3>
          <p className="mt-3 text-slate-400 text-sm max-w-xl mx-auto">
            Join students using SkillGraph to eliminate guesswork and master full-stack software development.
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <Link
              to="/register"
              className="px-8 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold shadow-lg shadow-indigo-600/30 transition-all text-sm"
            >
              Get Started Now
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 py-8 text-center text-xs text-slate-500">
        <p>© 2026 SkillGraph AI. Built for CS academic project presentation & real-world SaaS portfolio.</p>
      </footer>
    </div>
  );
};

export default LandingPage;
