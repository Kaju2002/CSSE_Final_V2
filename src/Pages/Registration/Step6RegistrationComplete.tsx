import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ShieldCheck } from 'lucide-react'

const Step6RegistrationComplete: React.FC = () => {
  const navigate = useNavigate()
  const [requestPhysicalCard, setRequestPhysicalCard] = useState(false)
  const [userData, setUserData] = useState<{
    name: string;
    email: string;
    mrn: string;
  } | null>(null)

  useEffect(() => {
    try {
      // First try to get data from registration completion
      const reg = JSON.parse(localStorage.getItem('registration') || '{}')
      if (reg?.completionData) {
        setUserData({
          name: reg.completionData.user.name,
          email: reg.completionData.user.email,
          mrn: reg.completionData.patient.mrn,
        })
      } else {
        // Fallback to user data in localStorage
        const user = JSON.parse(localStorage.getItem('user') || '{}')
        if (user && user.name) {
          setUserData({
            name: user.name,
            email: user.email || '',
            mrn: user.mrn || '',
          })
        }
      }
    } catch {
      // ignore
    }
  }, [])

  return (
    <div className="min-h-screen bg-[#f5f8fd] flex flex-col items-center py-12 px-6">
      <div className="w-full max-w-4xl text-center">
        <div className="mx-auto mb-6 w-32">
          <img src="/logo.png" alt="Health1st" className="w-full" />
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm mb-6">
          <div className="text-sm text-gray-600">Registration Progress</div>
          <div className="mt-2 bg-gray-100 rounded h-3 overflow-hidden">
            <div className="h-3 bg-[#2a6bb7] w-full" />
          </div>
          <div className="text-xs text-gray-500 mt-2">Step 5 of 5: Complete</div>
        </div>

        <div className="bg-[#a5c9c9] p-8 rounded-lg text-[#2a2a2a] max-w-2xl mx-auto">
          <div className="flex justify-center">
            <div className="w-16 h-16 rounded-full bg-white/30 flex items-center justify-center mb-4">
              <ShieldCheck className="w-8 h-8 text-[#2a6bb7]" />
            </div>
          </div>

          <h2 className="text-2xl font-semibold mb-2">Digital Health Card Sent!</h2>
          <p className="text-sm text-[#2a2a2a] mb-4">Your registration is complete.</p>

          {userData && (
            <div className="mb-4 p-4 bg-white/20 rounded">
              <div className="text-sm mb-2">Welcome, <span className="font-semibold">{userData.name}</span>!</div>
              <div className="text-xs">Email: {userData.email}</div>
              <div className="text-xs">MRN: {userData.mrn}</div>
            </div>
          )}

          <p className="text-sm mb-6">Your digital health card details have been sent to your registered email/SMS. Please check your inbox or messages.</p>

          <hr className="border-t border-white/30 mb-4" />

          <label className="inline-flex items-center text-sm mb-6">
            <input 
              type="checkbox" 
              className="form-checkbox mr-2" 
              checked={requestPhysicalCard}
              onChange={(e) => setRequestPhysicalCard(e.target.checked)}
            />
            Request Physical Card by Mail
          </label>

          <div className="mt-2">
            <button 
              onClick={() => {
                // Clear registration data but keep user data and auth token
                localStorage.removeItem('registration')
                localStorage.removeItem('registration_complete')
                navigate('/')
              }} 
              className="px-6 py-2 bg-[#555] text-white rounded hover:bg-[#444] transition"
            >
              Go to Home
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Step6RegistrationComplete
