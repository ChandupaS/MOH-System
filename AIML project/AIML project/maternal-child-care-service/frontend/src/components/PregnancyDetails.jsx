import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './PregnancyDetails.css';

const MEDICAL_HISTORY_OPTS = [
    'Hypertension', 'Diabetes', 'Cardiac diseases', 'Renal diseases',
    'Hepatic diseases', 'Psychiatric illnesses', 'Epilepsy', 'Malignancies',
    'Haematological diseases', 'Tuberculosis', 'Thyroid diseases', 'Bronchial asthma'
];

const PregnancyDetails = ({ midwifeId }) => {
    const { id } = useParams();
    const navigate = useNavigate();
    
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [profile, setProfile] = useState(null);
    const [user, setUser] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    
    // Form State
    const [form, setForm] = useState({
        // Patient Details
        firstName: '', lastName: '', nic: '', email: '', contactNumber: '', dob: '', address: '', phmArea: '', mohArea: '',
        // Father Details
        fatherFirstName: '', fatherLastName: '', fatherNic: '',
        // Pregnancy Details
        edd: '', lmp: '', registrationDate: '', gravida: '', para: '', previousCSections: '', previousMiscarriages: '', previousStillbirths: '', bloodGroup: '', height: '', weight: '',
        // Medical History
        healthConditions: [], otherConditions: '', allergies: ''
    });

    useEffect(() => {
        const fetchDetails = async () => {
            try {
                const res = await axios.get(`http://localhost:8080/api/midwife/${midwifeId}/mother/${id}`);
                const data = res.data;
                setProfile(data);
                setUser(data.user);
                
                const nameParts = (data.user?.name || '').split(' ');
                setForm({
                    firstName: nameParts[0] || '',
                    lastName: nameParts.slice(1).join(' ') || '',
                    nic: data.nic || '',
                    email: data.user?.email || '',
                    contactNumber: data.contactNumber || '',
                    dob: data.dob || '',
                    address: data.address || '',
                    phmArea: data.phmArea || '',
                    mohArea: data.mohArea || '',
                    
                    fatherFirstName: data.fatherFirstName || '',
                    fatherLastName: data.fatherLastName || '',
                    fatherNic: data.fatherNic || '',
                    
                    edd: data.edd ? data.edd.split('T')[0] : '',
                    lmp: data.lmp ? data.lmp.split('T')[0] : '',
                    registrationDate: data.registrationDate ? data.registrationDate.split('T')[0] : '',
                    gravida: data.gravida !== null ? String(data.gravida) : '',
                    para: data.para !== null ? String(data.para) : '',
                    previousCSections: data.previousCSections !== null ? String(data.previousCSections) : '',
                    previousMiscarriages: data.previousMiscarriages !== null ? String(data.previousMiscarriages) : '',
                    previousStillbirths: data.previousStillbirths !== null ? String(data.previousStillbirths) : '',
                    bloodGroup: data.bloodGroup || '',
                    height: data.height || '',
                    weight: data.weight || '',
                    
                    healthConditions: data.healthConditions ? data.healthConditions.split(',').map(s => s.trim()) : [],
                    allergies: data.allergies || '',
                    otherConditions: '' // Mock logic: separated in full app if needed
                });
            } catch (err) {
                console.error(err);
                // Fallback implemented later if needed
            } finally {
                setLoading(false);
            }
        };
        fetchDetails();
    }, [id]);

    const handleFieldChange = (field, value) => {
        setForm(prev => {
            const next = { ...prev, [field]: value };
            
            // Auto-calculate LMP when EDD changes
            if (field === 'edd' && value) {
                const eddDate = new Date(value);
                // Subtract 280 days
                eddDate.setDate(eddDate.getDate() - 280);
                next.lmp = eddDate.toISOString().split('T')[0];
            }
            return next;
        });
    };

    const toggleCondition = (cond) => {
        if (!isEditing) return;
        setForm(prev => {
            const current = [...prev.healthConditions];
            if (current.includes(cond)) {
                return { ...prev, healthConditions: current.filter(c => c !== cond) };
            } else {
                current.push(cond);
                return { ...prev, healthConditions: current };
            }
        });
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const payload = { ...form };
            payload.healthConditions = payload.healthConditions.join(', ');
            
            await axios.put(`http://localhost:8080/api/midwife/${midwifeId}/mother/${id}`, payload);
            setIsEditing(false);
            // Refresh logic if needed
        } catch (err) {
            console.error('Failed saving', err);
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div>Loading...</div>;

    // Calculate Trimester Progress based on LMP 
    const isChartVisible = !!form.lmp;
    let weeksAlong = 0;
    let currentTrimester = 0;
    let trimesterName = '';

    if (form.lmp) {
        const lmpDate = new Date(form.lmp);
        const today = new Date();
        const diffMs = today - lmpDate;
        weeksAlong = Math.floor(diffMs / (1000 * 60 * 60 * 24 * 7));
        
        if (weeksAlong < 0) weeksAlong = 0;
        if (weeksAlong > 40) weeksAlong = 40;

        if (weeksAlong <= 12) { currentTrimester = 1; trimesterName = 'Trimester 1'; }
        else if (weeksAlong <= 26) { currentTrimester = 2; trimesterName = 'Trimester 2'; }
        else { currentTrimester = 3; trimesterName = 'Trimester 3'; }
    }

    return (
        <div className="pd-container">
            {/* Header Section Matches Mockup Exactly */}
            <div className="pd-header-area">
                <div className="pd-header-left">
                    <button className="pd-back-arrow" onClick={() => navigate(`/midwife/mothers/profile/${id}`)}>
                        <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
                    </button>
                    <h1 className="pd-title">Pregnancy Details</h1>
                </div>
                <div className="pd-header-actions">
                    <svg className="pd-notification-icon" viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
                </div>
            </div>

            <div className="pd-controls-row">
                {!isEditing ? (
                    <button className="pd-btn-edit" onClick={() => setIsEditing(true)}>Edit</button>
                ) : (
                    <>
                        <button className="pd-btn-cancel" onClick={() => setIsEditing(false)}>Cancel</button>
                        <button className="pd-btn-save" onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : 'Save'}</button>
                    </>
                )}
            </div>

            {/* Layout matches image exactly - split left (form) and right (Medical History) visually in CSS */}
            <div className="pd-main-layout">
                <div className="pd-left-column">
                    
                    {/* patient details */}
                    <div className="pd-section">
                        <h2 className="pd-section-title">Patient Details</h2>
                        <div className="pd-grid-3">
                            <InputField label="First Name" value={form.firstName} field="firstName" isEditing={isEditing} onChange={handleFieldChange} placeholder="Name" />
                            <InputField label="Last Name" value={form.lastName} field="lastName" isEditing={isEditing} onChange={handleFieldChange} placeholder="Name" />
                            <InputField label="ID" value={form.nic} field="nic" isEditing={isEditing} onChange={handleFieldChange} placeholder="Nic" />
                        </div>
                        <div className="pd-grid-2">
                            <InputField label="Email" value={form.email} field="email" isEditing={isEditing} onChange={handleFieldChange} placeholder="Email" type="email" />
                            <InputField label="Contact Number" value={form.contactNumber} field="contactNumber" isEditing={isEditing} onChange={handleFieldChange} placeholder="Phone Number" />
                        </div>
                        <div className="pd-grid-2" style={{ gridTemplateColumns: '1fr 2fr' }}>
                            <InputField label="DOB" value={form.dob} field="dob" isEditing={isEditing} onChange={handleFieldChange} placeholder="dd/mm/yyyy" type="date" />
                            <InputField label="Address" value={form.address} field="address" isEditing={isEditing} onChange={handleFieldChange} placeholder="Address" />
                        </div>
                        <div className="pd-grid-1-narrow">
                            <InputField label="PHM Area" value={form.phmArea} field="phmArea" isEditing={isEditing} onChange={handleFieldChange} placeholder="Name" />
                            <InputField label="MOH Area" value={form.mohArea} field="mohArea" isEditing={isEditing} onChange={handleFieldChange} placeholder="Name" />
                        </div>
                    </div>

                    {/* father details */}
                    <div className="pd-section">
                        <h2 className="pd-section-title">Father's Details</h2>
                        <div className="pd-grid-3">
                            <InputField label="First Name" value={form.fatherFirstName} field="fatherFirstName" isEditing={isEditing} onChange={handleFieldChange} placeholder="Name" />
                            <InputField label="Last Name" value={form.fatherLastName} field="fatherLastName" isEditing={isEditing} onChange={handleFieldChange} placeholder="Name" />
                            <InputField label="ID" value={form.fatherNic} field="fatherNic" isEditing={isEditing} onChange={handleFieldChange} placeholder="Nic" />
                        </div>
                    </div>

                    {/* pregnancy details */}
                    <div className="pd-section">
                        <h2 className="pd-section-title">Pregnancy Details</h2>
                        <div className="pd-grid-2">
                            {/* NEW: Explicit EDD field first so LMP can auto-calculate */}
                            <InputField label="Expected Delivery Date (EDD)" value={form.edd} field="edd" isEditing={isEditing} onChange={handleFieldChange} placeholder="EDD" type="date" />
                            {/* Read-only LMP calculating from EDD */}
                            <div className="pd-input-group">
                                <label className="pd-label">Last Menstrual Period</label>
                                <input className="pd-input pd-readonly" type="date" value={form.lmp} readOnly />
                            </div>
                        </div>
                        <div className="pd-grid-2">
                            <div className="pd-input-group">
                                <label className="pd-label">Registration Date</label>
                                <input className="pd-input pd-readonly" type="date" value={form.registrationDate} readOnly />
                            </div>
                        </div>
                        <div className="pd-grid-2">
                            <InputField label="Gravida" value={form.gravida} field="gravida" isEditing={isEditing} onChange={handleFieldChange} placeholder="G" />
                            <InputField label="Para" value={form.para} field="para" isEditing={isEditing} onChange={handleFieldChange} placeholder="P" />
                        </div>
                        <div className="pd-grid-2">
                            <InputField label="Previous C-Sections" value={form.previousCSections} field="previousCSections" isEditing={isEditing} onChange={handleFieldChange} placeholder="Y/N" />
                            <InputField label="Previous Miscarriages" value={form.previousMiscarriages} field="previousMiscarriages" isEditing={isEditing} onChange={handleFieldChange} placeholder="Name" />
                        </div>
                        <div className="pd-grid-2">
                            <InputField label="Previous Stillbirths" value={form.previousStillbirths} field="previousStillbirths" isEditing={isEditing} onChange={handleFieldChange} placeholder="Name" />
                            <InputField label="Blood Group" value={form.bloodGroup} field="bloodGroup" isEditing={isEditing} onChange={handleFieldChange} placeholder="Name" />
                        </div>
                        <div className="pd-grid-2">
                            <InputField label="Height" value={form.height} field="height" isEditing={isEditing} onChange={handleFieldChange} placeholder="Name" />
                            <InputField label="Weight" value={form.weight} field="weight" isEditing={isEditing} onChange={handleFieldChange} placeholder="Name" />
                        </div>
                    </div>

                </div>

                {/* Right side - Medical History */}
                <div className="pd-right-column">
                    <div className="pd-section" style={{ marginTop: '0' }}>
                        <h2 className="pd-section-title" style={{ marginBottom: '24px' }}>Medical History</h2>
                        <div className="pd-checkbox-list">
                            {MEDICAL_HISTORY_OPTS.map(cond => {
                                const checked = form.healthConditions.includes(cond);
                                return (
                                    <label key={cond} className={`pd-checkbox-label ${!isEditing ? 'disabled' : ''}`}>
                                        <div className={`pd-checkbox-custom ${checked ? 'checked' : ''}`}>
                                            {checked && <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><polyline points="20 6 9 17 4 12"></polyline></svg>}
                                        </div>
                                        <span className="pd-checkbox-text">{cond}</span>
                                    </label>
                                );
                            })}
                            <div style={{ position: 'absolute', width: '0', height: '0', overflow: 'hidden' }}>
                                {MEDICAL_HISTORY_OPTS.map(cond => (
                                    <input key={'raw'+cond} type="checkbox" checked={form.healthConditions.includes(cond)} onChange={() => toggleCondition(cond)} disabled={!isEditing} />
                                ))}
                            </div>
                        </div>

                        <div className="pd-grid-1-narrow" style={{ marginTop: '32px' }}>
                            <InputField label="Other Conditions" value={form.otherConditions} field="otherConditions" isEditing={isEditing} onChange={handleFieldChange} placeholder="Conditions" />
                        </div>
                        <div className="pd-grid-1-narrow" style={{ marginTop: '16px' }}>
                            <InputField label="Allergies" value={form.allergies} field="allergies" isEditing={isEditing} onChange={handleFieldChange} placeholder="Allergies" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Trimester Progress Chart (Renders at bottom only if LMP is calculated) */}
            {isChartVisible && (
                <div className="dashboard-panel pd-trimester-chart">
                    <h3 className="pd-chart-title">Pregnancy Timeline & Trimester Progress</h3>
                    
                    <div className="pd-chart-stats">
                        <div className="pd-chart-stat-box">
                            <span>Current Trimester</span>
                            <h4>{trimesterName}</h4>
                        </div>
                        <div className="pd-chart-stat-box">
                            <span>Weeks Completed</span>
                            <h4>{weeksAlong} out of 40</h4>
                        </div>
                        <div className="pd-chart-stat-box">
                            <span>Weeks Remaining</span>
                            <h4>{Math.max(0, 40 - weeksAlong)}</h4>
                        </div>
                    </div>

                    <div className="pd-timeline-wrapper">
                        <div className="pd-timeline-bar-bg">
                            {/* Week 1-12 */}
                            <div className="pd-timeline-segment t1" style={{ width: '30%' }}></div>
                            {/* Week 13-26 */}
                            <div className="pd-timeline-segment t2" style={{ width: '35%' }}></div>
                            {/* Week 27-40 */}
                            <div className="pd-timeline-segment t3" style={{ width: '35%' }}></div>
                            
                            {/* Progress Fill over top */}
                            <div className="pd-timeline-progress-fill" style={{ width: `${(weeksAlong/40)*100}%` }}></div>
                        </div>
                        <div className="pd-timeline-labels">
                            <span>Week 0 (LMP)</span>
                            <span style={{ marginLeft: '18%' }}>Week 13</span>
                            <span style={{ marginLeft: '17%' }}>Week 27</span>
                            <span>Week 40 (EDD)</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const InputField = ({ label, value, field, isEditing, onChange, placeholder, type = "text" }) => {
    return (
        <div className="pd-input-group">
            <label className="pd-label">{label}</label>
            <input 
                type={type} 
                className={`pd-input ${!isEditing ? 'pd-readonly-styled' : ''}`} 
                value={value || ''} 
                onChange={(e) => onChange(field, e.target.value)} 
                readOnly={!isEditing} 
                placeholder={placeholder}
            />
        </div>
    );
};

export default PregnancyDetails;
