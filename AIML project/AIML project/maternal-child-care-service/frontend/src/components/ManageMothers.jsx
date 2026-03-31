import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './ManageMothers.css';

const DIVISION = 'Malabe East'; // Will be dynamic from midwife profile in full implementation

const ManageMothers = ({ navigate, division = DIVISION, midwifeId }) => {
    const [mothers, setMothers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [error, setError] = useState('');
    const [editMother, setEditMother] = useState(null);  // holds mother being edited inline

    useEffect(() => {
        fetchMothers();
    }, [division]);

    const fetchMothers = async () => {
        setLoading(true);
        setError('');
        try {
            const res = await axios.get(`http://localhost:8081/api/midwife/${midwifeId}/mothers`);
            if (res.data) {
                setMothers(res.data);
            } else {
                setMothers([]);
            }
        } catch (err) {
            console.error('API Failed...', err);
            setError('Failed to fetch mothers. Using empty list.');
            setMothers([]);
        } finally {
            setLoading(false);
        }
    };

    // Filter by search query (search by ID or name)
    const filtered = mothers.filter(m => {
        const q = searchQuery.trim().toLowerCase();
        if (!q) return true;
        const name = m.user?.name?.toLowerCase() || '';
        const id = String(m.id);
        return name.includes(q) || id.includes(q);
    });

    return (
        <div className="manage-mothers-container">
            {/* Page Header */}
            <div className="mm-page-header">
                <div>
                    <h2 className="page-title" style={{ marginBottom: '4px' }}>Manage Mothers</h2>
                    <p className="mm-division-label">Division: <strong>{division}</strong></p>
                </div>
                <button
                    className="btn-clinical"
                    onClick={() => navigate('/midwife/mothers/register')}
                >
                    Register New Mother
                </button>
            </div>

            {/* ID-focused Search Card */}
            <div className="dashboard-panel" style={{ padding: '2rem', marginBottom: '2.5rem', background: 'var(--primary-light)', border: '1px solid var(--primary)' }}>
                <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-end' }}>
                    <div className="clinical-form-group" style={{ flex: 1, marginBottom: 0 }}>
                        <label style={{ color: 'var(--primary)', fontWeight: '700' }}>Search Mother Database</label>
                        <input
                            type="text"
                            className="clinical-input-field"
                            placeholder="Enter Mother ID or Name (e.g. SYS-1 or Sunitha)"
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            style={{ background: 'white', border: '2px solid var(--primary)' }}
                        />
                    </div>
                    {searchQuery && (
                        <button className="btn-clinical-outline" onClick={() => setSearchQuery('')} style={{ height: '45px', border: '2px solid var(--primary)' }}>
                            Clear Search
                        </button>
                    )}
                    <div style={{ minWidth: '120px', textAlign: 'right' }}>
                        <span style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: '600' }}>
                           Found: {filtered.length} {filtered.length === 1 ? 'Record' : 'Records'}
                        </span>
                    </div>
                </div>
            </div>

            {/* Error */}
            {error && <div className="mm-error-banner">{error}</div>}

            {/* Mother List */}
            <div className="dashboard-panel mm-list-panel">
                <div className="mm-list-header">
                    <span>Mother</span>
                    <span>ID</span>
                    <span>GN Division</span>
                    <span>Registered</span>
                    <span>Actions</span>
                </div>

                {loading ? (
                    <div className="mm-state-box">
                        <div className="mm-spinner"></div>
                        <p>Loading mothers...</p>
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="mm-state-box">
                        <p className="mm-empty-title">
                            {searchQuery ? 'No matching mothers found.' : 'No mothers registered in your division yet.'}
                        </p>
                        {!searchQuery && (
                            <button
                                className="btn-clinical"
                                style={{ marginTop: '16px' }}
                                onClick={() => navigate('/midwife/mothers/register')}
                            >
                                Register First Mother
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="mm-mother-list">
                        {filtered.map((mother, idx) => (
                            <MotherRow
                                key={mother.id}
                                mother={mother}
                                idx={idx}
                                navigate={navigate}
                                onEdit={() => setEditMother(mother)}
                                division={division}
                                onRefresh={fetchMothers}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Edit Modal */}
            {editMother && (
                <EditMotherModal
                    mother={editMother}
                    division={division}
                    midwifeId={midwifeId}
                    onClose={() => setEditMother(null)}
                    onSaved={() => { setEditMother(null); fetchMothers(); }}
                />
            )}
        </div>
    );
};

/* ---- Individual Mother Row ---- */
const MotherRow = ({ mother, idx, navigate, onEdit, division, onRefresh }) => {
    const name = mother.user?.name || 'Unknown';
    const email = mother.user?.email || '';
    const regDate = mother.registrationDate
        ? new Date(mother.registrationDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
        : 'N/A';
    const edd = mother.edd
        ? new Date(mother.edd).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
        : null;

    return (
        <div className={`mm-mother-row ${idx % 2 === 0 ? 'row-even' : 'row-odd'}`}>
            <div className="mm-mother-info">
                <div className="mm-mother-avatar">
                    {name.slice(0, 2).toUpperCase()}
                </div>
                <div className="mm-mother-details">
                    <span className="mm-mother-name">{name}</span>
                    <span className="mm-mother-email">{email}</span>
                    {edd && <span className="mm-mother-edd">EDD: {edd}</span>}
                </div>
            </div>
            <div className="mm-cell">
                <span className="mm-id-badge">{mother.nic || `SYS-${mother.id}`}</span>
            </div>
            <div className="mm-cell">
                <span className="badge badge-primary">{mother.gnDivision}</span>
            </div>
            <div className="mm-cell mm-date-cell">
                {regDate}
            </div>
            <div className="mm-cell mm-actions-cell">
                <button
                    className="btn-clinical btn-sm"
                    onClick={() => navigate(`/midwife/mothers/profile/${mother.id}`)}
                >
                    Go to Profile
                </button>
                <button
                    className="btn-clinical-outline btn-sm"
                    onClick={onEdit}
                >
                    Edit
                </button>
            </div>
        </div>
    );
};

/* ---- Edit Modal ---- */
const GN_DIVISIONS = ['Ranala', 'Navagamuwa', 'Malabe East', 'Malabe West', 'Kaduwela', 'Hewagama', 'Athurugiriya'];

const EditMotherModal = ({ mother, division, midwifeId, onClose, onSaved }) => {
    const nameParts = (mother.user?.name || '').split(' ');
    const [form, setForm] = useState({
        firstName: nameParts[0] || '',
        lastName: nameParts.slice(1).join(' ') || '',
        gnDivision: mother.gnDivision || division,
        nic: mother.nic || '',
        contactNumber: mother.contactNumber || '',
        edd: mother.edd ? mother.edd.split('T')[0] : '',
        lmp: mother.lmp ? mother.lmp.split('T')[0] : '',
        healthConditions: mother.healthConditions || '',
    });
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (field, value) => {
        setForm(prev => ({ ...prev, [field]: value }));
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError('');
        try {
            await axios.put(`http://localhost:8081/api/midwife/${midwifeId}/mother/${mother.id}`, form);
            onSaved();
        } catch (err) {
            setError(err.response?.data || 'Failed to save changes.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="mm-modal-overlay" onClick={onClose}>
            <div className="mm-modal" onClick={e => e.stopPropagation()}>
                <div className="mm-modal-header">
                    <h3>Edit Mother — #{mother.id}</h3>
                    <button className="mm-modal-close" onClick={onClose}>&#x2715;</button>
                </div>

                <form onSubmit={handleSave} className="mm-modal-body">
                    {error && <div className="mm-error-banner">{error}</div>}

                    <div className="mm-form-row">
                        <div className="clinical-form-group">
                            <label>First Name</label>
                            <input className="clinical-input-field" value={form.firstName}
                                onChange={e => handleChange('firstName', e.target.value)} required />
                        </div>
                        <div className="clinical-form-group">
                            <label>Last Name</label>
                            <input className="clinical-input-field" value={form.lastName}
                                onChange={e => handleChange('lastName', e.target.value)} />
                        </div>
                    </div>

                    <div className="clinical-form-group">
                        <label>GN Division</label>
                        <select className="clinical-select-field" value={form.gnDivision}
                            onChange={e => handleChange('gnDivision', e.target.value)} required>
                            {GN_DIVISIONS.map(d => <option key={d} value={d}>{d}</option>)}
                        </select>
                    </div>

                    <div className="mm-form-row">
                        <div className="clinical-form-group">
                            <label>NIC Number</label>
                            <input className="clinical-input-field" value={form.nic}
                                onChange={e => handleChange('nic', e.target.value)} />
                        </div>
                        <div className="clinical-form-group">
                            <label>Contact Number</label>
                            <input className="clinical-input-field" value={form.contactNumber}
                                onChange={e => handleChange('contactNumber', e.target.value)} />
                        </div>
                    </div>

                    <div className="mm-form-row">
                        <div className="clinical-form-group">
                            <label>Expected Delivery Date (EDD)</label>
                            <input type="date" className="clinical-input-field" value={form.edd}
                                onChange={e => handleChange('edd', e.target.value)} />
                        </div>
                        <div className="clinical-form-group">
                            <label>Last Menstrual Period (LMP)</label>
                            <input type="date" className="clinical-input-field" value={form.lmp}
                                onChange={e => handleChange('lmp', e.target.value)} />
                        </div>
                    </div>

                    <div className="clinical-form-group">
                        <label>Health Conditions</label>
                        <textarea className="clinical-input-field" rows="3" value={form.healthConditions}
                            onChange={e => handleChange('healthConditions', e.target.value)}
                            placeholder="e.g. Diabetes, Hypertension" />
                    </div>

                    <div className="mm-modal-footer">
                        <button type="button" className="btn-clinical-outline" onClick={onClose}>Cancel</button>
                        <button type="submit" className="btn-clinical" disabled={saving}>
                            {saving ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ManageMothers;


