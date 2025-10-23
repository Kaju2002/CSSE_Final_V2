import React from 'react'
import { Navigate } from 'react-router-dom'
import { isStaffAuthenticated } from '../../../lib/utils/staffApi'

type Props = {
  children: React.ReactElement
}

const StaffProtectedRoute: React.FC<Props> = ({ children }) => {
  const authenticated = isStaffAuthenticated()

  if (!authenticated) {
    return <Navigate to="/staff/auth" replace />
  }

  return children
}

export default StaffProtectedRoute
