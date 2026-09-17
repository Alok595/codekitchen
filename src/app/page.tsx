"use client";

import { useState, useEffect } from "react";
import { 
  LayoutDashboard, 
  Briefcase, 
  Mail, 
  BellRing, 
  Database,
  Search,
  Plus,
  TrendingUp,
  Sparkles,
  Award,
  Clock,
  ShieldCheck,
  ChevronRight,
  Newspaper,
  PanelLeftClose,
  PanelLeftOpen,
  ChevronLeft
} from "lucide-react";
import { KanbanBoard } from "@/components/KanbanBoard";
import { DraftStudio } from "@/components/DraftStudio";
import { NudgesHub } from "@/components/NudgesHub";
import { IngestPanel } from "@/components/IngestPanel";
import { AddApplicationModal } from "@/components/AddApplicationModal";
import Link from "next/link";
import AuthStatusModal from "@/components/AuthStatusModal";
import { useSession, signIn, signOut } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";

export default function Dashboard() {
  const { data: session, status: authStatus } = useSession();
  const [activeTab, setActiveTab] = useState("kanban");
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [jobs, setJobs] = useState<any[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [preselectedDraftJobId, setPreselectedDraftJobId] = useState<number | null>(null);
  const [preselectedDraftType, setPreselectedDraftType] = useState<string>('cover_letter');

  useEffect(() => {
    if (authStatus === 'loading') return;

    if (authStatus === 'authenticated') {
      fetch("/api/applications/get-applications")
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setJobs(data.jobs || []);
          }
        })
        .catch(console.error);
    } else {
      setJobs([]);
    }
  }, [refreshKey, authStatus, session]);

  const triggerRefresh = () => setRefreshKey(prev => prev + 1);

  const handleNavigateToDraft = (jobId: number, type: string = 'cover_letter') => {
    setPreselectedDraftJobId(jobId);
    setPreselectedDraftType(type);
    setActiveTab('drafts');
  };

  const totalJobs = jobs.length;
  const inInterviews = jobs.filter(j => j.status === 'Interview').length;
  const offersCount = jobs.filter(j => j.status === 'Offer').length;
  const totalDrafts = jobs.reduce((acc, curr) => acc + (curr.drafts?.length || 0), 0);

  const filteredJobs = jobs.filter(job => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      (job.role && job.role.toLowerCase().includes(q)) ||
      (job.company && job.company.toLowerCase().includes(q)) ||
      (job.description && job.description.toLowerCase().includes(q)) ||
      (job.type && job.type.toLowerCase().includes(q))
    );
  });

  const NavItem = ({ id, icon: Icon, label, count, indicator, isSubText = false }: any) => {
    const isActive = activeTab === id;
    return (
      <button 
        onClick={() => setActiveTab(id)}
        title={isSidebarCollapsed ? `${label} ${count !== undefined ? `(${count})` : ''}` : undefined}
        className={`w-full group relative flex items-center ${isSidebarCollapsed ? 'justify-center px-2 py-3.5' : 'justify-between px-4 py-3'} rounded-none transition-all duration-200 font-medium text-sm ${
          isActive 
            ? 'bg-[#1a1a1a] text-[#fbf9f4] shadow-sm' 
            : 'hover:bg-[#e9e3d4] text-[#4a4a4a] hover:text-[#1a1a1a]'
        }`}
      >
        <div className={`flex items-center ${isSidebarCollapsed ? 'justify-center' : 'gap-3'}`}>
          <Icon className={`w-5 h-5 flex-shrink-0 transition-colors ${isActive ? 'text-[#e6dfcc]' : 'text-[#6b6255] group-hover:text-[#1a1a1a]'}`} />
          {!isSidebarCollapsed && (
            <span className="font-serif tracking-wide truncate">{label}</span>
          )}
        </div>
        
        {isActive && (
          <div 
            className="absolute left-0 top-0 bottom-0 w-1 bg-[#8b4513]"
          />
        )}

        {!isSidebarCollapsed && count !== undefined && (
          <span className={`text-xs font-typewriter px-2 py-0.5 rounded-none border transition-colors ${
            isActive ? 'bg-[#333333] border-[#555555] text-[#f4f0e6]' : 'bg-[#e5ded0] border-[#d2c9b8] text-[#554e42] group-hover:bg-[#dad2c2]'
          }`}>
            {count}
          </span>
        )}

        {isSidebarCollapsed && count !== undefined && (
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#8b4513] rounded-full" />
        )}
        
        {!isSidebarCollapsed && indicator && indicator}
        {!isSidebarCollapsed && isSubText && (
          <span className="text-[10px] uppercase font-bold text-[#8b4513] font-typewriter tracking-wider">
            10+ Scale
          </span>
        )}
      </button>
    );
  };

  return (
    <div className="min-h-screen bg-[#f5f2eb] text-[#1a1a1a] flex flex-col">
      
      {/* Full-Width Top Navbar */}
      <header className="fixed top-0 left-0 right-0 w-full h-20 bg-[#fbf9f4] border-b border-[#e0d8c7] z-40 px-6 lg:px-8 flex items-center justify-between shadow-sm">
        
        {/* Left: Brand Logo & Title & Toggle */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <div 
              onClick={() => setIsSidebarCollapsed(prev => !prev)}
              className="w-10 h-10 rounded-none border border-[#1a1a1a] shadow-xs cursor-pointer hover:opacity-90 transition-opacity overflow-hidden flex-shrink-0 bg-[#fbf9f4]"
              title={isSidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
            >
              <img 
                src="/logo.png" 
                alt="Pragati Logo" 
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h1 className="text-xl font-bold text-[#1a1a1a] tracking-tight font-serif leading-none">
                <span>Pragati</span>
              </h1>
              <p className="text-[9px] uppercase text-[#7a7060] font-typewriter tracking-widest font-semibold mt-1">
                Career Operations Desk
              </p>
            </div>
          </div>

          <div className="h-6 w-[1px] bg-[#e2dac9] hidden sm:block" />

          {/* Quick Search */}
          <div className="hidden sm:flex items-center gap-4 w-[280px] md:w-[360px] lg:w-[420px] relative group">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <Search className="w-4 h-4 text-[#8a8070] group-focus-within:text-[#1a1a1a] transition-colors" />
            </div>
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search roles, companies, or keywords..." 
              className="w-full bg-[#eee8db] border border-[#ded5c2] rounded-none pl-10 pr-4 py-2 text-xs font-serif focus:outline-none focus:border-[#1a1a1a] focus:bg-[#ffffff] transition-all text-[#1a1a1a] placeholder:text-[#8a8070] shadow-inner"
            />
          </div>
        </div>

        {/* Right: Status Pill & Google Auth & CTA */}
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="hidden lg:flex items-center gap-2 bg-[#eee8db] px-3 py-1.5 rounded-none border border-[#ded5c2] text-[11px] font-typewriter text-[#554e42] font-semibold">
            <span className="flex h-1.5 w-1.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full bg-emerald-600 opacity-75"></span>
              <span className="relative inline-flex h-1.5 w-1.5 bg-emerald-700"></span>
            </span>
            Engine Active • Connected
          </div>
          
          {/* Google Authentication Button / Profile Pill */}
          {authStatus === 'authenticated' && session?.user ? (
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="flex items-center gap-2.5 bg-[#ffffff] hover:bg-[#f5efe2] px-3 py-1.5 border border-[#ded5c2] text-xs font-serif transition-colors rounded-none shadow-xs"
              title="Manage Account / Sign Out"
            >
              {session.user.image ? (
                <img 
                  src={session.user.image} 
                  alt={session.user.name || 'User'} 
                  className="w-5 h-5 rounded-none border border-[#1a1a1a] object-cover"
                />
              ) : (
                <div className="w-5 h-5 bg-[#1a1a1a] text-[#fbf9f4] text-[10px] flex items-center justify-center font-bold">
                  {session.user.name ? session.user.name.charAt(0) : 'U'}
                </div>
              )}
              <span className="font-bold text-[#1a1a1a] max-w-[100px] truncate">{session.user.name?.split(' ')[0]}</span>
            </button>
          ) : (
            <Link
              href="/auth/signin"
              className="flex items-center gap-2 bg-[#ffffff] hover:bg-[#f5efe2] px-3.5 py-1.5 border border-[#ded5c2] text-xs font-serif font-bold text-[#1a1a1a] transition-colors rounded-none shadow-xs cursor-pointer"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                <path fill="#EA4335" d="M12 5c1.6 0 3 .6 4.1 1.7l3.1-3.1C17.3 1.8 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.4 9 5 12 5z"/>
                <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.7-.2-2.3H12v4.6h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.9z"/>
                <path fill="#FBBC05" d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3 0-.8.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 12 0 14.5s.7 4.8 1.9 7.2l3.7-2.9z"/>
                <path fill="#34A853" d="M12 23.5c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.4-6.4-5.2L1.9 16.5C3.7 20.2 7.5 23.5 12 23.5z"/>
              </svg>
              Sign In
            </Link>
          )}

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2 bg-[#1a1a1a] hover:bg-[#333333] text-[#fbf9f4] rounded-none text-xs font-semibold transition-all flex items-center gap-1.5 shadow-sm font-serif border border-[#1a1a1a]"
          >
            <Plus className="w-4 h-4" /> Log Application
          </button>
        </div>
      </header>

      {/* Main Body: Fixed Sidebar beneath Navbar + Content Area */}
      <div className="flex flex-1 pt-20">
        
        {/* Collapsible Fixed Sidebar Beneath Top Navbar */}
        <aside className={`fixed left-0 top-20 bottom-0 ${isSidebarCollapsed ? 'w-[76px]' : 'w-[280px]'} h-[calc(100vh-80px)] border-r border-[#e0d8c7] bg-[#fbf9f4] flex flex-col z-30 shadow-sm overflow-hidden transition-all duration-300`}>
          
          <div className="p-3 border-b border-[#eee8d9] flex items-center justify-between text-xs font-typewriter text-[#7a7060]">
            {!isSidebarCollapsed ? (
              <>
                <span className="font-bold uppercase tracking-wider text-[10px]">Navigation Desk</span>
                <button 
                  onClick={() => setIsSidebarCollapsed(true)}
                  className="p-1 text-[#8a8070] hover:text-[#1a1a1a] hover:bg-[#eee8db] transition-colors rounded-none"
                  title="Collapse Sidebar"
                >
                  <PanelLeftClose className="w-4 h-4" />
                </button>
              </>
            ) : (
              <button 
                onClick={() => setIsSidebarCollapsed(false)}
                className="w-full py-1 text-[#8a8070] hover:text-[#1a1a1a] flex justify-center transition-colors rounded-none"
                title="Expand Sidebar"
              >
                <PanelLeftOpen className="w-4 h-4" />
              </button>
            )}
          </div>

          <nav className="flex-1 px-3 space-y-1.5 mt-3 overflow-y-auto custom-scrollbar">
            <NavItem id="kanban" icon={Briefcase} label="Pipeline Board" count={totalJobs} />
            <NavItem id="drafts" icon={Mail} label="Draft Studio" count={totalDrafts} />
            <NavItem 
              id="nudges" 
              icon={BellRing} 
              label="Scheduled Follow-ups" 
              indicator={<span className="relative flex h-2 w-2 mr-1"><span className="animate-ping absolute inline-flex h-full w-full bg-amber-600 opacity-75"></span><span className="relative inline-flex h-2 w-2 bg-amber-700"></span></span>} 
            />
            <div className="my-3 border-t border-[#e2dac9] mx-2" />
            <NavItem id="ingest" icon={Database} label="Ingest Dataset" isSubText={true} />
          </nav>

          {/* Sidebar Footer / User Profile */}
          <div className="p-3 border-t border-[#eee8d9] flex-shrink-0 flex flex-col gap-2">
            {/* User Card */}
            <div 
              onClick={() => setIsAuthModalOpen(true)}
              className={`p-3 rounded-none bg-[#eee8dc] border border-[#ded5c2] relative overflow-hidden group hover:bg-[#e6decb] transition-colors cursor-pointer shadow-xs ${isSidebarCollapsed ? 'flex justify-center' : ''}`}
              title="Google Account & Authentication Settings"
            >
              <div className="flex items-center gap-3 relative z-10">
                {authStatus === 'authenticated' && session?.user?.image ? (
                  <img 
                    src={session.user.image} 
                    alt={session.user.name || 'User'} 
                    className="w-8 h-8 rounded-none border border-[#1a1a1a] object-cover shadow-sm flex-shrink-0"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-none bg-[#1a1a1a] text-[#fbf9f4] flex items-center justify-center font-bold text-xs shadow-sm flex-shrink-0 font-serif">
                    {authStatus === 'authenticated' && session?.user?.name 
                      ? session.user.name.charAt(0) 
                      : <ShieldCheck className="w-4 h-4 text-[#d8cbb5]" />
                    }
                  </div>
                )}
                {!isSidebarCollapsed && (
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-semibold text-[#1a1a1a] truncate font-serif">
                      {authStatus === 'authenticated' && session?.user?.name 
                        ? session.user.name 
                        : 'Aarav Sharma'
                      }
                    </div>
                    <div className="text-[9px] text-[#2d6a4f] flex items-center gap-1 font-typewriter font-bold">
                      <span className="w-1.5 h-1.5 bg-[#2d6a4f]" /> 
                      {authStatus === 'authenticated' ? 'Google Account' : 'Active Candidate'}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <button 
              onClick={() => setIsSidebarCollapsed(prev => !prev)}
              className={`w-full py-2 px-3 text-xs text-[#6b6255] hover:text-[#1a1a1a] hover:bg-[#e9e3d4] border border-[#ded5c2] rounded-none flex items-center ${isSidebarCollapsed ? 'justify-center' : 'justify-between'} transition-colors font-typewriter`}
              title={isSidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
            >
              {isSidebarCollapsed ? (
                <PanelLeftOpen className="w-4 h-4 text-[#1a1a1a]" />
              ) : (
                <>
                  <span className="text-[11px] font-semibold">Collapse View</span>
                  <PanelLeftClose className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className={`${isSidebarCollapsed ? 'ml-[76px]' : 'ml-[280px]'} flex-1 min-w-0 min-h-[calc(100vh-80px)] bg-[#f5f2eb] flex flex-col relative transition-all duration-300`}>

          {/* Metrics Strip */}
          <div className="px-8 lg:px-10 py-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 z-10 border-b border-[#e0d8c7] bg-[#faf7f0] flex-shrink-0">
            {[
              { label: "Active Pipeline", value: totalJobs, icon: Briefcase, color: "text-[#1a1a1a]", bg: "bg-[#e8e1d2]" },
              { label: "In Interviews", value: inInterviews, icon: Clock, color: "text-[#8b4513]", bg: "bg-[#f2e6d6]" },
              { label: "Offers Secured", value: offersCount, icon: Award, color: "text-[#1b4332]", bg: "bg-[#dff0e6]" },
              { label: "Outreach Drafts", value: totalDrafts, icon: Sparkles, color: "text-[#4a3b68]", bg: "bg-[#ede6f5]" }
            ].map((metric, idx) => (
              <div key={idx} className="flex items-center gap-4 bg-[#ffffff] border border-[#ded7c4] rounded-none p-4 shadow-sm hover:border-[#1a1a1a]/40 transition-colors">
                <div className={`p-2.5 rounded-none ${metric.bg} border border-[#ded5c2]`}>
                  <metric.icon className={`w-5 h-5 ${metric.color}`} />
                </div>
                <div>
                  <p className="text-[11px] text-[#7a7060] font-semibold uppercase tracking-wider font-typewriter">{metric.label}</p>
                  <p className="text-xl font-bold text-[#1a1a1a] font-serif">{metric.value}</p>
                </div>
              </div>
            ))}
          </div>
        
        {/* Main Content Workspace */}
        <div className="flex-1 p-8 lg:p-10 pb-16">
          <div className="max-w-[1600px] mx-auto">
            {authStatus === 'unauthenticated' ? (
              <div className="bg-[#fbf9f4] border border-[#ded7c4] p-10 lg:p-14 text-center max-w-2xl mx-auto shadow-md rounded-none my-8">
                <div className="w-14 h-14 bg-[#1a1a1a] text-[#fbf9f4] flex items-center justify-center mx-auto mb-4 shadow-sm">
                  <ShieldCheck className="w-7 h-7 text-[#d8cbb5]" />
                </div>
                <span className="text-[10px] font-typewriter uppercase tracking-widest text-[#8b4513] font-bold block mb-1">
                  Private Candidate Workspace
                </span>
                <h2 className="text-2xl lg:text-3xl font-bold text-[#1a1a1a] font-serif">
                  Sign In to Access Your Pipeline
                </h2>
                <p className="text-sm text-[#6b6255] font-serif mt-2 max-w-md mx-auto leading-relaxed">
                  Job applications, communication drafts, and automated follow-ups are securely isolated per candidate account.
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-8">
                  <Link
                    href="/auth/signin"
                    className="w-full sm:w-auto px-7 py-3 bg-[#1a1a1a] hover:bg-[#333333] text-[#fbf9f4] border border-[#1a1a1a] text-xs font-serif font-bold transition-all shadow-sm rounded-none"
                  >
                    Sign In with Google or Email
                  </Link>
                  <Link
                    href="/auth/signin"
                    className="w-full sm:w-auto px-7 py-3 bg-[#ffffff] hover:bg-[#eee8db] text-[#1a1a1a] border border-[#ded5c2] text-xs font-serif font-bold transition-all shadow-sm rounded-none"
                  >
                    Create New Account
                  </Link>
                </div>
              </div>
            ) : (
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                >
                  {activeTab === 'kanban' && (
                    <KanbanBoard 
                      jobs={filteredJobs} 
                      onUpdate={triggerRefresh} 
                      onOpenAddModal={() => setIsAddModalOpen(true)}
                      onSelectJobForDraft={handleNavigateToDraft}
                    />
                  )}
                  {activeTab === 'drafts' && (
                    <DraftStudio 
                      jobs={filteredJobs} 
                      onUpdate={triggerRefresh}
                      preselectedJobId={preselectedDraftJobId}
                      preselectedType={preselectedDraftType}
                    />
                  )}
                  {activeTab === 'nudges' && (
                    <NudgesHub 
                      jobs={filteredJobs} 
                      onNavigateToDraft={handleNavigateToDraft}
                    />
                  )}
                  {activeTab === 'ingest' && (
                    <IngestPanel onIngestComplete={triggerRefresh} />
                  )}
                </motion.div>
              </AnimatePresence>
            )}
          </div>
        </div>
      </main>
      </div>

      {/* Add Application Modal */}
      <AddApplicationModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={triggerRefresh}
      />

      {/* Auth & Google Cloud Security Modal */}
      <AuthStatusModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </div>
  );
}


