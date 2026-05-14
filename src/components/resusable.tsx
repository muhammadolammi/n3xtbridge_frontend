import React, { useState } from 'react';
import type { Service } from '../models/model';
import { Link } from 'react-router-dom';
import { QuoteRequestModal } from './QuoteRequestModal';
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

export const scrollToSection = (id: string, setIsMenuOpen?: React.Dispatch<React.SetStateAction<boolean>>) => {
    const element = document.getElementById(id);
    if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
        if (setIsMenuOpen) { setIsMenuOpen(false); }
    }
};

export const BrandLoader = () => {
    return (
        <div className="fixed inset-0 z-[200] bg-background flex flex-col items-center justify-center">
            <div className="relative">
                {/* Pulsing Background Glow */}
                <div className="absolute inset-0 bg-[#0046FB] blur-[40px] rounded-full opacity-20 animate-pulse"></div>

                {/* Brand Text */}
                <div className="relative  font-semibold text-3xl tracking-tighter text-text animate-bounce">
                    N3xtbridge
                </div>
            </div>

            {/* Subtle Loading Line */}
            <div className="mt-8 w-48 h-[1px] bg-[#22D3EE] overflow-hidden">
                <div className="h-full bg-[#0046FB] w-1/3 animate-[loading_1.5s_infinite_ease-in-out]"></div>
            </div>

            <style>{`
        @keyframes loading {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(300%); }
        }
      `}</style>
        </div>
    );
};


export const MENUSECTIONTOHASH: Record<string, string> = {
    "Home": 'hero',
    'About Us': "why",
    'Services': "services"
}

export const ServicesSection = ({ services }: { services: Service[] }) => {
    const [isQuoteReqModalOpen, setIsQuoteReqModalOpen] = useState(false);
    const [qrservice, setQrService] = useState<Service | null>(null);

    return (
        <section id="services" className="px-6 md:px-20 py-24 bg-background text-text ">

            {/* HEADER */}
            <div className=" flex flex-col md:flex-row md:items-end justify-between mb-20 gap-8">

                <div>
                    <span className="text-primary font-semibold tracking-[0.25em] text-xs uppercase mb-4 block">
                        What we do
                    </span>

                    <h2 className="font-medium text-[36px] md:text-[5vw] lg:text-[52px] leading-[1.1] text-secondary">
                        Providing Seamless <br />
                        <span className="text-primary">ICT Solutions</span>
                    </h2>
                </div>

                <Link
                    to={"/services"}
                    className="bg-primary text-white font-semibold px-8 py-4 rounded-xl hover:bg-primary transition-all duration-300"
                >
                    Explore All Services →
                </Link>
            </div>

            {/* SERVICES LIST */}
            <div className="flex flex-col gap-16">

                {services.map((service, index) => (
                    <div
                        key={service.id}
                        className="group grid grid-cols-1 lg:grid-cols-2 bg-white border border-[#E2E8F0] rounded-3xl overflow-hidden hover:shadow-lg transition-all duration-500"
                    >

                        {/* IMAGE */}
                        <div className="relative min-h-[320px] lg:min-h-[420px] overflow-hidden order-first lg:order-none">

                            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent z-10 lg:hidden" />

                            <img
                                src={service.image}
                                alt={service.name}
                                className="absolute inset-0 w-full h-full object-cover grayscale-[20%] group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700"
                            />
                        </div>

                        {/* TEXT */}
                        <div className={`p-8 md:p-12 lg:p-20 flex flex-col justify-center ${index % 2 !== 0 ? 'lg:order-first' : 'lg:order-last'}`}>

                            {/* TAG */}
                            <div className="flex items-center gap-3 mb-5">
                                <div className="w-10 h-[2px] bg-primary" />
                                <span className="text-primary text-xs font-semibold tracking-widest uppercase">
                                    {service.tags ?? "Service"}
                                </span>
                            </div>

                            {/* TITLE */}
                            <h3 className="font-semibold text-2xl md:text-3xl lg:text-5xl mb-6 text-secondary leading-tight">
                                {service.name}
                            </h3>

                            {/* DESCRIPTION */}
                            <p className="text-base md:text-lg text-[#64748B] leading-relaxed mb-10 max-w-md">
                                {service.description}
                            </p>

                            {/* PRICE */}
                            {service.min_price.trim() !== `''` && service.min_price.trim() !== `""` && service.min_price.trim() !== "" && (
                                <div className="mb-8 flex items-center gap-2">
                                    <span className="text-[#94A3B8] text-sm uppercase tracking-wide">
                                        Starting at
                                    </span>
                                    <span className="text-secondary font-bold text-lg">
                                        ₦{new Intl.NumberFormat('en-NG').format(Number(service.min_price))}
                                    </span>
                                </div>
                            )}

                            {/* ACTIONS */}
                            <div className="flex flex-wrap gap-4 items-center">

                                {/* PRIMARY CTA */}
                                <button
                                    onClick={() => {
                                        setQrService(service);
                                        setIsQuoteReqModalOpen(true);
                                    }}
                                    className="bg-primary text-white px-6 py-3.5 rounded-xl font-semibold hover:bg-secondary transition-all duration-300 hover:scale-[1.02] active:scale-95"
                                >
                                    Get a Quote
                                </button>

                                {/* WHATSAPP */}
                                <a
                                    href={`https://wa.me/2349139971163?text=${encodeURIComponent(`Hello N3xtbridge Sales, I'm interested in ${service.name}`)}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2 px-6 py-3.5 rounded-xl font-semibold text-primary border border-primary/20 hover:bg-primary hover:text-white transition-all duration-300"
                                >
                                    WhatsApp Chat
                                </a>

                                {/* ACCENT LINK */}
                                {/* <button className="text-accent font-semibold text-sm hover:underline flex items-center gap-1">
                                    View details <span className="text-accent">→</span>
                                </button> */}

                            </div>
                        </div>
                    </div>
                ))}

                {/* MODAL */}
                {isQuoteReqModalOpen && qrservice && (
                    <QuoteRequestModal
                        serviceId={qrservice.id}
                        serviceName={qrservice.name}
                        onClose={() => setIsQuoteReqModalOpen(false)}
                    />
                )}
            </div>
        </section>
    );
};
export const uploadFileToR2 = async (
    uploadUrl: string,
    file: File | Blob,
    // onProgress: (percent: number) => void
) => {

    return new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open("PUT", uploadUrl);
        // xhr.upload.onprogress = (e) => {
        //     if (e.lengthComputable) {
        //         const percent = Math.round((e.loaded / e.total) * 100);
        //         onProgress(percent);
        //     }
        // };
        xhr.onload = () => {
            if (xhr.status === 200) resolve();
            else reject(new Error(`Upload failed: ${xhr.status}`));
        };
        xhr.onerror = () => reject(new Error("Network error"));
        xhr.send(file);
    });
};


