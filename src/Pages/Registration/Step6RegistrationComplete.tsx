import React from 'react'
import { useNavigate } from 'react-router-dom'
import { ShieldCheck } from 'lucide-react'

const Step6RegistrationComplete: React.FC = () => {
  const navigate = useNavigate()

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
          <div className="text-xs text-gray-500 mt-2">Step 6 of 6: Complete</div>
        </div>

        <div className="bg-[#a5c9c9] p-8 rounded-lg text-[#2a2a2a] max-w-2xl mx-auto">
          <div className="flex justify-center">
            <div className="w-16 h-16 rounded-full bg-white/30 flex items-center justify-center mb-4">
              <ShieldCheck className="w-8 h-8 text-[#2a6bb7]" />
            </div>
          </div>

          <h2 className="text-2xl font-semibold mb-2">Digital Health Card Sent!</h2>
          <p className="text-sm text-[#2a2a2a] mb-4">Your registration is complete.</p>

          <p className="text-sm mb-6">Your digital health card details have been sent to your registered email/SMS. Please check your inbox or messages.</p>

          <hr className="border-t border-white/30 mb-4" />

          <label className="inline-flex items-center text-sm mb-6">
            <input type="checkbox" className="form-checkbox mr-2" />
            Request Physical Card by Mail
          </label>

          <div className="mt-2">
            <button onClick={() => navigate('/')} className="px-6 py-2 bg-[#555] text-white rounded">Go to Dashboard</button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Step6RegistrationComplete
