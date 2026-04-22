import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { HashLink } from 'react-router-hash-link';
import { useAuth } from '../context/AuthContext';
// import { MENUSECTIONTOHASH } from './resusable';

const Navbar: React.FC = () => {
    const { user, logout } = useAuth();
    const location = useLocation();
    // const navigate = useNavigate();
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    // const isHomePage = location.pathname === '/';
    // const isDashboard = location.pathname.startsWith('/dashboard');

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Helper for active link styling
    const getLinkClass = (path: string) =>
        `text-sm font-medium transition-all hover:text-[#0046FB] ${location.pathname === path ? 'text-[#0046FB]' : 'text-gray-300'
        }`;

    return (
        <>
            <nav
                className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-300 border-b ${isScrolled
                    ? 'bg-black/90 backdrop-blur-lg py-3 border-[#1A1A1A] shadow-2xl'
                    : 'bg-transparent py-5 border-transparent'
                    }`}
            >
                <div className="max-w-7xl mx-auto px-6 md:px-12 flex items-center justify-between">

                    {/* LOGO */}

                    <Link to="/" className="flex items-center">
                        <img
                            src="https://cdn.n3xtbridge.com/frontenddata/N3xtbridge%20Logo%20PNG.png"
                            alt="N3xtbridge"
                            className="h-10 md:h-12 w-auto object-contain"
                        />
                    </Link>


                    {/* CENTER NAVIGATION (Desktop) */}
                    <div className="hidden md:flex items-center space-x-10">
                        <Link to="/" className={getLinkClass('/')}>Home</Link>

                        {/* Smart Links: Scroll if on Home, Navigate if not */}
                        <HashLink to="/#services" className={getLinkClass('/services')}>Services</HashLink>
                        <HashLink to="/#why" className="text-sm font-medium text-gray-300 hover:text-[#0046FB]">About</HashLink>

                        {user && (
                            <Link to="/dashboard" className={getLinkClass('/dashboard')}>
                                Dashboard
                            </Link>
                        )}
                    </div>

                    {/* RIGHT SIDE ACTIONS */}
                    <div className="hidden md:flex items-center gap-3">
                        {!user ? (
                            <>
                                <Link to="/signin" className="text-sm font-semibold px-5 py-2.5 text-white hover:text-gray-300 transition-colors">
                                    Sign In
                                </Link>
                                <HashLink
                                    to="/signup"
                                    className="bg-[#0046FB] text-white text-sm font-bold px-6 py-2.5 rounded-full hover:bg-[#003ccf] transition-all shadow-lg shadow-blue-900/20"
                                >
                                    Get Started
                                </HashLink>
                            </>
                        ) : (
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => logout()}
                                    className="text-xs font-bold uppercase tracking-widest text-gray-500 hover:text-red-500 transition-colors px-4"
                                >
                                    Sign Out
                                </button>
                                {/* <Link
                                    to="/dashboard"
                                    className="bg-[#1A1A1A] border border-[#333] text-white text-sm font-bold px-6 py-2.5 rounded-full hover:bg-[#252525] transition-all"
                                >
                                    My Portal
                                </Link> */}
                            </div>
                        )}
                    </div>

                    {/* MOBILE HAMBURGER */}
                    <button
                        className="md:hidden w-10 h-10 flex flex-col items-center justify-center gap-1.5"
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                    >
                        <span className={`block w-6 h-0.5 bg-white transition-all duration-300 ${isMenuOpen ? 'rotate-45 translate-y-2' : ''}`}></span>
                        <span className={`block w-6 h-0.5 bg-white transition-all duration-300 ${isMenuOpen ? 'opacity-0' : ''}`}></span>
                        <span className={`block w-6 h-0.5 bg-white transition-all duration-300 ${isMenuOpen ? '-rotate-45 -translate-y-2' : ''}`}></span>
                    </button>
                </div>
            </nav>

            {/* MOBILE DRAWER */}
            <div className={`fixed inset-0 z-[99] transition-all duration-500 ${isMenuOpen ? 'visible' : 'invisible'}`}>
                {/* Backdrop */}
                <div
                    className={`absolute inset-0 bg-black/60 backdrop-blur-md transition-opacity duration-500 ${isMenuOpen ? 'opacity-100' : 'opacity-0'}`}
                    onClick={() => setIsMenuOpen(false)}
                />

                {/* Content */}
                <div className={`absolute top-0 right-0 w-[80%] h-full bg-[#0C0C0C] border-l border-[#1A1A1A] p-8 flex flex-col transition-transform duration-500 ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                    <div className="mt-16 space-y-6">
                        <Link onClick={() => setIsMenuOpen(false)} to="/" className="block text-2xl font-bold text-white">Home</Link>
                        <HashLink onClick={() => setIsMenuOpen(false)} to="/#services" className="block text-2xl font-bold text-white">Services</HashLink>
                        <HashLink onClick={() => setIsMenuOpen(false)} to="/#why" className="block text-2xl font-bold text-white">About Us</HashLink>
                        {user && (
                            <Link onClick={() => setIsMenuOpen(false)} to="/dashboard" className="block text-2xl font-bold text-[#0046FB]">Dashboard</Link>
                        )}
                    </div>

                    <div className="mt-auto pb-10 space-y-4">
                        {!user ? (
                            <>
                                <Link
                                    to="/signin"
                                    onClick={() => setIsMenuOpen(false)}
                                    className="block w-full text-center py-4 rounded-2xl bg-[#1A1A1A] text-white font-bold"
                                >
                                    Sign In
                                </Link>
                                <HashLink
                                    to="/#contact"
                                    onClick={() => setIsMenuOpen(false)}
                                    className="block w-full text-center py-4 rounded-2xl bg-[#0046FB] text-white font-bold"
                                >
                                    Contact Us
                                </HashLink>
                            </>
                        ) : (
                            <button
                                onClick={() => { logout(); setIsMenuOpen(false); }}
                                className="block w-full py-4 rounded-2xl border border-red-900/30 text-red-500 font-bold"
                            >
                                Sign Out
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};

export default Navbar;