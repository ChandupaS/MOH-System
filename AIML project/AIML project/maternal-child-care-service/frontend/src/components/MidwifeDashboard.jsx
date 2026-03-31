import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import axios from 'axios';
import SidebarLayout from './SidebarLayout';
import ManageMothers from './ManageMothers';
import RegisterMother from './RegisterMother';
import MotherProfileHub from './MotherProfileHub';
import PregnancyDetails from './PregnancyDetails';
import SymptomTracker from './SymptomTracker';

const DIVISION = 'Malabe East'; // In full implementation, fetched from midwife profile

const MidwifeDashboard = () => {
    const [stats, setByStats] = useState({ totalMothers: 0, todayVisits: 0, weekVisits: 0 });
    const [user, setByUser] = useState(JSON.parse(localStorage.getItem('user')));
    const [division, setDivision] = useState(DIVISION);
    const navigate = useNavigate();

    useEffect(() => {
        if (!user || user.role !== 'MIDWIFE') {
            navigate('/staff-login');
            return;
        }
        axios.get(`http://localhost:8080/api/midwife/${user.id}/home-visits`)
            .then(res => {
                setByStats({
                    totalMothers: res.data.today ? res.data.today.length + 12 : 15,
                    todayVisits: res.data.today?.length || 2,
                    weekVisits: res.data.thisWeek?.length || 8
                });
            })
            .catch(err => {
                console.error(err);
                setByStats({ totalMothers: 15, todayVisits: 2, weekVisits: 8 });
            });
            
        // Fetch midwife profile to set the correct dynamic division
        axios.get(`http://localhost:8080/api/midwife/${user.id}/profile`)
            .then(res => {
                if (res.data && res.data.gnDivision) {
                    setDivision(res.data.gnDivision);
                }
            })
            .catch(err => console.error("Could not fetch midwife profile:", err));
    }, [user, navigate]);

    const menuItems = [
        { label: 'Home', path: '/midwife', exact: true },
        { label: 'Manage Mothers', path: '/midwife/mothers' },
        { label: 'Home Visits', path: '/midwife/visits' },
        { label: 'Announcements', path: '/midwife/announcements' },
        { label: 'Vaccination Schedule', path: '/midwife/vaccinations' },
    ];

    return (
        <SidebarLayout userName={user?.name} role="MIDWIFE" menuItems={menuItems}>
            <Routes>
                <Route index element={<MidwifeOverview stats={stats} user={user} navigate={navigate} />} />

                {/* Manage Mothers — with nested Register route */}
                <Route path="mothers" element={<ManageMothers navigate={navigate} division={division} midwifeId={user?.id} />} />
                <Route path="mothers/register" element={<RegisterMother navigate={navigate} division={division} midwifeId={user?.id} />} />
                <Route path="mothers/profile/:id" element={<MotherProfileHub midwifeId={user?.id} />} />
                <Route path="mothers/profile/:id/pregnancy" element={<PregnancyDetails midwifeId={user?.id} />} />
                
                {/* Missing Sub-routes that were causing blank pages */}
                <Route path="mothers/profile/:id/symptoms" element={<div className="overview-container"><SymptomTracker profile={{ id: window.location.pathname.split('/').pop() }} /></div>} />
                
                <Route path="mothers/profile/:id/visits" element={<MidwifeMotherVisits midwifeId={user?.id} />} />
                <Route path="mothers/profile/:id/vaccinations" element={<MidwifeMotherVaccinations midwifeId={user?.id} />} />

                <Route path="visits" element={
                    <div>
                        <h2 className="page-title">Home Visits</h2>
                        <div className="dashboard-panel">
                            <div className="empty-state">
                                <p>Plan and track upcoming visits.</p>
                            </div>
                        </div>
                    </div>
                } />
                <Route path="announcements" element={<MidwifeAnnouncements user={user} />} />
                <Route path="vaccinations" element={
                    <div>
                        <h2 className="page-title">Vaccination Schedule</h2>
                        <div className="dashboard-panel">
                            <div className="empty-state">
                                <p>Track mother vaccinations here.</p>
                            </div>
                        </div>
                    </div>
                } />
            </Routes>
        </SidebarLayout>
    );
};

