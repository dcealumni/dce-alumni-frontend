import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { FaStar, FaQuoteLeft } from 'react-icons/fa';

const Home = () => {
    const [typedText, setTypedText] = useState('');
    const fullText = "Connecting and empowering Dyes and Chemical Engineering graduates from Bangladesh University of Textiles";
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isTyping, setIsTyping] = useState(true);
    
    // 🔥 Add state for upcoming events and latest news
    const [upcomingEvents, setUpcomingEvents] = useState([]);
    const [latestNews, setLatestNews] = useState([]);
    const [loadingEvents, setLoadingEvents] = useState(true);
    const [loadingNews, setLoadingNews] = useState(true);

    // Add state for success stories
    const [successStories, setSuccessStories] = useState([]);
    const [loadingStories, setLoadingStories] = useState(true);

    useEffect(() => {
        if (isTyping && currentIndex < fullText.length) {
            const typingTimer = setTimeout(() => {
                setTypedText(prevText => prevText + fullText[currentIndex]);
                setCurrentIndex(prevIndex => prevIndex + 1);
            }, 50);
            
            return () => clearTimeout(typingTimer);
        } 
        else if (isTyping && currentIndex === fullText.length) {
            setIsTyping(false);
        }
    }, [currentIndex, isTyping, fullText]);

    // 🔥 Fetch upcoming events from API
    useEffect(() => {
        const fetchUpcomingEvents = async () => {
            try {
                setLoadingEvents(true);
                
                // First try the specific upcoming events endpoint
                try {
                    const response = await axios.get('https://dce-server.vercel.app/events/upcoming');
                    console.log('Upcoming Events Response:', response.data);
                    
                    if (response.data.success && response.data.events) {
                        setUpcomingEvents(response.data.events.slice(0, 3));
                        return; // Exit if successful
                    }
                } catch (upcomingError) {
                    console.log('Upcoming endpoint failed, trying fallback...');
                }
                
                // Fallback: fetch all events and filter for upcoming
                const allEventsResponse = await axios.get('https://dce-server.vercel.app/events');
                console.log('All Events Response:', allEventsResponse.data);
                
                let allEvents = [];
                if (allEventsResponse.data.success && allEventsResponse.data.events) {
                    allEvents = allEventsResponse.data.events;
                } else if (Array.isArray(allEventsResponse.data)) {
                    allEvents = allEventsResponse.data;
                }
                
                const upcoming = allEvents.filter(event => 
                    event.eventType === 'Upcoming'
                ).slice(0, 3);
                
                console.log('Filtered Upcoming Events:', upcoming);
                setUpcomingEvents(upcoming);
                
            } catch (error) {
                console.error('Error fetching upcoming events:', error);
                setUpcomingEvents([]); // Set empty array on error
            } finally {
                setLoadingEvents(false);
            }
        };

        fetchUpcomingEvents();
    }, []);

    // 🔥 Fetch latest news from API
    useEffect(() => {
        const fetchLatestNews = async () => {
            try {
                setLoadingNews(true);
                const response = await axios.get('https://dce-server.vercel.app/events');
                const allEvents = response.data.events || response.data || [];
                const news = allEvents.filter(event => event.eventType === 'News').slice(0, 3);
                setLatestNews(news);
            } catch (error) {
                console.error('Error fetching latest news:', error);
                setLatestNews([]);
            } finally {
                setLoadingNews(false);
            }
        };

        fetchLatestNews();
    }, []);

    // Fetch success stories from API
    useEffect(() => {
        const fetchSuccessStories = async () => {
            try {
                setLoadingStories(true);
                const response = await axios.get('https://dce-server.vercel.app/events');
                const allEvents = response.data.events || response.data || [];
                const stories = allEvents.filter(event => event.eventType === 'Success Story').slice(0, 2);
                setSuccessStories(stories);
            } catch (error) {
                console.error('Error fetching success stories:', error);
                setSuccessStories([]);
            } finally {
                setLoadingStories(false);
            }
        };

        fetchSuccessStories();
    }, []);

    // Format date
    const formatDate = (dateString) => {
        if (!dateString) return 'TBD';
        
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('en-US', {
                day: 'numeric',
                month: 'short',
                year: 'numeric'
            });
        } catch (e) {
            return 'TBD';
        }
    };

    // Get days until event
    const getDaysUntil = (dateString) => {
        if (!dateString) return '';
        
        try {
            const eventDate = new Date(dateString);
            const today = new Date();
            const diffTime = eventDate - today;
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            
            if (diffDays === 0) return 'Today';
            if (diffDays === 1) return 'Tomorrow';
            if (diffDays > 0) return `In ${diffDays} days`;
            return '';
        } catch (e) {
            return '';
        }
    };

    // Add this temporary debug code to your Home.jsx (after line 35):
    useEffect(() => {
        const debugEvents = async () => {
            try {
                const response = await axios.get('https://dce-server.vercel.app/events');
                console.log('=== DEBUG: All Events ===');
                console.log('Raw response:', response.data);
                
                const allEvents = response.data.events || response.data || [];
                console.log('All events array:', allEvents);
                
                const upcomingOnly = allEvents.filter(event => event.eventType === 'Upcoming');
                console.log('Upcoming events only:', upcomingOnly);
                
                allEvents.forEach((event, index) => {
                    console.log(`Event ${index}:`, {
                        id: event._id,
                        title: event.title,
                        eventType: event.eventType,
                        date: event.date
                    });
                });
            } catch (error) {
                console.error('Debug error:', error);
            }
        };
        
        debugEvents();
    }, []);

    return (
        <div className='min-h-screen'>
            {/* Hero Section with Background Image */}
            <div className="relative bg-blue-900">
                <div className="absolute inset-0 overflow-hidden opacity-20">
                    <img 
                        src="https://images.unsplash.com/photo-1541339907198-e08756dedf3f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1800&q=80" 
                        alt="University Campus" 
                        className="w-full h-full object-cover"
                    />
                </div>
                <div className="relative max-w-7xl mx-auto px-4 py-24 sm:px-6 lg:px-8 flex flex-col items-center text-center">
                    <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-white tracking-tight mb-6">
                        BUTEX DCE <span className="text-rose-600">Alumni Association</span>
                    </h1>
                    <p className="text-xl text-blue-100 max-w-3xl mb-10 h-16">
                        {typedText}<span className="animate-pulse">|</span>
                    </p>
                    <div className="flex flex-wrap justify-center gap-4">
                        <Link to="/register" className="px-8 py-3 rounded-md bg-blue-600 hover:bg-blue-700 text-white font-medium transition duration-300 transform hover:-translate-y-1">
                            Join the Network
                        </Link>
                        <Link to="/about" className="px-8 py-3 rounded-md bg-transparent border-2 border-blue-200 hover:bg-blue-800 text-white font-medium transition duration-300 transform hover:-translate-y-1">
                            Learn More
                        </Link>
                    </div>
                </div>
            </div>

            {/* Announcement Banner */}
            <div className="bg-indigo-700 text-white">
                <div className="max-w-7xl mx-auto px-4 py-3 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center">
                    <p className="text-sm md:text-base font-medium">
                        <span className="mr-2">🎓</span> Annual Alumni Reunion 2025 - Registration Now Open!
                    </p>
                    <Link to="/upcoming-events" className="mt-2 sm:mt-0 text-blue-200 hover:text-white text-sm md:text-base whitespace-nowrap">
                        Register Now →
                    </Link>
                </div>
            </div>

            {/* Key Features Section */}
            <div className="bg-white py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-gray-900">Why Join Our Network?</h2>
                        <p className="mt-4 max-w-2xl mx-auto text-gray-600">
                            The BUTEX DCE Alumni Association offers numerous benefits and opportunities for graduates
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        <div className="bg-blue-50 rounded-lg p-6 shadow-sm border border-blue-100">
                            <div className="w-12 h-12 bg-blue-700 rounded-full flex items-center justify-center mb-4">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-semibold text-gray-800 mb-2">Professional Network</h3>
                            <p className="text-gray-600">Connect with fellow DCE graduates working across different industries and countries</p>
                        </div>

                        <div className="bg-blue-50 rounded-lg p-6 shadow-sm border border-blue-100">
                            <div className="w-12 h-12 bg-blue-700 rounded-full flex items-center justify-center mb-4">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-semibold text-gray-800 mb-2">Career Opportunities</h3>
                            <p className="text-gray-600">Access exclusive job postings and career advancement opportunities in textile industry</p>
                        </div>

                        <div className="bg-blue-50 rounded-lg p-6 shadow-sm border border-blue-100">
                            <div className="w-12 h-12 bg-blue-700 rounded-full flex items-center justify-center mb-4">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-semibold text-gray-800 mb-2">Knowledge Sharing</h3>
                            <p className="text-gray-600">Participate in industry webinars, workshops and exclusive technical discussions</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* 🔥 REAL UPCOMING EVENTS SECTION */}
            <div className="bg-gray-50 py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-gray-900">Upcoming Events</h2>
                        <p className="mt-4 max-w-2xl mx-auto text-gray-600">
                            Stay connected and grow with our community through these upcoming activities
                        </p>
                    </div>

                    {loadingEvents ? (
                        <div className="flex justify-center py-8">
                            <div className="loading loading-spinner loading-lg"></div>
                        </div>
                    ) : upcomingEvents.length === 0 ? (
                        <div className="text-center py-8">
                            <div className="text-gray-400 mb-4">
                                <svg className="w-16 h-16 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-medium text-gray-600">No Upcoming Events</h3>
                            <p className="text-gray-500">Check back soon for exciting events and activities!</p>
                        </div>
                    ) : (
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {upcomingEvents.map((event) => (
                                <Link 
                                    key={event._id} 
                                    to={`/events/${event._id}`}
                                    className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 block"
                                >
                                    <div className="h-48 relative overflow-hidden">
                                        <img 
                                            src={(event.images && event.images[0]) ? event.images[0] : 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'} 
                                            alt={event.title} 
                                            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                                        />
                                        <div className="absolute top-0 left-0 bg-purple-700 text-white py-1 px-4 rounded-br-lg font-medium">
                                            {formatDate(event.date)}
                                        </div>
                                        {getDaysUntil(event.date) && (
                                            <div className="absolute top-0 right-0 bg-purple-600 text-white py-1 px-3 rounded-bl-lg text-sm">
                                                {getDaysUntil(event.date)}
                                            </div>
                                        )}
                                    </div>
                                    <div className="p-6">
                                        <h3 className="font-semibold text-xl mb-2 line-clamp-2 hover:text-purple-600 transition-colors">
                                            {event.title}
                                        </h3>
                                        <p className="text-gray-600 mb-4 line-clamp-3">
                                            {event.description || 'Join us for this exciting upcoming event!'}
                                        </p>
                                        <div className="flex items-center text-gray-500 text-sm">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                            </svg>
                                            <span>{event.location || 'Location TBD'}</span>
                                        </div>
                                        {event.time && (
                                            <div className="flex items-center text-gray-500 text-sm mt-1">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                                <span>{event.time}</span>
                                            </div>
                                        )}
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}

                    <div className="text-center mt-10">
                        <Link to="/upcoming-events" className="inline-block px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-md transition duration-200">
                            View All Upcoming Events
                        </Link>
                    </div>
                </div>
            </div>

            {/* 🔥 REAL ALUMNI SUCCESS STORIES SECTION */}
            <div className="bg-white py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-gray-900">Alumni Success Stories</h2>
                        <p className="mt-4 max-w-2xl mx-auto text-gray-600">
                            Meet our exceptional graduates who are making significant contributions worldwide
                        </p>
                    </div>

                    {loadingStories ? (
                        <div className="flex justify-center py-8">
                            <div className="loading loading-spinner loading-lg"></div>
                        </div>
                    ) : successStories.length === 0 ? (
                        <div className="text-center py-8">
                            <div className="text-gray-400 mb-4">
                                <FaStar className="w-16 h-16 mx-auto" />
                            </div>
                            <h3 className="text-lg font-medium text-gray-600">No Success Stories Yet</h3>
                            <p className="text-gray-500">Check back soon for inspiring alumni achievements!</p>
                        </div>
                    ) : (
                        <div className="grid md:grid-cols-2 gap-8">
                            {successStories.map((story) => (
                                <div key={story._id} className="bg-gradient-to-br from-yellow-50 to-orange-50 p-6 rounded-lg shadow-sm flex flex-col md:flex-row gap-6">
                                    <div className="w-24 h-24 md:w-32 md:h-32 rounded-full mx-auto md:mx-0 overflow-hidden">
                                        <img 
                                            src={(story.images && story.images[0]) ? story.images[0] : 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80'} 
                                            alt={story.alumniName || story.title} 
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2 mb-2">
                                            <FaStar className="text-yellow-500" />
                                            <span className="text-yellow-700 font-medium text-sm">Success Story</span>
                                        </div>
                                        <h3 className="font-bold text-xl text-gray-800 mb-2">
                                            {story.alumniName || story.title}
                                        </h3>
                                        {story.graduationYear && (
                                            <p className="text-blue-700 font-medium mb-1">Class of {story.graduationYear}</p>
                                        )}
                                        {story.currentPosition && story.company && (
                                            <p className="text-gray-600 mb-3">
                                                {story.currentPosition} at {story.company}
                                            </p>
                                        )}
                                        <p className="text-gray-600 mb-3 line-clamp-3">
                                            {story.achievement || story.description || 'An inspiring success story from our alumni community.'}
                                        </p>
                                        {story.quote && (
                                            <div className="bg-white/70 p-3 rounded-lg mb-3">
                                                <FaQuoteLeft className="text-yellow-500 mb-2" />
                                                <p className="text-gray-700 italic text-sm line-clamp-2">
                                                    "{story.quote}"
                                                </p>
                                            </div>
                                        )}
                                        <Link to={`/events/${story._id}`} className="text-yellow-600 font-medium hover:text-yellow-800">
                                            Read full story →
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    <div className="text-center mt-10">
                        <Link to="/alumni/success-stories" className="inline-block px-6 py-3 bg-yellow-600 hover:bg-yellow-700 text-white font-medium rounded-md transition duration-200">
                            View All Success Stories
                        </Link>
                    </div>
                </div>
            </div>

            {/* 🔥 REAL LATEST NEWS SECTION */}
            <div className="bg-gray-50 py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-gray-900">Latest News</h2>
                        <p className="mt-4 max-w-2xl mx-auto text-gray-600">
                            Stay updated with the latest happenings in our community
                        </p>
                    </div>

                    {loadingNews ? (
                        <div className="flex justify-center py-8">
                            <div className="loading loading-spinner loading-lg"></div>
                        </div>
                    ) : latestNews.length === 0 ? (
                        <div className="text-center py-8">
                            <div className="text-gray-400 mb-4">
                                <svg className="w-16 h-16 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M2 5a2 2 0 012-2h8a2 2 0 012 2v10a2 2 0 002 2H4a2 2 0 01-2-2V5zm3 1h6v4H5V6zm6 6H5v2h6v-2z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-medium text-gray-600">No Latest News</h3>
                            <p className="text-gray-500">Check back soon for the latest updates!</p>
                        </div>
                    ) : (
                        <div className="grid md:grid-cols-3 gap-8">
                            {latestNews.map((news) => (
                                <div key={news._id} className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                                    <div className="h-40 overflow-hidden">
                                        <img 
                                            src={(news.images && news.images[0]) ? news.images[0] : 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'} 
                                            alt={news.title} 
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    <div className="p-6">
                                        <div className="text-green-700 text-sm font-medium mb-2">Latest News</div>
                                        <h3 className="font-semibold text-lg mb-2 line-clamp-2">{news.title}</h3>
                                        <p className="text-gray-600 text-sm mb-3">{formatDate(news.date)}</p>
                                        <p className="text-gray-700 mb-4 line-clamp-3">
                                            {news.description || 'Read more about this latest news...'}
                                        </p>
                                        <Link to={`/events/${news._id}`} className="text-green-600 hover:text-green-800 font-medium text-sm">
                                            Read More →
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    <div className="text-center mt-10">
                        <Link to="/news" className="inline-block px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-md transition duration-200">
                            View All News
                        </Link>
                    </div>
                </div>
            </div>

            {/* Call to Action */}
            <div className="bg-gradient-to-br from-slate-500 to-gray-900 text-white py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-3xl font-bold mb-6">
                        Join the DCE Alumni Network Today
                    </h2>
                    <p className="text-gray-300 mb-10 max-w-3xl mx-auto">
                        Connect with former classmates, access exclusive professional resources, and stay updated with the latest from your alma mater.
                    </p>
                    <div className="flex flex-wrap justify-center gap-4">
                        <Link 
                            to="/register" 
                            className="px-8 py-3 bg-amber-500 hover:bg-amber-600 text-white font-medium rounded-md transition-all duration-200 hover:shadow-lg"
                        >
                            Register Now
                        </Link>
                        <Link 
                            to="/login" 
                            className="px-8 py-3 bg-transparent border-2 border-gray-400 text-white hover:border-amber-500 hover:text-amber-500 font-medium rounded-md transition-all duration-200"
                        >
                            Sign In
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Home;