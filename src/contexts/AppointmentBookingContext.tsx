import React, { createContext, useCallback, useContext, useMemo, useState } from 'react'
import type {
	AppointmentBookingState,
	AppointmentDepartment,
	AppointmentDetailsUpdate,
	AppointmentDoctor,
	AppointmentService,
	AppointmentSlot,
	Hospital
} from '../types/appointment'
import { initialAppointmentBookingState } from '../types/appointment'

type AppointmentBookingContextValue = {
	state: AppointmentBookingState
	initialized: boolean
	setHospital: (hospital: Hospital | null) => void
	setDepartment: (department: AppointmentDepartment | null) => void
	setService: (service: AppointmentService | null) => void
	setDoctor: (doctor: AppointmentDoctor | null) => void
	setSlot: (slot: AppointmentSlot | null) => void
	updateDetails: (details: AppointmentDetailsUpdate) => void
	resetBooking: () => void
}

const AppointmentBookingContext = createContext<AppointmentBookingContextValue | undefined>(undefined)

export const AppointmentBookingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
	const [state, setState] = useState<AppointmentBookingState>(initialAppointmentBookingState)
	const [initialized, setInitialized] = useState(false)

	const setHospital = useCallback((hospital: Hospital | null) => {
		setInitialized(true)
		setState(() => {
			if (!hospital) {
				return { ...initialAppointmentBookingState }
			}

			return {
				...initialAppointmentBookingState,
				hospital
			}
		})
	}, [])

	const setDepartment = useCallback((department: AppointmentDepartment | null) => {
		setInitialized(true)
		setState((previous) => ({
			...previous,
			department,
			service: null,
			doctor: null,
			slot: null
		}))
	}, [])

	const setService = useCallback((service: AppointmentService | null) => {
		setInitialized(true)
		setState((previous) => ({
			...previous,
			service,
			doctor: null,
			slot: null
		}))
	}, [])

	const setDoctor = useCallback((doctor: AppointmentDoctor | null) => {
		setInitialized(true)
		setState((previous) => ({
			...previous,
			doctor,
			slot: null
		}))
	}, [])

	const setSlot = useCallback((slot: AppointmentSlot | null) => {
		setInitialized(true)
		setState((previous) => ({
			...previous,
			slot
		}))
	}, [])

	const updateDetails = useCallback((details: AppointmentDetailsUpdate) => {
		setInitialized(true)
		setState((previous) => ({
			...previous,
			...details
		}))
	}, [])

	const resetBooking = useCallback(() => {
		setState({ ...initialAppointmentBookingState })
		setInitialized(false)
	}, [])

	const value = useMemo<AppointmentBookingContextValue>(
		() => ({
			state,
			initialized,
			setHospital,
			setDepartment,
			setService,
			setDoctor,
			setSlot,
			updateDetails,
			resetBooking
		}),
		[state, initialized, setDepartment, setDoctor, setHospital, setService, setSlot, updateDetails, resetBooking]
	)

	return <AppointmentBookingContext.Provider value={value}>{children}</AppointmentBookingContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export const useAppointmentBooking = (): AppointmentBookingContextValue => {
	const context = useContext(AppointmentBookingContext)
	if (!context) {
		throw new Error('useAppointmentBooking must be used within AppointmentBookingProvider')
	}
	return context
}
