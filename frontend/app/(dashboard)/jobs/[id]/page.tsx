// Server Component — exports generateStaticParams for static export
// All interactive logic lives in JobDetailClient.tsx

import JobDetailClient from './JobDetailClient'

// Tell Next.js which job IDs to pre-render at build time
export async function generateStaticParams() {
  return [
    { id: 'job-001' },
    { id: 'job-002' },
    { id: 'job-003' },
    { id: 'sim1' },
    { id: 'sim2' },
    { id: 'sim3' },
  ]
}

export default function JobDetailPage({ params }: { params: { id: string } }) {
  return <JobDetailClient id={params.id} />
}
