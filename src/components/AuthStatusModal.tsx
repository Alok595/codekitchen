'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSession, signIn, signOut } from 'next-auth/react';
import { X, LogIn, LogOut, CheckCircle, ExternalLink, Key, Copy, Check, User, ShieldCheck } from 'lucide-react';

interface AuthStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AuthStatusModal({ isOpen, onClose }: AuthStatusModalProps) {
  const { data: session, status } = useSession();
  const [copiedUri, setCopiedUri] = useState(false);

  const redirectUri = typeof window !== 'undefined' 
    ? `${window.location.origin}/api/auth/callback/google` 
    : 'http://localhost:3000/api/auth/callback/google';

  const copyRedirectUri = () => {
    navigator.clipboard.writeText(redirectUri);
    setCopiedUri(true);
    setTimeout(() => setCopiedUri(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs font-serif">
        <motion.div
          initial={{ opacity: 0, scale: 0.98, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.98, y: 10 }}
          className="bg-[#fbf9f4] border border-[#ded7c4] shadow-2xl w-full max-w-xl overflow-hidden rounded-none flex flex-col"
        >
          {/* Header */}
          <div className="p-6 border-b border-[#e5decb] flex items-center justify-between bg-[#f5efe2]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-none border border-[#1a1a1a] shadow-xs overflow-hidden flex-shrink-0 bg-[#fbf9f4]">
                <img 
                  src="/logo.png" 
                  alt="Pragati Brand" 
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <span className="text-[10px] font-typewriter uppercase tracking-widest text-[#8b4513] font-bold block leading-none mb-1">
                  Security & Identity
                </span>
                <h2 className="text-xl font-bold text-[#1a1a1a] tracking-tight">
                  Pragati Candidate Gateway
                </h2>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-[#8a8070] hover:text-[#1a1a1a] hover:bg-[#e8dfce] border border-transparent hover:border-[#ded5c2] transition-colors rounded-none"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto custom-scrollbar">
            {/* Current Session State */}
            {status === 'authenticated' && session?.user ? (
              <div className="p-6 bg-[#ffffff] border border-[#b8dec9] bg-[#dff0e6]/20 flex flex-col gap-4 shadow-sm">
                <div className="flex items-center gap-4">
                  {session.user.image ? (
                    <img 
                      src={session.user.image} 
                      alt={session.user.name || 'User'} 
                      className="w-14 h-14 rounded-none border border-[#1a1a1a] object-cover shadow-sm"
                    />
                  ) : (
                    <div className="w-14 h-14 bg-[#1a1a1a] text-[#fbf9f4] flex items-center justify-center font-bold text-lg rounded-none">
                      {session.user.name ? session.user.name.charAt(0) : 'U'}
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-base text-[#1a1a1a] truncate">{session.user.name || 'Authenticated User'}</h3>
                      <span className="px-2 py-0.5 bg-[#dff0e6] text-[#1b4332] border border-[#b8dec9] text-[10px] font-typewriter font-bold uppercase tracking-wider">
                        Google Verified
                      </span>
                    </div>
                    <p className="text-xs text-[#6b6255] font-typewriter truncate mt-0.5">{session.user.email}</p>
                    <p className="text-[11px] text-[#2d6a4f] font-typewriter mt-1 flex items-center gap-1 font-semibold">
                      <CheckCircle className="w-3.5 h-3.5" /> Connected via Google OAuth 2.0
                    </p>
                  </div>
                </div>

                <div className="pt-3 border-t border-[#ded7c4] flex justify-end">
                  <button
                    onClick={() => signOut({ callbackUrl: '/' })}
                    className="px-4 py-2 bg-[#fbe8e8] hover:bg-[#f8d2d2] text-[#8b0000] border border-[#f2bebe] text-xs font-bold font-typewriter flex items-center gap-2 transition-colors rounded-none cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    Sign Out Account
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-8 bg-[#ffffff] border border-[#ded7c4] text-center flex flex-col items-center gap-5 shadow-sm">
                <div className="w-14 h-14 bg-[#fbf9f4] border border-[#ded7c4] flex items-center justify-center shadow-inner">
                  <svg className="w-7 h-7" viewBox="0 0 24 24">
                    <path fill="#EA4335" d="M12 5c1.6 0 3 .6 4.1 1.7l3.1-3.1C17.3 1.8 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.4 9 5 12 5z"/>
                    <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.7-.2-2.3H12v4.6h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.9z"/>
                    <path fill="#FBBC05" d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3 0-.8.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 12 0 14.5s.7 4.8 1.9 7.2l3.7-2.9z"/>
                    <path fill="#34A853" d="M12 23.5c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.4-6.4-5.2L1.9 16.5C3.7 20.2 7.5 23.5 12 23.5z"/>
                  </svg>
                </div>
                
                <div>
                  <h3 className="font-bold text-xl text-[#1a1a1a]">Sign in with Google</h3>
                  <p className="text-xs text-[#6b6255] mt-1 max-w-md font-serif leading-relaxed">
                    Click the button below to authenticate with your Google account. Your profile name and avatar will automatically synchronize with your <strong>Pragati</strong> dashboard.
                  </p>
                </div>

                <button
                  onClick={() => signIn('google', { callbackUrl: '/' })}
                  className="w-full sm:w-auto px-8 py-3.5 bg-[#1a1a1a] hover:bg-[#333333] text-[#fbf9f4] border border-[#1a1a1a] text-sm font-bold flex items-center justify-center gap-3 transition-all shadow-md rounded-none cursor-pointer group"
                >
                  <svg className="w-5 h-5 group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
                    <path fill="#EA4335" d="M12 5c1.6 0 3 .6 4.1 1.7l3.1-3.1C17.3 1.8 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.4 9 5 12 5z"/>
                    <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.7-.2-2.3H12v4.6h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.9z"/>
                    <path fill="#FBBC05" d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3 0-.8.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 12 0 14.5s.7 4.8 1.9 7.2l3.7-2.9z"/>
                    <path fill="#34A853" d="M12 23.5c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.4-6.4-5.2L1.9 16.5C3.7 20.2 7.5 23.5 12 23.5z"/>
                  </svg>
                  Continue with Google
                </button>
              </div>
            )}

            {/* Collapsible Google Cloud Console Setup Guide */}
            <details className="group bg-[#faf7f0] border border-[#ded7c4] p-4 text-xs">
              <summary className="font-bold text-[#1a1a1a] flex items-center justify-between cursor-pointer list-none select-none">
                <span className="flex items-center gap-2">
                  <Key className="w-3.5 h-3.5 text-[#8b4513]" />
                  Google Cloud Console Settings (Configured)
                </span>
                <span className="text-[10px] font-typewriter text-[#8b4513] group-open:rotate-180 transition-transform">
                  ▼
                </span>
              </summary>

              <div className="mt-4 space-y-3 pt-3 border-t border-[#ded7c4]">
                <p className="text-xs text-[#554e42] leading-relaxed">
                  Verify that your <a href="https://console.cloud.google.com/apis/credentials" target="_blank" rel="noopener noreferrer" className="text-[#8b4513] underline font-semibold">Google Cloud Console</a> OAuth 2.0 Web Application credentials match these URIs:
                </p>

                <div className="space-y-2">
                  <div className="p-2.5 bg-[#ffffff] border border-[#ded7c4]">
                    <span className="text-[10px] font-typewriter uppercase text-[#7a7060] block font-bold">
                      1. Authorized JavaScript Origins:
                    </span>
                    <code className="text-xs font-typewriter text-[#1a1a1a] font-bold">http://localhost:3000</code>
                  </div>

                  <div className="p-2.5 bg-[#ffffff] border border-[#ded7c4]">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-typewriter uppercase text-[#7a7060] font-bold">
                        2. Authorized Redirect URI:
                      </span>
                      <button 
                        onClick={copyRedirectUri} 
                        className="text-[10px] font-typewriter text-[#8b4513] hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        {copiedUri ? <Check className="w-3 h-3 text-[#1b4332]" /> : <Copy className="w-3 h-3" />}
                        {copiedUri ? 'Copied' : 'Copy'}
                      </button>
                    </div>
                    <code className="text-xs font-typewriter text-[#1a1a1a] font-bold select-all break-all">
                      {redirectUri}
                    </code>
                  </div>
                </div>
              </div>
            </details>
          </div>

          {/* Footer */}
          <div className="p-4 bg-[#f5efe2] border-t border-[#e5decb] flex justify-end">
            <button
              onClick={onClose}
              className="px-5 py-2 bg-[#ffffff] hover:bg-[#ede6d6] text-[#1a1a1a] border border-[#ded5c2] text-xs font-bold transition-colors font-serif rounded-none"
            >
              Close
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
