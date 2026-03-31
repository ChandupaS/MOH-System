import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './LandingPage.css';

const LandingPage = () => {
    const [stats, setStats] = useState({ totalMothers: 0, totalChildren: 0, totalMidwives: 12, totalDivisions: 56 });
    const navigate = useNavigate();

    useEffect(() => {
        axios.get('http://localhost:8080/api/stats/landing')
            .then(res => setStats(res.data))
            .catch(err => console.error("Stats fetch failed:", err));
    }, []);

    return (
        <div className="landing-root">
            {/* Header */}
            <header className="header-modern">
                <div className="container header-flex">
                    <div className="logo">
                        <div className="logo-icon">+</div>
                        <span className="logo-text">සුව සෙවණ</span>
                    </div>
                    <nav className="main-nav">
                        <a href="#services">Services</a>
                        <button className="nav-btn secondary-btn" onClick={() => navigate('/mother-login')}>Mother Login</button>
                        <button className="nav-btn primary-btn" onClick={() => navigate('/staff-login')}>Staff Login</button>
                    </nav>
                </div>
            </header>

            {/* Hero */}
            <section className="hero-section">
                <div className="container hero-container">
                    <div className="hero-content">
                        <div className="hero-badge">Modern Clinical Management</div>
                        <h1>Safe Hands for Every <br/><span className="highlight">Mother and Child</span></h1>
                        <p>A state-of-the-art clinical management system dedicated to maternal and child healthcare in Sri Lanka. Manage visits, track health goals, and keep accurate records effortlessly.</p>
                        <div className="hero-actions">
                            <button className="btn-modern-lg" onClick={() => navigate('/staff-login')}>Access Staff Portal</button>
                            <button className="btn-modern-outline" onClick={() => navigate('/mother-login')}>Access Mother Portal</button>
                        </div>
                    </div>
                    <div className="hero-visual">
                        <div className="shape shape-1"></div>
                        <div className="shape shape-2"></div>
                        <div className="shape shape-3"></div>
                        <div className="glass-card">
                            <div className="stat-pulse-indicator"></div>
                            <div className="stat-number">{stats.totalMothers}</div>
                            <div className="stat-text">Mothers Currently Registered</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Stats */}
            <section className="stats-section">
                <div className="container grid-stats">
                    <div className="stat-card">
                        <div className="stat-num">{stats.totalMothers}</div>
                        <div className="stat-label">Registered Mothers</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-num">{stats.totalChildren}</div>
                        <div className="stat-label">Healthy Children</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-num">{stats.totalMidwives}</div>
                        <div className="stat-label">Active Midwives</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-num">{stats.totalDivisions}+</div>
                        <div className="stat-label">GN Divisions</div>
                    </div>
                </div>
            </section>

            {/* Services */}
            <section className="services-section" id="services">
                <div className="container">
                    <div className="section-title">
                        <h2>Our Clinical Services</h2>
                        <p>Comprehensive care pathways designed for your health and well-being.</p>
                    </div>
                    <div className="grid-services">
                        <div className="service-card-modern">
                            <div className="service-icon">
                                <svg className="service-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                                </svg>
                            </div>
                            <h3>Immunization</h3>
                            <p>Complete vaccination tracking and scheduling for every child in our care.</p>
                        </div>
                        <div className="service-card-modern">
                            <div className="service-icon">
                                <svg className="service-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M4 19.5A2.5 2.5 0 016.5 17H20"/>
                                    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/>
                                </svg>
                            </div>
                            <h3>Health Education</h3>
                            <p>Resourceful modules and guidance for expectant and new mothers.</p>
                        </div>
                        <div className="service-card-modern">
                            <div className="service-icon">
                                <svg className="service-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
                                </svg>
                            </div>
                            <h3>Clinic Management</h3>
                            <p>Streamlined clinic visits and digital record keeping for medical staff.</p>
                        </div>
                        <div className="service-card-modern">
                            <div className="service-icon">
                                <svg className="service-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
                                    <polyline points="9 22 9 12 15 12 15 22"/>
                                </svg>
                            </div>
                            <h3>Home Visits</h3>
                            <p>Automated scheduling and tracking of midwife visits for personalized care.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="footer-modern">
                <div className="container footer-grid">
                    <div className="footer-brand">
                        <div className="logo">
                            <div className="logo-icon">+</div>
                            <span className="logo-text">සුව සෙවණ</span>
                        </div>
                        <p>Supporting the future of Sri Lankan maternal and child healthcare through digital excellence.</p>
                    </div>
                    <div className="footer-links">
                        <h4>Services</h4>
                        <ul>
                            <li>Immunization</li>
                            <li>Prenatal Care</li>
                            <li>Postnatal Care</li>
                        </ul>
                    </div>
                    <div className="footer-links">
                        <h4>Portal</h4>
                        <ul>
                            <li><span onClick={() => navigate('/staff-login')} style={{cursor:'pointer'}}>Midwife Login</span></li>
                            <li><span onClick={() => navigate('/staff-login')} style={{cursor:'pointer'}}>Doctor Login</span></li>
                            <li><span onClick={() => navigate('/mother-login')} style={{cursor:'pointer'}}>Mother Login</span></li>
                        </ul>
                    </div>
                    <div className="footer-links">
                        <h4>Contact</h4>
                        <ul>
                            <li>info@suwasewana.lk</li>
                            <li>+94 11 123 4567</li>
                        </ul>
                    </div>
                </div>
                <div className="container footer-bottom">
                    <p>&copy; 2026 සුව සෙවණ | Smart Healthcare Management</p>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;
