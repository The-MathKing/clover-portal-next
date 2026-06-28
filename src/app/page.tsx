'use client';
import { LandingPage } from '@/components/LandingPage';
import { Login } from '@/components/Login';
import { useStore } from '@/store/useStore';

export default function App() {
  const { showAuthModal } = useStore();

  return (
    <>
      <LandingPage />
      {showAuthModal && <Login />}
    </>
  );
}
