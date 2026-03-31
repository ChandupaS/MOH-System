import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './MotherProfileHub.css';

const MotherProfileHub = ({ midwifeId }) => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [editing, setEditing] = useState(false);
    const [editForm, setEditForm] = useState({});
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchProfile();
    }, [id, midwifeId]);

    const fetchProfile = async () => {
        try {
            setLoading(true);
            const res = await axios.get(`http://localhost:8080/api/midwife/${midwifeId}/mother/${id}`);
            setProfile(res.data);
            setEditForm(res.data);
        } catch (err) {
            setError('Failed to load profile. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleSaveChanges = async () => {
        try {
            setSaving(true);
            const updateData = {
                edd: editForm.edd,
                lmp: editForm.lmp,
                gravida: editForm.gravida,
                para: editForm.para,
                previousCSections: editForm.previousCSections,
                previousMiscarriages: editForm.previousMiscarriages,
                previousStillbirths: editForm.previousStillbirths,
                bloodGroup: editForm.bloodGroup,
                height: editForm.height,
                weight: editForm.weight,
                allergies: editForm.allergies,
                healthConditions: editForm.healthConditions,
            };

            const res = await axios.put(
                `http://localhost:8080/api/midwife/${midwifeId}/mother/${id}`,
                updateData
            );
            setProfile(res.data);
            setEditing(false);
            alert('Mother profile updated successfully!');
        } catch (err) {
            alert('Failed to save changes. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="hub-container">
                <div className="hub-loader">
                    <div className="hub-spinner"></div>
                    <p>Loading patient record...</p>
                </div>
            </div>
        );
    }

    if (error || !profile) {
        return (
            <div className="hub-container">
                <button className="btn-clinical-outline hub-back" onClick={() => navigate('/midwife/mothers')}>
                    &larr; Back to List
                </button>
                <div className="mm-error-banner" style={{ marginTop: '20px' }}>{error || 'Patient not found.'}</div>
            </div>
        );
    }

    const name = profile.user?.name || 'Unknown';
    const regDate = profile.registrationDate
        ? new Date(profile.registrationDate).toLocaleDateString('en-GB')
        : 'N/A';
    const currentWeek = profile.weeksAlong || 24;
    const status = profile.healthConditions && profile.healthConditions.includes('Diabetes') ? 'High Risk' : 'Normal';

    return (
        <div className="hub-container">
            {/* Header Actions */}
            <div className="hub-header-actions">
                <button className="btn-clinical-outline hub-back" onClick={() => navigate('/midwife/mothers')}>
                    &larr; Back to Manage Mothers
                </button>
                {!editing && (
                    <button className="btn-clinical" onClick={() => setEditing(true)}>
                        Edit Clinical Info
                    </button>
                )}
                {editing && (
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <button
                            className="btn-clinical"
                            onClick={handleSaveChanges}
                            disabled={saving}
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
                        >
                            Cancel
                        </button>
                    </div>
                )}
            </div>

            {/* Profile Overview Card */}
            <div className="dashboard-panel hub-overview">
                <div className="hub-avatar">
                    {name.slice(0, 2).toUpperCase()}
                </div>
                <div className="hub-info">
                    <h2 className="hub-name">{name}</h2>
                    <div className="hub-meta-grid">
                        <div className="hub-meta-item">
                            <span className="hub-meta-label">Patient ID</span>
                            <span className="hub-meta-value">#{profile.id}</span>
                        </div>
                        <div className="hub-meta-item">
                            <span className="hub-meta-label">GN Division</span>
                            <span className="hub-meta-value">{profile.gnDivision}</span>
                        </div>
                        <div className="hub-meta-item">
                            <span className="hub-meta-label">Registered</span>
                            <span className="hub-meta-value">{regDate}</span>
                        </div>
                        <div className="hub-meta-item">
                            <span className="hub-meta-label">Current Status</span>
                            <span className={`badge ${status === 'High Risk' ? 'badge-warning' : 'badge-primary'}`}>
                                {status}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {editing ? (
                // Edit Form
                <div className="dashboard-panel" style={{ marginTop: '20px' }}>
                    <h3>Edit Clinical Information</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '15px', marginTop: '15px' }}>
                        <div>
                            <label>Expected Delivery Date</label>
                            <input
                                type="date"
                                value={editForm.edd || ''}
                                onChange={(e) => setEditForm({ ...editForm, edd: e.target.value })}
                                style={{ width: '100%', padding: '8px' }}
                            />
                        </div>
                        <div>
                            <label>Last Menstrual Period</label>
                            <input
                                type="date"
                                value={editForm.lmp || ''}
                                onChange={(e) => setEditForm({ ...editForm, lmp: e.target.value })}
                                style={{ width: '100%', padding: '8px' }}
                            />
                        </div>
                        <div>
                            <label>Gravida (Number of Pregnancies)</label>
                            <input
                                type="number"
                                value={editForm.gravida || ''}
                                onChange={(e) => setEditForm({ ...editForm, gravida: e.target.value })}
                                style={{ width: '100%', padding: '8px' }}
                            />
                        </div>
                        <div>
                            <label>Para (Number of Live Births)</label>
                            <input
                                type="number"
                                value={editForm.para || ''}
                                onChange={(e) => setEditForm({ ...editForm, para: e.target.value })}
                                style={{ width: '100%', padding: '8px' }}
                            />
                        </div>
                        <div>
                            <label>Previous C-Sections</label>
                            <input
                                type="number"
                                value={editForm.previousCSections || ''}
                                onChange={(e) => setEditForm({ ...editForm, previousCSections: e.target.value })}
                                style={{ width: '100%', padding: '8px' }}
                            />
                        </div>
                        <div>
                            <label>Previous Miscarriages</label>
                            <input
                                type="number"
                                value={editForm.previousMiscarriages || ''}
                                onChange={(e) => setEditForm({ ...editForm, previousMiscarriages: e.target.value })}
                                style={{ width: '100%', padding: '8px' }}
                            />
                        </div>
                        <div>
                            <label>Previous Stillbirths</label>
                            <input
                                type="number"
                                value={editForm.previousStillbirths || ''}
                                onChange={(e) => setEditForm({ ...editForm, previousStillbirths: e.target.value })}
                                style={{ width: '100%', padding: '8px' }}
                            />
                        </div>
                        <div>
                            <label>Blood Group</label>
                            <input
                                type="text"
                                value={editForm.bloodGroup || ''}
                                onChange={(e) => setEditForm({ ...editForm, bloodGroup: e.target.value })}
                                style={{ width: '100%', padding: '8px' }}
                                placeholder="e.g., O+, A-, B+"
                            />
                        </div>
                        <div>
                            <label>Height (cm)</label>
                            <input
                                type="text"
                                value={editForm.height || ''}
                                onChange={(e) => setEditForm({ ...editForm, height: e.target.value })}
                                style={{ width: '100%', padding: '8px' }}
                            />
                        </div>
                        <div>
                            <label>Weight (kg)</label>
                            <input
                                type="text"
                                value={editForm.weight || ''}
                                onChange={(e) => setEditForm({ ...editForm, weight: e.target.value })}
                                style={{ width: '100%', padding: '8px' }}
                            />
                        </div>
                        <div style={{ gridColumn: '1 / -1' }}>
                            <label>Health Conditions</label>
                            <textarea
                                value={editForm.healthConditions || ''}
                                onChange={(e) => setEditForm({ ...editForm, healthConditions: e.target.value })}
                                style={{ width: '100%', padding: '8px', minHeight: '80px' }}
                                placeholder="Comma-separated list (e.g., Diabetes, Hypertension)"
                            />
                        </div>
                        <div style={{ gridColumn: '1 / -1' }}>
                            <label>Allergies</label>
                            <textarea
                                value={editForm.allergies || ''}
                                onChange={(e) => setEditForm({ ...editForm, allergies: e.target.value })}
                                style={{ width: '100%', padding: '8px', minHeight: '60px' }}
                                placeholder="Enter any known allergies"
                            />
                        </div>
                    </div>
                </div>
            ) : (
                // Display Mode
                <>
                    <h3 className="hub-nav-title">Patient Records & Sections</h3>

                    {/* Pregnancy Details Card */}
                    <div className="dashboard-panel" style={{ marginTop: '20px' }}>
                        <h3>Pregnancy Details</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px', marginTop: '15px' }}>
                            <div>
                                <span style={{ fontWeight: 'bold', color: '#666', fontSize: '12px' }}>Expected Delivery Date</span>
                                <p>{profile.edd ? new Date(profile.edd).toLocaleDateString() : 'Not set'}</p>
                            </div>
                            <div>
                                <span style={{ fontWeight: 'bold', color: '#666', fontSize: '12px' }}>Last Menstrual Period</span>
                                <p>{profile.lmp ? new Date(profile.lmp).toLocaleDateString() : 'Not set'}</p>
                            </div>
                            <div>
                                <span style={{ fontWeight: 'bold', color: '#666', fontSize: '12px' }}>Gravida</span>
                                <p>{profile.gravida || '-'}</p>
                            </div>
                            <div>
                                <span style={{ fontWeight: 'bold', color: '#666', fontSize: '12px' }}>Para</span>
                                <p>{profile.para || '-'}</p>
                            </div>
                            <div>
                                <span style={{ fontWeight: 'bold', color: '#666', fontSize: '12px' }}>Previous C-Sections</span>
                                <p>{profile.previousCSections || '0'}</p>
                            </div>
                            <div>
                                <span style={{ fontWeight: 'bold', color: '#666', fontSize: '12px' }}>Previous Miscarriages</span>
                                <p>{profile.previousMiscarriages || '0'}</p>
                            </div>
                        </div>
                    </div>

                    {/* Health Info Card */}
                    <div className="dashboard-panel" style={{ marginTop: '20px' }}>
                        <h3>Health Information</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px', marginTop: '15px' }}>
                            <div>
                                <span style={{ fontWeight: 'bold', color: '#666', fontSize: '12px' }}>Blood Group</span>
                                <p>{profile.bloodGroup || '-'}</p>
                            </div>
                            <div>
                                <span style={{ fontWeight: 'bold', color: '#666', fontSize: '12px' }}>Height</span>
                                <p>{profile.height || '-'} cm</p>
                            </div>
                            <div>
                                <span style={{ fontWeight: 'bold', color: '#666', fontSize: '12px' }}>Weight</span>
                                <p>{profile.weight || '-'} kg</p>
                            </div>
                        </div>
                        {profile.healthConditions && (
                            <div style={{ marginTop: '15px', paddingTop: '15px', borderTop: '1px solid #e0e0e0' }}>
                                <span style={{ fontWeight: 'bold', color: '#666', fontSize: '12px' }}>Health Conditions</span>
                                <p style={{ marginTop: '5px' }}>{profile.healthConditions}</p>
                            </div>
                        )}
                        {profile.allergies && (
                            <div style={{ marginTop: '15px', paddingTop: '15px', borderTop: '1px solid #e0e0e0' }}>
                                <span style={{ fontWeight: 'bold', color: '#666', fontSize: '12px' }}>Allergies</span>
                                <p style={{ marginTop: '5px' }}>{profile.allergies}</p>
                            </div>
                        )}
                    </div>

                    {/* Navigation Grid */}
                    <div className="hub-nav-grid" style={{ marginTop: '30px' }}>
                        <div className="hub-nav-card" onClick={() => navigate(`/midwife/mothers/profile/${id}/pregnancy`)}>
                            <h4>Pregnancy Details</h4>
                            <p>{profile.edd ? `EDD: ${new Date(profile.edd).toLocaleDateString()}` : 'No EDD set'}</p>
                            <span className="badge badge-primary" style={{ marginTop: '10px', display: 'inline-block' }}>
                                {profile.lmp ? 'Record Complete' : 'Details Pending'}
                            </span>
                        </div>

                        <div className="hub-nav-card" onClick={() => navigate(`/midwife/mothers/profile/${id}/child`)}>
                            <h4>Child Records</h4>
                            <p>Development tracking, birth details, and neonatal history.</p>
                            <span className="badge badge-muted" style={{ marginTop: '10px', display: 'inline-block' }}>View Profile</span>
                        </div>

                        <div className="hub-nav-card" onClick={() => navigate(`/midwife/mothers/profile/${id}/vaccinations`)}>
                            <h4>Vaccination Schedule</h4>
                            <p>Manage and track maternal and child immunization schedules.</p>
                        </div>

                        <div className="hub-nav-card" onClick={() => navigate(`/midwife/mothers/profile/${id}/symptoms`)}>
                            <h4>Symptom Tracker</h4>
                            <p>Review all physical and emotional symptom entries logged by the mother.</p>
                        </div>

                        <div className="hub-nav-card" onClick={() => navigate(`/midwife/mothers/profile/${id}/visits`)}>
                            <h4>Home Visits</h4>
                            <p>View, schedule, and document notes for community home visits.</p>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default MotherProfileHub;
