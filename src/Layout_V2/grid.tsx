import React from 'react'
import Card from './Card'
import { BedDouble, MapPin, Star, Users, Wifi, Coffee, Heart } from 'lucide-react'

const CardGrid: React.FC = () => {
  const rooms = [
    {
      title: 'Deluxe Ocean View',
      subtitle: 'Spacious room with balcony overlooking the sea',
      image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800',
      tags: [
        { label: 'Wi-Fi', icon: <Wifi size={14} /> },
        { label: '2 Guests', icon: <Users size={14} /> },
        { label: 'Breakfast', icon: <Coffee size={14} /> },
      ],
      meta: [
        { icon: <MapPin size={16} />, label: 'Colombo, Sri Lanka' },
        { icon: <BedDouble size={16} />, label: 'King Size Bed' },
      ],
      footer: 'Available now · $120 / night',
    },
    {
      title: 'Family Suite',
      subtitle: 'Comfortable suite ideal for families with kids',
      image: 'https://images.unsplash.com/photo-1616627565546-2a0cfa6c88e3?w=800',
      tags: [
        { label: 'Wi-Fi', icon: <Wifi size={14} /> },
        { label: '4 Guests', icon: <Users size={14} /> },
      ],
      meta: [
        { icon: <MapPin size={16} />, label: 'Kandy, Sri Lanka' },
        { icon: <BedDouble size={16} />, label: '2 Queen Beds' },
      ],
      footer: 'Available now · $180 / night',
    },
    {
      title: 'Luxury Suite',
      subtitle: 'Elegant decor, pool access & city skyline view',
      image: 'https://images.unsplash.com/photo-1615874959474-d609969a20ed?w=800',
      tags: [
        { label: 'Wi-Fi', icon: <Wifi size={14} /> },
        { label: '2 Guests', icon: <Users size={14} /> },
        { label: '5 Stars', icon: <Star size={14} /> },
      ],
      meta: [
        { icon: <MapPin size={16} />, label: 'Galle, Sri Lanka' },
        { icon: <BedDouble size={16} />, label: 'King Size Bed' },
      ],
      footer: 'Available now · $250 / night',
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#eef4ff] to-[#f8fbff] px-10 py-12">
      {/* Page Header */}
      <div className="flex justify-between items-center mb-10">
        <h1 className="text-3xl font-bold text-[#1b2b4b]">Available Rooms</h1>
        <button className="flex items-center gap-2 rounded-full bg-gradient-to-r from-[#2379bb] to-[#206eaa] px-5 py-2.5 text-white font-medium shadow-md hover:opacity-90 transition">
          <Heart size={16} />
          Favorites
        </button>
      </div>

      {/* Card Grid */}
      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {rooms.map((room, index) => (
          <Card
            key={index}
            title={room.title}
            subtitle={room.subtitle}
            media={<img src={room.image} alt={room.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" />}
            tags={room.tags}
            meta={room.meta}
            footer={room.footer}
            actions={
              <button className="rounded-full bg-gradient-to-r from-[#2379bb] to-[#206eaa] px-4 py-2 text-sm font-medium text-white shadow-md hover:opacity-90 transition">
                Book Now
              </button>
            }
          />
        ))}
      </div>
    </div>
  )
}

export default CardGrid
