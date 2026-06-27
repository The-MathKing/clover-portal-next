'use client';

import { useState, useEffect } from 'react';
import { useStore } from '@/store/useStore';
import { Dashboard } from '@/components/Dashboard';
import { PresentationEditor } from '@/components/PresentationEditor';
import { WizardModal } from '@/components/WizardModal';
import { Login } from '@/components/Login';
import { LandingPage } from '@/components/LandingPage';
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
    setGenerationsRemaining,
    setProperties,
    showAuthModal,
    setShowAuthModal
  } = useStore();

  useEffect(() => {
    const supabase = createClient();
    let isMounted = true;
    let lastProcessedUserId: string | null | undefined = undefined;

    // Function to load user data safely
    const loadProfile = async (userId: string) => {
      console.log('🔍 [loadProfile] Fetching data for:', userId);
      
      const withTimeout = <T,>(promise: PromiseLike<T>, ms: number = 8000) => {
        return Promise.race([
          promise,
          new Promise<never>((_, reject) => setTimeout(() => reject(new Error('Timeout')), ms))
        ]);
      };

      try {
        const profilePromise = withTimeout(
          supabase
            .from('profiles')
            .select('subscription_tier, generations_remaining')
            .eq('id', userId)
            .single()
        );

        const propertiesPromise = withTimeout(
          supabase
            .from('properties')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
        );

        const [profileResult, propertiesResult] = await Promise.allSettled([profilePromise, propertiesPromise]);

        // Handle Profile Result
        if (profileResult.status === 'fulfilled') {
          const { data: profileData, error: profileError } = profileResult.value;
          if (profileError) {
            console.warn('⚠️ [loadProfile] Profile query error:', profileError.message);
            if (isMounted) {
              setSubscriptionTier('free');
              setGenerationsRemaining(0);
            }
          } else if (profileData) {
            console.log('🔍 [loadProfile] Profile loaded:', profileData.subscription_tier);
            if (isMounted) {
              setSubscriptionTier((profileData.subscription_tier as any) || 'free');
              setGenerationsRemaining(profileData.generations_remaining ?? 0);
            }
          }
        } else {
          console.error('❌ [loadProfile] Profile query rejected/timed out:', profileResult.reason);
          if (isMounted) {
            setSubscriptionTier('free');
            setGenerationsRemaining(0);
          }
        }

        // Handle Properties Result
        if (propertiesResult.status === 'fulfilled') {
          const { data: propertiesData, error: propertiesError } = propertiesResult.value;
          if (propertiesError) {
            console.error('❌ [loadProfile] Properties query error:', propertiesError.message);
          } else if (propertiesData) {
            console.log(`🔍 [loadProfile] Loaded ${propertiesData.length} properties for user.`);
            if (isMounted) setProperties(propertiesData);
          }
        } else {
          console.error('❌ [loadProfile] Properties query rejected/timed out:', propertiesResult.reason);
        }
      } catch (err: any) {
        console.error('❌ [loadProfile] Unexpected error:', err.message || err);
      }
    };

    const handleAuthEvent = async (session: any, event: string) => {
      const newUserId = session?.user?.id || null;
      
      // Prevent redundant fetches for the same user if they are already fully loaded
      if (newUserId === lastProcessedUserId && event !== 'SIGNED_OUT') {
        if (isMounted) setIsInitializing(false);
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
  }, [setAuthenticated, setUserId, setUserEmail, setSubscriptionTier, setGenerationsRemaining, setProperties]);

  // Handle payment success redirect — refetch profile to pick up new generations
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('payment') === 'success' && isAuthenticated) {
      const supabase = createClient();
      const refetchProfile = async () => {
        const userId = useStore.getState().userId;
        if (!userId) return;
        // Small delay to let the webhook process
        await new Promise(r => setTimeout(r, 2000));
        const { data } = await supabase
          .from('profiles')
          .select('subscription_tier, generations_remaining')
          .eq('id', userId)
          .single();
        if (data) {
          setSubscriptionTier(data.subscription_tier as any);
          setGenerationsRemaining(data.generations_remaining ?? 0);
          console.log('💰 [Payment Success] Profile refreshed:', data);
        }
        // Clean URL
        window.history.replaceState({}, '', '/');
      };
      refetchProfile();
    }
  }, [isAuthenticated, setSubscriptionTier, setGenerationsRemaining]);

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
      <LandingPage />
    </>
  );
}
