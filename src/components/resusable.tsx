import React, { useState } from 'react';
import type { Service } from '../models/model';
import { Link } from 'react-router-dom';
import { QuoteRequestModal } from './QuoteRequestModal';

export const scrollToSection = (id: string, setIsMenuOpen?: React.Dispatch<React.SetStateAction<boolean>>) => {
    const element = document.getElementById(id);
    if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
        if (setIsMenuOpen) { setIsMenuOpen(false); }
    }
};

export const BrandLoader = () => {
    return (
        <div className="fixed inset-0 z-[200] bg-black flex flex-col items-center justify-center">
            <div className="relative">
                {/* Pulsing Background Glow */}
                <div className="absolute inset-0 bg-[#0046FB] blur-[40px] rounded-full opacity-20 animate-pulse"></div>

                {/* Brand Text */}
                <div className="relative font-['Inter'] font-semibold text-3xl tracking-tighter text-white animate-bounce">
                    N3xtbridge
                </div>
            </div>

            {/* Subtle Loading Line */}
            <div className="mt-8 w-48 h-[1px] bg-[#1A1A1A] overflow-hidden">
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
        <section id="services" className="px-6 md:px-20 py-24 bg-black">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-20 gap-8">
                <div>
                    <span className="text-[#0046FB] font-bold tracking-[0.2em] text-sm mb-4 block">WHAT WE DO</span>
                    <h2 className="font-['Manrope'] font-medium text-[36px] md:text-[5vw] lg:text-[52px] leading-[1.1] text-white">
                        Providing Seamless <br /><span className="text-[#0046FB]">ICT Solutions</span>
                    </h2>
                </div>
                <Link to={"/services"} className="bg-[#0046FB] text-white font-['Manrope'] font-semibold px-10 py-5 hover:bg-blue-700 transition-all shrink-0">
                    Explore All Services &nbsp;↗
                </Link>
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
                                <button
                                    onClick={() => {
                                        setQrService(service)
                                        setIsQuoteReqModalOpen(true)
                                    }
                                    }
                                    className="bg-[#0046FB] text-white px-6 md:px-8 py-3.5 md:py-4 font-bold text-sm hover:scale-105 transition-transform active:scale-95">
                                    Get a Quote
                                </button>

                                {/* WhatsApp Chat Button */}
                                <a
                                    href={`https://wa.me/2349139971163?text=${encodeURIComponent(`Hello N3xtbridge Sales, I'm interested in ${service.name}`)}`}
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