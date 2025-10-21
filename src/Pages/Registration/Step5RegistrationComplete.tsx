import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { QRCodeCanvas } from 'qrcode.react'
import { ShieldCheck, Loader2 } from 'lucide-react'
import { completeRegistration } from './Services/registrationService'

const Step5RegistrationComplete: React.FC = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [patientData, setPatientData] = useState<{
    mrn: string;
    userId: string;
    name: string;
    email: string;
  } | null>(null)

  useEffect(() => {
    const completeProcess = async () => {
      try {
        setLoading(true)
        setError('')

        const reg = JSON.parse(localStorage.getItem('registration') || '{}')
        const registrationId = reg?.registrationId

        if (!registrationId) {
          throw new Error('Missing registration ID. Please start from Step 1.')
        }

        // Call the complete registration API
        // Note: Auth token and user data are automatically saved by the service
        const response = await completeRegistration(registrationId)

        // Update registration complete data
        localStorage.setItem('registration_complete', JSON.stringify({
          ...reg,
          completedAt: new Date().toISOString(),
          userId: response.user.id,
          mrn: response.patient.mrn,
        }))

        setPatientData({
          mrn: response.patient.mrn,
          userId: response.user.id,
          name: response.user.name,
          email: response.user.email,
        })

        setLoading(false)
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err)
        setError(message || 'Failed to complete registration')
        setLoading(false)
      }
    }

    completeProcess()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f5f8fd] flex flex-col items-center justify-center py-12 px-6">
        <div className="w-full max-w-3xl text-center">
          <img src="/logo.png" alt="Health1st" className="mx-auto mb-6 w-28" />
          <div className="bg-white p-8 rounded-lg shadow-sm">
            <Loader2 className="w-12 h-12 mx-auto mb-4 text-[#2a6bb7] animate-spin" />
            <div className="text-xl font-semibold mb-2">Completing Registration...</div>
            <p className="text-gray-600">Please wait while we finalize your account.</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#f5f8fd] flex flex-col items-center justify-center py-12 px-6">
        <div className="w-full max-w-3xl text-center">
          <img src="/logo.png" alt="Health1st" className="mx-auto mb-6 w-28" />
          <div className="bg-white p-8 rounded-lg shadow-sm">
            <div className="text-red-600 text-xl font-semibold mb-2">Registration Failed</div>
            <p className="text-gray-600 mb-4">{error}</p>
            <button 
              onClick={() => navigate('/register')} 
              className="px-6 py-2 bg-[#2a6bb7] text-white rounded"
            >
              Start Over
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (!patientData) return null

  return (
    <div className="min-h-screen bg-[#f5f8fd] flex flex-col items-center py-12 px-6">
      <div className="w-full max-w-3xl text-center">
        <img src="/logo.png" alt="Health1st" className="mx-auto mb-6 w-28" />
        <div className="bg-[#2a6bb7] p-8 rounded-lg text-white">
          <ShieldCheck className="w-14 h-14 mx-auto mb-4 text-white bg-white/10 p-2 rounded-full" />
          <div className="text-3xl font-bold mb-2">Registration Successful</div>
          <p className="mb-4">Congratulations! Your account has been successfully created.</p>

          <div className="text-sm mb-3">Patient Name: <span className="font-medium">{patientData.name}</span></div>
          <div className="text-sm mb-3">Email: <span className="font-medium">{patientData.email}</span></div>
          <div className="text-sm mb-6">Medical Record Number (MRN): <span className="font-medium">{patientData.mrn}</span></div>

          <div className="mx-auto mb-4 w-40 h-40 bg-white rounded flex items-center justify-center">
            <QRCodeCanvas value={`${patientData.userId}|${patientData.mrn}`} size={120} />
          </div>

          <button onClick={() => navigate('/register/step-6')} className="px-6 py-2 bg-white text-[#2a6bb7] rounded">Continue</button>
        </div>
      </div>
    </div>
  )
}

export default Step5RegistrationComplete
