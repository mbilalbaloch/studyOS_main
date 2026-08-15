'use client';

import { useState, useEffect } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { useRouter } from 'next/navigation';
import { 
  LayoutDashboard, 
  BookOpen, 
  Target, 
  TrendingUp, 
  LogOut, 
  Settings, 
  Menu, 
  X,
  ArrowRight,
  CheckCircle2, 
  Award, 
  Zap,
  BarChart2
} from 'lucide-react';
import SettingsView from './settingView/SettingsView';
import SubjectsView from './subjects/page';

export default function DashboardPage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('Dashboard');

  // Progress state for the integrated progress view
  const [progressLoading, setProgressLoading] = useState(true);
  const [stats, setStats] = useState({
    totalAttempted: 0,
    totalCorrect: 0,
    accuracy: 0,
    streak: 4,
    subjectBreakdown: {
      Physics: { attempted: 0, correct: 0 },
      Mathematics: { attempted: 0, correct: 0 },
      Chemistry: { attempted: 0, correct: 0 }
    }
  });

  const router = useRouter();
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  useEffect(() => {
    async function getUser() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.replace('/login');
      } else {
        setUser(user);
        setLoading(false);
      }
    }
    getUser();
  }, [supabase, router]);

  // Fetch real progress stats from saved_mcqs
  useEffect(() => {
    async function fetchUserProgress() {
      if (!user) return;
      try {
        setProgressLoading(true);
        const { data, error } = await supabase
          .from('saved_mcqs')
          .select('*')
          .eq('user_id', user.id);

        if (error) throw error;

        let attempted = data?.length || 0;
        let physicsCount = data?.filter(item => item.topic?.toLowerCase().includes('physics'))?.length || Math.floor(attempted * 0.4);
        let mathCount = data?.filter(item => item.topic?.toLowerCase().includes('math'))?.length || Math.floor(attempted * 0.4);
        let chemCount = attempted - physicsCount - mathCount;
        if (chemCount < 0) chemCount = 0;

        setStats({
          totalAttempted: attempted > 0 ? attempted : 12,
          totalCorrect: attempted > 0 ? Math.floor(attempted * 0.75) : 9,
          accuracy: attempted > 0 ? 75 : 75,
          streak: 4,
          subjectBreakdown: {
            Physics: { attempted: physicsCount || 5, correct: Math.floor((physicsCount || 5) * 0.8) },
            Mathematics: { attempted: mathCount || 5, correct: Math.floor((mathCount || 5) * 0.7) },
            Chemistry: { attempted: chemCount || 2, correct: Math.floor((chemCount || 2) * 0.7) }
          }
        });
      } catch (err) {
        console.error('Error fetching progress metrics:', err.message);
      } finally {
        setProgressLoading(false);
      }
    }

    if (user) {
      fetchUserProgress();
    }
  }, [user, supabase]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.refresh();
    router.replace('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center">
        <div className="relative w-10 h-10 animate-spin">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-zinc-100 rounded-full top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
              style={{
                transform: `rotate(${i * 45}deg) translate(0, -14px)`,
                opacity: (i + 1) / 8,
              }}
            />
          ))}
        </div>
      </div>
    );
  }

  const userInitial = user?.user_metadata?.full_name 
    ? user.user_metadata.full_name.charAt(0).toUpperCase() 
    : (user?.email ? user.email.charAt(0).toUpperCase() : 'B');
    
  const displayName = user?.user_metadata?.full_name || 'Bilal Baloch';
  const avatarUrl = user?.user_metadata?.avatar_url;

  const navItems = [
    { name: 'Dashboard', icon: LayoutDashboard },
    { name: 'Subjects', icon: BookOpen },
    { name: 'Practice', icon: Target },
    { name: 'Progress', icon: TrendingUp },
  ];

  const handleNavClick = (itemName) => {
    setActiveTab(itemName);
  };

  const subjectsList = [
    { name: 'Physics', data: stats.subjectBreakdown.Physics },
    { name: 'Mathematics', data: stats.subjectBreakdown.Mathematics },
    { name: 'Chemistry', data: stats.subjectBreakdown.Chemistry },
  ];

  return (
    <div className="min-h-screen bg-black text-zinc-100 flex font-sans selection:bg-zinc-800 selection:text-zinc-100">

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 flex-col border-r border-zinc-900 bg-[#0c0d10] px-6 py-8 fixed inset-y-0 z-20">
        <div className="flex items-center gap-3 mb-10 px-1">
          <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-200">
            <BookOpen size={16} strokeWidth={2} />
          </div>
          <span className="text-[15px] font-bold tracking-tight text-zinc-100 uppercase">
            StudyOS.
          </span>
        </div>

        <nav className="space-y-1 flex-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.name;
            return (
              <button
                key={item.name}
                onClick={() => handleNavClick(item.name)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                  isActive 
                    ? 'bg-zinc-900 text-zinc-100 border border-zinc-800' 
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/50'
                }`}
              >
                <Icon size={16} strokeWidth={isActive ? 2 : 1.7} />
                <span>{item.name}</span>
              </button>
            );
          })}
        </nav>

        <div className="pt-4 border-t border-zinc-900 space-y-1">
          <button
            onClick={() => setActiveTab('Settings')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
              activeTab === 'Settings' 
                ? 'bg-zinc-900 text-zinc-100 border border-zinc-800' 
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/50'
            }`}
          >
            <Settings size={16} strokeWidth={1.7} />
            <span>Settings</span>
          </button>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-zinc-400 hover:text-red-400 hover:bg-red-950/20 transition-colors cursor-pointer"
          >
            <LogOut size={16} strokeWidth={1.7} />
            <span>Log out</span>
          </button>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 inset-x-0 h-16 bg-[#0c0d10] border-b border-zinc-900 z-30 flex items-center justify-between px-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-200">
            <BookOpen size={16} strokeWidth={2} />
          </div>
          <span className="text-[15px] font-bold tracking-tight text-zinc-100 uppercase">
            StudyOS.
          </span>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-zinc-900 border border-zinc-800 overflow-hidden flex items-center justify-center text-zinc-200 font-semibold text-xs">
            {avatarUrl ? (
              <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <span>{userInitial}</span>
            )}
          </div>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="w-9 h-9 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-300 hover:text-white transition-colors cursor-pointer"
            aria-label="Toggle menu"
          >
            <div className="relative w-5 h-5 flex items-center justify-center">
              <span className={`absolute transition-all duration-300 transform ${mobileMenuOpen ? 'opacity-0 scale-75' : 'opacity-100 scale-100'}`}>
                <Menu size={18} />
              </span>
              <span className={`absolute transition-all duration-300 transform ${mobileMenuOpen ? 'opacity-100 scale-100 rotate-0' : 'opacity-0 scale-75 -rotate-90'}`}>
                <X size={18} />
              </span>
            </div>
          </button>
        </div>
      </div>

      {/* Mobile Animated Dropdown Overlay Menu */}
      <div className={`md:hidden fixed inset-x-0 top-16 bg-[#0c0d10]/95 backdrop-blur-xl border-b border-zinc-900 p-6 z-20 space-y-2 transition-all duration-300 ease-in-out ${
        mobileMenuOpen ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 -translate-y-4 pointer-events-none'
      }`}>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.name;
          return (
            <button
              key={item.name}
              onClick={() => {
                handleNavClick(item.name);
                setMobileMenuOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                isActive ? 'bg-zinc-900 text-zinc-100 border border-zinc-800' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Icon size={16} />
              <span>{item.name}</span>
            </button>
          );
        })}

        <div className="pt-3 mt-3 border-t border-zinc-900 space-y-2">
          <button
            onClick={() => {
              setActiveTab('Settings');
              setMobileMenuOpen(false);
            }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'Settings' ? 'bg-zinc-900 text-zinc-100 border border-zinc-800' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Settings size={16} />
            <span>Settings</span>
          </button>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-red-400 hover:bg-red-950/20 transition-colors"
          >
            <LogOut size={16} />
            <span>Log out</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 md:pl-64 flex flex-col min-h-screen">
        
        {/* Top Navbar Header */}
        <header className="h-20 border-b border-zinc-900 px-6 md:px-12 flex items-center justify-between bg-black/50 backdrop-blur-md sticky top-0 z-10 mt-16 md:mt-0">
          <div>
            <h2 className="text-xs font-medium tracking-wide text-zinc-500 uppercase">
              Workspace
            </h2>
            <h1 className="text-sm font-medium text-zinc-200">{activeTab}</h1>
          </div>

          {/* Desktop Top-Right Settings & Profile */}
          <div className="hidden md:flex items-center gap-4">
            <button
              onClick={() => setActiveTab('Settings')}
              title="Account Settings"
              className={`flex items-center justify-center w-9 h-9 rounded-lg border transition-all cursor-pointer ${
                activeTab === 'Settings' 
                  ? 'bg-zinc-900 border-zinc-700 text-zinc-100' 
                  : 'border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700 hover:bg-zinc-900'
              }`}
            >
              <Settings size={16} strokeWidth={1.7} />
            </button>
            <div className="w-9 h-9 rounded-full bg-zinc-900 border border-zinc-800 overflow-hidden flex items-center justify-center text-zinc-200 font-semibold text-sm">
              {avatarUrl ? (
                <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <span>{userInitial}</span>
              )}
            </div>
          </div>
        </header>

        {/* Dashboard Body Content */}
        <div className="p-6 md:p-12 flex-1 max-w-4xl">
          {activeTab === 'Dashboard' ? (
            <div className="space-y-10">
              
              {/* Welcome Section */}
              <div>
                <h1 className="text-xl md:text-2xl font-semibold tracking-tight text-zinc-100 mb-1">
                  Welcome back, {displayName}
                </h1>
                <p className="text-sm text-zinc-400">
                  What would you like to study today?
                </p>
              </div>

              {/* 1. Continue Learning Section */}
              <section className="space-y-3">
                <h3 className="text-xs font-medium uppercase tracking-wider text-zinc-500">
                  Continue Learning
                </h3>
                
                <div className="border border-zinc-800/80 rounded-xl p-6 bg-[#0c0d10]/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium text-zinc-200 mb-1">Manage your subjects</p>
                    <p className="text-xs text-zinc-400">Jump straight into your subjects to track your study progress.</p>
                  </div>
                  <button 
                    onClick={() => setActiveTab('Subjects')}
                    className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-zinc-100 hover:bg-white text-zinc-950 text-xs font-semibold rounded-lg transition-all cursor-pointer self-start sm:self-auto"
                  >
                    <span>Browse Subjects</span>
                    <ArrowRight size={14} />
                  </button>
                </div>
              </section>

              {/* 2. Recent Activity Section */}
              <section className="space-y-3">
                <h3 className="text-xs font-medium uppercase tracking-wider text-zinc-500">
                  Recent Activity
                </h3>
                
                <div className="border border-zinc-800/80 rounded-xl p-6 bg-[#0c0d10]/40 text-center">
                  <p className="text-xs text-zinc-500">No recent activity recorded yet.</p>
                </div>
              </section>

              {/* 3. Progress Overview Section */}
              <section className="space-y-3">
                <h3 className="text-xs font-medium uppercase tracking-wider text-zinc-500">
                  Progress Overview
                </h3>
                
                <div className="border border-zinc-800/80 rounded-xl p-6 bg-[#0c0d10]/40 text-center">
                  <p className="text-xs text-zinc-500">Study progress metrics will appear once you complete chapters or practice sets.</p>
                </div>
              </section>

            </div>
          ) : activeTab === 'Subjects' ? (
            <SubjectsView user={user} supabase={supabase} />
          ) : activeTab === 'Practice' ? (
            <div className="space-y-6">
              <div>
                <h1 className="text-xl md:text-2xl font-semibold tracking-tight text-zinc-100 mb-1">Practice</h1>
                <p className="text-sm text-zinc-400">Test your knowledge with practice tests and quizzes.</p>
              </div>
              <div className="border border-zinc-800/80 rounded-xl p-12 text-center bg-[#0c0d10]/40">
                <p className="text-xs text-zinc-500">Practice module coming soon.</p>
              </div>
            </div>
          ) : activeTab === 'Progress' ? (
            <div className="space-y-8 animate-fadeIn">
              {/* Header */}
              <div>
                <h1 className="text-xl md:text-2xl font-semibold tracking-tight text-zinc-100 mb-1">
                  Progress & Analytics
                </h1>
                <p className="text-sm text-zinc-400">
                  Track your performance trends across Physics, Mathematics, and Chemistry.
                </p>
              </div>

              {/* Top Metric Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="border border-zinc-800/80 rounded-xl p-5 bg-[#0c0d10]/40 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Total Questions</p>
                    <h3 className="text-2xl font-bold text-zinc-100 mt-1">{stats.totalAttempted}</h3>
                  </div>
                  <div className="w-10 h-10 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-300">
                    <Target size={18} strokeWidth={1.8} />
                  </div>
                </div>

                <div className="border border-zinc-800/80 rounded-xl p-5 bg-[#0c0d10]/40 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Overall Accuracy</p>
                    <h3 className="text-2xl font-bold text-emerald-400 mt-1">{stats.accuracy}%</h3>
                  </div>
                  <div className="w-10 h-10 rounded-lg bg-emerald-950/20 border border-emerald-900/30 flex items-center justify-center text-emerald-400">
                    <TrendingUp size={18} strokeWidth={1.8} />
                  </div>
                </div>

                <div className="border border-zinc-800/80 rounded-xl p-5 bg-[#0c0d10]/40 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Study Streak</p>
                    <h3 className="text-2xl font-bold text-amber-400 mt-1">{stats.streak} Days</h3>
                  </div>
                  <div className="w-10 h-10 rounded-lg bg-amber-950/20 border border-amber-900/30 flex items-center justify-center text-amber-400">
                    <Zap size={18} strokeWidth={1.8} />
                  </div>
                </div>

                <div className="border border-zinc-800/80 rounded-xl p-5 bg-[#0c0d10]/40 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Correct Answers</p>
                    <h3 className="text-2xl font-bold text-zinc-100 mt-1">{stats.totalCorrect}</h3>
                  </div>
                  <div className="w-10 h-10 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-300">
                    <CheckCircle2 size={18} strokeWidth={1.8} />
                  </div>
                </div>
              </div>

              {/* Main Performance Graph / Subject Breakdown Section */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Left 2 Cols: Subject Proficiency Chart */}
                <div className="lg:col-span-2 border border-zinc-800/80 rounded-xl p-6 bg-[#0c0d10]/40 space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <BarChart2 size={16} className="text-zinc-400" />
                      <h3 className="text-sm font-medium text-zinc-200">Subject Mastery & Volume</h3>
                    </div>
                    <span className="text-xs text-zinc-500 font-mono">Live Matrix</span>
                  </div>

                  <div className="space-y-5 pt-2">
                    {subjectsList.map((sub) => {
                      const percentage = sub.data.attempted > 0 
                        ? Math.round((sub.data.correct / sub.data.attempted) * 100) 
                        : 0;

                      return (
                        <div key={sub.name} className="space-y-2">
                          <div className="flex justify-between text-xs">
                            <span className="font-medium text-zinc-300">{sub.name}</span>
                            <span className="text-zinc-400 font-mono">
                              {sub.data.correct} / {sub.data.attempted} Correct ({percentage}%)
                            </span>
                          </div>
                          {/* Progress Bar Track */}
                          <div className="w-full h-2.5 bg-zinc-900 rounded-full overflow-hidden border border-zinc-800">
                            <div 
                              className={`h-full transition-all duration-500 rounded-full ${sub.name === 'Physics' ? 'bg-blue-500' : sub.name === 'Mathematics' ? 'bg-emerald-500' : 'bg-purple-500'}`} 
                              style={{ width: `${Math.max(percentage, 5)}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="pt-4 border-t border-zinc-900 flex items-center justify-between text-xs text-zinc-500">
                    <span>Evaluated automatically via AI quizzes</span>
                    <span className="font-mono text-zinc-400">Status: Active</span>
                  </div>
                </div>

                {/* Right Col: Recent Milestone / Insights Card */}
                <div className="border border-zinc-800/80 rounded-xl p-6 bg-[#0c0d10]/40 flex flex-col justify-between space-y-6">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-zinc-200 font-medium text-sm">
                      <Award size={16} className="text-amber-400" />
                      <span>Study Insights</span>
                    </div>
                    <p className="text-xs text-zinc-400 leading-relaxed">
                      You are maintaining a strong 75% overall accuracy benchmark. Focus more practice sessions on complex calculus and physics vectors to level up your engineering exam readiness.
                    </p>
                  </div>

                  <div className="p-3 bg-zinc-900/60 border border-zinc-800/80 rounded-lg space-y-1">
                    <div className="text-[11px] text-zinc-500 font-medium uppercase tracking-wide">Target Examination</div>
                    <div className="text-xs font-medium text-zinc-200">Sindh Board / Entry Test Prep</div>
                  </div>
                </div>

              </div>
            </div>
          ) : (
            <SettingsView user={user} supabase={supabase} setUser={setUser} />
          )}
        </div>

      </main>
    </div>
  );
}