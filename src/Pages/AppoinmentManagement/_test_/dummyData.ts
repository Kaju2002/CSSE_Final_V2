import type { ApiDepartment } from "../../../lib/utils/appointmentApi";

export const departmentsMock: ApiDepartment[] = [
  {
    _id: "dept-1",
    name: "Cardiology",
    slug: "cardiology",
    hospitalId: { _id: "hospital-1", name: "Test Hospital" },
    services: [
      {
        _id: "svc-1",
        title: "Cardiac Consultation",
        description: "Assessment of heart health",
        departmentId: "dept-1",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        __v: 0,
      },
      {
        _id: "svc-2",
        title: "ECG / EKG",
        description: "Electrical analysis",
        departmentId: "dept-1",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        __v: 0,
      },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    __v: 0,
  },
];

// Add a second department to exercise department switching in tests
departmentsMock.push({
  _id: "dept-2",
  name: "Neurology",
  slug: "neurology",
  hospitalId: { _id: "hospital-1", name: "Test Hospital" },
  services: [
    {
      _id: "svc-3",
      title: "Neurology Evaluation",
      description: "Assessments for neurological disorders",
      departmentId: "dept-2",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      __v: 0,
    },
  ],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  __v: 0,
});

export const fetchDepartmentsResponse = {
  success: true,
  data: {
    departments: departmentsMock,
    pagination: { total: 1, page: 1, limit: 50, pages: 1 },
  },
};

export default departmentsMock;
