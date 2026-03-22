import Footer from "../components/Footer";
import { Home, LayoutDashboard } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";

export default function F404Page() {
    const location = useLocation();
    const navigate = useNavigate();

    const currentPath = location.pathname.replace("/", "");

    const comingSoonPages = [
        "privacy-policy",
        "features",
        "dashboard",
        "services"
    ];
    const isComingSoon = comingSoonPages.includes(currentPath);
    return (
        <div className="flex flex-col min-h-screen bg-background text-on-background font-body">
            <Navbar />
            {/* Subtle gradient background */}
            <div className="absolute inset-0 -z-10 bg-gradient-to-br from-primary/5 via-transparent to-primary/10 blur-2xl" />

            <main className="flex-1 flex flex-col items-center justify-center px-6 py-16">
                <div className="max-w-2xl w-full text-center space-y-8">

                    {/* Badge */}
                    {!isComingSoon && (
                        <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-semibold tracking-wide">
                            404 ERROR
                        </div>
                    )}

                    {/* Heading */}
                    <h1 className="text-4xl md:text-6xl font-black tracking-tight text-on-background leading-tight">
                        {isComingSoon ? (
                            <span className="text-primary">
                                Feature Coming Soon
                            </span>
                        ) : (
                            "Page Not Found"
                        )}
                    </h1>

                    {/* Description */}
                    <p className="text-base md:text-lg text-on-surface-variant leading-relaxed max-w-xl mx-auto">
                        {isComingSoon
                            ? "We're actively working on this feature to make your experience better. Check back soon — it's worth the wait."
                            : "The page you're looking for doesn’t exist or may have been moved. Let’s get you back on track."}
                    </p>

                    {/* Actions */}
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">

                        <button
                            onClick={() => navigate("/dashboard")}
                            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 bg-primary text-white rounded-xl font-semibold shadow-md hover:shadow-lg hover:-translate-y-0.5 active:scale-95 transition-all"
                        >
                            <LayoutDashboard size={18} />
                            Go to Dashboard
                        </button>

                        <button
                            onClick={() => navigate("/")}
                            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 bg-white dark:bg-surface-container text-on-surface border border-outline-variant rounded-xl font-semibold hover:bg-surface-container-low transition-all"
                        >
                            <Home size={18} />
                            Return Home
                        </button>
                    </div>

                    {/* Extra hint (nice touch) */}
                    {!isComingSoon && (
                        <p className="text-sm text-outline pt-4">
                            If you think this is a mistake, feel free to contact support.
                        </p>
                    )}

                </div>
            </main>

            <Footer />
        </div>
    );
}