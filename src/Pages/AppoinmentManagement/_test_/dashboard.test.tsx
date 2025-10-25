import React from 'react'
import { describe, test, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import Dashboard from '../Dashboard'

// Basic render test
describe('Dashboard', () => {
  test('renders welcome message', () => {
    render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>
    )
    expect(screen.getByText(/Welcome, Kajanthan U!/)).toBeInTheDocument()
  })

  test('renders all action cards', () => {
    render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>
    )
    expect(screen.getByText('Make New Appointment')).toBeInTheDocument()
    expect(screen.getByText('My Appointments')).toBeInTheDocument()
    expect(screen.getByText('Medical Records')).toBeInTheDocument()
  })

  test('renders all action card buttons', () => {
    render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>
    )
    expect(screen.getByText('Schedule Now')).toBeInTheDocument()
    expect(screen.getAllByText('View Details').length).toBe(2)
  })

  test('renders recent activity section', () => {
    render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>
    )
    expect(screen.getByText('Recent Activity')).toBeInTheDocument()
    expect(
      screen.getByText('Appointment with Dr. Emily White on Oct 26, 2024 at 10:00 AM.')
    ).toBeInTheDocument()
    expect(
      screen.getByText('New lab results available: Blood Test - Oct 20, 2024.')
    ).toBeInTheDocument()
    expect(
      screen.getByText('Prescription refill for Insulin is ready for pickup.')
    ).toBeInTheDocument()
    expect(
      screen.getByText('Your next check-up reminder for Nov 15, 2024.')
    ).toBeInTheDocument()
  })
})
