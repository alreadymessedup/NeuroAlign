import React, { useEffect, useState } from 'react';
import api from '../services/api';
import {
    ClipboardList, Brain, Activity, CheckCircle, AlertCircle,
    FileText, ChevronDown, ChevronUp, Clock, AlertTriangle
} from 'lucide-react';
import {
    Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
    ResponsiveContainer, Tooltip
} from 'recharts';

const Diagnosis = () => {
    const [report, setReport] = useState(null);
    const [loading, setLoading] = useState(true);
    const [expandedDomain, setExpandedDomain] = useState('eyeContact');

    useEffect(() => {
        const fetchDiagnosis = async () => {
            try {
                // In a real app, we'd fetch from the backend. 
                // For this UI demo, we'll wait a bit then load mock data that matches the design.
                // const response = await api.get('/diagnosis/1'); 
                // setReport(response.data);

                setTimeout(() => {
                    setReport({
                        patientId: 1,
                        riskScore: 66,
                        domains: [
                            { subject: 'Eye Contact', A: 72, fullMark: 100 },
                            { subject: 'Joint Attention', A: 58, fullMark: 100 },
                            { subject: 'Social Reciprocity', A: 45, fullMark: 100 },
                            { subject: 'Repetitive Behavior', A: 83, fullMark: 100 },
                            { subject: 'Sensory Response', A: 67, fullMark: 100 },
                            { subject: 'Communication', A: 52, fullMark: 100 },
                        ],
                        breakdown: [
                            { name: 'Eye Contact', score: 72, severity: 'Mild', color: 'bg-green-100 text-green-700' },
                            { name: 'Joint Attention', score: 58, severity: 'Moderate', color: 'bg-yellow-100 text-yellow-700' },
                            { name: 'Social Reciprocity', score: 45, severity: 'Elevated', color: 'bg-red-100 text-red-700' },
                            { name: 'Repetitive Behavior', score: 83, severity: 'Mild', color: 'bg-green-100 text-green-700' },
                            { name: 'Sensory Response', score: 67, severity: 'Moderate', color: 'bg-yellow-100 text-yellow-700' },
                            { name: 'Communication', score: 52, severity: 'Moderate', color: 'bg-yellow-100 text-yellow-700' },
                        ],
                        timeline: [
                            { age: '6 MO', title: 'Social Smiling', status: 'Met', description: 'Responds with smiles to familiar faces' },
                            { age: '9 MO', title: 'Babbling', status: 'Met', description: 'Produces varied consonant-vowel combinations' },
                            { age: '12 MO', title: 'Pointing / Gestures', status: 'Delayed', description: 'Limited use of pointing to request or share' },
                            { age: '18 MO', title: 'Single Words', status: 'Delayed', description: 'Fewer than 5 words used functionally' },
                            { age: '24 MO', title: 'Two-word Phrases', status: 'Delayed', description: 'No phrase speech observed at expected milestone' },
                            { age: '30 MO', title: 'Pretend Play', status: 'Pending', description: 'Upcoming milestone assessment' },
                        ],
                        insights: {
                            eyeContact: { status: 'Finding', score: 92, text: 'Child consistently avoids direct gaze during structured interaction tasks. Gaze aversion was noted in 7 out of 10 prompted instances.' },
                            jointAttention: { status: 'Concern', score: 87, text: 'Limited response to shared attention bids. Child did not follow pointing cues in 3 observation trials.' },
                            socialReciprocity: { status: 'Concern', score: 85, text: 'Minimal initiation of social interaction observed. Child engages in parallel play rather than cooperative play.' },
                        }
                    });
                    setLoading(false);
                }, 800);
            } catch (error) {
                console.error("Error fetching diagnosis:", error);
                setLoading(false);
            }
        };

        fetchDiagnosis();
    }, []);

    const toggleExpand = (domain) => {
        setExpandedDomain(expandedDomain === domain ? null : domain);
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-background">
            <div className="text-primary text-xl font-serif animate-pulse">Generative AI is analyzing diagnostic data...</div>
        </div>
    );

    return (
        <div className="min-h-screen bg-background pb-20">
            {/* Hero Section */}
            <div className="bg-primary-dark text-white pt-24 pb-64">
                <div className="container mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                    <div>
                        <div className="flex items-center gap-2 text-white/70 font-bold uppercase tracking-wider text-sm mb-4">
                            <FileText size={16} /> Diagnostic Support Dashboard
                        </div>
                        <h1 className="text-4xl md:text-5xl font-serif mb-6 leading-tight text-white">
                            AI-powered<br />diagnostic insights
                        </h1>
                        <p className="text-lg text-white/80 max-w-xl">
                            Explainable diagnostic report based on multimodal analysis of behavioral markers, developmental milestones, and observational data.
                        </p>
                    </div>
                    <div className="flex justify-center md:justify-end gap-6">
                        <div className="bg-white/10 backdrop-blur-sm p-6 rounded-2xl text-center w-32 border border-white/10">
                            <Brain className="mx-auto mb-3 text-accent" size={32} />
                            <div className="text-2xl font-bold">6</div>
                            <div className="text-xs text-white/70">Domains analyzed</div>
                        </div>
                        <div className="bg-white/10 backdrop-blur-sm p-6 rounded-2xl text-center w-32 border border-white/10">
                            <Activity className="mx-auto mb-3 text-accent" size={32} />
                            <div className="text-2xl font-bold">DSM-5</div>
                            <div className="text-xs text-white/70">Aligned criteria</div>
                        </div>
                        <div className="bg-white/10 backdrop-blur-sm p-6 rounded-2xl text-center w-32 border border-white/10">
                            <ClipboardList className="mx-auto mb-3 text-accent" size={32} />
                            <div className="text-2xl font-bold">97%</div>
                            <div className="text-xs text-white/70">Confidence</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content Grid */}
            <div className="container mx-auto px-6 -mt-32 relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-8">

                {/* Left Column: Behavioral Metrics & Breakdown */}
                <div className="space-y-8">
                    {/* Radar Chart Card */}
                    <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                        <div className="flex items-start gap-4 mb-6">
                            <div className="bg-green-50 p-2 rounded-full text-green-600">
                                <CheckCircle size={20} />
                            </div>
                            <div>
                                <h3 className="text-xl font-serif font-bold text-gray-800">Behavioral Metrics</h3>
                                <p className="text-sm text-text-muted">Score distribution across 6 developmental domains</p>
                            </div>
                        </div>

                        <div className="h-80 w-full flex justify-center">
                            <ResponsiveContainer width="100%" height="100%">
                                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={report.domains}>
                                    <PolarGrid stroke="#e5e7eb" />
                                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#6b7280', fontSize: 12 }} />
                                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                                    <Radar
                                        name="Patient"
                                        dataKey="A"
                                        stroke="#0D9488"
                                        strokeWidth={2}
                                        fill="#0D9488"
                                        fillOpacity={0.2}
                                    />
                                    <Tooltip />
                                </RadarChart>
                            </ResponsiveContainer>
                        </div>

                        {/* Domain Breakdown Legend */}
                        <div className="mt-8 space-y-4">
                            <h4 className="font-bold text-gray-400 text-sm uppercase tracking-wider mb-4">Domain Breakdown</h4>
                            {report.breakdown.map((item, index) => (
                                <div key={index} className="flex items-center gap-4">
                                    <div className="w-32 text-sm font-medium text-gray-700">{item.name}</div>
                                    <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                                        <div
                                            className="h-full rounded-full bg-primary"
                                            style={{ width: `${item.score}%` }}
                                        ></div>
                                    </div>
                                    <div className="w-12 text-sm font-bold text-gray-800 text-right">{item.score}%</div>
                                    <div className={`px-2 py-1 rounded text-xs font-bold w-20 text-center ${item.severity === 'Elevated' ? 'bg-red-100 text-red-700' : item.severity === 'Moderate' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'}`}>
                                        {item.severity}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Clinician Notes */}
                    <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                        <div className="flex items-start gap-4 mb-6">
                            <div className="bg-blue-50 p-2 rounded-full text-blue-600">
                                <FileText size={20} />
                            </div>
                            <div>
                                <h3 className="text-xl font-serif font-bold text-gray-800">Clinician Notes & Explainability</h3>
                                <p className="text-sm text-text-muted">6 AI-generated insights with DSM-5 references</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            {/* Eye Contact */}
                            <div className="border border-gray-100 rounded-xl overflow-hidden transition-all">
                                <button
                                    onClick={() => toggleExpand('eyeContact')}
                                    className="w-full flex items-center justify-between p-4 bg-white hover:bg-gray-50 transition"
                                >
                                    <div className="flex items-center gap-3">
                                        <CheckCircle size={18} className="text-primary" />
                                        <span className="font-bold text-gray-800">Eye Contact</span>
                                        <span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded font-bold">Finding</span>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <span className="text-xs font-bold text-gray-400">92%</span>
                                        {expandedDomain === 'eyeContact' ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                    </div>
                                </button>
                                {expandedDomain === 'eyeContact' && (
                                    <div className="p-4 bg-gray-50 text-sm text-gray-600 border-t border-gray-100">
                                        <p className="mb-3">{report.insights.eyeContact.text}</p>
                                        <div className="bg-gray-100 p-2 rounded text-xs text-gray-500 flex items-center gap-2">
                                            <AlertCircle size={12} /> DSM-5 Section A1: Deficits in social-emotional reciprocity
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Joint Attention */}
                            <div className="border border-gray-100 rounded-xl overflow-hidden transition-all">
                                <button
                                    onClick={() => toggleExpand('jointAttention')}
                                    className="w-full flex items-center justify-between p-4 bg-white hover:bg-gray-50 transition"
                                >
                                    <div className="flex items-center gap-3">
                                        <AlertTriangle size={18} className="text-accent" />
                                        <span className="font-bold text-gray-800">Joint Attention</span>
                                        <span className="bg-yellow-100 text-yellow-700 text-xs px-2 py-0.5 rounded font-bold">Concern</span>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <span className="text-xs font-bold text-gray-400">87%</span>
                                        {expandedDomain === 'jointAttention' ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                    </div>
                                </button>
                                {expandedDomain === 'jointAttention' && (
                                    <div className="p-4 bg-gray-50 text-sm text-gray-600 border-t border-gray-100">
                                        <p className="mb-3">{report.insights.jointAttention.text}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Risk Summary & Timeline */}
                <div className="space-y-8">
                    {/* Risk Summary */}
                    <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                        <div className="flex items-start gap-4 mb-8">
                            <div className="bg-yellow-50 p-2 rounded-full text-yellow-600">
                                <AlertTriangle size={20} />
                            </div>
                            <div>
                                <h3 className="text-xl font-serif font-bold text-gray-800">Risk Summary</h3>
                                <p className="text-sm text-text-muted">Composite risk assessment across DSM-5 criteria</p>
                            </div>
                        </div>

                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Overall Risk Level</div>
                                <div className="text-3xl font-bold text-gray-800">Moderate-High</div>
                            </div>
                            <div className="relative w-24 h-24 flex items-center justify-center">
                                {/* Simple SVG Gauge visualization */}
                                <svg className="w-full h-full transform -rotate-90">
                                    <circle cx="48" cy="48" r="40" stroke="#e5e7eb" strokeWidth="8" fill="transparent" />
                                    <circle cx="48" cy="48" r="40" stroke="#FFBC02" strokeWidth="8" fill="transparent" strokeDasharray="251.2" strokeDashoffset="85" strokeLinecap="round" />
                                </svg>
                                <span className="absolute text-xl font-bold text-yellow-500">66%</span>
                            </div>
                        </div>

                        {/* Sub-scales */}
                        <div className="space-y-6">
                            <div>
                                <div className="flex justify-between mb-2">
                                    <span className="text-gray-700 font-medium">Social Communication</span>
                                    <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded font-bold">Moderate</span>
                                </div>
                                <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                                    <div className="h-full bg-yellow-500 w-2/3 rounded-full"></div>
                                </div>
                            </div>
                            <div>
                                <div className="flex justify-between mb-2">
                                    <span className="text-gray-700 font-medium">Restricted Interests</span>
                                    <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded font-bold">Elevated</span>
                                </div>
                                <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                                    <div className="h-full bg-red-500 w-4/5 rounded-full"></div>
                                </div>
                            </div>
                            <div>
                                <div className="flex justify-between mb-2">
                                    <span className="text-gray-700 font-medium">Sensory Processing</span>
                                    <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded font-bold">Moderate</span>
                                </div>
                                <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                                    <div className="h-full bg-yellow-500 w-1/2 rounded-full"></div>
                                </div>
                            </div>
                            <div>
                                <div className="flex justify-between mb-2">
                                    <span className="text-gray-700 font-medium">Adaptive Behavior</span>
                                    <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded font-bold">Mild</span>
                                </div>
                                <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                                    <div className="h-full bg-primary w-1/3 rounded-full"></div>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-4 mt-8">
                            <button className="flex-1 py-3 border border-gray-200 rounded-xl font-bold text-gray-600 hover:bg-gray-50 flex items-center justify-center gap-2">
                                <ClipboardList size={18} /> Print Report
                            </button>
                            <button className="flex-1 py-3 border border-gray-200 rounded-xl font-bold text-gray-600 hover:bg-gray-50 flex items-center justify-center gap-2">
                                <FileText size={18} /> Export PDF
                            </button>
                        </div>
                    </div>

                    {/* Timeline */}
                    <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                        <div className="flex items-start gap-4 mb-8">
                            <div className="bg-primary/10 p-2 rounded-full text-primary">
                                <Clock size={20} />
                            </div>
                            <div>
                                <h3 className="text-xl font-serif font-bold text-gray-800">Developmental Timeline</h3>
                                <p className="text-sm text-text-muted">Milestone tracking against age-normed expectations</p>
                            </div>
                        </div>

                        <div className="space-y-8 relative pl-4">
                            {/* Vertical Line */}
                            <div className="absolute left-[27px] top-4 bottom-4 w-0.5 bg-gray-100"></div>

                            {report.timeline.map((item, index) => (
                                <div key={index} className="relative flex items-start gap-6">
                                    <div className={`z-10 w-6 h-6 rounded-full border-4 border-white flex-shrink-0 mt-1 ${item.status === 'Met' ? 'bg-green-500' :
                                        item.status === 'Delayed' ? 'bg-yellow-400Ring' :
                                            'bg-gray-300'
                                        } ${item.status === 'Delayed' ? 'bg-yellow-500' : ''}`}>
                                        {/* Status Icon could go here */}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-3 mb-1">
                                            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">{item.age}</span>
                                            <span className={`text-xs px-2 py-0.5 rounded font-bold ${item.status === 'Met' ? 'bg-green-100 text-green-700' :
                                                item.status === 'Delayed' ? 'bg-yellow-100 text-yellow-700' :
                                                    'bg-gray-100 text-gray-500'
                                                }`}>
                                                {item.status}
                                            </span>
                                        </div>
                                        <h4 className="font-bold text-gray-800">{item.title}</h4>
                                        <p className="text-sm text-text-muted mt-1">{item.description}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Diagnosis;
