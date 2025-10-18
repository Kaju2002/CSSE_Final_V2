export type Hospital = {
	id: string
	name: string
	address: string
	phone: string
	image: string
	distance: string
	specialities: string[]
	type: 'Government' | 'Private'
}

export type AppointmentDepartment = {
	name: string
	slug: string
}

export type AppointmentService = {
	id: string
	title: string
	description?: string
}

export type AppointmentDoctor = {
	id: string
	name?: string
	title?: string
}

export type AppointmentSlot = {
	dayIndex: number
	timeLabel: string
	date: string
}

export type PaymentMethod = 'card' | 'paypal' | 'pay_on_site'

export interface AppointmentBookingState {
	hospital: Hospital | null
	department: AppointmentDepartment | null
	service: AppointmentService | null
	doctor: AppointmentDoctor | null
	slot: AppointmentSlot | null
	reasonForVisit: string
	additionalNotes: string
	hasInsurance: boolean
	paymentMethod: PaymentMethod
}

export const initialAppointmentBookingState: AppointmentBookingState = {
	hospital: null,
	department: null,
	service: null,
	doctor: null,
	slot: null,
	reasonForVisit: '',
	additionalNotes: '',
	hasInsurance: true,
	paymentMethod: 'card'
}

export type AppointmentDetailsUpdate = Pick<AppointmentBookingState, 'reasonForVisit' | 'additionalNotes' | 'hasInsurance' | 'paymentMethod'>
