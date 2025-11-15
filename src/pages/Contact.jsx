import React, { useState } from 'react';
import { FaEnvelope, FaPhone, FaMapMarkerAlt, FaClock, FaPaperPlane, FaCheckCircle, FaExclamationTriangle, FaSpinner } from 'react-icons/fa';
import axios from 'axios';

const Contact = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: ''
    });

    const [isLoading, setIsLoading] = useState(false);
    const [notification, setNotification] = useState({ show: false, type: '', message: '' });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const showNotification = (type, message) => {
        setNotification({ show: true, type, message });
        setTimeout(() => {
            setNotification({ show: false, type: '', message: '' });
        }, 6000);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const response = await axios.post(`${import.meta.env.VITE_API_URL}contact`, formData, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            if (response.data.success) {
                showNotification('success', response.data.message);
                setFormData({ name: '', email: '', subject: '', message: '' }); // Reset form
            }
        } catch (error) {
            console.error('Error sending message:', error);
            const errorMessage = error.response?.data?.message || 'Failed to send message. Please try again later.';
            showNotification('error', errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Success/Error Notification */}
            {notification.show && (
                <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg max-w-md transform transition-all duration-300 ${
                    notification.type === 'success' 
                        ? 'bg-green-50 border border-green-200 text-green-800' 
                        : 'bg-red-50 border border-red-200 text-red-800'
                }`}>
                    <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0">
                            {notification.type === 'success' ? (
                                <FaCheckCircle className="text-green-500 text-lg" />
                            ) : (
                                <FaExclamationTriangle className="text-red-500 text-lg" />
                            )}
                        </div>
                        <div className="flex-1">
                            <p className="text-sm font-medium">
                                {notification.type === 'success' ? 'Success!' : 'Error!'}
                            </p>
                            <p className="text-sm mt-1">{notification.message}</p>
                        </div>
                        <button 
                            onClick={() => setNotification({ show: false, type: '', message: '' })}
                            className="flex-shrink-0 ml-4 text-gray-400 hover:text-gray-600 text-lg"
                        >
                            ×
                        </button>
                    </div>
                </div>
            )}

            {/* Professional Header Section with Chemical Reaction Animation */}
            <div className="relative bg-gradient-to-r from-blue-800 via-blue-600 to-blue-700 shadow-md overflow-hidden py-8 sm:py-12">
                {/* Chemical Reaction Animation Overlay */}
                <div className="absolute inset-0 w-full h-full overflow-hidden opacity-20">
                    <div className="bubbles">
                        {Array.from({ length: 15 }).map((_, i) => (
                            <div key={i} className="bubble" style={{
                                '--size': `${2 + Math.random() * 4}rem`,
                                '--distance': `${6 + Math.random() * 4}rem`,
                                '--position': `${-5 + Math.random() * 110}%`,
                                '--time': `${2 + Math.random() * 2}s`,
                                '--delay': `${-1 * (2 + Math.random() * 2)}s`,
                            }}></div>
                        ))}
                    </div>
                    <div className="molecules">
                        {Array.from({ length: 10 }).map((_, i) => (
                            <div key={i} className="molecule molecule-1" style={{
                                '--x': `${Math.random() * 100}%`,
                                '--y': `${Math.random() * 100}%`,
                                '--duration': `${20 + Math.random() * 10}s`,
                                '--delay': `${-1 * Math.random() * 5}s`,
                                '--rotation': `${Math.random() * 360}deg`,
                            }}></div>
                        ))}
                        {Array.from({ length: 8 }).map((_, i) => (
                            <div key={i} className="molecule molecule-2" style={{
                                '--x': `${Math.random() * 100}%`,
                                '--y': `${Math.random() * 100}%`,
                                '--duration': `${15 + Math.random() * 10}s`,
                                '--delay': `${-1 * Math.random() * 5}s`,
                                '--rotation': `${Math.random() * 360}deg`,
                            }}></div>
                        ))}
                    </div>
                </div>
                
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="text-center">
                        <h1 className="text-3xl font-bold text-white sm:text-4xl">
                            Contact Us
                        </h1>
                        <p className="mt-3 max-w-2xl mx-auto text-lg text-blue-100">
                            Get in touch with the Department of Dyes and Chemical Engineering Alumni Association
                        </p>
                    </div>
                </div>
            </div>

            {/* Add this CSS to your stylesheet or use styled-jsx */}
            <style jsx>{`
                .bubbles {
                    position: absolute;
                    width: 100%;
                    height: 100%;
                    z-index: 0;
                    overflow: hidden;
                }
                
                .bubble {
                    position: absolute;
                    left: var(--position);
                    bottom: -10rem;
                    display: block;
                    width: var(--size);
                    height: var(--size);
                    border-radius: 50%;
                    animation: float var(--time) var(--delay) ease-in infinite;
                    background: rgba(255, 255, 255, 0.6);
                }
                
                @keyframes float {
                    0% {
                        bottom: -10rem;
                        opacity: 0;
                    }
                    50% {
                        opacity: 0.8;
                    }
                    100% {
                        bottom: 100%;
                        opacity: 0;
                    }
                }
                
                .molecules {
                    position: absolute;
                    width: 100%;
                    height: 100%;
                    z-index: 0;
                }
                
                .molecule {
                    position: absolute;
                    opacity: 0.6;
                    transform: rotate(var(--rotation));
                    animation: move var(--duration) var(--delay) linear infinite;
                }
                
                .molecule-1 {
                    width: 30px;
                    height: 30px;
                    background: radial-gradient(circle at 30% 30%, transparent 30%, white 32%, white 38%, transparent 40%), 
                                radial-gradient(circle at 70% 30%, transparent 30%, white 32%, white 38%, transparent 40%), 
                                radial-gradient(circle at 30% 70%, transparent 30%, white 32%, white 38%, transparent 40%), 
                                radial-gradient(circle at 70% 70%, transparent 30%, white 32%, white 38%, transparent 40%),
                                radial-gradient(circle at 50% 50%, white 30%, transparent 32%);
                }
                
                .molecule-2 {
                    width: 40px;
                    height: 20px;
                    background: radial-gradient(circle at 30% 50%, transparent 30%, white 32%, white 38%, transparent 40%),
                                radial-gradient(circle at 70% 50%, transparent 30%, white 32%, white 38%, transparent 40%),
                                linear-gradient(to right, transparent 45%, white 45%, white 55%, transparent 55%);
                }
                
                @keyframes move {
                    0% {
                        left: -5%;
                        top: -5%;
                        opacity: 0;
                    }
                    10% {
                        opacity: 0.6;
                    }
                    90% {
                        opacity: 0.6;
                    }
                    100% {
                        left: 105%;
                        top: 105%;
                        opacity: 0;
                    }
                }
            `}</style>

            {/* Main Content Section */}
            <div className="max-w-7xl mx-auto -mt-12 px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Contact Info Card */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-xl shadow-lg overflow-hidden transform transition-all duration-300 hover:shadow-xl">
                            <div className="px-6 py-8">
                                <h2 className="text-2xl font-semibold text-gray-900 mb-8 relative">
                                    Contact Information
                                    <span className="block w-20 h-1 bg-blue-600 mt-2"></span>
                                </h2>
                                <div className="space-y-8">
                                    <div className="flex items-start">
                                        <div className="flex-shrink-0">
                                            <div className="flex items-center justify-center h-14 w-14 rounded-full bg-blue-100 text-blue-700">
                                                <FaMapMarkerAlt className="h-6 w-6" />
                                            </div>
                                        </div>
                                        <div className="ml-5">
                                            <h3 className="text-base font-medium text-gray-900 uppercase tracking-wide">Our Location</h3>
                                            <p className="mt-2 text-gray-600 leading-relaxed">
                                                Department of Dyes and Chemical Engineering<br />
                                                Bangladesh University of Textiles (BUTEX)<br />
                                                92, Shaheed Tajuddin Ahmed Ave<br />
                                                Tejgaon I/A, Dhaka-1208
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-start">
                                        <div className="flex-shrink-0">
                                            <div className="flex items-center justify-center h-14 w-14 rounded-full bg-blue-100 text-blue-700">
                                                <FaPhone className="h-6 w-6" />
                                            </div>
                                        </div>
                                        <div className="ml-5">
                                            <h3 className="text-base font-medium text-gray-900 uppercase tracking-wide">Phone</h3>
                                            <p className="mt-2 text-gray-600">+880 2-9114260</p>
                                            <p className="text-gray-600">+880 2-9125925</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start">
                                        <div className="flex-shrink-0">
                                            <div className="flex items-center justify-center h-14 w-14 rounded-full bg-blue-100 text-blue-700">
                                                <FaEnvelope className="h-6 w-6" />
                                            </div>
                                        </div>
                                        <div className="ml-5">
                                            <h3 className="text-base font-medium text-gray-900 uppercase tracking-wide">Email</h3>
                                            <p className="mt-2 text-gray-600">dce@butex.edu.bd</p>
                                            <p className="text-gray-600">info.dce@butex.edu.bd</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start">
                                        <div className="flex-shrink-0">
                                            <div className="flex items-center justify-center h-14 w-14 rounded-full bg-blue-100 text-blue-700">
                                                <FaClock className="h-6 w-6" />
                                            </div>
                                        </div>
                                        <div className="ml-5">
                                            <h3 className="text-base font-medium text-gray-900 uppercase tracking-wide">Office Hours</h3>
                                            <p className="mt-2 text-gray-600">Sunday - Thursday</p>
                                            <p className="text-gray-600">9:00 AM - 5:00 PM</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Contact Form Card */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-xl shadow-lg overflow-hidden transform transition-all duration-300 hover:shadow-xl">
                            <div className="px-8 py-10">
                                <h2 className="text-2xl font-semibold text-gray-900 mb-8 relative">
                                    Send us a message
                                    <span className="block w-20 h-1 bg-blue-600 mt-2"></span>
                                </h2>
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div className="grid grid-cols-1 gap-y-6 gap-x-6 sm:grid-cols-2">
                                        <div>
                                            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                                                Full Name *
                                            </label>
                                            <div className="relative">
                                                <input
                                                    type="text"
                                                    name="name"
                                                    id="name"
                                                    value={formData.name}
                                                    onChange={handleChange}
                                                    className="block w-full px-4 py-3 rounded-md border border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                                                    placeholder="Enter your full name"
                                                    required
                                                    disabled={isLoading}
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                                                Email Address *
                                            </label>
                                            <div className="relative">
                                                <input
                                                    type="email"
                                                    name="email"
                                                    id="email"
                                                    value={formData.email}
                                                    onChange={handleChange}
                                                    className="block w-full px-4 py-3 rounded-md border border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                                                    placeholder="Enter your email address"
                                                    required
                                                    disabled={isLoading}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                                            Subject *
                                        </label>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                name="subject"
                                                id="subject"
                                                value={formData.subject}
                                                onChange={handleChange}
                                                className="block w-full px-4 py-3 rounded-md border border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                                                placeholder="What is this message about?"
                                                required
                                                disabled={isLoading}
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                                            Message *
                                        </label>
                                        <div className="relative">
                                            <textarea
                                                name="message"
                                                id="message"
                                                rows="6"
                                                value={formData.message}
                                                onChange={handleChange}
                                                className="block w-full px-4 py-3 rounded-md border border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-none"
                                                placeholder="Write your message here..."
                                                required
                                                disabled={isLoading}
                                            ></textarea>
                                        </div>
                                    </div>

                                    <div>
                                        <button
                                            type="submit"
                                            disabled={isLoading}
                                            className="w-full inline-flex items-center justify-center py-4 px-6 border border-transparent rounded-md shadow-md text-base font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {isLoading ? (
                                                <>
                                                    <FaSpinner className="animate-spin mr-3 h-4 w-4" />
                                                    Sending Message...
                                                </>
                                            ) : (
                                                <>
                                                    <FaPaperPlane className="mr-3 h-4 w-4" />
                                                    Send Message
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Updated Map Section with Pinned Location */}
            <div className="max-w-7xl mx-auto my-16 px-4 sm:px-6 lg:px-8">
                <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                    <div className="h-96 w-full">
                        <iframe 
                            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3651.7893097927327!2d90.39802011501988!3d23.76029168458127!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3755b89db1b5de0f%3A0xe0e333356e676ede!2sBangladesh%20University%20of%20Textiles!5e0!3m2!1sen!2sus!4v1714700395428!5m2!1sen!2sus"
                            width="100%" 
                            height="100%" 
                            style={{ border: 0 }} 
                            allowFullScreen="" 
                            loading="lazy" 
                            referrerPolicy="no-referrer-when-downgrade"
                            title="BUTEX Map"
                        ></iframe>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Contact;