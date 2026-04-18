import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { HashLink } from 'react-router-hash-link';
import { useAuth } from '../context/AuthContext'; // Ensure this path is correct
import { MENUSECTIONTOHASH } from './resusable';

const Navbar: React.FC = () => {
    const { user, logout } = useAuth();
    const [isScrolled, setIsScrolled] = useState(false);


    const isLoggedin = !!user;
    const isAtDashboard = location.pathname.startsWith('/dashboard');
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 10);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);




    return (
        <>

            <nav
                className={`fixed top-0 left-0 right-0 z-[100] flex items-center justify-between bg-black/85 backdrop-blur-md border-b border-[#111] transition-shadow duration-300 ${isScrolled ? 'shadow-[0_2px_24px_rgba(0,0,0,0.6)]' : ''
                    }`}
            >
                <div className="px-8 py-5 text-[22px] font-medium tracking-tight">N3xtbridge</div>



                {/* Geral links Links */}


                <div className="hidden md:flex items-center space-x-8">
                    <Link to="/" className="text-on-surface-variant dark:text-slate-400 hover:text-blue-600 transition-colors">
                        Home
                    </Link>

                    {/* Show Dashboard only if logged in AND not currently on a dashboard page */}
                    {isLoggedin && (
                        <Link to="/dashboard" className="text-on-surface-variant dark:text-slate-400 hover:text-blue-600 transition-colors">
                            Dashboard
                        </Link>
                    )}

                    <Link to="/services" className="text-on-surface-variant dark:text-slate-400 hover:text-blue-600 transition-colors">
                        Services
                    </Link>
                    <HashLink to="/#why" className="text-on-surface-variant dark:text-slate-400 hover:text-blue-600 transition-colors">
                        About Us
                    </HashLink>
                </div>
                {!isAtDashboard && (< HashLink
                    to={"/#contact"}
                    className="hidden md:block bg-[#0046FB] text-white font-['Manrope'] font-semibold px-8 py-5.5 hover:opacity-85 transition-opacity"
                >
                    Contact Us
                </HashLink>
                )}
                {isAtDashboard && (< button
                    onClick={() => logout()}
                    className="hidden md:block bg-[#0046FB] text-white font-['Manrope'] font-semibold px-8 py-5.5 hover:opacity-85 transition-opacity"
                >
                    Sign Out
                </button>
                )}


                <button
                    className="md:hidden flex flex-col gap-[5px] px-6 py-5 bg-transparent border-none cursor-pointer"
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                >
                    <span className={`block w-[22px] h-[2px] bg-white transition-all ${isMenuOpen ? 'rotate-45 translate-y-2' : ''}`}></span>
                    <span className={`block w-[22px] h-[2px] bg-white transition-opacity ${isMenuOpen ? 'opacity-0' : ''}`}></span>
                    <span className={`block w-[22px] h-[2px] bg-white transition-all ${isMenuOpen ? '-rotate-45 -translate-y-2' : ''}`}></span>
                </button>
            </nav >
            {/* MOBILE MENU */}

            < div className={`${isMenuOpen ? 'flex' : 'hidden'} flex-col bg-[#0a0a0a] border-t border-[#222] fixed top-16 left-0 right-0 z-[99] py-4`
            }>
                {
                    ['Home', 'About Us', 'Services'].map((section) => (
                        <HashLink
                            key={section}
                            to={`/#${MENUSECTIONTOHASH[section]}`}
                            onClick={() => {
                                setIsMenuOpen(false)
                            }}
                            className="font-['Manrope'] text-[17px] font-medium text-left px-8 py-3.5 border-b border-[#111] hover:bg-[#111]"
                        >
                            {section.charAt(0).toUpperCase() + section.slice(1)}
                        </HashLink>
                    ))
                }
                < HashLink
                    to="/#contact"
                    onClick={() => setIsMenuOpen(false)}
                    className="bg-[#0046FB] text-white mx-6 my-3 py-3.5 rounded font-semibold block text-center"
                >
                    Contact Us
                </HashLink >
            </div >
        </>
    );
};

export default Navbar;