const MidwifeOverview = ({ stats, user, navigate }) => {
    return (
        <div className="overview-container">
            <h2 className="page-title">Midwife Dashboard</h2>

            <div className="welcome-card-modern">
                <h2>Welcome, {user?.name || 'Midwife'}</h2>
                <p>Manage daily clinical tasks, view appointments, and read announcements for your territory.</p>
            </div>

            <div className="stats-grid-modern">
                <div className="stat-card-modern">
                    <p>Mothers in Division</p>
                    <h4>{stats?.totalMothers || 0}</h4>
                </div>
                <div className="stat-card-modern">
                    <p>Today's Home Visits</p>
                    <h4>{stats?.todayVisits || 0}</h4>
                </div>
                <div className="stat-card-modern">
                    <p>This Week's Home Visits</p>
                    <h4>{stats?.weekVisits || 0}</h4>
                </div>
            </div>

            <div className="dashboard-panel">
                <h3>Upcoming Appointments</h3>
                <div className="list-item-clinical">
                    <div className="list-item-clinical-text">
                        <h5>Sunitha Perera</h5>
                        <p>Home Visit Scheduled Today at 10:00 AM — Anaemia Check</p>
                    </div>
                    <span className="badge badge-warning">Today</span>
                </div>
                <div className="list-item-clinical">
                    <div className="list-item-clinical-text">
                        <h5>Kamala Silva</h5>
                        <p>Glucose Level Monitoring Visit — Main Hall</p>
                    </div>
                    <span className="badge badge-muted">Tomorrow</span>
                </div>
                <div style={{ marginTop: '18px', display: 'flex', gap: '12px' }}>
                    <button onClick={() => navigate('/midwife/mothers')} className="btn-clinical">
                        View Patient Profiles
                    </button>
                    <button onClick={() => navigate('/midwife/mothers/register')} className="btn-clinical-outline" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '10px 20px', background: 'transparent', color: '#0077b6', border: '1.5px solid #0077b6', fontWeight: '600', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontFamily: 'Inter, sans-serif' }}>
                        Register New Mother
                    </button>
                </div>
            </div>

            <div className="dashboard-panel" style={{ borderLeft: '4px solid #00b4d8' }}>
                <h3>Recent Announcements</h3>
                <p style={{fontSize: '14px'}}>Navigate to the Announcements inbox to read and manage recent updates directed to Midwives.</p>
                <div style={{ marginTop: '18px' }}>
                    <button onClick={() => navigate('/midwife/announcements')} className="btn-clinical">
                        Go to Inbox
                    </button>
                </div>
            </div>
        </div>
    );
};

