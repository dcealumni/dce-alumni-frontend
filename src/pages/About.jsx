import { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';

const CountUpAnimation = ({ end, duration = 2000, suffix = "", label }) => {
    const [count, setCount] = useState(0);
    const [isVisible, setIsVisible] = useState(false);
    const countRef = useRef();

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting && !isVisible) {
                    setIsVisible(true);
                }
            },
            { threshold: 0.1 }
        );

        if (countRef.current) {
            observer.observe(countRef.current);
        }

        return () => observer.disconnect();
    }, [isVisible]);

    useEffect(() => {
        if (!isVisible || end === 0) return;

        let startTime;
        let animationFrame;

        const updateCount = (timestamp) => {
            if (!startTime) startTime = timestamp;
            const progress = Math.min((timestamp - startTime) / duration, 1);
            
            const easeOutQuart = 1 - Math.pow(1 - progress, 4);
            const currentCount = Math.floor(easeOutQuart * end);
            
            setCount(currentCount);

            if (progress < 1) {
                animationFrame = requestAnimationFrame(updateCount);
            }
        };

        animationFrame = requestAnimationFrame(updateCount);

        return () => {
            if (animationFrame) {
                cancelAnimationFrame(animationFrame);
            }
        };
    }, [isVisible, end, duration]);

    return (
        <div ref={countRef} className="text-center p-6 bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-300">
            <div className="text-5xl font-bold text-blue-600 mb-2">
                {count}{suffix}
            </div>
            <div className="text-gray-600 font-medium text-lg">
                {label}
            </div>
        </div>
    );
};

CountUpAnimation.propTypes = {
    end: PropTypes.number.isRequired,
    duration: PropTypes.number,
    suffix: PropTypes.string,
    label: PropTypes.string.isRequired
};

