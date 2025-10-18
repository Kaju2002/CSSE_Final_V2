import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Input from '../../Shared_Ui/Input'

const Step3MedicalInfo: React.FC = () => {
  const navigate = useNavigate()

  const [ageRange, setAgeRange] = useState('')
  const [gender, setGender] = useState('')
  const [conditions, setConditions] = useState<string[]>([])
  const [otherCondition, setOtherCondition] = useState('')
  const [emergencyName, setEmergencyName] = useState('')
  const [emergencyPhone, setEmergencyPhone] = useState('')

  const toggleCondition = (val: string) => {
    setConditions((prev) => (prev.includes(val) ? prev.filter((p) => p !== val) : [...prev, val]))
  }

  const handleNext = () => {
    try {
      const reg = JSON.parse(localStorage.getItem('registration') || '{}')
      reg.medical = { ageRange, gender, conditions: [...conditions, otherCondition ? otherCondition : undefined].filter(Boolean), emergencyName, emergencyPhone }
      localStorage.setItem('registration', JSON.stringify(reg))
    } catch {
      // ignore
    }
    navigate('/register/step-4')
  }

  return (
    <div className="min-h-screen bg-[#eef4fb] flex flex-col items-center py-12 px-6">
      <div className="w-full max-w-3xl">
        <div className="bg-white rounded-lg p-6 shadow-sm mb-6">
          <div className="text-sm text-gray-600">Registration Progress</div>
          <div className="mt-2 bg-gray-100 rounded h-3 overflow-hidden">
            <div className="h-3 bg-[#2a6bb7]" style={{ width: '50%' }} />
          </div>
          <div className="text-xs text-gray-500 mt-2">Step 3 of 6: Medical & Demographics</div>
        </div>

        <div className="w-full bg-white rounded-lg p-6 shadow">
          <h2 className="text-2xl font-semibold mb-2">Medical History & Demographics</h2>
          <p className="text-sm text-gray-600 mb-4">Please provide your health and demographic information. This helps us ensure the best care.</p>

          <div className="mb-4">
            <div className="text-sm font-medium mb-2">Demographic Information</div>
            <div className="grid grid-cols-2 gap-4 items-start">
              <select value={ageRange} onChange={(e) => setAgeRange(e.target.value)} className="block w-full h-11 px-4 border rounded-lg text-sm text-[#1f2a44] focus:outline-none focus:border-[#2a6bb7] border-[#d8e3f3]">
                <option value="">Select your age range</option>
                <option value="18-25">18-25</option>
                <option value="26-35">26-35</option>
                <option value="36-45">36-45</option>
                <option value="46-60">46-60</option>
                <option value=">60">60+</option>
              </select>
              <div>
                <div className="text-sm font-medium mb-1">Gender</div>
                <div className="flex flex-wrap items-center gap-4">
                  <label className="inline-flex items-center">
                    <input className="form-radio h-4 w-4 text-[#2a6bb7]" type="radio" name="gender" value="female" checked={gender === 'female'} onChange={(e) => setGender(e.target.value)} />
                    <span className="ml-2">Female</span>
                  </label>

                  <label className="inline-flex items-center">
                    <input className="form-radio h-4 w-4 text-[#2a6bb7]" type="radio" name="gender" value="male" checked={gender === 'male'} onChange={(e) => setGender(e.target.value)} />
                    <span className="ml-2">Male</span>
                  </label>

                  <label className="inline-flex items-center">
                    <input className="form-radio h-4 w-4 text-[#2a6bb7]" type="radio" name="gender" value="other" checked={gender === 'other'} onChange={(e) => setGender(e.target.value)} />
                    <span className="ml-2">Other</span>
                  </label>

                  <label className="inline-flex items-center">
                    <input className="form-radio h-4 w-4 text-[#2a6bb7]" type="radio" name="gender" value="prefer_not" checked={gender === 'prefer_not'} onChange={(e) => setGender(e.target.value)} />
                    <span className="ml-2">Prefer not to say</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          <div className="mb-4">
            <div className="text-sm font-medium mb-2">Medical History</div>
            <div className="grid grid-cols-2 gap-2">
              <label className="inline-flex items-center"><input type="checkbox" checked={conditions.includes('diabetes')} onChange={() => toggleCondition('diabetes')} /> <span className="ml-2">Diabetes</span></label>
              <label className="inline-flex items-center"><input type="checkbox" checked={conditions.includes('hypertension')} onChange={() => toggleCondition('hypertension')} /> <span className="ml-2">Hypertension</span></label>
              <label className="inline-flex items-center"><input type="checkbox" checked={conditions.includes('asthma')} onChange={() => toggleCondition('asthma')} /> <span className="ml-2">Asthma</span></label>
              <label className="inline-flex items-center"><input type="checkbox" checked={conditions.includes('allergies')} onChange={() => toggleCondition('allergies')} /> <span className="ml-2">Known Allergies</span></label>
            </div>
            <div className="mt-2">
              <Input label="Other (please specify)" value={otherCondition} onChange={(e) => setOtherCondition(e.target.value)} />
            </div>
          </div>

          <div className="mb-4">
            <div className="text-sm font-medium mb-2">Emergency Contact Information</div>
            <div className="grid grid-cols-2 gap-4">
              <Input placeholder="Full name of emergency contact" value={emergencyName} onChange={(e) => setEmergencyName(e.target.value)} />
              <Input placeholder="e.g., +123 456 7890" value={emergencyPhone} onChange={(e) => setEmergencyPhone(e.target.value)} />
            </div>
          </div>

          <div className="flex justify-between mt-6">
            <button onClick={() => navigate('/register/step-2')} className="px-4 py-2 border rounded">Back</button>
            <button onClick={handleNext} className="px-4 py-2 rounded bg-[#2a6bb7] text-white">Next</button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Step3MedicalInfo
