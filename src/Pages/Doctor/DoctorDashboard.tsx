import React from 'react';
import DoctorLayout from './DoctorLayout';
import dashboardData from '../../lib/data/doctorDashboard.json'
import appointments from '../../lib/data/appointments.json'
import patients from '../../lib/data/patients.json'
import notifications from '../../lib/data/notifications.json'

type Dashboard = {
  doctorId: string
  name: string
  role: string
  today: { date: string; appointmentsCount: number; checkedIn: number; consults: number }
  weekly: { appointments: number; avgWaitMin: number; surgeries: number }
  messages: number
  pendingLabs: number
}

type Appointment = { id: string; time: string; patientId: string; patientName: string; age: number; reason: string; status: string; room: string }
type Patient = { id: string; name: string; dob: string; age: number; recentVisit: string; primaryProblem: string }
type Notification = { id: string; type: string; title: string; summary: string; time: string }

const DoctorDashboard: React.FC = () => {
  const d = dashboardData as unknown as Dashboard
  return (
    <DoctorLayout>
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#203a6d]">{d.name}</h1>
            <div className="text-xs sm:text-sm text-gray-500">{d.role} • {d.today.date}</div>
          </div>
          <div className="flex flex-row sm:flex-row items-center gap-4 sm:gap-4 mt-2 sm:mt-0">
            <div className="text-right">
              <div className="text-xs sm:text-sm text-gray-500">Messages</div>
              <div className="text-base sm:text-lg font-semibold">{d.messages}</div>
            </div>
            <div className="text-right">
              <div className="text-xs sm:text-sm text-gray-500">Pending Labs</div>
              <div className="text-base sm:text-lg font-semibold">{d.pendingLabs}</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 mb-8">
          <div className="col-span-2 bg-white rounded-2xl shadow p-4 sm:p-6 border border-[#e5e7eb]">
            <h2 className="text-lg font-semibold mb-4">Today's Appointments</h2>
            <ul className="space-y-3">
              {appointments.map((a: Appointment) => (
                <li key={a.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-[#f8fbff] border border-transparent hover:border-[#eef3fc]">
                  <div>
                    <div className="text-sm font-medium">{a.time} — {a.patientName} <span className="text-xs text-gray-400">({a.age})</span></div>
                    <div className="text-xs text-gray-500">{a.reason}</div>
                  </div>
                  <div className="text-right">
                    <div className={`px-2 py-1 rounded-full text-xs ${a.status === 'Checked In' ? 'bg-green-100 text-green-700' : a.status === 'Cancelled' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-800'}`}>{a.status}</div>
                    <div className="text-xs text-gray-400">{a.room}</div>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-white rounded-2xl shadow p-4 sm:p-6 border border-[#e5e7eb]">
            <h2 className="text-lg font-semibold mb-4">Quick Stats</h2>
            <div className="grid grid-cols-2 gap-2 sm:gap-4">
              <div className="bg-[#f8fbff] p-2 sm:p-3 rounded">
                <div className="text-xs sm:text-sm text-gray-500">Today</div>
                <div className="text-lg sm:text-xl font-bold">{d.today.appointmentsCount}</div>
              </div>
              <div className="bg-[#fff7f6] p-2 sm:p-3 rounded">
                <div className="text-xs sm:text-sm text-gray-500">Checked In</div>
                <div className="text-lg sm:text-xl font-bold">{d.today.checkedIn}</div>
              </div>
              <div className="bg-[#fffaf7] p-2 sm:p-3 rounded">
                <div className="text-xs sm:text-sm text-gray-500">Weekly Appts</div>
                <div className="text-lg sm:text-xl font-bold">{d.weekly.appointments}</div>
              </div>
              <div className="bg-[#f4fff7] p-2 sm:p-3 rounded">
                <div className="text-xs sm:text-sm text-gray-500">Avg Wait (min)</div>
                <div className="text-lg sm:text-xl font-bold">{d.weekly.avgWaitMin}</div>
              </div>
            </div>

            <div className="mt-4">
              <h3 className="text-sm font-medium mb-2">Recent Patients</h3>
              <ul className="space-y-2">
                {patients.slice(0,4).map((p: Patient) => (
                  <li key={p.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between text-xs sm:text-sm">
                    <div>
                      <div className="font-medium text-sm sm:text-base">{p.name}</div>
                      <div className="text-xs text-gray-500">{p.primaryProblem} • last {p.recentVisit}</div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

  <div className="bg-white rounded-2xl shadow p-4 sm:p-6 border border-[#e5e7eb] mb-8">
          <h2 className="text-lg font-semibold mb-4">Notifications</h2>
          <ul className="space-y-2">
            {notifications.map((n: Notification) => {
              const ts = new Date(n.time)
              const isRecent = (Date.now() - ts.getTime()) < 24 * 60 * 60 * 1000
              return (
                <li key={n.id} className={`flex flex-col sm:flex-row items-start gap-2 sm:gap-3 p-2 sm:p-3 rounded ${isRecent ? 'bg-[#f4f9ff]' : ''} hover:bg-[#f8fbff]`}>
                  <div className="w-full sm:w-36 text-xs sm:text-sm text-gray-500 break-words mb-1 sm:mb-0">
                    <div className="font-mono text-[11px]">{ts.toLocaleDateString()}</div>
                    <div className="font-mono text-[11px]">{ts.toLocaleTimeString()}</div>
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-xs sm:text-sm">{n.title}</div>
                    <div className="text-xs text-gray-500">{n.summary}</div>
                  </div>
                </li>
              )
            })}
          </ul>
        </div>
      </div>
    </DoctorLayout>
  )
}

export default DoctorDashboard;
