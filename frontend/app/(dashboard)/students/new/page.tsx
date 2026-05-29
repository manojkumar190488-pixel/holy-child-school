'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, ArrowRight, Check, User, GraduationCap, Users, Heart } from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

type Step = 0 | 1 | 2 | 3

const STEPS = [
  { label: 'Personal', icon: <User className="h-4 w-4" /> },
  { label: 'Academic', icon: <GraduationCap className="h-4 w-4" /> },
  { label: 'Parent', icon: <Users className="h-4 w-4" /> },
  { label: 'Health', icon: <Heart className="h-4 w-4" /> },
]

const CLASSES = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12']
const SECTIONS = ['A', 'B', 'C']
const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-']
const CATEGORIES = ['General', 'OBC', 'SC', 'ST', 'EWS']

interface FormData {
  // Personal
  name: string; gender: string; dateOfBirth: string; religion: string; category: string; aadhaar: string;
  // Academic
  class: string; section: string; admissionDate: string; previousSchool: string;
  // Parent
  fatherName: string; motherName: string; guardianName: string; parentPhone: string; parentEmail: string; parentOccupation: string; address: string;
  // Health
  bloodGroup: string; allergies: string; medicalConditions: string; height: string; weight: string;
}

const EMPTY: FormData = {
  name: '', gender: 'Male', dateOfBirth: '', religion: '', category: 'General', aadhaar: '',
  class: '1', section: 'A', admissionDate: new Date().toISOString().split('T')[0], previousSchool: '',
  fatherName: '', motherName: '', guardianName: '', parentPhone: '', parentEmail: '', parentOccupation: '', address: '',
  bloodGroup: 'O+', allergies: '', medicalConditions: '', height: '', weight: '',
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-semibold text-muted-foreground">{label}{required && <span className="text-red-500 ml-0.5">*</span>}</label>
      {children}
    </div>
  )
}

const inputCls = 'w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground placeholder-muted-foreground focus:border-gold-500 focus:outline-none focus:ring-2 focus:ring-gold-500/20'
const selectCls = inputCls + ' appearance-none cursor-pointer'

