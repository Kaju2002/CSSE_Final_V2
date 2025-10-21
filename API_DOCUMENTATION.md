# Hospital Management System - API Documentation

## Table of Contents
- [Overview](#overview)
- [Authentication](#authentication)
- [Base URL](#base-url)
- [Response Format](#response-format)
- [Error Codes](#error-codes)
- [API Endpoints](#api-endpoints)
  - [Auth](#auth)
  - [Staff](#staff)
  - [Patients](#patients)
  - [Doctors](#doctors)
  - [Hospitals](#hospitals)
  - [Departments](#departments)
  - [Services](#services)
  - [Appointments](#appointments)
  - [Slots](#slots)
  - [Medical Records](#medical-records)
  - [Visits](#visits)
  - [Medications](#medications)
  - [Lab Results](#lab-results)
  - [Imaging](#imaging)
  - [Feedback](#feedback)
  - [Insurance](#insurance)
  - [Payments](#payments)
  - [Notifications](#notifications)
  - [Messages](#messages)
  - [Kiosk](#kiosk)
  - [Registration](#registration)
  - [Reports](#reports)
  - [Schedules](#schedules)

---

## Overview

This API provides comprehensive endpoints for managing a hospital system including patients, doctors, appointments, medical records, and more.

**Version:** 1.0.0  
**API Documentation (Swagger):** `http://localhost:5000/api-docs`

---

## Authentication

Most endpoints require JWT authentication. Include the token in the Authorization header:

```
Authorization: Bearer YOUR_JWT_TOKEN
```

### Roles
- **patient** - Patient users
- **staff** - Hospital staff (nurses, receptionists)
- **doctor** - Medical doctors
- **admin** - System administrators

---

## Base URL

```
http://localhost:5000/api
```

---

## Response Format

### Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": {
    // Response data
  }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error message",
  "errors": [
    {
      "field": "fieldName",
      "message": "Error description"
    }
  ]
}
```

---

## Error Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 409 | Conflict |
| 500 | Internal Server Error |

---

## API Endpoints

---

### Auth

#### 1. Login
**POST** `/api/auth/login`

Login user and receive JWT token.

**Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "Password@123"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "65f1a2b3c4d5e6f7g8h9i0j1",
      "email": "user@example.com",
      "name": "John Doe",
      "role": "patient"
    }
  }
}
```

---

#### 2. Register
**POST** `/api/auth/register`

Register a new user.

**Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass@123",
  "role": "patient"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Registration successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "65f1a2b3c4d5e6f7g8h9i0j1",
      "email": "john@example.com",
      "name": "John Doe",
      "role": "patient"
    }
  }
}
```

---

#### 3. Logout
**POST** `/api/auth/logout`

Logout current user.

**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN
```

**Response (200):**
```json
{
  "success": true,
  "message": "Logout successful"
}
```

---

#### 4. Forgot Password
**POST** `/api/auth/forgot-password`

Request password reset email.

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "If the email exists, a reset link has been sent"
}
```

---

#### 5. Reset Password
**POST** `/api/auth/reset-password`

Reset password with token.

**Request Body:**
```json
{
  "token": "reset_token_here",
  "newPassword": "NewPass@123"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Password reset successful"
}
```

---

### Staff

#### 1. Staff Login
**POST** `/api/staff/login`

Staff member login.

**Request Body:**
```json
{
  "email": "staff@hospital.com",
  "password": "StaffPass@123"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "65f1a2b3c4d5e6f7g8h9i0j1",
      "email": "staff@hospital.com",
      "name": "Jane Smith",
      "role": "staff"
    },
    "staff": {
      "id": "65f1a2b3c4d5e6f7g8h9i0j2",
      "staffId": "STF001",
      "department": "Emergency",
      "role": "nurse"
    }
  }
}
```

---

#### 2. Get All Staff
**GET** `/api/staff`

Get list of all staff members (Admin only).

**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN
```

**Query Parameters:**
- `department` (optional) - Filter by department
- `role` (optional) - Filter by role (nurse, doctor, admin, receptionist)
- `page` (optional, default: 1) - Page number
- `limit` (optional, default: 20) - Results per page

**Response (200):**
```json
{
  "success": true,
  "data": {
    "staff": [
      {
        "id": "65f1a2b3c4d5e6f7g8h9i0j2",
        "staffId": "STF001",
        "department": "Emergency",
        "role": "nurse",
        "userId": {
          "name": "Jane Smith",
          "email": "jane@hospital.com",
          "isActive": true
        }
      }
    ],
    "pagination": {
      "total": 50,
      "page": 1,
      "limit": 20,
      "pages": 3
    }
  }
}
```

---

### Patients

#### 1. Search Patients
**GET** `/api/patients`

Search for patients (Staff/Doctor/Admin only).

**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN
```

**Query Parameters:**
- `search` (optional) - Search by name, MRN, card number, or phone
- `page` (optional, default: 1)
- `limit` (optional, default: 20)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "patients": [
      {
        "id": "65f1a2b3c4d5e6f7g8h9i0j3",
        "mrn": "MRN123456",
        "firstName": "John",
        "lastName": "Doe",
        "dob": "1990-05-15",
        "gender": "Male",
        "bloodType": "O+",
        "contactInfo": {
          "phone": "+1234567890",
          "email": "john@example.com",
          "address": "123 Main St"
        },
        "allergies": ["Penicillin"],
        "cardNumber": "DHC001234"
      }
    ],
    "pagination": {
      "total": 100,
      "page": 1,
      "limit": 20,
      "pages": 5
    }
  }
}
```

---

#### 2. Get Patient by ID
**GET** `/api/patients/:id`

Get detailed patient information.

**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "patient": {
      "id": "65f1a2b3c4d5e6f7g8h9i0j3",
      "mrn": "MRN123456",
      "firstName": "John",
      "lastName": "Doe",
      "dob": "1990-05-15",
      "gender": "Male",
      "bloodType": "O+",
      "contactInfo": {
        "phone": "+1234567890",
        "email": "john@example.com",
        "address": "123 Main St"
      },
      "allergies": ["Penicillin"],
      "medicalHistory": "No significant history",
      "lastAccess": "2024-01-15T10:30:00Z",
      "assignedClinician": {
        "id": "65f1a2b3c4d5e6f7g8h9i0j4",
        "name": "Dr. Sarah Johnson",
        "specialization": "General Medicine"
      }
    }
  }
}
```

---

#### 3. Create Patient
**POST** `/api/patients`

Register a new patient.

**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json
```

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "dob": "1990-05-15",
  "gender": "Male",
  "contactInfo": {
    "phone": "+1234567890",
    "email": "john@example.com",
    "address": "123 Main St"
  },
  "allergies": ["Penicillin"],
  "bloodType": "O+",
  "medicalHistory": "No significant history",
  "cardNumber": "DHC001234"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Patient created successfully",
  "data": {
    "patient": {
      "id": "65f1a2b3c4d5e6f7g8h9i0j3",
      "mrn": "MRN1705324800000",
      "firstName": "John",
      "lastName": "Doe",
      "dob": "1990-05-15",
      "gender": "Male",
      "bloodType": "O+",
      "contactInfo": {
        "phone": "+1234567890",
        "email": "john@example.com",
        "address": "123 Main St"
      }
    }
  }
}
```

---

#### 4. Scan Patient
**POST** `/api/patients/scan`

Scan patient card/QR code for check-in.

**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN
```

**Request Body:**
```json
{
  "cardNumber": "DHC001234"
}
```

OR

```json
{
  "mrn": "MRN123456"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "patient": {
      "id": "65f1a2b3c4d5e6f7g8h9i0j3",
      "mrn": "MRN123456",
      "firstName": "John",
      "lastName": "Doe",
      "dob": "1990-05-15"
    }
  }
}
```

---

#### 5. Check-in Patient
**POST** `/api/patients/checkin`

Check in a patient for appointment.

**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN
```

**Request Body:**
```json
{
  "patientId": "65f1a2b3c4d5e6f7g8h9i0j3",
  "appointmentId": "65f1a2b3c4d5e6f7g8h9i0j5",
  "kioskLocation": "Main Lobby"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Check-in successful",
  "data": {
    "checkIn": {
      "id": "65f1a2b3c4d5e6f7g8h9i0j6",
      "patientId": "65f1a2b3c4d5e6f7g8h9i0j3",
      "appointmentId": "65f1a2b3c4d5e6f7g8h9i0j5",
      "checkInTime": "2024-01-15T10:30:00Z",
      "kioskLocation": "Main Lobby",
      "ticketNumber": "T1705324800000"
    },
    "ticketNumber": "T1705324800000"
  }
}
```

---

#### 6. Get Patient Records
**GET** `/api/patients/:id/records`

Get all medical records for a patient.

**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "records": [
      {
        "id": "65f1a2b3c4d5e6f7g8h9i0j7",
        "recordType": "diagnosis",
        "description": "Common Cold",
        "date": "2024-01-10T14:00:00Z",
        "doctorId": {
          "name": "Dr. Sarah Johnson",
          "specialization": "General Medicine"
        }
      }
    ]
  }
}
```

---

#### 7. Get Patient Summary
**GET** `/api/patients/:id/summary`

Get comprehensive patient summary.

**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "patient": {
      "id": "65f1a2b3c4d5e6f7g8h9i0j3",
      "firstName": "John",
      "lastName": "Doe",
      "mrn": "MRN123456"
    },
    "recentAppointments": [],
    "recentRecords": []
  }
}
```

---

### Doctors

#### 1. Get All Doctors
**GET** `/api/doctors`

Get list of doctors (public endpoint).

**Query Parameters:**
- `departmentSlug` (optional) - Filter by department slug
- `departmentId` (optional) - Filter by department ID
- `hospitalId` (optional) - Filter by hospital
- `specialization` (optional) - Filter by specialization
- `page` (optional, default: 1)
- `limit` (optional, default: 20)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "doctors": [
      {
        "id": "65f1a2b3c4d5e6f7g8h9i0j4",
        "name": "Dr. Sarah Johnson",
        "specialization": "Cardiology",
        "profileImage": "https://cloudinary.com/...",
        "rating": 4.8,
        "reviewCount": 120,
        "bio": "Experienced cardiologist with 15 years of practice",
        "contactInfo": {
          "phone": "+1234567890",
          "email": "sarah.johnson@hospital.com"
        },
        "departmentId": {
          "name": "Cardiology",
          "slug": "cardiology"
        },
        "hospitalId": {
          "name": "City General Hospital"
        }
      }
    ],
    "pagination": {
      "total": 45,
      "page": 1,
      "limit": 20,
      "pages": 3
    }
  }
}
```

---

#### 2. Get Doctor by ID
**GET** `/api/doctors/:id`

Get detailed doctor information.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "doctor": {
      "id": "65f1a2b3c4d5e6f7g8h9i0j4",
      "name": "Dr. Sarah Johnson",
      "specialization": "Cardiology",
      "profileImage": "https://cloudinary.com/...",
      "rating": 4.8,
      "reviewCount": 120,
      "bio": "Experienced cardiologist",
      "contactInfo": {
        "phone": "+1234567890",
        "email": "sarah.johnson@hospital.com"
      },
      "availableSlots": [
        {
          "date": "2024-01-20",
          "time": "09:00 AM"
        }
      ]
    }
  }
}
```

---

### Hospitals

#### 1. Get All Hospitals
**GET** `/api/hospitals`

Get list of hospitals.

**Query Parameters:**
- `type` (optional) - Filter by type (Government, Private)
- `speciality` (optional) - Filter by speciality
- `page` (optional, default: 1)
- `limit` (optional, default: 20)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "hospitals": [
      {
        "id": "65f1a2b3c4d5e6f7g8h9i0j8",
        "name": "City General Hospital",
        "address": "123 Hospital Rd",
        "phone": "+1234567890",
        "type": "Government",
        "distance": 2.5,
        "image": "https://cloudinary.com/...",
        "specialities": ["Cardiology", "Neurology", "Orthopedics"]
      }
    ],
    "pagination": {
      "total": 15,
      "page": 1,
      "limit": 20,
      "pages": 1
    }
  }
}
```

---

### Departments

#### 1. Get All Departments
**GET** `/api/departments`

Get list of departments.

**Query Parameters:**
- `hospitalId` (optional) - Filter by hospital ID
- `page` (optional, default: 1)
- `limit` (optional, default: 50)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "departments": [
      {
        "id": "65f1a2b3c4d5e6f7g8h9i0j9",
        "name": "Cardiology",
        "slug": "cardiology",
        "hospitalId": {
          "name": "City General Hospital"
        },
        "services": [
          {
            "id": "65f1a2b3c4d5e6f7g8h9i0j10",
            "title": "Echocardiogram"
          }
        ]
      }
    ],
    "pagination": {
      "total": 20,
      "page": 1,
      "limit": 50,
      "pages": 1
    }
  }
}
```

---

#### 2. Get Department by ID
**GET** `/api/departments/:id`

Get detailed department information.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "department": {
      "id": "65f1a2b3c4d5e6f7g8h9i0j9",
      "name": "Cardiology",
      "slug": "cardiology",
      "hospitalId": {
        "id": "65f1a2b3c4d5e6f7g8h9i0j8",
        "name": "City General Hospital"
      },
      "services": []
    }
  }
}
```

---

#### 3. Create Department
**POST** `/api/departments`

Create a new department (Admin only).

**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "Cardiology",
  "slug": "cardiology",
  "hospitalId": "65f1a2b3c4d5e6f7g8h9i0j8",
  "services": ["65f1a2b3c4d5e6f7g8h9i0j10"]
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Department created successfully",
  "data": {
    "department": {
      "id": "65f1a2b3c4d5e6f7g8h9i0j9",
      "name": "Cardiology",
      "slug": "cardiology",
      "hospitalId": "65f1a2b3c4d5e6f7g8h9i0j8"
    }
  }
}
```

---

#### 4. Update Department
**PUT** `/api/departments/:id`

Update a department (Admin only).

**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "Cardiology Department",
  "slug": "cardiology",
  "services": ["65f1a2b3c4d5e6f7g8h9i0j10", "65f1a2b3c4d5e6f7g8h9i0j11"]
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Department updated successfully",
  "data": {
    "department": {
      "id": "65f1a2b3c4d5e6f7g8h9i0j9",
      "name": "Cardiology Department",
      "slug": "cardiology"
    }
  }
}
```

---

### Services

#### 1. Get All Services
**GET** `/api/services`

Get list of services.

**Query Parameters:**
- `departmentId` (optional) - Filter by department ID
- `page` (optional, default: 1)
- `limit` (optional, default: 50)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "services": [
      {
        "id": "65f1a2b3c4d5e6f7g8h9i0j10",
        "title": "Echocardiogram",
        "description": "Non-invasive ultrasound test for heart health assessment",
        "departmentId": {
          "id": "65f1a2b3c4d5e6f7g8h9i0j9",
          "name": "Cardiology"
        }
      }
    ],
    "pagination": {
      "total": 45,
      "page": 1,
      "limit": 50,
      "pages": 1
    }
  }
}
```

---

#### 2. Get Service by ID
**GET** `/api/services/:id`

Get detailed service information.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "service": {
      "id": "65f1a2b3c4d5e6f7g8h9i0j10",
      "title": "Echocardiogram",
      "description": "Non-invasive ultrasound test for heart health assessment",
      "departmentId": {
        "id": "65f1a2b3c4d5e6f7g8h9i0j9",
        "name": "Cardiology"
      }
    }
  }
}
```

---

#### 3. Create Service
**POST** `/api/services`

Create a new service (Admin only).

**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json
```

**Request Body:**
```json
{
  "title": "Echocardiogram",
  "description": "Non-invasive ultrasound test for heart health assessment",
  "departmentId": "65f1a2b3c4d5e6f7g8h9i0j9"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Service created successfully",
  "data": {
    "service": {
      "id": "65f1a2b3c4d5e6f7g8h9i0j10",
      "title": "Echocardiogram",
      "description": "Non-invasive ultrasound test for heart health assessment",
      "departmentId": "65f1a2b3c4d5e6f7g8h9i0j9"
    }
  }
}
```

---

#### 4. Update Service
**PUT** `/api/services/:id`

Update a service (Admin only).

**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json
```

**Request Body:**
```json
{
  "title": "Advanced Echocardiogram",
  "description": "Comprehensive cardiac ultrasound with 3D imaging"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Service updated successfully",
  "data": {
    "service": {
      "id": "65f1a2b3c4d5e6f7g8h9i0j10",
      "title": "Advanced Echocardiogram",
      "description": "Comprehensive cardiac ultrasound with 3D imaging"
    }
  }
}
```

---

#### 5. Delete Service
**DELETE** `/api/services/:id`

Delete a service (Admin only).

**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN
```

**Response (200):**
```json
{
  "success": true,
  "message": "Service deleted successfully"
}
```

---

### Appointments

#### 1. Get Appointments
**GET** `/api/appointments`

Get appointments list.

**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN
```

**Query Parameters:**
- `patientId` (optional) - Filter by patient
- `doctorId` (optional) - Filter by doctor
- `hospitalId` (optional) - Filter by hospital
- `status` (optional) - Filter by status (Scheduled, Checked In, Completed, Cancelled, No Show)
- `date` (optional) - Filter by date (YYYY-MM-DD)
- `page` (optional, default: 1)
- `limit` (optional, default: 20)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "appointments": [
      {
        "id": "65f1a2b3c4d5e6f7g8h9i0j5",
        "date": "2024-01-20",
        "time": "10:00 AM",
        "status": "Scheduled",
        "reason": "Regular checkup",
        "patientId": {
          "firstName": "John",
          "lastName": "Doe",
          "contactInfo": {
            "phone": "+1234567890"
          }
        },
        "doctorId": {
          "name": "Dr. Sarah Johnson",
          "specialization": "Cardiology"
        },
        "hospitalId": {
          "name": "City General Hospital",
          "address": "123 Hospital Rd"
        },
        "departmentId": {
          "name": "Cardiology"
        }
      }
    ],
    "pagination": {
      "total": 30,
      "page": 1,
      "limit": 20,
      "pages": 2
    }
  }
}
```

---

#### 2. Create Appointment
**POST** `/api/appointments`

Create a new appointment.

**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN
```

**Request Body:**
```json
{
  "patientId": "65f1a2b3c4d5e6f7g8h9i0j3",
  "doctorId": "65f1a2b3c4d5e6f7g8h9i0j4",
  "hospitalId": "65f1a2b3c4d5e6f7g8h9i0j8",
  "departmentId": "65f1a2b3c4d5e6f7g8h9i0j9",
  "serviceId": "65f1a2b3c4d5e6f7g8h9i0j10",
  "date": "2024-01-20",
  "time": "10:00 AM",
  "reason": "Regular checkup",
  "hasInsurance": true,
  "paymentMethod": "card"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Appointment created successfully",
  "data": {
    "appointment": {
      "id": "65f1a2b3c4d5e6f7g8h9i0j5",
      "date": "2024-01-20",
      "time": "10:00 AM",
      "status": "Scheduled"
    }
  }
}
```

---

#### 3. Cancel Appointment
**DELETE** `/api/appointments/:id`

Cancel an appointment.

**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN
```

**Response (200):**
```json
{
  "success": true,
  "message": "Appointment cancelled successfully",
  "data": {
    "appointment": {
      "id": "65f1a2b3c4d5e6f7g8h9i0j5",
      "status": "Cancelled"
    }
  }
}
```

---

### Slots

#### 1. Get Available Slots
**GET** `/api/slots`

Get available time slots for a doctor.

**Query Parameters:**
- `doctorId` (required) - Doctor ID
- `date` (required) - Date (YYYY-MM-DD)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "slots": [
      {
        "id": "65f1a2b3c4d5e6f7g8h9i0j11",
        "doctorId": "65f1a2b3c4d5e6f7g8h9i0j4",
        "date": "2024-01-20",
        "timeLabel": "09:00 AM",
        "isAvailable": true
      },
      {
        "id": "65f1a2b3c4d5e6f7g8h9i0j12",
        "doctorId": "65f1a2b3c4d5e6f7g8h9i0j4",
        "date": "2024-01-20",
        "timeLabel": "10:00 AM",
        "isAvailable": true
      }
    ]
  }
}
```

---

### Medical Records

#### 1. Get Medical Records
**GET** `/api/medical-records`

Get medical records.

**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN
```

**Query Parameters:**
- `patientId` (optional) - Filter by patient
- `recordType` (optional) - Filter by type (diagnosis, procedure, medication, lab, imaging, allergy, immunization, document)
- `page` (optional, default: 1)
- `limit` (optional, default: 20)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "records": [
      {
        "id": "65f1a2b3c4d5e6f7g8h9i0j7",
        "recordType": "diagnosis",
        "description": "Hypertension - Stage 1",
        "status": "Active",
        "date": "2024-01-15T10:30:00Z",
        "files": ["https://cloudinary.com/..."],
        "patientId": {
          "firstName": "John",
          "lastName": "Doe",
          "mrn": "MRN123456"
        },
        "doctorId": {
          "name": "Dr. Sarah Johnson",
          "specialization": "Cardiology"
        }
      }
    ],
    "pagination": {
      "total": 25,
      "page": 1,
      "limit": 20,
      "pages": 2
    }
  }
}
```

---

#### 2. Create Medical Record
**POST** `/api/medical-records`

Create a new medical record (Staff/Doctor only).

**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: multipart/form-data
```

**Request Body (FormData):**
```
patientId: 65f1a2b3c4d5e6f7g8h9i0j3
doctorId: 65f1a2b3c4d5e6f7g8h9i0j4
recordType: diagnosis
description: Hypertension - Stage 1
status: Active
files: [File, File]
```

**Response (201):**
```json
{
  "success": true,
  "message": "Medical record created successfully",
  "data": {
    "record": {
      "id": "65f1a2b3c4d5e6f7g8h9i0j7",
      "recordType": "diagnosis",
      "description": "Hypertension - Stage 1",
      "files": ["https://cloudinary.com/record1.pdf"]
    }
  }
}
```

---

### Visits

#### 1. Get Visits
**GET** `/api/visits`

Get visit records (Staff/Doctor/Admin only).

**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN
```

**Query Parameters:**
- `patientId` (optional) - Filter by patient ID
- `doctorId` (optional) - Filter by doctor ID
- `page` (optional, default: 1)
- `limit` (optional, default: 20)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "visits": [
      {
        "id": "65f1a2b3c4d5e6f7g8h9i0j20",
        "patientId": {
          "firstName": "John",
          "lastName": "Doe",
          "mrn": "MRN123456"
        },
        "doctorId": {
          "name": "Dr. Sarah Johnson"
        },
        "department": "Emergency",
        "reason": "Chest pain and difficulty breathing",
        "triageLevel": 2,
        "timestamp": "2024-01-15T14:30:00Z",
        "notes": "Patient appears stable, vitals checked"
      }
    ],
    "pagination": {
      "total": 50,
      "page": 1,
      "limit": 20,
      "pages": 3
    }
  }
}
```

---

#### 2. Create Visit
**POST** `/api/visits`

Create a new visit record (Staff/Doctor/Admin only).

**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json
```

**Request Body:**
```json
{
  "patientId": "65f1a2b3c4d5e6f7g8h9i0j3",
  "doctorId": "65f1a2b3c4d5e6f7g8h9i0j4",
  "department": "Emergency",
  "reason": "Chest pain and difficulty breathing",
  "triageLevel": 2,
  "timestamp": "2024-01-15T14:30:00Z",
  "notes": "Patient appears stable, vitals checked"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Visit created successfully",
  "data": {
    "visit": {
      "id": "65f1a2b3c4d5e6f7g8h9i0j20",
      "patientId": "65f1a2b3c4d5e6f7g8h9i0j3",
      "department": "Emergency",
      "triageLevel": 2
    }
  }
}
```

---

### Medications

#### 1. Get Medications
**GET** `/api/medications`

Get medication records.

**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN
```

**Query Parameters:**
- `patientId` (optional) - Filter by patient ID
- `status` (optional) - Filter by status (Active, Completed)
- `page` (optional, default: 1)
- `limit` (optional, default: 20)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "medications": [
      {
        "id": "65f1a2b3c4d5e6f7g8h9i0j21",
        "patientId": {
          "firstName": "John",
          "lastName": "Doe",
          "mrn": "MRN123456"
        },
        "name": "Lisinopril",
        "dosage": "10mg",
        "frequency": "Once daily",
        "status": "Active",
        "prescribedBy": {
          "name": "Dr. Sarah Johnson"
        },
        "startDate": "2024-01-15T00:00:00Z",
        "endDate": "2024-02-15T00:00:00Z"
      }
    ],
    "pagination": {
      "total": 15,
      "page": 1,
      "limit": 20,
      "pages": 1
    }
  }
}
```

---

#### 2. Create Medication
**POST** `/api/medications`

Create a new medication record (Staff/Doctor/Admin only).

**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json
```

**Request Body:**
```json
{
  "patientId": "65f1a2b3c4d5e6f7g8h9i0j3",
  "name": "Lisinopril",
  "dosage": "10mg",
  "frequency": "Once daily",
  "status": "Active",
  "prescribedBy": "65f1a2b3c4d5e6f7g8h9i0j4",
  "startDate": "2024-01-15T00:00:00Z",
  "endDate": "2024-02-15T00:00:00Z"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Medication created successfully",
  "data": {
    "medication": {
      "id": "65f1a2b3c4d5e6f7g8h9i0j21",
      "name": "Lisinopril",
      "dosage": "10mg",
      "frequency": "Once daily",
      "status": "Active"
    }
  }
}
```

---

#### 3. Update Medication
**PUT** `/api/medications/:id`

Update a medication record (Staff/Doctor/Admin only).

**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json
```

**Request Body:**
```json
{
  "dosage": "20mg",
  "status": "Completed",
  "endDate": "2024-01-30T00:00:00Z"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Medication updated successfully",
  "data": {
    "medication": {
      "id": "65f1a2b3c4d5e6f7g8h9i0j21",
      "dosage": "20mg",
      "status": "Completed"
    }
  }
}
```

---

### Lab Results

#### 1. Get Lab Results
**GET** `/api/lab-results`

Get lab results.

**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN
```

**Query Parameters:**
- `patientId` (optional)
- `status` (optional) - Normal, High, Low, Final, Preliminary
- `page` (optional, default: 1)
- `limit` (optional, default: 20)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "results": [
      {
        "id": "65f1a2b3c4d5e6f7g8h9i0j13",
        "test": "Complete Blood Count",
        "result": "Normal",
        "referenceRange": "4.5-11.0 K/uL",
        "date": "2024-01-15T10:30:00Z",
        "status": "Final",
        "files": ["https://cloudinary.com/lab1.pdf"],
        "patientId": {
          "firstName": "John",
          "lastName": "Doe"
        }
      }
    ]
  }
}
```

---

### Imaging

#### 1. Get Imaging Records
**GET** `/api/imaging`

Get imaging records.

**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN
```

**Query Parameters:**
- `patientId` (optional) - Filter by patient ID
- `type` (optional) - Filter by imaging type (X-ray, MRI, CT Scan, Ultrasound, etc.)
- `page` (optional, default: 1)
- `limit` (optional, default: 20)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "imaging": [
      {
        "id": "65f1a2b3c4d5e6f7g8h9i0j22",
        "patientId": {
          "firstName": "John",
          "lastName": "Doe",
          "mrn": "MRN123456"
        },
        "type": "X-ray",
        "date": "2024-01-15T10:30:00Z",
        "findings": "No acute fracture or dislocation observed",
        "status": "Final",
        "imagingCenter": "Radiology Department - Main Building",
        "files": ["https://cloudinary.com/imaging1.jpg"]
      }
    ],
    "pagination": {
      "total": 10,
      "page": 1,
      "limit": 20,
      "pages": 1
    }
  }
}
```

---

#### 2. Create Imaging Record
**POST** `/api/imaging`

Create a new imaging record (Staff/Doctor/Admin only).

**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json
```
OR
```
Content-Type: multipart/form-data
```

**Request Body (JSON):**
```json
{
  "patientId": "65f1a2b3c4d5e6f7g8h9i0j3",
  "type": "X-ray",
  "date": "2024-01-15T10:30:00Z",
  "findings": "No acute fracture or dislocation observed",
  "status": "Final",
  "imagingCenter": "Radiology Department - Main Building"
}
```

**Request Body (Form-Data with files):**
```
patientId: 65f1a2b3c4d5e6f7g8h9i0j3
type: MRI
date: 2024-01-15T10:30:00Z
findings: Brain scan shows normal structure
status: Final
imagingCenter: Radiology Department
files: [File1, File2, ...] (max 10 files)
```

**Response (201):**
```json
{
  "success": true,
  "message": "Imaging record created successfully",
  "data": {
    "imaging": {
      "id": "65f1a2b3c4d5e6f7g8h9i0j22",
      "type": "X-ray",
      "patientId": "65f1a2b3c4d5e6f7g8h9i0j3",
      "status": "Final",
      "files": ["https://cloudinary.com/imaging1.jpg"]
    }
  }
}
```

---

#### 3. Update Imaging Record
**PUT** `/api/imaging/:id`

Update an imaging record (Staff/Doctor/Admin only).

**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json
```

**Request Body:**
```json
{
  "findings": "Updated findings after radiologist review",
  "status": "Final"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Imaging record updated successfully",
  "data": {
    "imaging": {
      "id": "65f1a2b3c4d5e6f7g8h9i0j22",
      "findings": "Updated findings after radiologist review",
      "status": "Final"
    }
  }
}
```

---

### Feedback

#### 1. Submit Feedback
**POST** `/api/feedback`

Submit feedback for an appointment.

**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN
```

**Request Body:**
```json
{
  "appointmentId": "65f1a2b3c4d5e6f7g8h9i0j5",
  "patientId": "65f1a2b3c4d5e6f7g8h9i0j3",
  "doctorId": "65f1a2b3c4d5e6f7g8h9i0j4",
  "rating": 5,
  "comment": "Excellent service and care"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Feedback submitted successfully",
  "data": {
    "feedback": {
      "id": "65f1a2b3c4d5e6f7g8h9i0j14",
      "rating": 5,
      "comment": "Excellent service and care"
    }
  }
}
```

---

### Insurance

#### 1. Check Insurance Coverage
**POST** `/api/insurance/check`

Check insurance coverage (Mock).

**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN
```

**Request Body:**
```json
{
  "patientId": "65f1a2b3c4d5e6f7g8h9i0j3",
  "departmentId": "65f1a2b3c4d5e6f7g8h9i0j9",
  "serviceId": "65f1a2b3c4d5e6f7g8h9i0j10"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "isCovered": true,
    "coveragePercentage": 80,
    "message": "This service is 80% covered by your insurance"
  }
}
```

---

### Payments

#### 1. Process Payment
**POST** `/api/payments`

Process a payment.

**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN
```

**Request Body:**
```json
{
  "appointmentId": "65f1a2b3c4d5e6f7g8h9i0j5",
  "patientId": "65f1a2b3c4d5e6f7g8h9i0j3",
  "amount": 150.00,
  "method": "card"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Payment successful",
  "data": {
    "payment": {
      "id": "65f1a2b3c4d5e6f7g8h9i0j15",
      "amount": 150.00,
      "method": "card",
      "status": "completed",
      "transactionId": "TXN1705324800000"
    }
  }
}
```

---

### Notifications

#### 1. Get Notifications
**GET** `/api/notifications`

Get user notifications.

**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN
```

**Query Parameters:**
- `userId` (optional)
- `isRead` (optional) - true/false
- `type` (optional) - appointment, lab, feedback, system
- `page` (optional, default: 1)
- `limit` (optional, default: 20)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "notifications": [
      {
        "id": "65f1a2b3c4d5e6f7g8h9i0j16",
        "message": "Your appointment has been scheduled for 2024-01-20 at 10:00 AM",
        "type": "appointment",
        "isRead": false,
        "createdAt": "2024-01-15T10:30:00Z"
      }
    ],
    "unreadCount": 5,
    "pagination": {
      "total": 20,
      "page": 1,
      "limit": 20,
      "pages": 1
    }
  }
}
```

---

#### 2. Mark Notification as Read
**PUT** `/api/notifications/:id/read`

Mark a notification as read.

**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN
```

**Response (200):**
```json
{
  "success": true,
  "message": "Notification marked as read",
  "data": {
    "notification": {
      "id": "65f1a2b3c4d5e6f7g8h9i0j16",
      "isRead": true
    }
  }
}
```

---

### Messages

#### 1. Get Messages
**GET** `/api/messages`

Get messages between doctor and patient.

**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN
```

**Query Parameters:**
- `doctorId` (optional)
- `patientId` (optional)
- `page` (optional, default: 1)
- `limit` (optional, default: 50)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "messages": [
      {
        "id": "65f1a2b3c4d5e6f7g8h9i0j17",
        "sender": "patient",
        "receiver": "doctor",
        "content": "Hello doctor, I have a question about my medication",
        "sentAt": "2024-01-15T10:30:00Z",
        "readAt": null,
        "doctorId": {
          "name": "Dr. Sarah Johnson"
        },
        "patientId": {
          "firstName": "John",
          "lastName": "Doe"
        }
      }
    ]
  }
}
```

---

#### 2. Send Message
**POST** `/api/messages`

Send a message.

**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN
```

**Request Body:**
```json
{
  "doctorId": "65f1a2b3c4d5e6f7g8h9i0j4",
  "patientId": "65f1a2b3c4d5e6f7g8h9i0j3",
  "sender": "patient",
  "receiver": "doctor",
  "content": "Hello doctor, I have a question about my medication"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Message sent successfully",
  "data": {
    "message": {
      "id": "65f1a2b3c4d5e6f7g8h9i0j17",
      "content": "Hello doctor, I have a question about my medication",
      "sentAt": "2024-01-15T10:30:00Z"
    }
  }
}
```

---

### Kiosk

#### 1. Scan Patient at Kiosk
**POST** `/api/kiosk/scan`

Scan patient using manual ID entry.

**Request Body:**
```json
{
  "patientId": "65f1a2b3c4d5e6f7g8h9i0j3"
}
```

OR

```json
{
  "mrn": "MRN123456"
}
```

OR

```json
{
  "cardNumber": "DHC001234"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "patient": {
      "id": "65f1a2b3c4d5e6f7g8h9i0j3",
      "firstName": "John",
      "lastName": "Doe",
      "mrn": "MRN123456"
    }
  }
}
```

---

#### 2. Get Kiosk Status
**GET** `/api/kiosk/status`

Get kiosk status.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "status": {
      "id": "65f1a2b3c4d5e6f7g8h9i0j18",
      "lastSync": "2024-01-15T10:30:00Z",
      "cachedPatients": 150,
      "connectionStatus": "Online",
      "kioskLocation": "Main Lobby"
    }
  }
}
```

---

### Registration

#### 1. Start Registration
**POST** `/api/registration/start`

Start the registration wizard.

**Response (201):**
```json
{
  "success": true,
  "data": {
    "registrationId": "65f1a2b3c4d5e6f7g8h9i0j19"
  }
}
```

---

#### 2. Save Personal Info
**POST** `/api/registration/personal-info`

Save personal information step.

**Request Body:**
```json
{
  "registrationId": "65f1a2b3c4d5e6f7g8h9i0j19",
  "firstName": "John",
  "lastName": "Doe",
  "dob": "1990-05-15",
  "gender": "Male",
  "phone": "+1234567890",
  "address": "123 Main St"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Personal info saved",
  "data": {
    "registration": {
      "id": "65f1a2b3c4d5e6f7g8h9i0j19",
      "stepsCompleted": ["personal-info"]
    }
  }
}
```

---

#### 3. Complete Registration
**POST** `/api/registration/complete`

Complete the registration process.

**Request Body:**
```json
{
  "registrationId": "65f1a2b3c4d5e6f7g8h9i0j19"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Registration completed successfully",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "65f1a2b3c4d5e6f7g8h9i0j1",
      "email": "john@example.com",
      "name": "John Doe",
      "role": "patient"
    },
    "patient": {
      "id": "65f1a2b3c4d5e6f7g8h9i0j3",
      "mrn": "MRN1705324800000"
    }
  }
}
```

---

### Reports

#### 1. Get Overview Data
**GET** `/api/reports/overview`

Get comprehensive reporting dashboard overview (Admin only).

**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN
```

**Query Parameters:**
- `from` (required) - Start date (YYYY-MM-DD), e.g., `2025-07-01`
- `to` (required) - End date (YYYY-MM-DD), e.g., `2025-07-31`
- `aggregate` (optional) - Aggregation level: `daily`, `weekly`, `monthly` (default: `daily`)
- `hospitalId` (required) - Hospital ID
- `departmentIds` (optional) - Array of department IDs (or omit for all departments)
- `page` (optional, default: 1) - Page number for table data
- `limit` (optional, default: 25) - Results per page for table
- `topLimit` (optional, default: 5) - Number of top departments to show

**Response (200):**
```json
{
  "success": true,
  "data": {
    "summary": {
      "totalVisits": 1250,
      "avgWaitSeconds": 1620,
      "peakHour": "14:00"
    },
    "visitsOverTime": [
      {
        "date": "2025-07-01",
        "departmentId": "65f1a2b3c4d5e6f7g8h9i0j9",
        "departmentName": "Emergency",
        "visits": 45
      }
    ],
    "topDepartments": [
      {
        "departmentId": "65f1a2b3c4d5e6f7g8h9i0j9",
        "departmentName": "Emergency",
        "visits": 320
      }
    ],
    "table": {
      "rows": [
        {
          "date": "2025-07-01",
          "departmentId": "65f1a2b3c4d5e6f7g8h9i0j9",
          "departmentName": "Emergency",
          "visits": 45,
          "avgWaitSeconds": 1450,
          "peakHour": "15:00"
        }
      ],
      "pagination": {
        "total": 150,
        "page": 1,
        "limit": 25,
        "pages": 6
      }
    }
  }
}
```

---

#### 2. Get Visits Over Time
**GET** `/api/reports/visits-over-time`

Get per-department visits-over-time series (Admin only).

**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN
```

**Query Parameters:**
- `from` (required) - Start date (YYYY-MM-DD)
- `to` (required) - End date (YYYY-MM-DD)
- `aggregate` (optional) - `daily`, `weekly`, `monthly` (default: `daily`)
- `hospitalId` (required) - Hospital ID
- `departmentIds` (optional) - Array of department IDs

**Response (200):**
```json
{
  "success": true,
  "data": {
    "series": [
      {
        "date": "2025-07-01",
        "departmentId": "65f1a2b3c4d5e6f7g8h9i0j9",
        "departmentName": "Emergency",
        "visits": 45
      }
    ]
  }
}
```

---

#### 3. Get Top Departments
**GET** `/api/reports/top-departments`

Get top departments ranked by visit count (Admin only).

**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN
```

**Query Parameters:**
- `from` (required) - Start date (YYYY-MM-DD)
- `to` (required) - End date (YYYY-MM-DD)
- `aggregate` (optional) - `daily`, `weekly`, `monthly` (default: `daily`)
- `hospitalId` (required) - Hospital ID
- `departmentIds` (optional) - Array of department IDs
- `topLimit` (optional, default: 5) - Number of top departments

**Response (200):**
```json
{
  "success": true,
  "data": {
    "topDepartments": [
      {
        "departmentId": "65f1a2b3c4d5e6f7g8h9i0j9",
        "departmentName": "Emergency",
        "visits": 320
      }
    ]
  }
}
```

---

#### 4. Get Summary KPIs
**GET** `/api/reports/summary`

Get summary KPIs for the selected date range (Admin only).

**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN
```

**Query Parameters:**
- `from` (required) - Start date (YYYY-MM-DD)
- `to` (required) - End date (YYYY-MM-DD)
- `aggregate` (optional) - `daily`, `weekly`, `monthly` (default: `daily`)
- `hospitalId` (required) - Hospital ID
- `departmentIds` (optional) - Array of department IDs

**Response (200):**
```json
{
  "success": true,
  "data": {
    "summary": {
      "totalVisits": 1250,
      "avgWaitSeconds": 1620,
      "peakHour": "14:00"
    }
  }
}
```

---

#### 5. Get Table Data
**GET** `/api/reports/table`

Get paginated table rows (Admin only).

**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN
```

**Query Parameters:**
- `from` (required) - Start date (YYYY-MM-DD)
- `to` (required) - End date (YYYY-MM-DD)
- `aggregate` (optional) - `daily`, `weekly`, `monthly` (default: `daily`)
- `hospitalId` (required) - Hospital ID
- `departmentIds` (optional) - Array of department IDs
- `page` (optional, default: 1)
- `limit` (optional, default: 25)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "rows": [
      {
        "date": "2025-07-01",
        "departmentId": "65f1a2b3c4d5e6f7g8h9i0j9",
        "departmentName": "Emergency",
        "visits": 45,
        "avgWaitSeconds": 1450,
        "peakHour": "15:00"
      }
    ],
    "pagination": {
      "total": 150,
      "page": 1,
      "limit": 25,
      "pages": 6
    }
  }
}
```

---

#### 6. Export CSV
**GET** `/api/reports/export.csv`

Export report data as CSV (Date, Department, Visits, Avg Wait, Peak Hour) (Admin only).

**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN
```

**Query Parameters:**
- `from` (required) - Start date (YYYY-MM-DD)
- `to` (required) - End date (YYYY-MM-DD)
- `aggregate` (optional) - `daily`, `weekly`, `monthly` (default: `daily`)
- `hospitalId` (required) - Hospital ID
- `departmentIds` (optional) - Array of department IDs

**Response (200):**
```
Content-Type: text/csv
Content-Disposition: attachment; filename="report-2025-07-01-to-2025-07-31.csv"

Date,Department,Visits,Avg Wait (seconds),Peak Hour
2025-07-01,Emergency,45,1450,15:00
2025-07-01,Cardiology,32,1200,10:00
...
```

---

### Schedules

#### 1. Create Staffing Suggestions
**POST** `/api/schedules/suggestions`

Generate staffing suggestions based on report metrics (Admin only).

**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json
```

**Request Body:**
```json
{
  "from": "2025-07-01",
  "to": "2025-07-31",
  "aggregate": "daily",
  "hospitalId": "65f1a2b3c4d5e6f7g8h9i0j8",
  "departmentIds": ["65f1a2b3c4d5e6f7g8h9i0j9"],
  "strategy": {
    "targetAvgWaitSeconds": 1800,
    "maxPatientsPerStaffPerHour": 6,
    "hoursOfOperation": ["08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00"]
  }
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "suggestions": [
      {
        "departmentId": "65f1a2b3c4d5e6f7g8h9i0j9",
        "departmentName": "Emergency",
        "date": "2025-07-10",
        "hour": "14:00",
        "visits": 12,
        "avgWaitSeconds": 2100,
        "requiredStaff": 3
      }
    ]
  }
}
```

---

#### 2. Create Staff Schedule
**POST** `/api/schedules/staff-allocations`

Create a staff schedule allocation (Admin only).

**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json
```

**Request Body:**
```json
{
  "hospitalId": "65f1a2b3c4d5e6f7g8h9i0j8",
  "tz": "Asia/Colombo",
  "dateRange": {
    "from": "2025-07-01",
    "to": "2025-07-31"
  },
  "allocations": [
    {
      "departmentId": "65f1a2b3c4d5e6f7g8h9i0j9",
      "date": "2025-07-10",
      "hour": "14:00",
      "requiredCount": 3,
      "staffIds": ["65f1a2b3c4d5e6f7g8h9i0j23", "65f1a2b3c4d5e6f7g8h9i0j24"],
      "notes": "Peak hour staffing"
    }
  ]
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Schedule created successfully",
  "data": {
    "schedule": {
      "id": "65f1a2b3c4d5e6f7g8h9i0j25",
      "hospitalId": "65f1a2b3c4d5e6f7g8h9i0j8",
      "tz": "Asia/Colombo",
      "dateRange": {
        "from": "2025-07-01",
        "to": "2025-07-31"
      },
      "status": "draft",
      "allocations": []
    }
  }
}
```

---

#### 3. Update Staff Schedule
**PUT** `/api/schedules/staff-allocations/:id`

Update a staff schedule (Admin only).

**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json
```

**Request Body:**
```json
{
  "allocations": [
    {
      "departmentId": "65f1a2b3c4d5e6f7g8h9i0j9",
      "date": "2025-07-10",
      "hour": "14:00",
      "requiredCount": 4,
      "staffIds": ["65f1a2b3c4d5e6f7g8h9i0j23", "65f1a2b3c4d5e6f7g8h9i0j24", "65f1a2b3c4d5e6f7g8h9i0j26"],
      "notes": "Increased staffing for peak hour"
    }
  ]
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Schedule updated successfully",
  "data": {
    "schedule": {
      "id": "65f1a2b3c4d5e6f7g8h9i0j25",
      "status": "draft"
    }
  }
}
```

---

#### 4. Publish Staff Schedule
**POST** `/api/schedules/staff-allocations/:id/publish`

Publish schedule and notify staff via email (Admin only).

**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN
```

**Response (200):**
```json
{
  "success": true,
  "message": "Schedule published successfully and staff notified",
  "data": {
    "schedule": {
      "id": "65f1a2b3c4d5e6f7g8h9i0j25",
      "status": "published",
      "publishedAt": "2025-07-05T10:00:00Z"
    },
    "notificationsSent": 5
  }
}
```

---

#### 5. List Staff Schedules
**GET** `/api/schedules/staff-allocations`

Get list of staff schedules (Admin only).

**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN
```

**Query Parameters:**
- `hospitalId` (optional) - Filter by hospital
- `from` (optional) - Filter by date range start (YYYY-MM-DD)
- `to` (optional) - Filter by date range end (YYYY-MM-DD)
- `page` (optional, default: 1)
- `limit` (optional, default: 20)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "schedules": [
      {
        "id": "65f1a2b3c4d5e6f7g8h9i0j25",
        "hospitalId": {
          "name": "City General Hospital"
        },
        "dateRange": {
          "from": "2025-07-01",
          "to": "2025-07-31"
        },
        "status": "published",
        "publishedAt": "2025-07-05T10:00:00Z"
      }
    ],
    "pagination": {
      "total": 10,
      "page": 1,
      "limit": 20,
      "pages": 1
    }
  }
}
```

---

#### 6. Get Staff Schedule by ID
**GET** `/api/schedules/staff-allocations/:id`

Get detailed schedule information (Admin only).

**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "schedule": {
      "id": "65f1a2b3c4d5e6f7g8h9i0j25",
      "hospitalId": {
        "id": "65f1a2b3c4d5e6f7g8h9i0j8",
        "name": "City General Hospital"
      },
      "tz": "Asia/Colombo",
      "dateRange": {
        "from": "2025-07-01",
        "to": "2025-07-31"
      },
      "status": "published",
      "allocations": [
        {
          "departmentId": "65f1a2b3c4d5e6f7g8h9i0j9",
          "date": "2025-07-10",
          "hour": "14:00",
          "requiredCount": 3,
          "staffIds": ["65f1a2b3c4d5e6f7g8h9i0j23"],
          "notes": "Peak hour staffing"
        }
      ],
      "publishedAt": "2025-07-05T10:00:00Z"
    }
  }
}
```

