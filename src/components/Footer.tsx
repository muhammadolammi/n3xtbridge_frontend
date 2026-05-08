import React from 'react';

import { scrollToSection } from './resusable';
import myLogo from '../assets/logo.png';



const Footer: React.FC = () => {
    const currentYear = new Date().getFullYear();

    return (
        <div className="bg-background text-text overflow-x-hidden selection:bg-[#0046FB]/30">
            <footer className="border-t border-primary/20 py-8">

                <div className="max-w-7xl mx-auto px-5 md:px-10">

                    <div className="flex items-start justify-between gap-6">

                        {/* LOGO */}
                        <div className="shrink-0">
                            <img
                                src={myLogo}
                                alt="N3xtbridge Logo"
                                className="h-[45px] md:h-[50px] w-auto object-contain"
                            />
                        </div>

                        {/* LINKS */}
                        <div className="flex flex-wrap justify-end gap-x-5 gap-y-2 text-sm max-w-[70%]">

                            <button
                                onClick={() => scrollToSection('services')}
                                className="text-secondary/70 hover:text-primary transition-colors"
                            >
                                Services
                            </button>

                            <button
                                onClick={() => scrollToSection('why')}
                                className="text-secondary/70 hover:text-primary transition-colors"
                            >
                                About Us
                            </button>

                            <button
                                onClick={() => scrollToSection('contact')}
                                className="text-secondary/70 hover:text-primary transition-colors"
                            >
                                Contact Us
                            </button>

                        </div>

                    </div>

                    {/* BOTTOM */}
                    <div className="mt-6 pt-5 border-t border-primary/10">

                        <div className="text-xs text-secondary/60">
                            © {currentYear} N3xtbridge Holdings. All rights reserved.
                        </div>

                    </div>

                </div>

            </footer>
        </div>
    );
};

export default Footer;