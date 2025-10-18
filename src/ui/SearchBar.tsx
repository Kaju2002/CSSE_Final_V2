import React from 'react'
import { Search } from 'lucide-react'

type SearchBarProps = {
  placeholder?: string
  value: string
  onChange: (value: string) => void
  className?: string
}

const SearchBar: React.FC<SearchBarProps> = ({ placeholder = 'Search...', value, onChange, className = '' }) => {
  return (
    <label
      className={`flex w-full items-center gap-3 rounded-full border border-transparent bg-white px-5 py-3 text-sm text-[#1f2a44] shadow-[0_12px_28px_-18px_rgba(42,107,183,0.3)] ring-1 ring-[#d8e3f3] transition focus-within:ring-2 focus-within:ring-[#2a6bb7] ${className}`}
    >
      <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#eef4ff] text-[#2a6bb7]">
        <Search className="h-4 w-4" strokeWidth={1.8} />
      </span>
      <input
        type="search"
        placeholder={placeholder}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full bg-transparent text-sm text-[#1f2a44] placeholder:text-[#9aa6bf] focus:outline-none"
      />
    </label>
  )
}

export default SearchBar
