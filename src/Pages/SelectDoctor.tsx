import React, { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { ArrowUpDown, CalendarClock, ChevronDown, Star, Sun } from 'lucide-react'
import Card from '../ui/Card'
import Button from '../ui/Button'
import AppointmentWizardHeader from './AppointmentWizardHeader'
import hospitalsJson from '../lib/data/hospitals.json' assert { type: 'json' }
import type { Hospital } from '../types/appointment'
import { getDoctorsByDepartment, type Doctor } from '../lib/utils/doctors'
import { useAppointmentBooking } from '../contexts/AppointmentBookingContext'

const hospitals = hospitalsJson as Hospital[]

type LocationState = {
	hospitalName?: string
	departmentName?: string
	selectedServiceId?: string | null
	selectedDoctorId?: string | null
}

const capitalizeFromSlug = (value: string | undefined): string => {
	if (!value) {
		return 'Department'
	}

	return value
		.split('-')
		.filter(Boolean)
		.map((part) => part.charAt(0).toUpperCase() + part.slice(1))
		.join(' ')
}

const bioClampStyles: React.CSSProperties = {
	display: '-webkit-box',
	WebkitLineClamp: 4,
	WebkitBoxOrient: 'vertical',
	overflow: 'hidden'
}

const bioScrollStyles: React.CSSProperties = {
	maxHeight: '8rem',
	overflowY: 'auto',
	paddingRight: '0.25rem'
}

const getAvailabilityBadge = (doctor: Doctor) => {
	if (doctor.availabilityStatus === 'available_today') {
		return {
			label: 'Available Today',
			icon: Sun,
			className: 'bg-[#e7f7ef] text-[#1c7c4d]'
		}
	}

	const nextSlot = doctor.nextAvailableDate ? new Date(doctor.nextAvailableDate) : null
	const formattedDate = nextSlot && !Number.isNaN(nextSlot.getTime())
		? nextSlot.toLocaleDateString(undefined, {
			month: 'short',
			day: 'numeric'
		  })
		: null

	return {
		label: formattedDate ? `Next Available ${formattedDate}` : 'Next Availability Soon',
		icon: CalendarClock,
		className: 'bg-[#f2f4ff] text-[#2a3f9a]'
	}
}

const SelectDoctor: React.FC = () => {
	const navigate = useNavigate()
	const location = useLocation()
	const { hospitalId, departmentSlug } = useParams<{ hospitalId: string; departmentSlug: string }>()
	const state = (location.state as LocationState | null) ?? {}
	const { state: bookingState, setHospital, setDepartment, setDoctor } = useAppointmentBooking()

	const selectedDoctorId = bookingState.doctor?.id ?? null
	const [expandedBioDoctorId, setExpandedBioDoctorId] = useState<string | null>(null)
	const [selectedSpecialization, setSelectedSpecialization] = useState<string>('all')
	const [availabilityFilter, setAvailabilityFilter] = useState<'all' | 'available_today' | 'next_available'>('all')

	const hospital = useMemo(
		() => hospitals.find((candidate) => candidate.id === hospitalId),
		[hospitalId]
	)

	useEffect(() => {
		if (!hospital) {
			return
		}

		if (!bookingState.hospital || bookingState.hospital.id !== hospital.id) {
			setHospital(hospital)
		}
	}, [bookingState.hospital, hospital, setHospital])

	const doctors = useMemo<Doctor[]>(
		() => (departmentSlug ? getDoctorsByDepartment(departmentSlug) : []),
		[departmentSlug]
	)

	const specializationOptions = useMemo(() => {
		const unique = new Map<string, string>()
		doctors.forEach((doctor) => {
			doctor.departments.forEach((department) => {
				if (!unique.has(department.slug)) {
					unique.set(department.slug, department.name)
				}
			})
		})

		return [{ value: 'all', label: 'All Specializations' }, ...Array.from(unique.entries()).map(([value, label]) => ({ value, label }))]
	}, [doctors])

	const filteredDoctors = useMemo(() => {
		return doctors.filter((doctor) => {
			const matchesSpecialization =
				selectedSpecialization === 'all' ||
				doctor.departments.some((department) => department.slug === selectedSpecialization)

			const matchesAvailability =
				availabilityFilter === 'all' || doctor.availabilityStatus === availabilityFilter

			return matchesSpecialization && matchesAvailability
		})
	}, [availabilityFilter, doctors, selectedSpecialization])

	const derivedDepartmentName = useMemo(() => {
		if (!departmentSlug) {
			return state.departmentName ?? null
		}

		const matchedDoctor = doctors.find((doctor) =>
			doctor.departments.some((department) => department.slug === departmentSlug)
		)

		if (matchedDoctor) {
			const matchedDepartment = matchedDoctor.departments.find(
				(department) => department.slug === departmentSlug
			)
			if (matchedDepartment) {
				return matchedDepartment.name
			}
		}

		if (state.departmentName) {
			return state.departmentName
		}

		return departmentSlug ? capitalizeFromSlug(departmentSlug) : null
	}, [departmentSlug, doctors, state.departmentName])

	useEffect(() => {
		if (!departmentSlug) {
			return
		}

		if (bookingState.department?.slug === departmentSlug) {
			return
		}

		const departmentNameToSet = derivedDepartmentName ?? capitalizeFromSlug(departmentSlug)
		setDepartment({ name: departmentNameToSet, slug: departmentSlug })
	}, [bookingState.department?.slug, departmentSlug, derivedDepartmentName, setDepartment])

	useEffect(() => {
		if (!selectedDoctorId) {
			return
		}

		const doctorExists = doctors.some((doctor) => doctor.id === selectedDoctorId)
		if (!doctorExists) {
			setDoctor(null)
		}
	}, [doctors, selectedDoctorId, setDoctor])

	const departmentName = useMemo(() => {
		if (bookingState.department && (!departmentSlug || bookingState.department.slug === departmentSlug)) {
			return bookingState.department.name
		}

		return derivedDepartmentName ?? 'Department'
	}, [bookingState.department, departmentSlug, derivedDepartmentName])

	const handleDoctorSelect = (doctor: Doctor) => {
		if (bookingState.doctor?.id === doctor.id) {
			setDoctor(null)
			return
		}

		setDoctor({
			id: doctor.id,
			name: doctor.name,
			title: doctor.title
		})
	}

	const toggleBioExpansion = (doctorId: string) => {
		setExpandedBioDoctorId((current) => (current === doctorId ? null : doctorId))
	}

	const handleProceed = () => {
		if (!bookingState.doctor || !hospitalId || !departmentSlug) {
			return
		}

		navigate(`/appointments/new/${hospitalId}/services/${departmentSlug}/slots`, {
			state: {
				...state,
				hospitalName: bookingState.hospital?.name ?? state.hospitalName,
				departmentName,
				selectedServiceId: bookingState.service?.id ?? state.selectedServiceId ?? null,
				selectedDoctorId: bookingState.doctor.id
			}
		})
	}

	return (
			<div className="space-y-8">
				<AppointmentWizardHeader />

				<div className="flex flex-wrap items-center gap-4 rounded-3xl border border-[#e0e8fb] bg-white px-6 py-4 shadow-[0_18px_60px_-40px_rgba(21,52,109,0.45)]">
					<div className="flex flex-wrap items-center gap-3 text-sm font-semibold text-[#1b2b4b]">
						<span>Filters:</span>
						<div className="relative">
							<select
								value={selectedSpecialization}
								onChange={(event) => setSelectedSpecialization(event.target.value)}
								className="h-8 appearance-none rounded-full border border-[#cfdbf3] bg-[#f5f8ff] px-3 pr-8 text-xs font-medium text-[#2a6bb7] outline-none focus:border-[#2a6bb7]"
							>
								{specializationOptions.map((option) => (
									<option key={option.value} value={option.value}>
										{option.label}
									</option>
								))}
							</select>
							<ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-3 w-3 -translate-y-1/2 text-[#2a6bb7]" strokeWidth={1.6} />
						</div>
						<div className="relative">
							<select
								value={availabilityFilter}
								onChange={(event) => setAvailabilityFilter(event.target.value as 'all' | 'available_today' | 'next_available')}
								className="h-8 appearance-none rounded-full border border-[#cfdbf3] bg-[#f5f8ff] px-3 pr-8 text-xs font-medium text-[#2a6bb7] outline-none focus:border-[#2a6bb7]"
							>
								<option value="all">Any Availability</option>
								<option value="available_today">Available Today</option>
								<option value="next_available">Next Available</option>
							</select>
							<ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-3 w-3 -translate-y-1/2 text-[#2a6bb7]" strokeWidth={1.6} />
						</div>
					</div>
					<div className="ml-auto flex items-center gap-2 text-sm text-[#6f7d95]">
						<span>Sort By:</span>
						<span className="flex items-center gap-1 rounded-full border border-[#cfdbf3] bg-[#f5f8ff] px-3 py-1 text-xs font-medium text-[#1b2b4b]">
							<ArrowUpDown className="h-3.5 w-3.5" strokeWidth={1.6} /> Recommended
						</span>
					</div>
				</div>

			<section className="space-y-6 rounded-3xl border border-[#e0e8fb] bg-white px-6 py-7 shadow-[0_24px_70px_-54px_rgba(21,52,109,0.45)]">
				<div className="grid items-start gap-5 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
					{filteredDoctors.map((doctor) => {
						const isActive = doctor.id === selectedDoctorId
						const isBioExpanded = expandedBioDoctorId === doctor.id
						const shouldClampBio = !isBioExpanded && doctor.bio.length > 200
						const availabilityBadge = getAvailabilityBadge(doctor)
						const AvailabilityIcon = availabilityBadge.icon

						return (
							<Card
								key={doctor.id}
								className={`justify-between bg-gradient-to-br from-white via-[#f9fbff] to-[#f2f6ff] transition [&>div]:gap-4 [&>div]:p-5 ${
									isActive
										? 'border-[#2a6bb7] shadow-[0_32px_88px_-48px_rgba(21,52,109,0.45)]'
										: 'border-[#e4ecf7] shadow-[0_22px_64px_-52px_rgba(21,52,109,0.6)] hover:shadow-[0_30px_88px_-58px_rgba(21,52,109,0.5)]'
								}`}
							>
								<div className="flex flex-col gap-3.5">
									<div className="flex items-start gap-4">
										<div className="relative h-12 w-12 overflow-hidden rounded-full bg-[#e9f1ff]">
											{doctor.avatarUrl ? (
												<img
													src={doctor.avatarUrl}
													alt={doctor.name}
													className="h-full w-full object-cover"
												/>
											) : (
												<div className="flex h-full w-full items-center justify-center text-lg font-semibold text-[#2a6bb7]">
													{doctor.name
														.split(' ')
														.map((segment) => segment.charAt(0))
														.slice(0, 2)
														.join('')}
												</div>
											)}
										</div>
										<div className="flex-1 space-y-1.5">
											<div className="flex flex-wrap items-start justify-between gap-2">
												<div>
													<h3 className="text-lg font-semibold text-[#1b2b4b]">{doctor.name}</h3>
													<p className="text-sm font-medium text-[#6f7d95] truncate-one-line">{doctor.title}</p>
												</div>
												<div className="flex items-center gap-1 rounded-full bg-[#f5f8ff] px-2.5 py-0.5 text-xs font-semibold text-[#2a6bb7]">
													<Star className="h-3.5 w-3.5 text-[#f7b500]" fill="#f7b500" strokeWidth={0} />
													{doctor.rating.toFixed(1)} ({doctor.reviewCount} Reviews)
												</div>
											</div>
										</div>
									</div>
									<div className="space-y-1.5">
										<span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${availabilityBadge.className}`}>
											<AvailabilityIcon className="h-3.5 w-3.5" strokeWidth={1.8} />
											{availabilityBadge.label}
										</span>
																<div className="relative">
																	<p
																		className={`text-sm leading-relaxed text-[#6f7d95] ${
																			isBioExpanded ? 'bio-scroll' : ''
																		}`}
																		style={isBioExpanded ? bioScrollStyles : shouldClampBio ? bioClampStyles : undefined}
																	>
																		{doctor.bio}
																	</p>
																	{shouldClampBio && !isBioExpanded && (
																		<div className="pointer-events-none absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-[#f5f8ff] via-[#f5f8ff]/80 to-transparent" />
																	)}
																</div>
																{doctor.bio.length > 260 && (
																	<button
																		type="button"
																		onClick={() => toggleBioExpansion(doctor.id)}
																		className="text-xs font-semibold text-[#2a6bb7] hover:text-[#1f4f8a]"
																	>
																		{isBioExpanded ? 'Show Less' : 'Read More'}
																	</button>
																)}
															</div>
								</div>

								<Button
									type="button"
									onClick={() => handleDoctorSelect(doctor)}
									className={`mt-auto w-full rounded-xl ${
										isActive
											? 'bg-[#1f4f8a] hover:bg-[#1d4476]'
											: 'bg-[#2a6bb7] hover:bg-[#245ca0]'
									}`}
								>
									{isActive ? 'Selected' : 'Select Doctor'}
								</Button>
							</Card>
						)
					})}

					{filteredDoctors.length === 0 && (
						<div className="col-span-full rounded-3xl border border-dashed border-[#d8e3f3] bg-white p-10 text-center text-sm text-[#6f7d95]">
							No doctors match the selected filters right now.
						</div>
					)}
				</div>
			</section>

			<div className=" bottom-0 left-0 right-0 flex justify-end border-t border-[#e0e8fb] bg-white/90 px-6 py-4 backdrop-blur">
				<Button
					type="button"
					disabled={!selectedDoctorId}
					onClick={handleProceed}
					className="h-11 rounded-xl bg-[#1f4f8a] px-6 font-semibold text-white disabled:cursor-not-allowed disabled:bg-[#98b3d8]"
				>
					Next
				</Button>
			</div>

		</div>
	)
}

export default SelectDoctor
