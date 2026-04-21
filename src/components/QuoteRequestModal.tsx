import React, { useState, useRef, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import type { Promotion } from '../models/model';
import { NIGERIA_STATES } from '../constants/const';
import { validateFiles, validateMediaDuration } from '../helpers/helpers';

interface ModalProps {
    serviceId: string;
    serviceName: string;
    onClose: () => void;
    appliedPromos?: Promotion[] | null;
}

export const QuoteRequestModal: React.FC<ModalProps> = ({ serviceId, serviceName, onClose, appliedPromos }) => {
    const { user, login } = useAuth();
    const navigate = useNavigate();

    const [step, setStep] = useState<'identity' | 'login' | 'profile' | 'details' | 'uploading'>(user ? 'details' : 'identity');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showPassword, setShowPassword] = useState(false);

    useEffect(() => {
        if (user) setStep("details");
    }, [user]);

    const [formData, setFormData] = useState({
        email: '',
        first_name: '',
        last_name: '',
        phone_number: '',
        password: '',
        state: ''
    });

    const [description, setDescription] = useState('');
    const [images, setImages] = useState<File[]>([]);
    const [video, setVideo] = useState<File | null>();
    const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
    const [isRecording, setIsRecording] = useState(false);
    const [recordingTime, setRecordingTime] = useState(0);
    const [isPaused, setIsPaused] = useState(false);

    const mediaRecorder = useRef<MediaRecorder | null>(null);
    const timerRef = useRef<number | null>(null);

    const passwordRequirements = useMemo(() => ({
        length: formData.password.length >= 10,
        hasUpper: /[A-Z]/.test(formData.password),
        hasLower: /[a-z]/.test(formData.password),
        hasSymbol: /[!@#$%^&*(),.?":{}|<>]/.test(formData.password),
    }), [formData.password]);

    const isPasswordValid = Object.values(passwordRequirements).every(Boolean);

    const checkIdentity = async () => {
        try {
            setLoading(true);
            setError(null);
            const res = await api.post('/auth/check-lead', { email: formData.email });
            if (res.data.exists) setStep('login');
            else setStep('profile');
        } catch {
            setError("Could not verify email.");
        } finally {
            setLoading(false);
        }
    };

    const handleLogin = async () => {
        setLoading(true);
        setError(null);
        const result = await login(formData.email, formData.password);
        if (result === true) setStep('details');
        else setError('Invalid email or password. Please try again.');
        setLoading(false);
    };

    const MAX_AUDIO_DURATION = 5 * 60;
    const MAX_AUDIO_SIZE = 15 * 1024 * 1024;

    const startRecording = async () => {
        if (isRecording) return;
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const recorder = new MediaRecorder(stream);
            mediaRecorder.current = recorder;
            const chunks: BlobPart[] = [];
            recorder.ondataavailable = (e) => { if (e.data.size > 0) chunks.push(e.data); };
            recorder.onstop = async () => {

                const blob = new Blob(chunks, { type: 'audio/webm' });
                try {
                    const audio = document.createElement("audio");
                    audio.src = URL.createObjectURL(blob);
                    await new Promise((resolve) => { audio.onloadedmetadata = resolve; });
                    if (audio.duration > MAX_AUDIO_DURATION + 1) {
                        alert("Voice note too long");
                        setAudioBlob(null);
                        return;
                    }
                    setAudioBlob(blob);
                    if (blob.size > MAX_AUDIO_SIZE) {
                        alert("Audio too large (max 15MB)");
                        setAudioBlob(null);
                        return;
                    }
                    setAudioBlob(blob);
                } catch {
                    alert("Failed to process audio.");
                    setAudioBlob(null);
                }
            };
            recorder.start();
            setIsRecording(true);
            setRecordingTime(0);
            timerRef.current = window.setInterval(() => {
                setRecordingTime(prev => {
                    const next = prev + 1;

                    if (next >= MAX_AUDIO_DURATION) {
                        // 🔥 Force the stop immediately when limit is reached
                        if (mediaRecorder.current && mediaRecorder.current.state !== "inactive") {
                            mediaRecorder.current.stop();
                        }
                        stopRecording(); // This clears the timer and UI state
                        return MAX_AUDIO_DURATION; // Keep it at 5:00
                    }

                    return next;
                });
            }, 1000);
        } catch (err) {
            alert("Microphone permission is required to record audio.");
        }
    };

    const stopRecording = () => {
        if (!mediaRecorder.current) return;
        if (mediaRecorder.current.state !== "inactive") mediaRecorder.current.stop();
        mediaRecorder.current.stream.getTracks().forEach(track => track.stop());
        setIsRecording(false);
        setIsPaused(false);
        if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    };

    const pauseRecording = () => {
        if (mediaRecorder.current?.state === "recording") {
            mediaRecorder.current.pause();
            setIsPaused(true);
            if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
        }
    };

    const resumeRecording = () => {
        if (mediaRecorder.current?.state === "paused") {
            mediaRecorder.current.resume();
            setIsPaused(false);
            timerRef.current = window.setInterval(() => {
                setRecordingTime(prev => {
                    const next = prev + 1;

                    if (next >= MAX_AUDIO_DURATION) {
                        // 🔥 Force the stop immediately when limit is reached
                        if (mediaRecorder.current && mediaRecorder.current.state !== "inactive") {
                            mediaRecorder.current.stop();
                        }
                        stopRecording(); // This clears the timer and UI state
                        return MAX_AUDIO_DURATION; // Keep it at 5:00
                    }

                    return next;
                });
            }, 1000);
        }
    };

    const formatTime = (sec: number) => {
        const m = Math.floor(sec / 60);
        const s = sec % 60;
        return `${m}:${s.toString().padStart(2, '0')}`;
    };

    const handleSubmit = async () => {
        setStep('uploading');
        setError(null);
        try {
            let currentUserId = user?.id;
            if (!user) {
                try {
                    await api.post('/auth/signup', { ...formData, country: 'Nigeria' });
                    const loginSuccess = await login(formData.email, formData.password);
                    if (!loginSuccess) throw new Error("Login failed after signup");
                    const userRes = await api.get('/auth/user');
                    currentUserId = userRes.data.id;
                } catch (err: any) {
                    setError(err.response?.data?.error || "Authentication failed.");
                    setStep(formData.first_name ? 'profile' : 'login');
                    return;
                }
            }

            const attachmentKeys = await Promise.all(images.map(async (file) => {
                const ext = file.name.split('.').pop();
                const random = crypto.randomUUID();
                const object_key = `qr/attachments/${Date.now()}-${random}.${ext}`;
                const mime_type = file.type || 'application/octet-stream';
                const { data } = await api.post('/storage/presign', { object_key, mime_type, visibility: "private" });
                await fetch(data.upload_url, { method: "PUT", body: file });
                return data.object_key;
            }));

            let vnKey = "";
            if (audioBlob) {
                const object_key = `qr/vns/${Date.now()}-${crypto.randomUUID()}.webm`;
                const { data } = await api.post('/storage/presign', { object_key, mime_type: 'audio/webm', visibility: "private" });
                await fetch(data.upload_url, { method: "PUT", body: audioBlob });
                vnKey = data.object_key;
            }

            let video_key = "";
            if (video) {
                const ext = video.name.split('.').pop();
                const object_key = `qr/videos/${Date.now()}-${crypto.randomUUID()}.${ext}`;
                const { data } = await api.post('/storage/presign', { object_key, mime_type: video.type || 'application/octet-stream', visibility: "private" });
                await fetch(data.upload_url, { method: "PUT", body: video });
                video_key = data.object_key;
            }

            const res = await api.post('/customer/quotes/requests', {
                ...formData,
                user_id: currentUserId,
                description,
                service_id: serviceId,
                vn_key: vnKey,
                video_key: video_key,
                attachments: attachmentKeys,
                promo_ids: appliedPromos?.map(p => p.id) || []
            });
            navigate(`/dashboard/qr/${res.data.quote_request.id}`, { state: { qr: res.data.quote_request } });
            onClose();
        } catch (err: any) {
            setError(err?.response?.data?.error || "Something went wrong.");
            setStep('details');
        }
    };

    return (
        <div className="fixed inset-0 z-[999] flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-md sm:p-4">
            <div className="bg-[#0C0C0C] w-full max-w-2xl h-[95vh] sm:h-auto sm:max-h-[90vh] flex flex-col rounded-t-[2rem] sm:rounded-[2rem] border-t sm:border border-[#1A1A1A] overflow-hidden">

                {/* FIXED HEADER */}
                <div className="shrink-0 p-6 sm:p-8 border-b border-[#1A1A1A] flex justify-between items-center bg-[#0C0C0C]">
                    <div>
                        <h3 className="text-white font-bold text-lg leading-tight">Request a Quote</h3>
                        <p className="text-gray-400 text-sm">{serviceName}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-10 h-10 flex items-center justify-center rounded-full bg-[#1A1A1A] text-white hover:bg-[#252525] transition-colors"
                    >
                        ✕
                    </button>
                </div>

                {/* SCROLLABLE CONTENT */}
                <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6 scrollbar-hide">
                    {error && (
                        <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-2xl text-sm flex items-center gap-3">
                            <span className="material-symbols-outlined text-base">error</span>
                            {error}
                        </div>
                    )}

                    {step === 'identity' && (
                        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4">
                            <div className="space-y-2">
                                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider ml-1">Work Email</label>
                                <input
                                    type="email"
                                    placeholder="your@email.com"
                                    className="w-full p-4 bg-[#141414] border border-[#1A1A1A] rounded-2xl text-white focus:border-[#0046FB] outline-none transition-all"
                                    value={formData.email}
                                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                                />
                            </div>
                            <button onClick={checkIdentity} className="w-full bg-[#0046FB] hover:bg-[#003ccf] p-4 rounded-2xl text-white font-bold transition-all flex justify-center">
                                {loading ? <span className="animate-pulse">Checking...</span> : "Continue"}
                            </button>
                        </div>
                    )}

                    {step === 'login' && (
                        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4">
                            <div className="relative space-y-2">
                                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider ml-1">Password</label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        placeholder="Enter your password"
                                        className="w-full p-4 bg-[#141414] border border-[#1A1A1A] rounded-2xl text-white focus:border-[#0046FB] outline-none transition-all"
                                        value={formData.password}
                                        onChange={e => setFormData({ ...formData, password: e.target.value })}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                                    >
                                        <span className="material-symbols-outlined">
                                            {showPassword ? 'visibility_off' : 'visibility'}
                                        </span>
                                    </button>
                                </div>
                            </div>
                            <button onClick={handleLogin} className="w-full bg-[#0046FB] hover:bg-[#003ccf] p-4 rounded-2xl text-white font-bold">
                                {loading ? "Verifying..." : "Sign In & Continue"}
                            </button>
                        </div>
                    )}

                    {step === 'profile' && (
                        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <input placeholder="First Name" className="w-full p-4 bg-[#141414] border border-[#1A1A1A] rounded-2xl text-white focus:border-[#0046FB] outline-none"
                                        onChange={e => setFormData({ ...formData, first_name: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <input placeholder="Last Name" className="w-full p-4 bg-[#141414] border border-[#1A1A1A] rounded-2xl text-white focus:border-[#0046FB] outline-none"
                                        onChange={e => setFormData({ ...formData, last_name: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="relative">
                                <input
                                    type="password"
                                    placeholder="Create Password"
                                    className="w-full p-4 bg-[#141414] border border-[#1A1A1A] rounded-2xl text-white focus:border-[#0046FB] outline-none"
                                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                                />
                            </div>

                            <div className="p-4 bg-[#111111] rounded-2xl space-y-2 border border-[#1A1A1A]">
                                <p className="text-[10px] font-bold text-gray-500 uppercase mb-2">Security Requirements</p>
                                <div className="grid grid-cols-2 gap-2 text-[11px]">
                                    <div className={`flex items-center gap-2 ${passwordRequirements.length ? "text-green-400" : "text-gray-500"}`}>
                                        <span className="material-symbols-outlined text-xs">{passwordRequirements.length ? 'check_circle' : 'circle'}</span> 10+ Characters
                                    </div>
                                    <div className={`flex items-center gap-2 ${passwordRequirements.hasUpper ? "text-green-400" : "text-gray-500"}`}>
                                        <span className="material-symbols-outlined text-xs">{passwordRequirements.hasUpper ? 'check_circle' : 'circle'}</span> Uppercase
                                    </div>
                                    <div className={`flex items-center gap-2 ${passwordRequirements.hasLower ? "text-green-400" : "text-gray-500"}`}>
                                        <span className="material-symbols-outlined text-xs">{passwordRequirements.hasLower ? 'check_circle' : 'circle'}</span> Lowercase
                                    </div>
                                    <div className={`flex items-center gap-2 ${passwordRequirements.hasSymbol ? "text-green-400" : "text-gray-500"}`}>
                                        <span className="material-symbols-outlined text-xs">{passwordRequirements.hasSymbol ? 'check_circle' : 'circle'}</span> Symbol
                                    </div>
                                </div>
                            </div>

                            <select className="w-full p-4 bg-[#141414] border border-[#1A1A1A] rounded-2xl text-white focus:border-[#0046FB] outline-none appearance-none"
                                onChange={e => setFormData({ ...formData, state: e.target.value })}
                            >
                                <option value="">Select State</option>
                                {NIGERIA_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>

                            <button
                                disabled={!isPasswordValid}
                                onClick={() => setStep('details')}
                                className="w-full bg-[#0046FB] p-4 rounded-2xl text-white font-bold disabled:opacity-50 transition-all"
                            >
                                Continue
                            </button>
                        </div>
                    )}

                    {step === 'details' && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                            <div className="space-y-2">
                                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider ml-1">Project Description</label>
                                <textarea
                                    placeholder="Tell us what you need. Be as detailed as possible..."
                                    className="w-full p-4 bg-[#141414] border border-[#1A1A1A] rounded-2xl text-white focus:border-[#0046FB] outline-none min-h-[120px] resize-none"
                                    value={description}
                                    onChange={e => setDescription(e.target.value)}
                                />
                            </div>

                            {/* AUDIO SECTION */}
                            <div className="space-y-3">
                                <p className="text-[10px] font-black uppercase text-gray-500 tracking-widest ml-1">Voice Brief</p>
                                {!isRecording && !audioBlob && (
                                    <button onClick={startRecording} className="w-full p-4 bg-[#141414] border border-[#1A1A1A] rounded-2xl text-white flex items-center justify-center gap-2 hover:bg-[#1A1A1A] transition-colors">
                                        <span className="material-symbols-outlined text-primary">mic</span> Add a voice note
                                    </button>
                                )}

                                {isRecording && (
                                    <div className="p-4 bg-red-500/5 border border-red-500/20 rounded-2xl flex justify-between items-center">
                                        <div className="flex items-center gap-3">
                                            <span className="flex h-2 w-2 rounded-full bg-red-500 animate-ping"></span>
                                            <span className="text-red-400 font-mono">{formatTime(recordingTime)}</span>
                                        </div>
                                        <div className="flex gap-2">
                                            <button onClick={isPaused ? resumeRecording : pauseRecording} className="p-2 bg-[#1A1A1A] rounded-full text-white">
                                                <span className="material-symbols-outlined text-sm">{isPaused ? 'play_arrow' : 'pause'}</span>
                                            </button>
                                            <button onClick={stopRecording} className="p-2 bg-red-500 rounded-full text-white">
                                                <span className="material-symbols-outlined text-sm">stop</span>
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {audioBlob && (
                                    <div className="space-y-3 bg-[#111111] p-4 rounded-2xl border border-[#1A1A1A]">
                                        <div className="flex justify-between items-center">
                                            <span className="text-xs text-green-400 flex items-center gap-1">
                                                <span className="material-symbols-outlined text-sm">check_circle</span> Recorded
                                            </span>
                                            <button onClick={() => setAudioBlob(null)} className="text-red-400 text-xs font-bold">Delete</button>
                                        </div>
                                        <audio controls src={URL.createObjectURL(audioBlob)} className="w-full h-8" />
                                    </div>
                                )}
                            </div>

                            {/* MEDIA SECTION */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-3">
                                    <p className="text-[10px] font-black uppercase text-gray-500 tracking-widest ml-1">Images ({images.length}/5)</p>
                                    <div className="grid grid-cols-3 gap-2">
                                        {images.map((img, i) => (
                                            <div key={i} className="relative aspect-square rounded-xl overflow-hidden border border-[#1A1A1A]">
                                                <img src={URL.createObjectURL(img)} className="w-full h-full object-cover" alt="" />
                                                <button onClick={() => setImages(images.filter((_, idx) => idx !== i))} className="absolute top-1 right-1 bg-black/60 rounded-full p-1"><span className="material-symbols-outlined text-[12px] text-white">close</span></button>
                                            </div>
                                        ))}
                                        {images.length < 5 && (
                                            <label className="aspect-square flex flex-col items-center justify-center border-2 border-dashed border-[#1A1A1A] rounded-xl cursor-pointer hover:bg-[#141414] transition-colors">
                                                <span className="material-symbols-outlined text-gray-500">add_a_photo</span>
                                                <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => {
                                                    const files = Array.from(e.target.files || []);
                                                    try { validateFiles(files); setImages(prev => [...prev, ...files].slice(0, 5)); } catch (err: any) { alert(err.message); }
                                                }} />
                                            </label>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <p className="text-[10px] font-black uppercase text-gray-500 tracking-widest ml-1">Video (Max 1)</p>
                                    {!video ? (
                                        <label className="flex h-[80px] items-center justify-center border-2 border-dashed border-[#1A1A1A] rounded-xl cursor-pointer hover:bg-[#141414] transition-colors">
                                            <span className="material-symbols-outlined text-gray-500 mr-2">videocam</span>
                                            <span className="text-xs text-gray-400">Upload video</span>
                                            <input type="file" accept="video/*" className="hidden" onChange={async (e) => {
                                                const file = e.target.files?.[0] || null;
                                                if (!file) return;
                                                try { await validateMediaDuration([file]); validateFiles([file]); setVideo(file); } catch (err: any) { alert(err.message); }
                                            }} />
                                        </label>
                                    ) : (
                                        <div className="flex items-center justify-between bg-[#111111] border border-[#1A1A1A] rounded-xl p-4 h-[80px]">
                                            <div className="flex items-center gap-3 overflow-hidden">
                                                <span className="material-symbols-outlined text-[#0046FB]">movie</span>
                                                <p className="text-xs text-white truncate">{video.name}</p>
                                            </div>
                                            <button onClick={() => setVideo(null)} className="text-red-500"><span className="material-symbols-outlined">delete</span></button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {step === 'uploading' && (
                        <div className="flex flex-col items-center justify-center py-20 space-y-4">
                            <div className="w-12 h-12 border-4 border-[#0046FB] border-t-transparent rounded-full animate-spin"></div>
                            <p className="text-gray-400 animate-pulse">Processing your request...</p>
                        </div>
                    )}
                </div>

                {/* FIXED FOOTER (Desktop & Mobile) */}
                {step === 'details' && (
                    <div className="shrink-0 p-6 sm:p-8 border-t border-[#1A1A1A] bg-[#0C0C0C]">
                        <button
                            onClick={handleSubmit}
                            disabled={!description}
                            className="w-full bg-[#0046FB] hover:bg-[#003ccf] p-4 rounded-2xl text-white font-bold transition-all shadow-lg shadow-blue-900/20 disabled:opacity-50"
                        >
                            Submit Quote Request
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};