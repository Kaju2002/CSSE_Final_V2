import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  Activity,
  Baby,
  Bandage,
  Brain,
  ChevronRight,
  HeartPulse,
  Microscope,
  ShieldPlus,
  Stethoscope,
  Loader2
} from 'lucide-react'
import Button from '../../ui/Button'
import Card from '../../ui/Card'
import AppointmentWizardHeader from './AppointmentWizardHeader'
import { useAppointmentBooking } from '../../contexts/AppointmentBookingContext'
import { fetchDepartments, type ApiDepartment } from '../../lib/utils/appointmentApi'

type Service = {
  id: string
  title: string
  description: string
  icon: React.ReactNode
}

const slugify = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

const getIconForService = (title: string): React.ReactNode => {
  const normalized = title.toLowerCase()
  
  if (normalized.includes('cardiac') || normalized.includes('heart') || normalized.includes('echo')) {
    return <HeartPulse className="h-6 w-6 text-[#2a6bb7]" strokeWidth={1.8} />
  }
  if (normalized.includes('consultation') || normalized.includes('consult')) {
    return <Stethoscope className="h-6 w-6 text-[#2a6bb7]" strokeWidth={1.8} />
  }
  if (normalized.includes('wellness') || normalized.includes('child')) {
    return <Baby className="h-6 w-6 text-[#2a6bb7]" strokeWidth={1.8} />
  }
  if (normalized.includes('immun') || normalized.includes('vaccin')) {
    return <ShieldPlus className="h-6 w-6 text-[#2a6bb7]" strokeWidth={1.8} />
  }
  if (normalized.includes('neuro') || normalized.includes('brain')) {
    return <Brain className="h-6 w-6 text-[#2a6bb7]" strokeWidth={1.8} />
  }
  if (normalized.includes('imaging') || normalized.includes('diagnostic') || normalized.includes('test')) {
    return <Microscope className="h-6 w-6 text-[#2a6bb7]" strokeWidth={1.8} />
  }
  if (normalized.includes('injury') || normalized.includes('pain') || normalized.includes('therapy')) {
    return <Bandage className="h-6 w-6 text-[#2a6bb7]" strokeWidth={1.8} />
  }
  if (normalized.includes('stress') || normalized.includes('ecg') || normalized.includes('activity')) {
    return <Activity className="h-6 w-6 text-[#2a6bb7]" strokeWidth={1.8} />
  }
  
  return <Stethoscope className="h-6 w-6 text-[#2a6bb7]" strokeWidth={1.8} />
}

