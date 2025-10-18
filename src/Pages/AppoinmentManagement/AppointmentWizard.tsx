import React from 'react'
import { Outlet } from 'react-router-dom'

// const formatSlotSummary = (state: AppointmentBookingState): string => {
// 	if (!state.slot) {
// 		return 'Not selected yet'
// 	}

// 	const date = new Date(state.slot.date)
// 	if (Number.isNaN(date.getTime())) {
// 		return state.slot.timeLabel
// 	}

// 	return `${date.toLocaleDateString(undefined, {
// 		month: 'short',
// 		day: 'numeric'
// 	})} · ${state.slot.timeLabel}`
// }

// Header and step computation moved to `AppointmentWizardHeader.tsx`.

const AppointmentWizard: React.FC = () => {
	// Steps are computed in the page-level AppointmentWizardHeader component.

	// const activeStep = useMemo(() => steps.find((step) => step.status === 'current') ?? steps[0], [steps])
	// const completedCount = useMemo(() => steps.filter((step) => step.status === 'complete').length, [steps])
	// const progress = useMemo(() => {
	// 	const raw = ((completedCount + 0.5) / steps.length) * 100
	// 	return Math.min(100, Math.max(0, Math.round(raw)))
	// }, [completedCount, steps.length])

	// const ActiveIcon = activeStep.icon

	return (
		<div className="min-h-[100svh] bg-[#f6f8ff]">
			<div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-10 lg:px-0">
				{/* Header moved into page-level MakeAppointment to avoid duplication */}

				<div className="rounded-[24px] border border-[#e1e6f5] bg-white p-6 shadow-sm">
					<Outlet />
				</div>
			</div>
		</div>
	)
}

export default AppointmentWizard
