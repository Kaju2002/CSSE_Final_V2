import React from 'react'

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  children: React.ReactNode
}

// Gradient: linear-gradient(90deg, #2379bb, #206eaa)
// We'll use Tailwind's bg-[linear-gradient(...)] arbitrary value to apply it.
export const Button: React.FC<ButtonProps> = ({ children, className = '', ...props }) => {
  return (
    <button
      {...props}
      className={
        `inline-flex items-center justify-center px-5 py-2 rounded-md text-white font-medium shadow-sm transition focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#9ec1eb] bg-[#2a6bb7] hover:bg-[#245ca0] active:bg-[#1f4f8a] ${className}`
      }
    >
      {children}
    </button>
  )
}

export default Button
