import React, { useState } from 'react'
import SearchBar from './SearchBar'

const SearchPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const items = ['Deluxe Room', 'Single Room', 'Queen Room', 'Suite', 'Family Room', 'Ocean View Room']

  const filteredItems = items.filter(item =>
    item.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#eaf3ff] to-[#f8fbff] flex flex-col items-center px-4 py-10">
      {/* Title */}
      <h1 className="text-3xl font-semibold text-[#1f2a44] mb-8">
        Search Your Room
      </h1>

      {/* Search Bar */}
      <div className="w-full max-w-md mb-10">
        <SearchBar
          placeholder="Search for a room..."
          value={searchTerm}
          onChange={setSearchTerm}
        />
      </div>

      {/* Search Results */}
      <div className="w-full max-w-md bg-white rounded-2xl shadow-md p-6 space-y-3">
        {filteredItems.length > 0 ? (
          filteredItems.map((item, index) => (
            <div
              key={index}
              className="p-3 rounded-lg border border-[#d8e3f3] hover:border-[#2a6bb7] hover:shadow-sm transition cursor-pointer"
            >
              {item}
            </div>
          ))
        ) : (
          <p className="text-[#9aa6bf] text-center">No results found</p>
        )}
      </div>
    </div>
  )
}

export default SearchPage
