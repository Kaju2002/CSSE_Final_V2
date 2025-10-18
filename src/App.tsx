import { Routes, Route, Outlet } from "react-router-dom";
import "./App.css";
import Login from "./Pages/Login";
import Home from "./Pages/Home";
import Landing from "./Pages/Landing";
import Dashboard from "./Pages/AppoinmentManagement/Dashboard";
import MakeAppointment from "./Pages/AppoinmentManagement/MakeAppointment";
import SelectDepartment from "./Pages/AppoinmentManagement/SelectDepartment";
import SelectDoctor from "./Pages/AppoinmentManagement/SelectDoctor";
import SlotSelection from "./Pages/AppoinmentManagement/SlotSelection";
import ConfirmAppointment from "./Pages/AppoinmentManagement/ConfirmAppointment";
import AppointmentSuccess from "./Pages/AppoinmentManagement/AppointmentSuccess";
import ViewAppointments from "./Pages/AppoinmentManagement/ViewAppointments";
import MedicalRecords from "./Pages/AppoinmentManagement/MedicalRecords";
import { AppointmentBookingProvider } from "./contexts/AppointmentBookingContext";
import RoleBasedDashboard from "./Pages/RoleBasedDashboard";
import FeedbackPage from "./Pages/Feedback/FeedbackPage";
import UserManagement from "./Pages/Admin/UserManagement";
import StaffManagement from "./Pages/Admin/StaffManagement";
import DoctorDashboard from "./Pages/Doctor/DoctorDashboard";
import DoctorAppointments from "./Pages/Doctor/DoctorAppointments";
import DoctorPatients from "./Pages/Doctor/DoctorPatients";
import DoctorLabResults from "./Pages/Doctor/DoctorLabResults";
import DoctorMessages from "./Pages/Doctor/DoctorMessages";
import DoctorSettings from "./Pages/Doctor/DoctorSettings";
import HospitalStats from "./Pages/Admin/HospitalStats";
import Reports from "./Pages/Admin/Reports";
import Settings from "./Pages/Admin/Settings";
import AppointmentWizard from "./Pages/AppoinmentManagement/AppointmentWizard";
import Step1PersonalInfo from "./Pages/Registration/Step1PersonalInfo";
import Step2Placeholder from "./Pages/Registration/Step2Placeholder";
import Step3MedicalInfo from "./Pages/Registration/Step3MedicalInfo";
import Step4CommunicationCredentials from "./Pages/Registration/Step4CommunicationCredentials";
import Step5RegistrationComplete from "./Pages/Registration/Step5RegistrationComplete";
import Step6RegistrationComplete from "./Pages/Registration/Step6RegistrationComplete";
import CheckIn from "./Pages/MedicalRecordManagement/Staff/CheckIn";
import StaffAuth from "./Pages/MedicalRecordManagement/Staff/StaffAuth";
import ScanHealthCard from "./Pages/MedicalRecordManagement/Staff/ScanHealthCard";
import ScanSuccess from "./Pages/MedicalRecordManagement/Staff/ScanSuccess";
import PatientRecordsOverview from "./Pages/MedicalRecordManagement/Staff/PatientRecordsOverview";
import MedicalHistory from "./Pages/MedicalRecordManagement/Staff/MedicalHistory";
import CheckInConfirmation from "./Pages/MedicalRecordManagement/Staff/CheckInConfirmation";
import KioskWelcome from "./Pages/Kiosk/KioskWelcome";
import KioskCheckInSuccess from "./Pages/Kiosk/KioskCheckInSuccess";
import KioskQRScan from "./Pages/Kiosk/KioskQRScan";
import KioskEmergencyAccess from "./Pages/Kiosk/KioskEmergencyAccess";
import KioskCardError from "./Pages/Kiosk/KioskCardError";
import KioskPatientNotFound from "./Pages/Kiosk/KioskPatientNotFound";
import KioskConnectionError from "./Pages/Kiosk/KioskConnectionError";
import KioskManualPatientSearch from "./Pages/Kiosk/KioskManualPatientSearch";

