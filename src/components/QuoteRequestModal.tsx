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
    const [images, setImages] = useState<File[]>([]);
    const [video, setVideo] = useState<File | null>();

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
    // 🎤 AUDIO
    const MAX_AUDIO_DURATION = 5 * 60; // 5 minutes
    const MAX_AUDIO_SIZE = 15 * 1024 * 1024; // 15MB

    const startRecording = async () => {
        if (isRecording) return;

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

            const recorder = new MediaRecorder(stream);
            mediaRecorder.current = recorder;

            const chunks: BlobPart[] = [];

            recorder.ondataavailable = (e) => {
                if (e.data.size > 0) chunks.push(e.data);
            };

            recorder.onstop = async () => {
                const blob = new Blob(chunks, { type: 'audio/webm' });

                try {
                    // ✅ Validate duration using real metadata
                    const audio = document.createElement("audio");
                    audio.src = URL.createObjectURL(blob);

                    await new Promise((resolve) => {
                        audio.onloadedmetadata = resolve;
                    });

                    if (audio.duration > MAX_AUDIO_DURATION) {
                        alert("Voice note too long (max 10 minutes)");
                        setAudioBlob(null);
                        return;
                    }

                    // ✅ Validate size
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

            // ✅ Timer with auto-stop
            timerRef.current = window.setInterval(() => {
                setRecordingTime(prev => {
                    const next = prev + 1;

                    if (next >= MAX_AUDIO_DURATION) {
                        stopRecording(); // 🔥 auto stop at 10 mins
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

        if (mediaRecorder.current.state !== "inactive") {
            mediaRecorder.current.stop();
        }

        mediaRecorder.current.stream.getTracks().forEach(track => track.stop());

        setIsRecording(false);
        setIsPaused(false);

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

            timerRef.current = window.setInterval(() => {
                setRecordingTime(prev => {
                    const next = prev + 1;

                    if (next >= MAX_AUDIO_DURATION) {
                        stopRecording();
                    }

                    return next;
                });
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
            let currentUserId = user?.id;
            if (!user) {
                try {
                    await api.post('/auth/signup', {
                        ...formData,
                        country: 'Nigeria'
                    });


                    // Log them in to get the session/token
                    // IMPORTANT: We need the user object returned from this flow
                    const loginSuccess = await login(formData.email, formData.password);

                    if (!loginSuccess) {
                        throw new Error("Login failed after signup");
                    }

                    // Since React state 'user' is still null here, 
                    // we fetch the user manually or from the login result if possible.
                    // For now, let's fetch the fresh user directly so we have an ID.
                    const userRes = await api.get('/auth/user');
                    currentUserId = userRes.data.id;
                } catch (err: any) {
                    const msg = err.response?.data?.error || "Authentication failed.";
                    setError(msg);
                    setStep(step === 'profile' ? 'profile' : 'login');
                    return;
                }
            }


            const attachmentKeys = await Promise.all(images.map(async (file) => {
                // configure a random key to generate object key

                const ext = file.name.split('.').pop();
                const random = crypto.randomUUID(); // ✅ modern + collision-safe
                const object_key = `qr/attachments/${Date.now()}-${random}.${ext}`
                const mime_type = file.type || 'application/octet-stream'
                const { data } = await api.post('/storage/presign', {
                    object_key,
                    mime_type,
                    visibility: "private",
                });
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
                const { data } = await api.post('/storage/presign', {
                    object_key: object_key, mime_type: 'audio/webm', visibility: "private",
                });
                await fetch(data.upload_url, {
                    method: "PUT",
                    body: audioBlob,

                });
                vnKey = data.object_key;
            }
            let video_key = "";

            if (video) {
                const ext = video.name.split('.').pop();
                const random = crypto.randomUUID(); // ✅ modern + collision-safe
                const object_key = `qr/videos/${Date.now()}-${random}.${ext}`
                const mime_type = video.type || 'application/octet-stream'
                const { data } = await api.post('/storage/presign', {
                    object_key,
                    mime_type,
                    visibility: "private",
                });
                // console.log(data)
                await fetch(data.upload_url, {
                    method: "PUT",
                    body: video,


                });

                video_key = data.object_key
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
            const qr = res.data.quote_request

            navigate(`/dashboard/qr/${res.data.quote_request.id}`, { state: { qr } });
            onClose();
        } catch (err: any) {
            console.error(err);

            const msg =
                err?.message ||
                err?.response?.data?.error ||
                "Something went wrong. Please try again.";

            setError(msg);
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
                                placeholder="Describe your request in details, you can utilize the video and audio feature for more description..."
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
                            {/* choose images */}
                            <div className="space-y-3">
                                <p className="text-[10px] font-black uppercase text-gray-500 tracking-widest">
                                    Images (Max 5)
                                </p>

                                {images.length < 5 && (
                                    <label className="flex flex-col items-center justify-center border-2 border-dashed border-[#1A1A1A] rounded-2xl p-6 cursor-pointer hover:border-primary/50 transition-all">
                                        <span className="material-symbols-outlined text-2xl text-gray-500 mb-2">image</span>
                                        <p className="text-xs text-gray-400">Click to upload images</p>

                                        <input
                                            type="file"
                                            accept="image/jpeg,image/png,image/webp"
                                            multiple
                                            className="hidden"
                                            onChange={(e) => {
                                                const files = Array.from(e.target.files || []);

                                                try {
                                                    validateFiles(files);
                                                    setImages(files.slice(0, 5));
                                                } catch (err: any) {
                                                    alert(err.message);
                                                    e.target.value = "";
                                                }
                                            }}


                                        />
                                    </label>
                                )}

                                {/* Preview */}
                                <div className="grid grid-cols-3 gap-3">
                                    {images.map((img, i) => (
                                        <div key={i} className="relative group aspect-square rounded-xl overflow-hidden border border-[#1A1A1A]">
                                            <img
                                                src={URL.createObjectURL(img)}
                                                className="w-full h-full object-cover"
                                            />

                                            <button
                                                onClick={() => setImages(images.filter((_, idx) => idx !== i))}
                                                className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition"
                                            >
                                                <span className="material-symbols-outlined text-sm">close</span>
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-3 mt-6">
                                <p className="text-[10px] font-black uppercase text-gray-500 tracking-widest">
                                    Video (Max 1)
                                </p>

                                {!video ? (
                                    <label className="flex items-center justify-center border-2 border-dashed border-[#1A1A1A] rounded-2xl p-6 cursor-pointer hover:border-primary/50 transition-all">
                                        <span className="material-symbols-outlined text-xl text-gray-500 mr-2">videocam</span>
                                        <span className="text-xs text-gray-400">Upload a short video</span>

                                        <input
                                            type="file"
                                            accept="video/mp4,video/webm, video/mkv"
                                            className="hidden"
                                            onChange={async (e) => {
                                                const file = e.target.files?.[0] || null;

                                                if (!file) return;

                                                try {
                                                    await validateMediaDuration([file]);
                                                    validateFiles([file]);

                                                    setVideo(file);
                                                } catch (err: any) {
                                                    alert(err.message); // 🔥 immediate feedback
                                                    e.target.value = ""; // reset input
                                                }
                                            }}

                                        />
                                    </label>
                                ) : (
                                    <div className="flex items-center justify-between bg-[#111111] border border-[#1A1A1A] rounded-xl p-4">
                                        <div className="flex items-center gap-3">
                                            <span className="material-symbols-outlined text-primary">videocam</span>
                                            <p className="text-xs text-white truncate max-w-[180px]">{video.name}</p>
                                        </div>

                                        <button
                                            onClick={() => setVideo(null)}
                                            className="text-red-500 hover:text-red-400"
                                        >
                                            <span className="material-symbols-outlined">delete</span>
                                        </button>
                                    </div>
                                )}
                            </div>

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