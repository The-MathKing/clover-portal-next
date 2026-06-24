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
    setSubscriptionTier,
    setProperties,
    showAuthModal,
    setShowAuthModal
  } = useStore();

  useEffect(() => {
    const supabase = createClient();
    let isMounted = true;
    let lastProcessedUserId: string | null = null;

    // Function to load profile subscription tier with a 10-second safety timeout
    const loadProfile = async (userId: string) => {
      console.log('🔍 [loadProfile] Fetching profile for:', userId);
      
      const timeoutPromise = new Promise<null>((_, reject) =>
        setTimeout(() => reject(new Error('Profile query timeout')), 10000)
      );

      try {
        const profilePromise = supabase
          .from('profiles')
          .select('subscription_tier')
          .eq('id', userId)
          .single();

        const propertiesPromise = supabase
          .from('properties')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });

        // Race the query against the timeout
        const result = await Promise.race([
          Promise.all([profilePromise, propertiesPromise]),
          timeoutPromise
        ]) as any;

        if (result) {
          const [profileRes, propertiesRes] = result;
          
          if (profileRes.error) {
            console.warn('⚠️ [loadProfile] query error (profiles table may not exist yet):', profileRes.error.message);
            if (isMounted) setSubscriptionTier('free');
          } else if (profileRes.data && profileRes.data.subscription_tier) {
            console.log('🔍 [loadProfile] Profile loaded successfully:', profileRes.data.subscription_tier);
            if (isMounted) setSubscriptionTier(profileRes.data.subscription_tier as any);
          } else {
            if (isMounted) setSubscriptionTier('free');
          }

          if (propertiesRes && !propertiesRes.error && propertiesRes.data) {
            console.log(`🔍 [loadProfile] Loaded ${propertiesRes.data.length} properties for user.`);
            if (isMounted) setProperties(propertiesRes.data);
          }
        } else {
          // Timeout occurred
          if (isMounted) setSubscriptionTier('free');
        }
      } catch (err: any) {
        console.error('❌ [loadProfile] Error or timeout fetching profile:', err.message || err);
        if (isMounted) setSubscriptionTier('free');
      }
    };

    const handleAuthEvent = async (session: any, event: string) => {
      const newUserId = session?.user?.id || null;
      
      // Prevent redundant fetches for the same user if they are already fully loaded
      if (newUserId === lastProcessedUserId && event !== 'SIGNED_OUT') {
        return;
      }
      lastProcessedUserId = newUserId;

      try {
        if (session) {
          if (isMounted) {
            setUserId(session.user.id);
            setUserEmail(session.user.email ?? '');
          }
          await loadProfile(session.user.id);
          if (isMounted) {
            setAuthenticated(true);
            setShowAuthModal(false); // Close modal on successful auth
          }
        } else {
          if (isMounted) {
            setUserId(null);
            setUserEmail(null);
            setAuthenticated(false);
            setSubscriptionTier('free');
            setProperties([]);
          }
        }
      } catch (err) {
        console.error('❌ [Auth] Error in auth flow:', err);
      } finally {
        if (isMounted) {
          setIsInitializing(false);
        }
      }
    };

    // Listen for auth changes (which will also fire initially on load)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('🔄 [Auth Change] Event detected:', event);
      if (event === 'INITIAL_SESSION' || event === 'SIGNED_IN' || event === 'SIGNED_OUT') {
        await handleAuthEvent(session, event);
      } else {
        if (session && isMounted) {
          setUserId(session.user.id);
          setUserEmail(session.user.email ?? '');
        }
      }
    });

    // Fallback timer: if auth has not initialized in 5 seconds, force loading to false
    const fallbackTimer = setTimeout(() => {
      if (isMounted) {
        console.warn('⚠️ [Auth] Init took too long. Forcing isInitializing to false.');
        setIsInitializing(false);
      }
    }, 5000);

    return () => {
      isMounted = false;
      subscription.unsubscribe();
      clearTimeout(fallbackTimer);
    };
  }, [setAuthenticated, setUserId, setUserEmail, setSubscriptionTier, setProperties]);

  if (isInitializing) {
    return (
      <div className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-neutral-400 text-sm font-semibold tracking-wider uppercase">Loading session...</p>
      </div>
    );
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

      {/* Global Auth Modal */}
      {(!isAuthenticated && showAuthModal) && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative w-full max-w-md animate-in fade-in zoom-in-95 duration-200">
            <Login />
          </div>
        </div>
      )}
    </>
  );
}
