import React from 'react'
import { useNavigate } from 'react-router-dom'
import { BellRing, Calendar, CalendarCheck2, ClipboardList, FileText, FlaskConical, Pill } from 'lucide-react'

const actionCards = [
  {
    title: 'Make New Appointment',
    description: 'Schedule a visit with your preferred doctor or specialist from various hospitals.',
    actionLabel: 'Schedule Now',
    icon: CalendarCheck2,
    variant: 'primary' as const
  },
  {
    title: 'My Appointments',
    description: 'Review your upcoming and past appointments, and manage your schedule efficiently.',
    actionLabel: 'View Details',
    icon: ClipboardList,
    variant: 'secondary' as const
  },
  {
    title: 'Medical Records',
    description: 'Access your comprehensive health history, lab results, and prescriptions securely.',
    actionLabel: 'View Details',
    icon: FileText,
    variant: 'secondary' as const
  }
]

const recentActivity = [
  {
    label: 'Appointment with Dr. Emily White on Oct 26, 2024 at 10:00 AM.',
    icon: Calendar
  },
  {
    label: 'New lab results available: Blood Test - Oct 20, 2024.',
    icon: FlaskConical
  },
  {
    label: 'Prescription refill for Insulin is ready for pickup.',
    icon: Pill
  },
  {
    label: 'Your next check-up reminder for Nov 15, 2024.',
    icon: BellRing
  }
]

const Dashboard: React.FC = () => {
  const navigate = useNavigate()
  return (
    <div className="space-y-8">
      <header className="space-y-1">
        <h2 className="text-3xl font-semibold text-[#1b2b4b]">Welcome, Chamodi Dilki!</h2>
        <p className="text-sm text-[#6f7d95]">
          Your health journey starts here. Quickly access your medical information and manage your appointments.
        </p>
      </header>

      <section className="grid gap-6 md:grid-cols-3">
        {actionCards.map(({ title, description, actionLabel, icon: Icon, variant }, idx) => {
          // Button click handler for navigation
          let handleClick = () => {};
          if (idx === 0) handleClick = () => navigate('/appointments/new'); // Make New Appointment
          if (idx === 1) handleClick = () => navigate('/appointments'); // My Appointments
          if (idx === 2) handleClick = () => navigate('/medical-records'); // Medical Records
          return (
            <article
              key={title}
              className="flex flex-col rounded-3xl border border-[#e1eaf5] bg-white p-6 text-center shadow-sm transition hover:shadow-md"
            >
              <div className="mx-auto mb-5 flex h-28 w-28 items-center justify-center rounded-2xl bg-[#eef4ff] text-[#2a6bb7]">
                <Icon className="h-12 w-12" strokeWidth={1.6} />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-[#1b2b4b]">{title}</h3>
              <p className="mb-6 text-sm text-[#6f7d95]">{description}</p>
              <button
                type="button"
                className={`mt-auto rounded-xl px-4 py-2 text-sm font-semibold transition ${
                  variant === 'primary'
                    ? 'border border-[#2a6bb7] bg-[#2a6bb7] text-white hover:bg-[#1f4f8d]'
                    : 'border border-[#d8e3f3] bg-white text-[#1b2b4b] hover:border-[#2a6bb7] hover:text-[#2a6bb7]'
                }`}
                onClick={handleClick}
              >
                {actionLabel}
              </button>
            </article>
          )
        })}
      </section>

      <section className="rounded-3xl border border-[#e1eaf5] bg-white p-6">
        <h3 className="mb-4 text-lg font-semibold text-[#1b2b4b]">Recent Activity</h3>
        <ul className="space-y-2 text-sm text-[#1f2a44]">
          {recentActivity.map(({ label, icon: Icon }) => (
            <li key={label} className="flex items-start gap-3 rounded-2xl border border-transparent px-4 py-3 hover:border-[#d8e3f3]">
              <span className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-full bg-[#eef4ff] text-[#2a6bb7]">
                <Icon className="h-4 w-4" strokeWidth={1.6} />
              </span>
              <span>{label}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}

export default Dashboard