export const ICON_MAP: Record<string, React.ElementType> = {
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

export const handleGoogleLogin = () => {
    const backendUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";
    // Redirect the entire window to the backend
    window.location.href = `${backendUrl}/auth/google`;
};

export const GoogleButton = ({ onClick, text }: {
    onClick: () => void;
    text: string;
}) => {
    return (
        <button
            onClick={onClick}
            className="group relative flex h-10 w-auto min-w-max max-w-[400px] items-center justify-between overflow-hidden rounded-md border border-[#747775] bg-white px-3 text-center font-['Roboto',_arial,_sans-serif] text-sm tracking-[0.25px] text-[#1f1f1f] transition-all duration-[218ms] hover:shadow-[0_1px_2px_0_rgba(60,64,67,0.30),0_1px_3px_1px_rgba(60,64,67,0.15)] focus:outline-none active:bg-white disabled:cursor-default disabled:bg-white/40 disabled:border-[#1f1f1f1f]"
        >
            {/* State Overlay (Hover/Focus effect) */}
            <div className="absolute inset-0 bg-[#303030] opacity-0 transition-opacity duration-[218ms] group-hover:opacity-[0.08] group-focus:opacity-[0.12] group-active:opacity-[0.12]" />

            <div className="relative flex w-full items-center justify-between">
                {/* Google Icon */}
                <div className="mr-2.5 h-5 w-5 min-w-[20px] group-disabled:opacity-40">
                    <svg
                        version="1.1"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 48 48"
                        className="block"
                    >
                        <path
                            fill="#EA4335"
                            d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
                        />
                        <path
                            fill="#4285F4"
                            d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
                        />
                        <path
                            fill="#FBBC05"
                            d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
                        />
                        <path
                            fill="#34A853"
                            d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
                        />
                        <path fill="none" d="M0 0h48v48H0z" />
                    </svg>
                </div>

                {/* Button Text */}
                <span className="flex-grow overflow-hidden text-ellipsis whitespace-nowrap font-medium group-disabled:opacity-40">
                    {text}
                </span>
            </div>
        </button>
    );
};

