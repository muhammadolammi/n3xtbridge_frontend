import React, { useEffect, useState } from 'react';
// import { SITE_CONFIG } from '../constants/content';
// import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { BrandLoader, MENUSECTIONTOHASH, scrollToSection } from '../components/resusable';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    Wifi,
    Shield,
    Camera,
    Code2,
    Globe,
    Server,
    MonitorSmartphone,
    Network,
    Lock,
    Radio,
    Briefcase
} from 'lucide-react';
import type { ServiceCategory } from '../models/model';

const ICON_MAP: Record<string, React.ElementType> = {
    Wifi,
    Shield,
    Camera,
    Code2,
    Globe,
    Server,
    MonitorSmartphone,
    Network,
    Lock,
    Radio,
    Briefcase,
};


const WhyCard: React.FC<{
    title: string;
    desc: string;
    icon: React.ReactNode;
}> = ({ title, desc, icon }) => (
    <div className="bg-transparent rounded-xl p-8 lg:p-12 flex flex-col items-center gap-4">

        <div className="w-20 h-20 flex items-center justify-center text-[#22D3EE]">

            <svg
                className="w-16 h-16"
                viewBox="0 0 64 64"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
            >
                <circle
                    cx="32"
                    cy="32"
                    r="28"
                    stroke="currentColor"
                    strokeWidth="3.5"
                    fill="none"
                />

                {icon}

            </svg>
        </div>

        <div className=" font-bold text-[25px] lg:text-[28px] h-20 text-secondary ">
            {title}
        </div>

        <div className=" text-[13px] lg:text-[16px] text-[#1f2937] leading-relaxed">
            {desc}
        </div>
    </div>
);

