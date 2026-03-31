import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Login.css';

const MotherLogin = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post('http://localhost:8080/api/auth/login', { email, password });
            const { role, name, id } = res.data;
            if (role !== 'MOTHER') {
                setError("Please use the Staff Portal to login.");
                return;
            }
            localStorage.setItem('user', JSON.stringify({ id, name, role }));
            navigate('/mother');
        } catch (err) {
            setError(err.response?.data || "Login failed. Please check your credentials.");
        }
    };

    return (
        <div className="split-login-container">
            <div className="login-left mother-left-bg">
                <button className="back-button-circle" onClick={() => navigate('/')}>
                    &#8592;
                </button>
                <div className="login-left-shape"></div>
                <div className="login-brand-area">
                    <div className="login-brand-logo">
                        <div className="login-logo-icon">+</div>
                        <span className="login-logo-text">සුව සෙවණ</span>
                    </div>
                    <div className="portal-badge">Mother Portal</div>
                    <p className="login-tagline">Your personal health companion for pregnancy and beyond.</p>
                </div>
            </div>

            <div className="login-right">
                <div className="login-right-content">
                    <div className="login-header-area">
                        <h2 className="login-title mother-title">Mother Login</h2>
                        <p className="login-subtitle">Access your health record and updates</p>
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
                            <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', flexWrap: 'wrap' }}>
                                <button
                                    type="button"
                                    className="dev-btn"
                                    title="mother@suwasewana.lk / Mother@1234"
                                    onClick={() => { localStorage.setItem('user', JSON.stringify({ id: 4, name: 'Sunitha Perera', role: 'MOTHER' })); navigate('/mother'); }}
                                >
                                    Mother (Sunitha)
                                </button>
                                <button
                                    type="button"
                                    className="dev-btn"
                                    title="mother2@suwasewana.lk / Mother@1234"
                                    onClick={() => { localStorage.setItem('user', JSON.stringify({ id: 5, name: 'Kamala Silva', role: 'MOTHER' })); navigate('/mother'); }}
                                >
                                    Mother (Kamala)
                                </button>
                            </div>
                        </div>

                        <div style={{ marginTop: '20px', textAlign: 'center', borderTop: '1px solid #e0e0e0', paddingTop: '20px' }}>
                            <p style={{ fontSize: '14px', color: '#666' }}>New to our platform?</p>
                            <button 
                                type="button" 
                                onClick={() => navigate('/register-mother')}
                                style={{ 
                                    background: 'none', 
                                    border: 'none', 
                                    color: '#2196F3', 
                                    textDecoration: 'underline', 
                                    cursor: 'pointer',
                                    fontSize: '14px',
                                    fontWeight: 'bold'
                                }}
                            >
                                Register here
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MotherLogin;
