import React from 'react';
import { SITE_CONFIG } from '../constants/content';
import { Link } from 'react-router-dom';

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
                            <Link to="/services" className="px-8 py-4 bg-gradient-to-r from-primary to-primary-container text-white rounded-lg font-semibold shadow-lg hover:shadow-primary/20 transition-all">
                                Explore Our Services
                            </Link>
                            {/* <button className="px-8 py-4 bg-surface-container-high text-on-secondary-container rounded-lg font-semibold hover:bg-surface-container-highest transition-all">
                                View Portfolio
                            </button> */}
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

            <section className="py-24 bg-surface-container-low" id="services">
                <div className="max-w-7xl mx-auto px-6 md:px-12">
                    <div className="mb-16 md:flex justify-between items-end">
                        <div className="max-w-2xl">
                            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">Core Infrastructure &amp; Digital Services</h2>
                            <p className="text-on-surface-variant">We provide the technical backbone your business needs to scale securely and efficiently in an increasingly digital world.</p>
                        </div>
                        <div className="mt-6 md:mt-0">

                            <Link to="/services" className="text-primary font-bold inline-flex items-center group" >
                                Browse all services
                                <span className="material-symbols-outlined ml-2 group-hover:translate-x-1 transition-transform">arrow_forward</span>
                            </Link>
                        </div>

                    </div>
                    {/* <!-- Bento Grid Layout --> */}
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                        {/* <!-- Service 1 --> */}
                        <div className="md:col-span-8 bg-surface-container-lowest rounded-xl p-8 flex flex-col md:flex-row gap-8 items-center group transition-all hover:bg-white">
                            <div className="w-full md:w-1/2 aspect-video rounded-lg overflow-hidden order-2 md:order-1">
                                <img alt="Security Camera Installation" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" data-alt="Modern high definition security camera installed on building corner" src="https://lh3.googleusercontent.com/aida-public/AB6AXuA1ZfHBduaGd1dVYuorneslszbupj3c1C0XzY1tdGphsMSwVr0pBfms9CgLLV_xfzNvWNSnYNeAkHzlcXB0mJbZbyReXRaxb5BoSKlYhPVk1GNqljx1eAa6HApVLw2IxPe_8f9RmxAvx9JaKhBoHykWKu6GxPX9oICsomwYH5CBoDFeoQXu-_VlXlOgk7iNmgJaAh-IWP86ZZE2aW9IHO5SccnEQhNu8px71E9aEGyJQZF3tYTsi2qIQ87xinlMs8b3PRjj8VoSo5m6" />
                            </div>
                            <div className="w-full md:w-1/2 order-1 md:order-2">
                                <span className="material-symbols-outlined text-primary text-4xl mb-4">videocam</span>
                                <h3 className="text-2xl font-bold mb-3">Security Camera Installation</h3>
                                <p className="text-on-surface-variant mb-6 text-sm">Advanced surveillance systems integrated with AI-driven monitoring for 24/7 commercial security.</p>
                                <div className="flex gap-2">
                                    <span className="px-3 py-1 bg-secondary-container text-on-secondary-container text-[10px] font-bold rounded-full uppercase">IP Cameras</span>
                                    <span className="px-3 py-1 bg-secondary-container text-on-secondary-container text-[10px] font-bold rounded-full uppercase">Cloud Backup</span>
                                </div>
                            </div>
                        </div>
                        {/* <!-- Service 2 --> */}
                        <div className="md:col-span-4 bg-surface-container-lowest rounded-xl p-8 flex flex-col group transition-all hover:bg-white">
                            <span className="material-symbols-outlined text-primary text-4xl mb-4">code</span>
                            <h3 className="text-xl font-bold mb-3">Web Development Agency</h3>
                            <p className="text-on-surface-variant text-sm mb-6">Building high-performance digital experiences that convert browsers into loyal customers.</p>
                            <div className="mt-auto aspect-square rounded-lg overflow-hidden">
                                <img alt="Web development code" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" data-alt="Abstract code on a dark monitor screen with blue highlights" src="https://lh3.googleusercontent.com/aida-public/AB6AXuA4S3I5ZTmlybq5161nEQzODu4yzE0YmXMCXjOevtqPuvSyZaMaUV766LDvKEXPzkmmctx_Q0CFy_aKmANJZHjxeyowk0V4n1W9kzJcFrq-1LEy-D0ksWQkQwIhQfdNZPWxSzn2latZyN4Kww1jhsjGeek8COefzoykF8ryy4Oyh0uOSPnUGRJH9v8bGgFt76roIsXhuP_tiOtp1cdaPoCzXvF2umL1DVk436-rq9JEB06x2nho3zZVqgBEV1EGWjdfS1GxiBzj_ibm" />
                            </div>
                        </div>
                        {/* <!-- Service 3 --> */}
                        <div className="md:col-span-4 bg-surface-container-lowest rounded-xl p-8 flex flex-col group transition-all hover:bg-white">
                            <span className="material-symbols-outlined text-primary text-4xl mb-4">support_agent</span>
                            <h3 className="text-xl font-bold mb-3">IT Support &amp; Managed Services</h3>
                            <p className="text-on-surface-variant text-sm mb-6">Reliable, 24/7 technical oversight ensuring your operations never miss a beat.</p>
                            <div className="mt-auto h-32 bg-surface-container-high rounded-lg flex items-center justify-center p-4">
                                <div className="w-full bg-surface-container-highest h-2 rounded-full overflow-hidden">
                                    <div className="bg-primary h-full w-[94%]"></div>
                                </div>
                                <span className="ml-4 font-mono text-xs font-bold text-primary">99.9% Uptime</span>
                            </div>
                        </div>
                        {/* <!-- Service 4 --> */}
                        <div className="md:col-span-8 bg-inverse-surface rounded-xl p-8 flex flex-col md:flex-row gap-8 items-center text-white">
                            <div className="w-full md:w-1/2">
                                <span className="material-symbols-outlined text-primary-fixed text-4xl mb-4">router</span>
                                <h3 className="text-2xl font-bold mb-3">Network Solutions</h3>
                                <p className="text-outline-variant mb-6 text-sm">Enterprise-grade network architecture designed for speed, redundancy, and future-proof expansion.</p>
                                <ul className="space-y-2 text-sm text-outline-variant">
                                    <li className="flex items-center"><span className="material-symbols-outlined text-xs mr-2 text-primary-fixed">check_circle</span> Fiber Optic Installation</li>
                                    <li className="flex items-center"><span className="material-symbols-outlined text-xs mr-2 text-primary-fixed">check_circle</span> SD-WAN Implementation</li>
                                    <li className="flex items-center"><span className="material-symbols-outlined text-xs mr-2 text-primary-fixed">check_circle</span> Multi-Site Connectivity</li>
                                </ul>
                            </div>
                            <div className="w-full md:w-1/2 h-full min-h-[200px] rounded-lg overflow-hidden opacity-80">
                                <img alt="Networking Hardware" className="w-full h-full object-cover" data-alt="Close up of network cables connected to a blue lit switch" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBxH1aXq6yLU2zfOLoQmTN8pGf7rT4OZGdmzxEepExIlZk1Iebrvl5ScQHX2TdrauidhiTeyoZUwhU9urPHKe3IQthXdQj9cKnO16eaItOJ0g-o6YRQM2gFtLtqMheF07GXc1GEL0Gm6qA9Lx2Ew3VT6x_ICDAPOfuOeQIm0vtzTBIrgZtCbXwyEvkh4fmowLZeEIBwLdwuEVeofNWPI27E0TR89I8e42RLT9Ja0ZVAf9fGJ9soHg6xfF-JhbgMetdiE4nFfyBh6zoD" />
                            </div>
                        </div>
                    </div>
                </div>
            </section>
            {/* why choose */}
            <section className="py-24 bg-surface" id="about">
                <div className="max-w-7xl mx-auto px-6 md:px-12">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
                        <div className="relative">
                            <div className="absolute -z-10 w-full h-full border-2 border-primary/20 translate-x-4 translate-y-4 rounded-xl"></div>
                            <div className="bg-surface-container-lowest p-4 rounded-xl shadow-xl">
                                <img alt="Tech Team" className="rounded-lg w-full h-[500px] object-cover" data-alt="Diverse team of tech professionals collaborating in a modern office" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCiZxhLGviP-EZRTtDK69-TBg4F5mKTZN6P1h0kj5AeYonkWlOJWMEOJu1F1I9vQ5shRdelRJ4ji10CQ9lND5X4_Ugo9lD9JzY-D30AojF6HlMDK7tYjQOeAxrxI-8fwcf8SLy1KGVhdFq31K3kFzAFNtY5UG6C3K6TjEHdtwQc3-VD3L_5s7iVveCnIiTl3iF_QDQbAZXxwUWbpTAR-uZJWJyDIfyzOFFqhs887P8YvMN4R2PAgvE0i1pMc9-bRhXC68Ld2xYHIE_v" />
                                <div className="absolute bottom-10 right-10 bg-primary text-white p-6 rounded-lg shadow-2xl">
                                    <div className="text-4xl font-extrabold mb-1">10+</div>
                                    <div className="text-xs font-bold uppercase tracking-widest">Years Expertise</div>
                                </div>
                            </div>
                        </div>
                        <div>
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
                        </div>
                    </div>
                </div>
            </section>

            {/* contact */}
            <section className="py-24 bg-surface" id="contact">
                <div className="max-w-7xl mx-auto px-6 md:px-12">
                    <div className="bg-inverse-surface rounded-2xl overflow-hidden shadow-2xl flex flex-col lg:flex-row">
                        <div className="lg:w-1/3 p-12 bg-primary flex flex-col justify-between text-white">
                            <div>
                                <h2 className="text-3xl font-bold mb-6">Let's Connect</h2>
                                <p className="text-primary-fixed mb-12">Ready to transform your business infrastructure? Reach out to our specialist team for a consult.</p>
                                <div className="space-y-6">
                                    <div className="flex items-center gap-4">
                                        <span className="material-symbols-outlined">mail</span>

                                        <span>{SITE_CONFIG.contact.email}</span>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <span className="material-symbols-outlined">phone</span>
                                        <span>{SITE_CONFIG.contact.phone}</span>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <span className="material-symbols-outlined">location_on</span>
                                        <span data-location="Abuja">{SITE_CONFIG.contact.address}</span>
                                    </div>
                                </div>
                            </div>
                            {/* <div className="mt-12 flex gap-4">
                                <div className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center hover:bg-white hover:text-primary transition-all cursor-pointer">
                                    <span className="material-symbols-outlined text-sm">share</span>
                                </div>
                            </div> */}
                        </div>
                        <div className="lg:w-2/3 p-12 bg-surface-container-lowest">
                            <form className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold uppercase tracking-widest text-outline">Full Name</label>
                                        <input className="w-full bg-surface-container-low border-0 border-b border-outline-variant focus:ring-0 focus:border-primary px-4 py-3 transition-all" placeholder="John Doe" type="text" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold uppercase tracking-widest text-outline">Email Address</label>
                                        <input className="w-full bg-surface-container-low border-0 border-b border-outline-variant focus:ring-0 focus:border-primary px-4 py-3 transition-all" placeholder="john@example.com" type="email" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase tracking-widest text-outline">Service Interest</label>
                                    <select className="w-full bg-surface-container-low border-0 border-b border-outline-variant focus:ring-0 focus:border-primary px-4 py-3 transition-all">
                                        <option>Security Installation</option>
                                        <option>Web Development</option>
                                        <option>Network Solutions</option>
                                        <option>Managed IT</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase tracking-widest text-outline">Message</label>
                                    <textarea className="w-full bg-surface-container-low border-0 border-b border-outline-variant focus:ring-0 focus:border-primary px-4 py-3 transition-all" placeholder="Tell us about your project..." rows={4}></textarea>
                                </div>
                                <button className="w-full py-4 bg-primary text-white font-bold rounded-lg hover:bg-primary/90 active:scale-[0.98] transition-all" type="submit">
                                    Send Message
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Home;