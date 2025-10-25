import { render, screen, fireEvent } from '@testing-library/react'
import React from 'react'
import { AppointmentBookingProvider, useAppointmentBooking } from '../contexts/AppointmentBookingContext'
import type { Hospital } from '../types/appointment'

describe('smoke: UI / context', () => {
  it('AppointmentBookingProvider mounts and provides children', () => {
    const Consumer = () => <div data-testid="consumer">ok</div>
    render(
      <AppointmentBookingProvider>
        <Consumer />
      </AppointmentBookingProvider>
    )

    expect(screen.getByTestId('consumer')).toBeInTheDocument()
  })

  it('can read and update booking context via a consumer', () => {
    const TestConsumer = () => {
      const { state, setHospital } = useAppointmentBooking()
      return (
        <div>
          <div data-testid="hospital">{state.hospital ? state.hospital.name ?? 'has' : 'none'}</div>
          <button
            data-testid="set-h"
            onClick={() =>
              setHospital({
                id: 'h1',
                name: 'Test Hospital',
                address: '1 Test St',
                phone: '000',
                image: '',
                specialities: [],
                type: 'Private'
              } as Hospital)
            }
          >
            set
          </button>
        </div>
      )
    }

    render(
      <AppointmentBookingProvider>
        <TestConsumer />
      </AppointmentBookingProvider>
    )

    // initial value should be 'none'
    expect(screen.getByTestId('hospital').textContent).toBe('none')

    // update via setter
    fireEvent.click(screen.getByTestId('set-h'))
    expect(screen.getByTestId('hospital').textContent).toBe('Test Hospital')
  })
})
