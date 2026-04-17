import React from 'react';

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