import React, { useState } from 'react'
import SearchBar from './SearchBar'

const DashboardSearch: React.FC = () => {
  const [query, setQuery] = useState('')

  const rooms = [
    { name: 'Deluxe Room', price: '$120 / night', img: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800' },
    { name: 'Single Room', price: '$80 / night', img: 'https://images.unsplash.com/photo-1590490359683-658d3d23f972?w=800' },
    { name: 'Suite', price: '$200 / night', img: 'https://images.unsplash.com/photo-1615874959474-d609969a20ed?w=800' },
    { name: 'Family Room', price: '$150 / night', img: 'https://images.unsplash.com/photo-1622015663317-dc52d5c0a7cc?w=800' },
    { name: 'Queen Room', price: '$100 / night', img: 'https://images.unsplash.com/photo-1616627565546-2a0cfa6c88e3?w=800' },
  ]

  const filteredRooms = rooms.filter(room =>
    room.name.toLowerCase().includes(query.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#ebf3ff] to-[#f8fbff] p-10">
      {/* Header */}
      <header className="flex justify-between items-center mb-10">
        <h1 className="text-3xl font-bold text-[#1f2a44]">Room Dashboard</h1>
        <div className="w-80">
          <SearchBar
            placeholder="Search rooms..."
            value={query}
            onChange={setQuery}
          />
        </div>
      </header>

      {/* Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredRooms.length > 0 ? (
          filteredRooms.map((room, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl shadow-md hover:shadow-lg transition p-4 border border-[#e1eaf5]"
            >
              <img
                src={room.img}
                alt={room.name}
                className="w-full h-40 object-cover rounded-xl mb-4"
              />
              <h2 className="text-lg font-semibold text-[#1f2a44]">{room.name}</h2>
              <p className="text-[#2a6bb7] mt-1 font-medium">{room.price}</p>
              <button className="mt-4 w-full rounded-full bg-gradient-to-r from-[#2379bb] to-[#206eaa] text-white py-2 font-medium transition hover:opacity-90">
                View Details
              </button>
            </div>
          ))
        ) : (
          <p className="text-[#9aa6bf] text-center col-span-full">No rooms found</p>
        )}
      </div>
    </div>
  )
}

export default DashboardSearch
