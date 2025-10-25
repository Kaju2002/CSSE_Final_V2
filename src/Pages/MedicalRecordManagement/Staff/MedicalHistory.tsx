import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import StaffNavbar from './StaffNavbar';
import { getStaffAuthHeaders } from '../../../lib/utils/staffApi';


const sections = [
  'All Records',
  'Diagnoses',
  'Procedures',
  'Medications',
  'Lab Results',
  'Imaging',
  'Add Record',
];

type ApiMedicalRecord = {
  _id: string;
  patientId: string | null;
  doctorId: string | null;
  recordType: 'diagnosis' | 'procedure' | 'medication' | 'lab' | 'imaging' | string;
  description: string;
  status: string;
  date: string; // ISO
  files: string[];
  createdAt: string;
  updatedAt: string;
  __v: number;
};

type ApiPagination = {
  total: number;
  page: number;
  limit: number;
  pages: number;
};

type ApiResponseRecords = {
  success: boolean;
  data: {
    records: ApiMedicalRecord[];
    pagination: ApiPagination;
  };
};

type ApiDoctor = {
  _id: string;
  name: string;
  specialization?: string;
  departmentId?: { _id: string; name: string; slug: string } | string;
};

type ApiPatient = {
  _id: string;
  mrn?: string;
  firstName?: string;
  lastName?: string;
  userId?: { _id: string; name: string } | string;
};

