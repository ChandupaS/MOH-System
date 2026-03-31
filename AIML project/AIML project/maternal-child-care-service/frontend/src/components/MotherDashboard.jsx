import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import axios from 'axios';
import SidebarLayout from './SidebarLayout';
import SymptomTracker from './SymptomTracker';
import PregnancyDetails from './PregnancyDetails';

const PREGNANCY_MILESTONES = [
    { week: 4, label: 'Confirmation', detail: 'HCG levels rising. Blood pregnancy test confirmed.' },
    { week: 8, label: 'First Dating Scan', detail: 'Heartbeat visible. Checking for viable pregnancy.' },
    { week: 12, label: 'NT Scan & Labs', detail: 'End of 1st Trimester. Chromosomal screening.' },
    { week: 16, label: 'Weight & BP Check', detail: 'Monitoring for early signs of hypertension.' },
    { week: 20, label: 'Anatomy Scan', detail: 'Full fetal development check. Gender identification.' },
    { week: 24, label: 'Glucose Test', detail: 'Screening for Gestational Diabetes.' },
    { week: 28, label: '3rd Trimester Begins', detail: 'Fetal growth monitoring. Daily kick counts.' },
    { week: 32, label: 'Growth Ultrasound', detail: 'Checking baby position and fluid levels.' },
    { week: 36, label: 'Group B Strep Test', detail: 'Final screening before labor prep.' },
    { week: 40, label: 'EDD Delivery', detail: 'Full term development. Labor imminent.' }
];

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
                    <div className="mm-spinner" style={{ margin: '0 auto 15px' }}></div>
                    <p style={{ color: 'var(--text-muted)' }}>Retrieving clinical records...</p>
                </div>
            </div>
        );
    }

    const menuItems = [
        { label: 'Dashboard', path: '/mother', exact: true },
        { label: 'Pregnancy Details', path: '/mother/pregnancy' },
        { label: 'Symptom Tracker', path: '/mother/symptoms' },
        { label: 'Vaccination Records', path: '/mother/vaccinations' },
    ];

    return (
        <SidebarLayout userName={user?.name} role="MOTHER" menuItems={menuItems}>
            <Routes>
                <Route path="/" element={
                    <div className="dashboard-panel">
                        <div className="dashboard-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <svg viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2" width="28" height="28">
                                        <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/>
                                    </svg>
                                    Welcome, {user?.name}!
                                </h2>
                                <p>Manage your maternal health and child care records</p>
                            </div>
                            <button 
                                className="btn-clinical" 
                                onClick={() => window.location.href = '/child'}
                                style={{ background: 'var(--accent)', border: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}
                            >
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
                                    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                                </svg>
                                Switch to Child Dashboard
                            </button>
                        </div>

                        {/* Patient Journey Section */}
                        {profile?.edd && profile?.lmp ? (() => {
                            const lmpDate = new Date(profile.lmp);
                            const today = new Date();
                            const weeksAlong = Math.floor((today - lmpDate) / (1000 * 60 * 60 * 24 * 7));
                            const remainingWeeks = Math.max(0, 40 - weeksAlong);
                            const trimester = weeksAlong <= 12 ? 1 : (weeksAlong <= 27 ? 2 : 3);
                            
                            const weeklyInsights = {
                                12: "Your baby is now the size of a lime! Their facial features are beginning to look more human.",
                                20: "You're at the halfway mark! Your baby can now swallow and is becoming more active each day.",
                                24: "Baby's lungs are developing surfactant, which will help them breathe after birth.",
                                28: "Welcome to the 3rd trimester! Your baby's eyes can now open and close.",
                                36: "Baby is head-down now, getting ready for the big day. You might feel more pressure as they drop.",
                                40: "Delivery week! Your baby is fully developed and ready to meet you."
                            };
                            
                            const currentInsight = Object.entries(weeklyInsights).reverse().find(([w]) => weeksAlong >= w)?.[1] || "Your baby is developing beautifully. Remember to stay hydrated and take your prenatal vitamins.";

                            return (
                                <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '20px', marginTop: '30px' }}>
                                    <div className="dashboard-panel" style={{ margin: 0, borderTop: '4px solid var(--primary)' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <h3>Your Pregnancy Journey</h3>
                                            <span className="badge badge-primary">Trimester {trimester}</span>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', margin: '20px 0' }}>
                                            <div style={{ background: 'var(--primary-light)', padding: '20px', borderRadius: '50%', width: '80px', height: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', fontWeight: '800', color: 'var(--primary)', border: '2px solid var(--primary)' }}>
                                                W{weeksAlong}
                                            </div>
                                            <div>
                                                <h4 style={{ margin: 0 }}>You are in Week {weeksAlong}</h4>
                                                <p style={{ margin: 0, color: 'var(--text-muted)' }}>{remainingWeeks} weeks until your due date</p>
                                            </div>
                                        </div>
                                        
                                        <div style={{ background: '#f8fafc', padding: '15px', borderRadius: '12px', borderLeft: '4px solid var(--accent)' }}>
                                            <h5 style={{ marginBottom: '8px', color: 'var(--accent)' }}>✨ This Week's Insight</h5>
                                            <p style={{ margin: 0, fontSize: '14px', lineHeight: '1.6' }}>{currentInsight}</p>
                                        </div>

                                        <div style={{ marginTop: '25px' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '8px', fontWeight: '600' }}>
                                                <span>Trimester Progress</span>
                                                <span>{Math.min(100, Math.round((weeksAlong / 40) * 100))}%</span>
                                            </div>
                                            <div style={{ height: '10px', background: '#e2e8f0', borderRadius: '5px', overflow: 'hidden' }}>
                                                <div style={{ width: `${(weeksAlong / 40) * 100}%`, height: '100%', background: 'linear-gradient(90deg, var(--primary), var(--accent))' }}></div>
                                            </div>
                                        </div>
                                    </div>

                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                        <div className="dashboard-panel" style={{ margin: 0 }}>
                                            <h4 style={{ fontSize: '16px' }}>Upcoming Milestones</h4>
                                            <div style={{ marginTop: '15px' }}>
                                                {PREGNANCY_MILESTONES.filter(m => m.week >= weeksAlong).slice(0, 2).map(m => (
                                                    <div key={m.week} style={{ padding: '12px', borderBottom: '1px solid #f1f5f9' }}>
                                                        <span style={{ fontSize: '10px', fontWeight: '800', color: 'var(--primary)' }}>WEEK {m.week}</span>
                                                        <h5 style={{ margin: '2px 0', fontSize: '14px' }}>{m.label}</h5>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="dashboard-panel" style={{ margin: 0, background: 'var(--secondary)', color: 'white' }}>
                                            <h4 style={{ color: 'white', fontSize: '14px' }}>Due Date</h4>
                                            <h2 style={{ color: 'white', fontSize: '24px', margin: '10px 0' }}>{new Date(profile.edd).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</h2>
                                            <p style={{ margin: 0, fontSize: '12px', opacity: 0.8 }}>Hand-coded by your midwife</p>
                                        </div>
                                    </div>
                                </div>
                            );
                        })() : (
                            <div className="dashboard-panel" style={{ marginTop: '30px', textAlign: 'center', padding: '60px' }}>
                                <div style={{ marginBottom: '20px', color: 'var(--primary)', opacity: 0.5 }}>
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" width="80" height="80">
                                        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                                    </svg>
                                </div>
                                <h3>Welcome to your Journey</h3>
                                <p style={{ color: 'var(--text-muted)', maxWidth: '500px', margin: '0 auto' }}>Your midwife hasn't added your clinical pregnancy details yet. Once they record your last period date, you'll see your week-by-week progress here!</p>
                            </div>
                        )}

                        {/* Announcements Card (In-Dashboard) */}
                        <div className="dashboard-panel" style={{ marginTop: '30px', borderLeft: '4px solid var(--warning)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                                <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <svg viewBox="0 0 24 24" fill="none" stroke="var(--warning)" strokeWidth="2" width="20" height="20">
                                        <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0"/>
                                    </svg>
                                    Latest Health Announcements
                                </h3>
                            </div>
                            <div className="list-item-clinical">
                                <div className="list-item-clinical-text">
                                    <h5 style={{ color: 'var(--secondary)' }}>National Vaccination Campaign</h5>
                                    <p style={{ fontSize: '13px' }}>The MOH has announced a special vaccination drive for all children under 5 next Saturday.</p>
                                </div>
                                <span className="badge" style={{ background: 'var(--warning)', color: 'white' }}>New</span>
                            </div>
                            <div className="list-item-clinical" style={{ border: 'none' }}>
                                <div className="list-item-clinical-text">
                                    <h5 style={{ color: 'var(--secondary)' }}>Dengue Prevention Notice</h5>
                                    <p style={{ fontSize: '13px' }}>Please ensure all water containers are cleaned to prevent mosquito breeding in the Malabe area.</p>
                                </div>
                                <span className="badge badge-muted">2 Days Ago</span>
                            </div>
                        </div>

                        {profile && (
                            <div className="dashboard-panel" style={{ marginTop: '30px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                                    <h3>Your Profile Information</h3>
                                        <button 
                                            className="btn-clinical"
                                            onClick={() => setEditing(true)}
                                            style={{ padding: '8px 16px', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}
                                        >
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
                                                <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7M18.5 2.5a2.121 2.121 0 113 3L12 15l-4 1 1-4 9.5-9.5z"/>
                                            </svg>
                                            Edit Profile
                                        </button>
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
                                                {saving ? 'Saving...' : 'Save Changes'}
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
                                                Cancel
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
                <Route path="/pregnancy" element={<PregnancyDetails motherUserId={user.id} readOnly={true} />} />
                <Route path="/symptoms" element={<SymptomTracker />} />
                <Route path="/vaccinations" element={
                    <div className="dashboard-panel">
                        <h2>Vaccination Records</h2>
                        <p>Your vaccination schedule and records will be displayed here.</p>
                    </div>
                } />
            </Routes>
        </SidebarLayout>
    );
};

export default MotherDashboard;
