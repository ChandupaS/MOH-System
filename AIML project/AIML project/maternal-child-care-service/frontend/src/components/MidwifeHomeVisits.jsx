import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import './HomeVisits.css';

const API = 'http://localhost:8080/api';

const statusColor = (status) => {
    if (status === 'Completed') return 'hv-badge-completed';
    if (status === 'Missed') return 'hv-badge-missed';
    if (status === 'Rescheduled') return 'hv-badge-rescheduled';
    return 'hv-badge-upcoming';
};

const isOverdue = (visit) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return visit.status === 'Upcoming' && new Date(visit.scheduledDate) < today;
};

const daysUntil = (dateStr) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const d = new Date(dateStr);
    return Math.round((d - today) / (1000 * 60 * 60 * 24));
};

const formatDate = (d) => {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
};

const MidwifeHomeVisits = ({ midwifeId }) => {
    const [data, setData] = useState({ today: [], thisWeek: [], all: [], stats: {} });
    const [loading, setLoading] = useState(true);
    const [selected, setSelected] = useState(null);
    const [activeTab, setActiveTab] = useState('all'); // 'all' | 'today' | 'overdue'
    const [search, setSearch] = useState('');
    const [filterStatus, setFilterStatus] = useState('All');
    const [editVisit, setEditVisit] = useState(null);
    const [saving, setSaving] = useState(false);
    const [saveMsg, setSaveMsg] = useState('');

    const fetch = useCallback(async () => {
        if (!midwifeId) return;
        try {
            const res = await axios.get(`${API}/midwife/${midwifeId}/home-visits`);
            setData(res.data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }, [midwifeId]);

    useEffect(() => { fetch(); }, [fetch]);

    const handleSaveVisit = async () => {
        if (!editVisit) return;
        setSaving(true);
        try {
            await axios.put(`${API}/midwife/home-visit/${editVisit.id}`, {
                status: editVisit.status,
                notes: editVisit.midwifeNotes || '',
                bloodPressure: editVisit.bloodPressure || '',
                weightKg: editVisit.weightKg || '',
                temperature: editVisit.temperature || '',
                pulseRate: editVisit.pulseRate || '',
                fundalHeight: editVisit.fundalHeight || '',
                fetalHeartRate: editVisit.fetalHeartRate || '',
                rescheduledDate: editVisit.rescheduledDate || '',
            });
            setSaveMsg('Visit updated successfully!');
            await fetch();
            setSelected(editVisit);
            setTimeout(() => setSaveMsg(''), 3000);
        } catch (e) {
            setSaveMsg('Failed to save. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    const filtered = (() => {
        let list = activeTab === 'today' ? data.today
            : activeTab === 'overdue' ? (data.all || []).filter(isOverdue)
            : (data.all || []);

        if (filterStatus !== 'All') list = list.filter(v => v.status === filterStatus);
        if (search.trim()) {
            const q = search.toLowerCase();
            list = list.filter(v =>
                v.mother?.user?.name?.toLowerCase().includes(q) ||
                v.mother?.gnDivision?.toLowerCase().includes(q) ||
                v.scheduledDate?.includes(q)
            );
        }
        return list.sort((a, b) => new Date(a.scheduledDate) - new Date(b.scheduledDate));
    })();

    const overdueList = (data.all || []).filter(isOverdue);
    const stats = data.stats || {};

    if (loading) return (
        <div className="hv-loading">
            <div className="hv-spinner"></div>
            <p>Loading home visit data…</p>
        </div>
    );

    return (
        <div className="hv-root">
            <div className="hv-header-row">
                <div>
                    <h2 className="hv-title">Home Visit Management</h2>
                    <p className="hv-subtitle">Track, record, and manage all scheduled home visits in your division</p>
                </div>
            </div>

            {/* Overdue Alert Banner */}
            {overdueList.length > 0 && (
                <div className="hv-alert-banner" onClick={() => setActiveTab('overdue')}>
                    <span className="hv-alert-icon">⚠️</span>
                    <strong>{overdueList.length} overdue visit{overdueList.length > 1 ? 's' : ''}</strong> — Click to view and follow up immediately
                    <span className="hv-alert-arrow">→</span>
                </div>
            )}

            {/* KPI Summary Cards */}
            <div className="hv-stats-row">
                <div className="hv-stat-card hv-stat-total">
                    <div className="hv-stat-icon">📋</div>
                    <div>
                        <p className="hv-stat-label">Total Visits</p>
                        <h3 className="hv-stat-value">{stats.total ?? 0}</h3>
                    </div>
                </div>
                <div className="hv-stat-card hv-stat-completed">
                    <div className="hv-stat-icon">✅</div>
                    <div>
                        <p className="hv-stat-label">Completed</p>
                        <h3 className="hv-stat-value">{stats.completed ?? 0}</h3>
                    </div>
                </div>
                <div className="hv-stat-card hv-stat-pending">
                    <div className="hv-stat-icon">⏳</div>
                    <div>
                        <p className="hv-stat-label">Pending</p>
                        <h3 className="hv-stat-value">{stats.pending ?? 0}</h3>
                    </div>
                </div>
                <div className="hv-stat-card hv-stat-overdue" onClick={() => setActiveTab('overdue')}>
                    <div className="hv-stat-icon">🚨</div>
                    <div>
                        <p className="hv-stat-label">Overdue</p>
                        <h3 className="hv-stat-value">{stats.overdue ?? 0}</h3>
                    </div>
                </div>
                <div className="hv-stat-card hv-stat-today" onClick={() => setActiveTab('today')}>
                    <div className="hv-stat-icon">📅</div>
                    <div>
                        <p className="hv-stat-label">Today</p>
                        <h3 className="hv-stat-value">{data.today?.length ?? 0}</h3>
                    </div>
                </div>
            </div>

            <div className="hv-main-layout">
                {/* Left: Visit List */}
                <div className="hv-list-panel">
                    {/* Tabs */}
                    <div className="hv-tab-row">
                        {['all', 'today', 'overdue'].map(tab => (
                            <button
                                key={tab}
                                className={`hv-tab ${activeTab === tab ? 'hv-tab-active' : ''}`}
                                onClick={() => setActiveTab(tab)}
                            >
                                {tab === 'all' ? 'All Visits' : tab === 'today' ? `Today (${data.today?.length ?? 0})` : `Overdue (${overdueList.length})`}
                            </button>
                        ))}
                    </div>

                    {/* Search + Filter */}
                    <div className="hv-filter-row">
                        <input
                            className="hv-search"
                            placeholder="🔍  Search by mother name or date…"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                        />
                        <select className="hv-select" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
                            {['All', 'Upcoming', 'Completed', 'Missed', 'Rescheduled'].map(s => (
                                <option key={s} value={s}>{s}</option>
                            ))}
                        </select>
                    </div>

                    {/* Visit Items */}
                    <div className="hv-visit-list">
                        {filtered.length === 0 ? (
                            <div className="hv-empty">
                                <span style={{ fontSize: '3rem' }}>🏠</span>
                                <p>No visits found</p>
                            </div>
                        ) : filtered.map(v => {
                            const days = daysUntil(v.scheduledDate);
                            const overdue = isOverdue(v);
                            return (
                                <div
                                    key={v.id}
                                    className={`hv-visit-item ${selected?.id === v.id ? 'hv-visit-selected' : ''} ${overdue ? 'hv-visit-overdue-item' : ''}`}
                                    onClick={() => { setSelected(v); setEditVisit({ ...v }); setSaveMsg(''); }}
                                >
                                    <div className="hv-visit-item-left">
                                        <div className="hv-visit-avatar">{v.mother?.user?.name?.charAt(0) || 'M'}</div>
                                        <div>
                                            <p className="hv-visit-name">{v.mother?.user?.name || 'Unknown'}</p>
                                            <p className="hv-visit-meta">{formatDate(v.scheduledDate)}</p>
                                            {v.mother?.healthConditions && (
                                                <p className="hv-visit-conditions">{v.mother.healthConditions}</p>
                                            )}
                                        </div>
                                    </div>
                                    <div className="hv-visit-item-right">
                                        <span className={`hv-badge ${statusColor(v.status)}`}>{overdue ? '⚠ Overdue' : v.status}</span>
                                        {v.status === 'Upcoming' && !overdue && (
                                            <span className="hv-days-label">{days === 0 ? 'Today' : `${days}d`}</span>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Right: Detail/Edit Panel */}
                <div className="hv-detail-panel">
                    {!selected ? (
                        <div className="hv-no-selection">
                            <span style={{ fontSize: '4rem' }}>🏠</span>
                            <h3>Select a Visit</h3>
                            <p>Click a visit from the list to view details and record observations.</p>
                        </div>
                    ) : (
                        <div>
                            <div className="hv-detail-header">
                                <div>
                                    <h3 className="hv-detail-name">{selected.mother?.user?.name}</h3>
                                    <p className="hv-detail-date">Scheduled: {formatDate(selected.scheduledDate)}</p>
                                    {selected.mother?.healthConditions && (
                                        <div className="hv-condition-tags">
                                            {selected.mother.healthConditions.split(',').map((c, i) => (
                                                <span key={i} className="hv-condition-tag">{c.trim()}</span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                <span className={`hv-badge-lg ${statusColor(editVisit?.status)}`}>{editVisit?.status}</span>
                            </div>

                            {saveMsg && (
                                <div className={`hv-save-msg ${saveMsg.includes('success') ? 'hv-save-ok' : 'hv-save-err'}`}>{saveMsg}</div>
                            )}

                            {/* Status Update */}
                            <div className="hv-section">
                                <h4 className="hv-section-title">Update Status</h4>
                                <div className="hv-status-btns">
                                    {['Completed', 'Missed', 'Rescheduled'].map(s => (
                                        <button
                                            key={s}
                                            className={`hv-status-btn ${editVisit?.status === s ? 'hv-status-btn-active' : ''} hv-status-${s.toLowerCase()}`}
                                            onClick={() => setEditVisit({ ...editVisit, status: s })}
                                        >
                                            {s === 'Completed' ? '✓ Completed' : s === 'Missed' ? '✗ Missed' : '↻ Rescheduled'}
                                        </button>
                                    ))}
                                </div>

                                {editVisit?.status === 'Rescheduled' && (
                                    <div className="hv-input-group">
                                        <label className="hv-label">Rescheduled Date</label>
                                        <input
                                            type="date"
                                            className="hv-input"
                                            value={editVisit.rescheduledDate || ''}
                                            onChange={e => setEditVisit({ ...editVisit, rescheduledDate: e.target.value })}
                                        />
                                    </div>
                                )}
                            </div>

                            {/* Vitals */}
                            <div className="hv-section">
                                <h4 className="hv-section-title">Record Vitals</h4>
                                <div className="hv-vitals-grid">
                                    {[
                                        { label: 'Blood Pressure', key: 'bloodPressure', placeholder: 'e.g. 120/80 mmHg' },
                                        { label: 'Weight (kg)', key: 'weightKg', placeholder: 'e.g. 65 kg' },
                                        { label: 'Temperature (°C)', key: 'temperature', placeholder: 'e.g. 36.8' },
                                        { label: 'Pulse Rate (bpm)', key: 'pulseRate', placeholder: 'e.g. 78' },
                                        { label: 'Fundal Height (cm)', key: 'fundalHeight', placeholder: 'e.g. 32 cm' },
                                        { label: 'Fetal Heart Rate', key: 'fetalHeartRate', placeholder: 'e.g. 142 bpm' },
                                    ].map(({ label, key, placeholder }) => (
                                        <div key={key} className="hv-input-group">
                                            <label className="hv-label">{label}</label>
                                            <input
                                                className="hv-input"
                                                placeholder={placeholder}
                                                value={editVisit?.[key] || ''}
                                                onChange={e => setEditVisit({ ...editVisit, [key]: e.target.value })}
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Notes */}
                            <div className="hv-section">
                                <h4 className="hv-section-title">Midwife Observations & Notes</h4>
                                <textarea
                                    className="hv-textarea"
                                    rows={4}
                                    placeholder="Record clinical observations, patient concerns, advice given during visit…"
                                    value={editVisit?.midwifeNotes || ''}
                                    onChange={e => setEditVisit({ ...editVisit, midwifeNotes: e.target.value })}
                                />
                            </div>

                            <button className="hv-save-btn" onClick={handleSaveVisit} disabled={saving}>
                                {saving ? 'Saving…' : '💾 Save Visit Record'}
                            </button>

                            {/* Past Vitals if completed */}
                            {selected.status === 'Completed' && (selected.bloodPressure || selected.weightKg || selected.temperature) && (
                                <div className="hv-section hv-past-vitals">
                                    <h4 className="hv-section-title">Recorded Vitals</h4>
                                    <div className="hv-vitals-display-grid">
                                        {selected.bloodPressure && <div className="hv-vital-chip"><span>BP</span>{selected.bloodPressure}</div>}
                                        {selected.weightKg && <div className="hv-vital-chip"><span>Weight</span>{selected.weightKg}</div>}
                                        {selected.temperature && <div className="hv-vital-chip"><span>Temp</span>{selected.temperature}°C</div>}
                                        {selected.pulseRate && <div className="hv-vital-chip"><span>Pulse</span>{selected.pulseRate}</div>}
                                        {selected.fundalHeight && <div className="hv-vital-chip"><span>FH</span>{selected.fundalHeight}</div>}
                                        {selected.fetalHeartRate && <div className="hv-vital-chip"><span>FHR</span>{selected.fetalHeartRate}</div>}
                                    </div>
                                    {selected.completedAt && (
                                        <p className="hv-completed-at">Completed at: {new Date(selected.completedAt).toLocaleString()}</p>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Per-mother Visit History Timeline */}
            {selected && (
                <MotherVisitTimeline motherId={selected.mother?.id} motherName={selected.mother?.user?.name} />
            )}
        </div>
    );
};

const MotherVisitTimeline = ({ motherId, motherName }) => {
    const [visits, setVisits] = useState([]);
    useEffect(() => {
        if (!motherId) return;
        axios.get(`${API}/mother/home-visits/${motherId}`)
            .then(r => setVisits(r.data))
            .catch(console.error);
    }, [motherId]);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return (
        <div className="hv-timeline-section">
            <h4 className="hv-timeline-title">🕐 Full Visit History for {motherName}</h4>
            <div className="hv-timeline">
                {visits.map((v, i) => {
                    const past = new Date(v.scheduledDate) < today;
                    return (
                        <div key={v.id} className={`hv-tl-item ${v.status === 'Completed' ? 'hv-tl-done' : v.status === 'Missed' ? 'hv-tl-missed' : past ? 'hv-tl-overdue' : 'hv-tl-upcoming'}`}>
                            <div className="hv-tl-dot"></div>
                            <div className="hv-tl-content">
                                <span className="hv-tl-date">{formatDate(v.scheduledDate)}</span>
                                <span className={`hv-badge ${statusColor(v.status)}`}>{v.status}</span>
                                {v.midwifeNotes && <p className="hv-tl-notes">"{v.midwifeNotes}"</p>}
                                {v.bloodPressure && <span className="hv-tl-vital">BP: {v.bloodPressure}</span>}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default MidwifeHomeVisits;