const getServicesForDepartment = (department: string): Service[] => {
  const normalized = department.toLowerCase()

  if (normalized.includes('cardio')) {
    return [
      {
        id: `${slugify(department)}-cardiac-consultation`,
        title: 'Cardiac Consultation',
        description: 'Initial assessment and diagnosis of cardiovascular health concerns.',
        icon: <HeartPulse className="h-6 w-6 text-[#2a6bb7]" strokeWidth={1.8} />
      },
      {
        id: `${slugify(department)}-echocardiogram`,
        title: 'Echocardiogram',
        description: 'Detailed ultrasound imaging to evaluate heart structure and function.',
        icon: <Activity className="h-6 w-6 text-[#2a6bb7]" strokeWidth={1.8} />
      },
      {
        id: `${slugify(department)}-stress-test`,
        title: 'Stress Test',
        description: 'Monitored exercise testing to detect cardiac abnormalities.',
        icon: <Stethoscope className="h-6 w-6 text-[#2a6bb7]" strokeWidth={1.8} />
      },
      {
        id: `${slugify(department)}-ecg`,
        title: 'ECG / EKG',
        description: 'Comprehensive electrical analysis to monitor heart rhythms.',
        icon: <Activity className="h-6 w-6 text-[#2a6bb7]" strokeWidth={1.8} />
      }
    ]
  }

  if (normalized.includes('pedi') || normalized.includes('neonatal')) {
    return [
      {
        id: `${slugify(department)}-wellness-check`,
        title: 'Child Wellness Check',
        description: 'Routine growth monitoring and preventive health guidance.',
        icon: <Baby className="h-6 w-6 text-[#2a6bb7]" strokeWidth={1.8} />
      },
      {
        id: `${slugify(department)}-immunization`,
        title: 'Immunization Clinic',
        description: 'Comprehensive vaccination schedules with pediatric specialists.',
        icon: <ShieldPlus className="h-6 w-6 text-[#2a6bb7]" strokeWidth={1.8} />
      },
      {
        id: `${slugify(department)}-specialist-consult`,
        title: 'Specialist Consultation',
        description: 'Targeted assessments for complex pediatric conditions.',
        icon: <Stethoscope className="h-6 w-6 text-[#2a6bb7]" strokeWidth={1.8} />
      },
      {
        id: `${slugify(department)}-development-clinic`,
        title: 'Development Clinic',
        description: 'Early development screening to support lifelong wellbeing.',
        icon: <Brain className="h-6 w-6 text-[#2a6bb7]" strokeWidth={1.8} />
      }
    ]
  }

  if (normalized.includes('neuro')) {
    return [
      {
        id: `${slugify(department)}-neuro-eval`,
        title: 'Neurology Evaluation',
        description: 'Comprehensive assessments for neurological disorders.',
        icon: <Brain className="h-6 w-6 text-[#2a6bb7]" strokeWidth={1.8} />
      },
      {
        id: `${slugify(department)}-imaging`,
        title: 'Advanced Imaging',
        description: 'MRI and CT imaging tailored for neurological diagnostics.',
        icon: <Microscope className="h-6 w-6 text-[#2a6bb7]" strokeWidth={1.8} />
      },
      {
        id: `${slugify(department)}-therapy`,
        title: 'Neuro Therapy',
        description: 'Targeted therapy plans focusing on mobility and recovery.',
        icon: <Activity className="h-6 w-6 text-[#2a6bb7]" strokeWidth={1.8} />
      },
      {
        id: `${slugify(department)}-pain-clinic`,
        title: 'Pain Management Clinic',
        description: 'Personalized plans for chronic neurological pain relief.',
        icon: <Bandage className="h-6 w-6 text-[#2a6bb7]" strokeWidth={1.8} />
      }
    ]
  }

  if (normalized.includes('ortho') || normalized.includes('sports')) {
    return [
      {
        id: `${slugify(department)}-injury-clinic`,
        title: 'Injury Clinic',
        description: 'Immediate assessment and treatment plans for musculoskeletal injuries.',
        icon: <Bandage className="h-6 w-6 text-[#2a6bb7]" strokeWidth={1.8} />
      },
      {
        id: `${slugify(department)}-joint-rehab`,
        title: 'Joint Rehabilitation',
        description: 'Therapy programs designed to restore mobility and strength.',
        icon: <Activity className="h-6 w-6 text-[#2a6bb7]" strokeWidth={1.8} />
      },
      {
        id: `${slugify(department)}-surgical-consult`,
        title: 'Surgical Consultation',
        description: 'Expert surgical planning and pre-operative guidance.',
        icon: <Stethoscope className="h-6 w-6 text-[#2a6bb7]" strokeWidth={1.8} />
      },
      {
        id: `${slugify(department)}-sport-performance`,
        title: 'Sports Performance Clinic',
        description: 'Optimized recovery and conditioning for athletes.',
        icon: <Activity className="h-6 w-6 text-[#2a6bb7]" strokeWidth={1.8} />
      }
    ]
  }

  if (normalized.includes('onco')) {
    return [
      {
        id: `${slugify(department)}-consultation`,
        title: 'Oncology Consultation',
        description: 'Diagnostic planning and second opinions for cancer care.',
        icon: <Microscope className="h-6 w-6 text-[#2a6bb7]" strokeWidth={1.8} />
      },
      {
        id: `${slugify(department)}-chemo`,
        title: 'Chemotherapy Day Care',
        description: 'Personalized chemotherapy and infusion therapy programs.',
        icon: <ShieldPlus className="h-6 w-6 text-[#2a6bb7]" strokeWidth={1.8} />
      },
      {
        id: `${slugify(department)}-radiation`,
        title: 'Radiation Therapy',
        description: 'Precision radiation treatments with advanced planning.',
        icon: <Activity className="h-6 w-6 text-[#2a6bb7]" strokeWidth={1.8} />
      },
      {
        id: `${slugify(department)}-support`,
        title: 'Support Services',
        description: 'Holistic support covering nutrition, counseling, and recovery.',
        icon: <Stethoscope className="h-6 w-6 text-[#2a6bb7]" strokeWidth={1.8} />
      }
    ]
  }

  if (normalized.includes('emerg') || normalized.includes('trauma')) {
    return [
      {
        id: `${slugify(department)}-rapid-response`,
        title: 'Rapid Response',
        description: 'Immediate critical care for life-threatening emergencies.',
        icon: <Activity className="h-6 w-6 text-[#2a6bb7]" strokeWidth={1.8} />
      },
      {
        id: `${slugify(department)}-trauma-team`,
        title: 'Trauma Team Consultation',
        description: 'Coordinated trauma surgical care and stabilization.',
        icon: <Bandage className="h-6 w-6 text-[#2a6bb7]" strokeWidth={1.8} />
      },
      {
        id: `${slugify(department)}-critical-care`,
        title: 'Critical Care Monitoring',
        description: 'Continuous monitoring and intervention for ICU patients.',
        icon: <Stethoscope className="h-6 w-6 text-[#2a6bb7]" strokeWidth={1.8} />
      },
      {
        id: `${slugify(department)}-follow-up`,
        title: 'Stabilization Follow-up',
        description: 'Post-emergency follow-up to support full recovery.',
        icon: <ShieldPlus className="h-6 w-6 text-[#2a6bb7]" strokeWidth={1.8} />
      }
    ]
  }

  return [
    {
      id: `${slugify(department)}-consultation`,
      title: `${department} Consultation`,
      description: `Comprehensive consultation with our ${department.toLowerCase()} specialists.`,
      icon: <Stethoscope className="h-6 w-6 text-[#2a6bb7]" strokeWidth={1.8} />
    },
    {
      id: `${slugify(department)}-diagnostics`,
      title: `${department} Diagnostics`,
      description: 'Advanced diagnostic testing tailored to your care plan.',
      icon: <Microscope className="h-6 w-6 text-[#2a6bb7]" strokeWidth={1.8} />
    },
    {
      id: `${slugify(department)}-therapy`,
      title: `${department} Therapy`,
      description: 'Personalized therapy programs guided by our care team.',
      icon: <Activity className="h-6 w-6 text-[#2a6bb7]" strokeWidth={1.8} />
    },
    {
      id: `${slugify(department)}-follow-up`,
      title: `${department} Follow-up`,
      description: 'Ongoing follow-up visits to support your recovery journey.',
      icon: <ShieldPlus className="h-6 w-6 text-[#2a6bb7]" strokeWidth={1.8} />
    }
  ]
}

