import React from 'react';

const Home: React.FC = () => {
    return (
        <div className="bg-surface">
            {/* Hero Section */}
            <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden">
                <div className="absolute inset-0 blueprint-grid pointer-events-none opacity-5"></div>
                <div className="max-w-7xl mx-auto px-6 md:px-12 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                    <div className="z-10">
                        <span className="inline-block px-3 py-1 bg-secondary-container text-on-secondary-container text-xs font-bold tracking-widest uppercase rounded-full mb-6">
                            Empowering Digital Transformation
                        </span>
                        <h1 className="text-5xl md:text-7xl font-bold text-on-background tracking-tighter leading-tight mb-6">
                            Innovative Tech <br /> Solutions for <br /> <span className="text-primary italic">Your Business</span>
                        </h1>
                        <p className="text-lg text-on-surface-variant max-w-lg mb-10 leading-relaxed">
                            From state-of-the-art security systems to cutting-edge web development, we empower your digital transformation with high-precision architectural solutions.
                        </p>
                        <div className="flex flex-wrap gap-4">
                            <button className="px-8 py-4 bg-gradient-to-r from-primary to-primary-container text-white rounded-lg font-semibold shadow-lg hover:shadow-primary/20 transition-all">
                                Explore Our Services
                            </button>
                            <button className="px-8 py-4 bg-surface-container-high text-on-secondary-container rounded-lg font-semibold hover:bg-surface-container-highest transition-all">
                                View Portfolio
                            </button>
                        </div>
                    </div>
                    <div className="relative lg:h-[600px] flex items-center justify-center">
                        <div className="absolute -right-20 -top-20 w-80 h-80 bg-primary/10 rounded-full blur-3xl"></div>
                        <div className="relative w-full aspect-square rounded-2xl overflow-hidden shadow-2xl rotate-3 hover:rotate-0 transition-transform duration-700 bg-surface-container-lowest p-4">
                            <img alt="High-tech server environment" className="w-full h-full object-cover rounded-xl" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCuGTC2dFt9_5UOAY1kDQwgwjf0dd00nWhoKUkIFyiQJVoostx0h7t_UUQ1EIY4sAVi0FyKPSe09QbM5Gp_ujTtJrPT_O97mbjUgxYL1RnKa-TJDPWHmzlFi5uVnRM7Ka_-HfxswxuhUyUN85qY-Ieu7N7dJCKscWERHOjksSD2BKHi_d896MsflGNK160sKunRHUyKD7-6lcqsq2pnid6qVk1FxgQz8av_OAOl-AC3Roko_mOiSvwhV88XGaxuSWUErp8Ygvqy6RLM" />
                        </div>
                    </div>
                </div>
            </section>

            {/* Services Section */}
            <section className="py-24 bg-surface-container-low" id="services">
                <div className="max-w-7xl mx-auto px-6 md:px-12">
                    <div className="mb-16 md:flex justify-between items-end">
                        <div className="max-w-2xl">
                            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4 text-on-background">Core Infrastructure & Digital Services</h2>
                            <p className="text-on-surface-variant">We provide the technical backbone your business needs to scale securely and efficiently.</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                        {/* Featured Service */}
                        <div className="md:col-span-8 bg-surface-container-lowest rounded-xl p-8 flex flex-col md:flex-row gap-8 items-center group transition-all hover:bg-white shadow-sm">
                            <div className="w-full md:w-1/2 aspect-video rounded-lg overflow-hidden order-2 md:order-1">
                                <img alt="Security" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" src="https://lh3.googleusercontent.com/aida-public/AB6AXuA1ZfHBduaGd1dVYuorneslszbupj3c1C0XzY1tdGphsMSwVr0pBfms9CgLLV_xfzNvWNSnYNeAkHzlcXB0mJbZbyReXRaxb5BoSKlYhPVk1GNqljx1eAa6HApVLw2IxPe_8f9RmxAvx9JaKhBoHykWKu6GxPX9oICsomwYH5CBoDFeoQXu-_VlXlOgk7iNmgJaAh-IWP86ZZE2aW9IHO5SccnEQhNu8px71E9aEGyJQZF3tYTsi2qIQ87xinlMs8b3PRjj8VoSo5m6" />
                            </div>
                            <div className="w-full md:w-1/2 order-1 md:order-2">
                                <span className="material-symbols-outlined text-primary text-4xl mb-4">videocam</span>
                                <h3 className="text-2xl font-bold mb-3">Security Camera Installation</h3>
                                <p className="text-on-surface-variant mb-6 text-sm">Advanced surveillance systems integrated with AI-driven monitoring.</p>
                                <div className="flex gap-2">
                                    <span className="px-3 py-1 bg-secondary-container text-on-secondary-container text-[10px] font-bold rounded-full uppercase">IP Cameras</span>
                                </div>
                            </div>
                        </div>
                        {/* Small Service */}
                        <div className="md:col-span-4 bg-surface-container-lowest rounded-xl p-8 flex flex-col group transition-all hover:bg-white shadow-sm">
                            <span className="material-symbols-outlined text-primary text-4xl mb-4">code</span>
                            <h3 className="text-xl font-bold mb-3">Web Development</h3>
                            <p className="text-on-surface-variant text-sm mb-6">Building high-performance digital experiences.</p>
                            <div className="mt-auto aspect-video rounded-lg overflow-hidden">
                                <img alt="Web Dev" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" src="https://lh3.googleusercontent.com/aida-public/AB6AXuA4S3I5ZTmlybq5161nEQzODu4yzE0YmXMCXjOevtqPuvSyZaMaUV766LDvKEXPzkmmctx_Q0CFy_aKmANJZHjxeyowk0V4n1W9kzJcFrq-1LEy-D0ksWQkQwIhQfdNZPWxSzn2latZyN4Kww1jhsjGeek8COefzoykF8ryy4Oyh0uOSPnUGRJH9v8bGgFt76roIsXhuP_tiOtp1cdaPoCzXvF2umL1DVk436-rq9JEB06x2nho3zZVqgBEV1EGWjdfS1GxiBzj_ibm" />
                            </div>
                        </div>
                    </div>
                </div>
            </section>
            {/* <div>
                <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-8">Why Choose N3xtbridge Holdings</h2>
                <div className="space-y-10">
                    <div className="flex gap-6">
                        <div className="flex-shrink-0 w-12 h-12 bg-secondary-container rounded-lg flex items-center justify-center">
                            <span className="material-symbols-outlined text-primary">verified</span>
                        </div>
                        <div>
                            <h4 className="text-xl font-bold mb-2">Unmatched Reliability</h4>
                            <p className="text-on-surface-variant leading-relaxed">Our systems are built on architectural integrity, ensuring your business stays operational 24/7 with zero compromise on quality.</p>
                        </div>
                    </div>
                    <div className="flex gap-6">
                        <div className="flex-shrink-0 w-12 h-12 bg-secondary-container rounded-lg flex items-center justify-center">
                            <span className="material-symbols-outlined text-primary">lightbulb</span>
                        </div>
                        <div>
                            <h4 className="text-xl font-bold mb-2">Practical Innovation</h4>
                            <p className="text-on-surface-variant leading-relaxed">We don't just use technology for its own sake. We implement cutting-edge solutions that solve specific, tangible business challenges.</p>
                        </div>
                    </div>
                    <div className="flex gap-6">
                        <div className="flex-shrink-0 w-12 h-12 bg-secondary-container rounded-lg flex items-center justify-center">
                            <span className="material-symbols-outlined text-primary">engineering</span>
                        </div>
                        <div>
                            <h4 className="text-xl font-bold mb-2">Technical Expertise</h4>
                            <p className="text-on-surface-variant leading-relaxed">Our multi-disciplinary team combines physical hardware mastery with advanced software engineering capabilities.</p>
                        </div>
                    </div>
                </div>
            </div> */}
        </div>
    );
};

export default Home;