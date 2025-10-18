import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Button from '../../ui/Button'
import AppointmentWizardHeader from './AppointmentWizardHeader'
import { getDoctorsByDepartment, type Doctor } from '../../lib/utils/doctors'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useAppointmentBooking } from '../../contexts/AppointmentBookingContext'

type SlotKey = {
	dayIndex: number
	timeLabel: string
}

type GeneratedSlot = SlotKey & {
	isAvailable: boolean
}

const SLOT_INTERVAL_MINUTES = 30
const SLOT_START_MINUTES = 8 * 60
const SLOT_END_MINUTES = 18 * 60

const toTimeLabel = (totalMinutes: number): string => {
	const hours24 = Math.floor(totalMinutes / 60)
	const minutes = totalMinutes % 60
	const suffix = hours24 >= 12 ? 'PM' : 'AM'
	const hours12 = hours24 % 12 === 0 ? 12 : hours24 % 12
	return `${hours12}:${minutes.toString().padStart(2, '0')} ${suffix}`
}

const getWeekStart = (date: Date): Date => {
	const clone = new Date(date)
	const day = clone.getDay()
	const diff = day === 0 ? -6 : 1 - day
	clone.setDate(clone.getDate() + diff)
	clone.setHours(0, 0, 0, 0)
	return clone
}

const buildTimeLabels = (): string[] => {
	const labels: string[] = []
	for (let minutes = SLOT_START_MINUTES; minutes <= SLOT_END_MINUTES; minutes += SLOT_INTERVAL_MINUTES) {
		labels.push(toTimeLabel(minutes))
	}
	return labels
}

const generateSlots = (timeLabels: string[], weekDays: Date[]): GeneratedSlot[][] => {
	return weekDays.map((_, dayIndex) =>
		timeLabels.map((timeLabel, slotIndex) => ({
			dayIndex,
			timeLabel,
			isAvailable: ((dayIndex + 3) * (slotIndex + 5)) % 5 !== 0
		}))
	)
}

const formatSlugToTitle = (value: string | undefined): string => {
	if (!value) {
		return 'department'
	}

	return value
		.split('-')
		.filter(Boolean)
		.map((part) => part.charAt(0).toUpperCase() + part.slice(1))
		.join(' ')
}

