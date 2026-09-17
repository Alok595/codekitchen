import { useState, useEffect } from 'react';
import { BellRing, FastForward, CheckCircle2, Clock, Mail, AlertTriangle, ArrowRight, Sparkles, Calendar } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { CompanyLogo } from '@/components/CompanyLogo';

export function NudgesHub({ 
  jobs,
  onNavigateToDraft 
}: { 
  jobs: any[];
  onNavigateToDraft?: (jobId: number, type: string) => void;
}) {
  const [nudges, setNudges] = useState<any[]>([]);
  const [simulatedDate, setSimulatedDate] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const fetchNudges = async (dateStr?: string) => {
    setLoading(true);
    try {
      const url = dateStr ? `/api/nudges/get-nudges?date=${dateStr}` : '/api/nudges/get-nudges';
      const res = await fetch(url);
      const data = await res.json();
      if (data.success) {
        setNudges(data.nudges);
        setSimulatedDate(new Date(data.simulatedDate).toLocaleDateString());
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNudges();
  }, []);

  const fastForward = (days: number) => {
    const newDate = new Date();
    newDate.setDate(newDate.getDate() + days);
    fetchNudges(newDate.toISOString());
  };

  const handleActionClick = (nudge: any) => {
    if (onNavigateToDraft) {
      const draftType = nudge.action === 'generate_thank_you' ? 'follow_up_email' : 'follow_up_email';
      onNavigateToDraft(nudge.jobId, draftType);
    }
  };

  return (
    <div className="h-full max-w-[1000px] mx-auto flex flex-col gap-8">
      
      {/* Top Banner & Time Simulator */}
      <div className="bg-[#ffffff] border border-[#ded7c4] rounded-none p-8 shadow-sm relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <h2 className="text-3xl font-bold text-[#1a1a1a] flex items-center gap-4 tracking-tight font-serif">
              <div className="p-3 bg-[#f8ede2] text-[#8b4513] rounded-none border border-[#e5cbba] shadow-sm">
                <BellRing className="w-6 h-6" />
              </div>
              Automated Scheduled Nudges
            </h2>
            <p className="text-[#6b6255] text-sm mt-3 max-w-lg leading-relaxed font-serif">
              Proactively triggers outreach reminders based on application aging and pipeline transitions.
            </p>
          </div>
          
          <div className="bg-[#fbf9f4] border border-[#ded7c4] p-5 rounded-none shadow-inner min-w-[300px]">
             <div className="text-[10px] text-[#7a7060] uppercase tracking-widest font-bold mb-4 flex items-center justify-between font-typewriter">
               <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-[#8b4513]" /> Time Simulator</span>
               <span className="text-[#8b4513] bg-[#f8ede2] px-2 py-0.5 rounded-none border border-[#e5cbba] font-typewriter font-bold">{simulatedDate || 'Today'}</span>
             </div>
             <div className="flex items-center gap-2">
                <button 
                  onClick={() => fetchNudges()} 
                  className="px-3 py-1.5 text-xs bg-[#eee7d8] hover:bg-[#e2d8c3] rounded-none text-[#333333] font-semibold transition-all border border-[#ded5c0] font-serif"
                >
                  Reset
                </button>
                <div className="h-4 w-px bg-[#ded7c4] mx-0.5" />
                <button 
                  onClick={() => fastForward(7)} 
                  className="flex-1 py-1.5 text-[11px] font-bold bg-[#eee7d8] hover:bg-[#e0d6c0] text-[#1a1a1a] border border-[#ded5c0] rounded-none flex items-center justify-center gap-1 transition-all uppercase tracking-wide font-typewriter shadow-sm"
                >
                  +7D
                </button>
                <button 
                  onClick={() => fastForward(14)} 
                  className="flex-1 py-1.5 text-[11px] font-bold bg-[#eee7d8] hover:bg-[#e0d6c0] text-[#8b4513] border border-[#ded5c0] rounded-none flex items-center justify-center gap-1 transition-all uppercase tracking-wide font-typewriter shadow-sm"
                >
                  +14D
                </button>
                <button 
                  onClick={() => fastForward(30)} 
                  className="flex-1 py-1.5 text-[11px] font-bold bg-[#eee7d8] hover:bg-[#e0d6c0] text-[#1b4332] border border-[#ded5c0] rounded-none flex items-center justify-center gap-1 transition-all uppercase tracking-wide font-typewriter shadow-sm"
                >
                  +30D
                </button>
             </div>
          </div>
        </div>
      </div>

      {/* Nudge Items Viewport */}
      <div className="flex-1 pb-10">
        {loading ? (
           <div className="flex flex-col items-center justify-center h-[260px] text-[#7a7060]">
             <div className="w-8 h-8 border-2 border-[#1a1a1a]/20 border-t-[#1a1a1a] animate-spin mb-4" />
             <p className="text-sm font-medium animate-pulse font-serif">Scanning pipeline for scheduled follow-ups...</p>
           </div>
        ) : nudges.length === 0 ? (
           <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-[#ffffff] border border-[#ded7c4] border-dashed rounded-none h-[340px] flex flex-col items-center justify-center text-center p-8 relative overflow-hidden">
             <div className="w-16 h-16 bg-[#dff0e6] rounded-none flex items-center justify-center mb-5 border border-[#b8dec9] shadow-sm relative z-10">
               <CheckCircle2 className="w-8 h-8 text-[#1b4332]" />
             </div>
             <h3 className="text-2xl font-bold text-[#1a1a1a] mb-2 relative z-10 font-serif">Pipeline Up To Date!</h3>
             <p className="text-sm text-[#6b6255] max-w-md mb-6 relative z-10 font-serif">No pending nudges or follow-up actions required under the current timeline.</p>
             <div className="inline-flex items-center gap-2 text-xs text-[#554e42] bg-[#fbf9f4] px-4 py-2 rounded-none border border-[#ded7c4] relative z-10 font-typewriter">
               <FastForward className="w-4 h-4 text-[#8b4513]" />
               Click <strong className="text-[#8b4513]">+7D</strong> or <strong className="text-[#1b4332]">+14D</strong> above to simulate time travel
             </div>
           </motion.div>
        ) : (
          <div className="space-y-4">
            <AnimatePresence>
              {nudges.map((nudge, idx) => (
                <motion.div 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ delay: idx * 0.04 }}
                  key={idx} 
                  className="bg-[#ffffff] border border-[#ded7c4] hover:border-[#1a1a1a]/50 rounded-none p-6 flex items-start gap-5 transition-all shadow-sm hover:shadow relative group"
                >
                  <div className={`absolute top-0 bottom-0 left-0 w-1 ${nudge.rule.includes('stale') ? 'bg-[#8b4513]' : 'bg-[#1a1a1a]'}`} />
                  
                  <div className={`p-3.5 rounded-none flex-shrink-0 ${
                    nudge.rule.includes('stale') 
                      ? 'bg-[#f8ede2] text-[#8b4513] border border-[#e5cbba]' 
                      : 'bg-[#eee7d8] text-[#1a1a1a] border border-[#ded5c0]'
                  }`}>
                    {nudge.rule.includes('stale') ? <AlertTriangle className="w-5 h-5" /> : <Mail className="w-5 h-5" />}
                  </div>
                  
                  <div className="flex-1 pt-0.5">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-bold text-[#1a1a1a] text-lg tracking-tight font-serif">{nudge.jobTitle}</h3>
                      <div className="flex items-center gap-1.5 bg-[#fbf9f4] px-2.5 py-1 rounded-none border border-[#ded7c4]">
                        <CompanyLogo company={nudge.company} size="xs" />
                        <span className="text-[11px] uppercase tracking-wider text-[#333333] font-bold font-typewriter">
                          {nudge.company}
                        </span>
                      </div>
                    </div>
                    <p className="text-[#554e42] text-sm mb-4 leading-relaxed font-serif">{nudge.message}</p>
                    
                    <div className="flex items-center gap-3">
                      <button 
                        onClick={() => handleActionClick(nudge)}
                        className="px-5 py-2 bg-[#1a1a1a] hover:bg-[#333333] text-[#fbf9f4] rounded-none text-xs font-bold transition-all flex items-center gap-2 shadow-sm font-serif border border-[#1a1a1a]"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        {nudge.action === 'generate_follow_up' ? 'Generate Follow-Up' : 'Generate Outreach'}
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                      <button 
                        onClick={() => setNudges(prev => prev.filter((_, i) => i !== idx))}
                        className="px-4 py-2 bg-[#fbf9f4] hover:bg-[#eee7d8] text-[#6b6255] hover:text-[#1a1a1a] rounded-none text-xs font-semibold transition-all border border-[#ded7c4] font-serif"
                      >
                        Dismiss
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

    </div>
  );
}


