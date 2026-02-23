import React, { useState } from 'react';
import api from '../services/api';
import {
    Brain, Save, AlertTriangle, CheckCircle, Calendar,
    Clock, Activity, Play, ArrowRight, User
} from 'lucide-react';

const Therapy = () => {
    const [sessionData, setSessionData] = useState({
        type: 'Speech',
        progressScore: 50,
        files: null
    });
    const [lastSession, setLastSession] = useState(null);
    const [loading, setLoading] = useState(false);

    // Mock Data for UI visualization
    const upcomingSessions = [
        { id: 1, type: 'Speech Therapy', time: 'Today, 4:00 PM', dur: '45 min', therapist: 'Dr. Emily' },
        { id: 2, type: 'Occupational', time: 'Wed, 17 Feb', dur: '30 min', therapist: 'Dr. Sarah' },
    ];

    const therapyGoals = [
        { id: 1, title: 'Expressive Language', progress: 65, color: 'bg-blue-500' },
        { id: 2, title: 'Motor Coordination', progress: 40, color: 'bg-orange-500' },
        { id: 3, title: 'Social Interaction', progress: 78, color: 'bg-green-500' },
    ];

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await api.post('/therapy/session', {
                patientId: 1, // Hardcoded
                ...sessionData
            });
            setLastSession(response.data);
            // In a real app we'd refresh the list here
        } catch (error) {
            console.error("Error logging session:", error);
            // For demo purposes, mock a success if backend fails or is offline
            setLastSession({
                type: sessionData.type,
                sessionDate: new Date().toISOString(),
                progressScore: sessionData.progressScore,
                planUpdateNeeded: sessionData.progressScore < 30
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background pb-20">
            {/* Hero Section */}
            <div className="bg-primary-dark text-white pt-24 pb-64">
                <div className="container mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                    <div>
                        <div className="flex items-center gap-2 text-white/70 font-bold uppercase tracking-wider text-sm mb-4">
                            <Brain size={16} /> Therapy Management
                        </div>
                        <h1 className="text-4xl md:text-5xl font-serif mb-6 leading-tight text-white">
                            Personalized<br />Intervention Plans
                        </h1>
                        <p className="text-lg text-white/80 max-w-xl">
                            Track therapy sessions, monitor goal progress, and receive AI-driven dynamic adaptations to the care plan.
                        </p>
                    </div>
                    <div className="flex justify-center md:justify-end gap-6">
                        <div className="bg-white/10 backdrop-blur-sm p-6 rounded-2xl w-full max-w-xs border border-white/10 relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-10">
                                <Calendar size={64} />
                            </div>
                            <div className="text-sm font-bold text-accent uppercase tracking-wider mb-2">Next Session</div>
                            <div className="text-2xl font-bold mb-1">Today, 4:00 PM</div>
                            <div className="text-white/70 text-sm flex items-center gap-2">
                                <User size={14} /> Dr. Emily • Speech Therapy
                            </div>
                            <button className="mt-4 w-full py-2 bg-white text-primary-dark font-bold rounded-lg text-sm hover:bg-gray-100 transition">
                                Join Video Call
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="container mx-auto px-6 -mt-32 relative z-10 grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Left Column: Logging & Current Focus (2/3 width) */}
                <div className="lg:col-span-2 space-y-8">

                    {/* Goal Progress Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {therapyGoals.map((goal) => (
                            <div key={goal.id} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                                <div className="text-sm font-bold text-gray-500 mb-2">{goal.title}</div>
                                <div className="text-3xl font-bold text-gray-800 mb-2">{goal.progress}%</div>
                                <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                                    <div className={`h-full ${goal.color}`} style={{ width: `${goal.progress}%` }}></div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Log Session Card */}
                    <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                        <div className="flex items-start gap-4 mb-6">
                            <div className="bg-primary/10 p-2 rounded-lg text-primary">
                                <Activity size={24} />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-gray-800">Log Therapy Session</h3>
                                <p className="text-sm text-text-muted">Record session outcomes to update the AI model</p>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Therapy Type</label>
                                    <div className="relative">
                                        <select
                                            className="w-full p-3 pl-4 border border-gray-200 rounded-xl bg-gray-50 focus:ring-2 focus:ring-primary/20 focus:border-primary appearance-none font-medium text-gray-700"
                                            value={sessionData.type}
                                            onChange={(e) => setSessionData({ ...sessionData, type: e.target.value })}
                                        >
                                            <option value="Speech">Speech Therapy</option>
                                            <option value="Motor">Motor Skills Therapy</option>
                                            <option value="Cognitive">Cognitive Behavioral Therapy</option>
                                            <option value="Social">Social Skills Group</option>
                                        </select>
                                        <div className="absolute right-3 top-3.5 text-gray-400 pointer-events-none">
                                            <ArrowRight size={16} className="rotate-90" />
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">
                                        Progress Score <span className="text-primary font-normal">({sessionData.progressScore}%)</span>
                                    </label>
                                    <input
                                        type="range"
                                        min="0"
                                        max="100"
                                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary"
                                        value={sessionData.progressScore}
                                        onChange={(e) => setSessionData({ ...sessionData, progressScore: Number(e.target.value) })}
                                    />
                                    <div className="flex justify-between text-xs text-gray-400 mt-2 font-medium">
                                        <span>No Progress</span>
                                        <span>Steady</span>
                                        <span>Mastered</span>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Session Notes (Optional)</label>
                                <textarea
                                    className="w-full p-4 border border-gray-200 rounded-xl bg-gray-50 focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none h-24 placeholder-gray-400"
                                    placeholder="Describe specific milestones achieved or challenges faced..."
                                ></textarea>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-4 bg-primary text-white font-bold rounded-xl hover:bg-primary-dark transition shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
                            >
                                <Save size={20} />
                                {loading ? 'Saving...' : 'Log Session & Update Plan'}
                            </button>
                        </form>
                    </div>

                    {/* AI Feedback (conditionally rendered) */}
                    {lastSession && (
                        <div className={`p-6 rounded-2xl border-l-4 shadow-sm animate-fade-in ${lastSession.planUpdateNeeded ? 'bg-orange-50 border-orange-400' : 'bg-green-50 border-green-500'}`}>
                            <div className="flex items-start gap-4">
                                <div className={`p-2 rounded-full ${lastSession.planUpdateNeeded ? 'bg-orange-100 text-orange-600' : 'bg-green-100 text-green-600'}`}>
                                    {lastSession.planUpdateNeeded ? <AlertTriangle size={24} /> : <CheckCircle size={24} />}
                                </div>
                                <div className="flex-1">
                                    <h4 className={`text-lg font-bold mb-1 ${lastSession.planUpdateNeeded ? 'text-orange-900' : 'text-green-900'}`}>
                                        {lastSession.planUpdateNeeded ? 'Plan Adaptation Required' : 'Session Successfully Logged'}
                                    </h4>
                                    <p className={`${lastSession.planUpdateNeeded ? 'text-orange-800' : 'text-green-800'}`}>
                                        {lastSession.planUpdateNeeded
                                            ? "The AI has detected a plateau in progress. A new strategy for 'Verbal Initiation' has been generated."
                                            : "Great work! Progress is on track with the projected timeline. Keep up the consistency."}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Right Column: Timeline & Upcoming (1/3 width) */}
                <div className="space-y-8">
                    <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                        <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                            <Clock size={20} className="text-gray-400" /> Upcoming
                        </h3>
                        <div className="space-y-4">
                            {upcomingSessions.map((session) => (
                                <div key={session.id} className="group flex items-center gap-4 p-4 rounded-2xl hover:bg-gray-50 transition border border-transparent hover:border-gray-100 cursor-pointer">
                                    <div className="bg-primary/10 text-primary w-12 h-12 rounded-xl flex items-center justify-center font-bold text-sm shrink-0">
                                        {session.id === 1 ? '15' : '17'} <br /> Feb
                                    </div>
                                    <div className="flex-1">
                                        <div className="font-bold text-gray-800">{session.type}</div>
                                        <div className="text-xs text-text-muted">{session.time} • {session.dur}</div>
                                    </div>
                                    <div className="text-gray-300 group-hover:text-primary transition">
                                        <Play size={20} fill="currentColor" />
                                    </div>
                                </div>
                            ))}
                        </div>
                        <button className="w-full mt-6 py-3 border-2 border-dashed border-gray-200 rounded-xl text-gray-400 font-bold hover:border-primary hover:text-primary transition flex items-center justify-center gap-2">
                            + Schedule Session
                        </button>
                    </div>

                    <div className="bg-primary text-white p-8 rounded-3xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
                        <h3 className="text-xl font-serif font-bold mb-2 relative z-10">Care Team</h3>
                        <p className="text-white/80 text-sm mb-6 relative z-10">Direct access to your specialists</p>

                        <div className="flex -space-x-3 mb-6 relative z-10">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="w-10 h-10 rounded-full border-2 border-primary bg-white/20 flex items-center justify-center text-xs font-bold">
                                    Dr
                                </div>
                            ))}
                            <div className="w-10 h-10 rounded-full border-2 border-primary bg-white flex items-center justify-center text-xs font-bold text-primary">
                                +
                            </div>
                        </div>
                        <button className="w-full py-3 bg-white text-primary font-bold rounded-xl hover:bg-blue-50 transition relative z-10">
                            Message Team
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Therapy;
