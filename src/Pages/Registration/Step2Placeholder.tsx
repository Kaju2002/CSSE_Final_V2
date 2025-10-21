import React, { useCallback, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { uploadDocument } from './Services/registrationService'

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB

const Step2Placeholder: React.FC = () => {
  const navigate = useNavigate()
  const [file, setFile] = useState<File | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [idType, setIdType] = useState('Driver License')
  const [idNumber, setIdNumber] = useState('')
  const [loading, setLoading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadStep, setUploadStep] = useState('')

  useEffect(() => {
    try {
      const reg = JSON.parse(localStorage.getItem('registration') || '{}')
      if (reg?.idType) setIdType(reg.idType)
      if (reg?.idNumber) setIdNumber(reg.idNumber)
      if (reg?.document?.name) {
        // Show previously uploaded file info (visual only)
        setError(null)
      }
    } catch {
      // ignore
    }
  }, [])

  const onFile = useCallback((f: File) => {
    setError(null)
    if (f.size > MAX_FILE_SIZE) {
      setError('File too large. Max 5MB.')
      return
    }
    const allowed = ['application/pdf', 'image/png', 'image/jpeg']
    if (!allowed.includes(f.type)) {
      setError('Unsupported format. Use PDF, PNG or JPG.')
      return
    }
    setFile(f)
    // Save filename to registration object in localStorage (UI-only)
    try {
      const reg = JSON.parse(localStorage.getItem('registration') || '{}')
      reg.document = { name: f.name, type: f.type, size: f.size }
      localStorage.setItem('registration', JSON.stringify(reg))
    } catch {
      // ignore
    }
  }, [])

  const handleDrop: React.DragEventHandler<HTMLDivElement> = (e) => {
    e.preventDefault()
    e.stopPropagation()
    const dt = e.dataTransfer
    if (dt && dt.files && dt.files.length) {
      onFile(dt.files[0])
    }
  }

  const handleSelect: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const f = e.target.files?.[0]
    if (f) onFile(f)
  }

  const handleUploadClick = () => {
    // trigger hidden input
    const el = document.getElementById('doc-upload') as HTMLInputElement | null
    el?.click()
  }

  return (
    <div className="min-h-screen bg-[#2a6bb7]/10 flex flex-col items-center py-12 px-6">
      <div className="w-full max-w-2xl">
        <div className="bg-white rounded-lg p-6 shadow-sm mb-6">
          <div className="text-sm text-gray-600">Registration Progress</div>
          <div className="mt-2 bg-gray-100 rounded h-3 overflow-hidden">
            <div className="h-3 bg-[#2a6bb7]" style={{ width: '40%' }} />
          </div>
          <div className="text-xs text-gray-500 mt-2">Step 2 of 5: Document Upload</div>
        </div>

        <div className="bg-[#dbeeff] p-6 rounded-lg shadow-sm">

          <h3 className="text-xl font-semibold mb-2">Document Upload</h3>
          <p className="text-sm text-gray-700 mb-4">Please upload your identification document to proceed with the registration.</p>

          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            className="border-2 border-dashed border-white p-8 rounded-lg text-center bg-[#e6f0ff] mb-4"
          >
            <div className="text-4xl mb-3">⬆️</div>
            <div className="text-lg font-medium">Drag &amp; drop your document here</div>
            <div className="text-sm text-gray-600 mt-2">or click to browse</div>
            <input id="doc-upload" type="file" accept=".pdf,image/*" onChange={handleSelect} className="hidden" />
            <div className="mt-4">
              <button onClick={handleUploadClick} className="px-4 py-2 bg-white rounded border">Upload Document</button>
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">ID Type</label>
            <select value={idType} onChange={(e) => setIdType(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2">
              <option>Driver License</option>
              <option>Passport</option>
              <option>National ID</option>
            </select>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">ID Number</label>
            <input 
              value={idNumber} 
              onChange={(e) => setIdNumber(e.target.value)} 
              placeholder="e.g., DL123456789"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border" 
            />
          </div>

          {file ? (
            <div className="p-3 bg-white rounded mb-4 border border-green-200">
              <div className="font-medium text-green-700">✓ File selected and ready to upload</div>
              <div className="text-sm text-gray-600 mt-1">{file.name} — {(file.size / 1024).toFixed(1)} KB</div>
              {loading && uploadProgress > 0 && (
                <div className="mt-2">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-[#2a6bb7] h-2 rounded-full transition-all duration-300" 
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {uploadStep || `Uploading... ${uploadProgress}%`}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-sm text-gray-600 mb-4">Valid ID required for verification (PDF, JPG, PNG up to 5MB).</div>
          )}

          {error && <div className="text-sm text-red-600 mb-4">{error}</div>}

          <div className="flex justify-between">
            <button 
              onClick={() => navigate('/register')} 
              disabled={loading}
              className="px-4 py-2 border rounded disabled:opacity-50"
            >
              Back
            </button>
            <button
              onClick={async () => {
                setError(null)
                setUploadProgress(0)
                setUploadStep('')
                
                try {
                  setLoading(true)
                  
                  const reg = JSON.parse(localStorage.getItem('registration') || '{}')
                  const registrationId = reg?.registrationId
                  
                  if (!registrationId) {
                    throw new Error('Missing registration ID. Please start from Step 1.')
                  }
                  if (!file) {
                    throw new Error('Please select a document file to upload')
                  }
                  if (!idNumber.trim()) {
                    throw new Error('Please enter your ID number')
                  }
                  
                  // Step 1: Get patient ID
                  setUploadProgress(10)
                  setUploadStep('Step 1/3: Retrieving patient information...')
                  
                  await new Promise(resolve => setTimeout(resolve, 200)) // Visual delay
                  
                  setUploadProgress(30)
                  
                  // Step 2: Upload to Cloudinary (via /api/imaging)
                  setUploadStep('Step 2/3: Uploading file to cloud storage...')
                  
                  await new Promise(resolve => setTimeout(resolve, 200)) // Visual delay
                  
                  setUploadProgress(60)
                  
                  // Step 3: Save to registration (via /api/registration/document)
                  setUploadStep('Step 3/3: Saving document information...')
                  
                  const result = await uploadDocument(registrationId, file, idType, idNumber)
                  
                  setUploadProgress(100)
                  setUploadStep('Upload complete!')
                  
                  // Update localStorage with document info
                  reg.document = { 
                    url: result.documentUrl, 
                    name: file.name,
                    type: file.type,
                    size: file.size
                  }
                  reg.idType = idType
                  reg.idNumber = idNumber
                  localStorage.setItem('registration', JSON.stringify(reg))
                  
                  // Small delay to show 100% progress
                  await new Promise(resolve => setTimeout(resolve, 500))
                  
                  navigate('/register/step-3')
                } catch (err: unknown) {
                  const msg = err instanceof Error ? err.message : String(err || 'Failed to upload document')
                  setError(msg)
                  setUploadProgress(0)
                  setUploadStep('')
                } finally {
                  setLoading(false)
                }
              }}
              disabled={!file || !idNumber.trim() || loading}
              className={`px-4 py-2 rounded ${!file || !idNumber.trim() || loading ? 'bg-gray-300 text-gray-600 cursor-not-allowed' : 'bg-[#2a6bb7] text-white hover:bg-[#235a94]'}`}
            >
              {loading ? 'Uploading...' : 'Upload & Continue'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Step2Placeholder

