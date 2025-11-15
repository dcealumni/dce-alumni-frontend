import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaCalendarAlt, FaMapMarkerAlt, FaUsers, FaClock, FaNewspaper, FaHistory, FaEye, FaArrowRight, FaBuilding, FaCalendarPlus } from 'react-icons/fa';

const NewsEventsPage = () => {
    const navigate = useNavigate();
    const [allEvents, setAllEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [expandedSections, setExpandedSections] = useState({
        news: false,
        past: false,
        upcoming: false
    });

    // Fetch ALL events from your existing endpoint
    useEffect(() => {
        const fetchAllEvents = async () => {
            try {
                setLoading(true);
                const response = await axios.get('https://dce-server.vercel.app/events');
                console.log('All Events API Response:', response.data);
                
                if (response.data.success && response.data.events) {
                    setAllEvents(response.data.events);
                } else if (Array.isArray(response.data)) {
                    setAllEvents(response.data);
                } else {
                    setError('No events data found');
                }
            } catch (err) {
                console.error('Error fetching events:', err);
                setError('Failed to load events. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        fetchAllEvents();
    }, []);

    // Separate news, upcoming events, and past events
    const newsItems = allEvents.filter(item => item.eventType === 'News');
    const upcomingEvents = allEvents.filter(item => item.eventType === 'Upcoming');
    const pastEvents = allEvents.filter(item => 
        item.eventType === 'Event' // ONLY Past Events, exclude Success Stories completely
    );

    // Professional color schemes for event categories
    const eventCategories = [
        { name: 'Workshop', color: 'blue', bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700', button: 'bg-blue-600 hover:bg-blue-700' },
        { name: 'Seminar', color: 'green', bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-700', button: 'bg-green-600 hover:bg-green-700' },
        { name: 'Conference', color: 'purple', bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-700', button: 'bg-purple-600 hover:bg-purple-700' },
        { name: 'Training', color: 'orange', bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-700', button: 'bg-orange-600 hover:bg-orange-700' },
        { name: 'Networking', color: 'indigo', bg: 'bg-indigo-50', border: 'border-indigo-200', text: 'text-indigo-700', button: 'bg-indigo-600 hover:bg-indigo-700' },
        { name: 'Event', color: 'gray', bg: 'bg-gray-50', border: 'border-gray-200', text: 'text-gray-700', button: 'bg-gray-600 hover:bg-gray-700' }
    ];

    // Format date function
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('en-US', {
                year: 'numeric', 
                month: 'short', 
                day: 'numeric'
            });
        } catch (e) {
            return dateString;
        }
    };

    // Get time ago for news
    const getTimeAgo = (dateString) => {
        if (!dateString) return '';
        
        try {
            const newsDate = new Date(dateString);
            const today = new Date();
            const diffTime = Math.abs(today - newsDate);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            
            if (diffDays === 1) return 'Yesterday';
            if (diffDays < 7) return `${diffDays} days ago`;
            if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
            return `${Math.ceil(diffDays / 30)} months ago`;
        } catch (e) {
            return '';
        }
    };

    const handleViewDetails = (itemId) => {
        navigate(`/events/${itemId}`);
    };

    const toggleSection = (section) => {
        setExpandedSections(prev => ({
            ...prev,
            [section]: !prev[section]
        }));
    };

    // Color schemes for each section
    const upcomingColorScheme = {
        cardBg: 'bg-blue-100',
        border: 'border-blue-400',
        badgeBg: 'bg-blue-200',
        badgeText: 'text-blue-900',
        badgeBorder: 'border-blue-500',
        iconBg: 'bg-blue-200',
        iconColor: 'text-blue-800',
        borderTop: 'border-blue-400',
        button: 'bg-blue-600 hover:bg-blue-700',
        hoverText: 'text-blue-800',
        icon: <FaCalendarPlus className="text-xs" />
    };

    const newsColorScheme = {
        cardBg: 'bg-violet-100',
        border: 'border-cyan-400',
        badgeBg: 'bg-cyan-200',
        badgeText: 'text-cyan-900',
        badgeBorder: 'border-cyan-500',
        iconBg: 'bg-cyan-200',
        iconColor: 'text-cyan-800',
        borderTop: 'border-cyan-400',
        button: 'bg-cyan-600 hover:bg-cyan-700',
        hoverText: 'text-cyan-800',
        icon: <FaNewspaper className="text-xs" />
    };

    const pastColorScheme = {
        cardBg: 'bg-purple-100',
        border: 'border-purple-400',
        badgeBg: 'bg-purple-200',
        badgeText: 'text-purple-900',
        badgeBorder: 'border-purple-500',
        iconBg: 'bg-purple-200',
        iconColor: 'text-purple-800',
        borderTop: 'border-purple-400',
        button: 'bg-purple-600 hover:bg-purple-700',
        hoverText: 'text-purple-800',
        icon: <FaBuilding className="text-xs" />
    };

    // Universal Card Component
    const UniversalCard = ({ item, type, colorScheme, category }) => (
        <div className={`group rounded-xl shadow-md hover:shadow-lg transition-all duration-300 border-2 ${colorScheme.border} overflow-hidden ${colorScheme.cardBg}`}>
            {/* Image Section */}
            <div className="h-72 overflow-hidden">
                <img 
                    src={(item.images && item.images[0]) ? item.images[0] : `https://via.placeholder.com/400x288?text=${type}`} 
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
            </div>
            
            {/* Content Section */}
            <div className="p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                    <span className={`${colorScheme.badgeBg} ${colorScheme.badgeText} border-2 ${colorScheme.badgeBorder} text-sm font-medium px-3 py-1 rounded-lg flex items-center gap-1`}>
                        {colorScheme.icon}
                        {type === 'News' ? 'NEWS' : type === 'Upcoming' ? 'UPCOMING' : (item.eventType || category?.name || 'EVENT')}
                    </span>
                    <div className="flex items-center text-sm text-gray-700">
                        <FaCalendarAlt className="mr-2" />
                        {type === 'News' ? getTimeAgo(item.createdAt || item.date) : formatDate(item.date)}
                    </div>
                </div>
                
                {/* Title and Description */}
                <div className="mb-4">
                    <h3 className={`text-lg font-bold text-gray-900 mb-2 group-hover:${colorScheme.hoverText} transition-colors line-clamp-2`}>
                        {item.title}
                    </h3>
                    {type !== 'News' && (
                        <p className="text-gray-800 text-sm line-clamp-2 leading-relaxed">
                            {item.description || 'No description available for this event.'}
                        </p>
                    )}
                </div>
                
                {/* Event Details - Only for Events */}
                {type !== 'News' && (
                    <div className="grid grid-cols-3 gap-3 mb-6">
                        {/* Time */}
                        <div className="text-center">
                            <div className={`w-8 h-8 ${colorScheme.iconBg} rounded-lg flex items-center justify-center mx-auto mb-2 border ${colorScheme.badgeBorder}`}>
                                <FaClock className={`text-xs ${colorScheme.iconColor}`} />
                            </div>
                            <p className="font-medium text-gray-900 text-xs mb-1">Time</p>
                            <p className="text-gray-800 text-xs">{item.time || 'N/A'}</p>
                        </div>
                        
                        {/* Location */}
                        <div className="text-center">
                            <div className={`w-8 h-8 ${colorScheme.iconBg} rounded-lg flex items-center justify-center mx-auto mb-2 border ${colorScheme.badgeBorder}`}>
                                <FaMapMarkerAlt className={`text-xs ${colorScheme.iconColor}`} />
                            </div>
                            <p className="font-medium text-gray-900 text-xs mb-1">Location</p>
                            <p className="text-gray-800 text-xs truncate" title={item.location}>
                                {item.location || 'N/A'}
                            </p>
                        </div>
                        
                        {/* Attendees */}
                        <div className="text-center">
                            <div className={`w-8 h-8 ${colorScheme.iconBg} rounded-lg flex items-center justify-center mx-auto mb-2 border ${colorScheme.badgeBorder}`}>
                                <FaUsers className={`text-xs ${colorScheme.iconColor}`} />
                            </div>
                            <p className="font-medium text-gray-900 text-xs mb-1">Attendees</p>
                            <p className="text-gray-800 text-xs">
                                {item.attendees ? `${item.attendees}` : 'N/A'}
                            </p>
                        </div>
                    </div>
                )}
                
                {/* Action Button */}
                <div className={`pt-4 border-t-2 ${colorScheme.borderTop}`}>
                    <button 
                        onClick={() => handleViewDetails(item._id)}
                        className={`w-full ${colorScheme.button} text-white font-medium px-4 py-3 rounded-lg flex items-center justify-center gap-2 transition-colors hover:shadow-md`}
                    >
                        <FaEye />
                        {type === 'News' ? 'Read More' : 'View Details'}
                        <FaArrowRight className="text-sm" />
                    </button>
                </div>
            </div>
        </div>
    );

    // Render section with title, icon, and color scheme
    const renderSection = (items, type, title, icon, color) => {
        const colorScheme = {
            cardBg: `bg-${color}-100`,
            border: `border-${color}-400`,
            badgeBg: `bg-${color}-200`,
            badgeText: `text-${color}-900`,
            badgeBorder: `border-${color}-500`,
            iconBg: `bg-${color}-200`,
            iconColor: `text-${color}-800`,
            borderTop: `border-${color}-400`,
            button: `bg-${color}-600 hover:bg-${color}-700`,
            hoverText: `text-${color}-800`,
            icon: React.cloneElement(icon, { className: 'text-xs' })
        };

        return (
            <div className="mb-20">
                <div className="flex items-center gap-4 mb-10">
                    <div className={`w-1 h-8 bg-${color}-600 rounded-full`}></div>
                    <h2 className="text-3xl font-bold text-gray-900">{title}</h2>
                    {icon}
                </div>

                {items.length === 0 ? (
                    <div className={`bg-${color}-100 rounded-xl shadow-sm border-2 border-${color}-400 p-16 text-center`}>
                        {React.cloneElement(icon, { className: `text-${color}-400 text-6xl mx-auto mb-6` })}
                        <h3 className={`text-xl font-semibold text-${color}-800 mb-3`}>No {title}</h3>
                        <p className={`text-${color}-700`}>No {title.toLowerCase()} found at the moment.</p>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {(expandedSections[type] ? items : items.slice(0, 3)).map((item, index) => {
                                const category = eventCategories[index % eventCategories.length];
                                return (
                                    <UniversalCard
                                        key={item._id}
                                        item={item}
                                        type={type.charAt(0).toUpperCase() + type.slice(1)}
                                        colorScheme={colorScheme}
                                        category={category}
                                    />
                                );
                            })}
                        </div>
                        
                        {/* ONLY show View All button if more than 3 items */}
                        {items.length > 3 && (
                            <div className="text-center mt-8">
                                <button
                                    onClick={() => {
                                        const routeMap = {
                                            'news': '/news',
                                            'past': '/all-past-events', 
                                            'upcoming': '/upcoming-events'
                                        };
                                        navigate(routeMap[type] || '/past-events');
                                    }}
                                    className={`bg-${color}-600 hover:bg-${color}-700 text-white font-medium px-8 py-3 rounded-lg flex items-center gap-2 mx-auto transition-colors shadow-md hover:shadow-lg`}
                                >
                                    <FaEye />
                                    View All {title}
                                    <FaArrowRight />
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        );
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="loading loading-spinner loading-lg"></div>
                    <p className="mt-4 text-gray-600">Loading news and events...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="bg-white p-8 rounded shadow-md max-w-md w-full text-center">
                    <h2 className="text-2xl font-bold text-red-500 mb-4">Error</h2>
                    <p className="text-gray-600">{error}</p>
                    <button 
                        onClick={() => window.location.reload()}
                        className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white py-12 px-4">
            <div className="max-w-7xl mx-auto">
                {/* Main Header */}
                <div className="mb-16 text-center">
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">News & Events</h1>
                    <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                        Stay updated with the latest news and explore our upcoming and past events
                    </p>
                </div>

                {/* LATEST NEWS SECTION */}
                {renderSection(
                    newsItems, 
                    'news', 
                    'Latest News', 
                    <FaNewspaper className="text-2xl text-cyan-600 ml-2" />, 
                    'cyan'
                )}

                {/* PAST EVENTS SECTION - Only Events */}
                {renderSection(
                    pastEvents, // Already filtered to exclude Success Stories
                    'past', 
                    'Past Events', 
                    <FaHistory className="text-2xl text-purple-600 ml-2" />, 
                    'purple'
                )}

                {/* UPCOMING EVENTS SECTION - Moved to Bottom */}
                {renderSection(
                    upcomingEvents, 
                    'upcoming', 
                    'Upcoming Events', 
                    <FaCalendarPlus className="text-2xl text-blue-600 ml-2" />, 
                    'blue'
                )}
            </div>
        </div>
    );
};

export default NewsEventsPage;