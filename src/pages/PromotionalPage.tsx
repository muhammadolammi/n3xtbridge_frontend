


const STEPS = [
    {
        id: "01",
        icon: "payments",
        title: "Join for $1",
        description: "Secure your slot in our deployment queue with a symbolic $1 commitment. This locks in your 'Service Fee: $0' status for the life of your hardware.",
        highlight: false,
    },
    {
        id: "02",
        icon: "architecture",
        title: "Choose Your Solution",
        description: "Select from enterprise-grade security cameras, servers, or web assets. You only pay for the high-quality hardware/infrastructure at wholesale rates.",
        highlight: true,
    },
    {
        id: "03",
        icon: "engineering",
        title: "We Install & Manage",
        description: "Our engineers handle the full deployment, 24/7 monitoring, and ongoing maintenance. Total service cost to you: $0.00 per month.",
        highlight: false,
    }
];

const SERVICES = [
    {
        title: "Security Camera Systems",
        tag: "4K AI VISION",
        tagColor: "bg-tertiary-fixed text-on-tertiary-fixed",
        description: "Full perimeter surveillance with AI-driven threat detection. Professional installation and 24/7 monitoring included.",
        image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCrR4a1aaq0ALP_h50OeAjo5aCXYcapnq4N8dOx1MtugEB6be6EmJxB1BaCXnKg-mtPPgjMbusKf4fiNPWK48DX_cxE-VnFIkZIxMRAJhwRPniv2IT7ZYGYGCFDa3OjWexLPq4NfCNICJwc5ogl4Q82aIHOUA9_-xJeWd9pYPqi5JlfVJIT3uKfzFfUVrGAOLA-4RReIkoWgAhiQJQPLzYK94k-CTQyxTeB7NJ6DoNelao4uzGhrLcWCQOz2-JlaxmQ-co_YhtFBILR",
        fee: "$0.00"
    },
    {
        title: "Web & Cloud Assets",
        tag: "ENTERPRISE",
        tagColor: "bg-secondary-container text-on-secondary-container",
        description: "Custom web development and cloud infrastructure management. Performance optimization and security hardening included.",
        image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCqqCzXl1icgKLGXPrNcjElY7HOS9QhLMgaFscAdosg55xt8e9GgvgOQSMtQqFATb8r4Rdb530KWCWN4O-WCvZPxSrKn9IDtI94b_xBUubhctRIpK_09HbzrnkrXgwS7HA6Lp-mMcMQ9nKKxgM9nvsOGnJdCP8AklhnXM4o-8BBvxftR35du5NDO1fNbsyhl0L0Bv59i8I89SCGGJIomDh6SwaXHS0sa9FlJac9Yi2iOd4Apkon-rTF8wg-AtnFZg0BXTZ66AzdRPIF",
        fee: "$0.00"
    },
    {
        title: "Managed IT Support",
        tag: "24/7 HELPDESK",
        tagColor: "bg-primary-fixed text-on-primary-fixed",
        description: "End-to-end management of your office network, devices, and cybersecurity. Infinite scalability with no overhead.",
        image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCSpHHweGpKwdXMKAbjkKkSpL_w-TN-Roe2AC40LYkORkcc-NGQlpe5M9mwVH9VeQRkEmRvtoC_ib6hNGiDMKRV57BY4hQsGwTgb0gNN062OfPHb0RfZJlZETWEd7L5cbjR8ftr0foIOv52Xb4nq6HSIYPvevFAzdck79jg2DapLAkIDqeiUv8q4kU4JzYm8yDdZCcfBQYP-XUELEPhOM4v0Iyk2xq-IMQfr9cOP4w3SWTB5k-_-dSJJXp9NLTuUPojz3XhEnYKQdIz",
        fee: "$0.00"
    }
];

const FAQS = [
    {
        question: "Why is the service actually free?",
        answer: "Traditional MSPs charge for labor. We monetize the infrastructure hardware and architectural planning phase. By vertically integrating our supply chain, we can afford to provide ongoing management as a complimentary value-add for our hardware clients."
    },
    {
        question: "What does the $1 fee cover?",
        answer: "The $1 is a commitment fee that triggers our engineering team to review your site requirements and begin your infrastructure design blueprint. It places you in our priority deployment queue."
    },
    {
        question: "Do I own the hardware?",
        answer: "Yes. Unlike \"Hardware-as-a-Service\" where you lease equipment, N3xtbridge clients own their physical assets. Our role is strictly management, maintenance, and security monitoring."
    }
];

