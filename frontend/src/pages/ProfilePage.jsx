import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  UserCircle2, 
  Mail, 
  Briefcase, 
  Award, 
  Clock, 
  Save, 
  Check, 
  AlertCircle,
  FileText
} from 'lucide-react';

const ProfilePage = () => {
  const { user, updateProfile } = useAuth();

  const [formData, setFormData] = useState({
    name: user?.name || '',
    target_role: user?.target_role || 'Full Stack Developer',
    experience_level: user?.experience_level || 'Beginner',
    weekly_study_hours: user?.weekly_study_hours || 10,
    bio: user?.bio || ''
  });

  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const roles = [
    'Full Stack Developer',
    'Frontend Specialist',
    'Backend Engineer',
    'Data Scientist / AI Engineer',
    'Cloud & DevOps Engineer'
  ];

  const levels = ['Beginner', 'Intermediate', 'Advanced'];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess(false);

    try {
      await updateProfile({
        name: formData.name,
        target_role: formData.target_role,
        experience_level: formData.experience_level,
        weekly_study_hours: Number(formData.weekly_study_hours),
        bio: formData.bio
      });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.detail || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="border-b border-slate-800 pb-5">
        <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
          <UserCircle2 className="w-6 h-6 text-indigo-400" />
          <span>Student Profile Management</span>
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Customize your career target and study preferences. SkillGraph adapts learning roadmaps to your goals.
        </p>
      </div>

      {success && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm flex items-center gap-2.5">
          <Check className="w-5 h-5 shrink-0" />
          <span>Profile updated successfully!</span>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm flex items-center gap-2.5">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left: Avatar Card */}
        <div className="md:col-span-1 p-6 rounded-2xl bg-slate-900/80 border border-slate-800 text-center space-y-4">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-indigo-600 via-violet-600 to-purple-500 text-white font-extrabold text-2xl flex items-center justify-center mx-auto shadow-xl shadow-indigo-500/20">
            {user?.name ? user.name[0].toUpperCase() : 'S'}
          </div>

          <div>
            <h3 className="text-lg font-bold text-white">{user?.name}</h3>
            <p className="text-xs text-slate-400 mt-0.5">{user?.email}</p>
          </div>

          <div className="pt-4 border-t border-slate-800 text-left space-y-2 text-xs">
            <div className="flex justify-between py-1 border-b border-slate-800/60">
              <span className="text-slate-400">Target Role:</span>
              <span className="text-slate-200 font-medium truncate max-w-[130px]">{user?.target_role}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800/60">
              <span className="text-slate-400">Proficiency:</span>
              <span className="text-indigo-400 font-semibold">{user?.experience_level}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-400">Weekly Goal:</span>
              <span className="text-slate-200 font-medium">{user?.weekly_study_hours || 10} hrs/wk</span>
            </div>
          </div>
        </div>

        {/* Right: Editable Form */}
        <div className="md:col-span-2 p-6 rounded-2xl bg-slate-900/80 border border-slate-800">
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Full Name
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Email Address (Read-only)
              </label>
              <input
                type="email"
                disabled
                value={user?.email || ''}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/40 border border-slate-700/60 text-slate-400 text-sm cursor-not-allowed"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Target Role
                </label>
                <select
                  value={formData.target_role}
                  onChange={(e) => setFormData({ ...formData, target_role: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-white text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {roles.map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Experience Level
                </label>
                <select
                  value={formData.experience_level}
                  onChange={(e) => setFormData({ ...formData, experience_level: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-white text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {levels.map((l) => (
                    <option key={l} value={l}>{l}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Weekly Study Hours Goal
              </label>
              <input
                type="number"
                min="1"
                max="80"
                value={formData.weekly_study_hours}
                onChange={(e) => setFormData({ ...formData, weekly_study_hours: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Bio / Learning Objectives
              </label>
              <textarea
                rows={3}
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                placeholder="Share your background, current university degree, or upcoming internship targets..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-white text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="pt-4 border-t border-slate-800 flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-md shadow-indigo-600/30 transition-all flex items-center gap-2"
              >
                {saving ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Save Changes</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
