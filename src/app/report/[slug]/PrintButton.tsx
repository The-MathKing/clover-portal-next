'use client';

import React from 'react';
import { Download } from 'lucide-react';

export default function PrintButton() {
  return (
    <button 
      onClick={() => window.print()}
      className="print:hidden bg-emerald-500 hover:bg-emerald-400 text-black font-semibold py-2.5 px-5 rounded-full flex items-center gap-2 transition-colors shadow-lg"
    >
      <Download className="w-4 h-4" />
      Download as PDF
    </button>
  );
}
