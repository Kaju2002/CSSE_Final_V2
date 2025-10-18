import React from 'react'

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string
  error?: string | null
  inputClassName?: string
}

const Input: React.FC<InputProps> = ({ label, error, className = '', inputClassName = '', ...props }) => {
  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label className="block text-xs font-semibold text-[#203a6d] mb-2 uppercase tracking-wide">
          {label}
        </label>
      )}
      <input
        {...props}
        className={`block w-full h-11 px-4 border rounded-lg text-sm placeholder-gray-400 text-[#1f2a44] focus:outline-none focus:border-[#2a6bb7] ${error ? 'border-red-300' : 'border-[#d8e3f3]'} ${inputClassName}`}
      />
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  )
}

export default Input
