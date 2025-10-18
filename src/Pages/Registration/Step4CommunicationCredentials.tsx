import React, { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

const checkPasswordRules = (pw: string) => {
  return {
    length: pw.length >= 8,
    upper: /[A-Z]/.test(pw),
    lower: /[a-z]/.test(pw),
    number: /[0-9]/.test(pw),
    special: /[^A-Za-z0-9]/.test(pw),
  }
}

const Step4CommunicationCredentials: React.FC = () => {
  const navigate = useNavigate()
  const [sms, setSms] = useState(false)
  const [emailNotify, setEmailNotify] = useState(true)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')

  const pwChecks = useMemo(() => checkPasswordRules(password), [password])
  const isPasswordValid = Object.values(pwChecks).every(Boolean)
  const canProceed = username.trim() !== '' && isPasswordValid && password === confirm

  const handleNext = () => {
    try {
      const reg = JSON.parse(localStorage.getItem('registration') || '{}')
      reg.communication = { sms, emailNotify }
      reg.credentials = { username }
      localStorage.setItem('registration', JSON.stringify(reg))
    } catch {
      // ignore
    }
    navigate('/register/step-5')
  }

  return (
    <div className="min-h-screen bg-[#2a6bb7]/10 p-8 flex items-center justify-center">
      <div className="w-full max-w-3xl bg-white rounded-xl p-8 shadow">
        <h2 className="text-2xl font-semibold mb-2">Communication & Account Setup</h2>
        <p className="text-sm text-gray-600 mb-4">Please select your preferred communication methods and create your secure account credentials.</p>

        <div className="mb-6">
          <div className="text-xs text-gray-500 mb-2">Step 4 of 6: Communication & Credentials</div>
          <div className="h-2 bg-[#e6f0ef] rounded overflow-hidden mb-3">
            <div className="h-2 bg-[#2a6bb7]" style={{ width: '66%' }} />
          </div>

          <div className="mb-3 text-sm font-medium">Preferred Communication Methods</div>

          <div className="flex items-center gap-3">
            <button onClick={() => setSms((s) => !s)} className={`px-4 py-2 rounded-full border ${sms ? 'bg-white' : 'bg-white/50'}`}>
              <span className="mr-2">📩</span> SMS Notifications
            </button>
            <button onClick={() => setEmailNotify((s) => !s)} className={`px-4 py-2 rounded-full border ${emailNotify ? 'bg-[#2a6bb7] text-white' : 'bg-white/50'}`}>
              <span className="mr-2">✉️</span> Email Notifications
            </button>
          </div>
        </div>

        <div className="mb-4">
          <div className="text-sm font-medium mb-2">Create Your Account Credentials</div>
          <div className="space-y-3">
            <input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Enter your desired username" className="w-full border rounded p-3 bg-white" />
            <input value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Create a strong password" type="password" className="w-full border rounded p-3 bg-white" />
            <input value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="Enter password again" type="password" className="w-full border rounded p-3 bg-white" />

            <div className="text-xs text-gray-600">
              <div className={`flex items-center gap-2 ${pwChecks.length ? 'text-green-600' : 'text-gray-400'}`}>• At least 8 characters long</div>
              <div className={`flex items-center gap-2 ${pwChecks.upper ? 'text-green-600' : 'text-gray-400'}`}>• Contains uppercase letters</div>
              <div className={`flex items-center gap-2 ${pwChecks.lower ? 'text-green-600' : 'text-gray-400'}`}>• Contains lowercase letters</div>
              <div className={`flex items-center gap-2 ${pwChecks.number ? 'text-green-600' : 'text-gray-400'}`}>• Includes a number</div>
              <div className={`flex items-center gap-2 ${pwChecks.special ? 'text-green-600' : 'text-gray-400'}`}>• Includes a special character (e.g., !@#$)</div>
            </div>
          </div>
        </div>

        <div className="flex justify-between mt-6">
          <button onClick={() => navigate('/register/step-3')} className="px-4 py-2 border rounded">Back</button>
          <button onClick={handleNext} disabled={!canProceed} className={`px-4 py-2 rounded ${canProceed ? 'bg-[#2a6bb7] text-white' : 'bg-gray-200 text-gray-400'}`}>Next</button>
        </div>
      </div>
    </div>
  )
}

export default Step4CommunicationCredentials
