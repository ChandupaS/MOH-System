import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Login.css';

const StaffLogin = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post('http://localhost:8081/api/auth/login', { email, password });
            const { role, name, id } = res.data;
            localStorage.setItem('user', JSON.stringify({ id, name, role }));
            if (role === 'DOCTOR') navigate('/doctor');
            else if (role === 'MIDWIFE') navigate('/midwife');
            else setError("Access Denied: Not a staff account.");
        } catch (err) {
            setError(err.response?.data || "Login failed. Please check your credentials.");
        }
    };

    return (
        <div className="split-login-container">
            <div className="login-left">
                <button className="back-button-circle" onClick={() => navigate('/')}>
                    &#8592;
                </button>
                <div className="login-left-shape"></div>
                <div className="login-brand-area">
                    <div className="login-brand-logo">
                        <div className="login-logo-icon">+</div>
                        <span className="login-logo-text">සුව සෙවණ</span>
                    </div>
                    <div className="portal-badge">Staff Portal</div>
                    <p className="login-tagline">Secure access for doctors and midwives managing maternal healthcare.</p>
                </div>
            </div>

            <div className="login-right">
                <div className="login-right-content">
                    <div className="login-header-area">
                        <h2 className="login-title">Staff Login</h2>
                        <p className="login-subtitle">Enter your clinical credentials to continue</p>
                    </div>

                    <div className="login-form-card">
                        <form onSubmit={handleLogin}>
                            <div className="form-group-modern">
                                <label>Email Address</label>
                                <input
                                    type="email"
                                    placeholder="your@email.com"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="form-group-modern">
                                <label>Password</label>
                                <input
                                    type="password"
                                    placeholder="Enter your password"
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    required
                                />
                            </div>
                            {error && <p className="error-msg-modern">{error}</p>}
                            <button type="submit" className="signin-btn-modern">Sign In</button>
                            <button type="button" className="forgot-password">Forgot password?</button>
                        </form>

                        <div className="dev-credentials">
                            <p>Quick Start (Dev Bypass):</p>
                            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '8px' }}>
                                <button
                                    type="button"
                                    className="dev-btn"
                                    title="doctor@suwasewana.lk / Doctor@1234"
                                    onClick={() => { localStorage.setItem('user', JSON.stringify({ id: 1, name: 'Main Doctor', role: 'DOCTOR' })); navigate('/doctor'); }}
                                >
                                    Login as Doctor
                                </button>
                                <button
                                    type="button"
                                    className="dev-btn"
                                    title="midwife@suwasewana.lk / Midwife@1234 — Malabe East"
                                    onClick={() => { localStorage.setItem('user', JSON.stringify({ id: 2, name: 'Midwife Malabe', role: 'MIDWIFE' })); navigate('/midwife'); }}
                                >
                                    Midwife (Malabe East)
                                </button>
                                <button
                                    type="button"
                                    className="dev-btn"
                                    title="midwife2@suwasewana.lk / Midwife@1234 — Kaduwela"
                                    onClick={() => { localStorage.setItem('user', JSON.stringify({ id: 3, name: 'Midwife Kaduwela', role: 'MIDWIFE' })); navigate('/midwife'); }}
                                >
                                    Midwife (Kaduwela)
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StaffLogin;