const SlotSelection: React.FC = () => {
	const navigate = useNavigate()
	const { hospitalId, departmentSlug } = useParams<{ hospitalId: string; departmentSlug: string }>()
	const { state: bookingState, setSlot, setDoctor } = useAppointmentBooking()

	const deriveInitialWeekStart = () => {
		const slotDate = bookingState.slot?.date ? new Date(bookingState.slot.date) : null
		if (slotDate && !Number.isNaN(slotDate.getTime())) {
			return getWeekStart(slotDate)
		}
		return getWeekStart(new Date())
	}

	const [currentWeekStart, setCurrentWeekStart] = useState<Date>(() => deriveInitialWeekStart())
	const [activeDayIndex, setActiveDayIndex] = useState<number>(() => bookingState.slot?.dayIndex ?? 0)

	useEffect(() => {
		if (!bookingState.doctor || !departmentSlug) {
			navigate(-1)
			return
		}

		const doctors = getDoctorsByDepartment(departmentSlug)
		const doctorExists = doctors.some((doctor) => doctor.id === bookingState.doctor?.id)
		if (!doctorExists) {
			setDoctor(null)
			navigate(-1)
		}
	}, [bookingState.doctor, departmentSlug, navigate, setDoctor])

	const weekDays = useMemo(() => {
		return Array.from({ length: 7 }).map((_, index) => {
			const date = new Date(currentWeekStart)
			date.setDate(currentWeekStart.getDate() + index)
			return date
		})
	}, [currentWeekStart])

	const timeLabels = useMemo(() => buildTimeLabels(), [])
	const slotMatrix = useMemo(() => generateSlots(timeLabels, weekDays), [timeLabels, weekDays])
	const activeSlots = slotMatrix[activeDayIndex] ?? []

	useEffect(() => {
		if (!bookingState.slot) {
			return
		}

		const slotDate = bookingState.slot.date ? new Date(bookingState.slot.date) : null
		if (!slotDate || Number.isNaN(slotDate.getTime())) {
			return
		}

		const desiredWeekStart = getWeekStart(slotDate)
		setCurrentWeekStart(desiredWeekStart)
		setActiveDayIndex(bookingState.slot.dayIndex)
	}, [bookingState.slot])

	const selectedDoctor: Doctor | null = useMemo(() => {
		if (!departmentSlug || !bookingState.doctor?.id) {
			return null
		}
		const doctors = getDoctorsByDepartment(departmentSlug)
		return doctors.find((doctor) => doctor.id === bookingState.doctor?.id) ?? null
	}, [bookingState.doctor?.id, departmentSlug])

	const hospitalName = bookingState.hospital?.name ?? 'the selected hospital'
	const departmentName = bookingState.department?.name ?? formatSlugToTitle(departmentSlug)

	const selectedSlot = bookingState.slot
	const selectedSlotKey: SlotKey | null = selectedSlot
		? { dayIndex: selectedSlot.dayIndex, timeLabel: selectedSlot.timeLabel }
		: null

	const monthLabel = useMemo(() => {
		return currentWeekStart.toLocaleDateString(undefined, {
			month: 'long',
			year: 'numeric'
		})
	}, [currentWeekStart])

	const handlePrevWeek = () => {
		const next = new Date(currentWeekStart)
		next.setDate(currentWeekStart.getDate() - 7)
		setCurrentWeekStart(next)
		setSlot(null)
		setActiveDayIndex(0)
	}

	const handleNextWeek = () => {
		const next = new Date(currentWeekStart)
		next.setDate(currentWeekStart.getDate() + 7)
		setCurrentWeekStart(next)
		setSlot(null)
		setActiveDayIndex(0)
	}

	const handleDaySelect = (dayIndex: number) => {
		setActiveDayIndex(dayIndex)
		if (!bookingState.slot || bookingState.slot.dayIndex !== dayIndex) {
			setSlot(null)
		}
	}

	const handleSlotSelect = (slot: GeneratedSlot) => {
		if (!slot.isAvailable) {
			return
		}
		const selectedDate = new Date(currentWeekStart)
		selectedDate.setDate(currentWeekStart.getDate() + slot.dayIndex)
		selectedDate.setHours(0, 0, 0, 0)

		setSlot({
			dayIndex: slot.dayIndex,
			timeLabel: slot.timeLabel,
			date: selectedDate.toISOString()
		})
		setActiveDayIndex(slot.dayIndex)
	}

	const handleBack = () => {
		navigate(-1)
	}

	const handleConfirm = () => {
		if (!bookingState.slot || !bookingState.doctor || !departmentSlug || !hospitalId) {
			return
		}

		navigate(`/appointments/new/${hospitalId}/services/${departmentSlug}/confirm`, {
			state: {
				hospitalId,
				hospitalName: bookingState.hospital?.name ?? null,
				departmentSlug,
				departmentName: bookingState.department?.name ?? null,
				selectedDoctorId: bookingState.doctor.id,
				selectedServiceId: bookingState.service?.id ?? null,
				selectedSlot: bookingState.slot
			}
		})
	}

	return (
		<div className="space-y-8">
				<AppointmentWizardHeader />

				{/* Doctor summary (avatar, title, breadcrumbs) */}
				<div className="flex items-start gap-4 px-6">
					<div className="relative h-14 w-14 flex-shrink-0 overflow-hidden rounded-2xl bg-[#eaf1ff]">
						{selectedDoctor?.avatarUrl ? (
							<img src={selectedDoctor.avatarUrl} alt={selectedDoctor.name} className="h-full w-full object-cover" />
						) : (
							<div className="flex h-full w-full items-center justify-center text-lg font-semibold text-[#2a6bb7]">
								{selectedDoctor?.name
									?.split(' ')
									.map((segment) => segment.charAt(0))
									.slice(0, 2)
									.join('') ?? 'DR'}
							</div>
						)}
					</div>

					<div className="flex-1 py-1">
						<h1 className="text-2xl font-semibold text-[#1b2b4b]">Select Appointment Slot</h1>
						<p className="text-sm text-[#6f7d95]">
							Schedule a visit with{' '}
							<span className="font-semibold text-[#2a6bb7]">{selectedDoctor ? selectedDoctor.name : 'your doctor'}</span>{' '}
							for the {departmentName} department at{' '}
							<span className="font-semibold text-[#2a6bb7]">{hospitalName}</span>.
						</p>

					</div>

					<div className="ml-auto pt-1">
						<Button
							type="button"
							onClick={handleBack}
							className="h-10 rounded-full border border-[#c8d6ee] bg-[#f5f8ff] px-5 text-sm font-semibold !text-[#1f4f8a] shadow-none hover:bg-[#e9f0ff]"
						>
							Back
						</Button>
					</div>
				</div>

				{/* Availability legend - kept under the doctor summary */}
				<div className="flex flex-wrap items-center gap-4 px-6">
					<div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-[#6f7d95]">
						<div className="inline-flex items-center gap-2 rounded-full bg-[#f5f8ff] px-4 py-2">
							<span className="h-2.5 w-2.5 rounded-full bg-[#2a6bb7]" /> Available
						</div>
						<div className="inline-flex items-center gap-2 rounded-full bg-[#f5f8ff] px-4 py-2">
							<span className="h-2.5 w-2.5 rounded-full bg-[#d3d9ec]" /> Unavailable
						</div>
						<div className="inline-flex items-center gap-2 rounded-full bg-[#f5f8ff] px-4 py-2">
							<span className="h-2.5 w-2.5 rounded-full bg-[#1f4f8a]" /> Selected
						</div>
					</div>
				</div>

			<section className="space-y-6 rounded-3xl border border-[#dee7fb] bg-white p-6 shadow-[0_28px_90px_-60px_rgba(21,52,109,0.58)]">
				<div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
				<div className="flex items-center gap-3">
					<button
						type="button"
						onClick={handlePrevWeek}
						className="flex h-12 w-12 items-center justify-center rounded-full border border-[#d4def2] bg-white text-[#1f4f8a] shadow-[0_18px_30px_-22px_rgba(21,52,109,0.55)] transition hover:border-[#1f4f8a] hover:bg-[#f0f4ff] focus:outline-none focus:ring-2 focus:ring-[#bad0ff] focus:ring-offset-2"
					>
						<ChevronLeft className="h-6 w-6" strokeWidth={2} />
					</button>
						<div className="text-sm font-semibold text-[#1b2b4b]">{monthLabel}</div>
					<button
						type="button"
						onClick={handleNextWeek}
						className="flex h-12 w-12 items-center justify-center rounded-full border border-[#d4def2] bg-white text-[#1f4f8a] shadow-[0_18px_30px_-22px_rgba(21,52,109,0.55)] transition hover:border-[#1f4f8a] hover:bg-[#f0f4ff] focus:outline-none focus:ring-2 focus:ring-[#bad0ff] focus:ring-offset-2"
					>
						<ChevronRight className="h-6 w-6" strokeWidth={2} />
					</button>
					</div>
					<div className="text-xs text-[#6f7d95]">Select a day to view available times.</div>
				</div>

				<div className="-mx-2 flex gap-2 overflow-x-auto px-2 pb-2">
					{weekDays.map((day, index) => {
						const isActive = index === activeDayIndex
						const dateLabel = day.toLocaleDateString(undefined, { day: 'numeric' })
						const weekday = day.toLocaleDateString(undefined, { weekday: 'short' })

						return (
							<button
								key={day.toISOString()}
								type="button"
								onClick={() => handleDaySelect(index)}
								className={`min-w-[95px] rounded-2xl border px-4 py-3 text-left transition ${
									isActive
										? 'border-[#1f4f8a] bg-[#1f4f8a] text-white shadow-[0_30px_70px_-50px_rgba(21,52,109,0.6)]'
										: 'border-[#d7e2f7] bg-[#f6f8ff] text-[#1b2b4b] hover:border-[#1f4f8a]'
								}`}
							>
								<div className="text-xs font-semibold uppercase tracking-wide">{weekday}</div>
								<div className="text-lg font-semibold">{dateLabel}</div>
							</button>
						)
					})}
				</div>

				<DaySlotColumns slots={activeSlots} selectedSlot={selectedSlotKey} onSlotSelect={handleSlotSelect} />
			</section>

			<div className="flex justify-between border-t border-[#e0e8fb] bg-white/90 px-6 py-4 backdrop-blur">
				<Button
					type="button"
					onClick={handleBack}
					className="h-11 rounded-xl border border-[#d4def2] bg-[#f5f8ff] px-6 font-semibold !text-[#1f4f8a] shadow-none hover:bg-[#e7f0ff]"
				>
					Back
				</Button>
				<Button
					type="button"
					onClick={handleConfirm}
					disabled={!selectedSlot}
					className="h-11 rounded-xl bg-[#1f4f8a] px-6 font-semibold text-white disabled:cursor-not-allowed disabled:bg-[#98b3d8]"
				>
					Next
				</Button>
			</div>
		</div>
	)
}

type DaySlotColumnsProps = {
	slots: GeneratedSlot[]
	selectedSlot: SlotKey | null
	onSlotSelect: (slot: GeneratedSlot) => void
}

const getMinutesFromLabel = (label: string): number => {
	const [time, suffix] = label.split(' ')
	if (!time || !suffix) {
		return 0
	}
	const [hoursString, minutesString] = time.split(':')
	const hours = Number.parseInt(hoursString ?? '0', 10)
	const minutes = Number.parseInt(minutesString ?? '0', 10)
	const isPm = suffix.toUpperCase() === 'PM'
	const normalizedHours = (hours % 12) + (isPm ? 12 : 0)
	return normalizedHours * 60 + minutes
}

const DaySlotColumns: React.FC<DaySlotColumnsProps> = ({ slots, selectedSlot, onSlotSelect }) => {
	const buckets = useMemo(() => {
		const bucketMap: Record<'Morning' | 'Afternoon' | 'Evening', GeneratedSlot[]> = {
			Morning: [],
			Afternoon: [],
			Evening: []
		}

		slots.forEach((slot) => {
			const minutes = getMinutesFromLabel(slot.timeLabel)
			if (minutes < 12 * 60) {
				bucketMap.Morning.push(slot)
			} else if (minutes < 17 * 60) {
				bucketMap.Afternoon.push(slot)
			} else {
				bucketMap.Evening.push(slot)
			}
		})

		return bucketMap
	}, [slots])

	const hasSlots = slots.some((slot) => slot.isAvailable)

	return (
		<div className="space-y-6">
			{hasSlots ? (
				(Object.entries(buckets) as Array<[keyof typeof buckets, GeneratedSlot[]]>).map(([label, bucketSlots]) => {
					if (bucketSlots.length === 0) {
						return null
					}

					return (
						<section key={label} className="space-y-3">
							<header className="flex items-center justify-between">
								<h2 className="text-sm font-semibold uppercase tracking-wide text-[#6f7d95]">{label}</h2>
								<span className="text-xs text-[#9aa7c2]">{bucketSlots.length} slots</span>
							</header>
							<div className="grid gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
								{bucketSlots.map((slot) => {
									const isSelected =
										selectedSlot?.timeLabel === slot.timeLabel && selectedSlot?.dayIndex === slot.dayIndex

									return (
										<button
											key={`${slot.dayIndex}-${slot.timeLabel}`}
											type="button"
											onClick={() => onSlotSelect(slot)}
											disabled={!slot.isAvailable}
											className={`rounded-2xl border px-4 py-3 text-sm font-semibold transition ${
												slot.isAvailable
													? isSelected
														? 'border-[#1f4f8a] bg-[#1f4f8a] text-white shadow-[0_26px_68px_-46px_rgba(21,52,109,0.65)]'
														: 'border-[#ced9ef] bg-[#f6f8ff] text-[#1b2b4b] hover:border-[#1f4f8a]'
												: 'cursor-not-allowed border-[#e6ebf7] bg-[#f9faff] text-[#c0c9dc]'
											}`}
										>
											{slot.timeLabel}
										</button>
									)
								})}
							</div>
						</section>
					)
				})
			) : (
				<div className="rounded-2xl border border-dashed border-[#d8e2f5] bg-[#f8faff] p-8 text-center text-sm text-[#7f8dab]">
					No appointment slots are available on this day. Try another day or adjust the filters.
				</div>
			)}
		</div>
	)
}

export default SlotSelection