const MedicalHistory: React.FC = () => {

  const [activeSection, setActiveSection] = useState('All Records');
  const navigate = useNavigate();
  const [records, setRecords] = useState<ApiMedicalRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState<number>(1);
  const [pagination, setPagination] = useState<ApiPagination | null>(null);
  const [recordTypeFilter, setRecordTypeFilter] = useState<string>('');
  const [patients, setPatients] = useState<ApiPatient[]>([]);
  const [doctors, setDoctors] = useState<ApiDoctor[]>([]);
  const [createLoading, setCreateLoading] = useState<boolean>(false);
  const [createMessage, setCreateMessage] = useState<string | null>(null);
  const [createError, setCreateError] = useState<string | null>(null);
  const [form, setForm] = useState<{
    patientId: string;
    doctorId: string;
    recordType: string;
    description: string;
    status: string;
    date: string; // datetime-local string
    files: File[];
  }>({ patientId: '', doctorId: '', recordType: '', description: '', status: 'Active', date: '', files: [] });

  const API_BASE_URL = useMemo(() => (import.meta.env.VITE_API_URL || 'https://csse-api-final.onrender.com') as string, []);

  const sectionToRecordType = (section: string): string | undefined => {
    switch (section) {
      case 'Diagnoses':
        return 'diagnosis';
      case 'Procedures':
        return 'procedure';
      case 'Medications':
        return 'medication';
      case 'Lab Results':
        return 'lab';
      case 'Imaging':
        return 'imaging';
      default:
        return undefined; // All Records
    }
  };

  const formatDate = (iso: string): string => {
    try {
      const d = new Date(iso);
      return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    } catch {
      return iso;
    }
  };

  const formatEntity = (value: unknown): string => {
    if (value === null || value === undefined) return '—';
    if (typeof value === 'string' || typeof value === 'number') return String(value);
    if (typeof value === 'object') {
      const obj: any = value;
      return obj.name || obj.title || obj.label || obj._id || '—';
    }
    return '—';
  };

  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams();
        const rt = recordTypeFilter || sectionToRecordType(activeSection);
        if (rt) params.append('recordType', rt);
        params.append('page', String(page));
        params.append('limit', '20');
        const url = `${API_BASE_URL}/api/medical-records?${params.toString()}`;
        const res = await fetch(url, {
          method: 'GET',
          headers: getStaffAuthHeaders(),
          signal: controller.signal,
        });
        if (!res.ok) {
          let msg = `Failed to load records (${res.status})`;
          try {
            const j = await res.json();
            if (j && j.message) msg = j.message;
          } catch {}
          throw new Error(msg);
        }
        const data: ApiResponseRecords = await res.json();
        if (!data.success) throw new Error('API returned unsuccessful response');
        if (!isMounted) return;
        setRecords(data.data.records || []);
        setPagination(data.data.pagination || null);
      } catch (e: any) {
        if (!isMounted) return;
        setError(e?.message || 'Failed to load medical records');
        setRecords([]);
        setPagination(null);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    load();
    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [activeSection, page, recordTypeFilter, API_BASE_URL]);

  // Reset to first page when switching sections
  useEffect(() => {
    setPage(1);
  }, [activeSection]);

  // Reset to first page when changing record type filter
  useEffect(() => {
    setPage(1);
  }, [recordTypeFilter]);

  // Fetch doctors and patients for Add Record tab
  useEffect(() => {
    if (activeSection !== 'Add Record') return;
    let isMounted = true;
    const controller = new AbortController();
    async function loadLists() {
      try {
        // Patients
        const pRes = await fetch(`${API_BASE_URL}/api/patients/all?page=1&limit=50`, {
          headers: getStaffAuthHeaders(),
          signal: controller.signal,
        });
        if (pRes.ok) {
          const pJson = await pRes.json();
          if (isMounted) setPatients(pJson?.data?.patients || []);
        }
        // Doctors (fetch without filters; backend supports optional filters)
        const dParams = new URLSearchParams();
        dParams.append('page', '1');
        dParams.append('limit', '50');
        const dRes = await fetch(`${API_BASE_URL}/api/doctors?${dParams.toString()}`, {
          headers: getStaffAuthHeaders(),
          signal: controller.signal,
        });
        if (dRes.ok) {
          const dJson = await dRes.json();
          if (isMounted) setDoctors(dJson?.data?.doctors || []);
        }
      } catch {
        // Ignore list load errors in UI; form will show empty dropdowns
      }
    }
    loadLists();
    return () => { isMounted = false; controller.abort(); };
  }, [activeSection, API_BASE_URL]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    setForm(prev => ({ ...prev, files }));
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateMessage(null);
    setCreateError(null);
    setCreateLoading(true);
    try {
      const url = `${API_BASE_URL}/api/medical-records`;
      const fd = new FormData();
      if (form.patientId) fd.append('patientId', form.patientId);
      if (form.doctorId) fd.append('doctorId', form.doctorId);
      if (form.recordType) fd.append('recordType', form.recordType);
      if (form.description) fd.append('description', form.description);
      if (form.status) fd.append('status', form.status);
      if (form.date) {
        // Convert datetime-local to ISO string with Z
        const iso = new Date(form.date).toISOString();
        fd.append('date', iso);
      }
      if (Array.isArray(form.files)) {
        form.files.forEach(f => fd.append('files', f));
      }
      // Build headers without Content-Type so browser sets multipart boundary
      const auth = getStaffAuthHeaders();
      const multipartHeaders: Record<string, string> = {};
      if (auth['Authorization']) multipartHeaders['Authorization'] = auth['Authorization'];
      const res = await fetch(url, {
        method: 'POST',
        headers: multipartHeaders,
        body: fd,
      } as RequestInit);
      if (!res.ok) {
        let msg = `Failed to create record (${res.status})`;
        try { const j = await res.json(); if (j?.message) msg = j.message; } catch {}
        throw new Error(msg);
      }
      const j = await res.json();
      if (!j?.success) throw new Error(j?.message || 'Failed to create record');
      setCreateMessage(j.message || 'Medical record created successfully');
      // Reset form minimal
      setForm({ patientId: '', doctorId: '', recordType: '', description: '', status: 'Active', date: '', files: [] });
      // Refresh current list if on All Records
      setPage(1);
      // Optionally switch to All Records
      setActiveSection('All Records');
    } catch (err: any) {
      setCreateError(err?.message || 'Failed to create record');
    } finally {
      setCreateLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f5f8fd] to-[#eaf1fb] flex flex-col">
      <StaffNavbar title="MediWay" subtitle="Medical History" />
      <main className="flex-1 px-2 md:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-2">
        <div className="flex items-center gap-4">
          <button className="text-[#2a6bb7] font-semibold text-base hover:underline flex items-center" onClick={() => navigate(-1)}>
            <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
            Back to Overview
          </button>
          <h2 className="text-3xl font-extrabold text-[#203a6d] tracking-tight">Medical History</h2>
        </div>
        <div className="flex gap-2 mt-2 md:mt-0">
          <input
            type="text"
            placeholder="Search records..."
            className="px-4 py-2 rounded-lg border border-gray-200 bg-white shadow-sm focus:ring-2 focus:ring-[#2a6bb7] focus:border-[#2a6bb7] w-56 md:w-72"
          />
          <select
            className="px-4 py-2 rounded-lg border border-gray-200 bg-white shadow-sm focus:ring-2 focus:ring-[#2a6bb7] focus:border-[#2a6bb7]"
            value={recordTypeFilter}
            onChange={(e) => setRecordTypeFilter(e.target.value)}
          >
            <option value="">--</option>
            <option value="diagnosis">diagnosis</option>
            <option value="procedure">procedure</option>
            <option value="medication">medication</option>
            <option value="lab">lab</option>
            <option value="imaging">imaging</option>
            <option value="allergy">allergy</option>
            <option value="immunization">immunization</option>
            <option value="document">document</option>
          </select>
          <input
            type="date"
            className="px-4 py-2 rounded-lg border border-gray-200 bg-white shadow-sm focus:ring-2 focus:ring-[#2a6bb7] focus:border-[#2a6bb7]"
          />
        </div>
      </div>
      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar */}
        <aside className="w-full md:w-64 flex-shrink-0">
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-4 md:mb-0">
            <div className="font-bold text-[#203a6d] text-lg mb-4">Record Sections</div>
            <ul className="space-y-1">
              {sections.map((section) => (
                <li key={section}>
                  <button
                    className={`w-full text-left px-4 py-2 rounded-lg font-medium transition text-base ${
                      activeSection === section
                        ? 'bg-[#e6f0fa] text-[#2a6bb7] shadow'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                    onClick={() => setActiveSection(section)}
                  >
                    {section}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </aside>
        {/* Main Content */}
        <section className="flex-1 flex flex-col gap-6">
          {loading && (
            <div className="bg-white rounded-2xl shadow-lg p-6 text-[#203a6d]">Loading records...</div>
          )}
          {error && (
            <div className="bg-red-50 text-red-700 border border-red-200 rounded-2xl shadow p-4">{error}</div>
          )}
          {activeSection === 'All Records' && (
            <>
              {records.map((rec, idx) => (
                <div
                  key={idx}
                  className="bg-white rounded-2xl shadow-lg p-6 flex flex-col gap-2 border border-gray-100 hover:shadow-xl transition"
                >
                  <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
                    <span className={`px-4 py-1 rounded-full text-xs font-bold tracking-wide shadow-sm ${rec.status?.toLowerCase() === 'active' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'}`}>{(rec.recordType || '').toUpperCase()}</span>
                    <span className="font-bold text-lg text-[#203a6d] mr-2">{rec.description || '—'}</span>
                    <span className="text-gray-500 text-base font-medium">{formatDate(rec.date)} • {rec.status || '—'}</span>
                  </div>
                  <div className="mt-2 pl-0 md:pl-8 text-[15px]">
                    {Array.isArray(rec.files) && rec.files.length > 0 && (
                      <div className="mb-1 flex gap-2 flex-wrap items-center">
                        <span className="font-semibold text-gray-700">Attachments: </span>
                        {rec.files.map((a, i) => (
                          <span
                            key={i}
                            className="bg-[#e6f0fa] text-[#2a6bb7] px-3 py-1 rounded text-xs font-medium ml-1 border border-[#b6d4fa] shadow-sm cursor-pointer hover:bg-[#dbeafe] transition"
                          >
                            {a}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </>
          )}
          {activeSection === 'Diagnoses' && (
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white rounded-xl border border-gray-100">
                <thead>
                  <tr className="bg-[#f5f8fd] text-[#203a6d] text-left">
                    <th className="py-2 px-4 font-semibold">Date</th>
                    <th className="py-2 px-4 font-semibold">Diagnosis</th>
                    <th className="py-2 px-4 font-semibold">Doctor</th>
                    <th className="py-2 px-4 font-semibold">Department</th>
                  </tr>
                </thead>
                <tbody>
                  {records.map((d, i) => (
                    <tr key={i} className="border-t">
                      <td className="py-2 px-4">{formatDate(d.date)}</td>
                      <td className="py-2 px-4">{d.description || '—'}</td>
                      <td className="py-2 px-4">{formatEntity(d.doctorId)}</td>
                      <td className="py-2 px-4">—</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {activeSection === 'Procedures' && (
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white rounded-xl border border-gray-100">
                <thead>
                  <tr className="bg-[#f5f8fd] text-[#203a6d] text-left">
                    <th className="py-2 px-4 font-semibold">Date</th>
                    <th className="py-2 px-4 font-semibold">Procedure</th>
                    <th className="py-2 px-4 font-semibold">Doctor</th>
                    <th className="py-2 px-4 font-semibold">Result</th>
                  </tr>
                </thead>
                <tbody>
                  {records.map((p, i) => (
                    <tr key={i} className="border-t">
                      <td className="py-2 px-4">{formatDate(p.date)}</td>
                      <td className="py-2 px-4">{p.description || '—'}</td>
                      <td className="py-2 px-4">{formatEntity(p.doctorId)}</td>
                      <td className="py-2 px-4">{p.status || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {activeSection === 'Medications' && (
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white rounded-xl border border-gray-100">
                <thead>
                  <tr className="bg-[#f5f8fd] text-[#203a6d] text-left">
                    <th className="py-2 px-4 font-semibold">Medication</th>
                    <th className="py-2 px-4 font-semibold">Dosage</th>
                    <th className="py-2 px-4 font-semibold">Frequency</th>
                    <th className="py-2 px-4 font-semibold">Status</th>
                    <th className="py-2 px-4 font-semibold">Prescribed By</th>
                    <th className="py-2 px-4 font-semibold">Start Date</th>
                  </tr>
                </thead>
                <tbody>
                  {records.map((m, i) => (
                    <tr key={i} className="border-t">
                      <td className="py-2 px-4">{m.description || '—'}</td>
                      <td className="py-2 px-4">—</td>
                      <td className="py-2 px-4">—</td>
                      <td className="py-2 px-4">
                        <span className={
                          m.status === 'Active'
                            ? 'bg-green-100 text-green-700 px-2 py-0.5 rounded-full text-xs font-semibold'
                            : 'bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full text-xs font-semibold'
                        }>
                          {m.status}
                        </span>
                      </td>
                      <td className="py-2 px-4">{formatEntity(m.doctorId)}</td>
                      <td className="py-2 px-4">{formatDate(m.date)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {activeSection === 'Lab Results' && (
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white rounded-xl border border-gray-100">
                <thead>
                  <tr className="bg-[#f5f8fd] text-[#203a6d] text-left">
                    <th className="py-2 px-4 font-semibold">Test</th>
                    <th className="py-2 px-4 font-semibold">Result</th>
                    <th className="py-2 px-4 font-semibold">Reference Range</th>
                    <th className="py-2 px-4 font-semibold">Date</th>
                    <th className="py-2 px-4 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {records.map((l, i) => (
                    <tr key={i} className="border-t">
                      <td className="py-2 px-4">{l.description || '—'}</td>
                      <td className="py-2 px-4">—</td>
                      <td className="py-2 px-4">—</td>
                      <td className="py-2 px-4">{formatDate(l.date)}</td>
                      <td className="py-2 px-4">
                        <span className={
                          l.status === 'Normal'
                            ? 'bg-green-100 text-green-700 px-2 py-0.5 rounded-full text-xs font-semibold'
                            : 'bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full text-xs font-semibold'
                        }>
                          {l.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {activeSection === 'Imaging' && (
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white rounded-xl border border-gray-100">
                <thead>
                  <tr className="bg-[#f5f8fd] text-[#203a6d] text-left">
                    <th className="py-2 px-4 font-semibold">Type</th>
                    <th className="py-2 px-4 font-semibold">Date</th>
                    <th className="py-2 px-4 font-semibold">Findings</th>
                    <th className="py-2 px-4 font-semibold">Status</th>
                    <th className="py-2 px-4 font-semibold">Imaging Center</th>
                  </tr>
                </thead>
                <tbody>
                  {records.map((img, i) => (
                    <tr key={i} className="border-t">
                      <td className="py-2 px-4">{img.description || '—'}</td>
                      <td className="py-2 px-4">{formatDate(img.date)}</td>
                      <td className="py-2 px-4">—</td>
                      <td className="py-2 px-4">
                        <span className={
                          img.status === 'Normal'
                            ? 'bg-green-100 text-green-700 px-2 py-0.5 rounded-full text-xs font-semibold'
                            : 'bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full text-xs font-semibold'
                        }>
                          {img.status}
                        </span>
                      </td>
                      <td className="py-2 px-4">—</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {activeSection === 'Add Record' && (
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <h3 className="text-xl font-semibold text-[#203a6d] mb-4">Add Medical Record</h3>
              {createMessage && (
                <div className="mb-3 rounded-lg border border-green-200 bg-green-50 text-green-700 px-4 py-2">{createMessage}</div>
              )}
              {createError && (
                <div className="mb-3 rounded-lg border border-red-200 bg-red-50 text-red-700 px-4 py-2">{createError}</div>
              )}
              <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium text-gray-700">Patient</label>
                  <select
                    value={form.patientId}
                    onChange={(e) => setForm(prev => ({ ...prev, patientId: e.target.value }))}
                    className="px-3 py-2 rounded-lg border border-gray-200 bg-white shadow-sm focus:ring-2 focus:ring-[#2a6bb7] focus:border-[#2a6bb7]"
                    required
                  >
                    <option value="">Select patient</option>
                    {patients.map(p => (
                      <option key={p._id} value={p._id}>
                        {p.firstName || (typeof p.userId === 'object' && p.userId ? (p.userId as any).name : '')} {p.lastName || ''} {p.mrn ? `(${p.mrn})` : ''}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium text-gray-700">Doctor</label>
                  <select
                    value={form.doctorId}
                    onChange={(e) => setForm(prev => ({ ...prev, doctorId: e.target.value }))}
                    className="px-3 py-2 rounded-lg border border-gray-200 bg-white shadow-sm focus:ring-2 focus:ring-[#2a6bb7] focus:border-[#2a6bb7]"
                    required
                  >
                    <option value="">Select doctor</option>
                    {doctors.map(d => (
                      <option key={d._id} value={d._id}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium text-gray-700">Record Type</label>
                  <select
                    value={form.recordType}
                    onChange={(e) => setForm(prev => ({ ...prev, recordType: e.target.value }))}
                    className="px-3 py-2 rounded-lg border border-gray-200 bg-white shadow-sm focus:ring-2 focus:ring-[#2a6bb7] focus:border-[#2a6bb7]"
                    required
                  >
                    <option value="">--</option>
                    <option value="diagnosis">diagnosis</option>
                    <option value="procedure">procedure</option>
                    <option value="medication">medication</option>
                    <option value="lab">lab</option>
                    <option value="imaging">imaging</option>
                    <option value="allergy">allergy</option>
                    <option value="immunization">immunization</option>
                    <option value="document">document</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium text-gray-700">Status</label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm(prev => ({ ...prev, status: e.target.value }))}
                    className="px-3 py-2 rounded-lg border border-gray-200 bg-white shadow-sm focus:ring-2 focus:ring-[#2a6bb7] focus:border-[#2a6bb7]"
                  >
                    <option value="Active">Active</option>
                    <option value="Resolved">Resolved</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>

                <div className="md:col-span-2 flex flex-col gap-1">
                  <label className="text-sm font-medium text-gray-700">Description</label>
                  <textarea
                    value={form.description}
                    onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
                    className="px-3 py-2 rounded-lg border border-gray-200 bg-white shadow-sm focus:ring-2 focus:ring-[#2a6bb7] focus:border-[#2a6bb7]"
                    rows={3}
                    placeholder="Brief description"
                    required
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium text-gray-700">Date & Time</label>
                  <input
                    type="datetime-local"
                    value={form.date}
                    onChange={(e) => setForm(prev => ({ ...prev, date: e.target.value }))}
                    className="px-3 py-2 rounded-lg border border-gray-200 bg-white shadow-sm focus:ring-2 focus:ring-[#2a6bb7] focus:border-[#2a6bb7]"
                    required
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium text-gray-700">Attachments</label>
                  <input
                    type="file"
                    multiple
                    onChange={handleFileChange}
                    className="px-3 py-2 rounded-lg border border-gray-200 bg-white shadow-sm focus:ring-2 focus:ring-[#2a6bb7] focus:border-[#2a6bb7]"
                    accept="image/*,application/pdf"
                  />
                </div>

                <div className="md:col-span-2 flex items-center justify-end gap-2 mt-2">
                  <button
                    type="button"
                    className="px-4 py-2 rounded-lg border border-gray-200 bg-white shadow-sm"
                    onClick={() => setForm({ patientId: '', doctorId: '', recordType: '', description: '', status: 'Active', date: '', files: [] })}
                    disabled={createLoading}
                  >
                    Reset
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-lg bg-[#2a6bb7] text-white shadow-sm hover:bg-[#245ca0] disabled:opacity-50"
                    disabled={createLoading}
                  >
                    {createLoading ? 'Saving...' : 'Create Record'}
                  </button>
                </div>
              </form>
            </div>
          )}
        </section>
        {/* Pagination Controls */}
        {!loading && !error && pagination && pagination.pages > 1 && (
          <div className="mt-2 flex items-center justify-between">
            <button
              className="px-4 py-2 rounded-lg border border-gray-200 bg-white shadow-sm disabled:opacity-50"
              disabled={page <= 1}
              onClick={() => setPage(p => Math.max(1, p - 1))}
            >
              Previous
            </button>
            <div className="text-sm text-gray-600">Page {pagination.page} of {pagination.pages} • Total {pagination.total}</div>
            <button
              className="px-4 py-2 rounded-lg border border-gray-200 bg-white shadow-sm disabled:opacity-50"
              disabled={page >= pagination.pages}
              onClick={() => setPage(p => Math.min(pagination.pages, p + 1))}
            >
              Next
            </button>
          </div>
        )}
      </div>
      </main>
    </div>
  );
};

export default MedicalHistory;
