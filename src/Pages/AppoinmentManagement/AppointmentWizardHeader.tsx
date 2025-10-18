import React, { useMemo } from 'react'
import { useLocation } from 'react-router-dom'
import {
  Building2,
  ClipboardCheck,
  CalendarClock,
  CheckCircle2,
  Stethoscope,
  UserSearch
} from 'lucide-react'
import { useAppointmentBooking } from '../../contexts/AppointmentBookingContext'
import type { AppointmentBookingState } from '../../types/appointment'

type StepStatus = 'pending' | 'current' | 'complete'

type StepDefinition = {
  id: string
  label: string
  description: string
  match: (pathname: string) => boolean
  isComplete: (state: AppointmentBookingState) => boolean
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>
}

type ComputedStep = StepDefinition & { status: StepStatus }

const stepDefinitions: StepDefinition[] = [
  {
    id: 'hospital',
    label: 'Select Hospital',
    description:
      'Choose the hospital closest to you or filter by speciality to find the care you need.',
    match: (pathname) => /^\/appointments\/new\/?$/i.test(pathname),
    isComplete: (state) => Boolean(state.hospital),
    icon: Building2
  },
  {
    id: 'department',
    label: 'Select Service & Department',
    description:
      'Review available departments at your chosen hospital and pick the service that best matches your needs.',
    match: (pathname) => /\/appointments\/new\/[^/]+\/services\/?$/i.test(pathname),
    isComplete: (state) => Boolean(state.department),
    icon: ClipboardCheck
  },
  {
    id: 'doctor',
    label: 'Select Your Doctor',
    description:
      'Compare specialists, review their credentials, and select the provider who fits your preferences.',
    match: (pathname) => /\/appointments\/new\/[^/]+\/services\/[^/]+\/doctors\/?$/i.test(pathname),
    isComplete: (state) => Boolean(state.doctor),
    icon: UserSearch
  },
  {
    id: 'slot',
    label: 'Choose a Time Slot',
    description:
      'Browse available appointment times and pick the slot that works best for your schedule.',
    match: (pathname) => /\/appointments\/new\/[^/]+\/services\/[^/]+\/slots\/?$/i.test(pathname),
    isComplete: (state) => Boolean(state.slot),
    icon: CalendarClock
  },
  {
    id: 'confirm',
    label: 'Confirm & Share Details',
    description:
      'Add final context for your visit, confirm insurance preferences, and lock in your appointment.',
    match: (pathname) => /\/appointments\/new\/[^/]+\/services\/[^/]+\/confirm\/?$/i.test(pathname),
    isComplete: (state) => Boolean(state.slot),
    icon: Stethoscope
  },
  {
    id: 'success',
    label: 'Appointment Confirmed',
    description:
      'Review the confirmation details and keep your QR code handy for a seamless check-in experience.',
    match: (pathname) => /\/appointments\/new\/[^/]+\/services\/[^/]+\/success\/?$/i.test(pathname),
    isComplete: () => false,
    icon: CheckCircle2
  }
]

const computeSteps = (pathname: string, state: AppointmentBookingState): ComputedStep[] => {
  const activeIndex = stepDefinitions.findIndex((definition) => definition.match(pathname))
  const resolvedActiveIndex = activeIndex >= 0 ? activeIndex : 0

  return stepDefinitions.map((definition, index) => {
    let status: StepStatus = 'pending'

    if (index < resolvedActiveIndex && definition.isComplete(state)) {
      status = 'complete'
    } else if (index === resolvedActiveIndex) {
      status = 'current'
    }

    return {
      ...definition,
      status
    }
  })
}

type AppointmentWizardHeaderProps = {
  completed?: boolean
  overrideProgress?: number | null
}

const AppointmentWizardHeader: React.FC<AppointmentWizardHeaderProps> = ({ completed = false, overrideProgress = null }) => {
  const location = useLocation()
  const { state: bookingState } = useAppointmentBooking()

  const steps = useMemo(() => computeSteps(location.pathname, bookingState), [location.pathname, bookingState])
  const activeStep = useMemo(() => steps.find((s) => s.status === 'current') ?? steps[0], [steps])
  const completedCount = useMemo(() => steps.filter((s) => s.status === 'complete').length, [steps])

  const progress = useMemo(() => {
    if (overrideProgress !== null && typeof overrideProgress === 'number') {
      return Math.min(100, Math.max(0, Math.round(overrideProgress)))
    }

    if (completed) {
      return 100
    }

    const raw = ((completedCount + 0.5) / steps.length) * 100
    return Math.min(100, Math.max(0, Math.round(raw)))
  }, [completedCount, steps.length, completed, overrideProgress])

  const ActiveIcon = activeStep.icon

  return (
    <section className="space-y-6 bg-white p-6 rounded-none shadow-none">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#7a89a8]">Appointment Flow</p>
          <div className="flex items-start gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-[18px] bg-[#eef3ff] text-[#1f4f8a]">
              <ActiveIcon className="h-5 w-5" strokeWidth={1.6} />
            </span>
            <div>
              <h2 className="text-xl font-semibold text-[#142449]">{activeStep.label}</h2>
              <p className="text-sm text-[#6f7d95] mt-1">{activeStep.description}</p>
            </div>
          </div>
        </div>
        <div className="w-full max-w-sm space-y-3">
          <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-[0.22em] text-[#7a89a8]">
            <span>Progress</span>
            <span>{progress}%</span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-[#e8ecf9]">
            <div
              className="h-1.5 rounded-full bg-gradient-to-r from-[#2a6bb7] via-[#4d8fff] to-[#74d0ff] transition-[width] duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {steps.map((step, index) => (
          <div
            key={step.id}
            className={`flex items-center gap-2 rounded-[999px] border px-3 py-2 text-xs font-medium transition ${
              {
                complete: 'border-transparent bg-[#ebf2ff] text-[#1f3f77]',
                current: 'border-[#ffd7b0] bg-[#fff3e3] text-[#a05812]',
                pending: 'border-transparent bg-[#f6f8ff] text-[#8a98b7]'
              }[step.status]
            }`}
          >
            <span className="flex h-6 w-6 items-center justify-center rounded-full border border-current text-[11px] font-semibold">
              {step.status === 'complete' ? '✓' : index + 1}
            </span>
            <span className="truncate">{step.label}</span>
          </div>
        ))}
      </div>
    </section>
  )
}

export default AppointmentWizardHeader
