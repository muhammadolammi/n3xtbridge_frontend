import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { HashLink } from 'react-router-hash-link';
import { useAuth } from '../context/AuthContext'; // Ensure this path is correct

const Navbar: React.FC = () => {
    const { user, logout } = useAuth();
    const location = useLocation();

    const isLoggedin = !!user;
    // const isAtDashboard = location.pathname.startsWith('/dashboard');
    const isAtDashboard = location.pathname == '/dashboard';


    return (
        <nav className="fixed top-0 w-full z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200/15 dark:border-slate-800/15 shadow-sm dark:shadow-none font-sans tracking-tight antialiased print:hidden">
            <div className="flex justify-between items-center h-16 px-6 md:px-12 max-w-7xl mx-auto">
                <Link to="/" className="text-xl font-bold tracking-tighter text-slate-900 dark:text-slate-100">
                    N3xtbridge Holdings
                </Link>

                {/* Desktop Links */}
                <div className="hidden md:flex items-center space-x-8">
                    <Link to="/" className="text-on-surface-variant dark:text-slate-400 hover:text-blue-600 transition-colors">
                        Home
                    </Link>

                    {/* Show Dashboard only if logged in AND not currently on a dashboard page */}
                    {isLoggedin && !isAtDashboard && (
                        <Link to="/dashboard" className="text-on-surface-variant dark:text-slate-400 hover:text-blue-600 transition-colors">
                            Dashboard
                        </Link>
                    )}

                    <Link to="/services" className="text-on-surface-variant dark:text-slate-400 hover:text-blue-600 transition-colors">
                        Services
                    </Link>
                    <Link to="/about-us" className="text-on-surface-variant dark:text-slate-400 hover:text-blue-600 transition-colors">
                        About Us
                    </Link>
                </div>

                <div className='space-x-5 flex items-center'>
                    {!isLoggedin ? (
                        <>
                            <HashLink to="/#contact" className="bg-primary hover:opacity-80 transition-all duration-200 active:scale-95 transform text-white px-5 py-2 rounded-lg font-medium text-sm">
                                Contact Us
                            </HashLink>
                            <Link to="/signin" className="bg-primary hover:opacity-80 transition-all duration-200 active:scale-95 transform text-white px-5 py-2 rounded-lg font-medium text-sm">
                                Sign In
                            </Link>
                        </>
                    ) : (
                        /* Optional: Show Logout or User initials when logged in */
                        <button
                            onClick={logout}
                            className="bg-primary hover:opacity-80 transition-all duration-200 active:scale-95 transform text-white px-5 py-2 rounded-lg font-medium text-sm"
                        >
                            Sign Out
                        </button>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;