import React from 'react'

const appointments = [
  {
    id: 'apt-001',
    doctor: 'Dr. Emily White',
    date: 'Oct 26, 2024',
    time: '10:00 AM',
    location: 'City General Hospital'
  },
  {
    id: 'apt-002',
    doctor: 'Dr. James Carter',
    date: 'Nov 15, 2024',
    time: '02:30 PM',
    location: 'Urban Medical Center'
  }
]

const ViewAppointments: React.FC = () => {
  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h2 className="text-3xl font-semibold text-[#1b2b4b]">My Appointments</h2>
        <p className="text-sm text-[#6f7d95]">Review your upcoming visits and manage your schedule efficiently.</p>
      </header>

      <div className="space-y-4">
        {appointments.map((appointment) => (
          <article
            key={appointment.id}
            className="flex flex-col gap-2 rounded-3xl border border-[#e1eaf5] bg-white px-6 py-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h3 className="text-lg font-semibold text-[#1b2b4b]">{appointment.doctor}</h3>
              <span className="rounded-full bg-[#eef4ff] px-3 py-1 text-xs font-semibold text-[#2a6bb7]">{appointment.location}</span>
            </div>
            <p className="text-sm text-[#1f2a44]">{appointment.date} at {appointment.time}</p>
            <div className="flex flex-wrap gap-3 text-sm">
              <button type="button" className="rounded-2xl border border-[#2a6bb7] px-4 py-2 text-sm font-semibold text-[#2a6bb7] transition hover:bg-[#2a6bb7] hover:text-white">
                Reschedule
              </button>
              <button type="button" className="rounded-2xl border border-transparent px-4 py-2 text-sm font-semibold text-[#c0392b] transition hover:bg-[#f9e9e9]">
                Cancel Appointment
              </button>
            </div>
          </article>
        ))}

        {appointments.length === 0 && (
          <div className="rounded-3xl border border-dashed border-[#d8e3f3] bg-white p-10 text-center text-sm text-[#6f7d95]">
            You have no upcoming appointments yet.
          </div>
        )}
      </div>
    </div>
  )
}

export default ViewAppointments
