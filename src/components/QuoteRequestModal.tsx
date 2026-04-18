import React, { useState, useRef, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import type { Promotion } from '../models/model';

interface ModalProps {
    serviceId: string;
    serviceName: string;
    onClose: () => void;
    appliedPromos?: Promotion[] | null;
}

const NIGERIA_STATES = ["Lagos", "Abuja", "Rivers", "Kano", "Oyo", "Kwara", "Delta", "Anambra", "Edo", "Akwa Ibom"];

export const QuoteRequestModal: React.FC<ModalProps> = ({ serviceId, serviceName, onClose, appliedPromos }) => {
    const { user, login } = useAuth();
    const navigate = useNavigate();

    const [step, setStep] = useState<'identity' | 'login' | 'profile' | 'details' | 'uploading'>(user ? 'details' : 'identity');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showPassword, setShowPassword] = useState(false);
    useEffect(() => {
        if (user)
            setStep("details")
    }, [])

    const [formData, setFormData] = useState({
        email: '',
        first_name: '',
        last_name: '',
        phone_number: '',
        password: '',
        state: ''
    });

    const [description, setDescription] = useState('');
    const [files, setFiles] = useState<File[]>([]);
    const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
    const [isRecording, setIsRecording] = useState(false);
    const mediaRecorder = useRef<MediaRecorder | null>(null);
    const [recordingTime, setRecordingTime] = useState(0);
    const timerRef = useRef<number | null>(null);
    const [isPaused, setIsPaused] = useState(false);
    // ✅ PASSWORD RULES
    const passwordRequirements = useMemo(() => ({
        length: formData.password.length >= 10,
        hasUpper: /[A-Z]/.test(formData.password),
        hasLower: /[a-z]/.test(formData.password),
        hasSymbol: /[!@#$%^&*(),.?":{}|<>]/.test(formData.password),
    }), [formData.password]);

    const isPasswordValid = Object.values(passwordRequirements).every(Boolean);

    // ✅ CHECK EMAIL
    const checkIdentity = async () => {
        try {
            setLoading(true);
            setError(null);

            const res = await api.post('/auth/check-lead', { email: formData.email });

            if (res.data.exists) {
                setStep('login'); // 🔐 require password
            } else {
                setStep('profile');
            }
        } catch {
            setError("Could not verify email.");
        } finally {
            setLoading(false);
        }
    };

    // 🔐 LOGIN
    const handleLogin = async () => {
        setLoading(true);
        setError(null);
        const result = await login(formData.email, formData.password);
        // If result is a string (error message) or false
        if (result === true) {
            setStep('details');

        } else {
            setError('Invalid email or password. Please try again.');
        }

        setLoading(false);

    };

    // 🎤 AUDIO
    const startRecording = async () => {
        if (isRecording) return; // 🚫 prevent double start

        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

        const recorder = new MediaRecorder(stream);
        mediaRecorder.current = recorder;

        const chunks: BlobPart[] = [];

        recorder.ondataavailable = (e) => {
            if (e.data.size > 0) chunks.push(e.data);
        };

        recorder.onstop = () => {
            const blob = new Blob(chunks, { type: 'audio/webm' });
            setAudioBlob(blob);
        };

        recorder.start();
        setIsRecording(true);
        setRecordingTime(0);

        timerRef.current = window.setInterval(() => {
            setRecordingTime(prev => prev + 1);
        }, 1000);
    };


    const stopRecording = () => {
        if (!mediaRecorder.current) return;

        if (mediaRecorder.current.state !== "inactive") {
            mediaRecorder.current.stop();
        }

        mediaRecorder.current.stream.getTracks().forEach(track => track.stop());

        setIsRecording(false);
        setIsPaused(false);

        // stop timer
        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }
    };
    const pauseRecording = () => {
        if (!mediaRecorder.current) return;

        if (mediaRecorder.current.state === "recording") {
            mediaRecorder.current.pause();
            setIsPaused(true);

            // stop timer
            if (timerRef.current) {
                clearInterval(timerRef.current);
                timerRef.current = null;
            }
        }
    };

    const resumeRecording = () => {
        if (!mediaRecorder.current) return;

        if (mediaRecorder.current.state === "paused") {
            mediaRecorder.current.resume();
            setIsPaused(false);

            // resume timer
            timerRef.current = window.setInterval(() => {
                setRecordingTime(prev => prev + 1);
            }, 1000);
        }
    };
    const clearRecording = () => {
        setAudioBlob(null);
        setRecordingTime(0);
    };
    const formatTime = (sec: number) => {
        const m = Math.floor(sec / 60);
        const s = sec % 60;
        return `${m}:${s.toString().padStart(2, '0')}`;
    };
    // 🚀 SUBMIT
    const handleSubmit = async () => {
        setStep('uploading');
        setError(null);


        try {
            if (!user) {
                try {
                    await api.post('/auth/signup', {
                        ...formData,
                        country: 'Nigeria' // Matches your requirement
                    });

                    handleLogin()

                } catch (err: any) {
                    const msg = err.response?.data?.error || "Signup failed. Please try again.";
                    setError(msg);
                    setStep('profile'); // Send them back to fix signup issues
                    return;
                }
            }
            const attachmentKeys = await Promise.all(files.map(async (file) => {
                // configure a random key to generate object key

                const ext = file.name.split('.').pop();
                const random = crypto.randomUUID(); // ✅ modern + collision-safe
                const object_key = `qr/attachments/${Date.now()}-${random}.${ext}`
                const mime_type = file.type || 'application/octet-stream'
                const { data } = await api.post('/storage/presign', { object_key: object_key, mime_type: mime_type });
                // console.log(data)
                await fetch(data.upload_url, {
                    method: "PUT",
                    body: file,

                });
                return data.object_key;
            }));

            let vnKey = "";
            if (audioBlob) {
                const fileExt = 'webm';
                const random = crypto.randomUUID();
                const object_key = `qr/vns/${Date.now()}-${random}.${fileExt}`;
                const { data } = await api.post('/storage/presign', { object_key: object_key, mime_type: 'audio/webm' });
                await fetch(data.upload_url, {
                    method: "PUT",
                    body: audioBlob,

                });
                vnKey = data.object_key;
            }



            const res = await api.post('/customer/quotes/requests', {
                ...formData,
                user_id: user?.id,
                description,
                service_id: serviceId,
                vn_key: vnKey,
                attachments: attachmentKeys,
                promo_ids: appliedPromos?.map(p => p.id) || []
            });
            const qr = res.data.quote_request
            console.log(qr)

            navigate(`/dashboard/qr/${res.data.quote_request.id}`, { state: { qr } });
            onClose();
        } catch {
            setError("Submission failed");
            setStep('details');
        }
    };

    return (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/95 backdrop-blur-xl">
            <div className="bg-[#0C0C0C] w-full max-w-2xl rounded-[2rem] border border-[#1A1A1A] overflow-hidden">

                {/* HEADER */}
                <div className="p-8 border-b border-[#1A1A1A] flex justify-between items-center">
                    <h3 className="text-white font-bold">Request a Quote</h3>
                    <h2>{serviceName}</h2>
                    <button onClick={onClose}>✕</button>
                </div>

                <div className="p-8 space-y-6">

                    {error && (
                        <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-sm">
                            {error}
                        </div>
                    )}

                    {/* STEP 1 */}
                    {step === 'identity' && (
                        <>
                            <input
                                placeholder="Email"
                                className="w-full p-4 bg-[#141414] text-white"
                                value={formData.email}
                                onChange={e => setFormData({ ...formData, email: e.target.value })}
                            />
                            <button onClick={checkIdentity} className="w-full bg-[#0046FB] p-4 text-white">
                                {loading ? "Checking..." : "Continue"}
                            </button>
                        </>
                    )}

                    {/* LOGIN */}
                    {step === 'login' && (
                        <>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Enter your password"
                                    className="w-full p-4 bg-[#141414] text-white"

                                    value={formData.password}
                                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-0 top-3 text-gray-400 hover:text-primary"
                                >
                                    <span className="material-symbols-outlined">
                                        {showPassword ? 'visibility_off' : 'visibility'}
                                    </span>
                                </button>
                            </div>
                            <button onClick={handleLogin} className="w-full bg-[#0046FB] p-4 text-white">
                                {loading ? "Verifying..." : "Continue"}
                            </button>

                        </>
                    )}

                    {/* PROFILE */}
                    {step === 'profile' && (
                        <>
                            <input placeholder="First Name" className="w-full p-3 bg-[#141414] text-white"
                                onChange={e => setFormData({ ...formData, first_name: e.target.value })}
                            />

                            <input placeholder="Last Name" className="w-full p-3 bg-[#141414] text-white"
                                onChange={e => setFormData({ ...formData, last_name: e.target.value })}

                            />

                            <input
                                type="password"
                                placeholder="Create Password"
                                className="w-full p-3 bg-[#141414] text-white"
                                onChange={e => setFormData({ ...formData, password: e.target.value })}
                            />

                            {/* PASSWORD FEEDBACK */}
                            <div className="text-xs space-y-1">
                                <p className={passwordRequirements.length ? "text-green-400" : "text-gray-500"}>• 10+ characters</p>
                                <p className={passwordRequirements.hasUpper ? "text-green-400" : "text-gray-500"}>• Uppercase letter</p>
                                <p className={passwordRequirements.hasLower ? "text-green-400" : "text-gray-500"}>• Lowercase letter</p>
                                <p className={passwordRequirements.hasSymbol ? "text-green-400" : "text-gray-500"}>• Special character</p>
                            </div>

                            <select className="w-full p-3 bg-[#141414] text-white"
                                onChange={e => setFormData({ ...formData, state: e.target.value })}
                            >
                                <option value="">Select State</option>
                                {NIGERIA_STATES.map(s => <option key={s}>{s}</option>)}
                            </select>

                            <button
                                disabled={!isPasswordValid}
                                onClick={() => setStep('details')}
                                className="w-full bg-[#0046FB] p-4 text-white disabled:opacity-50"
                            >
                                Continue
                            </button>
                        </>
                    )}

                    {/* DETAILS */}
                    {step === 'details' && (
                        <>
                            <textarea
                                placeholder="Describe your request..."
                                className="w-full p-4 bg-[#141414] text-white"
                                value={description}
                                onChange={e => setDescription(e.target.value)}
                            />

                            {/* RECORD CONTROLS */}

                            {!isRecording && !audioBlob && (
                                <button
                                    onClick={startRecording}
                                    className="w-full p-3 bg-[#141414] text-white"
                                >
                                    Add a voice note 🎤
                                </button>
                            )}

                            {isRecording && (
                                <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex justify-between items-center text-red-400">
                                    <span>
                                        <span className="animate-pulse">●</span>{" "}
                                        {isPaused ? "Paused" : "Recording"} {formatTime(recordingTime)}
                                    </span>

                                    <div className="flex gap-2">
                                        {!isPaused ? (
                                            <button
                                                onClick={pauseRecording}
                                                className="bg-yellow-500 px-3 py-1 rounded text-white"
                                            >
                                                Pause
                                            </button>
                                        ) : (
                                            <button
                                                onClick={resumeRecording}
                                                className="bg-green-500 px-3 py-1 rounded text-white"
                                            >
                                                Resume
                                            </button>
                                        )}

                                        <button
                                            onClick={stopRecording}
                                            className="bg-red-500 px-3 py-1 rounded text-white"
                                        >
                                            Stop
                                        </button>
                                    </div>
                                </div>
                            )}

                            {audioBlob && !isRecording && (
                                <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-xl flex justify-between items-center text-green-400">
                                    <span>Voice note ready ({formatTime(recordingTime)})</span>

                                    <div className="flex gap-3">
                                        <button
                                            onClick={clearRecording}
                                            className="text-red-400"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            )}

                            {audioBlob && (
                                <audio
                                    controls
                                    src={URL.createObjectURL(audioBlob)}
                                    className="w-full mt-2"
                                />
                            )}

                            <input type="file" multiple onChange={e => setFiles(Array.from(e.target.files || []))} />

                            <button onClick={handleSubmit} className="w-full bg-[#0046FB] p-4 text-white">
                                Submit Request
                            </button>
                        </>
                    )}

                    {step === 'uploading' && <p className="text-gray-400 text-center">Submitting...</p>}
                </div>
            </div>
        </div>
    );
};