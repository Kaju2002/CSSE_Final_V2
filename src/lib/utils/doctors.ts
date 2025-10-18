import doctorsJson from '../data/doctors.json' assert { type: 'json' }

export type DoctorAvailabilityStatus = 'available_today' | 'next_available'

export type DoctorDepartment = {
	slug: string
	name: string
}

export type Doctor = {
	id: string
	name: string
	title: string
	rating: number
	reviewCount: number
	availabilityStatus: DoctorAvailabilityStatus
	nextAvailableDate: string | null
	bio: string
	avatarUrl: string | null
	departments: DoctorDepartment[]
}

const doctors = doctorsJson as Doctor[]

export const getDoctorsByDepartment = (departmentSlug: string): Doctor[] => {
	const normalized = departmentSlug.trim().toLowerCase()

	if (!normalized) {
		return []
	}

	return doctors.filter((doctor) =>
		doctor.departments.some((department) => department.slug.toLowerCase() === normalized)
	)
}

export const getDoctorById = (doctorId: string): Doctor | undefined => {
	return doctors.find((doctor) => doctor.id === doctorId)
}

export const getAllDoctors = (): Doctor[] => {
	return doctors.slice()
}

export const listDoctorDepartments = (): DoctorDepartment[] => {
	const map = new Map<string, DoctorDepartment>()

	doctors.forEach((doctor) => {
		doctor.departments.forEach((department) => {
			const key = department.slug.toLowerCase()
			if (!map.has(key)) {
				map.set(key, { slug: key, name: department.name })
			}
		})
	})

	return Array.from(map.values())
}
