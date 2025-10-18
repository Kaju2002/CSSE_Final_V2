import React, { useCallback, useState } from 'react'
import { useNavigate } from 'react-router-dom'

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB

const Step2Placeholder: React.FC = () => {
  const navigate = useNavigate()
  const [file, setFile] = useState<File | null>(null)
  const [error, setError] = useState<string | null>(null)

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
            <div className="h-3 bg-[#2a6bb7] w-2/6" />
          </div>
          <div className="text-xs text-gray-500 mt-2">Step 2 of 6: Document Upload</div>
        </div>

        <div className="bg-[#d7e8e7] p-6 rounded-lg shadow-sm">

          <h3 className="text-xl font-semibold mb-2">Document Upload</h3>
          <p className="text-sm text-gray-700 mb-4">Please upload your identification document to proceed with the registration.</p>

          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            className="border-2 border-dashed border-white p-8 rounded-lg text-center bg-[#e6f0ef] mb-4"
          >
            <div className="text-4xl mb-3">⬆️</div>
            <div className="text-lg font-medium">Drag &amp; drop your document here</div>
            <div className="text-sm text-gray-600 mt-2">or click to browse</div>
            <input id="doc-upload" type="file" accept=".pdf,image/*" onChange={handleSelect} className="hidden" />
            <div className="mt-4">
              <button onClick={handleUploadClick} className="px-4 py-2 bg-white rounded border">Upload Document</button>
            </div>
          </div>

          {file ? (
            <div className="p-3 bg-white rounded mb-4">
              <div className="font-medium">Selected file</div>
              <div className="text-sm text-gray-600">{file.name} — {(file.size / 1024).toFixed(1)} KB</div>
            </div>
          ) : (
            <div className="text-sm text-gray-600 mb-4">Valid NIC/Passport required for verification (PDF, JPG, PNG up to 5MB).</div>
          )}

          {error && <div className="text-sm text-red-600 mb-4">{error}</div>}

          <div className="flex justify-between">
            <button onClick={() => navigate('/register')} className="px-4 py-2 border rounded">Back</button>
            <button
              onClick={() => navigate('/register/step-3')}
              className={`px-4 py-2 rounded bg-[#2a6bb7] text-white ${!file ? 'opacity-50 pointer-events-none' : ''}`}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Step2Placeholder

