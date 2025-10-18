import React, { useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { QRCodeCanvas } from 'qrcode.react'
import { ShieldCheck } from 'lucide-react'

const randomId = (prefix: string) => `${prefix}-${Math.random().toString(36).slice(2, 9).toUpperCase()}`

const Step5RegistrationComplete: React.FC = () => {
  const navigate = useNavigate()

  const patientId = useMemo(() => randomId('SHC'), [])
  const dhc = useMemo(() => `DHC-${Math.random().toString(36).slice(2, 12).toUpperCase()}`, [])

  useEffect(() => {
    try {
      const reg = JSON.parse(localStorage.getItem('registration') || '{}')
      const user = { id: patientId, dhc, username: reg.credentials?.username || null }
      localStorage.setItem('user', JSON.stringify(user))
      localStorage.setItem('registration_complete', JSON.stringify({ ...reg, completedAt: new Date().toISOString(), patientId, dhc }))
    } catch {
      // ignore
    }
  }, [patientId, dhc])

  return (
    <div className="min-h-screen bg-[#f5f8fd] flex flex-col items-center py-12 px-6">
      <div className="w-full max-w-3xl text-center">
        <img src="/logo.png" alt="Health1st" className="mx-auto mb-6 w-28" />
        <div className="bg-[#2a6bb7] p-8 rounded-lg text-white">
          <ShieldCheck className="w-14 h-14 mx-auto mb-4 text-white bg-white/10 p-2 rounded-full" />
          <div className="text-3xl font-bold mb-2">Registration Successful</div>
          <p className="mb-4">Congratulations! Your account has been successfully created.</p>

          <div className="text-sm mb-3">Patient ID: <span className="font-medium">{patientId}</span></div>
          <div className="text-sm mb-6">Digital Health Card Number: <span className="font-medium">{dhc}</span></div>

          <div className="mx-auto mb-4 w-40 h-40 bg-white rounded flex items-center justify-center">
            <QRCodeCanvas value={`${patientId}|${dhc}`} size={120} />
          </div>

          <button onClick={() => navigate('/register/step-6')} className="px-6 py-2 bg-white text-[#2a6bb7] rounded">Continue</button>
        </div>
      </div>
    </div>
  )
}

export default Step5RegistrationComplete
