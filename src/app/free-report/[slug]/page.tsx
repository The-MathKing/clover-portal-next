import { notFound } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import DashboardClient from './DashboardClient';

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

  let dashboardData;
  try {
    dashboardData = JSON.parse(data.markdown_report);
  } catch(e) {
    console.error('Failed to parse dashboard data', e);
    // If it's old legacy markdown, this will fail. We will pass null.
    dashboardData = null;
  }

  return <DashboardClient data={dashboardData} businessName={data.business_name} industry={data.industry} />;
}
