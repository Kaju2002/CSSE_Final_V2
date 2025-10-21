import React, { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { saveCommunication, saveCredentials, checkEmailAvailability, completeRegistration } from './Services/registrationService'

const checkPasswordRules = (pw: string) => {
  return {
    length: pw.length >= 8,
    number: /[0-9]/.test(pw),
    special: /[^A-Za-z0-9]/.test(pw),
  }
}

const Step4CommunicationCredentials: React.FC = () => {
  const navigate = useNavigate()
  const [sms, setSms] = useState(false)
  const [emailNotify, setEmailNotify] = useState(true)
  const [appointmentReminders, setAppointmentReminders] = useState(true)
  const [labResultsNotifications, setLabResultsNotifications] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [emailChecking, setEmailChecking] = useState(false)
  const [emailAvailable, setEmailAvailable] = useState<boolean | null>(null)

  const pwChecks = useMemo(() => checkPasswordRules(password), [password])
  const isPasswordValid = Object.values(pwChecks).every(Boolean)
  const canProceed = email.trim() !== '' && isPasswordValid && password === confirm && emailAvailable === true

  // Check email availability
  const handleEmailBlur = async () => {
    if (!email || !email.includes('@')) return

    try {
      setEmailChecking(true)
      const result = await checkEmailAvailability(email)
      setEmailAvailable(result.available)
      if (!result.available) {
        setError('Email is already registered. Please use a different email or login.')
      } else {
        setError('')
      }
    } catch (err) {
      console.error('Email check failed:', err)
      setEmailAvailable(null)
    } finally {
      setEmailChecking(false)
    }
  }

  const handleNext = async () => {
    try {
      setLoading(true)
      setError('')

      const reg = JSON.parse(localStorage.getItem('registration') || '{}')
      const registrationId = reg?.registrationId

      if (!registrationId) {
        throw new Error('Missing registration ID. Please start from Step 1.')
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(email)) {
        throw new Error('Please enter a valid email address')
      }

      // Check email availability one more time before submission
      const emailCheck = await checkEmailAvailability(email)
      if (!emailCheck.available) {
        throw new Error('Email is already registered. Please use a different email.')
      }

      // Step 5: Save communication preferences
      await saveCommunication({
        registrationId,
        emailNotifications: emailNotify,
        smsNotifications: sms,
        appointmentReminders,
        labResultsNotifications,
      })

      // Step 6: Save credentials
      await saveCredentials({
        registrationId,
        email,
        password,
      })

      // Step 7: Complete registration (creates user account and patient record)
      const result = await completeRegistration(registrationId)

      // Update localStorage with complete registration data
      reg.communication = { 
        sms, 
        emailNotify, 
        appointmentReminders, 
        labResultsNotifications 
      }
      reg.credentials = { email }
      reg.completed = true
      reg.completionData = result
      localStorage.setItem('registration', JSON.stringify(reg))

      // Navigate to success page
      navigate('/register/step-6')
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err)
      setError(message || 'Failed to save preferences and credentials')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#2a6bb7]/10 p-8 flex items-center justify-center">
      <div className="w-full max-w-3xl bg-white rounded-xl p-8 shadow">
        <h2 className="text-2xl font-semibold mb-2">Communication & Account Setup</h2>
        <p className="text-sm text-gray-600 mb-4">Please select your preferred communication methods and create your secure account credentials.</p>

        <div className="mb-6">
          <div className="text-xs text-gray-500 mb-2">Step 4 of 5: Communication & Credentials</div>
          <div className="h-2 bg-[#e6f0ef] rounded overflow-hidden mb-3">
            <div className="h-2 bg-[#2a6bb7]" style={{ width: '80%' }} />
          </div>

          <div className="mb-3 text-sm font-medium">Communication Preferences</div>

          <div className="space-y-3">
            <label className="flex items-center gap-3 p-3 border rounded cursor-pointer hover:bg-gray-50">
              <input 
                type="checkbox" 
                checked={emailNotify} 
                onChange={(e) => setEmailNotify(e.target.checked)}
                className="w-4 h-4"
              />
              <div>
                <div className="font-medium">Email Notifications</div>
                <div className="text-xs text-gray-500">Receive updates via email</div>
              </div>
            </label>

            <label className="flex items-center gap-3 p-3 border rounded cursor-pointer hover:bg-gray-50">
              <input 
                type="checkbox" 
                checked={sms} 
                onChange={(e) => setSms(e.target.checked)}
                className="w-4 h-4"
              />
              <div>
                <div className="font-medium">SMS Notifications</div>
                <div className="text-xs text-gray-500">Receive updates via text message</div>
              </div>
            </label>

            <label className="flex items-center gap-3 p-3 border rounded cursor-pointer hover:bg-gray-50">
              <input 
                type="checkbox" 
                checked={appointmentReminders} 
                onChange={(e) => setAppointmentReminders(e.target.checked)}
                className="w-4 h-4"
              />
              <div>
                <div className="font-medium">Appointment Reminders</div>
                <div className="text-xs text-gray-500">Get reminded about upcoming appointments</div>
              </div>
            </label>

            <label className="flex items-center gap-3 p-3 border rounded cursor-pointer hover:bg-gray-50">
              <input 
                type="checkbox" 
                checked={labResultsNotifications} 
                onChange={(e) => setLabResultsNotifications(e.target.checked)}
                className="w-4 h-4"
              />
              <div>
                <div className="font-medium">Lab Results Notifications</div>
                <div className="text-xs text-gray-500">Be notified when lab results are available</div>
              </div>
            </label>
          </div>
        </div>

        <div className="mb-4">
          <div className="text-sm font-medium mb-2">Create Your Account</div>
          <p className="text-xs text-gray-500 mb-3">Set up your email and password to access your account</p>
          <div className="space-y-3">
            <div className="relative">
              <input 
                value={email} 
                onChange={(e) => {
                  setEmail(e.target.value)
                  setEmailAvailable(null)
                  setError('')
                }}
                onBlur={handleEmailBlur}
                type="email"
                className={`w-full border rounded p-3 bg-white ${emailAvailable === false ? 'border-red-500' : emailAvailable === true ? 'border-green-500' : ''}`}
                placeholder="Enter your email address"
              />
              {emailChecking && (
                <div className="absolute right-3 top-3 text-xs text-gray-500">Checking...</div>
              )}
              {emailAvailable === true && !emailChecking && (
                <div className="text-xs text-green-600 mt-1">✓ Email is available</div>
              )}
              {emailAvailable === false && !emailChecking && (
                <div className="text-xs text-red-600 mt-1">✗ Email is already registered</div>
              )}
            </div>
            <input 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              placeholder="Create a password" 
              type="password" 
              className="w-full border rounded p-3 bg-white" 
            />
            <input 
              value={confirm} 
              onChange={(e) => setConfirm(e.target.value)} 
              placeholder="Confirm password" 
              type="password" 
              className="w-full border rounded p-3 bg-white" 
            />

            <div className="text-xs text-gray-600">
              <div className="font-medium mb-1">Password Requirements:</div>
              <div className={`flex items-center gap-2 ${pwChecks.length ? 'text-green-600' : 'text-gray-400'}`}>• At least 8 characters</div>
              <div className={`flex items-center gap-2 ${pwChecks.number ? 'text-green-600' : 'text-gray-400'}`}>• At least 1 number</div>
              <div className={`flex items-center gap-2 ${pwChecks.special ? 'text-green-600' : 'text-gray-400'}`}>• At least 1 special character</div>
            </div>
            {password !== confirm && confirm && (
              <div className="text-xs text-red-600 mt-2">Passwords do not match</div>
            )}
          </div>
        </div>

        {error && <div className="text-sm text-red-600 mb-4">{error}</div>}

        <div className="flex justify-between mt-6">
          <button 
            onClick={() => navigate('/register/step-3')} 
            disabled={loading}
            className="px-4 py-2 border rounded"
          >
            Back
          </button>
          <button 
            onClick={handleNext} 
            disabled={!canProceed || loading} 
            className={`px-4 py-2 rounded ${canProceed && !loading ? 'bg-[#2a6bb7] text-white' : 'bg-gray-200 text-gray-400'}`}
          >
            {loading ? 'Saving...' : 'Next'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default Step4CommunicationCredentials