const About = () => {
    const [stats, setStats] = useState({
        approvedAlumni: 0,
        totalRegistrations: 0,
        pendingCount: 0,
        rejectedCount: 0,
        totalAlumni: 0
    });
    const [loading, setLoading] = useState(true);
    const [yearsOfDCE, setYearsOfDCE] = useState(0);

    // Calculate years since DCE department was established
    useEffect(() => {
        const dceFoundingYear = 2015; // DCE Department founding year
        const currentYear = new Date().getFullYear();
        const calculatedYears = currentYear - dceFoundingYear;
        
        setYearsOfDCE(calculatedYears);
    }, []);

    // Fetch real-time alumni stats
    useEffect(() => {
        const fetchStats = async () => {
            try {
                // Fetch all alumni to get the total count
                const allAlumniResponse = await axios.get('https://dce-server.vercel.app/alumni-registration/all');
                
                const totalAlumniCount = Array.isArray(allAlumniResponse.data.alumni) 
                    ? allAlumniResponse.data.alumni.length 
                    : Array.isArray(allAlumniResponse.data) 
                        ? allAlumniResponse.data.length
                        : 0;

                setStats(prevStats => ({
                    ...prevStats,
                    totalAlumni: totalAlumniCount
                }));
            } catch (error) {
                console.error('Error fetching alumni data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();

        // Update every 30 seconds for real-time data
        const interval = setInterval(fetchStats, 30000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className='min-h-screen bg-gray-50'>
            {/* Hero Section */}
            <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-800 text-white py-20 relative overflow-hidden">
                <div className="absolute inset-0 bg-black opacity-20"></div>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <h1 className="text-5xl md:text-6xl font-bold mb-6">About BUTEX DCE Alumni Association</h1>
                    <p className="text-xl md:text-2xl max-w-4xl leading-relaxed">
                        Connecting generations of Dyes and Chemical Engineering graduates from Bangladesh University of Textiles.
                    </p>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                {/* Mission & Vision */}
                <div className="mb-16">
                    <h2 className="text-3xl font-bold text-gray-800 mb-6">Our Mission & Vision</h2>
                    <div className="grid md:grid-cols-2 gap-8">
                        <div className="bg-blue-50 p-8 rounded-xl shadow-sm border-l-4 border-blue-500">
                            <h3 className="text-2xl font-semibold text-blue-700 mb-4">Our Mission</h3>
                            <p className="text-gray-700 leading-relaxed">
                                To create a vibrant network of BUTEX DCE alumni, fostering professional growth, knowledge sharing, and collaborative opportunities among graduates while supporting current students through mentorship and career guidance.
                            </p>
                        </div>
                        <div className="bg-indigo-50 p-8 rounded-xl shadow-sm border-l-4 border-indigo-500">
                            <h3 className="text-2xl font-semibold text-indigo-700 mb-4">Our Vision</h3>
                            <p className="text-gray-700 leading-relaxed">
                                To be the premier platform that unites DCE professionals globally, drives innovation in the field of textiles and chemical engineering, and contributes to the advancement of the industry through collaborative excellence.
                            </p>
                        </div>
                    </div>
                </div>

                {/* History */}
                <div className="mb-16">
                    <h2 className="text-3xl font-bold text-gray-800 mb-6">Our History</h2>
                    <div className="bg-white p-8 rounded-xl shadow-sm">
                        <p className="text-gray-700 mb-4 text-lg leading-relaxed">
                            The Department of Dyes and Chemical Engineering at Bangladesh University of Textiles was established in <strong>2015</strong> with the goal of advancing education and research in textile chemical processing and sustainable technologies.
                        </p>
                        <p className="text-gray-700 mb-4 text-lg leading-relaxed">
                            Since our establishment {yearsOfDCE} years ago, our graduates have made significant contributions to the textile industry both nationally and internationally, representing BUTEX DCE with distinction across various sectors including manufacturing, research, academia, and entrepreneurship.
                        </p>
                        <p className="text-gray-700 text-lg leading-relaxed">
                            Today, our network continues to grow, with alumni working in leadership positions at renowned organizations and institutions worldwide, building on the strong foundation laid since 2015.
                        </p>
                    </div>
                </div>

                {/* Objectives */}
                <div className="mb-16">
                    <h2 className="text-3xl font-bold text-gray-800 mb-6">Our Objectives</h2>
                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="flex items-start p-6 bg-gray-50 rounded-xl hover:shadow-md transition-shadow duration-300">
                            <div className="bg-blue-600 p-3 rounded-full text-white mr-4 flex-shrink-0">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="font-semibold text-lg mb-2 text-gray-800">Networking</h3>
                                <p className="text-gray-600 leading-relaxed">Facilitate connections between alumni across different graduation years and career paths</p>
                            </div>
                        </div>
                        <div className="flex items-start p-6 bg-gray-50 rounded-xl hover:shadow-md transition-shadow duration-300">
                            <div className="bg-blue-600 p-3 rounded-full text-white mr-4 flex-shrink-0">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="font-semibold text-lg mb-2 text-gray-800">Knowledge Sharing</h3>
                                <p className="text-gray-600 leading-relaxed">Promote the exchange of technical expertise and industry best practices</p>
                            </div>
                        </div>
                        <div className="flex items-start p-6 bg-gray-50 rounded-xl hover:shadow-md transition-shadow duration-300">
                            <div className="bg-blue-600 p-3 rounded-full text-white mr-4 flex-shrink-0">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C20.168 18.477 18.582 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="font-semibold text-lg mb-2 text-gray-800">Mentorship</h3>
                                <p className="text-gray-600 leading-relaxed">Support current students through guidance, internships, and career development</p>
                            </div>
                        </div>
                        <div className="flex items-start p-6 bg-gray-50 rounded-xl hover:shadow-md transition-shadow duration-300">
                            <div className="bg-blue-600 p-3 rounded-full text-white mr-4 flex-shrink-0">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="font-semibold text-lg mb-2 text-gray-800">Industry Collaboration</h3>
                                <p className="text-gray-600 leading-relaxed">Foster partnerships between academia and industry to advance research and innovation</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Department Overview */}
                <div className="mb-16">
                    <h2 className="text-3xl font-bold text-gray-800 mb-6">Department Overview</h2>
                    <div className="bg-white p-8 rounded-xl shadow-sm">
                        <p className="text-gray-700 mb-6 text-lg leading-relaxed">
                            Since its establishment in <strong>2015</strong>, the Department of Dyes and Chemical Engineering at BUTEX has been dedicated to excellence in education, research, and industry collaboration in the field of textile chemical processing, dye chemistry, and sustainable technologies.
                        </p>
                        <p className="text-gray-700 text-lg leading-relaxed">
                            With state-of-the-art laboratories and experienced faculty members, the department has spent the last <strong>{yearsOfDCE} years</strong> preparing students to tackle complex challenges in the textile chemical processing industry with innovative solutions and sustainable approaches.
                        </p>
                    </div>
                </div>

                {/* Statistics Section */}
                <div className="mb-16">
                    <div className="text-center mb-12">
                        <h2 className="text-4xl font-bold text-gray-800 mb-4">Our Growing Community</h2>
                        <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                            Live statistics showing the real impact and reach of our alumni network
                        </p>
                        {loading && (
                            <div className="mt-4">
                                <div className="inline-flex items-center px-4 py-2 bg-blue-50 rounded-full">
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                                    <span className="text-blue-600 text-sm">Loading live data...</span>
                                </div>
                            </div>
                        )}
                    </div>
                    
                    {/* Statistics Counters - Now with 2 cards in a grid */}
                    <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                        <CountUpAnimation 
                            end={stats.totalAlumni || 0} 
                            suffix="+" 
                            label="Total Alumni Members"
                            duration={2500}
                        />
                        <CountUpAnimation 
                            end={yearsOfDCE || 0} 
                            suffix="+" 
                            label="Years of DCE Excellence"
                            duration={2800}
                        />
                    </div>

                    {/* Growth Indicator */}
                    <div className="mt-12 bg-gradient-to-r from-green-50 to-blue-50 p-8 rounded-xl border border-green-200">
                        <div className="flex items-center justify-center mb-4">
                            <div className="flex items-center bg-green-100 px-4 py-2 rounded-full">
                                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse mr-2"></div>
                                <span className="text-green-700 font-medium">Growing Community</span>
                            </div>
                        </div>
                        <p className="text-center text-gray-700">
                            Our alumni network continues to expand with <strong className="text-blue-600">{stats.totalAlumni} total members</strong>.
                            Since establishing our department in 2015, we&apos;ve built {yearsOfDCE} years of excellence in chemical engineering education!
                        </p>
                        <div className="text-center mt-4">
                            <p className="text-sm text-gray-600">
                                📊 Last updated: {new Date().toLocaleString()} • 
                                <span className="text-blue-600 ml-1">Updates automatically every 30 seconds</span>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default About;