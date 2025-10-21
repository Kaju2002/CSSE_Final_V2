import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Input from '../../Shared_Ui/Input'
import { startRegistration, savePersonalInfo } from './Services/registrationService'
import { validateStep1 } from './Validation/step1Validation'

const Step1PersonalInfo: React.FC = () => {
  const navigate = useNavigate()
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [address, setAddress] = useState('')
  const [contact, setContact] = useState('')
  const [dob, setDob] = useState('')
  const [gender, setGender] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleNext = () => {
    ;(async () => {
      try {
        // client-side validation
        const { valid, errors } = validateStep1({ firstName, lastName, contact, dob, gender, address })
        if (!valid) {
          const firstKey = Object.keys(errors)[0]
          setError(errors[firstKey])
          return
        }

        setLoading(true)
        setError('')

        const registrationId = await startRegistration()

        // call API to save personal info
        await savePersonalInfo({
          registrationId,
          firstName,
          lastName,
          dob,
          gender,
          phone: contact,
          address
        })

        const registration = JSON.parse(localStorage.getItem('registration') || '{}')
        localStorage.setItem('registration', JSON.stringify({
          ...registration,
          registrationId,
          firstName,
          lastName,
          dob,
          gender,
          address,
          contact
        }))

        navigate('/register/step-2')
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err)
        setError(message || 'Failed to start registration')
      } finally {
        setLoading(false)
      }
    })()
  }

  const handleBack = () => navigate(-1)

  return (
    <div className="min-h-screen bg-[#eef4fb] p-4 sm:p-8">
      <div className="max-w-5xl mx-auto px-2 sm:px-0">
        <div className="bg-white rounded-lg p-6 shadow-sm mb-6">
          <div className="text-sm text-gray-600">Registration Progress</div>
          <div className="mt-2 bg-gray-100 rounded h-3 overflow-hidden">
            <div className="h-3 bg-[#2a6bb7] w-1/6" />
          </div>
          <div className="text-xs text-gray-500 mt-2">Step 1 of 6: Personal Information</div>
        </div>

        <div className="bg-white rounded-lg p-6 sm:p-8 shadow-sm flex flex-col lg:flex-row gap-6 lg:gap-8">
          <div className="flex-1">
            <h2 className="text-2xl font-semibold mb-2">Personal Information</h2>
            <p className="text-sm text-gray-500 mb-6">Please provide your basic personal details to proceed with registration.</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input label="First Name" placeholder="Enter your first name" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
              <Input label="Last Name" placeholder="Enter your last name" value={lastName} onChange={(e) => setLastName(e.target.value)} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
              <Input label="Contact Number" placeholder="e.g., +1 (555) 123-4567" value={contact} onChange={(e) => setContact(e.target.value)} />
            </div>

            <div className="mt-4">
              <Input label="Address" placeholder="e.g., 123 Main St, City, Country" value={address} onChange={(e) => setAddress(e.target.value)} />
            </div>

            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                <input type="date" value={dob} onChange={(e) => setDob(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                <select value={gender} onChange={(e) => setGender(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2">
                  <option value="">Select gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                  <option value="Prefer not to say">Prefer not to say</option>
                </select>
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-3">
              {error && <div className="text-sm text-red-600">{error}</div>}
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                <button onClick={handleBack} className="px-4 py-2 border rounded w-full sm:w-auto">Back</button>
                <button onClick={handleNext} disabled={!firstName || !lastName  || !contact || loading} className={`px-4 py-2 rounded w-full sm:w-auto ${!firstName || !lastName ||  !contact || loading ? 'bg-gray-300 text-gray-600 cursor-not-allowed' : 'bg-[#2a6bb7] text-white'}`}>
                  {loading ? 'Starting...' : 'Next'}
                </button>
              </div>
            </div>
          </div>
          <div className="w-full lg:w-96 flex-shrink-0 flex items-center justify-center bg-[#f1f6fb] rounded-lg p-6">
            <img src="/logo.png" alt="brand" className="max-w-full object-contain h-32 sm:h-40 lg:h-auto" />
          </div>
        </div>
      </div>
    </div>
  )
}

export default Step1PersonalInfo
