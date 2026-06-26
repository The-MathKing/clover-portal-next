'use client';
import React, { useEffect } from 'react';
import { ArrowLeft, Film, HelpCircle, Info } from 'lucide-react';
import { VideoPlayer } from './VideoPlayer';
import { ExportModal } from './ExportModal';
import { WalkthroughJobStatus } from './WalkthroughJobStatus';
import { ProductTour } from './ProductTour';
import type { Property } from '../mockData';
import { useStore } from '../store/useStore';

interface PresentationEditorProps {
  property: Property;
  onBack: () => void;
}

export const PresentationEditor: React.FC<PresentationEditorProps> = ({ property, onBack }) => {
  const { 
    setPropertyDetails, setImages, setGeneratedScript, setExporting, 
    setActivePropertyId, subscriptionTier, setTourActive,
    engineMode, setGenerativeJobId, generativeJobId, images 
  } = useStore();

  useEffect(() => {
    setActivePropertyId(property.id);

    // Populate store with the selected property details
    setPropertyDetails({
      address: property.address,
      price: property.price,
      beds: property.beds,
      baths: property.baths,
      sqft: property.sqft,
      description: property.description,
      features: property.features,
    });

    // Populate timeline with property images if available, else fallback to default high-quality unsplash property images
    if (property.images && property.images.length > 0) {
      setImages(property.images);
    } else {
      const sampleImages = [
        { id: '1', url: property.coverImage || property.cover_image || '' },
        { id: '2', url: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80' },
        { id: '3', url: 'https://images.unsplash.com/photo-1513584684374-8bab748fbf90?auto=format&fit=crop&w=800&q=80' },
        { id: '4', url: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=800&q=80' },
      ];
      setImages(sampleImages);
    }

    // Populate script if exists
    if (property.script) {
      setGeneratedScript(property.script);
    } else {
      setGeneratedScript('');
    }
  }, [property]);

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col font-sans">
      {/* Editor Header */}
      <header className="border-b border-neutral-900 bg-neutral-950/80 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-4 max-w-full">
            <button
              onClick={onBack}
              className="p-2 bg-neutral-900 border border-neutral-850 hover:bg-neutral-800 text-neutral-350 hover:text-white rounded-lg transition-all"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="min-w-0">
              <span className="text-[10px] sm:text-xs font-semibold block text-neutral-500 tracking-wider uppercase truncate">
                Presentation Studio
              </span>
              <h2 className="text-base sm:text-lg font-bold font-heading text-white truncate">
                {property.address}
              </h2>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={() => setTourActive(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-neutral-900 border border-neutral-800 hover:bg-neutral-800 text-neutral-300 hover:text-white font-medium transition-all"
            >
              <Info className="w-4 h-4" />
              <span className="hidden sm:inline">Tour Studio</span>
            </button>
            <button
              onClick={() => {
              if (engineMode === 'ai-video') {
                const formData = new FormData();
                formData.append('propertyId', property.id);
                images.forEach((img) => {
                  formData.append('images', img.url);
                });
                
                fetch('/api/walkthrough/create', {
                  method: 'POST',
                  body: formData,
                })
                .then(res => {
                  if (!res.ok) throw new Error('Failed to start generative job');
                  return res.json();
                })
                .then(data => {
                  setGenerativeJobId(data.jobId);
                })
                .catch(err => {
                  console.error(err);
                  alert('Failed to start AI Video export.');
                });
              } else {
                setExporting(true);
              }
            }}
            data-tour="export-button"
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-semibold shadow-lg shadow-emerald-950/30 transition-all hover:scale-[1.02]"
          >
            <Film className="w-4 h-4 shrink-0" />
            <span className="hidden sm:inline">Export</span>
          </button>
          </div>
        </div>
      </header>

      {/* Editor Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-4 sm:py-8">
        {/* Canvas Player HUD (Takes full width now) */}
        <div className="w-full space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-bold font-heading text-white">Cinematic Preview</h3>
            <div className="flex items-center gap-1.5 text-xs text-neutral-400">
              <HelpCircle className="w-3.5 h-3.5" />
              Pan & Zoom renders inside browser canvas
            </div>
          </div>
          <VideoPlayer />
        </div>
      </main>

      {/* Export Overlay Modal */}
      <ExportModal />

      {/* Generative AI Video Progress Modal */}
      {generativeJobId && (
        <WalkthroughJobStatus 
          jobId={generativeJobId} 
          onComplete={(url) => {
            setGenerativeJobId(null);
            alert('Your AI video is ready! URL: ' + url);
          }}
        />
      )}

      {/* Interactive Product Tour (NEW) */}
      <ProductTour />
    </div>
  );
};
