import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { HashLink } from 'react-router-hash-link';
import { useAuth } from '../context/AuthContext';
import myLogo from '../assets/logo.png';

// import { MENUSECTIONTOHASH } from './resusable';

const Navbar: React.FC = () => {
    const { user, logout } = useAuth();
    const location = useLocation();
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const getLinkClass = (path: string) =>
        `text-sm font-medium transition-colors duration-300 ${location.pathname === path
            ? 'text-primary'
            : 'text-secondary/70 hover:text-primary'
        }`;

    return (
        <>
            <nav
                className={`fixed top-0 left-0 right-0 z-[100] border-b transition-all duration-300 ${isScrolled
                    ? 'bg-white/80 backdrop-blur-md border-primary/10 py-3'
                    : 'bg-transparent border-transparent py-5'
                    }`}
            >

                <div className="max-w-7xl mx-auto flex items-center justify-between">

                    <div className="absolute left-5 md:left-10 top-1/2 -translate-y-1/2">
                        <Link to="/" className="flex items-center">
                            <img
                                src={myLogo}
                                alt="N3xtbridge"
                                className="h-[50px] w-auto object-contain"
                            />
                        </Link>
                    </div>


                    <div className="max-w-7xl mx-auto px-6 md:px-12 flex items-center justify-end">

                        <div className="hidden md:flex items-center space-x-10">
                            <Link to="/" className={getLinkClass('/')}>Home</Link>

                            <HashLink to="/#services" className={getLinkClass('/services')}>
                                Services
                            </HashLink>

                            <HashLink to="/#why" className={getLinkClass('/#why')}>
                                About
                            </HashLink>

                            {user && (
                                <Link to="/dashboard" className={getLinkClass('/dashboard')}>
                                    Dashboard
                                </Link>
                            )}
                        </div>

                    </div>

                    {/* RIGHT ACTIONS */}
                    <div className="hidden md:flex items-center gap-3 ml-10">

                        {!user ? (
                            <>
                                <Link
                                    to="/signin"
                                    className="text-sm font-medium text-secondary/80 hover:text-primary transition-colors"
                                >
                                    Sign In
                                </Link>

                                <HashLink
                                    to="/signup"
                                    className="bg-primary text-white text-sm font-semibold px-6 py-2.5 rounded-xl hover:bg-secondary transition-all"
                                >
                                    Get Started
                                </HashLink>
                            </>
                        ) : (
                            <button
                                onClick={logout}
                                className="text-sm font-semibold text-primary hover:text-red-500 transition-colors "
                            >
                                Sign Out
                            </button>
                        )}
                    </div>

                    {/* MOBILE BUTTON */}
                    <button
                        className="md:hidden w-10 h-10 flex flex-col items-center justify-center gap-1.5"
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                    >
                        <span className={`w-6 h-0.5 bg-secondary transition ${isMenuOpen ? 'rotate-45 translate-y-2' : ''}`} />
                        <span className={`w-6 h-0.5 bg-secondary transition ${isMenuOpen ? 'opacity-0' : ''}`} />
                        <span className={`w-6 h-0.5 bg-secondary transition ${isMenuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
                    </button>
                </div>
            </nav>

            {/* MOBILE MENU */}
            <div className={`fixed inset-0 z-[99] transition ${isMenuOpen ? 'visible' : 'invisible'}`}>

                <div
                    className={`absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity ${isMenuOpen ? 'opacity-100' : 'opacity-0'
                        }`}
                    onClick={() => setIsMenuOpen(false)}
                />

                <div className={`absolute top-0 right-0 w-[80%] h-full bg-white border-l border-[#E2E8F0] p-8 flex flex-col transition-transform ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'
                    }`}>

                    <div className="mt-16 space-y-6">

                        <Link onClick={() => setIsMenuOpen(false)} to="/" className="block text-xl font-semibold text-secondary">
                            Home
                        </Link>

                        <HashLink onClick={() => setIsMenuOpen(false)} to="/#services" className="block text-xl font-semibold text-secondary">
                            Services
                        </HashLink>

                        <HashLink onClick={() => setIsMenuOpen(false)} to="/#why" className="block text-xl font-semibold text-secondary">
                            About
                        </HashLink>

                        {user && (
                            <Link onClick={() => setIsMenuOpen(false)} to="/dashboard" className="block text-xl font-semibold text-primary">
                                Dashboard
                            </Link>
                        )}
                    </div>

                    <div className="mt-auto space-y-4">

                        {!user ? (
                            <>
                                <Link
                                    to="/signin"
                                    onClick={() => setIsMenuOpen(false)}
                                    className="block w-full text-center py-4 rounded-xl border border-[#E2E8F0] text-secondary font-semibold"
                                >
                                    Sign In
                                </Link>

                                <HashLink
                                    to="/signup"
                                    onClick={() => setIsMenuOpen(false)}
                                    className="block w-full text-center py-4 rounded-xl bg-primary text-white font-semibold"
                                >
                                    Get Started
                                </HashLink>
                            </>
                        ) : (
                            <button
                                onClick={() => { logout(); setIsMenuOpen(false); }}
                                className="block w-full py-4 rounded-xl border border-red-200 text-red-500 font-semibold"
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