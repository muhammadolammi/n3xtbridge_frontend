import React from 'react';
// import { Link } from 'react-router-dom'; 
// import { HashLink } from 'react-router-hash-link';
import { scrollToSection } from './resusable';


const Footer: React.FC = () => {
    const currentYear = new Date().getFullYear();

    return (
        <div className="bg-background text-text overflow-x-hidden selection:bg-[#0046FB]/30">
            <footer className="border-t border-[#22D3EE] px-6 md:px-20 py-10">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 mb-6">
                    <div className="flex items-center">
                        <img

                            src="https://cdn.n3xtbridge.com/frontenddata/N3xtbridge%20Logo%20PNG.png"
                            alt="N3xtbridge Logo"
                            className="h-7 w-auto object-contain opacity-90"
                        />
                    </div>                    <div className="flex gap-7 flex-wrap">
                        <button onClick={() => scrollToSection('services')} className="text-[13px]  hover:text-[#22D3EE] transition-colors">Services</button>
                        <button onClick={() => scrollToSection('why')} className="text-[13px]  hover:text-[#22D3EE] transition-colors">About Us</button>
                        <button onClick={() => scrollToSection('contact')} className="text-[13px]  hover:text-[#22D3EE] transition-colors">Contact Us</button>
                    </div>
                </div>
                <div className="border-t border-[#22D3EE] pt-5">
                    <div className="text-[12px] t">© {currentYear} N3xtbridge Holdings. All rights reserved.</div>
                </div>
            </footer>
        </div>
    );
};

export default Footer;