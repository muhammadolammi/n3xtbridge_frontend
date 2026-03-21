import React from 'react';

const Footer: React.FC = () => {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="w-full py-12 px-6 md:px-12 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 mt-auto">
            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                <div className="space-y-4">
                    <div className="font-bold text-slate-900 dark:text-slate-100">N3xtbridge Holdings</div>
                    <p className="text-sm font-normal text-slate-500 dark:text-slate-400 max-w-xs">
                        © {currentYear} N3xtbridge Holdings. All rights reserved.
                    </p>
                </div>

                {/* Repeating column for structure based on your HTML */}
                {[1, 2, 3].map((i) => (
                    <div key={i}>
                        <h5 className="font-bold text-slate-900 dark:text-slate-100 mb-4 text-sm uppercase tracking-widest">N3xtbridge Holdings</h5>
                        <ul className="space-y-2 text-sm font-normal text-slate-500 dark:text-slate-400">
                            <li>Services</li>
                            <li>About Us</li>
                            <li>Case Studies</li>
                        </ul>
                    </div>
                ))}
            </div>

            <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-slate-200/50 dark:border-slate-800/50 flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="text-sm font-normal text-slate-500 dark:text-slate-400">© {currentYear} N3xtbridge Holdings. All rights reserved.</div>
                <div className="flex gap-6">
                    <span className="material-symbols-outlined text-slate-400 hover:text-primary transition-colors cursor-pointer">language</span>
                    <span className="material-symbols-outlined text-slate-400 hover:text-primary transition-colors cursor-pointer">shield</span>
                </div>
            </div>
        </footer>
    );
};

export default Footer;