const SelectDepartment: React.FC = () => {
  const navigate = useNavigate()
  const { hospitalId } = useParams<{ hospitalId: string }>()
  const { state: bookingState, setHospital, setDepartment, setService } = useAppointmentBooking()
  
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [departments, setDepartments] = useState<ApiDepartment[]>([])

  const selectedDepartmentId = bookingState.department?.id ?? null
  const selectedDepartmentName = bookingState.department?.name ?? ''
  const selectedServiceId = bookingState.service?.id ?? null

  // Fetch departments from API
  useEffect(() => {
    if (!hospitalId) {
      return
    }

    const loadDepartments = async () => {
      try {
        setLoading(true)
        setError(null)

        const response = await fetchDepartments(hospitalId, { limit: 50 })
        
        if (response.success) {
          setDepartments(response.data.departments)
        } else {
          setError('Failed to load departments')
        }
      } catch (err) {
        console.error('Error fetching departments:', err)
        setError('Failed to load departments. Please try again.')
      } finally {
        setLoading(false)
      }
    }

    loadDepartments()
  }, [hospitalId])

  // Set hospital if not already set
  useEffect(() => {
    if (!bookingState.hospital && hospitalId && departments.length > 0) {
      // Try to get hospital info from the first department
      const firstDept = departments[0]
      if (firstDept?.hospitalId) {
        setHospital({
          id: firstDept.hospitalId._id,
          name: firstDept.hospitalId.name,
          address: '',
          phone: '',
          image: '',
          distance: 0,
          specialities: [],
          type: 'Government'
        })
      }
    }
  }, [bookingState.hospital, hospitalId, departments, setHospital])

  // Set default department if none selected
  useEffect(() => {
    if (departments.length === 0) {
      return
    }

    // If a department is selected and it exists in the list, keep it
    if (selectedDepartmentId) {
      const exists = departments.some(d => d._id === selectedDepartmentId)
      if (exists) {
        return
      }
    }

    // Otherwise, select the first department
    const defaultDepartment = departments[0]
    setDepartment({ 
      id: defaultDepartment._id,
      name: defaultDepartment.name, 
      slug: defaultDepartment.slug,
      services: defaultDepartment.services.map(s => ({
        id: s._id,
        title: s.title,
        description: s.description
      }))
    })
  }, [departments, selectedDepartmentId, setDepartment])

  const selectedDepartment = useMemo(() => {
    return departments.find(d => d._id === selectedDepartmentId || d.name === selectedDepartmentName)
  }, [departments, selectedDepartmentId, selectedDepartmentName])

  const services = useMemo(() => {
    if (!selectedDepartment) {
      return []
    }
    
    // Use services from API
    return selectedDepartment.services.map(service => ({
      id: service._id,
      title: service.title,
      description: service.description,
      icon: getIconForService(service.title)
    }))
  }, [selectedDepartment])

  const handleGoToDoctorSelection = () => {
    if (!hospitalId || !bookingState.department || !bookingState.service) {
      return
    }

    const departmentSlug = bookingState.department.slug

    navigate(`/appointments/new/${hospitalId}/services/${departmentSlug}/doctors`, {
      state: {
        hospitalName: bookingState.hospital?.name,
        departmentName: bookingState.department.name,
        departmentId: bookingState.department.id,
        selectedServiceId: bookingState.service.id
      }
    })
  }

  if (loading) {
    return (
      <div className="space-y-8">
        <AppointmentWizardHeader />
        <div className="flex justify-center items-center py-20">
          <Loader2 className="animate-spin h-12 w-12 text-[#2a6bb7]" />
          <span className="ml-4 text-lg text-[#6f7d95]">Loading departments...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-8">
        <AppointmentWizardHeader />
        <div className="rounded-3xl border border-red-200 bg-red-50 p-10 text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Button
            type="button"
            onClick={() => navigate(-1)}
            className="rounded-full px-6 py-3"
          >
            Back to Hospitals
          </Button>
        </div>
      </div>
    )
  }

  if (departments.length === 0) {
    return (
      <div className="space-y-6">
        <AppointmentWizardHeader />
        <h2 className="text-3xl font-semibold text-[#1b2b4b]">No departments found</h2>
        <p className="text-sm text-[#6f7d95]">
          No departments are available for this hospital at the moment.
        </p>
        <Button
          type="button"
          onClick={() => navigate('/appointments/new')}
          className="rounded-full px-6 py-3"
        >
          Back to hospitals
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <AppointmentWizardHeader />

      {/* department select moved down into Available Services section */}

      <section className="space-y-6">
        <div>
          <h3 className="text-xl font-semibold text-[#1b2b4b]">Available Services</h3>
          <p className="text-sm text-[#6f7d95]">
            Select a service from the chosen department to proceed with scheduling.
          </p>

          {/* department select placed here (compact) */}
          <div className="mt-4 max-w-md">
            <div className="relative flex h-11 items-center rounded-[18px] border border-[#d9e3f7] bg-white px-1.5 transition focus-within:border-[#2a6bb7]">
              <select
                value={selectedDepartmentId || ''}
                onChange={(event) => {
                  const dept = departments.find(d => d._id === event.target.value)
                  if (dept) {
                    setDepartment({ 
                      id: dept._id,
                      name: dept.name, 
                      slug: dept.slug,
                      services: dept.services.map(s => ({
                        id: s._id,
                        title: s.title,
                        description: s.description
                      }))
                    })
                  }
                }}
                className="h-full w-full appearance-none rounded-[14px] border-none bg-transparent px-4 pr-10 text-sm font-medium text-[#1f2a44] focus:outline-none"
              >
                {departments.map((dept) => (
                  <option key={dept._id} value={dept._id}>
                    {dept.name}
                  </option>
                ))}
              </select>
              <ChevronRight className="pointer-events-none absolute right-5 h-3.5 w-3.5 rotate-90 text-[#5c6ca0]" />
            </div>
          </div>

        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {services.map((service) => {
            const isActive = selectedServiceId === service.id
            return (
              <Card
                key={service.id}
                className={`min-h-[260px] justify-between transition [&>div]:gap-5 [&>div]:p-6 ${
                  isActive
                    ? 'border-[#2a6bb7] shadow-[0_32px_80px_-48px_rgba(21,52,109,0.4)]'
                    : 'border-[#e4ecf7] shadow-[0_24px_60px_-52px_rgba(21,52,109,0.6)] hover:shadow-[0_30px_80px_-60px_rgba(21,52,109,0.5)]'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#e9f1ff]">
                    {service.icon}
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-lg font-semibold text-[#1b2b4b]">{service.title}</h4>
                    <p className="text-sm leading-relaxed text-[#6f7d95]">{service.description}</p>
                  </div>
                </div>
                <Button
                  type="button"
                  onClick={() =>
                    setService({
                      id: service.id,
                      title: service.title,
                      description: service.description
                    })
                  }
                  className={`mt-auto w-full rounded-xl ${
                    isActive
                      ? 'bg-[#1f4f8a] hover:bg-[#1d4476]'
                      : 'bg-[#2a6bb7] hover:bg-[#245ca0]'
                  }`}
                >
                  {isActive ? 'Selected' : 'Select Service'}
                </Button>
              </Card>
            )
          })}

          {services.length === 0 && (
            <div className="col-span-full rounded-3xl border border-dashed border-[#d8e3f3] bg-white p-10 text-center text-sm text-[#6f7d95]">
              No services found for this department.
            </div>
          )}
        </div>
      </section>

      <footer className="flex flex-wrap items-center justify-between gap-4">
        <Button
          type="button"
          onClick={() => navigate(-1)}
          className="rounded-full border border-[#c8d6ee] bg-[#f5f8ff] px-6 py-3 font-semibold !text-[#1f4f8a] shadow-none hover:bg-[#e9f0ff]"
        >
          Back
        </Button>
        <Button
          type="button"
          disabled={!selectedServiceId}
          onClick={handleGoToDoctorSelection}
          className="rounded-full px-8 py-3 disabled:cursor-not-allowed disabled:opacity-60"
        >
          Next
        </Button>
      </footer>
    </div>
  )
}

export default SelectDepartment
