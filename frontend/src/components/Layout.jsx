import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Activity, ClipboardList, Brain, LayoutDashboard, Menu, X } from 'lucide-react';
import Footer from './Footer';

const Layout = ({ children }) => {
    const location = useLocation();
    const [isMenuOpen, setIsMenuOpen] = React.useState(false);

    const navItems = [
        { path: '/', label: 'Home', icon: null },
        { path: '/screening', label: 'Screening', icon: <Activity size={18} /> },
        { path: '/diagnosis', label: 'Diagnosis', icon: <ClipboardList size={18} /> },
        { path: '/therapy', label: 'Therapy', icon: <Brain size={18} /> },
        { path: '/monitoring', label: 'Monitoring', icon: <LayoutDashboard size={18} /> },
    ];

    return (
        <div className="min-h-screen bg-background text-text font-sans flex flex-col">
            {/* Top Navigation Bar */}
            <header className="sticky top-0 z-50 bg-secondary/90 backdrop-blur-md border-b border-white/20 shadow-sm">
                <div className="container mx-auto px-6 py-4 flex justify-between items-center">
                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-2">
                        <Brain className="text-primary w-8 h-8" />
                        <span className="text-2xl font-serif font-bold text-primary-dark tracking-tight">NeuroAlign</span>
                    </Link>

                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex items-center gap-8">
                        {navItems.map((item) => (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`flex items-center gap-2 font-medium transition-colors ${location.pathname === item.path
                                    ? 'text-primary'
                                    : 'text-text-muted hover:text-primary'
                                    }`}
                            >
                                {item.icon}
                                <span>{item.label}</span>
                            </Link>
                        ))}
                    </nav>

                    {/* Mobile Menu Button */}
                    <button
                        className="md:hidden text-text-muted hover:text-primary"
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                    >
                        {isMenuOpen ? <X /> : <Menu />}
                    </button>
                </div>

                {/* Mobile Navigation Dropdown */}
                {isMenuOpen && (
                    <div className="md:hidden bg-white border-b border-gray-100 py-4 px-6 space-y-4 shadow-lg">
                        {navItems.map((item) => (
                            <Link
                                key={item.path}
                                to={item.path}
                                onClick={() => setIsMenuOpen(false)}
                                className={`flex items-center gap-3 py-2 ${location.pathname === item.path
                                    ? 'text-primary font-bold'
                                    : 'text-text-muted'
                                    }`}
                            >
                                {item.icon}
                                <span>{item.label}</span>
                            </Link>
                        ))}
                    </div>
                )}
            </header>

            {/* Main Content */}
            <main className="flex-1">
                {children}
            </main>

            <Footer />
        </div>
    );
};

export default Layout;