const ContactItem: React.FC<{ label: string, value: string, detail: string, linkText: string, linkHref: string, icon: React.ReactNode }> = ({ label, value, detail, linkText, linkHref, icon }) => (
    <div className="flex flex-col gap-4">
        <div className="w-14 h-14 bg-primary rounded-xl flex items-center justify-center shrink-0">
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="#E2E2E2" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                {icon}
            </svg>
        </div>
        <div>
            <div className="flex flex-col gap-1">

                <div className="text-[13px] font-semibold uppercase tracking-wide text-primary/80">
                    {label}
                </div>

                <div className="text-[18px] lg:text-[20px] font-semibold text-secondary leading-tight">
                    {value}
                </div>

                <div className="text-[14px] text-[#64748B] leading-relaxed max-w-[320px]">
                    {detail}
                </div>

                <a
                    href={linkHref}
                    className="mt-1 inline-flex items-center gap-1 text-[13px] font-semibold text-primary hover:text-accent transition-colors duration-200"
                >
                    {linkText}
                </a>

            </div>
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









const Home: React.FC = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    // const [isScrolled, setIsScrolled] = useState(false);
    // const [services, setServices] = useState<Service[]>([]);
    const [serviceCategories, setServiceCategories] = useState<ServiceCategory[]>([]);

    const [loading, setLoading] = useState(true);
    const { user, logout } = useAuth();
    const navigate = useNavigate()




    useEffect(() => {
        const fetchServices = async () => {
            try {
                // TODO fetch all categories here instead
                const res = await api.get('/categories/services');
                setServiceCategories(res.data.service_categories || []);
            } catch (err) {
                console.error('Failed to fetch landing categories', err);
            } finally {
                setLoading(false);
            }
        };
        fetchServices();
    }, []);



    if (loading) {
        return <BrandLoader />;
    }

    // console.log(services)-
    return (
        <div className="bg-background text-text font-['Inter'] overflow-x-hidden selection:bg-[#0046FB]/30">


            {/* MOBILE MENU */}
            <div className={`${isMenuOpen ? 'flex' : 'hidden'} flex-col bg-background border-t border-[#222] fixed top-16 left-0 right-0 z-[99] py-4`}>
                {['Home', 'About Us', 'Services'].map((section) => (
                    <button
                        key={section}
                        onClick={() => scrollToSection(MENUSECTIONTOHASH[section], setIsMenuOpen)}
                        className="font-['Manrope'] text-[17px] font-medium text-left px-8 py-3.5 border-b border-[#111] hover:bg-[#111]"
                    >
                        {section.charAt(0).toUpperCase() + section.slice(1)}
                    </button>
                ))}
                {user && (<button onClick={() => navigate("/dashboard")} className="font-['Manrope'] text-[17px] font-medium text-left px-8 py-3.5 border-b border-[#111] hover:bg-[#111]">Dashboard</button>
                )}
                {!user && (<button onClick={() => navigate("/signin")} className="font-['Manrope'] text-[17px] font-medium text-left px-8 py-3.5 border-b border-[#111] hover:bg-[#111]">Sign In</button>
                )}
                <button
                    onClick={() => scrollToSection('contact', setIsMenuOpen)}
                    className="bg-[#0046FB] text-white mx-6 my-3 py-3.5 rounded font-semibold"
                >
                    Contact Us
                </button>
                {user && (< button
                    onClick={() => logout()}
                    className="bg-[#0046FB] text-white mx-6 my-3 py-3.5 rounded font-semibold"
                >
                    Sign Out
                </button>)}

            </div>

            {/* HERO */}
            <section id="hero" className="min-h-screen grid grid-cols-1 lg:grid-cols-2 items-center px-6 md:px-12 lg:px-20 py-[120px] relative overflow-hidden gap-10">
                <div className="absolute w-[300px] h-[140px] bg-[#0046FB] blur-[180px] rounded-full opacity-35 top-[55%] -left-[8%] pointer-events-none"></div>
                <div className="absolute w-[300px] h-[140px] bg-[#0046FB] blur-[180px] rounded-full opacity-25 top-[30%] right-[5%] pointer-events-none"></div>

                <div className="relative z-[2] flex flex-col items-center lg:items-start text-center lg:text-left">
                    <h1 className=" font-medium text-[52px] md:text-[72px] leading-[1.15] mb-6 text-primary">
                        Innovative Tech Solutions for Your Business
                    </h1>
                    <p className=" text-[15px] md:text-[1.4vw] lg:text-[18px] text-[#1f2937] leading-relaxed max-w-[520px] mb-10 ">
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
                    <button onClick={() => scrollToSection('contact', setIsMenuOpen)} className=" items-center  bg-primary text-white  px-7 py-5 hover:opacity-85 rounded-full">
                        Get a Free Consultation
                    </button>
                </div>

                <div className="hidden lg:flex relative z-[2] justify-center items-center">
                    <div className="relative w-full max-w-[560px]">
                        <HeroCameraSvg />
                    </div>
                </div>
            </section>



            {/* WHY CHOOSE */}
            <section id="why" className="px-6 md:px-20 py-24 text-center">
                <h2 className=" font-bold text-[28px] md:text-[3.5vw] lg:text-[56px] mb-12 leading-tight text-primary " >Why Choose N3xtbridge Holdings</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 max-w-[1100px] mx-auto">
                    <WhyCard
                        title="Unmatched Reliability"
                        desc="Our systems are built on architectural integrity, ensuring your business stays operational 24/7 with zero compromise on quality."
                        icon={<path d="M20,33 28,41 44,24" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />}
                    />
                    <WhyCard
                        title="Practical Innovation"
                        desc="We don't just use technology for its own sake. We implement cutting-edge solutions that solve specific, tangible business challenges."
                        icon={<path d="M16 52c0-8.837 7.163-16 16-16s16 7.163 16 16" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" />}
                    />
                    <WhyCard
                        title="Technical Expertise"
                        desc="Our multi-disciplinary team combines physical hardware mastery with advanced software engineering capabilities."
                        icon={<path d="M32 8 L54 18 L54 34 C54 46 44 56 32 60 C20 56 10 46 10 34 L10 18 Z" stroke="currentColor" strokeWidth="3.5" strokeLinejoin="round" />}
                    />
                </div>
            </section>



            {/* <ServicesSection services={services} /> */}
            <section id="services" className="px-6 md:px-20 py-24">

                {/* HEADER */}
                <div className="mb-16">
                    {/* <span className="text-primary font-semibold tracking-[0.25em] text-xs uppercase mb-4 block">
                        Categories
                    </span> */}

                    <h2 className="font-medium text-[36px] md:text-[5vw] lg:text-[52px] leading-[1.1] text-secondary">
                        Explore Our <span className="text-primary">Solutions</span>
                    </h2>
                </div>

                {/* CATEGORY GRID */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">

                    {serviceCategories.map((category) => {

                        const Icon =
                            ICON_MAP[category.icon] || Briefcase;

                        return (
                            <Link
                                key={category.id}
                                to={`/services?category=${category.slug}`}
                                className="group bg-white border border-slate-200 rounded-3xl p-8 hover:border-primary/20 hover:shadow-xl transition-all duration-300"
                            >

                                {/* TOP */}
                                <div className="flex items-start justify-between mb-8">

                                    <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                                        <Icon className="w-7 h-7" />
                                    </div>

                                    <div className="text-primary group-hover:translate-x-1 transition-transform">
                                        ↗
                                    </div>
                                </div>

                                {/* TITLE */}
                                <h3 className="text-2xl font-semibold text-secondary mb-3">
                                    {category.name}
                                </h3>

                                {/* DESC */}
                                <p className="text-[#64748B] leading-relaxed mb-6">
                                    {category.description}
                                </p>

                                {/* FOOTER */}
                                <div className="flex items-center justify-between">

                                    <span className="text-sm text-primary font-medium">
                                        {category.service_count} services
                                    </span>

                                    <span className="text-sm text-secondary/60 group-hover:text-primary transition-colors">
                                        Explore category
                                    </span>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            </section>

            {/* CTA SECTION */}
            {/* <section className="px-6 md:px-20 py-30 text-center relative overflow-hidden">
                <div className="absolute w-[300px] h-[140px] bg-[#0046FB] blur-[200px] rounded-full opacity-30 top-1/2 -right-[5%] pointer-events-none"></div>
                <div className="absolute w-[300px] h-[140px] bg-[#0046FB] blur-[200px] rounded-full opacity-30 bottom-1/4 -left-[5%] pointer-events-none"></div>
                <h2 className=" font-medium text-[28px] md:text-[4vw] lg:text-[64px] max-w-[700px] mx-auto mb-10 leading-tight relative z-[2] text-primary">
                    Ready to Transform Your Business with Seamless IT Solutions?
                </h2>
                <button onClick={() => scrollToSection('contact', setIsMenuOpen)} className="relative z-[2] inline-flex items-center gap-2.5 bg-primary text-white font-semibold px-7 py-5 hover:opacity-85 rounded-full">
                    Get a Free Consultation
                </button>
            </section> */}

            {/* CONTACT */}
            <section id="contact" className="px-6 md:px-20 py-20 ">
                <h2 className=" font-medium text-[24px] md:text-[3vw] lg:text-4xl  mb-2 tracking-[-1.5px] text-primary">Contact us</h2>
                <p className=" text-base text-text mb-14">Ready to Transform Your Business with Seamless IT Solutions?</p>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
                    <ContactItem
                        label="Office"
                        value="Visit or refer us to us"
                        detail="11, Paul Amune Flat 2, Phase 1, Gwagwalada, Abuja, Nigeria"
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
