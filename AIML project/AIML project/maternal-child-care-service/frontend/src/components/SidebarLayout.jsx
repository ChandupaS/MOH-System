import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import './SidebarLayout.css';

const SidebarLayout = ({ userName, role, menuItems, children }) => {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('user');
        navigate('/');
    };

    return (
        <div className="sidebar-wrapper">
            <aside className="sidebar-inset">
                <div className="sidebar-header">
                    <h1 className="system-name">සුව සෙවණ</h1>
                    <div className="portal-badge-mini">{role} Portal</div>
                </div>

                <div className="user-profile-section">
                    <div className="avatar-placeholder">{userName?.charAt(0) || 'U'}</div>
                    <div className="user-info-text">
                        <span className="user-name-display">{userName || 'User'}</span>
                        <span className="user-role-label">{role}</span>
                    </div>
                </div>

                <nav className="sidebar-nav">
                    {menuItems.map((item, index) => (
                        <NavLink
                            key={index}
                            to={item.path}
                            end={item.exact}
                            className={({ isActive }) => `nav-item-modern ${isActive ? 'active-modern' : ''}`}
                        >
                            <span className="nav-label">{item.label}</span>
                        </NavLink>
                    ))}
                </nav>

                <div className="sidebar-footer-button">
                    <button onClick={handleLogout} className="logout-btn-modern">
                        Sign Out
                    </button>
                </div>
            </aside>

            <main className="main-content-area">
                {children}
            </main>
        </div>
    );
};

export default SidebarLayout;
