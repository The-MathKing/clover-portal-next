'use client';
import React, { useState } from 'react';
import { Clover, Lock, ArrowRight, Video, X } from 'lucide-react';
import { useStore } from '../store/useStore';
import { createClient } from '@/utils/supabase/client';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const { setShowAuthModal } = useStore();
  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg('');
    
    if (isSignUp) {
      const { error } = await supabase.auth.signUp({
        email,
        password,
      });
      if (error) setErrorMsg(error.message);
      else {
        // usually wait for email confirmation, but for now we'll just log them in if it auto-confirms or show a message
        alert("Sign up successful! You can now sign in.");
        setIsSignUp(false);
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        setErrorMsg(error.message);
        setIsLoading(false);
      }
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
      },
    });
    if (error) {
      setErrorMsg(error.message);
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full relative z-10">
      {/* Background Ornaments */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-[500px] bg-emerald-500/10 blur-[120px] rounded-full pointer-events-none" />
      
      {/* Login Card */}
      <div className="bg-neutral-900/90 backdrop-blur-xl border border-neutral-800 rounded-2xl shadow-2xl p-8 relative">
        <button 
          onClick={() => setShowAuthModal(false)}
          className="absolute top-4 right-4 p-2 text-neutral-400 hover:text-white bg-neutral-800/50 hover:bg-neutral-800 rounded-full transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Logo Section */}
        <div className="flex flex-col items-center mb-10 mt-2">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-emerald-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-900/50">
              <Clover className="w-8 h-8 text-white" />
            </div>
            <span className="text-3xl font-bold font-heading tracking-tight text-white">Clover</span>
          </div>
          <h2 className="text-lg text-neutral-400 font-medium">Cinematic Home Tour Generator</h2>
        </div>

        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-white mb-2">{isSignUp ? 'Create Account' : 'Welcome Back'}</h1>
            <p className="text-sm text-neutral-500">Sign in to create beautiful video tours and sell your home faster.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2">
                Your Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full bg-neutral-950 border border-neutral-800 focus:border-emerald-500 rounded-xl px-4 py-3 text-sm text-neutral-200 focus:outline-none transition-colors"
              />
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                  Password
                </label>
                <a href="#" className="text-xs text-emerald-500 hover:text-emerald-400 font-medium transition-colors">
                  Forgot?
                </a>
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full bg-neutral-950 border border-neutral-800 focus:border-emerald-500 rounded-xl pl-11 pr-4 py-3 text-sm text-neutral-200 focus:outline-none transition-colors"
                />
              </div>
            </div>

            {errorMsg && <p className="text-sm text-red-500">{errorMsg}</p>}

            <button
              type="submit"
              disabled={isLoading || !email || !password}
              className="w-full flex items-center justify-center gap-2 py-3.5 mt-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50 text-white font-semibold rounded-xl shadow-lg shadow-emerald-950/20 transition-all active:scale-[0.98]"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  {isSignUp ? 'Create Account' : 'Sign In to Dashboard'}
                </>
              )}
            </button>

            <div className="text-center mt-4">
              <button
                type="button"
                onClick={() => setIsSignUp(!isSignUp)}
                className="text-sm text-emerald-500 hover:text-emerald-400 transition-colors"
              >
                {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
              </button>
            </div>
            
            <div className="relative mt-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-neutral-800"></div>
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-neutral-900 px-2 text-neutral-500 uppercase tracking-wider">Or continue with</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-3 py-3 mt-4 bg-white hover:bg-neutral-100 text-black font-semibold rounded-xl transition-colors disabled:opacity-50"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Google
            </button>
          </form>
        </div>

        {/* Footer features */}
        <div className="mt-8 flex justify-center gap-6 text-sm text-neutral-500 font-medium">
          <div className="flex items-center gap-2">
            <Video className="w-4 h-4" />
            <span>Cinematic Render Engine</span>
        </div>
      </div>
    </div>
  );
};
