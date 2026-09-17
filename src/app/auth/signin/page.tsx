'use client';

import React, { useState, Suspense } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Newspaper, 
  ArrowLeft, 
  Lock, 
  Mail, 
  User, 
  Briefcase, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle,
  Loader2,
  KeyRound,
  Sparkles
} from 'lucide-react';

function SignInContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/';
  const urlError = searchParams.get('error');

  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  
  // Sign In State
  const [signInEmail, setSignInEmail] = useState('');
  const [signInPassword, setSignInPassword] = useState('');
  const [signInLoading, setSignInLoading] = useState(false);
  
  // Sign Up State
  const [signUpName, setSignUpName] = useState('');
  const [signUpEmail, setSignUpEmail] = useState('');
  const [signUpPassword, setSignUpPassword] = useState('');
  const [signUpHeadline, setSignUpHeadline] = useState('');
  const [signUpLoading, setSignUpLoading] = useState(false);

  // Google OAuth Loading
  const [googleLoading, setGoogleLoading] = useState(false);

  // Feedback Messages
  const [errorMessage, setErrorMessage] = useState(
    urlError === 'OAuthCallbackError' ? 'Google authentication was cancelled or encountered an error.' : ''
  );
  const [successMessage, setSuccessMessage] = useState('');

  const handleGoogleSignIn = async () => {
    try {
      setGoogleLoading(true);
      setErrorMessage('');
      await signIn('google', { callbackUrl });
    } catch (err) {
      setErrorMessage('Failed to initiate Google login.');
      setGoogleLoading(false);
    }
  };

  const handleCredentialsSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signInEmail || !signInPassword) {
      setErrorMessage('Please provide both your email and password.');
      return;
    }

    try {
      setSignInLoading(true);
      setErrorMessage('');
      
      const res = await signIn('credentials', {
        email: signInEmail.trim(),
        password: signInPassword,
        redirect: false,
        callbackUrl,
      });

      if (res?.error) {
        setErrorMessage('Invalid email or password. Please try again.');
        setSignInLoading(false);
      } else {
        setSuccessMessage('Authentication verified. Accessing pipeline...');
        setTimeout(() => {
          router.push(callbackUrl);
          router.refresh();
        }, 500);
      }
    } catch (err: any) {
      setErrorMessage('An error occurred during sign in.');
      setSignInLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signUpName || !signUpEmail || !signUpPassword) {
      setErrorMessage('Full name, email, and password are required.');
      return;
    }

    if (signUpPassword.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }

    try {
      setSignUpLoading(true);
      setErrorMessage('');

      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: signUpName,
          email: signUpEmail,
          password: signUpPassword,
          roleHeadline: signUpHeadline,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMessage(data.error || 'Failed to create candidate account.');
        setSignUpLoading(false);
        return;
      }

      setSuccessMessage('Account registered! Signing into your workspace...');
      
      // Auto sign-in with the new credentials
      const signInRes = await signIn('credentials', {
        email: signUpEmail.trim(),
        password: signUpPassword,
        redirect: false,
        callbackUrl,
      });

      if (signInRes?.error) {
        setMode('signin');
        setSignInEmail(signUpEmail);
        setErrorMessage('Account created. Please sign in with your password.');
        setSignUpLoading(false);
      } else {
        setTimeout(() => {
          router.push(callbackUrl);
          router.refresh();
        }, 500);
      }
    } catch (err: any) {
      setErrorMessage('Failed to connect to registration service.');
      setSignUpLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f2eb] text-[#1a1a1a] flex flex-col justify-between selection:bg-[#1a1a1a] selection:text-[#fbf9f4]">
      
      {/* Top Bar */}
      <header className="h-20 border-b border-[#e0d8c7] bg-[#fbf9f4] px-6 lg:px-12 flex items-center justify-between shadow-xs">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-none border border-[#1a1a1a] shadow-xs overflow-hidden flex-shrink-0 bg-[#fbf9f4] group-hover:opacity-90 transition-opacity">
            <img 
              src="/logo.png" 
              alt="Pragati Logo" 
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <h1 className="text-xl font-bold text-[#1a1a1a] tracking-tight font-serif leading-none">
              Pragati
            </h1>
            <p className="text-[9px] uppercase text-[#7a7060] font-typewriter tracking-widest font-semibold mt-1">
              Career Operations Desk
            </p>
          </div>
        </Link>

        <Link 
          href="/"
          className="flex items-center gap-2 text-xs font-serif text-[#6b6255] hover:text-[#1a1a1a] transition-colors px-3 py-1.5 border border-[#ded5c2] hover:bg-[#eee8db] rounded-none shadow-xs"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Return to Dashboard</span>
        </Link>
      </header>

      {/* Main Container */}
      <main className="flex-1 flex items-center justify-center p-6 sm:p-10 my-6">
        <motion.div 
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="w-full max-w-[480px] bg-[#fbf9f4] border border-[#ded7c4] shadow-xl rounded-none flex flex-col overflow-hidden"
        >
          
          {/* Card Header */}
          <div className="p-8 pb-6 border-b border-[#e5decb] bg-[#f8f3e8] text-center flex flex-col items-center">
            <div className="w-12 h-12 rounded-none border border-[#1a1a1a] shadow-xs overflow-hidden mb-3 bg-[#fbf9f4]">
              <img 
                src="/logo.png" 
                alt="Pragati Brand" 
                className="w-full h-full object-cover"
              />
            </div>

            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#dff0e6] text-[#1b4332] border border-[#b8dec9] text-[10px] font-typewriter font-bold uppercase tracking-wider mb-2">
              <ShieldCheck className="w-3.5 h-3.5" />
              Candidate Access Gateway
            </div>

            <h2 className="text-2xl sm:text-3xl font-bold text-[#1a1a1a] tracking-tight font-serif">
              {mode === 'signin' ? 'Sign In to Desk' : 'Create Candidate Account'}
            </h2>
            <p className="text-xs text-[#6b6255] font-serif mt-1.5 leading-relaxed">
              {mode === 'signin' 
                ? 'Access your applications, scheduled follow-ups, and live draft workspace.' 
                : 'Register your candidate profile to track job applications and compose outreach.'}
            </p>

            {/* Mode Switcher Tabs */}
            <div className="grid grid-cols-2 gap-1 p-1 bg-[#eee7d8] border border-[#ded5c2] rounded-none mt-6">
              <button
                type="button"
                onClick={() => {
                  setMode('signin');
                  setErrorMessage('');
                  setSuccessMessage('');
                }}
                className={`py-2 text-xs font-serif font-bold transition-all rounded-none cursor-pointer ${
                  mode === 'signin'
                    ? 'bg-[#1a1a1a] text-[#fbf9f4] shadow-sm'
                    : 'text-[#554e42] hover:text-[#1a1a1a] hover:bg-[#e4dcce]'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode('signup');
                  setErrorMessage('');
                  setSuccessMessage('');
                }}
                className={`py-2 text-xs font-serif font-bold transition-all rounded-none cursor-pointer ${
                  mode === 'signup'
                    ? 'bg-[#1a1a1a] text-[#fbf9f4] shadow-sm'
                    : 'text-[#554e42] hover:text-[#1a1a1a] hover:bg-[#e4dcce]'
                }`}
              >
                Create Account
              </button>
            </div>
          </div>

          {/* Form Body */}
          <div className="p-8 space-y-6">
            
            {/* Feedback Alerts */}
            {errorMessage && (
              <motion.div 
                initial={{ opacity: 0, y: -4 }} 
                animate={{ opacity: 1, y: 0 }}
                className="p-3 bg-[#fbe8e8] border border-[#f2bebe] text-[#8b0000] text-xs font-serif flex items-start gap-2.5 shadow-xs"
              >
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span className="leading-snug">{errorMessage}</span>
              </motion.div>
            )}

            {successMessage && (
              <motion.div 
                initial={{ opacity: 0, y: -4 }} 
                animate={{ opacity: 1, y: 0 }}
                className="p-3 bg-[#dff0e6] border border-[#b8dec9] text-[#1b4332] text-xs font-serif flex items-start gap-2.5 shadow-xs"
              >
                <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span className="leading-snug font-semibold">{successMessage}</span>
              </motion.div>
            )}

            {/* 1-Click Google OAuth */}
            <div>
              <button
                type="button"
                disabled={googleLoading}
                onClick={handleGoogleSignIn}
                className="w-full py-3 px-4 bg-[#ffffff] hover:bg-[#fbf7ee] text-[#1a1a1a] border border-[#ded5c2] hover:border-[#1a1a1a] rounded-none text-xs font-serif font-bold flex items-center justify-center gap-3 transition-all shadow-sm cursor-pointer disabled:opacity-50 group"
              >
                {googleLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-[#1a1a1a]" />
                    <span>Connecting to Google...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4 group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
                      <path fill="#EA4335" d="M12 5c1.6 0 3 .6 4.1 1.7l3.1-3.1C17.3 1.8 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.4 9 5 12 5z"/>
                      <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.7-.2-2.3H12v4.6h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.9z"/>
                      <path fill="#FBBC05" d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3 0-.8.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 12 0 14.5s.7 4.8 1.9 7.2l3.7-2.9z"/>
                      <path fill="#34A853" d="M12 23.5c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.4-6.4-5.2L1.9 16.5C3.7 20.2 7.5 23.5 12 23.5z"/>
                    </svg>
                    <span>{mode === 'signin' ? 'Continue with Google' : 'Sign Up with Google'}</span>
                  </>
                )}
              </button>
            </div>

            {/* Editorial Divider */}
            <div className="relative flex items-center justify-center">
              <div className="border-t border-[#ded5c2] w-full" />
              <span className="bg-[#fbf9f4] px-3 text-[10px] font-typewriter uppercase tracking-widest text-[#8a8070] absolute">
                or credentials
              </span>
            </div>

            {/* Mode-specific Forms */}
            <AnimatePresence mode="wait">
              {mode === 'signin' ? (
                <motion.form 
                  key="signin-form"
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 6 }}
                  onSubmit={handleCredentialsSignIn} 
                  className="space-y-4"
                >
                  <div>
                    <label className="block text-xs font-bold text-[#1a1a1a] mb-1 font-serif">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-[#8a8070] absolute left-3.5 top-3 pointer-events-none" />
                      <input 
                        type="email"
                        required
                        value={signInEmail}
                        onChange={(e) => setSignInEmail(e.target.value)}
                        placeholder="candidate@example.com"
                        className="w-full bg-[#eee8db] border border-[#ded5c2] rounded-none pl-10 pr-4 py-2.5 text-xs font-serif text-[#1a1a1a] focus:outline-none focus:border-[#1a1a1a] focus:bg-[#ffffff] transition-all shadow-inner"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-bold text-[#1a1a1a] font-serif">
                        Password
                      </label>
                      <span className="text-[10px] font-typewriter text-[#8a8070]">
                        Security Passcode
                      </span>
                    </div>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-[#8a8070] absolute left-3.5 top-3 pointer-events-none" />
                      <input 
                        type="password"
                        required
                        value={signInPassword}
                        onChange={(e) => setSignInPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-[#eee8db] border border-[#ded5c2] rounded-none pl-10 pr-4 py-2.5 text-xs font-serif text-[#1a1a1a] focus:outline-none focus:border-[#1a1a1a] focus:bg-[#ffffff] transition-all shadow-inner"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={signInLoading}
                    className="w-full py-3 bg-[#1a1a1a] hover:bg-[#333333] text-[#fbf9f4] border border-[#1a1a1a] rounded-none text-xs font-serif font-bold flex items-center justify-center gap-2 transition-all shadow-sm cursor-pointer disabled:opacity-50 mt-2"
                  >
                    {signInLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Verifying Credentials...</span>
                      </>
                    ) : (
                      <>
                        <KeyRound className="w-3.5 h-3.5" />
                        <span>Sign In to Desk</span>
                      </>
                    )}
                  </button>
                </motion.form>
              ) : (
                <motion.form 
                  key="signup-form"
                  initial={{ opacity: 0, x: 6 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -6 }}
                  onSubmit={handleSignUp} 
                  className="space-y-4"
                >
                  <div>
                    <label className="block text-xs font-bold text-[#1a1a1a] mb-1 font-serif">
                      Full Name
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-[#8a8070] absolute left-3.5 top-3 pointer-events-none" />
                      <input 
                        type="text"
                        required
                        value={signUpName}
                        onChange={(e) => setSignUpName(e.target.value)}
                        placeholder="Aarav Sharma"
                        className="w-full bg-[#eee8db] border border-[#ded5c2] rounded-none pl-10 pr-4 py-2.5 text-xs font-serif text-[#1a1a1a] focus:outline-none focus:border-[#1a1a1a] focus:bg-[#ffffff] transition-all shadow-inner"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#1a1a1a] mb-1 font-serif">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-[#8a8070] absolute left-3.5 top-3 pointer-events-none" />
                      <input 
                        type="email"
                        required
                        value={signUpEmail}
                        onChange={(e) => setSignUpEmail(e.target.value)}
                        placeholder="candidate@example.com"
                        className="w-full bg-[#eee8db] border border-[#ded5c2] rounded-none pl-10 pr-4 py-2.5 text-xs font-serif text-[#1a1a1a] focus:outline-none focus:border-[#1a1a1a] focus:bg-[#ffffff] transition-all shadow-inner"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#1a1a1a] mb-1 font-serif">
                      Target Role / Specialization <span className="text-[10px] text-[#8a8070] font-normal">(Optional)</span>
                    </label>
                    <div className="relative">
                      <Briefcase className="w-4 h-4 text-[#8a8070] absolute left-3.5 top-3 pointer-events-none" />
                      <input 
                        type="text"
                        value={signUpHeadline}
                        onChange={(e) => setSignUpHeadline(e.target.value)}
                        placeholder="Senior Software Engineer • AI Systems"
                        className="w-full bg-[#eee8db] border border-[#ded5c2] rounded-none pl-10 pr-4 py-2.5 text-xs font-serif text-[#1a1a1a] focus:outline-none focus:border-[#1a1a1a] focus:bg-[#ffffff] transition-all shadow-inner"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#1a1a1a] mb-1 font-serif">
                      Password <span className="text-[10px] text-[#8a8070] font-normal">(Min. 6 characters)</span>
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-[#8a8070] absolute left-3.5 top-3 pointer-events-none" />
                      <input 
                        type="password"
                        required
                        value={signUpPassword}
                        onChange={(e) => setSignUpPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-[#eee8db] border border-[#ded5c2] rounded-none pl-10 pr-4 py-2.5 text-xs font-serif text-[#1a1a1a] focus:outline-none focus:border-[#1a1a1a] focus:bg-[#ffffff] transition-all shadow-inner"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={signUpLoading}
                    className="w-full py-3 bg-[#1a1a1a] hover:bg-[#333333] text-[#fbf9f4] border border-[#1a1a1a] rounded-none text-xs font-serif font-bold flex items-center justify-center gap-2 transition-all shadow-sm cursor-pointer disabled:opacity-50 mt-2"
                  >
                    {signUpLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Registering Profile...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Create Candidate Account</span>
                      </>
                    )}
                  </button>
                </motion.form>
              )}
            </AnimatePresence>

          </div>

          {/* Card Footer */}
          <div className="p-4 bg-[#f8f3e8] border-t border-[#e5decb] text-center text-[11px] font-typewriter text-[#6b6255]">
            <span>Secure Authentication • Pragati Intelligence Desk</span>
          </div>

        </motion.div>
      </main>

      {/* Page Footer */}
      <footer className="py-6 border-t border-[#e0d8c7] bg-[#fbf9f4] text-center text-xs text-[#7a7060] font-typewriter">
        <p>© 2026 Pragati • Career Intelligence & Application Pipeline</p>
      </footer>

    </div>
  );
}

export default function SignInPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#f5f2eb] flex items-center justify-center font-serif text-sm text-[#554e42]">
        <Loader2 className="w-5 h-5 animate-spin mr-2" /> Loading Authentication Gateway...
      </div>
    }>
      <SignInContent />
    </Suspense>
  );
}
