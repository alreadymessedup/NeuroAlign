import React, { useEffect, useState } from 'react';
import api from '../services/api';
import {
    LayoutDashboard, Bell, Activity, TrendingUp, Calendar,
    ArrowUpRight, AlertCircle, CheckCircle, FileText
} from 'lucide-react';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

const Monitoring = () => {
    const [history, setHistory] = useState([]);
    const [alerts, setAlerts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Mock initial data load or wait for API
                // const response = await api.get('/monitoring/1');
                // setHistory(response.data.history);
                // setAlerts(response.data.alerts);

                // Simulating API delay and data for UI
                setTimeout(() => {
                    const mockHistory = [
                        { sessionDate: '2023-11-01', progressScore: 45, type: 'Speech' },
                        { sessionDate: '2023-11-05', progressScore: 50, type: 'Motor' },
                        { sessionDate: '2023-11-10', progressScore: 55, type: 'Speech' },
                        { sessionDate: '2023-11-15', progressScore: 52, type: 'Social' },
                        { sessionDate: '2023-11-20', progressScore: 60, type: 'Speech' },
                        { sessionDate: '2023-11-25', progressScore: 65, type: 'Motor' },
                        { sessionDate: '2023-12-01', progressScore: 72, type: 'Speech' },
                    ];
                    setHistory(mockHistory);

                    // Add a mock alert
                    setAlerts([
                        { type: 'Plan Update', message: 'Improvement in eye contact exceeding projections. Suggest increasing difficulty of social modular tasks.', date: 'Today' }
                    ]);
                    setLoading(false);
                }, 600);
            } catch (error) {
                console.error("Error fetching monitoring data:", error);
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    // Format data for Recharts
    const chartData = history.map(session => ({
        date: new Date(session.sessionDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
        score: session.progressScore,
    }));

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-background">
            <div className="text-primary text-xl font-serif animate-pulse">Loading dashboard metrics...</div>
        </div>
    );

    return (
        <div className="min-h-screen bg-background pb-20">
            {/* Hero Section */}
            <div className="bg-primary-dark text-white pt-24 pb-64">
                <div className="container mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                    <div>
                        <div className="flex items-center gap-2 text-white/70 font-bold uppercase tracking-wider text-sm mb-4">
                            <Activity size={16} /> Parent Dashboard
                        </div>
                        <h1 className="text-4xl md:text-5xl font-serif mb-6 leading-tight text-white">
                            Monitoring Progress<br />& Outcomes
                        </h1>
                        <p className="text-lg text-white/80 max-w-xl">
                            Longitudinal tracking of developmental milestones with real-time alerts for plan adaptations.
                        </p>
                    </div>
                </div>
            </div>

            {/* Dashboard Grid */}
            <div className="container mx-auto px-6 -mt-32 relative z-10">

                {/* Stats Row */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
                        <div>
                            <div className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-1">Total Sessions</div>
                            <div className="text-3xl font-bold text-gray-800">24</div>
                        </div>
                        <div className="bg-blue-50 p-3 rounded-xl text-blue-600">
                            <Calendar size={28} />
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
                        <div>
                            <div className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-1">Avg. Progress</div>
                            <div className="text-3xl font-bold text-gray-800">
                                +12% <span className="text-sm text-green-500 font-medium bg-green-50 px-2 py-0.5 rounded-full ml-1">/ Month</span>
                            </div>
                        </div>
                        <div className="bg-green-50 p-3 rounded-xl text-green-600">
                            <TrendingUp size={28} />
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
                        <div>
                            <div className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-1">Adherence</div>
                            <div className="text-3xl font-bold text-gray-800">95%</div>
                        </div>
                        <div className="bg-primary/10 p-3 rounded-xl text-primary">
                            <CheckCircle size={28} />
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Chart (2/3 width) */}
                    <div className="lg:col-span-2 bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h3 className="text-xl font-serif font-bold text-gray-800">Developmental Trajectory</h3>
                                <p className="text-sm text-text-muted">Combined score across all therapy domains</p>
                            </div>
                            <select className="bg-gray-50 border-none text-sm font-bold text-gray-600 rounded-lg p-2 cursor-pointer hover:bg-gray-100 transition focus:ring-0">
                                <option>Last 30 Days</option>
                                <option>Last 3 Months</option>
                                <option>All Time</option>
                            </select>
                        </div>

                        <div className="h-80 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={chartData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#0D9488" stopOpacity={0.2} />
                                            <stop offset="95%" stopColor="#0D9488" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                    <XAxis
                                        dataKey="date"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#9ca3af', fontSize: 12, dy: 10 }}
                                    />
                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#9ca3af', fontSize: 12 }}
                                    />
                                    <Tooltip
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="score"
                                        stroke="#0D9488"
                                        strokeWidth={3}
                                        fillOpacity={1}
                                        fill="url(#colorScore)"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Alerts & Notifications (1/3 width) */}
                    <div className="space-y-6">
                        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                            <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                                <Bell size={20} className="text-accent" /> Outcome Alerts
                            </h3>

                            <div className="space-y-4">
                                {alerts.length > 0 ? alerts.map((alert, index) => (
                                    <div key={index} className="p-4 bg-yellow-50 rounded-2xl border border-yellow-100 hover:shadow-md transition cursor-pointer">
                                        <div className="flex justify-between items-start mb-2">
                                            <span className="bg-yellow-200 text-yellow-800 text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wide">
                                                {alert.type}
                                            </span>
                                            <span className="text-xs text-yellow-600 font-medium">{alert.date}</span>
                                        </div>
                                        <p className="text-sm text-yellow-900 font-medium leading-relaxed">
                                            {alert.message}
                                        </p>
                                        <div className="mt-3 flex items-center gap-1 text-xs font-bold text-yellow-700">
                                            View Details <ArrowUpRight size={14} />
                                        </div>
                                    </div>
                                )) : (
                                    <div className="text-gray-400 italic text-center py-4">No new alerts</div>
                                )}

                                {/* Mock previous alert */}
                                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 opacity-60 hover:opacity-100 transition">
                                    <div className="flex justify-between items-start mb-2">
                                        <span className="bg-gray-200 text-gray-600 text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wide">
                                            Milestone Met
                                        </span>
                                        <span className="text-xs text-gray-400 font-medium">Nov 12</span>
                                    </div>
                                    <p className="text-sm text-gray-600 font-medium">
                                        Child successfully demonstrated 'Joint Attention' in 3 consecutive sessions.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-secondary/10 p-6 rounded-3xl border border-secondary/20">
                            <h3 className="text-lg font-bold text-primary-dark mb-4 flex items-center gap-2">
                                <FileText size={18} /> Export Data
                            </h3>
                            <p className="text-sm text-text-muted mb-4">
                                Download detailed progress reports for your insurance provider or pediatrician.
                            </p>
                            <button className="w-full py-3 bg-white text-gray-700 font-bold rounded-xl border border-gray-200 hover:border-primary hover:text-primary transition shadow-sm">
                                Download Report (PDF)
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Monitoring;
