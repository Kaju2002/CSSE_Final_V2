import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { MapPin, Phone, Stethoscope } from 'lucide-react'
import MobileDropdown from '../../Shared_Ui/MobileDropdown';
import SearchBar from '../../ui/SearchBar'
import Card from '../../ui/Card'
import Button from '../../ui/Button'
import { Loader2 } from 'lucide-react'
import AppointmentWizardHeader from './AppointmentWizardHeader'
import { useAppointmentBooking } from '../../contexts/AppointmentBookingContext'
import type { Hospital } from '../../types/appointment'
import { fetchHospitals, type ApiHospital } from '../../lib/utils/appointmentApi'

const distanceFilters = [
  { label: 'Any Distance', value: 'any' },
  { label: 'Within 5 miles', value: '5' },
  { label: 'Within 10 miles', value: '10' },
  { label: 'Within 15 miles', value: '15' }
]

const hospitalTypeFilters = [
  { label: 'All Hospitals', value: 'all' },
  { label: 'Government', value: 'government' },
  { label: 'Private', value: 'private' }
]

const CARDS_PER_ROW = 4
const INITIAL_ROWS = 3
const LOAD_MORE_ROWS = 2
const INITIAL_VISIBLE = CARDS_PER_ROW * INITIAL_ROWS
const LOAD_MORE_INCREMENT = CARDS_PER_ROW * LOAD_MORE_ROWS

const parseDistance = (distance: string | number) => {
  if (typeof distance === 'number') return distance
  const match = distance.match(/([\d.]+)/)
  return match ? Number.parseFloat(match[1]) : Number.POSITIVE_INFINITY
}

// Convert API hospital to app Hospital type
const convertApiHospital = (apiHospital: ApiHospital): Hospital => ({
  id: apiHospital._id,
  name: apiHospital.name,
  address: apiHospital.address,
  phone: apiHospital.phone,
  image: apiHospital.image,
  distance: apiHospital.distance,
  specialities: apiHospital.specialities,
  type: apiHospital.type
})

