import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
    Video, Upload, FileVideo, CheckCircle, AlertTriangle, Brain,
    ShieldCheck, Clock, FileText, ChevronRight, ChevronDown, ChevronUp,
    Zap, AlertCircle, Download, Calendar, User, Stethoscope,
    Activity, Sparkles, Lock, TrendingUp, Eye, Hand, Smile, ArrowRight
} from 'lucide-react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, Cell
} from 'recharts';

// ─── Mock data ───────────────────────────────────────────────────────────────

const MOCK_RESULT = {
    riskScore: 72,
    confidence: 84,
    riskLevel: 'HIGH', // 'HIGH' | 'MODERATE' | 'LOW'
    shapFeatures: [
        { name: 'Eye Contact', value: 32, impact: 0.28, status: 'concerning' },
        { name: 'Gesture Freq.', value: 78, impact: -0.12, status: 'normal' },
        { name: 'Facial Expression', value: 41, impact: 0.19, status: 'borderline' },
        { name: 'Response to Name', value: 28, impact: 0.31, status: 'concerning' },
        { name: 'Joint Attention', value: 48, impact: 0.17, status: 'borderline' },
        { name: 'Body Orientation', value: 72, impact: -0.09, status: 'normal' },
    ],
    behavioralInsights: [
        'Limited eye contact: Detected gaze directed at caregiver only 18% of observation time (typical range: 40–60%).',
        'Reduced gestural communication: Only 3 pointing gestures observed across the full 4-minute session.',
        'Repetitive body movement: Identified hand-flapping pattern consistently at 1:23–1:45.',
        'Delayed name response: Child responded to name call after 3+ attempts in 2 of 3 observed trials.',
    ],
    timeline: [
        { time: '0:34', event: 'Brief eye contact with caregiver' },
        { time: '0:58', event: 'Minimal response to name (attempt 1)' },
        { time: '1:12', event: 'Eye contact — self-initiated' },
        { time: '1:23', event: 'Repetitive hand movement begins' },
        { time: '1:45', event: 'Repetitive hand movement ends' },
        { time: '2:20', event: 'No response to name (attempt 3)' },
        { time: '2:45', event: 'Brief eye contact during toy play' },
    ],
    recommendations: [
        'Schedule a comprehensive diagnostic evaluation with a developmental pediatrician.',
        'Consult with a board-certified speech-language pathologist for communication assessment.',
        'Consider early intervention programs — earlier support leads to better outcomes.',
        'Track your child\'s development with NeuroAlign\'s monitoring tools between sessions.',
    ],
};

// Processing steps shown during AI analysis
const PROCESSING_STEPS = [
    { id: 1, label: 'Video uploaded successfully', sub: null },
    {
        id: 2, label: 'Analyzing behavioral patterns…', sub: [
            'Detecting facial landmarks (MediaPipe)',
            'Tracking eye gaze & attention',
            'Analyzing gestures & body language',
            'Running CNN feature extraction',
            'Computing risk score (Random Forest)',
        ]
    },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

const getRiskConfig = (riskLevel) => {
    if (riskLevel === 'HIGH') return {
        gradient: 'from-red-50 to-amber-50',
        border: 'border-red-200',
        badge: 'bg-red-100 text-red-700',
        icon: <AlertTriangle className="w-8 h-8 text-amber-600" />,
        iconBg: 'bg-amber-100',
        title: 'Early Risk Flag Detected',
        titleColor: 'text-red-800',
        scoreColor: 'text-red-700',
        description: "Based on the video analysis, we detected several behavioral patterns that may warrant further evaluation. This is NOT a diagnosis — it's an early indicator to help you take the next step.",
        pill: { bg: 'bg-amber-100', text: 'text-amber-800', label: 'Further Evaluation Recommended' },
    };
    if (riskLevel === 'MODERATE') return {
        gradient: 'from-yellow-50 to-amber-50',
        border: 'border-yellow-200',
        badge: 'bg-yellow-100 text-yellow-800',
        icon: <Zap className="w-8 h-8 text-yellow-600" />,
        iconBg: 'bg-yellow-100',
        title: 'Some Behavioral Patterns Noted',
        titleColor: 'text-yellow-800',
        scoreColor: 'text-yellow-700',
        description: 'The analysis shows mixed patterns. We recommend a follow-up screening or consultation with a specialist for a comprehensive evaluation.',
        pill: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Follow-Up Recommended' },
    };
    return {
        gradient: 'from-green-50 to-teal-50',
        border: 'border-green-200',
        badge: 'bg-green-100 text-green-800',
        icon: <CheckCircle className="w-8 h-8 text-green-600" />,
        iconBg: 'bg-green-100',
        title: 'Low Risk Detected',
        titleColor: 'text-green-800',
        scoreColor: 'text-green-700',
        description: 'The video shows typical developmental patterns. Continue monitoring your child\'s development. If you have ongoing concerns, consult your pediatrician.',
        pill: { bg: 'bg-green-100', text: 'text-green-800', label: 'Typical Development Patterns' },
    };
};

const barColor = (status) => {
    if (status === 'normal') return '#7BA08C';
    if (status === 'borderline') return '#FFA726';
    return '#FF8C6B';
};

const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
        const d = payload[0].payload;
        return (
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-3 text-sm">
                <p className="font-bold text-gray-800">{d.name}</p>
                <p className="text-gray-600">Score: <span className="font-semibold">{d.value}%</span></p>
                <p className={d.impact > 0 ? 'text-red-500' : 'text-green-600'}>
                    SHAP impact: {d.impact > 0 ? '+' : ''}{d.impact.toFixed(2)}
                </p>
            </div>
        );
    }
    return null;
};