export default function NewStudentPage() {
  const router = useRouter()
  const [step, setStep] = useState<Step>(0)
  const [form, setForm] = useState<FormData>(EMPTY)

  const set = (k: keyof FormData, v: string) => setForm(p => ({ ...p, [k]: v }))

  const handleSubmit = async () => {
    await new Promise(r => setTimeout(r, 800))
    toast.success('Student admitted successfully!', { description: `${form.name} has been enrolled in Class ${form.class}-${form.section}` })
    router.push('/students')
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/students" className="rounded-lg border border-border p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h2 className="text-xl font-extrabold text-foreground">New Student Admission</h2>
          <p className="text-sm text-muted-foreground">Fill in the details across all steps</p>
        </div>
      </div>

      {/* Step Indicator */}
      <div className="flex items-center gap-0">
        {STEPS.map((s, i) => (
          <div key={s.label} className="flex items-center flex-1 last:flex-none">
            <button onClick={() => i < step && setStep(i as Step)} className="flex flex-col items-center gap-1 min-w-[60px]">
              <div className={cn('flex h-9 w-9 items-center justify-center rounded-full border-2 transition-all', i < step ? 'bg-emerald-500 border-emerald-500 text-white' : i === step ? 'border-gold-500 bg-gold-50 text-gold-600 dark:bg-gold-900/20 dark:text-gold-400' : 'border-border bg-muted text-muted-foreground')}>
                {i < step ? <Check className="h-4 w-4" /> : s.icon}
              </div>
              <span className={cn('text-[10px] font-semibold', i === step ? 'text-gold-600 dark:text-gold-400' : 'text-muted-foreground')}>{s.label}</span>
            </button>
            {i < STEPS.length - 1 && <div className={cn('flex-1 h-0.5 mb-4 transition-colors', i < step ? 'bg-emerald-500' : 'bg-border')} />}
          </div>
        ))}
      </div>

      {/* Form */}
      <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.25 }}
        className="rounded-xl border border-border bg-card p-6">

        {step === 0 && (
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Field label="Full Name" required>
                <input className={inputCls} placeholder="Student's full name" value={form.name} onChange={e => set('name', e.target.value)} />
              </Field>
            </div>
            <Field label="Gender" required>
              <select className={selectCls} value={form.gender} onChange={e => set('gender', e.target.value)}>
                {['Male', 'Female', 'Other'].map(g => <option key={g}>{g}</option>)}
              </select>
            </Field>
            <Field label="Date of Birth" required>
              <input type="date" className={inputCls} value={form.dateOfBirth} onChange={e => set('dateOfBirth', e.target.value)} />
            </Field>
            <Field label="Religion">
              <input className={inputCls} placeholder="e.g. Hindu, Muslim, Christian" value={form.religion} onChange={e => set('religion', e.target.value)} />
            </Field>
            <Field label="Category">
              <select className={selectCls} value={form.category} onChange={e => set('category', e.target.value)}>
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </Field>
            <div className="sm:col-span-2">
              <Field label="Aadhaar Number">
                <input className={inputCls} placeholder="12-digit Aadhaar (optional)" maxLength={12} value={form.aadhaar} onChange={e => set('aadhaar', e.target.value.replace(/\D/g, ''))} />
              </Field>
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Class" required>
              <select className={selectCls} value={form.class} onChange={e => set('class', e.target.value)}>
                {CLASSES.map(c => <option key={c}>Class {c}</option>)}
              </select>
            </Field>
            <Field label="Section" required>
              <select className={selectCls} value={form.section} onChange={e => set('section', e.target.value)}>
                {SECTIONS.map(s => <option key={s}>Section {s}</option>)}
              </select>
            </Field>
            <Field label="Admission Date" required>
              <input type="date" className={inputCls} value={form.admissionDate} onChange={e => set('admissionDate', e.target.value)} />
            </Field>
            <Field label="Previous School">
              <input className={inputCls} placeholder="Name of previous school" value={form.previousSchool} onChange={e => set('previousSchool', e.target.value)} />
            </Field>
          </div>
        )}

        {step === 2 && (
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Father's Name" required>
              <input className={inputCls} placeholder="Father's full name" value={form.fatherName} onChange={e => set('fatherName', e.target.value)} />
            </Field>
            <Field label="Mother's Name">
              <input className={inputCls} placeholder="Mother's full name" value={form.motherName} onChange={e => set('motherName', e.target.value)} />
            </Field>
            <Field label="Contact Number" required>
              <input className={inputCls} placeholder="10-digit mobile number" maxLength={10} value={form.parentPhone} onChange={e => set('parentPhone', e.target.value.replace(/\D/g, ''))} />
            </Field>
            <Field label="Email Address">
              <input type="email" className={inputCls} placeholder="parent@email.com" value={form.parentEmail} onChange={e => set('parentEmail', e.target.value)} />
            </Field>
            <Field label="Occupation">
              <input className={inputCls} placeholder="Parent's occupation" value={form.parentOccupation} onChange={e => set('parentOccupation', e.target.value)} />
            </Field>
            <div className="sm:col-span-2">
              <Field label="Residential Address" required>
                <textarea className={inputCls + ' resize-none h-20'} placeholder="Full residential address" value={form.address} onChange={e => set('address', e.target.value)} />
              </Field>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Blood Group">
              <select className={selectCls} value={form.bloodGroup} onChange={e => set('bloodGroup', e.target.value)}>
                {BLOOD_GROUPS.map(b => <option key={b}>{b}</option>)}
              </select>
            </Field>
            <Field label="Height (cm)">
              <input type="number" className={inputCls} placeholder="e.g. 145" value={form.height} onChange={e => set('height', e.target.value)} />
            </Field>
            <Field label="Weight (kg)">
              <input type="number" className={inputCls} placeholder="e.g. 40" value={form.weight} onChange={e => set('weight', e.target.value)} />
            </Field>
            <Field label="Allergies">
              <input className={inputCls} placeholder="e.g. Peanuts, Dust (comma separated)" value={form.allergies} onChange={e => set('allergies', e.target.value)} />
            </Field>
            <div className="sm:col-span-2">
              <Field label="Medical Conditions">
                <textarea className={inputCls + ' resize-none h-16'} placeholder="Any known medical conditions (leave blank if none)" value={form.medicalConditions} onChange={e => set('medicalConditions', e.target.value)} />
              </Field>
            </div>
          </div>
        )}
      </motion.div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setStep(p => Math.max(0, p - 1) as Step)}
          disabled={step === 0}
          className="flex items-center gap-2 rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Previous
        </button>

        {step < 3 ? (
          <button
            onClick={() => setStep(p => Math.min(3, p + 1) as Step)}
            className="flex items-center gap-2 rounded-lg bg-gold-500 px-4 py-2.5 text-sm font-bold text-navy-900 hover:bg-gold-400 transition-colors"
          >
            Next <ArrowRight className="h-4 w-4" />
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={!form.name || !form.fatherName || !form.parentPhone}
            className="flex items-center gap-2 rounded-lg bg-emerald-500 px-6 py-2.5 text-sm font-bold text-white hover:bg-emerald-400 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <Check className="h-4 w-4" /> Submit Admission
          </button>
        )}
      </div>
    </div>
  )
}
