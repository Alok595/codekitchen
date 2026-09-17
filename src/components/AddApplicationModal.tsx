import { useState } from 'react';
import { X, Plus, Building2, Briefcase, Calendar, FileText, Loader2, Check, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { CompanyLogo } from '@/components/CompanyLogo';

export function AddApplicationModal({ 
  isOpen, 
  onClose, 
  onSuccess 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  onSuccess: () => void; 
}) {
  const [company, setCompany] = useState('');
  const [role, setRole] = useState('');
  const [type, setType] = useState('full-time');
  const [status, setStatus] = useState<'Applied' | 'Interview' | 'Offer' | 'Reject'>('Applied');
  const [from, setFrom] = useState(new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!company.trim() || !role.trim() || !description.trim()) {
      setError('Please fill in Company, Role, and Description.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/applications/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          company: company.trim(),
          role: role.trim(),
          type,
          status,
          from,
          to: from,
          description: description.trim()
        })
      });

      const data = await res.json();
      if (data.success) {
        onSuccess();
        onClose();
        // Reset
        setCompany('');
        setRole('');
        setDescription('');
      } else {
        setError(data.error || 'Failed to create application.');
      }
    } catch (err) {
      console.error(err);
      setError('Network error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-[#1a1a1a]/40 backdrop-blur-xs"
            onClick={onClose}
          />
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.98, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: 10 }}
            className="bg-[#ffffff] border-2 border-[#1a1a1a] rounded-none w-full max-w-xl p-8 shadow-2xl relative overflow-hidden z-10"
          >
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-[#e5decb]">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-[#eee7d8] border border-[#ded5c0] rounded-none flex items-center justify-center text-[#1a1a1a] shadow-sm">
                  <Plus className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-[#1a1a1a] tracking-tight font-serif">Log Application</h3>
                  <p className="text-sm text-[#6b6255] font-serif">Add a new entry to your active pipeline.</p>
                </div>
              </div>
              <button onClick={onClose} className="text-[#8a8070] hover:text-[#1a1a1a] p-2 rounded-none hover:bg-[#f5efe2] transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {error && (
              <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="mb-6 p-4 bg-[#fbe8e8] border border-[#f2bebe] rounded-none text-sm font-medium text-[#8b0000] flex items-center gap-2 font-serif">
                <div className="w-1.5 h-1.5 bg-[#8b0000]" />
                {error}
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-2 gap-5">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-[11px] font-bold text-[#7a7060] uppercase tracking-widest pl-1 font-typewriter">
                      Target Company <span className="text-[#8b4513]">*</span>
                    </label>
                    {company.trim() && (
                      <div className="flex items-center gap-1.5 text-[10px] text-[#1b4332] font-typewriter font-bold">
                        <CompanyLogo company={company} size="xs" />
                        <span>Logo Detected</span>
                      </div>
                    )}
                  </div>
                  <div className="relative group">
                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none">
                      {company.trim() ? (
                        <CompanyLogo company={company} size="sm" />
                      ) : (
                        <Building2 className="w-4 h-4 text-[#8a8070] group-focus-within:text-[#1a1a1a] transition-colors" />
                      )}
                    </div>
                    <input
                      type="text"
                      placeholder="e.g. Stripe, Google, Microsoft"
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      className="w-full bg-[#fbf9f4] border border-[#ded5c2] rounded-none pl-11 pr-4 py-3 text-[15px] text-[#1a1a1a] focus:outline-none focus:border-[#1a1a1a] transition-all shadow-inner font-serif placeholder:text-[#8a8070]"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#7a7060] uppercase tracking-widest mb-2 pl-1 font-typewriter">
                    Specific Role <span className="text-[#8b4513]">*</span>
                  </label>
                  <div className="relative group">
                    <Briefcase className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-[#8a8070] group-focus-within:text-[#1a1a1a] transition-colors" />
                    <input
                      type="text"
                      placeholder="e.g. Senior Engineer"
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      className="w-full bg-[#fbf9f4] border border-[#ded5c2] rounded-none pl-11 pr-4 py-3 text-[15px] text-[#1a1a1a] focus:outline-none focus:border-[#1a1a1a] transition-all shadow-inner font-serif placeholder:text-[#8a8070]"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-5">
                <div>
                  <label className="block text-[11px] font-bold text-[#7a7060] uppercase tracking-widest mb-2 pl-1 font-typewriter">
                    Date Applied
                  </label>
                  <input
                    type="date"
                    value={from}
                    onChange={(e) => setFrom(e.target.value)}
                    className="w-full bg-[#fbf9f4] border border-[#ded5c2] rounded-none px-4 py-3 text-[15px] text-[#1a1a1a] focus:outline-none focus:border-[#1a1a1a] transition-all shadow-inner font-typewriter"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#7a7060] uppercase tracking-widest mb-2 pl-1 font-typewriter">
                    Contract Type
                  </label>
                  <div className="relative">
                    <select
                      value={type}
                      onChange={(e) => setType(e.target.value)}
                      className="w-full bg-[#fbf9f4] border border-[#ded5c2] rounded-none px-4 py-3 text-[15px] text-[#1a1a1a] focus:outline-none focus:border-[#1a1a1a] transition-all shadow-inner appearance-none font-serif"
                    >
                      <option value="full-time">Full-time</option>
                      <option value="contract">Contract</option>
                      <option value="part-time">Part-time</option>
                      <option value="remote">Remote</option>
                    </select>
                    <ChevronRight className="w-4 h-4 text-[#8a8070] absolute right-4 top-1/2 -translate-y-1/2 rotate-90 pointer-events-none" />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#7a7060] uppercase tracking-widest mb-2 pl-1 font-typewriter">
                    Pipeline Status
                  </label>
                  <div className="relative">
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value as any)}
                      className="w-full bg-[#fbf9f4] border border-[#ded5c2] rounded-none px-4 py-3 text-[15px] text-[#1a1a1a] focus:outline-none focus:border-[#1a1a1a] transition-all shadow-inner appearance-none font-serif font-bold"
                    >
                      <option value="Applied">Applied</option>
                      <option value="Interview">Interview</option>
                      <option value="Offer">Offer</option>
                      <option value="Reject">Reject</option>
                    </select>
                    <ChevronRight className="w-4 h-4 text-[#8a8070] absolute right-4 top-1/2 -translate-y-1/2 rotate-90 pointer-events-none" />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#7a7060] uppercase tracking-widest mb-2 pl-1 font-typewriter">
                  Job Description &amp; Requirements <span className="text-[#8b4513]">*</span>
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Paste the role description, responsibilities, or tech stack requirements..."
                  rows={4}
                  className="w-full bg-[#fbf9f4] border border-[#ded5c2] rounded-none p-4 text-[15px] text-[#1a1a1a] focus:outline-none focus:border-[#1a1a1a] transition-all shadow-inner resize-none custom-scrollbar font-serif placeholder:text-[#8a8070]"
                  required
                />
              </div>

              <div className="flex justify-end gap-3 pt-6 border-t border-[#ded7c4]">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-3 bg-[#fbf9f4] hover:bg-[#eee7d8] text-[#554e42] rounded-none text-sm font-semibold transition-colors border border-[#ded7c4] font-serif"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-8 py-3 bg-[#1a1a1a] hover:bg-[#333333] text-[#fbf9f4] rounded-none text-sm font-bold transition-all flex items-center gap-2 shadow-sm disabled:opacity-50 font-serif border border-[#1a1a1a]"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                  {loading ? 'Saving Entry...' : 'Save Application'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}


