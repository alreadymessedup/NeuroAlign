import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, User, Stethoscope, Eye, EyeOff } from 'lucide-react';

const API = 'http://localhost:8000/api/auth';

const ScreeningEntryCard = () => {
    const navigate = useNavigate();

    // ── Tab / view state ──────────────────────────────────────────────────────
    const [activeTab, setActiveTab] = useState('screening'); // 'screening' | 'signin'
    const [view, setView] = useState('login');               // 'login' | 'register'

    // ── Screening form ────────────────────────────────────────────────────────
    const [formData, setFormData] = useState({ name: '', dob: '', relationship: '' });

    // ── Shared auth state ─────────────────────────────────────────────────────
    const [role, setRole] = useState('parent');
    const [showPassword, setShowPassword] = useState(false);
    const [authError, setAuthError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // ── Login form ────────────────────────────────────────────────────────────
    const [loginData, setLoginData] = useState({ email: '', password: '', remember: false });

    // ── Register form ─────────────────────────────────────────────────────────
    const [regData, setRegData] = useState({ name: '', email: '', password: '', confirm: '' });

    // ── Tab switch: reset errors + form view ─────────────────────────────────
    const switchTab = (tab) => { setActiveTab(tab); setAuthError(''); setView('login'); };
    const switchView = (v) => { setView(v); setAuthError(''); setShowPassword(false); };

    // ── Handlers ──────────────────────────────────────────────────────────────
    const handleScreeningSubmit = (e) => { e.preventDefault(); navigate('/screening'); };

    const handleSignIn = async (e) => {
        e.preventDefault();
        setAuthError(''); setIsLoading(true);
        try {
            const res = await fetch(`${API}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: loginData.email, password: loginData.password, role }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Login failed');
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            navigate(role === 'doctor' ? '/doctor-dashboard' : '/screening');
        } catch (err) {
            setAuthError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setAuthError('');
        if (regData.password !== regData.confirm) {
            return setAuthError('Passwords do not match.');
        }
        if (regData.password.length < 6) {
            return setAuthError('Password must be at least 6 characters.');
        }
        setIsLoading(true);
        try {
            const res = await fetch(`${API}/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: regData.name, email: regData.email, password: regData.password, role }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Registration failed');
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            navigate(role === 'doctor' ? '/doctor-dashboard' : '/screening');
        } catch (err) {
            setAuthError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    // ── Shared UI pieces ──────────────────────────────────────────────────────
    const RoleSelector = () => (
        <>
            <p className="text-xs font-bold tracking-widest text-white/60 uppercase mb-3">I am signing in as</p>
            <div className="grid grid-cols-2 gap-3 mb-6">
                {[
                    { key: 'parent', label: 'Parent', Icon: User },
                    { key: 'doctor', label: 'Doctor', Icon: Stethoscope },
                ].map(({ key, label, Icon }) => (
                    <button
                        key={key}
                        type="button"
                        onClick={() => setRole(key)}
                        className={`flex flex-col items-center gap-2 py-4 rounded-xl border-2 transition-all duration-200 font-semibold text-sm ${role === key
                                ? 'bg-white text-primary border-white shadow-md'
                                : 'bg-white/10 text-white/80 border-white/20 hover:bg-white/20'
                            }`}
                    >
                        <Icon className={`w-6 h-6 ${role === key ? 'text-primary' : 'text-white/70'}`} />
                        {label}
                    </button>
                ))}
            </div>
        </>
    );

    const PasswordInput = ({ value, onChange, placeholder = 'Enter your password' }) => (
        <div className="relative">
            <input
                type={showPassword ? 'text' : 'password'}
                placeholder={placeholder}
                required
                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 pr-11 placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/30 transition text-white"
                value={value}
                onChange={onChange}
            />
            <button type="button" onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3.5 text-white/50 hover:text-white transition">
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
        </div>
    );

    const ErrorBox = () => authError ? (
        <p className="text-red-300 text-sm bg-red-900/30 border border-red-400/30 rounded-lg px-3 py-2">{authError}</p>
    ) : null;

    const SubmitBtn = ({ label }) => (
        <button type="submit" disabled={isLoading}
            className="w-full bg-[#A08875] hover:bg-[#8D7665] disabled:opacity-60 text-white font-bold py-3.5 rounded-lg mt-1 transition-colors shadow-md flex items-center justify-center gap-2">
            {isLoading && (
                <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
            )}
            {isLoading ? 'Please wait…' : label}
        </button>
    );

    // ── Render ────────────────────────────────────────────────────────────────
    return (
        <div className="bg-primary text-white p-8 rounded-3xl shadow-xl max-w-md w-full relative overflow-hidden">

            {/* Tab Switcher */}
            <div className="flex bg-white/10 rounded-2xl p-1 mb-7 gap-1">
                {[['screening', 'Start Screening'], ['signin', 'Sign In']].map(([tab, label]) => (
                    <button key={tab} onClick={() => switchTab(tab)}
                        className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${activeTab === tab
                                ? 'bg-white text-primary shadow-sm'
                                : 'text-white/70 hover:text-white'
                            }`}>
                        {label}
                    </button>
                ))}
            </div>

            {/* ══ START SCREENING TAB ══ */}
            {activeTab === 'screening' && (
                <>
                    <h3 className="text-2xl font-serif font-bold mb-1">Let's start with your child</h3>
                    <p className="text-white/75 text-sm mb-6">This helps us personalize the screening.</p>
                    <form onSubmit={handleScreeningSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-1 pl-1">Child's first name</label>
                            <input type="text" placeholder="e.g. Emma"
                                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/30 transition text-white"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1 pl-1">Date of birth</label>
                            <div className="relative">
                                <input type="text" placeholder="dd-mm-yyyy"
                                    className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/30 transition text-white"
                                    value={formData.dob}
                                    onChange={(e) => setFormData({ ...formData, dob: e.target.value })} />
                                <Calendar className="absolute right-4 top-3.5 w-5 h-5 text-white/60" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1 pl-1">Your relationship</label>
                            <div className="relative">
                                <select
                                    className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-white/30 transition appearance-none cursor-pointer"
                                    value={formData.relationship}
                                    onChange={(e) => setFormData({ ...formData, relationship: e.target.value })}
                                    style={{ backgroundImage: 'none' }}>
                                    <option value="" className="text-gray-800">Select...</option>
                                    <option value="parent" className="text-gray-800">Parent</option>
                                    <option value="guardian" className="text-gray-800">Guardian</option>
                                    <option value="provider" className="text-gray-800">Healthcare Provider</option>
                                </select>
                                <svg className="absolute right-4 top-3.5 w-5 h-5 text-white/60 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </div>
                        </div>
                        <button type="submit" className="w-full bg-[#A08875] hover:bg-[#8D7665] text-white font-bold py-3.5 rounded-lg mt-2 transition-colors shadow-md">
                            Next
                        </button>
                    </form>
                </>
            )}

            {/* ══ SIGN IN TAB — LOGIN VIEW ══ */}
            {activeTab === 'signin' && view === 'login' && (
                <>
                    <h3 className="text-2xl font-serif font-bold mb-1">Welcome back</h3>
                    <p className="text-white/75 text-sm mb-6">Sign in to continue your journey</p>
                    <RoleSelector />
                    <form onSubmit={handleSignIn} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-1 pl-1">Email address</label>
                            <input type="email" placeholder="you@example.com" required
                                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/30 transition text-white"
                                value={loginData.email}
                                onChange={(e) => setLoginData({ ...loginData, email: e.target.value })} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1 pl-1">Password</label>
                            <PasswordInput
                                value={loginData.password}
                                onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                            />
                        </div>
                        <div className="flex items-center justify-between text-sm">
                            <label className="flex items-center gap-2 cursor-pointer text-white/80">
                                <input type="checkbox" checked={loginData.remember}
                                    onChange={(e) => setLoginData({ ...loginData, remember: e.target.checked })}
                                    className="w-4 h-4 rounded accent-white" />
                                Remember me
                            </label>
                            <button type="button" className="text-white/70 hover:text-white underline transition">Forgot?</button>
                        </div>
                        <ErrorBox />
                        <SubmitBtn label="Sign In" />
                        <p className="text-center text-sm text-white/60 mt-2">
                            Don't have an account?{' '}
                            <button type="button" onClick={() => switchView('register')}
                                className="text-white underline hover:text-white/80 transition font-semibold">
                                Register
                            </button>
                        </p>
                    </form>
                </>
            )}

            {/* ══ SIGN IN TAB — REGISTER VIEW ══ */}
            {activeTab === 'signin' && view === 'register' && (
                <>
                    <h3 className="text-2xl font-serif font-bold mb-1">Create account</h3>
                    <p className="text-white/75 text-sm mb-6">Join NeuroAlign to save progress and access reports.</p>
                    <RoleSelector />
                    <form onSubmit={handleRegister} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-1 pl-1">Full name</label>
                            <input type="text" placeholder="e.g. Sarah Johnson" required
                                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/30 transition text-white"
                                value={regData.name}
                                onChange={(e) => setRegData({ ...regData, name: e.target.value })} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1 pl-1">Email address</label>
                            <input type="email" placeholder="you@example.com" required
                                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/30 transition text-white"
                                value={regData.email}
                                onChange={(e) => setRegData({ ...regData, email: e.target.value })} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1 pl-1">Password</label>
                            <PasswordInput
                                value={regData.password}
                                onChange={(e) => setRegData({ ...regData, password: e.target.value })}
                                placeholder="Min. 6 characters"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1 pl-1">Confirm password</label>
                            <input type={showPassword ? 'text' : 'password'} placeholder="Re-enter password" required
                                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/30 transition text-white"
                                value={regData.confirm}
                                onChange={(e) => setRegData({ ...regData, confirm: e.target.value })} />
                        </div>
                        <ErrorBox />
                        <SubmitBtn label="Create Account" />
                        <p className="text-center text-sm text-white/60 mt-2">
                            Already have an account?{' '}
                            <button type="button" onClick={() => switchView('login')}
                                className="text-white underline hover:text-white/80 transition font-semibold">
                                Sign In
                            </button>
                        </p>
                    </form>
                </>
            )}
        </div>
    );
};

export default ScreeningEntryCard;
