import { useState } from 'react';
import { Database, Upload, Download, Loader2, CheckCircle2, FileText, Sparkles, RefreshCw } from 'lucide-react';
import confetti from 'canvas-confetti';
import { motion, AnimatePresence } from 'framer-motion';

export function IngestPanel({ onIngestComplete }: { onIngestComplete: () => void }) {
  const [activeMode, setActiveMode] = useState<'preset' | 'custom'>('preset');
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [jobsCsv, setJobsCsv] = useState(
`<id>, <from>, <to>, <type>, <description>
1, 2026-06-01, 2026-06-30, full-time, Senior Backend Engineer - Python, Bengaluru
2, 2026-06-10, 2026-07-10, contract, Data Platform Engineer - streaming pipelines, San Francisco
3, 2026-05-15, 2026-06-15, full-time, Lead Frontend Architect - React & Next.js, London
4, 2026-06-05, 2026-07-05, full-time, Principal Distributed Systems Engineer - High Throughput, New York
5, 2026-06-12, 2026-07-12, contract, DevOps / Cloud Infrastructure Architect - Kubernetes, Austin
6, 2026-05-20, 2026-06-20, full-time, Machine Learning Platform Engineer, Seattle
7, 2026-06-02, 2026-07-02, full-time, Fullstack TypeScript Specialist, Berlin
8, 2026-06-08, 2026-07-08, contract, Distributed Systems Engineer - Rust, Toronto
9, 2026-05-28, 2026-06-28, full-time, Staff Security Engineer - Cloud IAM, Boston
10, 2026-06-14, 2026-07-14, full-time, Enterprise Cloud Solutions Architect, Singapore`
  );

  const [draftsCsv, setDraftsCsv] = useState(
`<id>, <jobId>, <type>, <contents>, <status>
1, 1, cover_letter, "Dear Hiring Manager - I'm applying for the Senior Backend Engineer role. I have extensive experience in Python, microservices, and distributed pipelines in Bengaluru.", draft
2, 1, follow_up_email, "Following up on my application from June 1st. I remain very interested in the Python Backend position and look forward to hearing from you.", sent
3, 2, cover_letter, "Hello DataSync Team - I specialize in low-latency Kafka and Flink streaming architectures and would love to deliver on this contract.", draft
4, 2, follow_up_email, "Checking in regarding the Data Platform Engineer contract. I have attached my latest streaming benchmark papers.", sent
5, 3, cover_letter, "Dear WebFlow Team, I have architected high-performance Next.js design systems for over 6 years.", draft
6, 4, cover_letter, "Dear Hiring Team, I bring extensive experience in architecting low-latency distributed cloud infrastructure and high-throughput backends.", draft`
  );

  const officialEvaluationPayload = {
    jobs: [
      { id: 1, from: "2026-06-01", to: "2026-06-30", type: "full-time", description: "Senior Backend Engineer - Python, Bengaluru", company: "TechNova", role: "Senior Backend Engineer - Python", status: "Applied" },
      { id: 2, from: "2026-06-10", to: "2026-07-10", type: "contract", description: "Data Platform Engineer - streaming pipelines, San Francisco", company: "DataSync Global", role: "Data Platform Engineer", status: "Interview" },
      { id: 3, from: "2026-05-15", to: "2026-06-15", type: "full-time", description: "Lead Frontend Architect - React & Next.js, London", company: "WebFlow Inc", role: "Lead Frontend Architect", status: "Interview" },
      { id: 4, from: "2026-06-05", to: "2026-07-05", type: "full-time", description: "Principal Distributed Systems Engineer, New York", company: "Veritas Labs", role: "Principal Distributed Systems Engineer", status: "Offer" },
      { id: 5, from: "2026-06-12", to: "2026-07-12", type: "contract", description: "DevOps / Cloud Infrastructure Architect - Kubernetes, Austin", company: "CloudScale Systems", role: "DevOps Cloud Architect", status: "Applied" },
      { id: 6, from: "2026-05-20", to: "2026-06-20", type: "full-time", description: "Machine Learning Platform Engineer, Seattle", company: "Cortex Intelligence", role: "ML Platform Engineer", status: "Reject" },
      { id: 7, from: "2026-06-02", to: "2026-07-02", type: "full-time", description: "Fullstack TypeScript Specialist, Berlin", company: "FinTech Prime", role: "Fullstack TypeScript Specialist", status: "Applied" },
      { id: 8, from: "2026-06-08", to: "2026-07-08", type: "contract", description: "Distributed Systems Engineer - Rust, Toronto", company: "HyperChain Labs", role: "Distributed Systems Engineer", status: "Applied" },
      { id: 9, from: "2026-05-28", to: "2026-06-28", type: "full-time", description: "Staff Security Engineer - Cloud IAM, Boston", company: "ShieldNet", role: "Staff Security Engineer", status: "Interview" },
      { id: 10, from: "2026-06-14", to: "2026-07-14", type: "full-time", description: "Enterprise Cloud Solutions Architect, Singapore", company: "Nexus Enterprise", role: "Cloud Solutions Architect", status: "Applied" },
      { id: 11, from: "2026-06-16", to: "2026-07-16", type: "full-time", description: "Site Reliability Engineer - SRE, Dublin", company: "OmniCloud", role: "Site Reliability Engineer", status: "Applied" },
      { id: 12, from: "2026-06-18", to: "2026-07-18", type: "contract", description: "Smart Contract & Protocols Auditor, Zurich", company: "Aetheria Protocols", role: "Smart Contract Auditor", status: "Applied" }
    ],
    drafts: [
      { id: 1, jobId: 1, type: "cover_letter", contents: "Dear Hiring Manager - I'm applying for the Senior Backend Engineer role. I have extensive experience in Python, microservices, and building scalable pipelines in Bengaluru.", status: "draft" },
      { id: 2, jobId: 1, type: "follow_up_email", contents: "Following up on my application from June 1st. I remain very interested in the Python Backend position and look forward to discussing how my experience aligns with your team.", status: "sent" },
      { id: 3, jobId: 2, type: "cover_letter", contents: "Hello DataSync Team - I specialize in real-time streaming architectures using Kafka, Flink, and Spark, and would love to deliver immediate impact on this contract.", status: "draft" },
      { id: 4, jobId: 2, type: "follow_up_email", contents: "Following up on my interview discussion with your platform lead on June 12th. I am excited about the streaming pipelines roadmap.", status: "sent" },
      { id: 5, jobId: 3, type: "cover_letter", contents: "Dear WebFlow Team, I have architected high-performance Next.js and React enterprise applications for over 6 years.", status: "draft" },
      { id: 6, jobId: 4, type: "cover_letter", contents: "Dear Veritas Team, my background in building production distributed cloud services and low-latency infrastructure makes me an exceptional candidate.", status: "draft" }
    ]
  };

  const executeIngest = async (payload: any) => {
    setLoading(true);
    setStatusMessage('');
    
    try {
      const res = await fetch('/api/ingest/load-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      const data = await res.json();
      if (data.success) {
        setStatusMessage(data.message || 'Dataset successfully ingested!');
        onIngestComplete();
        confetti({
          particleCount: 150,
          spread: 90,
          origin: { y: 0.6 },
          colors: ['#1b4332', '#8b4513', '#1a1a1a']
        });
      } else {
        setStatusMessage(`Ingest failed: ${data.error}`);
      }
    } catch (e) {
      console.error(e);
      setStatusMessage('Network or server error during ingestion.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full max-w-[1000px] mx-auto flex flex-col justify-center py-6 overflow-y-auto custom-scrollbar min-h-0">
      <div className="bg-[#ffffff] border border-[#ded7c4] rounded-none p-10 shadow-sm relative overflow-hidden flex flex-col flex-shrink-0">
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 pb-8 border-b border-[#e5decb] relative z-10">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 bg-[#dff0e6] border border-[#b8dec9] rounded-none flex items-center justify-center text-[#1b4332] shadow-sm">
              <Database className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-[#1a1a1a] tracking-tight font-serif">Dataset Ingestion Engine</h2>
              <p className="text-[#6b6255] text-[15px] mt-1 font-serif">Operate on structured application schemas at scale (Track 03 Compliant).</p>
            </div>
          </div>

          <div className="flex bg-[#fbf9f4] p-1 rounded-none border border-[#ded7c4]">
            <button
              onClick={() => setActiveMode('preset')}
              className={`px-4 py-2 rounded-none text-sm font-bold transition-all font-serif ${activeMode === 'preset' ? 'bg-[#1a1a1a] text-[#fbf9f4] shadow-sm' : 'text-[#6b6255] hover:text-[#1a1a1a]'}`}
            >
              Official Dataset
            </button>
            <button
              onClick={() => setActiveMode('custom')}
              className={`px-4 py-2 rounded-none text-sm font-bold transition-all font-serif ${activeMode === 'custom' ? 'bg-[#1a1a1a] text-[#fbf9f4] shadow-sm' : 'text-[#6b6255] hover:text-[#1a1a1a]'}`}
            >
              Custom CSV
            </button>
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeMode}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            className="relative z-10"
          >
            {activeMode === 'preset' ? (
              <div className="space-y-8">
                <div className="bg-[#fbf9f4] border border-[#ded7c4] rounded-none p-8 shadow-inner">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[13px] font-bold uppercase tracking-widest text-[#1b4332] flex items-center gap-2 font-typewriter">
                      <Sparkles className="w-4 h-4" /> Track 03 Evaluator Package
                    </span>
                    <span className="text-[11px] font-bold text-[#1a1a1a] uppercase tracking-wider bg-[#eee7d8] px-2.5 py-1 rounded-none border border-[#ded5c0] font-typewriter">
                      12 Jobs • 6 Drafts
                    </span>
                  </div>
                  <p className="text-[#4a4a4a] text-[15px] leading-relaxed mb-6 font-serif">
                    Loads the complete evaluation dataset specified in the competition rules with explicit schemas, Bengaluru/Python, streaming pipelines, full-time/contract roles, and connected drafts directly into MongoDB.
                  </p>
                  
                  <div className="grid grid-cols-2 gap-4 text-xs text-[#554e42] font-typewriter">
                    <div className="p-4 bg-[#ffffff] rounded-none border border-[#ded7c4] truncate shadow-sm font-medium">
                      &lt;id&gt;, &lt;from&gt;, &lt;to&gt;, &lt;type&gt;, &lt;description&gt;
                    </div>
                    <div className="p-4 bg-[#ffffff] rounded-none border border-[#ded7c4] truncate shadow-sm font-medium">
                      &lt;id&gt;, &lt;jobId&gt;, &lt;type&gt;, &lt;contents&gt;, &lt;status&gt;
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <div className="text-[13px] text-[#6b6255] font-serif font-medium">
                    {statusMessage && (
                      <motion.span initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-2 text-[#1b4332] font-semibold">
                        <CheckCircle2 className="w-4 h-4" /> {statusMessage}
                      </motion.span>
                    )}
                  </div>
                  <button
                    onClick={() => executeIngest(officialEvaluationPayload)}
                    disabled={loading}
                    className="px-8 py-3.5 bg-[#1a1a1a] hover:bg-[#333333] text-[#fbf9f4] rounded-none font-bold transition-all flex items-center gap-3 shadow-sm disabled:opacity-50 font-serif border border-[#1a1a1a]"
                  >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Database className="w-5 h-5" />}
                    {loading ? 'Ingesting into Database...' : 'Load Evaluation Dataset'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[11px] font-bold text-[#7a7060] mb-2 uppercase tracking-widest pl-1 font-typewriter">
                      1. Job Postings CSV (&lt;id&gt;, &lt;from&gt;...)
                    </label>
                    <textarea
                      value={jobsCsv}
                      onChange={(e) => setJobsCsv(e.target.value)}
                      rows={8}
                      className="w-full bg-[#fbf9f4] border border-[#ded7c4] rounded-none p-4 text-[13px] font-typewriter text-[#1a1a1a] resize-none focus:outline-none focus:border-[#1a1a1a] custom-scrollbar shadow-inner"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[#7a7060] mb-2 uppercase tracking-widest pl-1 font-typewriter">
                      2. Drafts CSV (&lt;id&gt;, &lt;jobId&gt;...)
                    </label>
                    <textarea
                      value={draftsCsv}
                      onChange={(e) => setDraftsCsv(e.target.value)}
                      rows={8}
                      className="w-full bg-[#fbf9f4] border border-[#ded7c4] rounded-none p-4 text-[13px] font-typewriter text-[#1a1a1a] resize-none focus:outline-none focus:border-[#1a1a1a] custom-scrollbar shadow-inner"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-[#e5decb]">
                  <div className="text-[13px] text-[#6b6255] font-serif font-medium">
                    {statusMessage && (
                      <motion.span initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-2 text-[#1b4332] font-semibold">
                        <CheckCircle2 className="w-4 h-4" /> {statusMessage}
                      </motion.span>
                    )}
                  </div>
                  <button
                    onClick={() => executeIngest({ jobsCsv, draftsCsv })}
                    disabled={loading}
                    className="px-8 py-3.5 bg-[#1a1a1a] hover:bg-[#333333] text-[#fbf9f4] rounded-none font-bold transition-all flex items-center gap-3 shadow-sm disabled:opacity-50 font-serif border border-[#1a1a1a]"
                  >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Upload className="w-5 h-5" />}
                    {loading ? 'Parsing & Ingesting...' : 'Ingest Custom CSV Data'}
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}