function App() {
  return (
    <div className="min-h-screen bg-[#f5f8fd]">
      <AppointmentBookingProvider>
        <Routes>
          {/* Staff Authentication Route */}
          <Route path="/staff/auth" element={<StaffAuth />} />
          {/* Staff Check-In Route */}
          <Route path="/staff/check-in" element={<CheckIn />} />
          <Route path="/staff/scan" element={<ScanHealthCard />} />
          <Route path="/staff/scan-success" element={<ScanSuccess />} />
          <Route
            path="/staff/patient-records"
            element={<PatientRecordsOverview />}
          />
          <Route
            path="/staff/check-in-confirmation"
            element={<CheckInConfirmation />}
          />
          <Route path="/kiosk/welcome" element={<KioskWelcome />} />
          <Route path="/kiosk/success" element={<KioskCheckInSuccess />} />
          <Route path="/kiosk/scan" element={<KioskQRScan />} />
          <Route path="/kiosk/emergency" element={<KioskEmergencyAccess />} />
          <Route path="/kiosk/card-error" element={<KioskCardError />} />
          <Route
            path="/kiosk/patient-not-found"
            element={<KioskPatientNotFound />}
          />
          <Route
            path="/kiosk/connection-error"
            element={<KioskConnectionError />}
          />
          <Route
            path="/kiosk/manual-search"
            element={<KioskManualPatientSearch />}
          />
          <Route path="/staff/medical-history" element={<MedicalHistory />} />
          <Route path="/landing" element={<Landing />} />
          <Route path="/register" element={<Step1PersonalInfo />} />
          <Route path="/register/step-2" element={<Step2Placeholder />} />
          <Route path="/register/step-3" element={<Step3MedicalInfo />} />
          <Route
            path="/register/step-4"
            element={<Step4CommunicationCredentials />}
          />
          <Route
            path="/register/step-5"
            element={<Step5RegistrationComplete />}
          />
          <Route
            path="/register/step-6"
            element={<Step6RegistrationComplete />}
          />
          {/* Role-based dashboard route */}
          <Route path="/dashboard" element={<RoleBasedDashboard />} />
          {/* Doctor dashboard and features routes */}
          <Route path="/doctor/dashboard" element={<DoctorDashboard />} />
          <Route path="/doctor/appointments" element={<DoctorAppointments />} />
          <Route path="/doctor/patients" element={<DoctorPatients />} />
          <Route path="/doctor/lab-results" element={<DoctorLabResults />} />
          <Route path="/doctor/messages" element={<DoctorMessages />} />
          <Route path="/doctor/settings" element={<DoctorSettings />} />
          {/* Admin routes */}
          <Route path="/admin/user-management" element={<UserManagement />} />
          <Route path="/admin/staff-management" element={<StaffManagement />} />
          <Route path="/admin/hospital-stats" element={<HospitalStats />} />
          <Route path="/admin/reports" element={<Reports />} />
          <Route path="/admin/settings" element={<Settings />} />
          <Route element={<Home />}>
            <Route index element={<Dashboard />} />
            <Route path="appointments">
              <Route index element={<ViewAppointments />} />
              <Route path="new" element={<AppointmentWizard />}>
                <Route index element={<MakeAppointment />} />
                <Route path=":hospitalId/services" element={<Outlet />}>
                  <Route index element={<SelectDepartment />} />
                  <Route
                    path=":departmentSlug/doctors"
                    element={<SelectDoctor />}
                  />
                  <Route
                    path=":departmentSlug/slots"
                    element={<SlotSelection />}
                  />
                  <Route
                    path=":departmentSlug/confirm"
                    element={<ConfirmAppointment />}
                  />
                  <Route
                    path=":departmentSlug/success"
                    element={<AppointmentSuccess />}
                  />
                </Route>
              </Route>
            </Route>
            <Route path="patient/feedback/:appointmentId" element={<FeedbackPage />} />
            <Route path="medical-records" element={<MedicalRecords />} />
          </Route>
          <Route path="/login" element={<Login />} />
        </Routes>
      </AppointmentBookingProvider>
    </div>
  );
}

export default App;