---

#### 7. Delete Staff Schedule
**DELETE** `/api/schedules/staff-allocations/:id`

Delete a staff schedule (Admin only).

**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN
```

**Response (200):**
```json
{
  "success": true,
  "message": "Schedule deleted successfully"
}
```

---

## Additional Notes

### File Uploads
File uploads are handled via Cloudinary. Supported file types:
- Images: JPEG, PNG, GIF
- Documents: PDF, DOC, DOCX, TXT
- Max file size: 10MB per file

### Pagination
Most list endpoints support pagination with query parameters:
- `page` - Page number (default: 1)
- `limit` - Results per page (default: 20, max: 100)

### Rate Limiting
API requests are rate-limited to:
- 100 requests per 15 minutes per IP address
- Exceeding the limit returns HTTP 429 (Too Many Requests)

### CORS
The API supports CORS. Configure allowed origins in `.env` file:
```
CORS_ORIGIN=http://localhost:3000
```

### Email Notifications
Email notifications are automatically sent for:
- Appointment confirmations
- Lab results availability
- Password reset requests

### Security
- All passwords are hashed using bcrypt
- JWT tokens expire after 7 days (configurable)
- Sensitive endpoints require authentication and role-based authorization
- Request validation using Joi schemas
- Helmet.js for security headers

---

## Support

For API support, please contact: support@hospital.com

---

**Last Updated:** October 2025  
**Version:** 1.0.0

