// Server Component — exports generateStaticParams for static export
// All interactive logic lives in JobDetailClient.tsx

import JobDetailClient from './JobDetailClient'

// Tell Next.js which job IDs to pre-render at build time
export async function generateStaticParams() {
  return [
    // Legacy IDs
    { id: 'job-001' }, { id: 'job-002' }, { id: 'job-003' },
    { id: 'sim1' }, { id: 'sim2' }, { id: 'sim3' },
    // Mock jobs dataset IDs
    { id: 'j-wb-001' }, { id: 'j-adb-001' }, { id: 'j-undp-001' }, { id: 'j-who-001' },
    { id: 'j-gates-001' }, { id: 'j-deloitte-001' }, { id: 'j-ey-001' }, { id: 'j-pwc-001' },
    { id: 'j-mckinsey-001' }, { id: 'j-giz-001' }, { id: 'j-usaid-001' }, { id: 'j-unicef-001' },
    { id: 'j-accenture-001' }, { id: 'j-meity-001' }, { id: 'j-wipro-001' }, { id: 'j-tcs-001' },
    { id: 'j-niti-001' }, { id: 'j-infosys-001' }, { id: 'j-lt-001' }, { id: 'j-nasscom-001' },
    { id: 'j-oracle-001' }, { id: 'j-msft-001' }, { id: 'j-ifc-001' }, { id: 'j-amazon-001' },
    { id: 'j-bcg-001' }, { id: 'j-kpmg-001' }, { id: 'j-nhm-001' }, { id: 'j-google-001' },
    { id: 'j-meta-001' }, { id: 'j-nic-001' }, { id: 'j-akdn-001' }, { id: 'j-path-001' },
    { id: 'j-iph-001' },
  ]
}

export default function JobDetailPage({ params }: { params: { id: string } }) {
  return <JobDetailClient id={params.id} />
}
