import React from 'react';

// --- Types for Reusability ---
interface ValueProps {
    icon: string;
    title: string;
    description: string;
}

interface LeaderProps {
    name: string;
    role: string;
    description: string;
    image: string;
}

const AboutUs: React.FC = () => {
    return (
        <main className="pt-16">
            {/* Hero Section */}
            <section className="relative min-h-[716px] flex items-center overflow-hidden bg-inverse-surface py-20 px-6 md:px-12">
                <div className="absolute inset-0 blueprint-grid z-0 opacity-10"></div>
                <div className="absolute inset-0 z-0 opacity-40">
                    <img
                        alt="Data transmission background"
                        className="w-full h-full object-cover"
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuBlySwkxjpWKDRzcTiYoL5y-SKTKoUIyvy1bqb6ywh7_ma8ef9UHUXx39dbHHbWnYejxUKR7nTSUc7MatAqveKb0NbzuBbQ02E8sDYjfbIO3qIiQ5rYoccJWOAY4wzDKO5HTAKTt-72oew32gRBQWEmqaNZ0vJYn7daUHzXey-IltTy3vBSJ5JBt1f_UgZgt9g6NLxYIT4Epw9LOP6Mjg-ZtJQ4EXvxQR2D5beHMYtdXoSsmGZbZKIHP33-EC-796TGnmoM2oA-d59V"
                    />
                </div>
                <div className="max-w-7xl mx-auto relative z-10 w-full">
                    <div className="max-w-3xl">
                        <span className="inline-block px-3 py-1 bg-primary text-white text-[10px] font-bold tracking-[0.2em] uppercase rounded mb-6">
                            Established Excellence
                        </span>
                        <h1 className="text-5xl md:text-7xl font-extrabold text-white mb-8 leading-[1.1]">
                            Pioneering Tech Solutions for a Better Tomorrow
                        </h1>
                        <p className="text-xl text-slate-300 font-light leading-relaxed max-w-2xl">
                            N3xtbridge Holdings bridges the gap between complex physical infrastructure and agile software intelligence. We build the foundations of the future through meticulous architectural integrity.
                        </p>
                    </div>
                </div>
            </section>

            {/* Our Story Section */}
            <section className="py-24 px-6 md:px-12 bg-surface">
                <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                    <div className="order-2 lg:order-1">
                        <div className="inline-block mb-4 h-1 w-12 bg-primary"></div>
                        <h2 className="text-4xl font-bold text-on-surface mb-8">The Nexus Logic Legacy</h2>
                        <div className="space-y-6 text-on-surface-variant leading-relaxed text-lg">
                            <p>
                                N3xtbridge Holdings began with a singular observation: the digital and physical worlds were drifting apart. While software evolved at lightning speed, the physical infrastructure supporting it often remained static and fragile.
                            </p>
                            <p>
                                Our journey started in a small workshop dedicated to high-precision hardware installation. As we mastered the physical, we realized that true innovation required a unified approach—what we now call "Nexus Logic."
                            </p>
                            <p>
                                Today, we provide a holistic ecosystem where architectural integrity meets technical excellence. Connectivity is the lifeblood of modern enterprise.
                            </p>
                        </div>
                    </div>
                    <div className="order-1 lg:order-2 relative group">
                        <div className="absolute -inset-4 bg-surface-container-low rounded-xl -rotate-2 transition-transform group-hover:rotate-0"></div>
                        <img
                            alt="Architectural model"
                            className="relative z-10 w-full h-[500px] object-cover rounded-xl shadow-xl"
                            src="https://lh3.googleusercontent.com/aida-public/AB6AXuBCLLVOnVfLMyNhEOvsD64TirYwX97_FMipf0fmL3kL07xGYMaTnzFPAUoQr9StlRTK8OvzppIv2cOYiH9-x69P3DZq5CVYsrA4ToKiYeyzybQiyDayJ2bo5cD1k2dEQC_YoxoyJ4-P_nvUBPNVLabKs_P7ODcAqIOxKrzAg53fojO8B37RG9iEoR6pX2GEx4JybfMg66RPZdqMofsCzviR7zX47zWsKnkLKtpPJ5e0peY4Ho87ef5nKgyM6vS_RpqxOym3LRYdJjSM"
                        />
                    </div>
                </div>
            </section>

            {/* Core Values Section */}
            <section className="py-24 px-6 md:px-12 bg-surface-container-low">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-on-surface">Guided by Integrity</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <CoreValue
                            icon="lightbulb"
                            title="Innovation"
                            description="Constant evolution of methodology to meet the shifting demands of the global tech landscape."
                        />
                        <CoreValue
                            icon="verified_user"
                            title="Reliability"
                            description="Systems built on a bedrock of stability, ensuring 99.9% uptime and unwavering support."
                        />
                        <CoreValue
                            icon="account_balance"
                            title="Integrity"
                            description="Transparent operations and architectural standards that never compromise on quality."
                        />
                        <CoreValue
                            icon="engineering"
                            title="Expertise"
                            description="A multidisciplinary team blending physical mastery with advanced software engineering."
                        />
                    </div>
                </div>
            </section>

            {/* Leadership Section */}
            <section className="py-24 px-6 md:px-12 bg-surface">
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8">
                        <div className="max-w-2xl">
                            <h2 className="text-4xl font-bold text-on-surface mb-4">The Minds Behind the Bridge</h2>
                            <p className="text-on-surface-variant text-lg">Our leadership unites decades of experience in structural hardware and cloud architecture.</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <LeaderCard
                            name="Marcus Thorne"
                            role="Chief Hardware Architect"
                            description="Specializing in data center physical integrity and global scale infrastructure."
                            image="https://lh3.googleusercontent.com/aida-public/AB6AXuBxpqTghSIA6cFI7Y9gY6kc2ut5nHv9--SYwz5vkBlrrTZXXv-OGe0zmxWqpXdHxIT7S8ynytZFIWpUSIqDL8WZK66L6INXYlimhyK2ABvXz0R_MG_MJAuzYF8-D0Bu1cZF0JOl6ySmbhAvznhvBy5GxzRAD6TGnq16hTDnQd0pBQ946Gh35pWD-vg8Sr1Dm19Rt_3e6Nm_nyKbMmwsfzl3XoVc_86aal5eZI_leQyNTz9tXCvR7jP4eUV3BLa2rDumVrHqf77yZduQ"
                        />
                        <LeaderCard
                            name="Elena Vance"
                            role="Director of Software Systems"
                            description="Visionary in distributed systems and adaptive software environments."
                            image="https://lh3.googleusercontent.com/aida-public/AB6AXuCQuBupE4Jk8nOhRaGJ_o-9xlkPZUnr3qgplJkIIzCeAlR2nmrN1M7KHcZBEU-jmP3JbjjGeZMsY721gFAWAE8CDglFoqXCKfo3aL96-fFtd9VU7UVwg9OSVVk5kS5nAJ-AjG9BWTyPPaTqc_-eqjkMkKEllZIlde82ZdQ5yTqDTSWUWwDNrg9gQedW4VA_Y3SIZXQCz_Wp7gQjpQwc_CeVs8kDuvNllmCNqsPetr6ioeqVWrePl3Dbi7sCUI94uV-G7A4LXvlZ7h3w"
                        />
                        <LeaderCard
                            name="Julian Chen"
                            role="Head of Strategic Operations"
                            description="Bridging the operational divide between physical assets and digital services."
                            image="https://lh3.googleusercontent.com/aida-public/AB6AXuBcEySDvuqi3zp_w8HZguc33Hp0qxV5Wk88CHob5_iw6aNHFDwcmYsAq8ndH9grBra51ZKDG41c9DU-fovdp2NpiYWrAicSn69V9MWjyfCtmPNTKb0ORZ28zBFP909rIN-Gi-gVY3uDx8XGCxL25emjUzjUGuQjLQQ2BTacxg2bCAz-TqRi0jX93M2cGjz44IweiJVx9_daWfqGV_1CkgoO6DvsPckc3fFWtfXtxKxyeXK38cIXsuS5qEzQF7ZCKF03zdYhq7XV4yl5"
                        />
                    </div>
                </div>
            </section>

            {/* Impact Stats */}
            <section className="py-24 bg-inverse-surface text-white">
                <div className="max-w-7xl mx-auto px-6 md:px-12">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
                        <StatItem number="15+" label="Years Expertise" />
                        <StatItem number="500+" label="Projects Completed" />
                        <StatItem number="99.9%" label="Client Satisfaction" />
                    </div>
                </div>
            </section>
        </main>
    );
};

