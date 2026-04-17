import React, { useEffect, useState } from 'react';
// import { SITE_CONFIG } from '../constants/content';
// import { Link, useNavigate } from 'react-router-dom';
import type { Service } from '../models/model';
import api from '../api/axios';
import { BrandLoader, scrollToSection } from '../components/resusable';


// const featureRows = [
//     "Our Seamless IT solutions are customized to match specific requirements.",
//     "Our successful projects and satisfied clients speak to our competence and reliability.",
//     "We offer end-to-end Seamless IT services for a holistic experience."
// ];

const WhyCard: React.FC<{ title: string; desc: string; icon: React.ReactNode }> = ({ title, desc, icon }) => (
    <div className="bg-[#0C0C0C] rounded-xl p-8 lg:p-12 flex flex-col items-center gap-4">
        <div className="w-20 h-20 flex items-center justify-center">
            <svg className="w-16 h-16" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="32" cy="32" r="28" stroke="#003FE2" strokeWidth="3.5" fill="none" />
                {icon}
            </svg>
        </div>
        <div className="font-['Manrope'] font-medium text-[18px] lg:text-[28px]">{title}</div>
        <div className="font-['Manrope'] text-[13px] lg:text-[16px] text-[#838383] leading-relaxed">{desc}</div>
    </div>
);

const ContactItem: React.FC<{ label: string, value: string, detail: string, linkText: string, linkHref: string, icon: React.ReactNode }> = ({ label, value, detail, linkText, linkHref, icon }) => (
    <div className="flex flex-col gap-4">
        <div className="w-14 h-14 bg-[#1C1C1C] rounded-xl flex items-center justify-center shrink-0">
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="#E2E2E2" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                {icon}
            </svg>
        </div>
        <div>
            <div className="text-[14px] font-medium text-[#A0A0A0] mb-0.5">{label}</div>
            <div className="text-[15px] text-white font-medium mb-0.5">{value}</div>
            <div className="text-[13px] text-[#7F7F7F] leading-relaxed mb-1.5">{detail}</div>
            <a href={linkHref} className="text-[12px] font-semibold text-[#E2E2E2] flex items-center gap-1 hover:opacity-70">
                {linkText}
            </a>
        </div>
    </div>
);

const HeroCameraSvg = () => (
    <svg viewBox="0 0 520 340" xmlns="http://www.w3.org/2000/svg" className="w-full drop-shadow-[0_20px_60px_rgba(0,70,251,0.2)] -rotate-[3deg]">
        <defs>
            <radialGradient id="camGrad" cx="50%" cy="40%" r="60%">
                <stop offset="0%" stopColor="#4a5568" />
                <stop offset="100%" stopColor="#1a202c" />
            </radialGradient>
            <radialGradient id="lensGrad" cx="35%" cy="35%" r="60%">
                <stop offset="0%" stopColor="#2d3748" />
                <stop offset="60%" stopColor="#1a202c" />
                <stop offset="100%" stopColor="#0d1117" />
            </radialGradient>
        </defs>
        <ellipse cx="260" cy="170" rx="180" ry="90" fill="url(#camGrad)" />
        <rect x="80" y="120" width="300" height="100" rx="20" fill="url(#camGrad)" />
        <circle cx="340" cy="170" r="62" fill="#111" />
        <circle cx="340" cy="170" r="55" fill="url(#lensGrad)" />
        <circle cx="340" cy="170" r="40" fill="#0d1117" stroke="#2d3748" strokeWidth="2" />
        <circle cx="100" cy="155" r="6" fill="#0046FB" />
        <path id="arc" d="M 200 60 A 160 160 0 0 1 440 100" fill="none" />
        <text fontFamily="Manrope" fontSize="13" fill="#B5B5B5" opacity=".5" letterSpacing="4">
            <textPath href="#arc">Innovative Vision</textPath>
        </text>
    </svg>
);






// const servicesData = [
//     {
//         id: 'security',
//         title: 'Security & Access Control',
//         desc: 'Advanced CCTV surveillance and premises access control solutions integrated with AI-driven monitoring for 24/7 protection.',
//         tag: 'SECURITY',
//         image: 'https://images.unsplash.com/photo-1557597774-9d273605dfa9?q=80&w=2000&auto=format&fit=crop'
//     },
//     {
//         id: 'solar',
//         title: 'Solar Power Solutions',
//         desc: 'Clean, sustainable energy installations designed to provide 100% uptime for your critical IT infrastructure and office operations.',
//         tag: 'RENEWABLES',
//         image: 'https://images.unsplash.com/photo-1668097613572-40b7c11c8727?q=80&w=1170&auto=format&fit=crop',
//         minPrice: '120,000'
//     },
//     {
//         id: 'web',
//         title: 'Web & App Development',
//         desc: 'High-performance, scalable web platforms and mobile applications built with modern stacks like React, Go, and .NET Core.',
//         tag: 'DEVELOPMENT',
//         image: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=2000&auto=format&fit=crop'
//     },
//     {
//         id: 'general',
//         title: 'General IT & Infrastructure',
//         desc: 'From fiber optic cabling to data center management, we build the physical and digital backbone of your enterprise.',
//         tag: 'INFRASTRUCTURE',
//         image: 'https://images.unsplash.com/photo-1528845922818-cc5462be9a63?q=80&w=1074&auto=format&fit=crop'
//     }
// ];

