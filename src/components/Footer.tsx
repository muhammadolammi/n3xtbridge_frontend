import React from 'react';
import { Link } from 'react-router-dom';
import { HashLink } from 'react-router-hash-link';
import { scrollToSection } from './resusable';


const Footer: React.FC = () => {
    const currentYear = new Date().getFullYear();

    return (
        <div className="bg-[#000] text-[#F5F5F5] font-['Inter'] overflow-x-hidden selection:bg-[#0046FB]/30">
            <footer className="bg-black border-t border-[#2F2F2F] px-6 md:px-20 py-10">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 mb-6">
                    <div className="font-['Inter'] font-medium text-[22px] tracking-tight">N3xtbridge</div>
                    <div className="flex gap-7 flex-wrap">
                        <button onClick={() => scrollToSection('services')} className="text-[13px] text-[#CBCBCB] hover:text-white transition-colors">Services</button>
                        <button onClick={() => scrollToSection('why')} className="text-[13px] text-[#CBCBCB] hover:text-white transition-colors">About Us</button>
                        <button onClick={() => scrollToSection('contact')} className="text-[13px] text-[#CBCBCB] hover:text-white transition-colors">Contact Us</button>
                    </div>
                </div>
                <div className="border-t border-[#2F2F2F] pt-5">
                    <div className="text-[12px] text-[#CBCBCB]">© {currentYear} N3xtbridge Holdings. All rights reserved.</div>
                </div>
            </footer>
        </div>
    );
};

export default Footer;