const MakeAppointment: React.FC = () => {
  const [loadingMore, setLoadingMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const navigate = useNavigate()
  const { state: bookingState, setHospital } = useAppointmentBooking()
  const [searchTerm, setSearchTerm] = useState('')
  const [distance, setDistance] = useState<string>('any')
  const [speciality, setSpeciality] = useState<string>('any')
  const [hospitalType, setHospitalType] = useState<'all' | 'government' | 'private'>('all')
  const [visibleCount, setVisibleCount] = useState<number>(INITIAL_VISIBLE)

  // Fetch hospitals from API
  useEffect(() => {
    const loadHospitals = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const params: any = {
          limit: 100 // Fetch more initially
        };
        
        // Apply filters if not 'all' or 'any'
        if (hospitalType !== 'all') {
          params.type = hospitalType === 'government' ? 'Government' : 'Private';
        }
        
        if (speciality !== 'any') {
          params.speciality = speciality;
        }

        const response = await fetchHospitals(params);
        
        if (response.success) {
          const convertedHospitals = response.data.hospitals.map(convertApiHospital);
          setHospitals(convertedHospitals);
        } else {
          setError('Failed to load hospitals');
        }
      } catch (err) {
        console.error('Error fetching hospitals:', err);
        setError('Failed to load hospitals. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    loadHospitals();
  }, [hospitalType, speciality]);

  const specialityOptions = useMemo(() => {
    const unique = new Set<string>()
    hospitals.forEach((hospital) => {
      hospital.specialities.forEach((item) => unique.add(item))
    })
    return ['any', ...Array.from(unique).sort()]
  }, [hospitals])

  const filteredHospitals = useMemo(() => {
    return hospitals.filter((hospital) => {
      const matchesSearch = hospital.name.toLowerCase().includes(searchTerm.toLowerCase())

      const numericDistance = parseDistance(hospital.distance)
      const withinDistance =
        distance === 'any' ? true : Number.parseFloat(distance) >= numericDistance

      const matchesSpeciality =
        speciality === 'any' ? true : hospital.specialities.includes(speciality)

      const matchesType =
        hospitalType === 'all' ? true : hospital.type.toLowerCase() === hospitalType

      return matchesSearch && withinDistance && matchesSpeciality && matchesType
    })
  }, [searchTerm, distance, speciality, hospitalType])

  useEffect(() => {
    setVisibleCount(INITIAL_VISIBLE)
  }, [searchTerm, distance, speciality, hospitalType])

  const handleHospitalContinue = (hospital: Hospital) => {
    setHospital(hospital)
    navigate(`/appointments/new/${hospital.id}/services`)
  }

  const renderHospitalCard = (hospital: Hospital) => {
    const isSelected = bookingState.hospital?.id === hospital.id
    const distanceText = typeof hospital.distance === 'number' 
      ? `${hospital.distance} miles away` 
      : hospital.distance

    return (
      <Card
        key={hospital.id}
        title={hospital.name}
        subtitle={
          <div className="flex items-start gap-1.5 text-xs">
            <MapPin className="mt-0.5 h-3.5 w-3.5 text-[#3557b1]" strokeWidth={1.8} />
            <span className="text-[#516084] leading-relaxed">{hospital.address}</span>
          </div>
        }
        media={
          <div className="relative h-full w-full">
            <img src={hospital.image} alt={hospital.name} className="h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#13244b]/65 via-transparent to-transparent" />
            <span className="absolute left-3 top-3 rounded-full bg-white/85 px-2.5 py-1 text-[11px] font-semibold text-[#1e3f91] shadow-[0_10px_24px_-18px_rgba(30,63,145,0.7)]">
              {distanceText}
            </span>
          </div>
        }
        tags={hospital.specialities.map((item) => ({
          label: item,
          icon: <Stethoscope className="h-3 w-3 text-[#3557b1]" strokeWidth={1.8} />
        }))}
        meta={[
          {
            icon: <Phone className="h-3.5 w-3.5 text-[#3557b1]" strokeWidth={1.8} />,
            label: hospital.phone
          }
        ]}
        actions={
          <Button
            type="button"
            onClick={() => handleHospitalContinue(hospital)}
            className={`w-full rounded-xl px-3.5 py-2.5 text-xs font-semibold shadow-[0_12px_20px_-18px_rgba(41,87,194,0.65)] ${
              isSelected
                ? 'bg-[#1f4f8a] text-white'
                : 'bg-gradient-to-r from-[#2a6bb7] to-[#1f4f8a] text-white hover:brightness-110'
            }`}
          >
            {isSelected ? 'Selected' : 'Select Hospital'}
          </Button>
        }
        className={isSelected ? 'border-[#2a6bb7] shadow-[0_32px_80px_-48px_rgba(37,84,163,0.55)]' : ''}
      />
    )
  }

  const visibleHospitals = filteredHospitals.slice(0, visibleCount)
  const hasMoreHospitals = visibleCount < filteredHospitals.length

  if (loading) {
    return (
      <div className="space-y-8">
        <AppointmentWizardHeader />
        <div className="flex justify-center items-center py-20">
          <Loader2 className="animate-spin h-12 w-12 text-[#2a6bb7]" />
          <span className="ml-4 text-lg text-[#6f7d95]">Loading hospitals...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-8">
        <AppointmentWizardHeader />
        <div className="rounded-3xl border border-red-200 bg-red-50 p-10 text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Button
            type="button"
            onClick={() => window.location.reload()}
            className="rounded-full px-6 py-3"
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
    <AppointmentWizardHeader />

    <div className="border-b border-[#dfe4f4]" />

    <div className="grid gap-4 md:grid-cols-[minmax(0,2fr)_minmax(0,1fr)_minmax(0,1fr)]">
        <SearchBar
          placeholder="Search for hospitals..."
          value={searchTerm}
          onChange={setSearchTerm}
          className="col-span-full md:col-span-1"
        />
        <div className="relative flex h-12 w-full items-center">
          {/* Custom dropdown for distance (all screens) */}
          <div className="w-full">
            <MobileDropdown
              options={distanceFilters}
              value={distance}
              onChange={setDistance}
              placeholder="Any Distance"
            />
          </div>
        </div>
        <div className="relative flex h-12 w-full items-center">
          {/* Custom dropdown for speciality (all screens) */}
          <div className="w-full">
            <MobileDropdown
              options={specialityOptions.map(opt => ({ label: opt === 'any' ? 'Any Speciality' : opt, value: opt }))}
              value={speciality}
              onChange={setSpeciality}
              placeholder="Any Speciality"
            />
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-semibold uppercase tracking-wide text-[#6f7d95]">Hospital Type:</span>
        <div className="flex rounded-full border border-[#d8e3f3] bg-white p-1 shadow-[0_10px_22px_-20px_rgba(42,107,183,0.4)]">
          {hospitalTypeFilters.map((option) => {
            const active = hospitalType === option.value
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => setHospitalType(option.value as typeof hospitalType)}
                className={`rounded-full px-4 py-2 text-xs font-semibold transition ${
                  active
                    ? 'bg-[#2a6bb7] text-white shadow-[0_10px_20px_-14px_rgba(42,107,183,0.65)]'
                    : 'text-[#47587a] hover:text-[#2a6bb7]'
                }`}
              >
                {option.label}
              </button>
            )
          })}
        </div>
      </div>

      <section className="space-y-6">
        <h3 className="text-lg font-semibold text-[#1b2b4b]">Available Hospitals</h3>
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {visibleHospitals.map((hospital) => renderHospitalCard(hospital))}

          {filteredHospitals.length === 0 && (
            <div className="col-span-full rounded-3xl border border-dashed border-[#d8e3f3] bg-white p-10 text-center text-sm text-[#6f7d95]">
              No hospitals match your filters. Try adjusting your search or speciality.
            </div>
          )}
        </div>

        {hasMoreHospitals && (
          <div className="flex justify-center pt-2">
            <Button
              type="button"
              disabled={loadingMore}
              onClick={() => {
                setLoadingMore(true);
                setTimeout(() => {
                  setVisibleCount((count) => count + LOAD_MORE_INCREMENT);
                  setLoadingMore(false);
                }, 900);
              }}
              className={`rounded-full bg-[#2a6bb7] px-6 py-3 text-sm font-semibold shadow-[0_12px_24px_-16px_rgba(42,107,183,0.7)] hover:bg-[#245ca0] flex items-center gap-2 ${loadingMore ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {loadingMore ? (
                <Loader2 className="animate-spin h-5 w-5 mr-2" />
              ) : null}
              {loadingMore ? 'Loading...' : 'Load more hospitals'}
            </Button>
          </div>
        )}
      </section>
    </div>
  )
}

export default MakeAppointment
