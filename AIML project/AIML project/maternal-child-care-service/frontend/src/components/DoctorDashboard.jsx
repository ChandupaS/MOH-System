import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import axios from 'axios';
import SidebarLayout from './SidebarLayout';

const DoctorDashboard = () => {
    const [stats, setByStats] = useState({ totalMothers: 0, totalMidwives: 0, divisionsCovered: 0, activeHomeVisits: 0 });
    const [user, setByUser] = useState(JSON.parse(localStorage.getItem('user')));
    const navigate = useNavigate();

    const [loadingMothers, setLoadingMothers] = useState(true);
    const [mothersList, setMothersList] = useState([]);

    // Forms state
    const [midwifeForm, setMidwifeForm] = useState({ name: '', email: '', password: '', gnDivision: 'Malabe East' });
    const [midwifeMsg, setMidwifeMsg] = useState('');

    const [announcementForm, setAnnouncementForm] = useState({ title: '', body: '', priority: 'General', target: 'Both' });
    const [announcementMsg, setAnnouncementMsg] = useState('');
    const [announcementsList, setAnnouncementsList] = useState([]);
    const [editingId, setEditingId] = useState(null);

    useEffect(() => {
        if (!user || user.role !== 'DOCTOR') {
            navigate('/staff-login');
            return;
        }
        axios.get('http://localhost:8081/api/stats/doctor')
            .then(res => setByStats(res.data))
            .catch(err => {
                console.error(err);
                setByStats({ totalMothers: 0, totalMidwives: 0, divisionsCovered: 0, activeHomeVisits: 0 });
            });

        fetchMothers();
        fetchAnnouncements();
    }, [user, navigate]);

    const fetchMothers = () => {
        axios.get('http://localhost:8081/api/doctor/mothers')
            .then(res => setMothersList(res.data))
            .catch(err => console.error(err))
            .finally(() => setLoadingMothers(false));
    };

    const fetchAnnouncements = () => {
        axios.get('http://localhost:8081/api/doctor/announcements')
            .then(res => setAnnouncementsList(res.data))
            .catch(err => console.error(err));
    };

    const handleMidwifeSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post('http://localhost:8081/api/doctor/add-midwife', midwifeForm);
            setMidwifeMsg('Midwife added successfully!');
            setMidwifeForm({ name: '', email: '', password: '', gnDivision: 'Malabe East' });
            // refresh stats
            axios.get('http://localhost:8081/api/stats/doctor').then(res => setByStats(res.data));
            setTimeout(() => setMidwifeMsg(''), 3000);
        } catch (err) {
            setMidwifeMsg('Error adding midwife.');
        }
    };

    const handleAnnouncementSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingId) {
                await axios.put(`http://localhost:8081/api/doctor/announcements/${editingId}`, announcementForm);
                setAnnouncementMsg('Announcement updated successfully!');
            } else {
                const payload = { ...announcementForm, postedBy: { id: user.id } };
                await axios.post('http://localhost:8081/api/doctor/announcements', payload);
                setAnnouncementMsg('Announcement posted successfully!');
            }
            setAnnouncementForm({ title: '', body: '', priority: 'General', target: 'Both' });
            setEditingId(null);
            fetchAnnouncements();
            setTimeout(() => setAnnouncementMsg(''), 3000);
        } catch (err) {
            setAnnouncementMsg('Error saving announcement.');
        }
    };

    const handleEditClick = (ann) => {
        setAnnouncementForm({ title: ann.title, body: ann.body, priority: ann.priority, target: ann.target || 'Both' });
        setEditingId(ann.id);
    };

    const handleAnnouncementDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this announcement?")) return;
        try {
            await axios.delete(`http://localhost:8081/api/doctor/announcements/${id}`);
            fetchAnnouncements();
        } catch (err) {
            alert('Error deleting announcement.');
        }
    };

    const menuItems = [
        { label: 'Home', path: '/doctor', exact: true },
        { label: 'Manage Midwives', path: '/doctor/midwives' },
        { label: 'Manage Mothers', path: '/doctor/mothers' },
        { label: 'Announcements', path: '/doctor/announcements' },
    ];

    return (
        <SidebarLayout userName={user?.name} role="DOCTOR" menuItems={menuItems}>
            <Routes>
                <Route index element={<DoctorOverview stats={stats} user={user} navigate={navigate} announcementsList={announcementsList} mothersList={mothersList} />} />
                <Route path="midwives" element={
                    <div>
                        <h2 className="page-title">Manage Midwives</h2>
                        <div className="dashboard-panel">
                            <h3>Register New Midwife</h3>
                            {midwifeMsg && <p className={midwifeMsg.includes('Error') ? 'error-msg-modern' : 'success-msg-modern'} style={{ color: midwifeMsg.includes('Error') ? 'red' : 'green' }}>{midwifeMsg}</p>}
                            <form onSubmit={handleMidwifeSubmit} style={{ marginTop: '20px' }}>
                                <div className="clinical-form-group">
                                    <label>Full Name</label>
                                    <input className="clinical-input-field" value={midwifeForm.name} onChange={e => setMidwifeForm({ ...midwifeForm, name: e.target.value })} required />
                                </div>
                                <div className="clinical-form-group">
                                    <label>Email</label>
                                    <input type="email" className="clinical-input-field" value={midwifeForm.email} onChange={e => setMidwifeForm({ ...midwifeForm, email: e.target.value })} required />
                                </div>
                                <div className="clinical-form-group">
                                    <label>Temporary Password</label>
                                    <input type="password" className="clinical-input-field" value={midwifeForm.password} onChange={e => setMidwifeForm({ ...midwifeForm, password: e.target.value })} required />
                                </div>
                                <div className="clinical-form-group">
                                    <label>Assigned GN Division</label>
                                    <input className="clinical-input-field" value={midwifeForm.gnDivision} onChange={e => setMidwifeForm({ ...midwifeForm, gnDivision: e.target.value })} required />
                                </div>
                                <button type="submit" className="btn-clinical" style={{ marginTop: '10px' }}>Register Midwife</button>
                            </form>
                        </div>
                    </div>
                } />
                <Route path="mothers" element={
                    <div>
                        <h2 className="page-title">Manage Mothers</h2>
                        <div className="dashboard-panel">
                            <h3>System-Wide Mother Repository</h3>
                            {loadingMothers ? <p>Loading...</p> : mothersList.map(m => (
                                <div key={m.id} className="list-item-clinical">
                                    <div className="list-item-clinical-text">
                                        <h5>{m.user?.name || 'Unknown'} (NIC: {m.nic})</h5>
                                        <p>Division: {m.gnDivision} | Conditions: {m.healthConditions || 'None'}</p>
                                    </div>
                                    <span className={`badge ${m.healthConditions && m.healthConditions.includes('Diabetes') ? 'badge-warning' : 'badge-primary'}`}>
                                        {m.healthConditions && m.healthConditions.includes('Diabetes') ? 'High Risk' : 'Active'}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                } />
                <Route path="announcements" element={
                    <div>
                        <h2 className="page-title">Announcements</h2>
                        <div className="dashboard-panel">
                            <h3>{editingId ? "Edit Announcement" : "Post a New Announcement"}</h3>
                            {announcementMsg && <p style={{ color: announcementMsg.includes('Error') ? 'red' : 'green', margin: '10px 0' }}>{announcementMsg}</p>}
                            <form onSubmit={handleAnnouncementSubmit} style={{ marginBottom: '30px' }}>
                                <div className="clinical-form-group">
                                    <label>Title</label>
                                    <input className="clinical-input-field" value={announcementForm.title} onChange={e => setAnnouncementForm({ ...announcementForm, title: e.target.value })} required />
                                </div>
                                <div className="clinical-form-group">
                                    <label>Message Body</label>
                                    <textarea className="clinical-input-field" rows="4" value={announcementForm.body} onChange={e => setAnnouncementForm({ ...announcementForm, body: e.target.value })} required />
                                </div>
                                <div style={{ display: 'flex', gap: '20px' }}>
                                    <div className="clinical-form-group" style={{ flex: 1 }}>
                                        <label>Priority</label>
                                        <select className="clinical-select-field" value={announcementForm.priority} onChange={e => setAnnouncementForm({ ...announcementForm, priority: e.target.value })}>
                                            <option value="General">General</option>
                                            <option value="Important">Important</option>
                                            <option value="Urgent">Urgent</option>
                                        </select>
                                    </div>
                                    <div className="clinical-form-group" style={{ flex: 1 }}>
                                        <label>Target Audience</label>
                                        <select className="clinical-select-field" value={announcementForm.target} onChange={e => setAnnouncementForm({ ...announcementForm, target: e.target.value })}>
                                            <option value="Both">Midwives & Mothers</option>
                                            <option value="Midwives">Midwives Only</option>
                                            <option value="Mothers">Mothers Only</option>
                                        </select>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                                    <button type="submit" className="btn-clinical">{editingId ? "Save Changes" : "Post Announcement"}</button>
                                    {editingId && <button type="button" className="btn-clinical-outline" onClick={() => { setEditingId(null); setAnnouncementForm({ title: '', body: '', priority: 'General', target: 'Both' }); }}>Cancel Edit</button>}
                                </div>
                            </form>

                            <h3>Recent System Broadcasts</h3>
                            {announcementsList.length === 0 ? <p>No announcements posted yet.</p> : announcementsList.map(a => (
                                <div key={a.id} className="list-item-clinical" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <div className="list-item-clinical-text" style={{ flex: 1 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                                            <h5 style={{ margin: 0 }}>{a.title}</h5>
                                            <span className={`badge ${a.priority === 'Urgent' ? 'badge-warning' : (a.priority === 'Important' ? 'badge-primary' : 'badge-muted')}`} style={{ fontSize: '11px', padding: '2px 6px' }}>{a.priority}</span>
                                            <span style={{ fontSize: '11px', color: '#666', border: '1px solid #ccc', borderRadius: '4px', padding: '1px 5px' }}>Target: {a.target || 'Both'}</span>
                                        </div>
                                        <p style={{ margin: '4px 0', color: '#444' }}>{a.body}</p>
                                        <p style={{ fontSize: '12px', color: '#888', margin: 0 }}>Posted: {new Date(a.postedAt).toLocaleString()}{a.updatedAt ? ` (Updated: ${new Date(a.updatedAt).toLocaleString()})` : ''}</p>
                                    </div>
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <button onClick={() => handleEditClick(a)} className="btn-clinical-outline btn-sm">Edit</button>
                                        <button onClick={() => handleAnnouncementDelete(a.id)} className="btn-clinical-outline btn-sm" style={{ borderColor: '#ef233c', color: '#ef233c' }}>Delete</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                } />
            </Routes>
        </SidebarLayout>
    );
};

const DoctorOverview = ({ stats, user, navigate, announcementsList, mothersList }) => {
    return (
        <div className="overview-container">
            <h2 className="page-title">Doctor Dashboard</h2>

            <div className="welcome-card-modern">
                <h2>Welcome, Dr. {user?.name || 'Doctor'}</h2>
                <p>Monitor system-wide maternal healthcare metrics and manage your clinical staff.</p>
            </div>

            <div className="stats-grid-modern">
                <div className="stat-card-modern">
                    <p>Registered Mothers</p>
                    <h4>{stats?.totalMothers || 0}</h4>
                </div>
                <div className="stat-card-modern">
                    <p>Total Midwives</p>
                    <h4>{stats?.totalMidwives || 0}</h4>
                </div>
                <div className="stat-card-modern">
                    <p>GN Divisions Covered</p>
                    <h4>{stats?.divisionsCovered || 0}</h4>
                </div>
                <div className="stat-card-modern">
                    <p>Active Home Visits</p>
                    <h4>{stats?.activeHomeVisits || 0}</h4>
                </div>
            </div>

            <div className="dashboard-panel">
                <h3>Recent Registrations</h3>
                {mothersList.slice(-2).reverse().map(m => (
                    <div key={m.id} className="list-item-clinical">
                        <div className="list-item-clinical-text">
                            <h5>{m.user?.name}</h5>
                            <p>Registered in {m.gnDivision} division</p>
                        </div>
                        <span className="badge badge-primary">New</span>
                    </div>
                ))}
                {mothersList.length === 0 && <p>No recent registrations.</p>}
                <div style={{ marginTop: '18px' }}>
                    <button onClick={() => navigate('/doctor/mothers')} className="btn-clinical">
                        View All Mothers
                    </button>
                </div>
            </div>

            <div className="dashboard-panel">
                <h3>Recent Announcements</h3>
                {announcementsList.slice(0, 2).map(a => (
                    <div key={a.id} className="list-item-clinical">
                        <div className="list-item-clinical-text">
                            <h5>{a.title}</h5>
                            <p>{new Date(a.postedAt).toLocaleDateString()}</p>
                        </div>
                        <span className={`badge ${a.priority === 'Urgent' ? 'badge-warning' : 'badge-primary'}`}>{a.priority}</span>
                    </div>
                ))}
                {announcementsList.length === 0 && <p>No announcements.</p>}
                <div style={{ marginTop: '18px' }}>
                    <button onClick={() => navigate('/doctor/announcements')} className="btn-clinical">
                        Manage Announcements
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DoctorDashboard;