// ─── Step Progress ────────────────────────────────────────────────────────────

const STEPS = [
    { n: 1, label: 'Child Info' },
    { n: 2, label: 'Upload' },
    { n: 3, label: 'Results' },
    { n: 4, label: 'Analysis' },
    { n: 5, label: 'Next Steps' },
];

const StepProgress = ({ current }) => (
    <div className="flex items-center justify-center mb-10 gap-0">
        {STEPS.map((step, idx) => {
            const done = current > step.n;
            const active = current === step.n;
            return (
                <React.Fragment key={step.n}>
                    <div className="flex flex-col items-center">
                        <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 ${done ? 'bg-[#2F7A7A] text-white shadow-md' :
                                active ? 'bg-[#2F7A7A] text-white ring-4 ring-teal-100 shadow-lg scale-110' :
                                    'bg-gray-100 text-gray-400'
                            }`}>
                            {done ? <CheckCircle size={16} /> : step.n}
                        </div>
                        <span className={`text-xs mt-1.5 font-medium whitespace-nowrap ${active ? 'text-[#2F7A7A]' : done ? 'text-[#2F7A7A]/70' : 'text-gray-400'
                            }`}>{step.label}</span>
                    </div>
                    {idx < STEPS.length - 1 && (
                        <div className={`h-0.5 w-10 md:w-16 mb-5 mx-1 transition-all duration-500 ${done ? 'bg-[#2F7A7A]' : 'bg-gray-200'}`} />
                    )}
                </React.Fragment>
            );
        })}
    </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────

const Screening = () => {
    const [currentStep, setCurrentStep] = useState(1);

    // Step 1 — Child Info
    const [childInfo, setChildInfo] = useState({ name: '', dob: '', relationship: '' });
    const [ageMonths, setAgeMonths] = useState(null);

    // Step 2 — Video Upload
    const [videoFile, setVideoFile] = useState(null);
    const [isDragging, setIsDragging] = useState(false);
    const [tipsOpen, setTipsOpen] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [uploadPhase, setUploadPhase] = useState('idle'); // idle | uploading | processing | complete
    const [processStep, setProcessStep] = useState(0); // which processing substep
    const [processSubStep, setProcessSubStep] = useState(0);
    const [frameProgress, setFrameProgress] = useState({ current: 0, total: 312 });

    // Results
    const [result, setResult] = useState(null);

    const fileInputRef = useRef(null);
    const resultsRef = useRef(null);
    const step4Ref = useRef(null);
    const step5Ref = useRef(null);

    // Calculate age in months when DOB changes
    useEffect(() => {
        if (childInfo.dob) {
            const parts = childInfo.dob.split('-');
            if (parts.length === 3) {
                const [d, m, y] = parts;
                const birth = new Date(`${y}-${m}-${d}`);
                if (!isNaN(birth)) {
                    const now = new Date();
                    const months = (now.getFullYear() - birth.getFullYear()) * 12 +
                        (now.getMonth() - birth.getMonth());
                    setAgeMonths(Math.max(0, months));
                }
            }
        }
    }, [childInfo.dob]);

    // ── Drag & Drop ──────────────────────────────────────────────────────────
    const onDragOver = useCallback((e) => { e.preventDefault(); setIsDragging(true); }, []);
    const onDragLeave = useCallback(() => setIsDragging(false), []);
    const onDrop = useCallback((e) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files?.[0];
        if (file && file.type.startsWith('video/')) {
            setVideoFile(file);
        }
    }, []);

    const onFileChange = (e) => {
        setVideoFile(e.target.files?.[0] || null);
    };

    // ── Simulate Upload + Processing ─────────────────────────────────────────
    const runSimulation = () => {
        setUploadPhase('uploading');
        setUploadProgress(0);

        // Simulate upload progress
        let pct = 0;
        const uploadTimer = setInterval(() => {
            pct += Math.random() * 12 + 3;
            if (pct >= 100) {
                pct = 100;
                clearInterval(uploadTimer);
                setUploadProgress(100);
                setTimeout(() => startProcessing(), 600);
            }
            setUploadProgress(Math.min(pct, 100));
        }, 200);
    };

    const startProcessing = () => {
        setUploadPhase('processing');
        setProcessStep(1);
        setProcessSubStep(0);

        // Animate sub-steps
        const subs = PROCESSING_STEPS[1].sub;
        let si = 0;
        const subTimer = setInterval(() => {
            si++;
            if (si >= subs.length) {
                clearInterval(subTimer);
                setTimeout(() => finishProcessing(), 800);
            }
            setProcessSubStep(si);
        }, 900);

        // Frame counter
        let frame = 0;
        const frameTimer = setInterval(() => {
            frame += Math.floor(Math.random() * 8 + 4);
            if (frame >= 312) { clearInterval(frameTimer); frame = 312; }
            setFrameProgress(prev => ({ ...prev, current: frame }));
        }, 150);
    };

    const finishProcessing = () => {
        setUploadPhase('complete');
        setResult(MOCK_RESULT);
        setTimeout(() => {
            setCurrentStep(3);
            setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
        }, 1200);
    };

    const handleAnalyze = () => {
        if (!videoFile) return;
        runSimulation();
    };

    // ── Step validation ───────────────────────────────────────────────────────
    const canProceedStep1 = childInfo.name.trim() && childInfo.dob.trim() && childInfo.relationship;

    const formatFileSize = (bytes) => {
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    };

    // ─── Render ───────────────────────────────────────────────────────────────
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-teal-50/30 to-slate-50 pb-24">

            {/* Hero Banner */}
            <div className="bg-gradient-to-br from-[#1E5F5F] via-[#2F7A7A] to-[#3A8F8F] text-white pt-16 pb-52 relative overflow-hidden">
                <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
                <div className="container mx-auto px-6 relative">
                    <div className="flex flex-wrap items-center gap-3 mb-5">
                        <div className="flex items-center gap-2 bg-white/15 backdrop-blur-sm px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider border border-white/20">
                            <Sparkles size={12} /> AI-Powered Analysis
                        </div>
                        <div className="flex items-center gap-2 bg-white/15 backdrop-blur-sm px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider border border-white/20">
                            <ShieldCheck size={12} /> HIPAA Compliant
                        </div>
                        <div className="flex items-center gap-2 bg-white/15 backdrop-blur-sm px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider border border-white/20">
                            <Lock size={12} /> Encrypted &amp; Private
                        </div>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-serif font-semibold mb-4 leading-tight max-w-2xl">
                        Early Screening — From the Comfort of Home
                    </h1>
                    <p className="text-lg text-white/80 max-w-xl leading-relaxed">
                        Upload a short video of your child's natural behavior. Our AI analyzes behavioral markers using clinically validated models and explains every insight.
                    </p>
                    <div className="flex flex-wrap gap-8 mt-8">
                        {[
                            { icon: <Brain size={22} />, val: '12+', label: 'Behavioral markers' },
                            { icon: <Activity size={22} />, val: '95%', label: 'Accuracy rate' },
                            { icon: <Clock size={22} />, val: '<5 min', label: 'Analysis time' },
                        ].map(({ icon, val, label }) => (
                            <div key={label} className="flex items-center gap-3">
                                <div className="bg-white/20 p-2 rounded-lg">{icon}</div>
                                <div>
                                    <div className="text-xl font-bold">{val}</div>
                                    <div className="text-xs text-white/70">{label}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Main Card */}
            <div className="container mx-auto px-4 md:px-6 -mt-40 relative z-10">
                <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 p-6 md:p-10 max-w-4xl mx-auto">

                    {/* Step Progress */}
                    <StepProgress current={currentStep} />

                    {/* ════════════════════════ STEP 1 ═══════════════════════════ */}
                    {currentStep === 1 && (
                        <div className="animate-fade-in max-w-lg mx-auto">
                            <h2 className="text-2xl font-serif font-bold text-gray-800 mb-1">Let's start with your child</h2>
                            <p className="text-gray-500 mb-8">This helps us personalize the screening results.</p>

                            <div className="space-y-5">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Child's first name</label>
                                    <div className="relative">
                                        <User size={16} className="absolute left-3.5 top-3.5 text-gray-400" />
                                        <input
                                            type="text"
                                            placeholder="e.g. Emma"
                                            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-300 focus:border-teal-400 transition text-gray-800 bg-gray-50"
                                            value={childInfo.name}
                                            onChange={(e) => setChildInfo({ ...childInfo, name: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Date of birth</label>
                                    <div className="relative">
                                        <Calendar size={16} className="absolute left-3.5 top-3.5 text-gray-400" />
                                        <input
                                            type="text"
                                            placeholder="dd-mm-yyyy"
                                            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-300 focus:border-teal-400 transition text-gray-800 bg-gray-50"
                                            value={childInfo.dob}
                                            onChange={(e) => setChildInfo({ ...childInfo, dob: e.target.value })}
                                        />
                                    </div>
                                    {ageMonths !== null && (
                                        <p className="text-sm text-teal-600 font-medium mt-1.5 pl-1">
                                            Age: {ageMonths} months
                                            {ageMonths < 18 && ' — within the critical early detection window 🌟'}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Your relationship to the child</label>
                                    <div className="relative">
                                        <Stethoscope size={16} className="absolute left-3.5 top-3.5 text-gray-400 pointer-events-none" />
                                        <select
                                            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-300 focus:border-teal-400 transition text-gray-800 bg-gray-50 appearance-none cursor-pointer"
                                            value={childInfo.relationship}
                                            onChange={(e) => setChildInfo({ ...childInfo, relationship: e.target.value })}
                                            style={{ backgroundImage: 'none' }}
                                        >
                                            <option value="">Select…</option>
                                            <option value="parent">Parent</option>
                                            <option value="guardian">Guardian</option>
                                            <option value="provider">Healthcare Provider</option>
                                            <option value="other">Other Caregiver</option>
                                        </select>
                                        <ChevronDown size={16} className="absolute right-3.5 top-3.5 text-gray-400 pointer-events-none" />
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={() => setCurrentStep(2)}
                                disabled={!canProceedStep1}
                                className="mt-8 w-full bg-[#2F7A7A] hover:bg-[#266666] disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 flex items-center justify-center gap-2"
                            >
                                Continue to Video Upload <ChevronRight size={18} />
                            </button>
                            <p className="text-center text-xs text-gray-400 mt-3 flex items-center justify-center gap-1">
                                <Lock size={11} /> Your information is private and HIPAA-compliant
                            </p>
                        </div>
                    )}

                    {/* ════════════════════════ STEP 2 ═══════════════════════════ */}
                    {currentStep === 2 && (
                        <div className="animate-fade-in">
                            <div className="flex items-center gap-3 mb-1">
                                <div className="bg-teal-100 p-2 rounded-lg text-[#2F7A7A]"><Video size={20} /></div>
                                <div>
                                    <h2 className="text-2xl font-serif font-bold text-gray-800">Video Analysis</h2>
                                    <p className="text-gray-500 text-sm">Upload a short clip of natural behavior</p>
                                </div>
                            </div>

                            <div className="mt-6 space-y-6">

                                {/* Upload Zone */}
                                {uploadPhase === 'idle' && (
                                    <>
                                        <div
                                            onDragOver={onDragOver}
                                            onDragLeave={onDragLeave}
                                            onDrop={onDrop}
                                            onClick={() => !videoFile && fileInputRef.current?.click()}
                                            className={`relative border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-200 cursor-pointer ${isDragging ? 'border-[#2F7A7A] bg-teal-50 scale-[1.01]' :
                                                    videoFile ? 'border-[#2F7A7A]/40 bg-teal-50/30' :
                                                        'border-gray-200 bg-gray-50 hover:border-[#2F7A7A]/50 hover:bg-teal-50/20'
                                                }`}
                                        >
                                            <input
                                                ref={fileInputRef}
                                                type="file"
                                                className="hidden"
                                                accept=".mp4,.mov,.webm,video/*"
                                                onChange={onFileChange}
                                            />

                                            {videoFile ? (
                                                <div className="flex flex-col items-center">
                                                    <div className="bg-teal-100 p-4 rounded-full mb-4 text-[#2F7A7A]">
                                                        <FileVideo size={36} />
                                                    </div>
                                                    <div className="text-lg font-bold text-gray-800 mb-1 max-w-xs truncate">{videoFile.name}</div>
                                                    <div className="text-sm text-gray-500 mb-4">{formatFileSize(videoFile.size)}</div>
                                                    <div className="flex gap-3">
                                                        <button
                                                            type="button"
                                                            onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
                                                            className="text-sm text-[#2F7A7A] font-semibold border border-teal-300 px-4 py-1.5 rounded-full hover:bg-teal-50 transition"
                                                        >
                                                            Change video
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={(e) => { e.stopPropagation(); setVideoFile(null); }}
                                                            className="text-sm text-gray-400 font-semibold border border-gray-200 px-4 py-1.5 rounded-full hover:bg-gray-50 transition"
                                                        >
                                                            Remove
                                                        </button>
                                                    </div>
                                                    <p className="text-xs text-teal-600 mt-4 font-medium">✓ Great video! This will help us give you accurate results.</p>
                                                </div>
                                            ) : (
                                                <div className="flex flex-col items-center">
                                                    <div className={`p-5 rounded-full mb-5 transition-colors ${isDragging ? 'bg-teal-100 text-[#2F7A7A]' : 'bg-gray-100 text-gray-400'}`}>
                                                        <Upload size={32} />
                                                    </div>
                                                    <p className="text-lg font-bold text-gray-700 mb-1">
                                                        {isDragging ? 'Drop your video here' : 'Click to upload or drag & drop'}
                                                    </p>
                                                    <p className="text-sm text-gray-400">MP4, MOV, WebM supported — up to 500 MB</p>
                                                </div>
                                            )}
                                        </div>

                                        {/* Tips Accordion */}
                                        <div className="border border-gray-100 rounded-2xl overflow-hidden">
                                            <button
                                                type="button"
                                                onClick={() => setTipsOpen(!tipsOpen)}
                                                className="w-full flex items-center justify-between px-5 py-4 text-left bg-gray-50 hover:bg-gray-100 transition"
                                            >
                                                <div className="flex items-center gap-2 font-semibold text-gray-700 text-sm">
                                                    <Video size={16} className="text-[#2F7A7A]" />
                                                    📹 Recording Tips — For the best analysis results
                                                </div>
                                                {tipsOpen ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
                                            </button>
                                            {tipsOpen && (
                                                <div className="px-5 py-4 bg-white border-t border-gray-100">
                                                    <ul className="space-y-2.5 text-sm text-gray-600">
                                                        {[
                                                            '2–5 minutes of natural play or mealtime',
                                                            'Good lighting (natural light preferred)',
                                                            "Child's face visible — no need for direct camera focus",
                                                            'Capture gestures, eye movements, interactions',
                                                            'No special setup — everyday moments work best',
                                                        ].map((tip) => (
                                                            <li key={tip} className="flex items-start gap-2">
                                                                <CheckCircle size={14} className="text-teal-500 mt-0.5 flex-shrink-0" />
                                                                {tip}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}
                                        </div>

                                        {/* Actions */}
                                        <div className="flex flex-col gap-3 pt-2">
                                            <button
                                                onClick={handleAnalyze}
                                                disabled={!videoFile}
                                                className="w-full bg-[#2F7A7A] hover:bg-[#266666] disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 flex items-center justify-center gap-2 text-lg"
                                            >
                                                <Sparkles size={20} /> Start AI Analysis
                                            </button>
                                            <button
                                                onClick={() => setCurrentStep(1)}
                                                className="w-full text-gray-400 hover:text-gray-600 text-sm font-medium transition py-2"
                                            >
                                                ← Back to Child Info
                                            </button>
                                        </div>
                                        <p className="text-center text-xs text-gray-400 flex items-center justify-center gap-1">
                                            <ShieldCheck size={12} /> Your data is encrypted and HIPAA-compliant. Never shared without your consent.
                                        </p>
                                    </>
                                )}

                                {/* ── Uploading State ── */}
                                {uploadPhase === 'uploading' && (
                                    <div className="text-center py-8 animate-fade-in">
                                        <div className="bg-teal-50 rounded-2xl p-8 border border-teal-100">
                                            <div className="flex items-center gap-3 mb-6">
                                                <div className="animate-pulse">
                                                    <Upload size={24} className="text-[#2F7A7A]" />
                                                </div>
                                                <div className="flex-1 text-left">
                                                    <div className="font-semibold text-gray-800 text-sm truncate max-w-xs">{videoFile?.name}</div>
                                                    <div className="text-xs text-gray-400">{formatFileSize(videoFile?.size || 0)}</div>
                                                </div>
                                            </div>
                                            <div className="mb-3">
                                                <div className="flex justify-between text-sm font-medium text-gray-600 mb-2">
                                                    <span>Uploading video…</span>
                                                    <span>{Math.round(uploadProgress)}%</span>
                                                </div>
                                                <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-gradient-to-r from-[#2F7A7A] to-teal-400 rounded-full transition-all duration-300"
                                                        style={{ width: `${uploadProgress}%` }}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* ── Processing State ── */}
                                {uploadPhase === 'processing' && (
                                    <div className="py-4 animate-fade-in">
                                        <div className="bg-gradient-to-br from-teal-50 to-white rounded-2xl p-8 border border-teal-100">
                                            {/* Pulsing brain */}
                                            <div className="flex flex-col items-center mb-8">
                                                <div className="relative">
                                                    <div className="absolute inset-0 rounded-full bg-teal-400/20 animate-ping" />
                                                    <div className="relative bg-teal-100 p-5 rounded-full">
                                                        <Brain size={36} className="text-[#2F7A7A]" />
                                                    </div>
                                                </div>
                                                <div className="mt-5 text-center">
                                                    <p className="font-bold text-gray-800 text-lg">AI Analysis in Progress</p>
                                                    <p className="text-sm text-gray-500 mt-1">Estimated time: 2–3 minutes</p>
                                                    <p className="text-xs text-teal-600 font-medium mt-1">
                                                        Processing frame {frameProgress.current} of {frameProgress.total}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Progress steps */}
                                            <div className="space-y-4">
                                                <div className="flex items-center gap-3">
                                                    <CheckCircle size={18} className="text-teal-500 flex-shrink-0" />
                                                    <span className="text-sm font-semibold text-gray-700">Video uploaded successfully</span>
                                                </div>
                                                <div className="flex items-start gap-3 ml-0">
                                                    <div className="flex-shrink-0 mt-0.5">
                                                        <div className="w-4.5 h-4.5 rounded-full border-2 border-teal-400 border-t-transparent animate-spin" style={{ width: 18, height: 18 }} />
                                                    </div>
                                                    <div className="flex-1">
                                                        <span className="text-sm font-semibold text-gray-700">Analyzing behavioral patterns…</span>
                                                        <div className="mt-2 space-y-2 pl-1">
                                                            {PROCESSING_STEPS[1].sub.map((sub, i) => (
                                                                <div key={i} className={`flex items-center gap-2 text-xs transition-all duration-300 ${i < processSubStep ? 'text-teal-600 font-medium' :
                                                                        i === processSubStep ? 'text-gray-700 font-semibold' :
                                                                            'text-gray-300'
                                                                    }`}>
                                                                    {i < processSubStep ? (
                                                                        <CheckCircle size={12} className="text-teal-500 flex-shrink-0" />
                                                                    ) : i === processSubStep ? (
                                                                        <div className="w-2 h-2 rounded-full bg-teal-400 animate-pulse flex-shrink-0" />
                                                                    ) : (
                                                                        <div className="w-2 h-2 rounded-full bg-gray-200 flex-shrink-0" />
                                                                    )}
                                                                    ↳ {sub}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Progress bar */}
                                            <div className="mt-8">
                                                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-gradient-to-r from-[#2F7A7A] to-teal-400 rounded-full transition-all duration-500"
                                                        style={{ width: `${(processSubStep / (PROCESSING_STEPS[1].sub.length)) * 100}%` }}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* ── Complete State ── */}
                                {uploadPhase === 'complete' && (
                                    <div className="text-center py-10 animate-fade-in">
                                        <div className="bg-green-50 rounded-2xl p-10 border border-green-100">
                                            <div className="bg-green-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-5">
                                                <CheckCircle size={44} className="text-green-600" />
                                            </div>
                                            <h3 className="text-xl font-bold text-green-800 mb-2">Analysis Complete!</h3>
                                            <p className="text-gray-500 text-sm">Scrolling to your results…</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* ════════════════════════ STEP 3 — Risk Score ═══════════════ */}
                    {currentStep === 3 && result && (() => {
                        const config = getRiskConfig(result.riskLevel);
                        return (
                            <div ref={resultsRef} className="animate-fade-in">
                                <div className="flex items-center gap-2 text-gray-400 text-sm font-medium mb-6">
                                    <span>Screening results for</span>
                                    <span className="font-bold text-gray-700">{childInfo.name || 'your child'}</span>
                                    {ageMonths !== null && <span>· {ageMonths} months old</span>}
                                </div>

                                <div className={`bg-gradient-to-br ${config.gradient} border-2 ${config.border} rounded-3xl p-8 mb-8`}>
                                    <div className="flex flex-col md:flex-row md:items-start gap-6">
                                        <div className={`${config.iconBg} p-4 rounded-2xl self-start flex-shrink-0`}>
                                            {config.icon}
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex flex-wrap items-center gap-3 mb-3">
                                                <h2 className={`text-2xl font-serif font-bold ${config.titleColor}`}>{config.title}</h2>
                                                <span className={`${config.pill.bg} ${config.pill.text} text-xs font-bold px-3 py-1 rounded-full`}>
                                                    {config.pill.label}
                                                </span>
                                            </div>

                                            {/* Score Display */}
                                            <div className="flex items-center gap-6 mb-5">
                                                <div>
                                                    <div className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-1">Risk Score</div>
                                                    <div className={`text-5xl font-black ${config.scoreColor}`}>
                                                        {result.riskScore}<span className="text-2xl font-bold text-gray-400">/100</span>
                                                    </div>
                                                </div>
                                                <div className="h-14 w-px bg-gray-300" />
                                                <div>
                                                    <div className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-1">Confidence</div>
                                                    <div className="text-3xl font-black text-gray-700">{result.confidence}%</div>
                                                </div>
                                            </div>

                                            {/* Score bar */}
                                            <div className="mb-5">
                                                <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                                                    <div
                                                        className={`h-full rounded-full transition-all duration-1000 ${result.riskLevel === 'HIGH' ? 'bg-gradient-to-r from-amber-400 to-red-500' :
                                                                result.riskLevel === 'MODERATE' ? 'bg-gradient-to-r from-yellow-400 to-amber-500' :
                                                                    'bg-gradient-to-r from-teal-400 to-green-500'
                                                            }`}
                                                        style={{ width: `${result.riskScore}%` }}
                                                    />
                                                </div>
                                                <div className="flex justify-between text-xs text-gray-400 mt-1">
                                                    <span>Low Risk</span><span>Moderate</span><span>High Risk</span>
                                                </div>
                                            </div>

                                            <p className="text-gray-700 leading-relaxed">{config.description}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Disclaimer */}
                                <div className="bg-blue-50 border border-blue-100 rounded-2xl px-5 py-4 flex gap-3 mb-6">
                                    <AlertCircle size={18} className="text-blue-400 flex-shrink-0 mt-0.5" />
                                    <p className="text-sm text-blue-700">
                                        <strong>Important:</strong> This is a screening tool — not a clinical diagnosis. It identifies children who may benefit from further evaluation. Results should always be reviewed with a qualified healthcare professional.
                                    </p>
                                </div>

                                {/* Trust signals */}
                                <div className="flex flex-wrap gap-4 text-xs text-gray-500 mb-8">
                                    <span className="flex items-center gap-1.5"><ShieldCheck size={14} className="text-green-500" /> AI-powered using clinically validated models</span>
                                    <span className="flex items-center gap-1.5"><Brain size={14} className="text-[#2F7A7A]" /> Reviewed by developmental psychologists</span>
                                    <span className="flex items-center gap-1.5"><Lock size={14} className="text-gray-400" /> Results shared only with you</span>
                                </div>

                                <button
                                    onClick={() => { setCurrentStep(4); setTimeout(() => step4Ref.current?.scrollIntoView({ behavior: 'smooth' }), 100); }}
                                    className="w-full bg-[#2F7A7A] hover:bg-[#266666] text-white font-bold py-4 rounded-xl transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 flex items-center justify-center gap-2"
                                >
                                    View Detailed AI Analysis <ChevronRight size={18} />
                                </button>
                            </div>
                        );
                    })()}

                    {/* ════════════════════════ STEP 4 — SHAP ════════════════════ */}
                    {currentStep === 4 && result && (
                        <div ref={step4Ref} className="animate-fade-in">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="bg-teal-100 p-2 rounded-lg text-[#2F7A7A]"><TrendingUp size={20} /></div>
                                <div>
                                    <h2 className="text-2xl font-serif font-bold text-gray-800">What We Analyzed</h2>
                                    <p className="text-gray-500 text-sm">Understanding the AI's reasoning</p>
                                </div>
                            </div>

                            {/* Feature Breakdown Chart */}
                            <div className="bg-white border border-gray-100 rounded-2xl p-6 mb-6 shadow-sm mt-6">
                                <h3 className="font-bold text-gray-800 mb-1 flex items-center gap-2">
                                    <Activity size={16} className="text-[#2F7A7A]" /> Behavioral Feature Breakdown
                                </h3>
                                <p className="text-xs text-gray-400 mb-5">SHAP values show how each feature contributed to the risk score (+ increases risk, − decreases risk)</p>

                                <div className="flex flex-wrap gap-3 mb-5 text-xs font-medium">
                                    <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-[#7BA08C] inline-block" /> Normal range</span>
                                    <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-[#FFA726] inline-block" /> Borderline</span>
                                    <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-[#FF8C6B] inline-block" /> Concerning</span>
                                </div>

                                <ResponsiveContainer width="100%" height={260}>
                                    <BarChart
                                        data={result.shapFeatures}
                                        layout="vertical"
                                        margin={{ top: 0, right: 60, left: 10, bottom: 0 }}
                                    >
                                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f0f0f0" />
                                        <XAxis type="number" domain={[0, 100]} tickFormatter={(v) => `${v}%`} tick={{ fontSize: 11, fill: '#9ca3af' }} />
                                        <YAxis type="category" dataKey="name" width={115} tick={{ fontSize: 12, fill: '#374151', fontWeight: 500 }} />
                                        <Tooltip content={<CustomTooltip />} />
                                        <Bar dataKey="value" radius={[0, 6, 6, 0]} maxBarSize={26}>
                                            {result.shapFeatures.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={barColor(entry.status)} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>

                                {/* SHAP impact table */}
                                <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-2">
                                    {result.shapFeatures.map((f) => (
                                        <div key={f.name} className="bg-gray-50 rounded-lg px-3 py-2 flex justify-between items-center">
                                            <span className="text-xs text-gray-600 truncate mr-2">{f.name}</span>
                                            <span className={`text-xs font-bold flex-shrink-0 ${f.impact > 0 ? 'text-red-500' : 'text-green-600'}`}>
                                                {f.impact > 0 ? '+' : ''}{f.impact.toFixed(2)}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Key Behavioral Insights */}
                            <div className="bg-white border border-gray-100 rounded-2xl p-6 mb-6 shadow-sm">
                                <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                                    <Eye size={16} className="text-[#2F7A7A]" /> Key Behavioral Insights
                                </h3>
                                <ul className="space-y-3">
                                    {result.behavioralInsights.map((insight, i) => (
                                        <li key={i} className="flex gap-3">
                                            <div className="w-1.5 h-1.5 rounded-full bg-[#FF8C6B] flex-shrink-0 mt-2" />
                                            <p className="text-sm text-gray-700 leading-relaxed">{insight}</p>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Timeline */}
                            <div className="bg-white border border-gray-100 rounded-2xl p-6 mb-8 shadow-sm">
                                <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                                    <Clock size={16} className="text-[#2F7A7A]" /> Behavioral Timeline
                                </h3>
                                <div className="relative pl-4 border-l-2 border-teal-100 space-y-4">
                                    {result.timeline.map((event, i) => (
                                        <div key={i} className="flex items-start gap-3">
                                            <div className="absolute -left-1.5 w-3 h-3 rounded-full bg-teal-400 border-2 border-white" style={{ top: `${i * 52 + 4}px` }} />
                                            <div className="bg-teal-50 text-teal-700 text-xs font-bold px-2 py-1 rounded flex-shrink-0">{event.time}</div>
                                            <p className="text-sm text-gray-700 pt-0.5">{event.event}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <button
                                onClick={() => { setCurrentStep(5); setTimeout(() => step5Ref.current?.scrollIntoView({ behavior: 'smooth' }), 100); }}
                                className="w-full bg-[#2F7A7A] hover:bg-[#266666] text-white font-bold py-4 rounded-xl transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 flex items-center justify-center gap-2"
                            >
                                View Recommendations &amp; Next Steps <ChevronRight size={18} />
                            </button>
                        </div>
                    )}

                    {/* ════════════════════════ STEP 5 — Recommendations ═════════ */}
                    {currentStep === 5 && result && (
                        <div ref={step5Ref} className="animate-fade-in">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="bg-teal-100 p-2 rounded-lg text-[#2F7A7A]"><FileText size={20} /></div>
                                <div>
                                    <h2 className="text-2xl font-serif font-bold text-gray-800">Recommended Next Steps</h2>
                                    <p className="text-gray-500 text-sm">Based on this screening for {childInfo.name || 'your child'}</p>
                                </div>
                            </div>

                            {/* Recommendations */}
                            <div className="bg-gradient-to-br from-teal-50 to-white border border-teal-100 rounded-2xl p-6 mb-6">
                                <div className="space-y-4">
                                    {result.recommendations.map((rec, i) => (
                                        <div key={i} className="flex gap-4 items-start">
                                            <div className="bg-[#2F7A7A] text-white w-7 h-7 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0 mt-0.5">
                                                {i + 1}
                                            </div>
                                            <p className="text-gray-700 text-sm leading-relaxed pt-0.5">{rec}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* CTAs */}
                            <div className="grid md:grid-cols-2 gap-4 mb-8">
                                <button className="flex items-center justify-center gap-3 bg-[#2F7A7A] hover:bg-[#266666] text-white font-bold py-4 px-6 rounded-xl transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5">
                                    <Calendar size={20} /> Schedule Follow-Up Assessment
                                </button>
                                <button className="flex items-center justify-center gap-3 bg-white hover:bg-gray-50 text-gray-800 border-2 border-gray-200 hover:border-gray-300 font-bold py-4 px-6 rounded-xl transition-all">
                                    <Download size={20} /> Download Full Report (PDF)
                                </button>
                            </div>

                            {/* Report Preview */}
                            <div className="bg-white border-2 border-dashed border-gray-200 rounded-2xl p-6 mb-8">
                                <h3 className="font-bold text-gray-700 mb-4 flex items-center gap-2">
                                    <FileText size={16} /> Report Preview
                                </h3>
                                <div className="bg-gradient-to-br from-[#1E5F5F] to-[#2F7A7A] text-white rounded-xl p-5 mb-4">
                                    <div className="flex items-center gap-3 mb-3">
                                        <Brain size={24} />
                                        <div>
                                            <div className="font-bold text-lg">NeuroAlign Early Screening Report</div>
                                            <div className="text-white/70 text-xs">Confidential — For caregivers &amp; healthcare providers only</div>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-3 gap-3 mt-4">
                                        <div className="bg-white/15 rounded-lg p-3 text-center">
                                            <div className="text-2xl font-black">{result.riskScore}</div>
                                            <div className="text-white/70 text-xs">Risk Score</div>
                                        </div>
                                        <div className="bg-white/15 rounded-lg p-3 text-center">
                                            <div className="text-2xl font-black">{result.confidence}%</div>
                                            <div className="text-white/70 text-xs">Confidence</div>
                                        </div>
                                        <div className="bg-white/15 rounded-lg p-3 text-center">
                                            <div className="text-lg font-black">{result.riskLevel}</div>
                                            <div className="text-white/70 text-xs">Risk Level</div>
                                        </div>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-3 text-xs text-gray-500">
                                    {['SHAP Feature Analysis', 'Behavioral Timeline', 'Clinical Recommendations', 'Developmental Context'].map((item) => (
                                        <div key={item} className="flex items-center gap-2">
                                            <CheckCircle size={12} className="text-teal-400" /> {item}
                                        </div>
                                    ))}
                                </div>
                                <p className="text-xs text-gray-400 mt-4 italic text-center">
                                    * This is a screening tool, not a diagnostic assessment. Results should be reviewed with a licensed clinician.
                                </p>
                            </div>

                            {/* Parent Reassurance */}
                            <div className="bg-amber-50 border border-amber-100 rounded-2xl p-6 mb-6">
                                <h4 className="font-bold text-amber-800 mb-2 flex items-center gap-2">
                                    <Heart size={16} className="text-amber-600" />
                                    You're taking an important step
                                </h4>
                                <p className="text-sm text-amber-700 leading-relaxed">
                                    Early detection is a gift — it opens doors to support, therapy, and resources that make a real difference. By completing this screening, you've taken the first step toward clarity and the best possible outcomes for your child.
                                </p>
                            </div>

                            {/* Trust signals footer */}
                            <div className="border-t border-gray-100 pt-6 flex flex-wrap justify-center gap-6 text-xs text-gray-400">
                                <span className="flex items-center gap-1.5"><ShieldCheck size={13} className="text-green-400" /> AI-powered · Clinically validated</span>
                                <span className="flex items-center gap-1.5"><Brain size={13} className="text-[#2F7A7A]" /> Reviewed by developmental psychologists</span>
                                <span className="flex items-center gap-1.5"><Lock size={13} /> HIPAA-compliant</span>
                            </div>

                            {/* Start over */}
                            <div className="text-center mt-8">
                                <button
                                    onClick={() => {
                                        setCurrentStep(1);
                                        setVideoFile(null);
                                        setUploadPhase('idle');
                                        setUploadProgress(0);
                                        setResult(null);
                                        setChildInfo({ name: '', dob: '', relationship: '' });
                                        setAgeMonths(null);
                                    }}
                                    className="text-sm text-gray-400 hover:text-[#2F7A7A] transition font-medium underline underline-offset-2"
                                >
                                    Start a new screening
                                </button>
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
};

// Tiny missing icon
const Heart = ({ size = 16, className = '' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
);

export default Screening;
