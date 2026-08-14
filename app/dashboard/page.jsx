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
  Atom,
  Calculator,
  FlaskConical,
  Compass
} from 'lucide-react';
import SettingsView from './settingView/SettingsView';
import SubjectsView from './subjects/page';
// Import additional views if you have them, or render placeholders
// import PracticeView from './practice/page';
// import ProgressView from './progress/page';

export default function DashboardPage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('Dashboard');

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
            <div className="space-y-6">
              <div>
                <h1 className="text-xl md:text-2xl font-semibold tracking-tight text-zinc-100 mb-1">Progress</h1>
                <p className="text-sm text-zinc-400">Track your overall academic growth and stats.</p>
              </div>
              <div className="border border-zinc-800/80 rounded-xl p-12 text-center bg-[#0c0d10]/40">
                <p className="text-xs text-zinc-500">Progress metrics coming soon.</p>
              </div>
            </div>
          ) : (
            <SettingsView user={user} supabase={supabase} setUser={setUser} />
          )}
        </div>

      </main>
    </div>
  )}