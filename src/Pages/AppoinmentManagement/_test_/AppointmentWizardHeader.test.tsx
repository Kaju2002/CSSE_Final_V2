import { describe, test, expect } from 'vitest'
import React, { useEffect } from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { AppointmentBookingProvider, useAppointmentBooking } from '../../../contexts/AppointmentBookingContext'
import type { Hospital, AppointmentDepartment, AppointmentDoctor, AppointmentSlot } from '../../../types/appointment'
import AppointmentWizardHeader from '../AppointmentWizardHeader'

// Helper component to set booking state inside the provider
const SetBookingState: React.FC<{ hospital?: Hospital | null; department?: AppointmentDepartment | null; doctor?: AppointmentDoctor | null; slot?: AppointmentSlot | null }> = ({ hospital, department, doctor, slot }) => {
  const { setHospital, setDepartment, setDoctor, setSlot } = useAppointmentBooking()
  useEffect(() => {
    if (hospital !== undefined) setHospital(hospital ?? null)
    if (department !== undefined) setDepartment(department ?? null)
    if (doctor !== undefined) setDoctor(doctor ?? null)
    if (slot !== undefined) setSlot(slot ?? null)
  }, [hospital, department, doctor, slot, setHospital, setDepartment, setDoctor, setSlot])
  return null
}

describe('AppointmentWizardHeader', () => {
  test('shows Select Hospital and correct default progress on base route', async () => {
    render(
      <AppointmentBookingProvider>
        <MemoryRouter initialEntries={["/appointments/new"]}>
          <Routes>
            <Route path="/appointments/new" element={<AppointmentWizardHeader />} />
          </Routes>
        </MemoryRouter>
      </AppointmentBookingProvider>
    )

  // there may be multiple occurrences of the step label in the markup; ensure at least one exists
  const matches = screen.getAllByText(/Select Hospital/i)
  expect(matches.length).toBeGreaterThanOrEqual(1)
    // default computed progress for activeIndex 0 with 6 steps: Math.round((0.5/6)*100) => 8
    await waitFor(() => expect(screen.getByText('8%')).toBeInTheDocument())
  })

  test('progress updates when hospital is selected and on department route', async () => {
  const hospital = { id: 'hospital-1', name: 'Test Hospital', address: '', phone: '', image: '', distance: 0, specialities: [], type: 'Government' as const }

    render(
      <AppointmentBookingProvider>
        <SetBookingState hospital={hospital} />
        <MemoryRouter initialEntries={["/appointments/new/hospital-1/services"]}>
          <Routes>
            <Route path="/appointments/new/:hospitalId/services" element={<AppointmentWizardHeader />} />
          </Routes>
        </MemoryRouter>
      </AppointmentBookingProvider>
    )

  // completedCount should be 1 => progress 25%
  await waitFor(() => expect(screen.getByText('25%')).toBeInTheDocument())
  })

  test('overrideProgress prop forces the shown progress', async () => {
    render(
      <AppointmentBookingProvider>
        <MemoryRouter initialEntries={["/appointments/new"]}>
          <Routes>
            <Route path="/appointments/new" element={<AppointmentWizardHeader overrideProgress={50} />} />
          </Routes>
        </MemoryRouter>
      </AppointmentBookingProvider>
    )

    await waitFor(() => expect(screen.getByText('50%')).toBeInTheDocument())
  })

  test('completed prop sets progress to 100%', async () => {
    render(
      <AppointmentBookingProvider>
        <MemoryRouter initialEntries={["/appointments/new"]}>
          <Routes>
            <Route path="/appointments/new" element={<AppointmentWizardHeader completed />} />
          </Routes>
        </MemoryRouter>
      </AppointmentBookingProvider>
    )

    await waitFor(() => expect(screen.getByText('100%')).toBeInTheDocument())
  })
})
