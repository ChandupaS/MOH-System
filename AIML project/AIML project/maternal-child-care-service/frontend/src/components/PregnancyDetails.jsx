import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './PregnancyDetails.css';

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

const MEDICAL_HISTORY_OPTS = [
    'Hypertension', 'Diabetes', 'Cardiac diseases', 'Renal diseases',
    'Hepatic diseases', 'Psychiatric illnesses', 'Epilepsy', 'Malignancies',
    'Haematological diseases', 'Tuberculosis', 'Thyroid diseases', 'Bronchial asthma'
];

const PregnancyDetails = ({ midwifeId, motherUserId, readOnly }) => {
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
                let res;
                if (midwifeId) {
                    res = await axios.get(`http://localhost:8081/api/midwife/${midwifeId}/mother/${id}`);
                } else {
                    res = await axios.get(`http://localhost:8081/api/mother/${motherUserId}/profile`);
                }
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
            
            await axios.put(`http://localhost:8081/api/midwife/${midwifeId}/mother/${id}`, payload);
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
                    <button className="pd-back-arrow" onClick={() => readOnly ? navigate('/mother') : navigate(`/midwife/mothers/profile/${id}`)}>
                        <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
                    </button>
                    <h1 className="pd-title">Pregnancy Details</h1>
                </div>
                <div className="pd-header-actions">
                    <svg className="pd-notification-icon" viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
                </div>
            </div>

            <div className="pd-controls-row">
                {!readOnly && (
                    !isEditing ? (
                        <div style={{ display: 'flex', gap: '12px' }}>
                            {form.lmp && form.edd && (
                                <button className="pd-btn-tracker" onClick={() => document.getElementById('pregnancy-tracker')?.scrollIntoView({ behavior: 'smooth' })}>
                                    View Pregnancy Tracker
                                </button>
                            )}
                            <button className="pd-btn-edit" onClick={() => setIsEditing(true)}>Edit Clinical Record</button>
                        </div>
                    ) : (
                        <>
                            <button className="pd-btn-cancel" onClick={() => setIsEditing(false)}>Cancel</button>
                            <button className="pd-btn-save" onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : 'Save Record'}</button>
                        </>
                    )
                )}
            </div>

            {/* Patient Identity Header (Fixed) */}
            <div className="pd-identity-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <div className="avatar-placeholder">{form.firstName?.[0]}{form.lastName?.[0]}</div>
                    <div>
                        <h2 style={{ margin: 0, fontSize: '24px' }}>{form.firstName} {form.lastName}</h2>
                        <div style={{ display: 'flex', gap: '15px', marginTop: '5px', fontSize: '13px', color: '#64748b' }}>
                            <span><strong>NIC:</strong> {form.nic || 'N/A'}</span>
                            <span><strong>DOB:</strong> {form.dob || 'N/A'}</span>
                            <span><strong>Blood Group:</strong> {form.bloodGroup || 'Not Set'}</span>
                            <span className="badge badge-primary">Division: {form.phmArea || 'Malabe'}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Layout matches image exactly - split left (form) and right (Medical History) visually in CSS */}
            <div className="pd-main-layout">
                <div className="pd-left-column">
                    
                    {/* Pregnancy Overview Section */}
                    <div className="pd-section">
                        <h2 className="pd-section-title">Pregnancy Overview</h2>
                        <div className="pd-grid-2">
                            <InputField label="Expected Delivery Date (EDD)" value={form.edd} field="edd" isEditing={isEditing} onChange={handleFieldChange} type="date" />
                            <div className="pd-input-group">
                                <label className="pd-label">Last Menstrual Period (LMP)</label>
                                <input className="pd-input pd-readonly" type="date" value={form.lmp} readOnly />
                            </div>
                        </div>
                        <div className="pd-grid-3">
                            <InputField label="Gestational Age" value={weeksAlong ? `${weeksAlong} Weeks` : 'Not Set'} isEditing={false} />
                            <InputField label="Gravida (G)" value={form.gravida} field="gravida" isEditing={isEditing} onChange={handleFieldChange} placeholder="0" />
                            <InputField label="Para (P)" value={form.para} field="para" isEditing={isEditing} onChange={handleFieldChange} placeholder="0" />
                        </div>
                    </div>

                    {/* Clinical Measurements Section */}
                    <div className="pd-section">
                        <h2 className="pd-section-title">Clinical Measurements</h2>
                        <div className="pd-grid-3">
                            <InputField label="Height (cm)" value={form.height} field="height" isEditing={isEditing} onChange={handleFieldChange} placeholder="160" />
                            <InputField label="Weight (kg)" value={form.weight} field="weight" isEditing={isEditing} onChange={handleFieldChange} placeholder="60" />
                            <InputField label="Blood Pressure" value={form.bloodPressure} field="bloodPressure" isEditing={isEditing} onChange={handleFieldChange} placeholder="120/80" />
                        </div>
                        <div className="pd-grid-2">
                            <InputField label="Fundal Height (cm)" value={form.fundalHeight} field="fundalHeight" isEditing={isEditing} onChange={handleFieldChange} placeholder="24" />
                            <InputField label="Fetal Heart Rate (bpm)" value={form.fetalHeartRate} field="fetalHeartRate" isEditing={isEditing} onChange={handleFieldChange} placeholder="140" />
                        </div>
                    </div>

                    {/* Obstetric History Section */}
                    <div className="pd-section">
                        <h2 className="pd-section-title">Obstetric History</h2>
                        <div className="pd-grid-3">
                            <InputField label="Previous C-Sections" value={form.previousCSections} field="previousCSections" isEditing={isEditing} onChange={handleFieldChange} placeholder="0" />
                            <InputField label="Previous Miscarriages" value={form.previousMiscarriages} field="previousMiscarriages" isEditing={isEditing} onChange={handleFieldChange} placeholder="0" />
                            <InputField label="Previous Stillbirths" value={form.previousStillbirths} field="previousStillbirths" isEditing={isEditing} onChange={handleFieldChange} placeholder="0" />
                        </div>
                    </div>

                    {/* Complications & Risks Section */}
                    <div className="pd-section">
                        <h2 className="pd-section-title">Pregnancy Complications & Risk Factors</h2>
                        <div className="pd-grid-1">
                            <div className="pd-input-group">
                                <label className="pd-label">Current Complications</label>
                                <textarea 
                                    className={`pd-input ${!isEditing ? 'pd-readonly-styled' : ''}`}
                                    value={form.complications || ''}
                                    onChange={(e) => handleFieldChange('complications', e.target.value)}
                                    readOnly={!isEditing}
                                    placeholder="None noted"
                                    style={{ minHeight: '80px', fontFamily: 'inherit' }}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Midwife Notes Section */}
                    <div className="pd-section">
                        <h2 className="pd-section-title">Midwife Clinical Notes</h2>
                        <div className="pd-grid-1">
                            <div className="pd-input-group">
                                <label className="pd-label">Observations & Plan</label>
                                <textarea 
                                    className={`pd-input ${!isEditing ? 'pd-readonly-styled' : ''}`}
                                    value={form.midwifeNotes || ''}
                                    onChange={(e) => handleFieldChange('midwifeNotes', e.target.value)}
                                    readOnly={!isEditing}
                                    placeholder="Enter clinical observations..."
                                    style={{ minHeight: '120px', fontFamily: 'inherit' }}
                                />
                            </div>
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
                <div id="pregnancy-tracker" className="dashboard-panel pd-trimester-chart">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                            <h3 className="pd-chart-title">Clinical Pregnancy Progress Tracker</h3>
                            <p style={{ fontSize: '13px', color: '#64748b' }}>Automatically synchronized with LMP: <strong>{form.lmp}</strong></p>
                        </div>
                        <span className="badge badge-primary" style={{ padding: '8px 16px', fontSize: '14px' }}>
                            {trimesterName}
                        </span>
                    </div>
                    
                    <div className="pd-chart-stats" style={{ marginTop: '20px' }}>
                        <div className="pd-chart-stat-box">
                            <span>Current Gestational Week</span>
                            <h4>Week {weeksAlong}</h4>
                        </div>
                        <div className="pd-chart-stat-box">
                            <span>Days Remaining</span>
                            <h4>{Math.max(0, (40 * 7) - (weeksAlong * 7))} Days</h4>
                        </div>
                        <div className="pd-chart-stat-box">
                            <span>Estimated Due Date</span>
                            <h4>{new Date(form.edd).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}</h4>
                        </div>
                    </div>

                    <div className="pd-timeline-wrapper">
                        <div className="pd-timeline-bar-bg">
                            <div className="pd-timeline-segment t1" style={{ width: '30%' }}></div>
                            <div className="pd-timeline-segment t2" style={{ width: '35%' }}></div>
                            <div className="pd-timeline-segment t3" style={{ width: '35%' }}></div>
                            <div className="pd-timeline-progress-fill" style={{ width: `${Math.min(100, (weeksAlong/40)*100)}%` }}></div>
                        </div>
                        <div className="pd-timeline-labels">
                            <span>Conception (W0)</span>
                            <span style={{ position: 'absolute', left: '30%' }}>W13</span>
                            <span style={{ position: 'absolute', left: '65%' }}>W28</span>
                            <span>Delivery (W40)</span>
                        </div>
                    </div>

                    <div style={{ marginTop: '40px' }}>
                        <h4 style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            Clinical Milestones Timeline
                        </h4>
                        <div className="pd-milestone-grid">
                            {PREGNANCY_MILESTONES.map((m, idx) => {
                                const isPassed = weeksAlong >= m.week;
                                const isCurrent = weeksAlong >= m.week && (idx === PREGNANCY_MILESTONES.length - 1 || weeksAlong < PREGNANCY_MILESTONES[idx+1].week);
                                
                                return (
                                    <div key={m.week} className={`milestone-card ${isCurrent ? 'current' : ''}`} style={{ opacity: isPassed && !isCurrent ? 0.6 : 1 }}>
                                        <div className="milestone-week">WEEK {m.week}</div>
                                        <h5 style={{ margin: '5px 0' }}>{m.label}</h5>
                                        <p style={{ fontSize: '12px', margin: 0, color: '#64748b' }}>{m.detail}</p>
                                        {isCurrent && <div style={{ position: 'absolute', top: '-10px', right: '10px', background: '#10b981', color: 'white', fontSize: '9px', padding: '2px 6px', borderRadius: '4px', fontWeight: '800' }}>CURRENT</div>}
                                    </div>
                                );
                            })}
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
