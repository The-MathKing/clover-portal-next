import { notFound } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import ReportClient from './ReportClient';
import PrintButton from './PrintButton';

export default async function ReportPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('geo_reports')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error || !data) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-neutral-200 font-sans">
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          body, html { background-color: #0a0a0a !important; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
          @page { margin: 0; }
        }
      `}} />
      <div className="max-w-4xl mx-auto py-12 px-6 print:max-w-none print:w-full print:py-12 print:px-12">
        {/* Branded Header */}
        <div className="border-b-4 border-emerald-500 pb-8 mb-12 flex flex-col md:flex-row md:justify-between md:items-end gap-6">
          <div>
            <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight mb-2">GEO Action Plan</h1>
            <p className="text-xl text-emerald-400 font-medium">{data.business_name}</p>
            <p className="text-sm text-neutral-400 mt-1">{data.industry}</p>
          </div>
          <div className="md:text-right print:text-right">
            <p className="text-2xl font-black text-white tracking-tighter">CLOVRR</p>
            <p className="text-xs text-emerald-500 mt-1 font-bold tracking-widest uppercase">Live AI Audit</p>
            <div className="mt-4 print:hidden">
              <PrintButton />
            </div>
          </div>
        </div>

        {/* Dynamic Charts via Client Component */}
        <ReportClient 
          businessName={data.business_name}
          currentScores={data.current_scores} 
          projectedGrowth={data.projected_growth} 
          competitorGrowth={data.competitor_growth} 
        />

        {/* Markdown Content via Client Component */}
        <div className="mt-12 bg-neutral-900 border border-neutral-800 rounded-3xl p-8 shadow-xl print:mt-8 print:bg-transparent print:border-none print:shadow-none print:rounded-none print:p-0">
          <ReportClient markdownReport={data.markdown_report} />
        </div>

        {/* Footer */}
        <div className="mt-16 pt-8 border-t border-neutral-800 text-center">
          <p className="text-sm text-neutral-500 font-semibold">Ready to dominate AI search?</p>
          <a href="https://clovrr.net" className="text-sm text-emerald-500 hover:text-emerald-400 mt-1 transition-colors">Visit www.clovrr.net to get started.</a>
        </div>
      </div>
    </div>
  );
}
