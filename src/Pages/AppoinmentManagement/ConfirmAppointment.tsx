import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Button from '../../ui/Button'
import AppointmentWizardHeader from './AppointmentWizardHeader'
import { useAppointmentBooking } from '../../contexts/AppointmentBookingContext'
import type { AppointmentDoctor } from '../../types/appointment'
import { createAppointment, createPayment, fetchCurrentPatient } from '../../lib/utils/appointmentApi'
import { Loader2 } from 'lucide-react'

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
	const [hasInsurance, setHasInsurance] = useState(false)
	const [paymentMethod, setPaymentMethod] = useState<'card' | 'paypal' | 'pay_on_site'>('card')
	const [insuranceCoverageStatus, setInsuranceCoverageStatus] = useState<'idle' | 'checking' | 'covered' | 'not_covered' | 'error'>('idle')
	const [submitting, setSubmitting] = useState(false)
	const [submitError, setSubmitError] = useState<string | null>(null)
	const [patientId, setPatientId] = useState<string | null>(null)
	const [loadingPatient, setLoadingPatient] = useState(true)
	const [patientError, setPatientError] = useState<string | null>(null)

	// Fetch current patient information
	useEffect(() => {
		const loadPatient = async () => {
			try {
				setLoadingPatient(true)
				setPatientError(null)
				
				const response = await fetchCurrentPatient()
				
				if (response.success && response.data.patient) {
					setPatientId(response.data.patient.id)
				} else {
					setPatientError('Failed to load patient information')
				}
			} catch (error: any) {
				console.error('Error fetching patient:', error)
				setPatientError(error.message || 'Failed to load patient information. Please try logging in again.')
			} finally {
				setLoadingPatient(false)
			}
		}

		loadPatient()
	}, [])

	useEffect(() => {
		// Validate all required booking information is present
		if (!bookingState.slot || !bookingState.doctor) {
			console.warn('Missing slot or doctor, redirecting back')
			navigate(-1)
			return
		}

		if (!bookingState.department?.id) {
			console.warn('Missing department ID, redirecting back to department selection')
			navigate(`/appointments/new/${hospitalId}/services`)
			return
		}

		if (!bookingState.service?.id) {
			console.warn('Missing service ID, redirecting back to department selection')
			navigate(`/appointments/new/${hospitalId}/services`)
			return
		}
	}, [bookingState.doctor, bookingState.slot, bookingState.department, bookingState.service, navigate, hospitalId])

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

	const handleConfirm = async () => {
		if (!hospitalId || !departmentSlug || !bookingState.slot || !bookingState.doctor) {
			setSubmitError('Missing required appointment information. Please go back and complete all steps.')
			return
		}

		// Validate required fields
		if (!bookingState.department?.id) {
			setSubmitError('Department information is missing. Please go back and select a department.')
			return
		}

		if (!bookingState.service?.id) {
			setSubmitError('Service information is missing. Please go back and select a service.')
			return
		}

		if (!reasonForVisit.trim()) {
			setSubmitError('Please provide a reason for your visit.')
			return
		}

		if (!patientId) {
			setSubmitError('Patient information not loaded. Please refresh the page.')
			return
		}

		try {
			setSubmitting(true)
			setSubmitError(null)

			// Format the date from slot
			const slotDate = bookingState.slot.date ? new Date(bookingState.slot.date) : new Date()
			const formattedDate = formatDateForApi(slotDate)

			// Create appointment with validated data
			const appointmentData = {
				patientId,
				doctorId: bookingState.doctor.id,
				hospitalId,
				departmentId: bookingState.department.id, // Now guaranteed to exist
				serviceId: bookingState.service.id, // Now guaranteed to exist
				date: formattedDate,
				time: bookingState.slot.timeLabel,
				reason: reasonForVisit,
				notes: additionalNotes,
				hasInsurance,
				paymentMethod
			}

			console.log('Submitting appointment data:', appointmentData) // Debug log

			const appointmentResponse = await createAppointment(appointmentData)

			if (!appointmentResponse.success) {
				throw new Error('Failed to create appointment')
			}

			// If it's a private hospital and payment is required, create payment
			const isPrivateHospital = bookingState.hospital?.type === 'Private'
			if (isPrivateHospital && paymentMethod !== 'pay_on_site') {
				const paymentData = {
					appointmentId: appointmentResponse.data._id || appointmentResponse.data.id,
					patientId,
					amount: 150, // You might want to get this from the service or hospital
					method: paymentMethod
				}

				const paymentResponse = await createPayment(paymentData)

				if (!paymentResponse.success) {
					console.error('Payment failed, but appointment was created')
					// You might want to handle this differently
				}
			}

			// Update context
			updateDetails({
				reasonForVisit,
				additionalNotes,
				hasInsurance,
				paymentMethod
			})

			// Navigate to success page
			navigate(`/appointments/new/${hospitalId}/services/${departmentSlug}/success`, {
				state: {
					appointmentReference,
					confirmedAt: new Date().toISOString(),
					appointmentId: appointmentResponse.data._id || appointmentResponse.data.id
				}
			})
		} catch (error: any) {
			console.error('Error creating appointment:', error)
			
			// Error message is already parsed in the API layer
			const errorMessage = error.message || 'Failed to create appointment. Please try again.'
			setSubmitError(errorMessage)
		} finally {
			setSubmitting(false)
		}
	}

	// Format date to YYYY-MM-DD for API
	const formatDateForApi = (date: Date): string => {
		const year = date.getFullYear()
		const month = String(date.getMonth() + 1).padStart(2, '0')
		const day = String(date.getDate()).padStart(2, '0')
		return `${year}-${month}-${day}`
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

	const paymentOptions = [
		{ id: 'card', label: 'Credit/Debit Card', helper: 'Pay securely online.' },
		{ id: 'paypal', label: 'PayPal', helper: 'Pay using PayPal.' },
		{ id: 'pay_on_site', label: 'Pay at Hospital', helper: 'Pay at the hospital counter.' },
	]
	const isPrivateHospital = bookingState.hospital?.type === 'Private'

	// Mock insurance coverage check function
	function mockInsuranceCoverage(departmentName: string): Promise<boolean> {
		return new Promise((resolve) => {
			setTimeout(() => {
				// Example: Only Cardiology is covered
				resolve(departmentName === 'Cardiology');
			}, 1000);
		});
	}

	useEffect(() => {
		if (hasInsurance && bookingState.department?.name) {
			setInsuranceCoverageStatus('checking');
			mockInsuranceCoverage(bookingState.department.name)
				.then((isCovered) => setInsuranceCoverageStatus(isCovered ? 'covered' : 'not_covered'))
				.catch(() => setInsuranceCoverageStatus('error'));
		} else {
			setInsuranceCoverageStatus('idle');
		}
	}, [hasInsurance, bookingState.department?.name])

	// Debug: Log booking state
	useEffect(() => {
		console.log('Current booking state:', {
			hospital: bookingState.hospital?.id,
			department: bookingState.department,
			service: bookingState.service,
			doctor: bookingState.doctor?.id,
			slot: bookingState.slot,
			patientId
		})
	}, [bookingState, patientId])

	// Show loading state while fetching patient
	if (loadingPatient) {
		return (
			<div className="space-y-8">
				<AppointmentWizardHeader />
				<div className="flex justify-center items-center py-20">
					<Loader2 className="animate-spin h-12 w-12 text-[#2a6bb7]" />
					<span className="ml-4 text-lg text-[#6f7d95]">Loading patient information...</span>
				</div>
			</div>
		)
	}

	// Show error if patient info couldn't be loaded
	if (patientError) {
		return (
			<div className="space-y-8">
				<AppointmentWizardHeader />
				<div className="rounded-3xl border border-red-200 bg-red-50 p-10 text-center">
					<p className="text-red-600 mb-4">{patientError}</p>
					<div className="flex gap-4 justify-center">
						<Button
							type="button"
							onClick={() => window.location.reload()}
							className="rounded-full px-6 py-3"
						>
							Retry
						</Button>
						<Button
							type="button"
							onClick={() => navigate('/login')}
							className="rounded-full px-6 py-3 bg-gray-600"
						>
							Go to Login
						</Button>
					</div>
				</div>
			</div>
		)
	}

	return (
		<div className="space-y-8">
			<AppointmentWizardHeader />

			{/* Validation warnings */}
			{(!bookingState.department?.id || !bookingState.service?.id) && (
				<div className="rounded-3xl border border-yellow-200 bg-yellow-50 p-4 text-sm text-yellow-800">
					<p className="font-semibold mb-2">⚠️ Missing Required Information</p>
					{!bookingState.department?.id && <p>• Department information is missing</p>}
					{!bookingState.service?.id && <p>• Service selection is missing</p>}
					<p className="mt-2">Please go back and complete all previous steps.</p>
				</div>
			)}

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

					{/* Insurance Details Section */}
					<div className="mt-4">
						<label className="flex items-center gap-2">
							<input
								type="checkbox"
								checked={hasInsurance}
								onChange={e => setHasInsurance(e.target.checked)}
								className="accent-blue-600"
							/>
							I have valid medical insurance
						</label>
						{insuranceCoverageStatus === 'checking' && (
							<p className="text-xs text-blue-500 mt-2">Checking insurance coverage...</p>
						)}
						{insuranceCoverageStatus === 'covered' && (
							<p className="text-xs text-green-600 mt-2">Your insurance covers this service. Info will be linked to your appointment.</p>
						)}
						{insuranceCoverageStatus === 'not_covered' && (
							<p className="text-xs text-red-500 mt-2">Your insurance does not cover this service. You may need to pay out-of-pocket.</p>
						)}
						{insuranceCoverageStatus === 'error' && (
							<p className="text-xs text-orange-500 mt-2">Unable to check coverage. Please try again or contact support.</p>
						)}
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

					{isPrivateHospital && (
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
											onChange={() => setPaymentMethod(option.id as 'card' | 'paypal' | 'pay_on_site')}
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
					)}
				</aside>
			</div>

			{submitError && (
				<div className="rounded-3xl border border-red-200 bg-red-50 p-4 text-center text-sm text-red-600">
					{submitError}
				</div>
			)}

			<div className="flex flex-col gap-4 rounded-3xl border border-[#e4ecff] bg-white/95 px-6 py-4 shadow-[0_16px_40px_-34px_rgba(21,52,109,0.3)] backdrop-blur md:flex-row md:items-center md:justify-between">
				<p className="text-xs text-[#6f7d95]">Need to make changes later? You can always reschedule or cancel from your appointments dashboard using the reference code above.</p>
				<div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
					<Button
						type="button"
						onClick={handleBack}
						disabled={submitting}
						className="h-11 rounded-xl border border-[#d4def2] bg-[#f5f8ff] px-6 font-semibold !text-[#1f4f8a] shadow-none hover:bg-[#e7f0ff] disabled:opacity-50"
					>
						Back
					</Button>
					<Button
						type="button"
						onClick={handleConfirm}
						disabled={submitting || !bookingState.department?.id || !bookingState.service?.id || !patientId}
						className="h-11 rounded-xl bg-gradient-to-r from-[#1f4f8a] via-[#2a6bb7] to-[#4d92ff] px-6 font-semibold text-white shadow-[0_18px_38px_-26px_rgba(33,89,173,0.55)] transition hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
					>
						{submitting && <Loader2 className="animate-spin h-4 w-4" />}
						{submitting ? 'Confirming...' : 'Confirm Appointment'}
					</Button>
				</div>
			</div>
		</div>
	)
}

export default ConfirmAppointment
