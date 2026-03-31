import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import axios from 'axios';
import SidebarLayout from './SidebarLayout';

const ChildDashboard = () => {
    const [user, setByUser] = useState(JSON.parse(localStorage.getItem('user')));
    const [childProfile, setByChildProfile] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        if (!user || user.role !== 'MOTHER') {
            navigate('/mother-login');
            return;
        }
        axios.get(`http://localhost:8080/api/child/profile/${user.id}`)
            .then(res => setByChildProfile(res.data))
            .catch(err => console.error(err));
    }, [user, navigate]);

    const menuItems = [
        { label: 'Home', path: '/child', exact: true },
        { label: 'Vaccination', path: '/child/vaccinations' },
        { label: 'Nutrition', path: '/child/nutrition' },
        { label: 'Development', path: '/child/development' },
    ];

    return (
        <SidebarLayout userName={user?.name} role="CHILD" menuItems={menuItems}>
            <Routes>
                <Route index element={<ChildOverview profile={childProfile} user={user} navigate={navigate} />} />
                <Route path="vaccinations" element={
                    <div>
                        <h2 className="page-title">Child Vaccinations</h2>
                        <div className="dashboard-panel">
                            <h3>Immunization Record (Dev Preview)</h3>
                            <div className="list-item-clinical">
                                <div className="list-item-clinical-text">
                                    <h5>BCG (Birth)</h5>
                                    <p>Completed 180 Days Ago</p>
                                </div>
                                <span className="badge badge-primary">Completed</span>
                            </div>
                            <div className="list-item-clinical">
                                <div className="list-item-clinical-text">
                                    <h5>Polio (OPV 1)</h5>
                                    <p>Due in 14 Days</p>
                                </div>
                                <span className="badge badge-warning">Pending</span>
                            </div>
                        </div>
                    </div>
                } />
                <Route path="nutrition" element={
                    <div>
                        <h2 className="page-title">Nutrition</h2>
                        <div className="dashboard-panel">
                            <h3>Dietary Guidance (Dev Preview)</h3>
                            <div className="list-item-clinical">
                                <div className="list-item-clinical-text">
                                    <h5>Exclusive Breastfeeding</h5>
                                    <p>Continue for the first 6 months</p>
                                </div>
                                <span className="badge badge-info">Active Phase</span>
                            </div>
                            <div className="list-item-clinical">
                                <div className="list-item-clinical-text">
                                    <h5>Complementary Feeding Introduction</h5>
                                    <p>Start introducing pureed solids</p>
                                </div>
                                <span className="badge badge-warning">Upcoming</span>
                            </div>
                        </div>
                    </div>
                } />
                <Route path="development" element={
                    <div>
                        <h2 className="page-title">Development</h2>
                        <div className="dashboard-panel">
                            <div className="empty-state">
                                <p>Growth tracking and developmental milestones.</p>
                            </div>
                        </div>
                    </div>
                } />
            </Routes>
        </SidebarLayout>
    );
};

const ChildOverview = ({ profile, user, navigate }) => {
    const childName = profile?.name || 'Saman Kumara';
    const ageMonths = profile?.ageInMonths || 6;
    const height = profile?.height || '65cm';
    const weight = profile?.weight || '7.5kg';
    const lastVaccine = profile?.lastVaccine || 'Polio (IPV) 1';
    const nextVaccine = profile?.nextVaccine || 'Measles 1st Dose';

    return (
        <div className="overview-container">
            <h2 className="page-title">Child Dashboard</h2>

            <div className="welcome-card-modern">
                <h2>Child Profile: {childName}</h2>
                <p>Track growth, scheduled vaccinations, and nutritional milestones for your child's well-being.</p>
            </div>

            <div className="stats-grid-modern">
                <div className="stat-card-modern">
                    <p>Age</p>
                    <h4 style={{ fontSize: '22px' }}>{ageMonths} Months</h4>
                </div>
                <div className="stat-card-modern">
                    <p>Weight</p>
                    <h4 style={{ fontSize: '22px' }}>{weight}</h4>
                </div>
                <div className="stat-card-modern">
                    <p>Height</p>
                    <h4 style={{ fontSize: '22px' }}>{height}</h4>
                </div>
            </div>

            <div className="dashboard-panel">
                <h3>Vaccination Status Summary</h3>
                <div className="list-item-clinical">
                    <div className="list-item-clinical-text">
                        <h5>Recently Administered</h5>
                        <p>{lastVaccine} — On Schedule</p>
                    </div>
                    <span className="badge badge-success">Completed</span>
                </div>
                <div className="list-item-clinical">
                    <div className="list-item-clinical-text">
                        <h5>Next Scheduled</h5>
                        <p>{nextVaccine} — Due next month</p>
                    </div>
                    <span className="badge badge-warning">Upcoming</span>
                </div>
                <div style={{ marginTop: '18px' }}>
                    <button onClick={() => navigate('/child/vaccinations')} className="btn-clinical">
                        View Full Schedule
                    </button>
                </div>
            </div>

            <div style={{ marginTop: '8px' }}>
                <button onClick={() => navigate('/mother')} className="btn-clinical-outline" style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '10px 20px',
                    background: 'transparent',
                    color: '#0077b6',
                    border: '1.5px solid #0077b6',
                    fontWeight: '600',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    fontSize: '13px',
                    fontFamily: 'Inter, sans-serif',
                }}>
                    Back to Mother Dashboard
                </button>
            </div>
        </div>
    );
};

export default ChildDashboard;
