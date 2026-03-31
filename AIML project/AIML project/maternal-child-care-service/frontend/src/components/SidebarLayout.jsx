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
        <div className="layout-container">
            {/* Sidebar */}
            <aside className="sidebar">
                <div className="sidebar-header">
                    <h1 className="system-name">සුව සෙවණ</h1>
                    <div className="user-welcome">
                        <span className="welcome-text">Welcome,</span>
                        <span className="user-name">{userName || 'User'}</span>
                    </div>
                </div>

                <nav className="sidebar-nav">
                    {menuItems.map((item, index) => (
                        <NavLink
                            key={index}
                            to={item.path}
                            end={item.exact}
                            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                        >
                            <span className="nav-label">{item.label}</span>
                        </NavLink>
                    ))}
                </nav>

                <div className="sidebar-footer">
                    <button onClick={handleLogout} className="logout-btn">Logout</button>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="main-content">
                <div className="main-content-inner">
                    {children}
                </div>
            </main>
        </div>
    );
};

export default SidebarLayout;
