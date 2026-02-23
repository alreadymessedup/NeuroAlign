import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
    return (
        <footer className="bg-primary-dark text-white py-12">
            <div className="container mx-auto px-6">
                <div className="flex flex-col md:flex-row justify-between items-start mb-8 gap-8">
                    <div>
                        <h3 className="text-2xl font-serif font-bold mb-2">NeuroAlign</h3>
                        <p className="text-gray-300 text-sm">Early answers. Better futures.</p>
                    </div>
                    <div className="flex flex-wrap gap-8 text-sm text-gray-300">
                        <Link to="#" className="hover:text-white transition">Privacy Policy</Link>
                        <Link to="#" className="hover:text-white transition">Terms</Link>
                        <Link to="#" className="hover:text-white transition">Contact</Link>
                        <Link to="#" className="hover:text-white transition">Research</Link>
                    </div>
                </div>

                <div className="border-t border-gray-700 pt-8">
                    <p className="text-xs text-gray-400 leading-relaxed max-w-3xl">
                        NeuroAlign is a screening support tool and does not provide medical diagnoses. Always consult a qualified healthcare professional. The information provided is for informational purposes only and should not replace professional medical advice.
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
