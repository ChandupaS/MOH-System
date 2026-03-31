import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import axios from 'axios';
import SidebarLayout from './SidebarLayout';
import SymptomTracker from './SymptomTracker';
import PregnancyDetails from './PregnancyDetails';

const MotherDashboard = () => {
    const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')));
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(false);
    const [editForm, setEditForm] = useState({});
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        if (!user || user.role !== 'MOTHER') {
            navigate('/mother-login');
            return;
        }
        
        fetchProfile();
    }, [user, navigate]);

    const fetchProfile = async () => {
        try {
            const res = await axios.get(`http://localhost:8080/api/mother/${user.id}/profile`);
            setProfile(res.data);
            setEditForm(res.data);
            setLoading(false);
        } catch (err) {
            console.error('Failed to load profile:', err);
            setLoading(false);
        }
    };

    const handleSaveChanges = async () => {
        try {
            setSaving(true);
            setMessage('');
            const updateData = {
                healthConditions: editForm.healthConditions,
                contactNumber: editForm.contactNumber,
                address: editForm.address,
                height: editForm.height,
                weight: editForm.weight,
                allergies: editForm.allergies,
            };
            
            const res = await axios.put(
                `http://localhost:8080/api/mother/${user.id}/profile`,
                updateData
            );
            setProfile(res.data);
            setEditing(false);
            setMessage('Profile updated successfully! Your midwife can now see the changes.');
            setTimeout(() => setMessage(''), 5000);
        } catch (err) {
            setMessage('Failed to save changes. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '24px', marginBottom: '10px' }}>⏳</div>
                    <p>Loading your profile...</p>
                </div>
            </div>
        );
    }

    const menuItems = [
        { label: 'Dashboard', path: '/mother', exact: true },
        { label: 'Pregnancy Details', path: '/mother/pregnancy' },
        { label: 'Symptom Tracker', path: '/mother/symptoms' },
        { label: 'My Child', path: '/mother/child' },
        { label: 'Vaccination Records', path: '/mother/vaccinations' },
        { label: 'Announcements', path: '/mother/announcements' },
    ];

    return (
        <SidebarLayout userName={user?.name} role="MOTHER" menuItems={menuItems}>
            <Routes>
                <Route path="/" element={
                    <div className="dashboard-panel">
                        <div className="dashboard-header">
                            <h2>Welcome, {user?.name}! 👋</h2>
                            <p>Manage your maternal health and child care records</p>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginTop: '30px' }}>
                            <div className="stat-card" style={{ cursor: 'pointer' }} onClick={() => navigate('/mother/pregnancy')}>
                                <div style={{ fontSize: '40px', marginBottom: '10px' }}>🤰</div>
                                <h3>Pregnancy Details</h3>
                                <p>View and update pregnancy information</p>
                            </div>

                            <div className="stat-card" style={{ cursor: 'pointer' }} onClick={() => navigate('/mother/symptoms')}>
                                <div style={{ fontSize: '40px', marginBottom: '10px' }}>📊</div>
                                <h3>Symptom Tracker</h3>
                                <p>Log and track your health symptoms</p>
                            </div>

                            <div className="stat-card" style={{ cursor: 'pointer' }} onClick={() => navigate('/mother/child')}>
                                <div style={{ fontSize: '40px', marginBottom: '10px' }}>👶</div>
                                <h3>My Child</h3>
                                <p>View your child's health records</p>
                            </div>

                            <div className="stat-card" style={{ cursor: 'pointer' }} onClick={() => navigate('/mother/vaccinations')}>
                                <div style={{ fontSize: '40px', marginBottom: '10px' }}>💉</div>
                                <h3>Vaccination Records</h3>
                                <p>Track immunization schedules</p>
                            </div>
                        </div>

                        {profile && (
                            <div className="dashboard-panel" style={{ marginTop: '30px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                                    <h3>Your Profile Information</h3>
                                    {!editing && (
                                        <button 
                                            className="btn-clinical"
                                            onClick={() => setEditing(true)}
                                            style={{ padding: '8px 16px', fontSize: '14px' }}
                                        >
                                            ✏️ Edit Profile
                                        </button>
                                    )}
                                </div>

                                {message && (
                                    <div style={{ 
                                        padding: '12px', 
                                        marginBottom: '15px', 
                                        backgroundColor: message.includes('successfully') ? '#d4edda' : '#f8d7da',
                                        color: message.includes('successfully') ? '#155724' : '#721c24',
                                        borderRadius: '4px',
                                        fontSize: '14px'
                                    }}>
                                        {message}
                                    </div>
                                )}

                                {editing ? (
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '15px' }}>
                                        <div>
                                            <label style={{ fontWeight: 'bold', fontSize: '12px', color: '#666', display: 'block', marginBottom: '5px' }}>Name</label>
                                            <input 
                                                type="text" 
                                                value={user?.name}
                                                disabled
                                                style={{ width: '100%', padding: '8px', backgroundColor: '#f5f5f5', color: '#999', borderRadius: '4px', border: '1px solid #ddd' }}
                                            />
                                        </div>
                                        <div>
                                            <label style={{ fontWeight: 'bold', fontSize: '12px', color: '#666', display: 'block', marginBottom: '5px' }}>GN Division</label>
                                            <input 
                                                type="text" 
                                                value={profile?.gnDivision || ''}
                                                disabled
                                                style={{ width: '100%', padding: '8px', backgroundColor: '#f5f5f5', color: '#999', borderRadius: '4px', border: '1px solid #ddd' }}
                                            />
                                        </div>
                                        <div>
                                            <label style={{ fontWeight: 'bold', fontSize: '12px', color: '#666', display: 'block', marginBottom: '5px' }}>Contact Number</label>
                                            <input 
                                                type="tel" 
                                                value={editForm.contactNumber || ''}
                                                onChange={(e) => setEditForm({...editForm, contactNumber: e.target.value})}
                                                style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
                                            />
                                        </div>
                                        <div>
                                            <label style={{ fontWeight: 'bold', fontSize: '12px', color: '#666', display: 'block', marginBottom: '5px' }}>Height (cm)</label>
                                            <input 
                                                type="text" 
                                                value={editForm.height || ''}
                                                onChange={(e) => setEditForm({...editForm, height: e.target.value})}
                                                style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
                                            />
                                        </div>
                                        <div>
                                            <label style={{ fontWeight: 'bold', fontSize: '12px', color: '#666', display: 'block', marginBottom: '5px' }}>Weight (kg)</label>
                                            <input 
                                                type="text" 
                                                value={editForm.weight || ''}
                                                onChange={(e) => setEditForm({...editForm, weight: e.target.value})}
                                                style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
                                            />
                                        </div>
                                        <div>
                                            <label style={{ fontWeight: 'bold', fontSize: '12px', color: '#666', display: 'block', marginBottom: '5px' }}>Address</label>
                                            <input 
                                                type="text" 
                                                value={editForm.address || ''}
                                                onChange={(e) => setEditForm({...editForm, address: e.target.value})}
                                                style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
                                            />
                                        </div>
                                        <div style={{ gridColumn: '1 / -1' }}>
                                            <label style={{ fontWeight: 'bold', fontSize: '12px', color: '#666', display: 'block', marginBottom: '5px' }}>Health Conditions</label>
                                            <textarea 
                                                value={editForm.healthConditions || ''}
                                                onChange={(e) => setEditForm({...editForm, healthConditions: e.target.value})}
                                                style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd', minHeight: '80px', fontFamily: 'inherit' }}
                                                placeholder="e.g., Diabetes, Hypertension, etc."
                                            />
                                        </div>
                                        <div style={{ gridColumn: '1 / -1' }}>
                                            <label style={{ fontWeight: 'bold', fontSize: '12px', color: '#666', display: 'block', marginBottom: '5px' }}>Allergies</label>
                                            <textarea 
                                                value={editForm.allergies || ''}
                                                onChange={(e) => setEditForm({...editForm, allergies: e.target.value})}
                                                style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd', minHeight: '60px', fontFamily: 'inherit' }}
                                                placeholder="List any known allergies"
                                            />
                                        </div>
                                        <div style={{ gridColumn: '1 / -1', display: 'flex', gap: '10px', marginTop: '15px' }}>
                                            <button 
                                                className="btn-clinical"
                                                onClick={handleSaveChanges}
                                                disabled={saving}
                                                style={{ padding: '10px 20px' }}
                                            >
                                                {saving ? '💾 Saving...' : '💾 Save Changes'}
                                            </button>
                                            <button 
                                                className="btn-clinical-outline"
                                                onClick={() => {
                                                    setEditing(false);
                                                    setEditForm(profile);
                                                }}
                                                disabled={saving}
                                                style={{ padding: '10px 20px' }}
                                            >
                                                ✕ Cancel
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '15px', marginTop: '15px' }}>
                                        <div>
                                            <label style={{ fontWeight: 'bold', fontSize: '12px', color: '#666' }}>Name</label>
                                            <p>{user?.name}</p>
                                        </div>
                                        <div>
                                            <label style={{ fontWeight: 'bold', fontSize: '12px', color: '#666' }}>GN Division</label>
                                            <p>{profile?.gnDivision || 'Not specified'}</p>
                                        </div>
                                        <div>
                                            <label style={{ fontWeight: 'bold', fontSize: '12px', color: '#666' }}>Contact Number</label>
                                            <p>{profile?.contactNumber || 'Not specified'}</p>
                                        </div>
                                        <div>
                                            <label style={{ fontWeight: 'bold', fontSize: '12px', color: '#666' }}>Height</label>
                                            <p>{profile?.height || 'Not specified'} cm</p>
                                        </div>
                                        <div>
                                            <label style={{ fontWeight: 'bold', fontSize: '12px', color: '#666' }}>Weight</label>
                                            <p>{profile?.weight || 'Not specified'} kg</p>
                                        </div>
                                        <div>
                                            <label style={{ fontWeight: 'bold', fontSize: '12px', color: '#666' }}>Address</label>
                                            <p>{profile?.address || 'Not specified'}</p>
                                        </div>
                                        {profile?.healthConditions && (
                                            <div style={{ gridColumn: '1 / -1' }}>
                                                <label style={{ fontWeight: 'bold', fontSize: '12px', color: '#666' }}>Health Conditions</label>
                                                <p>{profile.healthConditions}</p>
                                            </div>
                                        )}
                                        {profile?.allergies && (
                                            <div style={{ gridColumn: '1 / -1' }}>
                                                <label style={{ fontWeight: 'bold', fontSize: '12px', color: '#666' }}>Allergies</label>
                                                <p>{profile.allergies}</p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                } />
                <Route path="/pregnancy" element={<PregnancyDetails />} />
                <Route path="/symptoms" element={<SymptomTracker />} />
                <Route path="/child" element={
                    <div className="dashboard-panel">
                        <h2>My Child</h2>
                        <p>Child health information will be displayed here.</p>
                    </div>
                } />
                <Route path="/vaccinations" element={
                    <div className="dashboard-panel">
                        <h2>Vaccination Records</h2>
                        <p>Your vaccination schedule and records will be displayed here.</p>
                    </div>
                } />
                <Route path="/announcements" element={
                    <div className="dashboard-panel">
                        <h2>Announcements</h2>
                        <p>Health announcements and updates from doctors will be displayed here.</p>
                    </div>
                } />
            </Routes>
        </SidebarLayout>
    );
};

export default MotherDashboard;