const ServicesSection = ({ services }: { services: Service[] }) => {
    return (
        <section id="services" className="px-6 md:px-20 py-24 bg-black">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-20 gap-8">
                <div>
                    <span className="text-[#0046FB] font-bold tracking-[0.2em] text-sm mb-4 block">WHAT WE DO</span>
                    <h2 className="font-['Manrope'] font-medium text-[36px] md:text-[5vw] lg:text-[52px] leading-[1.1] text-white">
                        Providing Seamless <br /><span className="text-[#0046FB]">ICT Solutions</span>
                    </h2>
                </div>
                <button className="bg-[#0046FB] text-white font-['Manrope'] font-semibold px-10 py-5 hover:bg-blue-700 transition-all shrink-0">
                    Explore All Services &nbsp;↗
                </button>
            </div>

            <div className="flex flex-col gap-16">
                {services.map((service, index) => (
                    <div
                        key={service.id}
                        className="group grid grid-cols-1 lg:grid-cols-2 items-stretch bg-[#0C0C0C] rounded-3xl overflow-hidden border border-[#1A1A1A] hover:border-[#0046FB]/30 transition-all duration-500"
                    >
                        {/* IMAGE SIDE: 
               On mobile, we use 'order-first' so it is always at the top.
               On desktop (lg), we reset it to 'lg:order-none' and let the 
               Text Side's conditional order handle the flip.
            */}
                        <div className="relative min-h-[300px] md:min-h-[400px] overflow-hidden order-first lg:order-none">
                            <div className="absolute inset-0 bg-gradient-to-t from-[#0C0C0C] via-transparent to-transparent z-10 lg:hidden"></div>
                            <div className="absolute inset-0 bg-[#0046FB]/5 mix-blend-overlay z-10"></div>

                            <img
                                src={service.image}
                                alt={service.name}
                                className="absolute inset-0 w-full h-full object-cover grayscale-[30%] group-hover:grayscale-0 group-hover:scale-110 transition-all duration-700 ease-in-out"
                            />
                        </div>

                        {/* TEXT SIDE:
               On mobile, it naturally falls second.
               On desktop, if it's an odd index, we move it to the first position (left side).
            */}
                        <div className={`p-8 md:p-10 lg:p-20 flex flex-col justify-center ${index % 2 !== 0 ? 'lg:order-first' : 'lg:order-last'}`}>
                            <div className="flex items-center gap-3 mb-4 md:mb-6">
                                <div className="w-10 h-[1px] bg-[#0046FB]"></div>
                                <span className="text-[#0046FB] font-bold tracking-widest text-[10px] md:text-xs uppercase">
                                    {service.tags ?? ""}
                                </span>
                            </div>
                            <h3 className="font-['Manrope'] font-semibold text-2xl md:text-3xl lg:text-5xl mb-6 md:mb-8 text-white leading-tight">
                                {service.name}
                            </h3>
                            <p className="font-['Manrope'] text-base md:text-lg text-[#B5B5B5] leading-relaxed mb-8 md:mb-12 max-w-md">
                                {service.description}
                            </p>

                            {service.min_price.trim() !== `''` && service.min_price.trim() !== `""` && service.min_price.trim() !== "" && (<div className="mb-6 flex items-center gap-2">
                                <span className="text-[#838383] text-sm font-['Manrope'] uppercase tracking-wider">Starting from</span>
                                <span className="text-white font-bold text-lg font-['Inter']">
                                    ₦{new Intl.NumberFormat('en-NG').format(Number(service.min_price))}
                                </span>
                            </div>
                            )}

                            <div className="flex flex-wrap gap-4 md:gap-5 items-center">
                                {/* Main Quote Button */}
                                <button className="bg-[#0046FB] text-white px-6 md:px-8 py-3.5 md:py-4 font-bold text-sm hover:scale-105 transition-transform active:scale-95">
                                    Get a Quote
                                </button>

                                {/* WhatsApp Chat Button */}
                                <a

                                    href={`https://wa.me/2349139971163?text=Hello N3xtbridge, I'm interested in ${service.name}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2 bg-[#25D366]/10 text-[#25D366] border border-[#25D366]/20 px-6 py-3.5 md:py-4 font-bold text-sm hover:bg-[#25D366] hover:text-white transition-all active:scale-95"
                                >
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.067 2.877 1.215 3.076.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                                    </svg>
                                    WhatsApp Chat
                                </a>

                                {/* Specifications Link */}
                                <button className="group/btn flex items-center gap-2 text-[#F5F5F5] font-semibold text-sm">
                                    Full Specifications
                                    <span className="group-hover/btn:translate-x-1 transition-transform">→</span>
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
};

const Home: React.FC = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const [services, setServices] = useState<Service[]>([]);
    const [loading, setLoading] = useState(true);



    useEffect(() => {
        const fetchServices = async () => {
            try {
                const res = await api.get('/services?limit=5&offset=0');
                setServices(res.data.services || []);
            } catch (err) {
                console.error('Failed to fetch landing services', err);
            } finally {
                setLoading(false);
            }
        };
        fetchServices();
    }, []);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 10);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    if (loading) {
        return <BrandLoader />;
    }

    console.log(services)
    return (
        <div className="bg-[#000] text-[#F5F5F5] font-['Inter'] overflow-x-hidden selection:bg-[#0046FB]/30">
            {/* NAV */}
            <nav
                className={`fixed top-0 left-0 right-0 z-[100] flex items-center justify-between bg-black/85 backdrop-blur-md border-b border-[#111] transition-shadow duration-300 ${isScrolled ? 'shadow-[0_2px_24px_rgba(0,0,0,0.6)]' : ''
                    }`}
            >
                <div className="px-8 py-5 text-[22px] font-medium tracking-tight">N3xtbridge</div>

                <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 gap-8 items-center">
                    <button onClick={() => scrollToSection('hero', setIsMenuOpen)} className="font-['Manrope'] text-base font-medium hover:opacity-70 transition-opacity">Home</button>
                    <button onClick={() => scrollToSection('why', setIsMenuOpen)} className="font-['Manrope'] text-base font-medium hover:opacity-70 transition-opacity">About Us</button>
                    <button onClick={() => scrollToSection('services', setIsMenuOpen)} className="font-['Manrope'] text-base font-medium hover:opacity-70 transition-opacity">Services</button>
                </div>

                <button
                    onClick={() => scrollToSection('contact', setIsMenuOpen)}
                    className="hidden md:block bg-[#0046FB] text-white font-['Manrope'] font-semibold px-8 py-5.5 hover:opacity-85 transition-opacity"
                >
                    Contact Us
                </button>

                <button
                    className="md:hidden flex flex-col gap-[5px] px-6 py-5 bg-transparent border-none cursor-pointer"
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                >
                    <span className={`block w-[22px] h-[2px] bg-white transition-all ${isMenuOpen ? 'rotate-45 translate-y-2' : ''}`}></span>
                    <span className={`block w-[22px] h-[2px] bg-white transition-opacity ${isMenuOpen ? 'opacity-0' : ''}`}></span>
                    <span className={`block w-[22px] h-[2px] bg-white transition-all ${isMenuOpen ? '-rotate-45 -translate-y-2' : ''}`}></span>
                </button>
            </nav>

            {/* MOBILE MENU */}
            <div className={`${isMenuOpen ? 'flex' : 'hidden'} flex-col bg-[#0a0a0a] border-t border-[#222] fixed top-16 left-0 right-0 z-[99] py-4`}>
                {['hero', 'why', 'services'].map((section) => (
                    <button
                        key={section}
                        onClick={() => scrollToSection(section, setIsMenuOpen)}
                        className="font-['Manrope'] text-[17px] font-medium text-left px-8 py-3.5 border-b border-[#111] hover:bg-[#111]"
                    >
                        {section.charAt(0).toUpperCase() + section.slice(1)}
                    </button>
                ))}
                <button
                    onClick={() => scrollToSection('contact', setIsMenuOpen)}
                    className="bg-[#0046FB] text-white mx-6 my-3 py-3.5 rounded font-semibold"
                >
                    Contact Us
                </button>
            </div>

            {/* HERO */}
            <section id="hero" className="min-h-screen grid grid-cols-1 lg:grid-cols-2 items-center px-6 md:px-12 lg:px-20 py-[120px] relative overflow-hidden gap-10">
                <div className="absolute w-[300px] h-[140px] bg-[#0046FB] blur-[180px] rounded-full opacity-35 top-[55%] -left-[8%] pointer-events-none"></div>
                <div className="absolute w-[300px] h-[140px] bg-[#0046FB] blur-[180px] rounded-full opacity-25 top-[30%] right-[5%] pointer-events-none"></div>

                <div className="relative z-[2] flex flex-col items-center lg:items-start text-center lg:text-left">
                    <h1 className="font-['Manrope'] font-medium text-[40px] md:text-[5.5vw] lg:text-[90px] leading-[1.15] mb-6">
                        Innovative Tech Solutions for Your Business
                    </h1>
                    <p className="font-['Manrope'] text-[15px] md:text-[1.4vw] lg:text-[18px] text-[#B5B5B5] leading-relaxed max-w-[520px] mb-10">
                        From state-of-the-art security systems to cutting-edge web development, we empower your digital transformation with high-precision architectural solutions.
                    </p>
                    {/* <button onClick={() => scrollToSection('contact', setIsMenuOpen)} className="inline-flex items-center gap-2.5 bg-[#0046FB] text-white font-['Manrope'] font-semibold px-7 py-5 hover:opacity-85 transition-opacity">
                        Get a Free Consultation
                    </button>

                    <div className="flex items-center gap-5 mt-12">
                        <div className="border border-[#767676] rounded-full px-5 py-2 font-['Manrope'] text-2xl font-medium min-w-[56px] text-center">1</div>
                        <div className="hidden sm:block h-[3px] bg-[#202020] w-[120px] rounded-sm"></div>
                        <div className="border border-[#767676] rounded-full px-5 py-2 font-['Manrope'] text-2xl font-medium min-w-[56px] text-center">2</div>
                    </div> */}
                </div>

                <div className="hidden lg:flex relative z-[2] justify-center items-center">
                    <div className="relative w-full max-w-[560px]">
                        <HeroCameraSvg />
                    </div>
                </div>
            </section>

            {/* CLIENTS */}
            {/* <section className="px-6 md:px-20 py-15 border-t border-[#111]">
                <p className="font-['Manrope'] text-[15px] md:text-[1.8vw] lg:text-[22px] text-[#7E7E7E] mb-8 max-w-[320px] leading-snug">
                    Renowned Companies that we've delivered our service to
                </p>
                <div className="flex items-center gap-6 md:gap-16 flex-wrap">
                    {['IPSUM', 'LOCDO', '◈', '⊜'].map((logo, i) => (
                        <div key={i} className="font-['Manrope'] font-bold text-2xl md:text-[2vw] lg:text-[26px] text-[#3B4158] whitespace-nowrap">
                            {logo}
                        </div>
                    ))}
                </div>
            </section> */}

            {/* WHY CHOOSE */}
            <section id="why" className="px-6 md:px-20 py-24 text-center">
                <h2 className="font-['Manrope'] font-medium text-[28px] md:text-[3.5vw] lg:text-[56px] mb-12 leading-tight">Why Choose N3xtbridge Holdings</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 max-w-[1100px] mx-auto">
                    <WhyCard
                        title="Unmatched Reliability"
                        desc="Our systems are built on architectural integrity, ensuring your business stays operational 24/7 with zero compromise on quality."
                        icon={<path d="M20,33 28,41 44,24" stroke="#003FE2" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />}
                    />
                    <WhyCard
                        title="Practical Innovation"
                        desc="We don't just use technology for its own sake. We implement cutting-edge solutions that solve specific, tangible business challenges."
                        icon={<path d="M16 52c0-8.837 7.163-16 16-16s16 7.163 16 16" stroke="#003FE2" strokeWidth="3.5" strokeLinecap="round" />}
                    />
                    <WhyCard
                        title="Technical Expertise"
                        desc="Our multi-disciplinary team combines physical hardware mastery with advanced software engineering capabilities."
                        icon={<path d="M32 8 L54 18 L54 34 C54 46 44 56 32 60 C20 56 10 46 10 34 L10 18 Z" stroke="#003FE2" strokeWidth="3.5" strokeLinejoin="round" />}
                    />
                </div>
            </section>

            {/* SERVICES */}
            {/* <section id="services" className="px-6 md:px-20 py-20">
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-5">
                    <h2 className="font-['Manrope'] font-medium text-[24px] md:text-[3vw] lg:text-[52px] leading-tight max-w-[700px]">Core Infrastructure & Digital Services</h2>
                    <Link to={"/services"} className="inline-flex items-center gap-2 bg-[#0046FB] text-white font-['Manrope'] font-semibold px-7 py-5 whitespace-nowrap hover:opacity-85">
                        Browse All Services &nbsp;↗
                    </Link>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center bg-[#0C0C0C] rounded-xl overflow-hidden mb-6">
                    <div className="p-12">
                        <div className="font-['Manrope'] font-semibold text-2xl lg:text-4xl mb-4 leading-tight">Security Camera Installation</div>
                        <p className="font-['Manrope'] text-sm lg:text-xl text-[#B5B5B5] leading-relaxed mb-8">
                            Advanced surveillance systems integrated with AI-driven monitoring for 24/7 commercial security.
                        </p>
                        <button className="inline-flex items-center gap-2 font-['Manrope'] font-semibold text-[#B5B5B5] hover:text-white transition-colors">
                            View Specifications &nbsp;↓
                        </button>
                    </div>
                    <div className="bg-[#141414] h-[380px] flex items-center justify-center relative overflow-hidden">
                        <div className="w-full h-full bg-gradient-to-br from-[#0a0a0a] via-[#1a1a2e] to-[#0d1117] flex items-center justify-center">
                            <ServiceCameraSvg />
                        </div>
                    </div>
                </div>

                <div className="flex flex-col gap-3">
                    {featureRows.map((text, i) => (
                        <div key={i} className="flex items-center justify-between bg-[#0C0C0C] rounded-xl px-12 py-10 gap-5 cursor-pointer hover:bg-[#111] transition-colors">
                            <div className="font-['Manrope'] font-medium text-sm lg:text-[22px] leading-tight">{text}</div>
                            <svg className="w-9 h-9 opacity-70 shrink-0" viewBox="0 0 36 36" fill="none">
                                <path d="M10 10 L26 26 M26 26 L26 14 M26 26 L14 26" stroke="#B5B5B5" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </div>
                    ))}
                </div>
            </section> */}
            <ServicesSection services={services} />

            {/* CTA SECTION */}
            <section className="px-6 md:px-20 py-30 text-center relative overflow-hidden">
                <div className="absolute w-[300px] h-[140px] bg-[#0046FB] blur-[200px] rounded-full opacity-30 top-1/2 -right-[5%] pointer-events-none"></div>
                <div className="absolute w-[300px] h-[140px] bg-[#0046FB] blur-[200px] rounded-full opacity-30 bottom-1/4 -left-[5%] pointer-events-none"></div>
                <h2 className="font-['Manrope'] font-medium text-[28px] md:text-[4vw] lg:text-[64px] max-w-[700px] mx-auto mb-10 leading-tight relative z-[2]">
                    Ready to Transform Your Business with Seamless IT Solutions?
                </h2>
                <button onClick={() => scrollToSection('contact', setIsMenuOpen)} className="relative z-[2] inline-flex items-center gap-2.5 bg-[#0046FB] text-white font-['Manrope'] font-semibold px-7 py-5 hover:opacity-85">
                    Get a Free Consultation
                </button>
            </section>

            {/* CONTACT */}
            <section id="contact" className="px-6 md:px-20 py-20 bg-black">
                <h2 className="font-['Inter'] font-medium text-[24px] md:text-[3vw] lg:text-4xl text-white mb-2 tracking-[-1.5px]">Contact us</h2>
                <p className="font-['Inter'] text-base text-[#7F7F7F] mb-14">Ready to Transform Your Business with Seamless IT Solutions?</p>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
                    <ContactItem
                        label="Office"
                        value="Visit or refer us to us"
                        detail="11, Paul Amore Blvd 2, Phase 1, Gwagwalada Abuja, Nigeria"
                        linkText=""
                        linkHref=""
                        icon={<><path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" /></>}
                    />
                    <ContactItem
                        label="Phone"
                        value="Speak to our team for support"
                        detail="+234 805 269 1497"
                        linkText="Call now ↗"
                        linkHref="tel:+2348052691497"
                        icon={<path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.8 19.79 19.79 0 01.01 1.18 2 2 0 012 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.91 7.91a16 16 0 006.29 6.29l1.28-1.28a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" />}
                    />
                    <ContactItem
                        label="Email"
                        value="We'll respond and get in touch directly"
                        detail="contact@n3xtbridge.com"
                        linkText="Send an email ↗"
                        linkHref="mailto:contact@n3xtbridge.com"
                        icon={<><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></>}
                    />
                </div>
            </section>


        </div>
    );
};

export default Home
// const Home: React.FC = () => {
//     const [services, setServices] = useState<Service[]>([]);
//     const [loading, setLoading] = useState(true);
//     const navigate = useNavigate();

//     useEffect(() => {
//         const fetchServices = async () => {
//             try {
//                 const res = await api.get('/services?limit=5&offset=0');
//                 setServices(res.data.services || []);
//             } catch (err) {
//                 console.error('Failed to fetch landing services', err);
//             } finally {
//                 setLoading(false);
//             }
//         };
//         fetchServices();
//     }, []);

//     return (
//         <div className="bg-black text-white font-sans">

//             {/* ── HERO ── */}
//             <section className="relative min-h-screen grid grid-cols-1 lg:grid-cols-2 items-center gap-10 px-6 md:px-20 pt-28 pb-16 overflow-hidden">
//                 {/* Glow blobs */}
//                 <div className="pointer-events-none absolute -left-20 top-1/2 w-72 h-36 bg-blue-600 opacity-30 blur-[180px] rounded-full" />
//                 <div className="pointer-events-none absolute right-10 top-1/3 w-72 h-36 bg-blue-600 opacity-20 blur-[180px] rounded-full" />

//                 {/* Left */}
//                 <div className="relative z-10">
//                     <span className="inline-block px-3 py-1 bg-blue-600/20 text-blue-400 text-xs font-bold tracking-widest uppercase rounded-full mb-6">
//                         Empowering Digital Transformation
//                     </span>
//                     <h1 className="text-5xl md:text-7xl font-bold leading-tight tracking-tight mb-6">
//                         Innovative Tech <br /> Solutions for <br />
//                         <span className="text-blue-500 italic">Your Business</span>
//                     </h1>
//                     <p className="text-lg text-neutral-400 max-w-lg mb-10 leading-relaxed">
//                         From state-of-the-art security systems to cutting-edge web development, we empower
//                         your digital transformation with high-precision architectural solutions.
//                     </p>
//                     <Link
//                         to="/services"
//                         className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-4 transition-opacity"
//                     >
//                         Explore Our Services
//                     </Link>
//                     {/* Pagination dots */}
//                     <div className="flex items-center gap-5 mt-12">
//                         {[1, 2].map(n => (
//                             <div key={n} className="border border-neutral-600 rounded-full px-5 py-2 text-xl font-medium text-white">
//                                 {n}
//                             </div>
//                         ))}
//                     </div>
//                 </div>

//                 {/* Right – hero image */}
//                 <div className="relative flex items-center justify-center lg:h-[600px]">
//                     <div className="w-full aspect-square max-w-lg rounded-2xl overflow-hidden shadow-2xl rotate-3 hover:rotate-0 transition-transform duration-700 bg-neutral-900 p-4">
//                         <img
//                             alt="High-tech server environment"
//                             className="w-full h-full object-cover rounded-xl"
//                             src="https://lh3.googleusercontent.com/aida-public/AB6AXuCuGTC2dFt9_5UOAY1kDQwgwjf0dd00nWhoKUkIFyiQJVoostx0h7t_UUQ1EIY4sAVi0FyKPSe09QbM5Gp_ujTtJrPT_O97mbjUgxYL1RnKa-TJDPWHmzlFi5uVnRM7Ka_-HfxswxuhUyUN85qY-Ieu7N7dJCKscWERHOjksSD2BKHi_d896MsflGNK160sKunRHUyKD7-6lcqsq2pnid6qVk1FxgQz8av_OAOl-AC3Roko_mOiSvwhV88XGaxuSWUErp8Ygvqy6RLM"
//                         />
//                     </div>
//                 </div>
//             </section>

//             {/* ── CLIENTS ── */}
//             <section className="px-6 md:px-20 py-14 border-t border-neutral-900">
//                 <p className="text-neutral-500 text-lg mb-8 max-w-xs leading-relaxed">
//                     Renowned Companies that we've delivered our service to
//                 </p>
//                 <div className="flex flex-wrap items-center gap-12">
//                     {['IPSUM', 'LOCDO', '◈', '⊜'].map(logo => (
//                         <span key={logo} className="text-neutral-700 font-bold text-2xl tracking-tight">{logo}</span>
//                     ))}
//                 </div>
//             </section>

//             {/* ── SERVICES BENTO ── */}
//             <section className="py-24 bg-neutral-950" id="services">
//                 <div className="max-w-7xl mx-auto px-6 md:px-12">
//                     <div className="mb-16 md:flex justify-between items-end">
//                         <div className="max-w-2xl">
//                             <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
//                                 Core Infrastructure &amp; Digital Services
//                             </h2>
//                             <p className="text-neutral-500">Technical backbone for your business growth.</p>
//                         </div>
//                         <div className="mt-6 md:mt-0">
//                             <Link
//                                 to="/services"
//                                 className="text-blue-500 font-bold inline-flex items-center group"
//                             >
//                                 Browse all services
//                                 <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
//                             </Link>
//                         </div>
//                     </div>

//                     <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
//                         {loading ? (
//                             <div className="col-span-12 py-20 text-center text-neutral-600 font-mono text-xs uppercase tracking-widest animate-pulse">
//                                 Initializing Infrastructure...
//                             </div>
//                         ) : (
//                             services.map((service, index) => {
//                                 const isLarge = index === 0 || index === 3;
//                                 return (
//                                     <div
//                                         key={service.id}
//                                         className={`
//                       ${isLarge ? 'md:col-span-8' : 'md:col-span-4'}
//                       bg-neutral-900 rounded-xl p-8 flex flex-col
//                       ${isLarge ? 'md:flex-row' : ''}
//                       gap-8 items-center group
//                       transition-all hover:bg-neutral-800 border border-transparent hover:border-blue-600/20
//                     `}
//                                     >
//                                         {/* Image */}
//                                         <div className={`w-full ${isLarge ? 'md:w-1/2' : 'h-48'} aspect-video rounded-lg overflow-hidden`}>
//                                             <img
//                                                 alt={service.name}
//                                                 className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
//                                                 src={service.image || '/placeholder-tech.jpg'}
//                                             />
//                                         </div>

//                                         {/* Content */}
//                                         <div className={`w-full ${isLarge ? 'md:w-1/2' : ''}`}>
//                                             <span className="material-symbols-outlined text-blue-500 text-4xl mb-4 block">
//                                                 {service.icon || 'settings_input_component'}
//                                             </span>
//                                             <h3 className="text-2xl font-bold mb-3 text-white">{service.name}</h3>
//                                             <p className="text-neutral-400 mb-6 text-sm leading-relaxed">{service.description}</p>
//                                             <div className="flex gap-2 flex-wrap">
//                                                 <span className="px-3 py-1 bg-blue-600/20 text-blue-400 text-[10px] font-bold rounded-full uppercase">
//                                                     {service.category}
//                                                 </span>
//                                                 {service.is_featured && (
//                                                     <span className="px-3 py-1 bg-blue-600 text-white text-[10px] font-bold rounded-full uppercase flex items-center gap-1">
//                                                         <span className="material-symbols-outlined text-[10px]">star</span> Featured
//                                                     </span>
//                                                 )}
//                                             </div>
//                                             <div className="mt-8">
//                                                 <button
//                                                     onClick={() => navigate(`/services/${service.id}`, { state: { service } })}
//                                                     className="w-full inline-flex items-center justify-center gap-2 bg-neutral-800 text-white font-bold py-4 rounded-2xl hover:bg-blue-600 transition-all group/btn"
//                                                 >
//                                                     View Specifications
//                                                     <span className="text-sm group-hover/btn:translate-x-1 transition-transform">→</span>
//                                                 </button>
//                                             </div>
//                                         </div>
//                                     </div>
//                                 );
//                             })
//                         )}
//                     </div>
//                 </div>
//             </section>

//             {/* ── WHY CHOOSE ── */}
//             <section className="py-24 bg-black" id="about">
//                 <div className="max-w-7xl mx-auto px-6 md:px-12">
//                     <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
//                         {/* Image side */}
//                         <div className="relative">
//                             <div className="absolute -z-10 w-full h-full border-2 border-blue-600/20 translate-x-4 translate-y-4 rounded-xl" />
//                             <div className="bg-neutral-900 p-4 rounded-xl shadow-xl">
//                                 <img
//                                     alt="Tech Team"
//                                     className="rounded-lg w-full h-[500px] object-cover"
//                                     src="https://lh3.googleusercontent.com/aida-public/AB6AXuCiZxhLGviP-EZRTtDK69-TBg4F5mKTZN6P1h0kj5AeYonkWlOJWMEOJu1F1I9vQ5shRdelRJ4ji10CQ9lND5X4_Ugo9lD9JzY-D30AojF6HlMDK7tYjQOeAxrxI-8fwcf8SLy1KGVhdFq31K3kFzAFNtY5UG6C3K6TjEHdtwQc3-VD3L_5s7iVveCnIiTl3iF_QDQbAZXxwUWbpTAR-uZJWJyDIfyzOFFqhs887P8YvMN4R2PAgvE0i1pMc9-bRhXC68Ld2xYHIE_v"
//                                 />
//                                 <div className="absolute bottom-10 right-10 bg-blue-600 text-white p-6 rounded-lg shadow-2xl">
//                                     <div className="text-4xl font-extrabold mb-1">10+</div>
//                                     <div className="text-xs font-bold uppercase tracking-widest">Years Expertise</div>
//                                 </div>
//                             </div>
//                         </div>

//                         {/* Text side */}
//                         <div>
//                             <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-10">
//                                 Why Choose N3xtbridge Holdings
//                             </h2>
//                             <div className="space-y-10">
//                                 {[
//                                     {
//                                         icon: 'verified',
//                                         title: 'Unmatched Reliability',
//                                         desc: 'Our systems are built on architectural integrity, ensuring your business stays operational 24/7 with zero compromise on quality.',
//                                     },
//                                     {
//                                         icon: 'lightbulb',
//                                         title: 'Practical Innovation',
//                                         desc: "We don't just use technology for its own sake. We implement cutting-edge solutions that solve specific, tangible business challenges.",
//                                     },
//                                     {
//                                         icon: 'engineering',
//                                         title: 'Technical Expertise',
//                                         desc: 'Our multi-disciplinary team combines physical hardware mastery with advanced software engineering capabilities.',
//                                     },
//                                 ].map(({ icon, title, desc }) => (
//                                     <div key={title} className="flex gap-6">
//                                         <div className="flex-shrink-0 w-12 h-12 bg-blue-600/20 rounded-lg flex items-center justify-center">
//                                             <span className="material-symbols-outlined text-blue-500">{icon}</span>
//                                         </div>
//                                         <div>
//                                             <h4 className="text-xl font-bold mb-2 text-white">{title}</h4>
//                                             <p className="text-neutral-400 leading-relaxed">{desc}</p>
//                                         </div>
//                                     </div>
//                                 ))}
//                             </div>
//                         </div>
//                     </div>
//                 </div>
//             </section>

//             {/* ── CONTACT ── */}
//             <section className="py-24 bg-black" id="contact">
//                 <div className="max-w-7xl mx-auto px-6 md:px-12">
//                     <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-2">Contact us</h2>
//                     <p className="text-neutral-500 mb-14">
//                         Ready to transform your business with Seamless IT Solutions?
//                     </p>

//                     {/* Contact cards */}
//                     <div className="flex flex-col gap-10 max-w-2xl">
//                         {/* Office */}
//                         <div className="flex gap-5 items-start">
//                             <div className="w-14 h-14 bg-neutral-900 rounded-xl flex items-center justify-center flex-shrink-0">
//                                 <span className="material-symbols-outlined text-white">location_on</span>
//                             </div>
//                             <div>
//                                 <p className="text-xs font-bold uppercase tracking-widest text-neutral-500 mb-1">Office</p>
//                                 <p className="text-white font-medium mb-1">Visit or refer us</p>
//                                 <p className="text-neutral-400 text-sm leading-relaxed">{SITE_CONFIG.contact.address}</p>
//                                 <a href="#" className="inline-flex items-center gap-1 text-xs font-semibold text-neutral-200 mt-2 hover:text-blue-400 transition-colors">
//                                     Get directions →
//                                 </a>
//                             </div>
//                         </div>

//                         {/* Phone */}
//                         <div className="flex gap-5 items-start">
//                             <div className="w-14 h-14 bg-neutral-900 rounded-xl flex items-center justify-center flex-shrink-0">
//                                 <span className="material-symbols-outlined text-white">phone</span>
//                             </div>
//                             <div>
//                                 <p className="text-xs font-bold uppercase tracking-widest text-neutral-500 mb-1">Phone</p>
//                                 <p className="text-white font-medium mb-1">Speak to our team for support</p>
//                                 <p className="text-neutral-400 text-sm">{SITE_CONFIG.contact.phone}</p>
//                                 <a href={`tel:${SITE_CONFIG.contact.phone}`} className="inline-flex items-center gap-1 text-xs font-semibold text-neutral-200 mt-2 hover:text-blue-400 transition-colors">
//                                     Call now →
//                                 </a>
//                             </div>
//                         </div>

//                         {/* Email */}
//                         <div className="flex gap-5 items-start">
//                             <div className="w-14 h-14 bg-neutral-900 rounded-xl flex items-center justify-center flex-shrink-0">
//                                 <span className="material-symbols-outlined text-white">mail</span>
//                             </div>
//                             <div>
//                                 <p className="text-xs font-bold uppercase tracking-widest text-neutral-500 mb-1">Email</p>
//                                 <p className="text-white font-medium mb-1">We'll respond and get in touch directly</p>
//                                 <p className="text-neutral-400 text-sm">{SITE_CONFIG.contact.email}</p>
//                                 <a
//                                     href={`mailto:${SITE_CONFIG.contact.email}`}
//                                     className="inline-flex items-center gap-2 mt-4 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-colors"
//                                 >
//                                     ✉ Send us an email
//                                 </a>
//                             </div>
//                         </div>
//                     </div>
//                 </div>
//             </section>

//         </div>
//     );
// };

// export default Home;