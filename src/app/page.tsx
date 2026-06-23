'use client';

import { useState, useEffect } from 'react';
import { useStore } from '@/store/useStore';
import { Dashboard } from '@/components/Dashboard';
import { PresentationEditor } from '@/components/PresentationEditor';
import { WizardModal } from '@/components/WizardModal';
import { Login } from '@/components/Login';
import { createClient } from '@/utils/supabase/client';
import type { Property } from '@/mockData';

export default function App() {
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  
  const { 
    isAuthenticated, 
    setAuthenticated, 
    setUserId, 
    setUserEmail, 
    setSubscriptionTier 
  } = useStore();

  useEffect(() => {
    const supabase = createClient();
    
    // Function to load profile subscription tier
    const loadProfile = async (userId: string) => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('subscription_tier')
          .eq('id', userId)
          .single();
        if (data && data.subscription_tier) {
          setSubscriptionTier(data.subscription_tier as any);
        } else {
          setSubscriptionTier('free');
        }
      } catch (err) {
        console.error('Error fetching profile:', err);
        setSubscriptionTier('free');
      }
    };

    // Check current session
    const initAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setUserId(session.user.id);
        setUserEmail(session.user.email ?? '');
        setAuthenticated(true);
        await loadProfile(session.user.id);
      } else {
        setUserId(null);
        setUserEmail(null);
        setAuthenticated(false);
        setSubscriptionTier('free');
      }
      setIsInitializing(false);
    };

    initAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session) {
        setUserId(session.user.id);
        setUserEmail(session.user.email ?? '');
        setAuthenticated(true);
        await loadProfile(session.user.id);
      } else {
        setUserId(null);
        setUserEmail(null);
        setAuthenticated(false);
        setSubscriptionTier('free');
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [setAuthenticated, setUserId, setUserEmail, setSubscriptionTier]);

  if (isInitializing) {
    return (
      <div className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-neutral-400 text-sm font-semibold tracking-wider uppercase">Loading session...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Login />;
  }

  return (
    <>
      {selectedProperty ? (
        <PresentationEditor 
          property={selectedProperty} 
          onBack={() => setSelectedProperty(null)} 
        />
      ) : (
        <Dashboard onSelectProperty={setSelectedProperty} />
      )}
      
      {/* Global Wizard Modal */}
      <WizardModal />
    </>
  );
}
