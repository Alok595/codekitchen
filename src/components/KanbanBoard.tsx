import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Building, ChevronRight, Plus, Sparkles, Mail, Clock, CheckCircle } from 'lucide-react';
import confetti from 'canvas-confetti';
import { CompanyLogo } from '@/components/CompanyLogo';

const COLUMNS = [
  { id: 'Applied', label: 'Applied', color: 'bg-[#1a1a1a]', border: 'border-[#1a1a1a]/20', text: 'text-[#1a1a1a]', dot: 'bg-[#1a1a1a]' },
  { id: 'Interview', label: 'Interview', color: 'bg-[#8b4513]', border: 'border-[#8b4513]/20', text: 'text-[#8b4513]', dot: 'bg-[#8b4513]' },
  { id: 'Offer', label: 'Offer', color: 'bg-[#1b4332]', border: 'border-[#1b4332]/20', text: 'text-[#1b4332]', dot: 'bg-[#1b4332]' },
  { id: 'Reject', label: 'Reject', color: 'bg-[#8b0000]', border: 'border-[#8b0000]/20', text: 'text-[#8b0000]', dot: 'bg-[#8b0000]' }
];

export function KanbanBoard({ 
  jobs, 
  onUpdate, 
  onOpenAddModal,
  onSelectJobForDraft 
}: { 
  jobs: any[], 
  onUpdate: () => void,
  onOpenAddModal?: () => void,
  onSelectJobForDraft?: (jobId: number, type: string) => void
}) {
  const [dragging, setDragging] = useState<number | null>(null);

  const handleDragStart = (id: number) => {
    setDragging(id);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (status: string) => {
    if (!dragging) return;
    
    const targetJob = jobs.find(j => j.id === dragging);
    if (targetJob && targetJob.status === status) {
      setDragging(null);
      return;
    }

    try {
      await fetch('/api/applications/update-status', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: dragging, status }),
      });

      if (status === 'Offer') {
        confetti({
          particleCount: 150,
          spread: 90,
          origin: { y: 0.5 },
          colors: ['#1b4332', '#8b4513', '#1a1a1a']
        });
      }
      
      onUpdate();
    } catch (e) {
      console.error(e);
    } finally {
      setDragging(null);
    }
  };

  return (
    <div className="flex flex-col">
      <div className="mb-8 flex justify-between items-center flex-shrink-0">
        <div>
          <h2 className="text-2xl font-bold text-[#1a1a1a] tracking-tight flex items-center gap-3 font-serif">
            Pipeline Board
            <span className="text-[10px] uppercase bg-[#e5dfd0] text-[#554e42] px-2.5 py-0.5 rounded-full font-typewriter font-semibold border border-[#d2c9b8]">
              Live Tracker
            </span>
          </h2>
          <p className="text-[#6b6255] mt-1.5 text-sm max-w-lg font-serif">
            Drag and drop applications across lifecycle phases. State transitions are persistently recorded.
          </p>
        </div>

        <button
          onClick={onOpenAddModal}
          className="px-5 py-2.5 bg-[#1a1a1a] hover:bg-[#333333] text-[#fbf9f4] rounded-none text-sm font-semibold transition-all flex items-center gap-2 shadow-sm font-serif border border-[#1a1a1a]"
        >
          <Plus className="w-4 h-4" /> Log Application
        </button>
      </div>
      
      <div className="flex gap-6 overflow-x-auto pb-6 custom-scrollbar -mx-2 px-2 items-start">
        {COLUMNS.map(col => {
          const colJobs = jobs.filter(j => (j.status || 'Applied') === col.id);

          return (
            <div 
              key={col.id} 
              className={`flex-shrink-0 w-[340px] bg-[#fbf9f4] rounded-none border border-[#d2c9b8] p-5 flex flex-col shadow-sm relative overflow-hidden transition-colors min-h-[580px] max-h-[calc(100vh-220px)] ${dragging ? 'bg-[#f0e9db] border-[#8b4513]' : ''}`}
              onDragOver={handleDragOver}
              onDrop={() => handleDrop(col.id)}
            >
              <div className={`absolute top-0 left-0 right-0 h-1 ${col.color}`} />
              
              <div className="flex items-center justify-between mb-5 pb-3 border-b border-[#e5decb] flex-shrink-0">
                <div className="flex items-center gap-2.5">
                  <span className={`w-2 h-2 ${col.dot}`} />
                  <h3 className="font-bold text-[#1a1a1a] text-sm tracking-wide font-serif">{col.label}</h3>
                </div>
                <span className="bg-[#eee7d8] text-[#554e42] text-xs px-2.5 py-0.5 rounded-none font-typewriter border border-[#ded5c0]">
                  {colJobs.length}
                </span>
              </div>
              
              <div className="flex-1 overflow-y-auto space-y-3.5 pr-1.5 custom-scrollbar pb-10">
                <AnimatePresence>
                  {colJobs.map(job => (
                    <motion.div
                      layoutId={`job-${job.id}`}
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.98 }}
                      transition={{ duration: 0.15 }}
                      key={job.id}
                      draggable
                      onDragStart={() => handleDragStart(job.id)}
                      className={`bg-[#ffffff] border ${dragging === job.id ? 'border-[#8b4513] shadow-md' : 'border-[#d8d0be] hover:border-[#1a1a1a]'} p-4.5 rounded-none cursor-grab active:cursor-grabbing transition-all group shadow-sm hover:shadow relative`}
                    >
                      <div className="flex justify-between items-start mb-3">
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-none bg-[#f2ecdd] text-[#554e42] border border-[#ded5c0] uppercase tracking-wider font-typewriter">
                          {job.type}
                        </span>
                        {job.statusHistory && job.statusHistory.length > 1 && (
                          <span className="text-[10px] text-[#7a7060] flex items-center gap-1.5 font-typewriter">
                            <Clock className="w-3 h-3 text-[#9a9080]" /> {job.statusHistory.length} states
                          </span>
                        )}
                      </div>
                      
                      <h4 className="font-bold text-[#1a1a1a] text-[15px] mb-1.5 leading-snug group-hover:text-[#8b4513] transition-colors font-serif">
                        {job.role || job.description.split(',')[0]}
                      </h4>
                      
                      <div className="flex items-center gap-2 text-xs text-[#6b6255] mb-3.5 font-serif">
                        <CompanyLogo company={job.company} size="sm" />
                        <span className="font-medium text-[#3a352d]">{job.company || 'Enterprise Partner'}</span>
                      </div>

                      <p className="text-[12px] text-[#554e42] line-clamp-2 mb-4 leading-relaxed font-serif">
                        {job.description}
                      </p>
                      
                      <div className="flex items-center justify-between text-xs text-[#6b6255] border-t border-[#eee8d9] pt-3 mt-1">
                        <div className="flex items-center gap-1.5 font-typewriter text-[10px] bg-[#f5efe2] px-2 py-0.5 rounded-none border border-[#e2dac9]">
                          <Calendar className="w-3 h-3 text-[#8a8070]" />
                          {new Date(job.from).toLocaleDateString()}
                        </div>
                        
                        <div className="flex items-center gap-2">
                          {onSelectJobForDraft && (
                            <button
                              onClick={() => onSelectJobForDraft(job.id, 'cover_letter')}
                              className="p-1.5 rounded-none bg-[#eee7d8] hover:bg-[#e0d6c2] text-[#1a1a1a] border border-[#d2c9b8] transition-all opacity-0 group-hover:opacity-100"
                              title="Open in Draft Studio"
                            >
                              <Sparkles className="w-3.5 h-3.5" />
                            </button>
                          )}
                          {job.drafts?.length > 0 && (
                            <span className="text-[10px] bg-[#e8e1d2] text-[#333333] px-2 py-0.5 rounded-none border border-[#d8d0be] font-typewriter flex items-center gap-1">
                              <Mail className="w-3 h-3" />
                              {job.drafts.length}
                            </span>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}


