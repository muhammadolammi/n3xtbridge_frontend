import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../api/axios';
import Confetti from 'react-confetti';
import { useAuth } from '../context/AuthContext';

export default function PaymentSuccess() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const reference = searchParams.get('reference') || searchParams.get('trxref');

    const [isSyncing, setIsSyncing] = useState(true);
    const { user, loading: authLoading } = useAuth();
    const [paymentSuccess, setPaymentSuccess] = useState(false);


    // 1. Guard Clause: If auth is still loading, show global spinner
    // 2. If auth finished and no user, redirect to signin
    useEffect(() => {
        if (!authLoading && !user) {
            // Include the current path so you can redirect back after login
            const currentPath = encodeURIComponent(window.location.pathname + window.location.search);
            navigate(`/signin?redirect=${currentPath}`);
        }
    }, [user, authLoading, navigate]);

    useEffect(() => {
        if (authLoading || !user || !reference) return;

        let isMounted = true;

        const interval = setInterval(async () => {
            try {
                const res = await api.get(`/customer/payments/verify/${reference}`);
                if (res.data.status === 'success' && isMounted) {
                    setPaymentSuccess(true)
                    clearInterval(interval);
                    setIsSyncing(false)
                }
                if (res.data.status !== 'success' && isMounted) {
                    setPaymentSuccess(false)
                }
            } catch (err) {
                console.error("Syncing with terminal...");
            }

        }, 2000);

        const timeout = setTimeout(() => {
            if (isMounted) {
                clearInterval(interval);
                setIsSyncing(false);
            }
        }, 150000);

        return () => {
            isMounted = false;
            clearInterval(interval);
            clearTimeout(timeout);
        };
    }, [reference, user, authLoading]);

    // Show loading state while checking Auth
    if (authLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    // If no user, the useEffect above will handle the navigate, so we return null
    if (!user) return null;

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
            {!isSyncing && paymentSuccess && <Confetti numberOfPieces={150} recycle={false} gravity={0.2} />}

            <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-10 text-center border border-gray-100 animate-in zoom-in duration-500">
                <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 ${isSyncing ? 'bg-blue-50' : 'bg-green-100'}`}>
                    <span className={`material-symbols-outlined ${isSyncing ? 'text-blue-500 animate-spin' : 'text-green-600'} text-4xl`}>
                        {isSyncing ? 'sync' : 'verified_user'}
                    </span>
                </div>

                <h1 className="text-3xl font-black text-gray-900 tracking-tighter uppercase mb-2">
                    {isSyncing ? 'Verifying...' : paymentSuccess ? 'Payment Received' : "Try again"}
                </h1>

                <p className="text-gray-500 text-sm mb-8 leading-relaxed">
                    {isSyncing
                        ? "We're confirming your transaction with the bank. Please don't close this window."
                        : paymentSuccess ? "Your transaction has been authorized. Your digital ledger is now up to date." : "Your transaction could not be verified. Kindly try again"
                    }
                </p>

                <div className="space-y-4">
                    <button
                        disabled={isSyncing}
                        onClick={() => navigate('/dashboard')}
                        className="w-full bg-secondary-dark text-white py-4 rounded-xl font-black uppercase tracking-widest hover:bg-black transition-all disabled:opacity-50 shadow-lg shadow-gray-200"
                    >
                        {isSyncing ? 'Finalizing Sync...' : 'Return to Dashboard'}
                    </button>

                    {!isSyncing && (
                        <p className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">
                            Ref: {reference?.slice(0, 12)}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}