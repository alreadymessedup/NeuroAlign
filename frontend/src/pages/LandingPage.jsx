import React from 'react';
import { Link } from 'react-router-dom';
import { Camera, ClipboardList, Heart, Lock, ArrowRight, Brain, Clock, CheckCircle } from 'lucide-react';
import ScreeningEntryCard from '../components/ScreeningEntryCard';

const LandingPage = () => {
    return (
        <div className="min-h-screen bg-background text-text font-sans">


            {/* Hero Section */}
            <section className="container mx-auto px-6 py-12 md:py-20 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                <div className="space-y-6">
                    <h1 className="text-5xl md:text-6xl font-serif font-medium leading-tight text-primary-dark">
                        <span className="text-primary italic">Is your child showing signs that need attention?</span>
                    </h1>
                    <p className="text-lg text-text-muted max-w-lg leading-relaxed">
                        One in every 100 children is diagnosed with autism. The earlier you screen, the better the results. NeuroAlign delivers fast answers from the comfort of home.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 pt-4">
                        <Link to="/screening" className="px-8 py-4 bg-accent text-white font-bold rounded-lg shadow-lg hover:bg-orange-500 transition text-center">
                            Screen My Child — It's Free
                        </Link>
                        <button className="flex items-center justify-center gap-2 text-primary font-semibold hover:underline">
                            Learn How It Works <ArrowRight size={18} />
                        </button>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-text-muted pt-2">
                        <Lock size={14} /> Private & secure — results shared only with you
                    </div>
                </div>

                {/* Hero Image/Card */}
                <div className="flex justify-center md:justify-end">
                    <ScreeningEntryCard />
                </div>
            </section>

            {/* Stats Section */}
            <section className="container mx-auto px-6 pb-20">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[
                        "1 in 100 children have autism",
                        "Avg. diagnosis age: 3-5 years — we aim for under 2",
                        "Early intervention improves outcomes by up to 60%"
                    ].map((stat, i) => (
                        <div key={i} className="bg-white p-6 rounded-xl shadow-sm border border-secondary text-center font-medium text-primary-dark">
                            {stat}
                        </div>
                    ))}
                </div>
            </section>

            {/* "Earlier we know" Section */}
            <section className="bg-secondary/30 py-20">
                <div className="container mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
                    <div>
                        <h2 className="text-4xl font-serif text-primary-dark mb-6">Early detection opens the door to progress</h2>
                        <p className="text-lg text-text-muted mb-6 leading-relaxed">
                            Many children aren’t identified until age 4+, even though early brain development peaks in the first 3 years. Early action makes a difference.
                        </p>
                        <p className="text-lg text-text-muted">
                            NeuroAlign helps you recognize early signs through AI-based screening. No referrals required — just early understanding.
                        </p>
                    </div>
                    <div className="space-y-6">
                        <div className="flex gap-4 items-start bg-secondary p-4 rounded-xl">
                            <div className="bg-white p-2 rounded-lg text-primary"><Brain /></div>
                            <div>
                                <h4 className="font-bold text-primary-dark">Age 0–2</h4>
                                <p className="text-sm text-text-muted">Peak brain plasticity window</p>
                            </div>
                        </div>
                        <div className="flex gap-4 items-start bg-orange-50 p-4 rounded-xl">
                            <div className="bg-white p-2 rounded-lg text-accent"><Clock /></div>
                            <div>
                                <h4 className="font-bold text-gray-800">Age 4</h4>
                                <p className="text-sm text-text-muted">Average diagnosis age today</p>
                            </div>
                        </div>
                        <div className="flex gap-4 items-start bg-green-50 p-4 rounded-xl">
                            <div className="bg-white p-2 rounded-lg text-green-600"><Heart /></div>
                            <div>
                                <h4 className="font-bold text-green-800">Age 1.5</h4>
                                <p className="text-sm text-text-muted">Where NeuroAlign aims to flag early signs</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Three Steps Section */}
            <section className="container mx-auto px-6 py-20">
                <h2 className="text-4xl font-serif text-center text-primary-dark mb-16">Three steps to clarity</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Step 1 */}
                    <div className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-md transition border border-gray-100">
                        <div className="bg-orange-100 w-12 h-8 rounded-full flex items-center justify-center text-accent font-bold mb-6">01</div>
                        <Camera className="text-primary w-8 h-8 mb-4" />
                        <h3 className="text-xl font-bold mb-3">Upload a short video</h3>
                        <p className="text-text-muted">Record 2–3 minutes of your child during play or mealtime. No special setup needed — your phone is enough.</p>
                    </div>
                    {/* Step 2 */}
                    <div className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-md transition border border-gray-100">
                        <div className="bg-orange-100 w-12 h-8 rounded-full flex items-center justify-center text-accent font-bold mb-6">02</div>
                        <ClipboardList className="text-primary w-8 h-8 mb-4" />
                        <h3 className="text-xl font-bold mb-3">Answer a few questions</h3>
                        <p className="text-text-muted">Our AI-guided questionnaire takes under 5 minutes. Questions are based on clinically validated developmental checklists.</p>
                    </div>
                    {/* Step 3 */}
                    <div className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-md transition border border-gray-100">
                        <div className="bg-orange-100 w-12 h-8 rounded-full flex items-center justify-center text-accent font-bold mb-6">03</div>
                        <Heart className="text-primary w-8 h-8 mb-4" />
                        <h3 className="text-xl font-bold mb-3">Get your results</h3>
                        <p className="text-text-muted">Receive a personalized risk summary instantly. If further evaluation is recommended, we connect you with specialists.</p>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-background py-10 border-t border-secondary text-center">
                <p className="text-primary-dark font-serif text-lg mb-4">Built on clinical science</p>
                <div className="flex justify-center gap-8 text-sm text-text-muted">
                    <span className="flex items-center gap-2"><CheckCircle size={16} /> Validated against DSM-5 criteria</span>
                    <span className="flex items-center gap-2"><CheckCircle size={16} /> Research-backed tools</span>
                    <span className="flex items-center gap-2"><Lock size={16} /> HIPAA Compliant & Secure</span>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;
