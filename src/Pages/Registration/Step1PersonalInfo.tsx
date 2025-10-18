import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Input from '../../Shared_Ui/Input'

const Step1PersonalInfo: React.FC = () => {
  const navigate = useNavigate()
  const [fullName, setFullName] = useState('')
  const [idNumber, setIdNumber] = useState('')
  const [address, setAddress] = useState('')
  const [contact, setContact] = useState('')

  const handleNext = () => {
    const registration = JSON.parse(localStorage.getItem('registration') || '{}')
    localStorage.setItem('registration', JSON.stringify({ ...registration, fullName, idNumber, address, contact }))
    navigate('/register/step-2')
  }

  const handleBack = () => navigate(-1)

  return (
    <div className="min-h-screen bg-[#eef4fb] p-8">
      <div className="max-w-5xl mx-auto">
        <div className="bg-white rounded-lg p-6 shadow-sm mb-6">
          <div className="text-sm text-gray-600">Registration Progress</div>
          <div className="mt-2 bg-gray-100 rounded h-3 overflow-hidden">
            <div className="h-3 bg-[#2a6bb7] w-1/6" />
          </div>
          <div className="text-xs text-gray-500 mt-2">Step 1 of 6: Personal Information</div>
        </div>

        <div className="bg-white rounded-lg p-8 shadow-sm flex gap-8">
          <div className="flex-1">
            <h2 className="text-2xl font-semibold mb-2">Personal Information</h2>
            <p className="text-sm text-gray-500 mb-6">Please provide your basic personal details to proceed with registration.</p>

            <div className="grid grid-cols-2 gap-4">
              <Input label="Full Name" placeholder="Enter your full name" value={fullName} onChange={(e) => setFullName(e.target.value)} />
              <Input label="NIC/Passport Number" placeholder="e.g., 123456789V or P1234567" value={idNumber} onChange={(e) => setIdNumber(e.target.value)} />
            </div>

            <div className="mt-4">
              <Input label="Address" placeholder="e.g., 123 Main St, City, Country" value={address} onChange={(e) => setAddress(e.target.value)} />
            </div>

            <div className="mt-4">
              <Input label="Contact Number" placeholder="e.g., +1 (555) 123-4567" value={contact} onChange={(e) => setContact(e.target.value)} />
            </div>

            <div className="mt-6 flex justify-between items-center">
              <button onClick={handleBack} className="px-4 py-2 border rounded">Back</button>
              <button onClick={handleNext} disabled={!fullName || !idNumber || !contact} className={`px-4 py-2 rounded ${!fullName || !idNumber || !contact ? 'bg-gray-300 text-gray-600 cursor-not-allowed' : 'bg-[#2a6bb7] text-white'}`}>
                Next
              </button>
            </div>
          </div>

          <div className="w-96 flex-shrink-0 flex items-center justify-center bg-[#f1f6fb] rounded-lg p-6">
            <img src="/logo.png" alt="brand" className="max-w-full object-contain" />
          </div>
        </div>
      </div>
    </div>
  )
}

export default Step1PersonalInfo