const TRUST_BADGES = [
    { icon: "shield_person", label: "SOC2 Type II" },
    { icon: "gpp_maybe", label: "HIPAA Ready" },
    { icon: "encrypted", label: "ISO 27001" },
    { icon: "dns", label: "99.99% Uptime" },
];

// --- Main Component ---

export default function PromotionalPage() {
    return (
        <main className="pt-24 font-sans">
            {/* Hero Section */}
            <section className="relative overflow-hidden min-h-[870px] flex items-center bg-surface">
                <div className="absolute inset-0 blueprint-grid z-0 opacity-30"></div>
                <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
                    <div className="lg:col-span-7">
                        <span className="inline-block px-4 py-1.5 mb-6 text-xs font-bold tracking-widest uppercase bg-secondary-container text-on-secondary-container rounded-full">
                            LIMITED TIME PROMOTION
                        </span>
                        <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-on-background leading-[1.05] mb-8">
                            Get Your Entire <span className="text-primary">IT Infrastructure</span> Managed for Free.
                        </h1>
                        <p className="text-xl md:text-2xl text-on-surface-variant mb-10 max-w-2xl font-medium">
                            Pay only $1 to start. Professional management and security services included at <span className="text-primary font-bold">no monthly fee</span> when you source your hardware through us.
                        </p>
                        <div className="flex flex-col sm:row gap-4">
                            <button className="bg-gradient-to-r from-primary to-primary-container text-on-primary px-10 py-5 rounded-lg text-lg font-bold shadow-xl hover:opacity-90 transition-all transform hover:-translate-y-1">
                                Join for $1 Now
                            </button>
                            <div className="flex items-center gap-4 px-6 text-on-surface-variant font-medium">
                                <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                                SOC2 Compliant Security
                            </div>
                        </div>
                    </div>
                    <div className="lg:col-span-5 relative">
                        <div className="aspect-square bg-surface-container-low rounded-xl overflow-hidden shadow-2xl relative">
                            <img
                                alt="Modern Data Center Infrastructure"
                                className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700"
                                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDgksoceqWCyUHlB1Ia6VlMQN7dfP8gS1L1HW3B1ft4p-NKZAygdIqiYcvzZrQzeS9bY_NlrS1H5b5dqajLR_oPvm74zo6I_xsCHfpE6219ZPPxiLOrFRpIU54laqwlCDEXlsOHeBRkb38TDI8v66a0tXcwyBAiqp55fKmeOnG7JWgIYXG6Y80eVhlR9zbwgjlNT_i87A4u9JXhVb4yIn909riZD__jBrkSMykDuTARj42jnXwGbTXWMRjY7_5AnGmUn7vwN88v2M8F"
                            />
                            <div className="absolute inset-0 bg-primary/10 mix-blend-multiply"></div>
                        </div>
                        <div className="absolute -bottom-6 -left-6 bg-white p-6 rounded-xl shadow-lg border border-outline-variant/15 flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-tertiary-fixed flex items-center justify-center">
                                <span className="material-symbols-outlined text-tertiary">lock</span>
                            </div>
                            <div>
                                <div className="text-sm font-bold text-on-background">Enterprise Security</div>
                                <div className="text-xs text-on-surface-variant">Active Monitoring 24/7</div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* The Offer Explained (Dynamic Mapping) */}
            <section className="py-24 bg-surface-container-low">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="mb-20 text-center">
                        <h2 className="text-4xl font-black tracking-tighter mb-4">A Simple 3-Step Integration</h2>
                        <p className="text-on-surface-variant max-w-xl mx-auto">We've removed the complexity of enterprise IT. Our business model prioritizes your infrastructure performance over service fees.</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-0">
                        {STEPS.map((step) => (
                            <div key={step.id} className={`${step.highlight ? 'bg-surface-container' : 'bg-white'} p-12 relative group`}>
                                <div className="text-7xl font-black text-gray-200 absolute top-8 right-8 group-hover:text-primary/10 transition-colors uppercase">{step.id}</div>
                                <div className="mb-8 w-16 h-16 rounded-lg bg-primary/10 flex items-center justify-center">
                                    <span className="material-symbols-outlined text-primary text-3xl">{step.icon}</span>
                                </div>
                                <h3 className="text-2xl font-bold mb-4">{step.title}</h3>
                                <p className="text-on-surface-variant leading-relaxed">{step.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Services Included (Dynamic Mapping) */}
            <section className="py-24 bg-surface">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
                        <div className="max-w-2xl">
                            <h2 className="text-4xl font-black tracking-tighter mb-4">Infrastructure-as-a-Service</h2>
                            <p className="text-on-surface-variant">Our service catalog covers the full spectrum of modern business operations. All labor and management fees are waived when using N3xtbridge hardware.</p>
                        </div>
                        <div className="text-right">
                            <span className="text-6xl font-black text-primary">$0.00</span>
                            <div className="text-sm font-bold uppercase tracking-widest text-on-surface-variant">Service Fee / MO</div>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {SERVICES.map((service, index) => (
                            <div key={index} className="group bg-white p-8 rounded-xl border border-gray-100 hover:border-primary/30 transition-all shadow-sm">
                                <div className="mb-6 overflow-hidden rounded-lg aspect-video">
                                    <img alt={service.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" src={service.image} />
                                </div>
                                <div className="flex justify-between items-start mb-4">
                                    <h4 className="text-xl font-bold">{service.title}</h4>
                                    <span className={`text-[10px] font-bold px-2 py-1 rounded ${service.tagColor}`}>{service.tag}</span>
                                </div>
                                <p className="text-on-surface-variant text-sm mb-6">{service.description}</p>
                                <div className="pt-6 border-t border-gray-100 flex justify-between items-center">
                                    <span className="text-xs font-bold uppercase tracking-tighter">Monthly Service Fee</span>
                                    <span className="text-primary font-black">{service.fee}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Trust & Security */}
            <section className="py-24 bg-gray-900 text-white">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
                        <div>
                            <div className="flex items-center gap-3 mb-6">
                                <span className="w-12 h-[2px] bg-primary"></span>
                                <span className="text-sm font-bold uppercase tracking-[0.2em] text-primary">Architecture-Grade</span>
                            </div>
                            <h2 className="text-4xl font-black mb-8 leading-tight">Reliability Built into the Foundation.</h2>
                            <p className="text-gray-400 text-lg mb-10 leading-relaxed">
                                "N3xtbridge transformed our facility. We were paying thousands in monthly support retainers. By switching to their hardware model, we eliminated service fees entirely without sacrificing any security or uptime."
                            </p>
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-primary/20"></div>
                                <div>
                                    <div className="font-bold text-white">Marcus Thorne</div>
                                    <div className="text-sm text-gray-400">Director of Infrastructure, Centurion Logistics</div>
                                </div>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            {TRUST_BADGES.map((badge, idx) => (
                                <div key={idx} className="p-8 bg-white/5 rounded-lg flex flex-col items-center justify-center text-center border border-white/10">
                                    <span className="material-symbols-outlined text-4xl mb-4 text-primary">{badge.icon}</span>
                                    <div className="font-bold text-sm">{badge.label}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* FAQ (Dynamic Mapping) */}
            <section className="py-24 bg-surface-container-low">
                <div className="max-w-3xl mx-auto px-6">
                    <h2 className="text-4xl font-black text-center mb-16">Transparency Report (FAQ)</h2>
                    <div className="space-y-6">
                        {FAQS.map((faq, index) => (
                            <div key={index} className="bg-white p-8 rounded-lg shadow-sm border border-gray-100">
                                <h4 className="font-bold text-lg mb-3">{faq.question}</h4>
                                <p className="text-on-surface-variant">{faq.answer}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Final CTA */}
            <section className="py-24 bg-primary text-white relative overflow-hidden">
                <div className="absolute inset-0 blueprint-grid opacity-20 pointer-events-none"></div>
                <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
                    <h2 className="text-5xl font-black tracking-tighter mb-8">Secure Your Slot for $1 — Limited Availability</h2>
                    <p className="text-xl mb-12 opacity-90">Our engineering team can only onboard 5 new enterprise infrastructures per month to ensure architectural integrity. Reserve your slot today.</p>
                    <div className="flex flex-col items-center gap-6">
                        <button className="bg-white text-primary px-12 py-5 rounded-lg text-xl font-black shadow-2xl hover:bg-gray-100 transition-all active:scale-95">
                            Start for $1 Now
                        </button>
                        <div className="flex items-center gap-2 text-sm font-bold opacity-80">
                            <span className="w-2 h-2 rounded-full bg-white animate-pulse"></span>
                            Only 2 Slots Remaining This Month
                        </div>
                    </div>
                </div>
            </section>
        </main>
    );
}
