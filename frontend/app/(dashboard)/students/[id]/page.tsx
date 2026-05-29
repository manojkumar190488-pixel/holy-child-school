import { STUDENTS } from '@/lib/mock-school-data'
import StudentProfileClient from './StudentProfileClient'

export function generateStaticParams() {
  return STUDENTS.map(s => ({ id: s.id }))
}

export default function StudentProfilePage({ params }: { params: { id: string } }) {
  return <StudentProfileClient id={params.id} />
}
