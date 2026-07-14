import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Grid, ShoppingBag, User, Briefcase } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const BottomNav = () => {
    const { isAdmin } = useAuth();

    return (
        <div className="bottom-nav">
            <NavLink to="/" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
                <Home size={22} />
                <span>Home</span>
            </NavLink>
            <NavLink to="/catalog" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
                <Grid size={22} />
                <span>Browse</span>
            </NavLink>
            <NavLink to="/cart" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
                <ShoppingBag size={22} />
                <span>Cart</span>
            </NavLink>
            <NavLink to="/account" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
                <User size={22} />
                <span>Account</span>
            </NavLink>
            {isAdmin && (
                <NavLink to="/admin" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
                    <Briefcase size={22} />
                    <span>Admin</span>
                </NavLink>
            )}

            <style jsx>{`
                .bottom-nav {
                    display: none;
                    position: fixed;
                    bottom: 0;
                    left: 0;
                    right: 0;
                    height: var(--bottom-nav-height);
                    background: var(--surface);
                    border-top: 1px solid var(--border);
                    justify-content: space-around;
                    align-items: center;
                    z-index: 2000;
                    box-shadow: 0 -5px 20px rgba(0,0,0,0.05);
                }

                @media (max-width: 768px) {
                    .bottom-nav { display: flex; }
                }

                .nav-link {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 4px;
                    color: var(--text-muted);
                    font-size: 0.7rem;
                    font-weight: 600;
                    text-transform: uppercase;
                    transition: all 0.3s ease;
                }

                .nav-link.active {
                    color: var(--primary);
                }
            `}</style>
        </div>
    );
};

export default BottomNav;
