import React from 'react';
import { Link } from 'react-router-dom';
import { HashLink } from 'react-router-hash-link';

const Navbar: React.FC = () => {
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
                    <Link to="/services" className="text-on-surface-variant dark:text-slate-400 hover:text-blue-600 transition-colors">
                        Services
                    </Link>
                    <Link to="/about-us" className="text-on-surface-variant dark:text-slate-400 hover:text-blue-600 transition-colors">
                        About Us
                    </Link>
                    {/* <Link to="/cases" className="text-on-surface-variant dark:text-slate-400 hover:text-blue-600 transition-colors">
                        Case Studies
                    </Link> */}
                </div>

                <HashLink to="/#contact" className="bg-primary hover:opacity-80 transition-all duration-200 active:scale-95 transform text-white px-5 py-2 rounded-lg font-medium text-sm">
                    Contact Us
                </HashLink>
            </div>
        </nav>
    );
};

export default Navbar;