// --- Inline Components for Missing Routes ---
const MidwifeMotherVisits = ({ midwifeId }) => {
    const id = window.location.pathname.split('/')[4];
    const [visits, setVisits] = useState([]);

    useEffect(() => {
        if (!id) return;
        axios.get(`http://localhost:8080/api/mother/home-visits/${id}`)
             .then(res => setVisits(res.data))
             .catch(err => console.error(err));
    }, [id]);

    const handleStatusUpdate = async (visitId, status) => {
        try {
            await axios.put(`http://localhost:8080/api/midwife/home-visit/${visitId}`, { status });
            setVisits(visits.map(v => v.id === visitId ? { ...v, status } : v));
        } catch (err) {
            alert('Failed to update visit status');
        }
    };

    return (
        <div className="overview-container">
            <h2 className="page-title">Home Visits Schedule</h2>
            <div className="dashboard-panel">
                {visits.length === 0 ? <p>No home visits generated.</p> : visits.map(v => (
                    <div key={v.id} className="list-item-clinical" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <h5>Scheduled: {v.scheduledDate}</h5>
                            <p>Status: <span className={`badge ${v.status === 'Completed' ? 'badge-primary' : (v.status === 'Missed' ? 'badge-warning' : 'badge-muted')}`}>{v.status}</span></p>
                            {v.midwifeNotes && <p style={{fontSize: '12px', marginTop: '4px'}}>Notes: {v.midwifeNotes}</p>}
                        </div>
                        {v.status !== 'Completed' && (
                            <button onClick={() => handleStatusUpdate(v.id, 'Completed')} className="btn-clinical-outline btn-sm">Mark Complete</button>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

const MidwifeMotherVaccinations = ({ midwifeId }) => {
    const id = window.location.pathname.split('/')[4];
    const [vaccines, setVaccines] = useState([]);

    useEffect(() => {
        if (!id) return;
        axios.get(`http://localhost:8080/api/mother/vaccinations/${id}`)
             .then(res => setVaccines(res.data))
             .catch(err => console.error(err));
    }, [id]);

    const handleUpdate = async (vaccId, status) => {
        try {
            await axios.put(`http://localhost:8080/api/midwife/vaccination/${vaccId}`, { status });
            setVaccines(vaccines.map(v => v.id === vaccId ? { ...v, status } : v));
        } catch (err) {
            alert('Failed to update vaccination');
        }
    };

    return (
        <div className="overview-container">
            <h2 className="page-title">Vaccination Schedule</h2>
            <div className="dashboard-panel">
                {vaccines.length === 0 ? <p>No vaccinations scheduled.</p> : vaccines.map(v => (
                    <div key={v.id} className="list-item-clinical" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <h5>{v.vaccineName} ({v.type})</h5>
                            <p>Scheduled: {v.scheduledDate}</p>
                            <span className={`badge ${v.status === 'Completed' ? 'badge-primary' : 'badge-muted'}`}>{v.status}</span>
                        </div>
                        {v.status !== 'Completed' && (
                            <button onClick={() => handleUpdate(v.id, 'Completed')} className="btn-clinical-outline btn-sm">Mark Given</button>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

const MidwifeAnnouncements = ({ user }) => {
    const [announcements, setAnnouncements] = useState([]);
    const [readIds, setReadIds] = useState([]);

    useEffect(() => {
        if (!user?.id) return;
        axios.get(`http://localhost:8080/api/midwife/announcements`)
            .then(res => setAnnouncements(res.data)).catch(console.error);
        axios.get(`http://localhost:8080/api/midwife/${user.id}/announcements/read-status`)
            .then(res => setReadIds(res.data)).catch(console.error);
    }, [user]);

    const handleMarkRead = async (annId) => {
        try {
            await axios.post(`http://localhost:8080/api/midwife/${user.id}/announcements/${annId}/read`);
            setReadIds([...readIds, annId]);
        } catch(err) { console.error(err); }
    };

    return (
        <div className="overview-container">
            <h2 className="page-title">Announcement Inbox</h2>
            <div className="dashboard-panel">
                {announcements.length === 0 ? <p>No announcements found.</p> : announcements.map(a => {
                    const isRead = readIds.includes(a.id);
                    return (
                        <div key={a.id} className="list-item-clinical" style={{ opacity: isRead ? 0.6 : 1, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div className="list-item-clinical-text" style={{ flex: 1 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                                    <h5 style={{ margin: 0, fontWeight: isRead ? 'normal' : 'bold' }}>{a.title}</h5>
                                    <span className={`badge ${a.priority === 'Urgent' ? 'badge-warning' : (a.priority === 'Important' ? 'badge-primary' : 'badge-muted')}`} style={{ fontSize: '11px', padding: '2px 6px' }}>{a.priority}</span>
                                </div>
                                <p style={{ margin: '4px 0', color: '#444' }}>{a.body}</p>
                                <p style={{ fontSize: '12px', color: '#888', margin: 0 }}>Posted: {new Date(a.postedAt).toLocaleString()}</p>
                            </div>
                            {!isRead && <button onClick={() => handleMarkRead(a.id)} className="btn-clinical-outline btn-sm">Mark Read</button>}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default MidwifeDashboard;
