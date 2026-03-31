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

            await axios.post(`http://localhost:8080/api/midwife/${midwifeId}/register-mother`, payload);
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
            <div className="reg-success-screen">
                <div className="reg-success-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="#0077b6" strokeWidth="2.5" width="48" height="48">
                        <path d="M20 6L9 17l-5-5"/>
                    </svg>
                </div>
                <h3>Mother Registered Successfully</h3>
                <p>Redirecting to Manage Mothers...</p>
            </div>
        );
    }

    return (
        <div className="register-mother-container">
            {/* Page Header */}
            <div className="reg-page-header">
                <div>
                    <h2 className="page-title" style={{ marginBottom: '4px' }}>Register New Mother</h2>
                    <p className="mm-division-label">Registering for division: <strong>{form.gnDivision}</strong></p>
                </div>
                <button
                    type="button"
                    className="btn-clinical-outline"
                    onClick={() => navigate('/midwife/mothers')}
                >
                    Cancel — Back to List
                </button>
            </div>

            {error && <div className="mm-error-banner">{error}</div>}

            <form onSubmit={handleSubmit} className="reg-form">

                {/* === SECTION 1: Personal Information === */}
                <div className="dashboard-panel reg-section">
                    <h3 className="reg-section-title">Personal Information</h3>

                    <div className="mm-form-row">
                        <div className="clinical-form-group">
                            <label>First Name <span className="req">*</span></label>
                            <input
                                className="clinical-input-field"
                                placeholder="e.g. Sunitha"
                                value={form.firstName}
                                onChange={e => handleChange('firstName', e.target.value)}
                                required
                            />
                        </div>
                        <div className="clinical-form-group">
                            <label>Last Name <span className="req">*</span></label>
                            <input
                                className="clinical-input-field"
                                placeholder="e.g. Perera"
                                value={form.lastName}
                                onChange={e => handleChange('lastName', e.target.value)}
                                required
                            />
                        </div>
                        <div className="clinical-form-group">
                            <label>NIC Number</label>
                            <input
                                className="clinical-input-field"
                                placeholder="e.g. 987654321V"
                                value={form.nic}
                                onChange={e => handleChange('nic', e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="mm-form-row">
                        <div className="clinical-form-group">
                            <label>Date of Birth</label>
                            <input
                                type="date"
                                className="clinical-input-field"
                                value={form.dob}
                                onChange={e => handleChange('dob', e.target.value)}
                            />
                        </div>
                        <div className="clinical-form-group">
                            <label>Email Address <span className="req">*</span></label>
                            <input
                                type="email"
                                className="clinical-input-field"
                                placeholder="email@example.com"
                                value={form.email}
                                onChange={e => handleChange('email', e.target.value)}
                                required
                            />
                        </div>
                        <div className="clinical-form-group">
                            <label>Contact Number</label>
                            <input
                                className="clinical-input-field"
                                placeholder="e.g. 0771234567"
                                value={form.contactNumber}
                                onChange={e => handleChange('contactNumber', e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="clinical-form-group">
                        <label>Home Address</label>
                        <input
                            className="clinical-input-field"
                            placeholder="Full residential address"
                            value={form.address}
                            onChange={e => handleChange('address', e.target.value)}
                        />
                    </div>
                </div>

                {/* === SECTION 2: Administrative Areas === */}
                <div className="dashboard-panel reg-section">
                    <h3 className="reg-section-title">Administrative Area</h3>

                    <div className="mm-form-row">
                        <div className="clinical-form-group">
                            <label>PHM Area</label>
                            <input
                                className="clinical-input-field"
                                placeholder="PHM area name"
                                value={form.phmArea}
                                onChange={e => handleChange('phmArea', e.target.value)}
                            />
                        </div>
                        <div className="clinical-form-group">
                            <label>MOH Area</label>
                            <input
                                className="clinical-input-field"
                                placeholder="MOH area name"
                                value={form.mohArea}
                                onChange={e => handleChange('mohArea', e.target.value)}
                            />
                        </div>

                        {/* Searchable GN Division Dropdown */}
                        <div className="clinical-form-group">
                            <label>GN Division <span className="req">*</span></label>
                            <div className="gn-dropdown-wrapper">
                                <input
                                    className="clinical-input-field"
                                    placeholder="Search GN Division..."
                                    value={gnSearch}
                                    onChange={e => { setGnSearch(e.target.value); setGnDropdownOpen(true); }}
                                    onFocus={() => setGnDropdownOpen(true)}
                                    autoComplete="off"
                                />
                                {gnDropdownOpen && filteredDivisions.length > 0 && (
                                    <div className="gn-dropdown-list">
                                        {filteredDivisions.map(d => (
                                            <div
                                                key={d}
                                                className={`gn-dropdown-item ${form.gnDivision === d ? 'selected' : ''}`}
                                                onMouseDown={() => selectDivision(d)}
                                            >
                                                {d}
                                            </div>
                                        ))}
                                    </div>
                                )}
                                {gnDropdownOpen && filteredDivisions.length === 0 && (
                                    <div className="gn-dropdown-list">
                                        <div className="gn-dropdown-empty">No divisions found</div>
                                    </div>
                                )}
                            </div>
                            {form.gnDivision && (
                                <p className="gn-selected-label">Selected: <strong>{form.gnDivision}</strong></p>
                            )}
                        </div>
                    </div>
                </div>

                {/* === SECTION 3: Pregnancy Details === */}
                <div className="dashboard-panel reg-section">
                    <h3 className="reg-section-title">Pregnancy Details</h3>

                    <div className="mm-form-row">
                        <div className="clinical-form-group">
                            <label>Expected Delivery Date (EDD)</label>
                            <input
                                type="date"
                                className="clinical-input-field"
                                value={form.edd}
                                onChange={e => handleChange('edd', e.target.value)}
                            />
                        </div>
                        <div className="clinical-form-group">
                            <label>Last Menstrual Period (LMP)</label>
                            <input
                                type="date"
                                className="clinical-input-field"
                                value={form.lmp}
                                onChange={e => handleChange('lmp', e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                {/* === SECTION 4: Health Conditions === */}
                <div className="dashboard-panel reg-section">
                    <h3 className="reg-section-title">Health Conditions</h3>
                    <p className="reg-section-hint">Select all known pre-existing conditions.</p>

                    <div className="reg-conditions-grid">
                        {HEALTH_CONDITIONS_LIST.map(condition => (
                            <label key={condition} className={`reg-condition-chip ${form.healthConditions.includes(condition) ? 'selected' : ''}`}>
                                <input
                                    type="checkbox"
                                    checked={form.healthConditions.includes(condition)}
                                    onChange={() => toggleCondition(condition)}
                                    className="hidden-checkbox"
                                />
                                {condition}
                            </label>
                        ))}
                    </div>

                    <div className="clinical-form-group" style={{ marginTop: '16px' }}>
                        <label>Other Conditions (if any)</label>
                        <input
                            className="clinical-input-field"
                            placeholder="Specify any other condition..."
                            value={form.otherCondition}
                            onChange={e => handleChange('otherCondition', e.target.value)}
                        />
                    </div>
                </div>

                {/* === SECTION 5: Father's Details === */}
                <div className="dashboard-panel reg-section">
                    <h3 className="reg-section-title">Father's Details</h3>

                    <div className="mm-form-row">
                        <div className="clinical-form-group">
                            <label>First Name</label>
                            <input
                                className="clinical-input-field"
                                placeholder="Father's first name"
                                value={form.fatherFirstName}
                                onChange={e => handleChange('fatherFirstName', e.target.value)}
                            />
                        </div>
                        <div className="clinical-form-group">
                            <label>Last Name</label>
                            <input
                                className="clinical-input-field"
                                placeholder="Father's last name"
                                value={form.fatherLastName}
                                onChange={e => handleChange('fatherLastName', e.target.value)}
                            />
                        </div>
                        <div className="clinical-form-group">
                            <label>NIC Number</label>
                            <input
                                className="clinical-input-field"
                                placeholder="Father's NIC"
                                value={form.fatherNic}
                                onChange={e => handleChange('fatherNic', e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                {/* === SECTION 6: Account Credentials === */}
                <div className="dashboard-panel reg-section">
                    <h3 className="reg-section-title">Account Credentials</h3>
                    <p className="reg-section-hint">The mother will use these credentials to log in to her patient portal.</p>

                    <div className="mm-form-row">
                        <div className="clinical-form-group">
                            <label>Password <span className="req">*</span></label>
                            <input
                                type="password"
                                className="clinical-input-field"
                                placeholder="Set a strong password"
                                value={form.password}
                                onChange={e => handleChange('password', e.target.value)}
                                required
                            />
                        </div>
                        <div className="clinical-form-group">
                            <label>Confirm Password <span className="req">*</span></label>
                            <input
                                type="password"
                                className="clinical-input-field"
                                placeholder="Confirm the password"
                                value={form.confirmPassword}
                                onChange={e => handleChange('confirmPassword', e.target.value)}
                                required
                            />
                        </div>
                    </div>
                </div>

                {/* === Form Actions === */}
                <div className="reg-form-actions">
                    <button type="button" className="btn-clinical-outline" onClick={() => navigate('/midwife/mothers')}>
                        Cancel
                    </button>
                    <button type="submit" className="btn-clinical btn-register" disabled={submitting}>
                        {submitting ? 'Registering...' : 'Register Mother'}
                    </button>
                </div>

            </form>
        </div>
    );
};

export default RegisterMother;