// --- Sub-Components (Internal for this page) ---

const CoreValue: React.FC<ValueProps> = ({ icon, title, description }) => (
    <div className="bg-surface-container-lowest p-8 rounded-xl transition-all duration-300 hover:-translate-y-2 shadow-sm">
        <div className="w-12 h-12 bg-secondary-container text-primary flex items-center justify-center rounded-full mb-6">
            <span className="material-symbols-outlined">{icon}</span>
        </div>
        <h3 className="text-xl font-bold mb-3 text-on-surface">{title}</h3>
        <p className="text-on-surface-variant text-sm leading-relaxed">{description}</p>
    </div>
);

const LeaderCard: React.FC<LeaderProps> = ({ name, role, description, image }) => (
    <div className="group">
        <div className="aspect-[3/4] overflow-hidden rounded-lg mb-6 bg-surface-container shadow-sm">
            <img
                alt={name}
                className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
                src={image}
            />
        </div>
        <h4 className="text-xl font-bold mb-1 text-on-surface">{name}</h4>
        <p className="text-primary font-medium text-sm tracking-widest uppercase mb-4">{role}</p>
        <p className="text-on-surface-variant text-sm">{description}</p>
    </div>
);

const StatItem: React.FC<{ number: string; label: string }> = ({ number, label }) => (
    <div className="space-y-2">
        <div className="text-5xl md:text-6xl font-extrabold tracking-tighter">{number}</div>
        <div className="text-primary-fixed-dim text-sm font-bold tracking-[0.2em] uppercase">{label}</div>
        <div className="h-0.5 w-12 bg-primary mx-auto mt-4"></div>
    </div>
);

export default AboutUs;