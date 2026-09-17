"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, 
  Save, 
  Copy, 
  Loader2, 
  MessageSquare, 
  Briefcase, 
  History, 
  Clock, 
  ArrowRight, 
  CheckCircle, 
  FileText, 
  ChevronRight,
  Download,
  Trash2,
  Sliders,
  Check,
  RotateCcw,
  Zap,
  Target
} from 'lucide-react';
import { CompanyLogo } from '@/components/CompanyLogo';

const FOCUS_PRESETS = [
  "Deep Technical & Architecture",
  "High-Impact Leadership",
  "Startup Velocity & Ownership",
  "Data-Driven & Problem Solving",
  "Immediate Contract Availability"
];

export function DraftStudio({ jobs, onUpdate, preselectedJobId, preselectedType }: { 
  jobs: any[], 
  onUpdate: () => void,
  preselectedJobId?: number | null,
  preselectedType?: string
}) {
  const [selectedJob, setSelectedJob] = useState<number | null>(preselectedJobId || (jobs.length > 0 ? jobs[0]?.id : null));
  const [draftType, setDraftType] = useState(preselectedType || 'cover_letter');
  const [tone, setTone] = useState('Professional');
  const [lengthPref, setLengthPref] = useState<'standard' | 'concise' | 'bullets'>('standard');
  const [customFocus, setCustomFocus] = useState('');
  const [generating, setGenerating] = useState(false);
  const [draftResult, setDraftResult] = useState('');
  const [engineInfo, setEngineInfo] = useState('');
  const [copied, setCopied] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const activeJob = jobs.find(j => j.id === (selectedJob ?? (jobs.length > 0 ? jobs[0]?.id : null)));
  const linkedDrafts = activeJob?.drafts || [];

  const wordCount = draftResult.trim() ? draftResult.trim().split(/\s+/).length : 0;
  const charCount = draftResult.length;
  const readTimeMin = Math.max(1, Math.ceil(wordCount / 200));

  const generateDraft = async () => {
    if (!activeJob) return;
    setGenerating(true);
    setEngineInfo('');
    setCopied(false);
    
    try {
      const res = await fetch('/api/drafts/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          jobId: activeJob.id, 
          type: draftType, 
          tone, 
          focus: customFocus,
          length: lengthPref
        })
      });
      const data = await res.json();
      if (data.success) {
        setDraftResult(data.draft.contents);
        if (data.draft.engine) {
          setEngineInfo(data.draft.engine);
        }
        onUpdate();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setGenerating(false);
    }
  };

  const copyToClipboard = () => {
    if (!draftResult) return;
    navigator.clipboard.writeText(draftResult);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadDraft = (format: 'txt' | 'md') => {
    if (!draftResult) return;
    const roleSlug = (activeJob?.role || 'draft').toLowerCase().replace(/[^a-z0-9]/g, '-');
    const filename = `${roleSlug}-${draftType}.${format}`;
    const blob = new Blob([draftResult], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col xl:flex-row gap-6 items-start">
      
      {/* Left Column - Job Selector */}
      <div className="w-full xl:w-[320px] bg-[#fbf9f4] border border-[#ded7c4] rounded-none p-6 flex flex-col gap-4 flex-shrink-0 shadow-sm">
        <div className="pb-3 border-b border-[#e5decb]">
          <h2 className="text-xl font-bold text-[#1a1a1a] tracking-tight flex items-center gap-2 font-serif">
            Draft Studio
            <Sparkles className="w-4 h-4 text-[#8b4513]" />
          </h2>
          <span className="inline-block mt-2 text-[10px] font-typewriter uppercase tracking-widest text-[#1b4332] bg-[#dff0e6] border border-[#b8dec9] px-2 py-0.5 rounded-none font-bold">
            Contextual Writing Engine
          </span>
        </div>
        <div className="max-h-[680px] overflow-y-auto space-y-2.5 pr-1 custom-scrollbar">
          {jobs.map(job => (
            <button
              key={job.id}
              onClick={() => {
                setSelectedJob(job.id);
                setDraftResult('');
                setEngineInfo('');
              }}
              className={`w-full text-left p-4 rounded-none border transition-all duration-150 relative group overflow-hidden ${
                activeJob?.id === job.id 
                  ? 'bg-[#ffffff] border-[#8b4513] shadow-sm' 
                  : 'bg-[#faf7f0] border-[#ded7c4] hover:border-[#1a1a1a]/40 hover:bg-[#ffffff] text-[#4a4a4a]'
              }`}
            >
              {activeJob?.id === job.id && (
                <div className="absolute inset-y-0 left-0 w-1 bg-[#8b4513]" />
              )}
              
              <div className="font-bold text-sm text-[#1a1a1a] truncate relative z-10 font-serif">{job.role || job.description.split(',')[0]}</div>
              <div className="text-xs mt-2 flex items-center justify-between relative z-10 font-serif gap-2">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <CompanyLogo company={job.company} size="xs" />
                  <span className="text-[#6b6255] font-medium truncate">{job.company || 'Tech Enterprise'}</span>
                </div>
                <span className={`px-2 py-0.5 rounded-none text-[10px] font-bold uppercase tracking-wider font-typewriter flex-shrink-0 ${
                  job.status === 'Offer' ? 'bg-[#dff0e6] text-[#1b4332] border border-[#b8dec9]' :
                  job.status === 'Interview' ? 'bg-[#f8ede2] text-[#8b4513] border border-[#e5cbba]' :
                  job.status === 'Reject' ? 'bg-[#fbe8e8] text-[#8b0000] border border-[#f2bebe]' :
                  'bg-[#eee7d8] text-[#333333] border border-[#d8d0be]'
                }`}>
                  {job.status || 'Applied'}
                </span>
              </div>
              {job.drafts?.length > 0 && (
                <div className="mt-3 text-[11px] text-[#7a7060] flex items-center gap-1.5 font-typewriter relative z-10">
                  <FileText className="w-3.5 h-3.5 text-[#8a8070]" />
                  {job.drafts.length} linked draft{job.drafts.length > 1 ? 's' : ''} in memory
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Center panel - Generator & Editor */}
      <div className="flex-1 w-full bg-[#ffffff] border border-[#ded7c4] rounded-none p-8 flex flex-col shadow-sm relative min-h-[680px]">
        
        {!activeJob ? (
          <div className="flex-1 flex flex-col items-center justify-center text-[#7a7060] py-24">
            <div className="w-20 h-20 rounded-none bg-[#f5f0e3] border border-[#ded5c2] flex items-center justify-center mb-6 shadow-inner">
              <MessageSquare className="w-8 h-8 text-[#8a8070]" />
            </div>
            <p className="text-xl font-bold text-[#1a1a1a] font-serif">Select an Application</p>
            <p className="text-sm mt-2 text-[#6b6255] font-serif">Choose a pipeline entry from the left to start drafting customized communications.</p>
          </div>
        ) : (
          <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col flex-1">
            {/* Header with Company Logo */}
            <div className="flex items-center justify-between mb-6 flex-shrink-0 flex-wrap gap-4 pb-5 border-b border-[#eee8d9]">
              <div className="flex items-center gap-5">
                <CompanyLogo company={activeJob.company} size="xl" className="border border-[#ded5c2] shadow-sm" />
                <div>
                  <h3 className="text-2xl font-bold text-[#1a1a1a] tracking-tight font-serif">{activeJob.role || activeJob.description.split(',')[0]}</h3>
                  <p className="text-sm text-[#6b6255] mt-1 font-medium font-serif">{activeJob.company || 'Enterprise Partner'} <span className="opacity-50 mx-2">•</span> Applied on {new Date(activeJob.from).toLocaleDateString()}</p>
                </div>
              </div>
              {engineInfo && (
                <div className="text-[11px] font-typewriter px-3 py-1.5 rounded-none bg-[#eee7d8] border border-[#ded5c2] text-[#333333] font-bold flex items-center gap-2">
                  <span className="w-2 h-2 bg-emerald-700" />
                  <span>{engineInfo}</span>
                </div>
              )}
            </div>

            {/* Generation Parameter Configuration Strip */}
            <div className="flex flex-col gap-4 mb-6 p-5 bg-[#fbf9f4] rounded-none border border-[#ded7c4] shadow-inner flex-shrink-0">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-[#7a7060] uppercase tracking-widest pl-0.5 font-typewriter">Draft Type</label>
                  <div className="relative">
                    <select 
                      value={draftType} onChange={e => setDraftType(e.target.value)}
                      className="w-full bg-[#ffffff] border border-[#ded5c2] rounded-none px-3.5 py-2.5 text-sm font-serif text-[#1a1a1a] focus:outline-none focus:border-[#1a1a1a] appearance-none shadow-xs"
                    >
                      <option value="cover_letter">Cover Letter</option>
                      <option value="follow_up_email">Follow-up Email</option>
                    </select>
                    <ChevronRight className="w-4 h-4 text-[#8a8070] absolute right-3.5 top-1/2 -translate-y-1/2 rotate-90 pointer-events-none" />
                  </div>
                </div>
                
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-[#7a7060] uppercase tracking-widest pl-0.5 font-typewriter">Tone Profile</label>
                  <div className="relative">
                    <select 
                      value={tone} onChange={e => setTone(e.target.value)}
                      className="w-full bg-[#ffffff] border border-[#ded5c2] rounded-none px-3.5 py-2.5 text-sm font-serif text-[#1a1a1a] focus:outline-none focus:border-[#1a1a1a] appearance-none shadow-xs"
                    >
                      <option>Professional</option>
                      <option>Assertive / Executive</option>
                      <option>Enthusiastic Startup</option>
                      <option>Technical / Data-Driven</option>
                    </select>
                    <ChevronRight className="w-4 h-4 text-[#8a8070] absolute right-3.5 top-1/2 -translate-y-1/2 rotate-90 pointer-events-none" />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-[#7a7060] uppercase tracking-widest pl-0.5 font-typewriter">Format / Length</label>
                  <div className="relative">
                    <select 
                      value={lengthPref} onChange={e => setLengthPref(e.target.value as any)}
                      className="w-full bg-[#ffffff] border border-[#ded5c2] rounded-none px-3.5 py-2.5 text-sm font-serif text-[#1a1a1a] focus:outline-none focus:border-[#1a1a1a] appearance-none shadow-xs"
                    >
                      <option value="standard">Standard (300-400 words)</option>
                      <option value="concise">Concise (150-200 words)</option>
                      <option value="bullets">Structured Bullet Points</option>
                    </select>
                    <ChevronRight className="w-4 h-4 text-[#8a8070] absolute right-3.5 top-1/2 -translate-y-1/2 rotate-90 pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* Custom Focus & Prompt Presets */}
              <div className="pt-2 border-t border-[#e8e0d0] flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-bold text-[#7a7060] uppercase tracking-widest pl-0.5 font-typewriter flex items-center gap-1.5">
                    <Target className="w-3 h-3 text-[#8b4513]" /> Key Focus / Specific Strengths (Optional)
                  </label>
                  {customFocus && (
                    <button onClick={() => setCustomFocus('')} className="text-[10px] text-[#8b4513] hover:underline font-serif">Clear Focus</button>
                  )}
                </div>
                
                <input
                  type="text"
                  value={customFocus}
                  onChange={(e) => setCustomFocus(e.target.value)}
                  placeholder="e.g., Emphasize low-latency distributed pipelines, 6+ years Next.js, and team leadership..."
                  className="w-full bg-[#ffffff] border border-[#ded5c2] rounded-none px-3.5 py-2 text-xs font-serif text-[#1a1a1a] focus:outline-none focus:border-[#1a1a1a] shadow-inner placeholder:text-[#998e7e]"
                />

                {/* Focus Preset Pills */}
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {FOCUS_PRESETS.map((preset, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCustomFocus(prev => prev ? `${prev}, ${preset}` : preset)}
                      className="text-[10px] font-typewriter px-2.5 py-1 bg-[#eee7d8] hover:bg-[#e2d8c3] text-[#443e33] border border-[#dcd3bf] rounded-none transition-colors"
                    >
                      + {preset}
                    </button>
                  ))}
                </div>
              </div>

              {/* Action Buttons Strip */}
              <div className="flex justify-end items-center pt-2">
                <button 
                  onClick={generateDraft}
                  disabled={generating}
                  className="h-[44px] px-8 bg-[#1a1a1a] hover:bg-[#333333] text-[#fbf9f4] rounded-none text-sm font-bold transition-all flex items-center gap-2 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed font-serif border border-[#1a1a1a]"
                >
                  {generating ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Composing Draft...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      Compose Outreach Draft
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Text Editor Container with Metrics Bar */}
            <div className="relative flex flex-col bg-[#fbf9f4] rounded-none border border-[#ded7c4] shadow-inner overflow-hidden min-h-[400px] flex-1">
              
              {/* Textarea Toolbar */}
              <div className="flex items-center justify-between px-4 py-2.5 bg-[#f0e9dc] border-b border-[#ded7c4] text-xs text-[#554e42] font-typewriter">
                <div className="flex items-center gap-4">
                  <span><strong>{wordCount}</strong> words</span>
                  <span>•</span>
                  <span><strong>{charCount}</strong> chars</span>
                  <span>•</span>
                  <span>~<strong>{readTimeMin}</strong> min read</span>
                </div>

                <div className="flex items-center gap-2">
                  {draftResult && (
                    <>
                      <button 
                        onClick={() => downloadDraft('txt')} 
                        className="p-1 hover:bg-[#e2dac9] text-[#1a1a1a] border border-[#d2c9b8] rounded-none transition-colors"
                        title="Download .txt"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>
                      <button 
                        onClick={() => setDraftResult('')} 
                        className="p-1 hover:bg-[#e2dac9] text-[#8b0000] border border-[#d2c9b8] rounded-none transition-colors"
                        title="Clear Editor"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </>
                  )}
                </div>
              </div>

              <textarea 
                value={draftResult}
                onChange={(e) => setDraftResult(e.target.value)}
                placeholder="Click 'Compose Outreach Draft' above. The contextual engine will analyze application timelines and previous touchpoints to craft a tailored message..."
                className="w-full min-h-[340px] flex-1 bg-transparent p-8 text-[15px] text-[#1a1a1a] resize-y focus:outline-none custom-scrollbar leading-relaxed font-serif placeholder:text-[#8a8070] pb-24"
              />
              
              <AnimatePresence>
                {draftResult && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
                    className="absolute bottom-6 right-6 flex gap-3 z-10"
                  >
                    <button onClick={copyToClipboard} className="flex items-center gap-2 px-5 py-2.5 bg-[#ffffff] hover:bg-[#f5efe2] text-[#1a1a1a] border border-[#ded5c2] rounded-none text-sm font-semibold transition-all shadow-sm font-serif">
                      {copied ? <CheckCircle className="w-4 h-4 text-[#1b4332]" /> : <Copy className="w-4 h-4" />}
                      {copied ? 'Copied to Clipboard' : 'Copy Text'}
                    </button>
                    <div className="flex items-center gap-2 px-4 py-2.5 bg-[#dff0e6] border border-[#b8dec9] text-[#1b4332] rounded-none text-xs font-bold font-typewriter shadow-sm">
                      <Save className="w-4 h-4" /> Auto-Saved
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </div>

      {/* Right Column - Linked Drafts & Historical Context */}
      <div className="w-full xl:w-[320px] bg-[#fbf9f4] border border-[#ded7c4] rounded-none p-6 flex flex-col gap-6 shadow-sm flex-shrink-0 max-h-[720px] overflow-y-auto custom-scrollbar">
        <div className="flex items-center gap-3 text-[#1a1a1a] font-bold text-[15px] pb-3 border-b border-[#e5decb] tracking-wide font-serif">
          <div className="p-1.5 bg-[#eee7d8] rounded-none border border-[#ded5c2]">
            <History className="w-4 h-4 text-[#8b4513]" />
          </div>
          Context Memory
        </div>

        {linkedDrafts.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-4 text-[#7a7060] text-xs bg-[#ffffff] rounded-none border border-[#ded7c4] border-dashed py-12">
            <p className="font-bold text-[#1a1a1a] mb-1 font-serif">No historical drafts</p>
            <p className="text-[#6b6255] font-serif">Generated drafts will appear here and provide continuous context to the writing workspace.</p>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar pr-1">
            {linkedDrafts.map((draft: any, i: number) => (
              <div 
                key={draft.id || i}
                onClick={() => setDraftResult(draft.contents)}
                className="p-4 bg-[#ffffff] border border-[#ded7c4] hover:border-[#8b4513] rounded-none cursor-pointer transition-all shadow-sm hover:shadow group"
              >
                <div className="flex items-center justify-between mb-2 pb-1 border-b border-[#f0ece1]">
                  <span className="text-[13px] font-bold text-[#1a1a1a] capitalize group-hover:text-[#8b4513] transition-colors font-serif">
                    {draft.type.replace('_', ' ')}
                  </span>
                  <span className={`text-[9px] px-2 py-0.5 rounded-none uppercase font-bold tracking-wider font-typewriter ${
                    draft.status === 'sent' ? 'bg-[#dff0e6] text-[#1b4332] border border-[#b8dec9]' : 'bg-[#eee7d8] text-[#554e42] border border-[#ded5c0]'
                  }`}>
                    {draft.status || 'draft'}
                  </span>
                </div>
                <p className="text-[11px] text-[#6b6255] line-clamp-3 leading-relaxed font-serif">
                  {draft.contents}
                </p>
                <div className="mt-3 text-[10px] text-[#8b4513] flex items-center justify-end gap-1 font-serif font-bold">
                  <span>Load into editor</span>
                  <ArrowRight className="w-3 h-3" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* State Transition Timeline */}
        {activeJob?.statusHistory && activeJob.statusHistory.length > 0 && (
          <div className="pt-4 border-t border-[#e5decb]">
            <div className="text-[10px] font-bold text-[#7a7060] uppercase tracking-widest mb-3 flex items-center gap-2 font-typewriter">
              <Clock className="w-3.5 h-3.5 text-[#8b4513]" /> Pipeline Journey
            </div>
            <div className="space-y-3 max-h-[200px] overflow-y-auto custom-scrollbar text-xs text-[#554e42] relative before:absolute before:inset-0 before:ml-[5px] before:w-px before:bg-[#ded7c4]">
              {activeJob.statusHistory.map((t: any, idx: number) => (
                <div key={idx} className="flex items-center justify-between relative pl-5">
                  <div className="absolute left-[3px] top-1.5 w-1.5 h-1.5 bg-[#8b4513]" />
                  <span className="font-serif font-medium text-[#1a1a1a]">{t.fromStatus ? `${t.fromStatus} ➔ ` : ''}<strong>{t.toStatus}</strong></span>
                  <span className="text-[10px] text-[#7a7060] font-typewriter">{t.timestamp ? new Date(t.timestamp).toLocaleDateString() : ''}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

    </div>
  );
}



