'use client';

import { useState } from 'react';
import { useStore } from '@/store/useStore';
import { Dashboard } from '@/components/Dashboard';
import { PresentationEditor } from '@/components/PresentationEditor';
import { WizardModal } from '@/components/WizardModal';
import { Login } from '@/components/Login';
import type { Property } from '@/mockData';

export default function App() {
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const { isAuthenticated } = useStore();

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
