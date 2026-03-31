import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './ManageMothers.css';

/* GN Divisions exactly as defined in DataController.java */
const GN_DIVISIONS = ['Ranala', 'Navagamuwa', 'Malabe East', 'Malabe West', 'Kaduwela', 'Hewagama', 'Athurugiriya'];

/* Health conditions checkbox list */
const HEALTH_CONDITIONS_LIST = [
    'Diabetes',
    'Hypertension',
    'Heart Disease',
    'Anaemia',
    'Thyroid Disorder',
    'Asthma',
    'Kidney Disease',
    'Epilepsy',
];

const RegisterMother = ({ navigate, division = 'Malabe East', midwifeId }) => {
    const [form, setForm] = useState({
        // Personal Info
        firstName: '',
        lastName: '',
        email: '',
        contactNumber: '',
        dob: '',
        address: '',
        nic: '',
        phmArea: '',
        mohArea: '',
        // Pregnancy Info
        gnDivision: division,
        edd: '',
        lmp: '',
        // Health
        healthConditions: [],
        otherCondition: '',
        // Father's Info
        fatherFirstName: '',
        fatherLastName: '',
        fatherNic: '',
        // Account
        password: '',
        confirmPassword: '',
    });

    const [gnSearch, setGnSearch] = useState(division);
    const [gnDropdownOpen, setGnDropdownOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const filteredDivisions = GN_DIVISIONS.filter(d =>
        d.toLowerCase().includes(gnSearch.toLowerCase())
    );

    const handleChange = (field, value) => {
        setForm(prev => ({ ...prev, [field]: value }));
    };

    const toggleCondition = (condition) => {
        setForm(prev => ({
            ...prev,
            healthConditions: prev.healthConditions.includes(condition)
                ? prev.healthConditions.filter(c => c !== condition)
                : [...prev.healthConditions, condition]
        }));
    };

    const selectDivision = (div) => {
        handleChange('gnDivision', div);
        setGnSearch(div);
        setGnDropdownOpen(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (form.password !== form.confirmPassword) {
            setError('Passwords do not match.');
            return;
        }
        if (!form.gnDivision) {
            setError('Please select a GN Division.');
            return;
        }

        setSubmitting(true);
        try {
            // Build health conditions string
            const conditions = [...form.healthConditions];
            if (form.otherCondition.trim()) conditions.push(form.otherCondition.trim());

            const payload = {
                firstName: form.firstName,
                lastName: form.lastName,
                email: form.email,
                password: form.password || 'default123',
                contactNumber: form.contactNumber,
                dob: form.dob,
                address: form.address,
                nic: form.nic,
                phmArea: form.phmArea,
                mohArea: form.mohArea,
                gnDivision: form.gnDivision,
                edd: form.edd,
                lmp: form.lmp,
                healthConditions: conditions.join(', '),
                fatherFirstName: form.fatherFirstName,
                fatherLastName: form.fatherLastName,
                fatherNic: form.fatherNic,
            };

            await axios.post(`http://localhost:8081/api/midwife/${midwifeId}/register-mother`, payload);
            setSuccess(true);
            setTimeout(() => navigate('/midwife/mothers'), 1800);
        } catch (err) {
            setError(err.response?.data || 'Registration failed. Please check the details and try again.');
        } finally {
            setSubmitting(false);
        }
    };

    if (success) {
        return (
            <div className="reg-success-screen" style={{ height: '80vh' }}>
                <div className="reg-success-icon" style={{ background: 'var(--success)', borderRadius: '50%', padding: '1.5rem', display: 'flex' }}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" width="40" height="40">
                        <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                </div>
                <h3 style={{ fontSize: '1.5rem', marginTop: '1.5rem', color: 'var(--success)' }}>Registration Successful</h3>
                <p style={{ color: 'var(--text-muted)' }}>The mother profile has been officially registered in the system.</p>
                <p style={{ fontSize: '0.8rem', marginTop: '1rem', color: 'var(--primary)' }}>Redirecting to divisional list...</p>
            </div>
        );
    }

    return (
        <div className="register-mother-container" style={{ paddingBottom: '100px' }}>
            {/* Page Header */}
            <div className="reg-page-header" style={{ alignItems: 'flex-start' }}>
                <div>
                    <h2 style={{ fontSize: '2rem', marginBottom: '8px' }}>Clinical Registration</h2>
                    <p style={{ color: 'var(--text-muted)' }}>Fill in the maternal health database details for the <strong>{form.gnDivision}</strong> division.</p>
                </div>
                <button
                    type="button"
                    className="btn-clinical-outline"
                    onClick={() => navigate('/midwife/mothers')}
                    style={{ padding: '12px 24px' }}
                >
                    Cancel Registration
                </button>
            </div>

            {error && (
                <div style={{ background: '#fef2f2', border: '1px solid #ef4444', padding: '1rem', borderRadius: 'var(--radius)', color: '#b91c1c', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
                        <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="reg-form">

                {/* === SECTION 1: Personal Profile === */}
                <div className="dashboard-panel" style={{ padding: '2rem', marginBottom: '2rem', borderTop: '4px solid var(--primary)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1.5rem' }}>
                        <div style={{ background: 'var(--primary-light)', padding: '10px', borderRadius: '8px' }}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2" width="24" height="24">
                                <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" />
                            </svg>
                        </div>
                        <h3 style={{ margin: 0 }}>Maternal Personal Profile</h3>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.5rem' }}>
                        <div className="clinical-form-group">
                            <label>First Name <span className="req">*</span></label>
                            <input className="clinical-input-field" value={form.firstName} onChange={e => handleChange('firstName', e.target.value)} required />
                        </div>
                        <div className="clinical-form-group">
                            <label>Last Name <span className="req">*</span></label>
                            <input className="clinical-input-field" value={form.lastName} onChange={e => handleChange('lastName', e.target.value)} required />
                        </div>
                        <div className="clinical-form-group">
                            <label>NIC Number</label>
                            <input className="clinical-input-field" placeholder="e.g. 199012345678" value={form.nic} onChange={e => handleChange('nic', e.target.value)} />
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.5rem', marginTop: '1rem' }}>
                        <div className="clinical-form-group">
                            <label>Date of Birth</label>
                            <input type="date" className="clinical-input-field" value={form.dob} onChange={e => handleChange('dob', e.target.value)} />
                        </div>
                        <div className="clinical-form-group">
                            <label>Contact Number</label>
                            <input className="clinical-input-field" value={form.contactNumber} onChange={e => handleChange('contactNumber', e.target.value)} />
                        </div>
                        <div className="clinical-form-group">
                            <label>Email Address <span className="req">*</span></label>
                            <input type="email" className="clinical-input-field" value={form.email} onChange={e => handleChange('email', e.target.value)} required />
                        </div>
                    </div>
                </div>

                {/* === SECTION 2: Clinical Pregnancy Data === */}
                <div className="dashboard-panel" style={{ padding: '2rem', marginBottom: '2rem', borderTop: '4px solid var(--accent)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1.5rem' }}>
                        <div style={{ background: 'var(--primary-light)', padding: '10px', borderRadius: '8px' }}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2" width="24" height="24">
                                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                            </svg>
                        </div>
                        <h3 style={{ margin: 0 }}>Clinical Pregnancy Data</h3>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                        <div className="clinical-form-group">
                            <label style={{ fontWeight: '700' }}>Last Menstrual Period (LMP)</label>
                            <input type="date" className="clinical-input-field" value={form.lmp} onChange={e => handleChange('lmp', e.target.value)} style={{ borderColor: 'var(--accent)' }} />
                            <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>Essential for gestational age auto-calculation</p>
                        </div>
                        <div className="clinical-form-group">
                            <label style={{ fontWeight: '700' }}>Expected Delivery Date (EDD)</label>
                            <input type="date" className="clinical-input-field" value={form.edd} onChange={e => handleChange('edd', e.target.value)} style={{ borderColor: 'var(--accent)' }} />
                            <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>Calculated or confirmed via ultrasound</p>
                        </div>
                    </div>
                </div>

                {/* === SECTION 3: Social & Family Data === */}
                <div className="dashboard-panel" style={{ padding: '2rem', marginBottom: '2rem' }}>
                    <h4 style={{ marginBottom: '1.5rem', color: 'var(--text-muted)', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Social & Family Details</h4>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.5rem' }}>
                        <div className="clinical-form-group">
                            <label>Father's Name</label>
                            <input className="clinical-input-field" value={form.fatherFirstName} onChange={e => handleChange('fatherFirstName', e.target.value)} />
                        </div>
                        <div className="clinical-form-group">
                            <label>Father's NIC</label>
                            <input className="clinical-input-field" value={form.fatherNic} onChange={e => handleChange('fatherNic', e.target.value)} />
                        </div>
                        <div className="clinical-form-group">
                            <label>GN Division</label>
                            <select className="clinical-input-field" value={form.gnDivision} onChange={e => handleChange('gnDivision', e.target.value)}>
                                {GN_DIVISIONS.map(div => <option key={div} value={div}>{div}</option>)}
                            </select>
                        </div>
                    </div>
                </div>

                {/* === SECTION 4: Security Credentials === */}
                <div className="dashboard-panel" style={{ padding: '2rem', marginBottom: '3rem', background: '#f8fafc' }}>
                    <h3 style={{ marginBottom: '1.2rem', fontSize: '1.1rem' }}>Portal Credentials</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                        <div className="clinical-form-group">
                            <label>Portal Password <span className="req">*</span></label>
                            <input type="password" placeholder="Minimum 8 characters" className="clinical-input-field" value={form.password} onChange={e => handleChange('password', e.target.value)} required />
                        </div>
                        <div className="clinical-form-group">
                            <label>Confirm Password <span className="req">*</span></label>
                            <input type="password" className="clinical-input-field" value={form.confirmPassword} onChange={e => handleChange('confirmPassword', e.target.value)} required />
                        </div>
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', borderTop: '1px solid var(--border)', paddingTop: '2rem' }}>
                    <button type="button" className="btn-clinical-outline" onClick={() => navigate('/midwife/mothers')} style={{ padding: '12px 30px' }}>
                        Cancel
                    </button>
                    <button type="submit" className="btn-clinical" disabled={submitting} style={{ padding: '12px 40px', fontSize: '1rem' }}>
                        {submitting ? 'Registering...' : 'Finalize Registration'}
                    </button>
                </div>

            </form>
        </div>
    );
};

export default RegisterMother;
