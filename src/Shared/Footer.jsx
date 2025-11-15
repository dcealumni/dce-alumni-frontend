import React from 'react';
import { FaFacebook, FaTwitter, FaLinkedin, FaEnvelope, FaPhone, FaMapMarkerAlt, FaGlobe } from 'react-icons/fa';
import logo from '../assets/images/logo.png';

const Footer = () => {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-gradient-to-b from-[#1a237e] to-[#0d1344] text-white">
            <div className="max-w-7xl mx-auto px-4">
                {/* Main Footer Content */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-12 py-16">
                    {/* Logo and About Section */}
                    <div className="space-y-6">
                        <div className="flex items-center space-x-4">
                            <div className="bg-white p-2 rounded-lg">
                                <img src={logo} alt="BUTEX DCE Logo" className="w-14 h-14 object-contain" />
                            </div>
                            <div>
                                <h3 className="font-bold text-xl tracking-wide">BUTEX DCE</h3>
                                <p className="text-yellow-400 text-sm font-medium">Excellence in Engineering</p>
                            </div>
                        </div>
                        <p className="text-gray-300 leading-relaxed">
                            Department of Dyes and Chemical Engineering at Bangladesh University of Textiles, advancing excellence in education, research, and innovation.
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div className="space-y-6">
                        <h3 className="text-lg font-semibold relative before:content-[''] before:absolute before:w-12 before:h-1 before:-bottom-2 before:left-0 before:bg-yellow-400">
                            Quick Links
                        </h3>
                        <ul className="space-y-3">
                            <li>
                                <a href="/about" className="text-gray-300 hover:text-yellow-400 transition-colors duration-300 flex items-center space-x-2">
                                    <span className="w-2 h-2 bg-yellow-400 rounded-full"></span>
                                    <span>About Department</span>
                                </a>
                            </li>
                            <li>
                                <a href="/alumni" className="text-gray-300 hover:text-yellow-400 transition-colors duration-300 flex items-center space-x-2">
                                    <span className="w-2 h-2 bg-yellow-400 rounded-full"></span>
                                    <span>Alumni Network</span>
                                </a>
                            </li>
                            <li>
                                <a href="/past-events" className="text-gray-300 hover:text-yellow-400 transition-colors duration-300 flex items-center space-x-2">
                                    <span className="w-2 h-2 bg-yellow-400 rounded-full"></span>
                                    <span>Events & News</span>
                                </a>
                            </li>
                            <li>
                                <a href="/research" className="text-gray-300 hover:text-yellow-400 transition-colors duration-300 flex items-center space-x-2">
                                    <span className="w-2 h-2 bg-yellow-400 rounded-full"></span>
                                    <span>Research Activities</span>
                                </a>
                            </li>
                        </ul>
                    </div>

                    {/* Contact Information */}
                    <div className="space-y-6">
                        <h3 className="text-lg font-semibold relative before:content-[''] before:absolute before:w-12 before:h-1 before:-bottom-2 before:left-0 before:bg-yellow-400">
                            Contact Us
                        </h3>
                        <div className="space-y-4">
                            <div className="flex items-start space-x-3 group">
                                <div className="mt-1 p-2 bg-blue-900 rounded-lg group-hover:bg-blue-800 transition-colors">
                                    <FaMapMarkerAlt className="text-yellow-400 w-4 h-4" />
                                </div>
                                <div>
                                    <h4 className="font-medium text-white">Our Location</h4>
                                    <p className="text-gray-300 text-sm mt-1">
                                        BUTEX, Tejgaon I/A,<br />
                                        Dhaka-1208, Bangladesh
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start space-x-3 group">
                                <div className="mt-1 p-2 bg-blue-900 rounded-lg group-hover:bg-blue-800 transition-colors">
                                    <FaPhone className="text-yellow-400 w-4 h-4" />
                                </div>
                                <div>
                                    <h4 className="font-medium text-white">Call Us</h4>
                                    <a href="tel:+8802-9114260" className="text-gray-300 hover:text-yellow-400 text-sm mt-1 block transition-colors">
                                        +880 2-9114260
                                    </a>
                                </div>
                            </div>

                            <div className="flex items-start space-x-3 group">
                                <div className="mt-1 p-2 bg-blue-900 rounded-lg group-hover:bg-blue-800 transition-colors">
                                    <FaEnvelope className="text-yellow-400 w-4 h-4" />
                                </div>
                                <div>
                                    <h4 className="font-medium text-white">Email Us</h4>
                                    <a href="mailto:dce@butex.edu.bd" className="text-gray-300 hover:text-yellow-400 text-sm mt-1 block transition-colors">
                                        dce@butex.edu.bd
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Connect With Us */}
                    <div className="space-y-6">
                        <h3 className="text-lg font-semibold relative before:content-[''] before:absolute before:w-12 before:h-1 before:-bottom-2 before:left-0 before:bg-yellow-400">
                            Connect With Us
                        </h3>
                        <div className="flex flex-col space-y-4">
                            <p className="text-gray-300">Stay connected with our social networks</p>
                            <div className="flex space-x-4">
                                <a href="#" className="p-2 bg-blue-900 rounded-lg hover:bg-blue-800 transition-colors group">
                                    <FaFacebook className="w-5 h-5 text-gray-300 group-hover:text-yellow-400 transition-colors" />
                                </a>
                                <a href="#" className="p-2 bg-blue-900 rounded-lg hover:bg-blue-800 transition-colors group">
                                    <FaTwitter className="w-5 h-5 text-gray-300 group-hover:text-yellow-400 transition-colors" />
                                </a>
                                <a href="#" className="p-2 bg-blue-900 rounded-lg hover:bg-blue-800 transition-colors group">
                                    <FaLinkedin className="w-5 h-5 text-gray-300 group-hover:text-yellow-400 transition-colors" />
                                </a>
                                <a href="#" className="p-2 bg-blue-900 rounded-lg hover:bg-blue-800 transition-colors group">
                                    <FaGlobe className="w-5 h-5 text-gray-300 group-hover:text-yellow-400 transition-colors" />
                                </a>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Copyright Section */}
                <div className="border-t border-blue-800 py-8">
                    <p className="text-center text-sm text-gray-400">
                        © {currentYear} <a 
                            href="https://www.butex.edu.bd/ddce/" 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="text-yellow-400 hover:text-yellow-300 transition-colors"
                        >
                            BUTEX
                        </a> Department of Dyes and Chemical Engineering. All rights reserved.
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;