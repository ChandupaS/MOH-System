import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './HomeVisits.css';

const API = 'http://localhost:8080/api';

const formatDate = (d) => {
    if (!d) return '—';
    return new Date(d + 'T00:00:00').toLocaleDateString('en-GB', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' });
};

const daysUntil = (dateStr) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const d = new Date(dateStr + 'T00:00:00');
    return Math.round((d - today) / (1000 * 60 * 60 * 24));
};

const statusColor = (status) => {
    if (status === 'Completed') return 'hv-badge-completed';
    if (status === 'Missed') return 'hv-badge-missed';
    if (status === 'Rescheduled') return 'hv-badge-rescheduled';
    return 'hv-badge-upcoming';
};

const MotherHomeVisits = ({ userId }) => {
    const [visits, setVisits] = useState([]);
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!userId) return;
        Promise.all([
            axios.get(`${API}/mother/${userId}/profile`),
            axios.get(`${API}/mother/home-visits/${userId}`)
        ]).then(([pRes, vRes]) => {
            setProfile(pRes.data);
            setVisits(vRes.data);
        }).catch(console.error).finally(() => setLoading(false));
    }, [userId]);

    if (loading) return (
        <div className="hv-loading">
            <div className="hv-spinner"></div>
            <p>Loading your home visit schedule…</p>
        </div>
    );

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const upcoming = visits.filter(v => v.status === 'Upcoming' && new Date(v.scheduledDate + 'T00:00:00') >= today);
    const nextVisit = upcoming.length > 0 ? upcoming[0] : null;
    const past = visits.filter(v => v.status === 'Completed' || v.status === 'Missed' || (v.status === 'Upcoming' && new Date(v.scheduledDate + 'T00:00:00') < today));
    const lastCompleted = visits.filter(v => v.status === 'Completed').slice(-1)[0];

    const nextDays = nextVisit ? daysUntil(nextVisit.scheduledDate) : null;
    const isWithin2Days = nextDays !== null && nextDays >= 0 && nextDays <= 2;
    const isMissedRecent = visits.some(v => v.status === 'Missed' && daysUntil(v.scheduledDate) >= -7 && daysUntil(v.scheduledDate) < 0);

    return (
        <div className="hv-root">
            <div className="hv-header-row">
                <div>
                    <h2 className="hv-title">My Home Visit Schedule</h2>
                    <p className="hv-subtitle">Your midwife-assigned home visits based on your health profile</p>
                </div>
            </div>

            {/* Reminder Banner */}
            {isWithin2Days && nextVisit && (
                <div className="hv-reminder-banner hv-reminder-soon">
                    <span>🔔</span>
                    <div>
                        <strong>Upcoming Visit Reminder</strong>
                        <p>Your midwife is scheduled to visit {nextDays === 0 ? 'today' : `in ${nextDays} day${nextDays > 1 ? 's' : ''}`} on {formatDate(nextVisit.scheduledDate)}. Please be available at home.</p>
                    </div>
                </div>
            )}
            {isMissedRecent && (
                <div className="hv-reminder-banner hv-reminder-missed">
                    <span>⚠️</span>
                    <div>
                        <strong>Missed Visit Alert</strong>
                        <p>You recently missed a scheduled home visit. Please contact your midwife to reschedule.</p>
                    </div>
                </div>
            )}

            {/* Next Visit Hero Card */}
            {nextVisit ? (
                <div className="hv-next-card">
                    <div className="hv-next-card-left">
                        <p className="hv-next-label">NEXT SCHEDULED VISIT</p>
                        <h2 className="hv-next-date">{formatDate(nextVisit.scheduledDate)}</h2>
                        <p className="hv-next-sub">Home visit by your assigned midwife</p>
                        {profile?.gnDivision && <p className="hv-next-area">📍 {profile.gnDivision}</p>}
                    </div>
                    <div className="hv-next-card-right">
                        <div className="hv-countdown-circle">
                            <span className="hv-countdown-num">{nextDays === 0 ? '0' : nextDays}</span>
                            <span className="hv-countdown-unit">{nextDays === 0 ? 'Today!' : nextDays === 1 ? 'day' : 'days'}</span>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="hv-next-card hv-next-card-empty">
                    <span style={{ fontSize: '2.5rem' }}>✅</span>
                    <div>
                        <p className="hv-next-label">NO UPCOMING VISITS</p>
                        <p className="hv-next-sub">All scheduled visits have been completed. Your midwife will schedule new ones if needed.</p>
                    </div>
                </div>
            )}

            {/* Summary Stats */}
            <div className="hv-stats-row" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
                <div className="hv-stat-card hv-stat-total">
                    <div className="hv-stat-icon">📋</div>
                    <div>
                        <p className="hv-stat-label">Total Visits</p>
                        <h3 className="hv-stat-value">{visits.length}</h3>
                    </div>
                </div>
                <div className="hv-stat-card hv-stat-completed">
                    <div className="hv-stat-icon">✅</div>
                    <div>
                        <p className="hv-stat-label">Completed</p>
                        <h3 className="hv-stat-value">{visits.filter(v => v.status === 'Completed').length}</h3>
                    </div>
                </div>
                <div className="hv-stat-card hv-stat-pending">
                    <div className="hv-stat-icon">📅</div>
                    <div>
                        <p className="hv-stat-label">Upcoming</p>
                        <h3 className="hv-stat-value">{upcoming.length}</h3>
                    </div>
                </div>
            </div>

            {/* Last Visit Summary */}
            {lastCompleted && (
                <div className="hv-last-visit-card">
                    <h4>📝 Last Completed Visit</h4>
                    <p className="hv-last-visit-date">{formatDate(lastCompleted.scheduledDate)}</p>
                    <div className="hv-vitals-display-grid">
                        {lastCompleted.bloodPressure && <div className="hv-vital-chip"><span>Blood Pressure</span>{lastCompleted.bloodPressure}</div>}
                        {lastCompleted.weightKg && <div className="hv-vital-chip"><span>Weight</span>{lastCompleted.weightKg}</div>}
                        {lastCompleted.temperature && <div className="hv-vital-chip"><span>Temperature</span>{lastCompleted.temperature}°C</div>}
                        {lastCompleted.pulseRate && <div className="hv-vital-chip"><span>Pulse</span>{lastCompleted.pulseRate} bpm</div>}
                        {lastCompleted.fundalHeight && <div className="hv-vital-chip"><span>Fundal Height</span>{lastCompleted.fundalHeight}</div>}
                        {lastCompleted.fetalHeartRate && <div className="hv-vital-chip"><span>Fetal HR</span>{lastCompleted.fetalHeartRate}</div>}
                    </div>
                    {lastCompleted.midwifeNotes && (
                        <div className="hv-midwife-note">
                            <span>Midwife Notes:</span>
                            <p>"{lastCompleted.midwifeNotes}"</p>
                        </div>
                    )}
                </div>
            )}

            {/* Full Visit Timeline */}
            <div className="hv-section hv-timeline-section" style={{ marginTop: '2rem' }}>
                <h4 className="hv-timeline-title">📅 Full Visit Timeline</h4>
                <div className="hv-timeline">
                    {visits.length === 0 ? (
                        <div className="hv-empty">
                            <span style={{ fontSize: '3rem' }}>🏠</span>
                            <p>No visits scheduled yet. Your midwife will generate your schedule after registration.</p>
                        </div>
                    ) : visits.map((v) => {
                        const days = daysUntil(v.scheduledDate);
                        const isPast = new Date(v.scheduledDate + 'T00:00:00') < today;
                        const effectiveStatus = isPast && v.status === 'Upcoming' ? 'Overdue' : v.status;
                        return (
                            <div key={v.id} className={`hv-tl-item hv-tl-${effectiveStatus.toLowerCase()}`}>
                                <div className="hv-tl-dot"></div>
                                <div className="hv-tl-content">
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                                        <span className="hv-tl-date">{formatDate(v.scheduledDate)}</span>
                                        <span className={`hv-badge ${statusColor(effectiveStatus === 'Overdue' ? 'Missed' : v.status)}`}>{effectiveStatus}</span>
                                        {v.status === 'Upcoming' && !isPast && days <= 7 && (
                                            <span className="hv-soon-tag">
                                                {days === 0 ? '🔔 Today!' : `⏰ In ${days} day${days > 1 ? 's' : ''}`}
                                            </span>
                                        )}
                                    </div>
                                    {v.midwifeNotes && <p className="hv-tl-notes">💬 {v.midwifeNotes}</p>}
                                    {v.status === 'Completed' && (v.bloodPressure || v.weightKg) && (
                                        <div className="hv-tl-vitals-row">
                                            {v.bloodPressure && <span className="hv-tl-vital">BP: {v.bloodPressure}</span>}
                                            {v.weightKg && <span className="hv-tl-vital">Wt: {v.weightKg}</span>}
                                            {v.temperature && <span className="hv-tl-vital">Temp: {v.temperature}°C</span>}
                                        </div>
                                    )}
                                    {v.status === 'Rescheduled' && v.rescheduledDate && (
                                        <p className="hv-tl-notes">↻ Rescheduled to: {formatDate(v.rescheduledDate)}</p>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default MotherHomeVisits;
