import React, { useState, useEffect, useCallback } from 'react';
import { 
  Users, 
  Stethoscope, 
  Calendar, 
  BedDouble, 
  AlertTriangle, 
  Receipt, 
  Plus, 
  Search, 
  Bell, 
  ChevronRight,
  ArrowUpRight,
  Activity,
  CheckCircle2,
  Clock,
  Trash2
} from 'lucide-react';
import hospitalHeroBg from './assets/hospital_hero.png';
import './index.css';

const API_BASE = 'http://localhost:5000/api';

export default function App() {
  const [activeTab, setActiveTab] = useState('overview');
  const [apiStatus, setApiStatus] = useState('checking');

  // Hospital State
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [beds, setBeds] = useState([]);
  const [bills, setBills] = useState([]);
  const [emergencies, setEmergencies] = useState([
    { id: 1, name: 'Venkatesh Prasad', condition: 'Severe Chest Pain', triage: 'CRITICAL', time: '10 mins ago' },
    { id: 2, name: 'Sunita Devi', condition: 'Fracture & Bleeding', triage: 'HIGH', time: '25 mins ago' }
  ]);

  // Initial Fetch from API (C++ Data Source)
  const fetchAllData = useCallback(async () => {
    try {
      const [pRes, dRes, aRes, bRes, billRes] = await Promise.all([
        fetch(`${API_BASE}/patients`),
        fetch(`${API_BASE}/doctors`),
        fetch(`${API_BASE}/appointments`),
        fetch(`${API_BASE}/beds`),
        fetch(`${API_BASE}/billing`)
      ]);

      if (![pRes, dRes, aRes, bRes, billRes].every(res => res.ok)) {
        throw new Error('Hospital Bridge API returned an error');
      }
      
      setPatients(await pRes.json());
      setDoctors(await dRes.json());
      setAppointments(await aRes.json());
      setBeds(await bRes.json());
      setBills(await billRes.json());
      setApiStatus('online');
    } catch (err) {
      setApiStatus('offline');
      console.warn('Hospital Bridge API is not reachable', err);
    }
  }, []);

  // Live Real-Time Clock
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    fetchAllData();
    const clockTimer = setInterval(() => setCurrentTime(new Date()), 1000);
    const syncTimer = setInterval(fetchAllData, 2000);
    return () => {
      clearInterval(clockTimer);
      clearInterval(syncTimer);
    };
  }, [fetchAllData]);

  const formattedDateTime = currentTime.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }) + ' • ' + currentTime.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });

  // Modal State
  const [showPatientModal, setShowPatientModal] = useState(false);
  const [newPatient, setNewPatient] = useState({ name: '', age: '', gender: 'Male', phone: '', status: 'PRE_REGISTERED' });

  const [showDocModal, setShowDocModal] = useState(false);
  const [newDoc, setNewDoc] = useState({ name: '', specialization: '' });

  const [showApptModal, setShowApptModal] = useState(false);
  const [newAppt, setNewAppt] = useState({ patientId: '', doctorId: '', patientName: '', doctorName: '', date: '', time: '10:00 AM' });

  const [showBillModal, setShowBillModal] = useState(false);
  const [newBill, setNewBill] = useState({ patientId: '', bedCharges: 250, treatmentCharges: 150 });

  const [searchQuery, setSearchQuery] = useState('');

  // Filter Helper
  const q = searchQuery.trim().toLowerCase();
  const filteredPatients = patients.filter(p => 
    !q || p.name.toLowerCase().includes(q) || String(p.id).includes(q) || p.phone.includes(q) || p.status.toLowerCase().includes(q)
  );
  const filteredDoctors = doctors.filter(d => 
    !q || d.name.toLowerCase().includes(q) || String(d.id).includes(q) || d.specialization.toLowerCase().includes(q)
  );
  const filteredAppointments = appointments.filter(a => 
    !q || a.patientName.toLowerCase().includes(q) || a.doctorName.toLowerCase().includes(q) || String(a.id).includes(q)
  );

  // Handlers
  const handleAddPatient = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE}/patients`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPatient)
      });
      if (res.ok) {
        await fetchAllData();
      }
    } catch (err) {
      console.error('Failed to save patient', err);
    }
    setShowPatientModal(false);
    setNewPatient({ name: '', age: '', gender: 'Male', phone: '', status: 'PRE_REGISTERED' });
  };

  const handleAddDoctor = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE}/doctors`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newDoc)
      });
      if (res.ok) {
        await fetchAllData();
      }
    } catch (err) {
      console.error('Failed to save doctor', err);
    }
    setShowDocModal(false);
    setNewDoc({ name: '', specialization: '' });
  };

  const toggleDoctorStatus = async (id) => {
    try {
      await fetch(`${API_BASE}/doctors/${id}/toggle`, { method: 'POST' });
      await fetchAllData();
    } catch (err) {
      console.error('Failed to toggle doctor status', err);
    }
  };

  const handleBookAppt = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE}/appointments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newAppt)
      });
      if (res.ok) {
        await fetchAllData();
      }
    } catch (err) {
      console.error('Failed to book appointment', err);
    }
    setShowApptModal(false);
    setNewAppt({ patientId: '', doctorId: '', patientName: '', doctorName: '', date: '', time: '10:00 AM' });
  };

  const handleGenerateBill = async (e) => {
    e.preventDefault();
    try {
      const pId = newBill.patientId || (patients.length > 0 ? patients[0].id : 101);
      const res = await fetch(`${API_BASE}/billing`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientId: pId,
          bedCharges: parseFloat(newBill.bedCharges) || 0,
          treatmentCharges: parseFloat(newBill.treatmentCharges) || 0,
          isPaid: true
        })
      });
      if (res.ok) {
        await fetchAllData();
      }
    } catch (err) {
      console.error('Failed to generate bill', err);
    }
    setShowBillModal(false);
    setNewBill({ patientId: '', bedCharges: 250, treatmentCharges: 150 });
  };

  const toggleBedStatus = async (bedId) => {
    try {
      const targetPatient = patients.find(p => !p.bedId);
      await fetch(`${API_BASE}/beds/toggle`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bedId, patientId: targetPatient ? targetPatient.id : null })
      });
      await fetchAllData();
    } catch (err) {
      console.error('Failed to toggle bed', err);
    }
  };

  const updatePatientStatus = async (id, status) => {
    try {
      await fetch(`${API_BASE}/patients/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      await fetchAllData();
    } catch (err) {
      console.error('Failed to update patient status', err);
    }
  };

  const handleDeletePatient = async (id, name) => {
    if (!window.confirm(`Are you sure you want to remove patient ${name} (#${id})?`)) return;
    try {
      await fetch(`${API_BASE}/patients/${id}`, { method: 'DELETE' });
      await fetchAllData();
    } catch (err) {
      console.error('Failed to delete patient', err);
    }
  };

  // Occupancy Math
  const occupiedBedsCount = beds.filter(b => b.occupied).length;
  const occupancyPercentage = beds.length ? Math.round((occupiedBedsCount / beds.length) * 100) : 0;

  return (
    <div className="app-container">
      {/* Sidebar Navigation */}
      <div className="sidebar">
        <div>
          <div className="brand">
            <div className="brand-icon">
              <Activity size={22} />
            </div>
            <div>
              <div className="brand-title">Apex Care</div>
              <div className="brand-subtitle">Health System</div>
            </div>
          </div>

          <div className="nav-menu">
            <div className={`nav-item ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}>
              <div className="nav-item-content">
                <Activity size={18} /> Overview
              </div>
            </div>
            <div className={`nav-item ${activeTab === 'patients' ? 'active' : ''}`} onClick={() => setActiveTab('patients')}>
              <div className="nav-item-content">
                <Users size={18} /> Patients
              </div>
            </div>
            <div className={`nav-item ${activeTab === 'doctors' ? 'active' : ''}`} onClick={() => setActiveTab('doctors')}>
              <div className="nav-item-content">
                <Stethoscope size={18} /> Doctors
              </div>
            </div>
            <div className={`nav-item ${activeTab === 'appointments' ? 'active' : ''}`} onClick={() => setActiveTab('appointments')}>
              <div className="nav-item-content">
                <Calendar size={18} /> Appointments
              </div>
            </div>
            <div className={`nav-item ${activeTab === 'beds' ? 'active' : ''}`} onClick={() => setActiveTab('beds')}>
              <div className="nav-item-content">
                <BedDouble size={18} /> Bed Allocation
              </div>
            </div>
            <div className={`nav-item ${activeTab === 'emergency' ? 'active' : ''}`} onClick={() => setActiveTab('emergency')}>
              <div className="nav-item-content">
                <AlertTriangle size={18} /> Emergency Queue
              </div>
              {emergencies.length > 0 && <span className="badge-sidebar">{emergencies.length}</span>}
            </div>
            <div className={`nav-item ${activeTab === 'billing' ? 'active' : ''}`} onClick={() => setActiveTab('billing')}>
              <div className="nav-item-content">
                <Receipt size={18} /> Billing
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="main-content">
        {/* Top Header Navigation */}
        <div className="top-bar">
          <div className="search-box">
            <Search size={16} style={{ position: 'absolute', left: '14px', top: '13px', color: 'var(--text-muted)' }} />
            <input 
              type="text" 
              placeholder="Search patients, doctors, records..." 
              className="search-input" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="top-right">
            <div className={`sync-status ${apiStatus}`}>
              <span className="sync-dot"></span>
              {apiStatus === 'online' ? 'Synced' : apiStatus === 'offline' ? 'API Offline' : 'Checking'}
            </div>

            <div className="top-datetime">
              <Clock size={15} /> {formattedDateTime}
            </div>
            
            <div className="icon-btn">
              <Bell size={18} />
              <span className="notification-dot"></span>
            </div>

            <div className="user-profile">
              <div className="avatar">AD</div>
              <div>
                <div className="user-name">Dr. Arthur Pendelton</div>
                <div className="user-role">Chief Administrator</div>
              </div>
            </div>
          </div>
        </div>

        {/* Dashboard Views */}
        <div className="dashboard-view">

          {/* OVERVIEW TAB */}
          {activeTab === 'overview' && (
            <>
              {/* Refined Clinical Hero Section */}
              <div className="hero-card">
                <div className="hero-content">
                  <div className="hero-eyebrow">Hospital Overview</div>
                  <h1 className="hero-headline">
                    Delivering Better Care, <span>Every Day.</span>
                  </h1>
                  <p className="hero-description">
                    Real-time operational monitoring across inpatient wards, emergency response, and medical staff availability.
                  </p>
                </div>

                <div className="hero-right">
                  {/* Bed Occupancy Visualization */}
                  <div className="occupancy-ring-container">
                    <div className="ring-graphic">
                      <svg width="76" height="76" viewBox="0 0 76 76">
                        <circle cx="38" cy="38" r="32" stroke="#E2E8F0" strokeWidth="6" fill="transparent" />
                        <circle 
                          cx="38" 
                          cy="38" 
                          r="32" 
                          stroke="#2563EB" 
                          strokeWidth="6" 
                          fill="transparent" 
                          strokeDasharray={2 * Math.PI * 32}
                          strokeDashoffset={2 * Math.PI * 32 * (1 - occupancyPercentage / 100)}
                          strokeLinecap="round"
                        />
                      </svg>
                      <div className="ring-value">{occupancyPercentage}%</div>
                    </div>
                    <div className="ring-labels">
                      <div className="ring-title">Bed Occupancy</div>
                      <div className="ring-subtitle">{occupiedBedsCount} of {beds.length} Capacity</div>
                    </div>
                  </div>
                </div>

                {/* Subtle Background Hospital Image */}
                <img src={hospitalHeroBg} alt="Apex Care Hospital" className="hero-bg-building" />
              </div>

              {/* Four KPI Cards */}
              <div className="kpi-grid">
                <div className="kpi-card">
                  <div className="kpi-header">
                    <div className="kpi-icon-box" style={{ backgroundColor: 'var(--primary-bg)', color: 'var(--primary-cobalt)' }}>
                      <Users size={20} />
                    </div>
                    <div className="kpi-trend" style={{ color: 'var(--teal-accent)' }}>
                      <ArrowUpRight size={14} /> Live Sync
                    </div>
                  </div>
                  <div>
                    <div className="kpi-value">{patients.length}</div>
                    <div className="kpi-footer" style={{ marginTop: '6px' }}>
                      <div className="kpi-label">Total Registered Patients</div>
                    </div>
                  </div>
                </div>

                <div className="kpi-card">
                  <div className="kpi-header">
                    <div className="kpi-icon-box" style={{ backgroundColor: 'var(--teal-bg)', color: 'var(--teal-accent)' }}>
                      <Stethoscope size={20} />
                    </div>
                    <div className="kpi-trend" style={{ color: 'var(--teal-accent)' }}>
                      <ArrowUpRight size={14} /> On Duty
                    </div>
                  </div>
                  <div>
                    <div className="kpi-value">{doctors.filter(d => d.available).length} / {doctors.length}</div>
                    <div className="kpi-footer" style={{ marginTop: '6px' }}>
                      <div className="kpi-label">Active Doctors On Duty</div>
                    </div>
                  </div>
                </div>

                <div className="kpi-card">
                  <div className="kpi-header">
                    <div className="kpi-icon-box" style={{ backgroundColor: 'var(--amber-bg)', color: 'var(--amber-warning)' }}>
                      <BedDouble size={20} />
                    </div>
                    <div className="kpi-trend" style={{ color: 'var(--amber-warning)' }}>
                      {beds.length - occupiedBedsCount} Available
                    </div>
                  </div>
                  <div>
                    <div className="kpi-value">{occupiedBedsCount}</div>
                    <div className="kpi-footer" style={{ marginTop: '6px' }}>
                      <div className="kpi-label">Occupied Inpatient Beds</div>
                    </div>
                  </div>
                </div>

                <div className="kpi-card">
                  <div className="kpi-header">
                    <div className="kpi-icon-box" style={{ backgroundColor: 'var(--coral-bg)', color: 'var(--coral-emergency)' }}>
                      <AlertTriangle size={20} />
                    </div>
                    <div className="kpi-trend" style={{ color: 'var(--coral-emergency)' }}>
                      High Priority
                    </div>
                  </div>
                  <div>
                    <div className="kpi-value">{emergencies.length}</div>
                    <div className="kpi-footer" style={{ marginTop: '6px' }}>
                      <div className="kpi-label">Emergency Queue</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Split Section (70% Table / 30% Quick Actions) */}
              <div className="bottom-grid">
                {/* Recent Patient Registrations */}
                <div className="card-section">
                  <div className="section-header">
                    <div className="section-title-box">
                      <Users size={20} style={{ color: 'var(--primary-cobalt)' }} />
                      <div className="section-title">Recent Patient Registrations</div>
                    </div>
                    <button className="view-all-btn" onClick={() => setActiveTab('patients')}>
                      View All <ChevronRight size={16} />
                    </button>
                  </div>

                  <table className="clinical-table">
                    <thead>
                      <tr>
                        <th>Patient ID</th>
                        <th>Patient Name</th>
                        <th>Age / Gender</th>
                        <th>Contact</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredPatients.map(p => (
                        <tr key={p.id}>
                          <td style={{ color: 'var(--text-muted)', fontWeight: '500' }}>#{p.id}</td>
                          <td className="patient-name-cell">{p.name}</td>
                          <td>{p.age} yrs, {p.gender}</td>
                          <td style={{ color: 'var(--text-muted)' }}>{p.phone}</td>
                          <td>
                            <span className={`status-pill ${p.status === 'ADMITTED' ? 'admitted' : 'pre-registered'}`}>
                              {p.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Quick Actions */}
                <div className="card-section">
                  <div className="section-header">
                    <div className="section-title">Quick Actions</div>
                  </div>

                  <div className="quick-actions-stack">
                    <button className="action-card-btn primary-action" onClick={() => setShowPatientModal(true)}>
                      <div className="action-btn-left">
                        <div className="action-icon-wrapper">
                          <Plus size={18} />
                        </div>
                        <div className="action-title">Register Patient</div>
                      </div>
                      <ChevronRight size={18} />
                    </button>

                    <button className="action-card-btn secondary-action" onClick={() => setShowApptModal(true)}>
                      <div className="action-btn-left">
                        <div className="action-icon-wrapper">
                          <Calendar size={18} />
                        </div>
                        <div className="action-title">Book Appointment</div>
                      </div>
                      <ChevronRight size={18} style={{ color: 'var(--text-light)' }} />
                    </button>

                    <button className="action-card-btn secondary-action" onClick={() => setShowDocModal(true)}>
                      <div className="action-btn-left">
                        <div className="action-icon-wrapper">
                          <Stethoscope size={18} />
                        </div>
                        <div className="action-title">Add Doctor On Duty</div>
                      </div>
                      <ChevronRight size={18} style={{ color: 'var(--text-light)' }} />
                    </button>

                    <button className="action-card-btn secondary-action" onClick={() => setShowBillModal(true)}>
                      <div className="action-btn-left">
                        <div className="action-icon-wrapper">
                          <Receipt size={18} />
                        </div>
                        <div className="action-title">Generate Billing</div>
                      </div>
                      <ChevronRight size={18} style={{ color: 'var(--text-light)' }} />
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* PATIENTS MODULE */}
          {activeTab === 'patients' && (
            <div className="card-section">
              <div className="section-header">
                <div className="section-title">Patient Directory</div>
                <button className="action-card-btn primary-action" style={{ width: 'auto', padding: '10px 16px' }} onClick={() => setShowPatientModal(true)}>
                  <Plus size={16} /> Register Patient
                </button>
              </div>

              <table className="clinical-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Age</th>
                    <th>Gender</th>
                    <th>Phone</th>
                    <th>Status</th>
                    <th>Assigned Bed</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPatients.map(p => (
                    <tr key={p.id}>
                      <td>#{p.id}</td>
                      <td className="patient-name-cell">{p.name}</td>
                      <td>{p.age}</td>
                      <td>{p.gender}</td>
                      <td>{p.phone}</td>
                      <td>
                        <span className={`status-pill ${p.status === 'ADMITTED' ? 'admitted' : 'pre-registered'}`}>
                          {p.status}
                        </span>
                      </td>
                      <td>{p.bedId ? `Bed #${p.bedId}` : 'Unallocated'}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <select 
                            className="search-input" 
                            style={{ padding: '4px 8px', fontSize: '12px', width: 'auto' }}
                            value={p.status}
                            onChange={(e) => updatePatientStatus(p.id, e.target.value)}
                          >
                            <option value="PRE_REGISTERED">PRE_REGISTERED</option>
                            <option value="PENDING_REVIEW">PENDING_REVIEW</option>
                            <option value="APPOINTMENT_CONFIRMED">APPOINTMENT_CONFIRMED</option>
                            <option value="ARRIVED">ARRIVED</option>
                            <option value="ADMITTED">ADMITTED</option>
                            <option value="UNDER_TREATMENT">UNDER_TREATMENT</option>
                            <option value="DISCHARGED">DISCHARGED</option>
                          </select>
                          <button 
                            type="button"
                            className="delete-icon-btn" 
                            title="Remove Patient"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleDeletePatient(p.id, p.name);
                            }}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* DOCTORS MODULE */}
          {activeTab === 'doctors' && (
            <div className="card-section">
              <div className="section-header">
                <div className="section-title">Medical Staff & Specialists</div>
                <button className="action-card-btn primary-action" style={{ width: 'auto', padding: '10px 16px' }} onClick={() => setShowDocModal(true)}>
                  <Plus size={16} /> Add Doctor
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '20px' }}>
                {filteredDoctors.map(doc => (
                  <div key={doc.id} className="card-section" style={{ padding: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <div className="action-icon-wrapper" style={{ backgroundColor: 'var(--primary-bg)', color: 'var(--primary-cobalt)' }}>
                        <Stethoscope size={20} />
                      </div>
                      <span className={`status-pill ${doc.available ? 'confirmed' : 'admitted'}`}>
                        {doc.available ? 'AVAILABLE' : 'ON LEAVE'}
                      </span>
                    </div>
                    <div style={{ marginTop: '12px' }}>
                      <div className="patient-name-cell" style={{ fontSize: '16px' }}>{doc.name}</div>
                      <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '2px' }}>{doc.specialization}</div>
                      <div style={{ fontSize: '12px', color: 'var(--text-light)', marginTop: '4px' }}>ID: #{doc.id}</div>
                    </div>
                    <button 
                      className={`action-card-btn ${doc.available ? '' : 'primary-action'}`}
                      style={{ marginTop: '14px', justifyContent: 'center', padding: '6px', fontSize: '12px' }}
                      onClick={() => toggleDoctorStatus(doc.id)}
                    >
                      {doc.available ? 'Mark On Leave' : 'Mark Available'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* APPOINTMENTS MODULE */}
          {activeTab === 'appointments' && (
            <div className="card-section">
              <div className="section-header">
                <div className="section-title">Appointment Schedules</div>
                <button className="action-card-btn primary-action" style={{ width: 'auto', padding: '10px 16px' }} onClick={() => setShowApptModal(true)}>
                  <Plus size={16} /> Book Appointment
                </button>
              </div>

              <table className="clinical-table">
                <thead>
                  <tr>
                    <th>Appt ID</th>
                    <th>Patient Name</th>
                    <th>Attending Doctor</th>
                    <th>Date</th>
                    <th>Time</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAppointments.map(a => (
                    <tr key={a.id}>
                      <td>#{a.id}</td>
                      <td className="patient-name-cell">{a.patientName}</td>
                      <td>{a.doctorName}</td>
                      <td>{a.date}</td>
                      <td>{a.time}</td>
                      <td><span className="status-pill confirmed">{a.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* BEDS MODULE */}
          {activeTab === 'beds' && (
            <div className="card-section">
              <div className="section-header">
                <div className="section-title">Inpatient Bed Allocation</div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' }}>
                {beds.map(bed => (
                  <div key={bed.id} className="card-section" style={{ padding: '18px', backgroundColor: bed.occupied ? '#FEF2F2' : '#F0FDF4' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ fontWeight: '700', fontSize: '16px', color: 'var(--text-navy)' }}>Bed #{bed.id}</div>
                      <span className={`status-pill ${bed.occupied ? 'admitted' : 'confirmed'}`}>
                        {bed.occupied ? 'Occupied' : 'Available'}
                      </span>
                    </div>
                    <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '8px' }}>
                      {bed.type} Ward
                    </div>
                    {bed.patientId && (
                      <div style={{ fontSize: '12px', color: 'var(--primary-cobalt)', marginTop: '4px', fontWeight: '500' }}>
                        Patient ID: #{bed.patientId}
                      </div>
                    )}
                    <button 
                      className={`action-card-btn ${bed.occupied ? '' : 'primary-action'}`}
                      style={{ marginTop: '14px', justifyContent: 'center', padding: '8px', fontSize: '13px' }}
                      onClick={() => toggleBedStatus(bed.id)}
                    >
                      {bed.occupied ? 'Release Bed' : 'Allocate Bed'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* EMERGENCY QUEUE */}
          {activeTab === 'emergency' && (
            <div className="card-section">
              <div className="section-header">
                <div className="section-title" style={{ color: 'var(--coral-emergency)' }}>Emergency Response Triage</div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {emergencies.map(emg => (
                  <div key={emg.id} className="card-section" style={{ borderLeft: '4px solid var(--coral-emergency)', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div className="patient-name-cell" style={{ fontSize: '16px' }}>{emg.name}</div>
                      <div style={{ fontSize: '13.5px', color: 'var(--text-muted)', marginTop: '4px' }}>
                        Condition: <span style={{ color: 'var(--text-navy)', fontWeight: '600' }}>{emg.condition}</span>
                      </div>
                      <span className="status-pill admitted" style={{ marginTop: '8px' }}>Triage: {emg.triage}</span>
                    </div>
                    <button className="action-card-btn primary-action" style={{ width: 'auto' }} onClick={() => setEmergencies(emergencies.filter(e => e.id !== emg.id))}>
                      Admit Patient
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* BILLING MODULE */}
          {activeTab === 'billing' && (
            <div className="card-section">
              <div className="section-header">
                <div className="section-title">Billing & Patient Invoices</div>
                <button className="action-card-btn primary-action" style={{ width: 'auto', padding: '10px 16px' }} onClick={() => setShowBillModal(true)}>
                  <Plus size={16} /> Generate Bill
                </button>
              </div>

              <table className="clinical-table">
                <thead>
                  <tr>
                    <th>Invoice ID</th>
                    <th>Patient Name</th>
                    <th>Bed Fee</th>
                    <th>Treatment Fee</th>
                    <th>Total Amount</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {bills.map(b => (
                    <tr key={b.id}>
                      <td>#{b.id}</td>
                      <td className="patient-name-cell">{b.patientName}</td>
                      <td>${b.bedCharges ? b.bedCharges.toFixed(2) : '0.00'}</td>
                      <td>${b.treatmentCharges ? b.treatmentCharges.toFixed(2) : '0.00'}</td>
                      <td style={{ fontWeight: '700', color: 'var(--teal-accent)' }}>${b.amount ? b.amount.toFixed(2) : '0.00'}</td>
                      <td><span className={`status-pill ${b.status === 'PAID' ? 'confirmed' : 'admitted'}`}>{b.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

        </div>
      </div>

      {/* MODAL: REGISTER PATIENT */}
      {showPatientModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">Register New Patient</div>
            <form onSubmit={handleAddPatient}>
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input required className="search-input" value={newPatient.name} onChange={e => setNewPatient({...newPatient, name: e.target.value})} placeholder="e.g. Ramesh Kumar" />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">Age</label>
                  <input required type="number" className="search-input" value={newPatient.age} onChange={e => setNewPatient({...newPatient, age: e.target.value})} placeholder="42" />
                </div>
                <div className="form-group">
                  <label className="form-label">Gender</label>
                  <select className="search-input" value={newPatient.gender} onChange={e => setNewPatient({...newPatient, gender: e.target.value})}>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Phone Number</label>
                <input required className="search-input" value={newPatient.phone} onChange={e => setNewPatient({...newPatient, phone: e.target.value})} placeholder="9876543210" />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '20px' }}>
                <button type="button" className="view-all-btn" style={{ color: 'var(--text-muted)' }} onClick={() => setShowPatientModal(false)}>Cancel</button>
                <button type="submit" className="action-card-btn primary-action" style={{ width: 'auto', padding: '10px 20px' }}>Register Patient</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD DOCTOR */}
      {showDocModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">Add Doctor On Duty</div>
            <form onSubmit={handleAddDoctor}>
              <div className="form-group">
                <label className="form-label">Doctor Name</label>
                <input required className="search-input" value={newDoc.name} onChange={e => setNewDoc({...newDoc, name: e.target.value})} placeholder="e.g. Dr. Sunita Roy" />
              </div>
              <div className="form-group">
                <label className="form-label">Specialization</label>
                <input required className="search-input" value={newDoc.specialization} onChange={e => setNewDoc({...newDoc, specialization: e.target.value})} placeholder="e.g. Cardiology" />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '20px' }}>
                <button type="button" className="view-all-btn" style={{ color: 'var(--text-muted)' }} onClick={() => setShowDocModal(false)}>Cancel</button>
                <button type="submit" className="action-card-btn primary-action" style={{ width: 'auto', padding: '10px 20px' }}>Add Doctor</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: BOOK APPOINTMENT */}
      {showApptModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">Book Patient Appointment</div>
            <form onSubmit={handleBookAppt}>
              <div className="form-group">
                <label className="form-label">Patient</label>
                {patients.length > 0 ? (
                  <select 
                    className="search-input"
                    value={newAppt.patientId} 
                    onChange={e => {
                      const sel = patients.find(p => p.id === parseInt(e.target.value));
                      setNewAppt({
                        ...newAppt, 
                        patientId: e.target.value,
                        patientName: sel ? sel.name : ''
                      });
                    }}
                  >
                    <option value="">Select Existing Patient or type below</option>
                    {patients.map(p => (
                      <option key={p.id} value={p.id}>#{p.id} - {p.name}</option>
                    ))}
                  </select>
                ) : null}
                <input 
                  className="search-input" 
                  style={{ marginTop: '8px' }}
                  value={newAppt.patientName} 
                  onChange={e => setNewAppt({...newAppt, patientName: e.target.value, patientId: ''})} 
                  placeholder="Or enter new patient name..." 
                />
              </div>

              <div className="form-group">
                <label className="form-label">Doctor</label>
                {doctors.length > 0 ? (
                  <select 
                    className="search-input"
                    value={newAppt.doctorId} 
                    onChange={e => {
                      const sel = doctors.find(d => d.id === parseInt(e.target.value));
                      setNewAppt({
                        ...newAppt, 
                        doctorId: e.target.value,
                        doctorName: sel ? sel.name : ''
                      });
                    }}
                  >
                    <option value="">Select Existing Doctor or type below</option>
                    {doctors.map(d => (
                      <option key={d.id} value={d.id}>#{d.id} - {d.name} ({d.specialization})</option>
                    ))}
                  </select>
                ) : null}
                <input 
                  className="search-input" 
                  style={{ marginTop: '8px' }}
                  value={newAppt.doctorName} 
                  onChange={e => setNewAppt({...newAppt, doctorName: e.target.value, doctorId: ''})} 
                  placeholder="Or enter new doctor name..." 
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">Date</label>
                  <input required type="date" className="search-input" value={newAppt.date} onChange={e => setNewAppt({...newAppt, date: e.target.value})} />
                </div>
                <div className="form-group">
                  <label className="form-label">Time Slot</label>
                  <input required className="search-input" value={newAppt.time} onChange={e => setNewAppt({...newAppt, time: e.target.value})} placeholder="10:30 AM" />
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '20px' }}>
                <button type="button" className="view-all-btn" style={{ color: 'var(--text-muted)' }} onClick={() => setShowApptModal(false)}>Cancel</button>
                <button type="submit" className="action-card-btn primary-action" style={{ width: 'auto', padding: '10px 20px' }}>Book Appointment</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: GENERATE BILL */}
      {showBillModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">Generate Patient Billing</div>
            <form onSubmit={handleGenerateBill}>
              <div className="form-group">
                <label className="form-label">Select Patient</label>
                <select 
                  required
                  className="search-input"
                  value={newBill.patientId} 
                  onChange={e => setNewBill({...newBill, patientId: e.target.value})}
                >
                  <option value="">-- Choose Patient --</option>
                  {patients.map(p => (
                    <option key={p.id} value={p.id}>#{p.id} - {p.name}</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">Bed Charges ($)</label>
                  <input required type="number" step="0.01" className="search-input" value={newBill.bedCharges} onChange={e => setNewBill({...newBill, bedCharges: e.target.value})} />
                </div>
                <div className="form-group">
                  <label className="form-label">Treatment Charges ($)</label>
                  <input required type="number" step="0.01" className="search-input" value={newBill.treatmentCharges} onChange={e => setNewBill({...newBill, treatmentCharges: e.target.value})} />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '20px' }}>
                <button type="button" className="view-all-btn" style={{ color: 'var(--text-muted)' }} onClick={() => setShowBillModal(false)}>Cancel</button>
                <button type="submit" className="action-card-btn primary-action" style={{ width: 'auto', padding: '10px 20px' }}>Generate Bill</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
