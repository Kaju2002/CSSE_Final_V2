import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Button from '../ui/Button'
import AppointmentWizardHeader from './AppointmentWizardHeader'
import { useAppointmentBooking } from '../contexts/AppointmentBookingContext'
import type { AppointmentDoctor } from '../types/appointment'

const formatDateLabel = (isoDate: string | undefined): string => {
	if (!isoDate) {
		return 'Not selected'
	}

	const date = new Date(isoDate)
	if (Number.isNaN(date.getTime())) {
		return 'Not selected'
	}

	return date.toLocaleDateString(undefined, {
		weekday: 'long',
		month: 'long',
		day: 'numeric',
		year: 'numeric'
	})
}

const ConfirmAppointment: React.FC = () => {
	const navigate = useNavigate()
	const { hospitalId, departmentSlug } = useParams<{ hospitalId: string; departmentSlug: string }>()
	const { state: bookingState, updateDetails } = useAppointmentBooking()

	const [reasonForVisit, setReasonForVisit] = useState('')
	const [additionalNotes, setAdditionalNotes] = useState('')
	const [hasInsurance, setHasInsurance] = useState<boolean>(true)
	const [paymentMethod, setPaymentMethod] = useState<'card' | 'paypal' | 'pay_on_site'>('card')

	useEffect(() => {
		if (!bookingState.slot || !bookingState.doctor) {
			navigate(-1)
		}
	}, [bookingState.doctor, bookingState.slot, navigate])

	const doctor: AppointmentDoctor | null = useMemo(() => {
		if (!bookingState.doctor) {
			return null
		}

		return bookingState.doctor
	}, [bookingState.doctor])

	const formattedDate = formatDateLabel(bookingState.slot?.date)
	const selectedTime = bookingState.slot?.timeLabel ?? 'Not selected'

	const appointmentReference = useMemo(() => {
		const toCode = (value: string | null | undefined, fallback: string) => {
			if (!value) {
				return fallback
			}

			const cleaned = value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase()
			if (!cleaned) {
				return fallback
			}

			return cleaned.slice(0, 4).padEnd(4, 'X')
		}

		const hospitalCode = toCode(bookingState.hospital?.name ?? hospitalId, 'HOSP')
		const doctorCode = toCode(doctor?.name, 'DOCT')
		const slotDate = bookingState.slot?.date ? new Date(bookingState.slot.date) : null
		const dateCode = slotDate && !Number.isNaN(slotDate.getTime()) ? slotDate.toISOString().slice(0, 10).replace(/-/g, '') : '00000000'
		const sequence = Math.floor(Math.random() * 900 + 100).toString()

		return `${hospitalCode}-${doctorCode}-${dateCode}-${sequence}`
	}, [bookingState.hospital?.name, bookingState.slot?.date, doctor?.name, hospitalId])

	const handleBack = () => {
		navigate(-1)
	}

	const handleConfirm = () => {
		if (!hospitalId || !departmentSlug || !bookingState.slot || !bookingState.doctor) {
			return
		}

		updateDetails({
			reasonForVisit,
			additionalNotes,
			hasInsurance,
			paymentMethod
		})

		navigate(`/appointments/new/${hospitalId}/services/${departmentSlug}/success`, {
			state: {
				appointmentReference,
				confirmedAt: new Date().toISOString()
			}
		})
	}

	// Progress and step rendering moved to AppointmentWizardHeader

	const summaryRows = useMemo(
		() => [
			{ label: 'Hospital', value: bookingState.hospital?.name ?? 'Not selected' },
			{ label: 'Department', value: bookingState.department?.name ?? 'Not selected' },
			{ label: 'Doctor', value: doctor ? doctor.name : 'Not selected' },
			{ label: 'Date', value: formattedDate },
			{ label: 'Time', value: selectedTime },
			{ label: 'Service', value: 'Routine Check-up' }
		],
		[bookingState.department?.name, bookingState.hospital?.name, doctor, formattedDate, selectedTime]
	)

	const departmentSummary = bookingState.department?.name ?? 'your selected specialty'

	const paymentOptions: Array<{ id: typeof paymentMethod; label: string; helper?: string }> = useMemo(
		() => [
			{ id: 'card', label: 'Credit / Debit Card', helper: 'Secure checkout with major cards accepted.' },
			{ id: 'paypal', label: 'PayPal', helper: 'You will be redirected to PayPal to complete your payment.' },
			{ id: 'pay_on_site', label: 'Pay On-site', helper: 'Pay with cash or card when you arrive for your appointment.' }
		],
		[]
	)

	return (
		<div className="space-y-8">
			<AppointmentWizardHeader />

			<div className="grid gap-6 xl:grid-cols-[minmax(0,2.4fr)_minmax(0,1.4fr)]">
				<section className="space-y-5">
					<div className="space-y-3 rounded-3xl border border-[#e4e9fb] bg-white/95 p-6 shadow-[0_22px_70px_-50px_rgba(21,52,109,0.28)] backdrop-blur">
						<header className="text-lg font-semibold text-[#1b2b4b]">Reason for Visit</header>
						<textarea
							value={reasonForVisit}
							onChange={(event) => setReasonForVisit(event.target.value)}
							placeholder="Describe your symptoms or reason for the visit"
							rows={4}
							className="w-full rounded-2xl border border-[#d9e2f7] bg-[#f7f9ff] px-4 py-3 text-sm text-[#1b2b4b] outline-none transition focus:border-[#2a6bb7] focus:bg-white"
						/>
					</div>

					<div className="space-y-3 rounded-3xl border border-[#e4e9fb] bg-white/95 p-6 shadow-[0_22px_70px_-50px_rgba(21,52,109,0.28)] backdrop-blur">
						<header className="text-lg font-semibold text-[#1b2b4b]">Additional Notes</header>
						<textarea
							value={additionalNotes}
							onChange={(event) => setAdditionalNotes(event.target.value)}
							placeholder="Any other information the doctor should know"
							rows={3}
							className="w-full rounded-2xl border border-[#d9e2f7] bg-[#f7f9ff] px-4 py-3 text-sm text-[#1b2b4b] outline-none transition focus:border-[#2a6bb7] focus:bg-white"
						/>
					</div>

					<div className="space-y-3 rounded-3xl border border-[#e4e9fb] bg-white/95 p-6 shadow-[0_22px_70px_-50px_rgba(21,52,109,0.28)] backdrop-blur">
						<header className="text-lg font-semibold text-[#1b2b4b]">Insurance Details</header>
						<label className="flex items-start gap-3 text-sm text-[#1b2b4b]">
							<input
								type="checkbox"
								checked={hasInsurance}
								onChange={(event) => setHasInsurance(event.target.checked)}
								className="mt-1 h-4 w-4 rounded border-[#d0daf0] text-[#1f4f8a] focus:ring-[#1f4f8a]"
							/>
							<span>
								I have valid medical insurance
								<p className="text-xs text-[#6f7d95]">Your coverage will be validated upon arrival. Please bring your insurance card.</p>
							</span>
						</label>
						<div className="flex gap-3 rounded-2xl border border-[#f4dcbc] bg-[#fff5e8] px-4 py-3 text-xs text-[#9a6b2f]">
							<span className="inline-flex h-5 w-5 flex-none items-center justify-center rounded-full border border-[#f4c177] text-[11px] font-semibold">i</span>
							<p>Please note that some services or procedures may not be fully covered by your insurance plan. Contact your provider for detailed coverage information.</p>
						</div>
					</div>
				</section>

				<aside className="space-y-5">
					<div className="rounded-3xl border border-[#e4ecff] bg-gradient-to-br from-white via-[#f7f9ff] to-[#eef4ff] p-6 shadow-[0_22px_70px_-50px_rgba(21,52,109,0.28)] backdrop-blur">
						<header className="flex items-center justify-between">
							<div>
								<p className="text-xs font-semibold uppercase tracking-wide text-[#7a89a8]">Lead Specialist</p>
								<h2 className="text-lg font-semibold text-[#1b2b4b]">{doctor ? doctor.name : 'Doctor not selected'}</h2>
							</div>
							<span className="rounded-full bg-[#e6f0ff] px-3 py-1 text-xs font-medium text-[#1f4f8a]">{doctor ? doctor.title : 'Select a doctor'}</span>
						</header>
						<p className="mt-3 text-sm leading-relaxed text-[#5a6a8d]">
							{doctor
								? `Expect a compassionate consultation focused on ${departmentSummary.toLowerCase()}. Arrive with your insurance card and any previous reports for the most effective visit.`
								: 'Complete the previous step to choose a doctor and see personalized visit guidance here.'}
						</p>
					</div>

					{/* Appointment reference - moved from top header */}
					<div className="rounded-2xl border border-[#e5ecff] bg-gradient-to-br from-[#f9fbff] to-white px-5 py-4 text-right shadow-[0_18px_60px_-40px_rgba(21,52,109,0.3)]">
						<p className="text-[11px] font-semibold uppercase tracking-wide text-[#7a89a8]">Reference</p>
						<p className="mt-1 text-lg font-semibold text-[#1f2a44]">{appointmentReference}</p>
						<p className="text-[11px] text-[#8290b0]">Keep this handy for reception and follow-ups.</p>
					</div>
					<div className="space-y-4 rounded-3xl border border-[#e6ebff] bg-white/95 p-6 shadow-[0_22px_70px_-50px_rgba(21,52,109,0.28)] backdrop-blur">
						<header className="flex items-center justify-between text-lg font-semibold text-[#1b2b4b]">
							<span>Appointment Summary</span>
							<span className="rounded-full bg-[#f5f8ff] px-3 py-1 text-xs font-medium text-[#375a9e]">Review</span>
						</header>
						<div className="space-y-3 text-sm text-[#526086]">
							{summaryRows.map(({ label, value }) => (
								<div key={label} className="flex items-center justify-between rounded-2xl border border-[#ecf1ff] bg-[#f9fbff] px-3 py-2">
									<span className="font-medium text-[#6b7a9a]">{label}</span>
									<span className="max-w-[55%] text-right font-semibold text-[#1b2b4b]">{value}</span>
								</div>
							))}
						</div>
						<div className="rounded-2xl bg-gradient-to-r from-[#e7efff] to-[#f7fbff] px-4 py-3 text-xs font-semibold text-[#1f4f8a]">
							<div className="flex items-center justify-between">
								<span>Total Estimated Duration</span>
								<span>30 minutes</span>
							</div>
							<p className="mt-1 text-[11px] font-normal text-[#7082a9]">Arrive 10 minutes early to complete any outstanding paperwork.</p>
						</div>
					</div>

					<div className="space-y-4 rounded-3xl border border-[#e6ebff] bg-white/95 p-6 shadow-[0_22px_70px_-50px_rgba(21,52,109,0.28)] backdrop-blur">
						<header className="text-lg font-semibold text-[#1b2b4b]">Payment Details</header>
						<div className="flex items-center justify-between text-sm text-[#526086]">
							<span>Estimated Cost:</span>
							<span className="text-xl font-semibold text-[#1f4f8a]">$150.00</span>
						</div>
						<p className="text-xs text-[#8994af]">This is an estimate. Final cost may vary based on services rendered.</p>
						<div className="space-y-3">
							{paymentOptions.map((option) => (
								<label
									key={option.id}
									className={`flex cursor-pointer items-start gap-3 rounded-2xl border px-4 py-3 text-sm transition ${
										paymentMethod === option.id
											? 'border-[#1f4f8a] bg-[#f4f8ff] text-[#1b2b4b] shadow-[0_18px_34px_-26px_rgba(21,52,109,0.6)]'
											: 'border-[#dce4f7] text-[#1b2b4b] hover:border-[#c0d4ff] hover:bg-[#f7faff]'
									}`}
								>
									<input
										type="radio"
										name="paymentMethod"
										value={option.id}
										checked={paymentMethod === option.id}
										onChange={() => setPaymentMethod(option.id)}
										className="mt-1 h-4 w-4 border-[#cfd9ef] text-[#1f4f8a] focus:ring-[#1f4f8a]"
									/>
									<div className="space-y-1">
										<p className="font-semibold">{option.label}</p>
										{option.helper ? <p className="text-xs text-[#6f7d95]">{option.helper}</p> : null}
									</div>
								</label>
							))}
						</div>
					</div>
				</aside>
			</div>

			<div className="flex flex-col gap-4 rounded-3xl border border-[#e4ecff] bg-white/95 px-6 py-4 shadow-[0_16px_40px_-34px_rgba(21,52,109,0.3)] backdrop-blur md:flex-row md:items-center md:justify-between">
				<p className="text-xs text-[#6f7d95]">Need to make changes later? You can always reschedule or cancel from your appointments dashboard using the reference code above.</p>
				<div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
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
						className="h-11 rounded-xl bg-gradient-to-r from-[#1f4f8a] via-[#2a6bb7] to-[#4d92ff] px-6 font-semibold text-white shadow-[0_18px_38px_-26px_rgba(33,89,173,0.55)] transition hover:brightness-110"
					>
						Confirm Appointment
					</Button>
				</div>
			</div>
		</div>
	)
}

export default ConfirmAppointment
