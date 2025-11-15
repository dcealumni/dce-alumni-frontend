import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaCalendarAlt, FaMapMarkerAlt, FaUsers, FaClock, FaEye } from 'react-icons/fa';

const UpcomingEvents = () => {
    const navigate = useNavigate();
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch upcoming events data
    useEffect(() => {
        const fetchUpcomingEvents = async () => {
            try {
                setLoading(true);
                // 🔥 Use your specific upcoming events endpoint
                const response = await axios.get('https://dce-server.vercel.app/events/upcoming');
                console.log('API Response:', response.data);
                
                if (response.data.success) {
                    setEvents(response.data.events);
                } else {
                    setError('Failed to load upcoming events');
                }
            } catch (err) {
                console.error('Error fetching upcoming events:', err);
                setError('Failed to load upcoming events. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        fetchUpcomingEvents();
    }, []);

    // Format date
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('en-US', {
                year: 'numeric', 
                month: 'long', 
                day: 'numeric'
            });
        } catch (e) {
            console.error('Date formatting error:', e);
            return dateString;
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
            return 'Past event';
        } catch (e) {
            return '';
        }
    };

    const handleViewDetails = (eventId) => {
        navigate(`/events/${eventId}`);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="loading loading-spinner loading-lg"></div>
                    <p className="mt-4 text-gray-600">Loading upcoming events...</p>
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
                        className="mt-4 bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
                        <FaClock className="text-purple-600" />
                        Upcoming Events
                    </h1>
                    <p className="text-gray-600 mt-2">Don't miss these exciting upcoming events</p>
                </div>
                
                {events.length === 0 ? (
                    <div className="bg-white rounded-lg shadow-md p-8 text-center">
                        <FaClock className="text-gray-300 text-6xl mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-gray-600 mb-2">No Upcoming Events</h3>
                        <p className="text-gray-500">Check back later for exciting events and activities.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {events.map((event) => (
                            <div key={event._id || event.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 border-l-4 border-purple-500">
                                {/* Event Image */}
                                <div className="h-48 overflow-hidden">
                                    <img 
                                        src={(event.images && event.images[0]) ? event.images[0] : '/event-placeholder.jpg'} 
                                        alt={event.title}
                                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                                        onError={(e) => {
                                            e.target.src = '/event-placeholder.jpg';
                                        }}
                                    />
                                </div>
                                
                                {/* Event Content */}
                                <div className="p-5">
                                    {/* Event Type Badge */}
                                    <div className="flex justify-between items-center mb-3">
                                        <span className="inline-block bg-purple-100 text-purple-800 text-xs px-3 py-1 rounded-full font-medium">
                                            🕒 Upcoming Event
                                        </span>
                                        <span className="text-xs text-purple-600 font-medium">
                                            {getDaysUntil(event.date)}
                                        </span>
                                    </div>
                                    
                                    {/* Event Title */}
                                    <h2 className="text-xl font-semibold mb-3 text-gray-800 hover:text-purple-600 transition-colors">
                                        {event.title}
                                    </h2>
                                    
                                    {/* Event Details */}
                                    <div className="space-y-2 text-sm text-gray-600 mb-4">
                                        {/* Date */}
                                        <div className="flex items-center">
                                            <FaCalendarAlt className="mr-2 text-purple-500" />
                                            {formatDate(event.date)}
                                        </div>
                                        
                                        {/* Time */}
                                        {event.time && (
                                            <div className="flex items-center">
                                                <FaClock className="mr-2 text-purple-500" />
                                                {event.time}
                                            </div>
                                        )}
                                        
                                        {/* Location */}
                                        {event.location && (
                                            <div className="flex items-center">
                                                <FaMapMarkerAlt className="mr-2 text-purple-500" />
                                                {event.location}
                                            </div>
                                        )}
                                        
                                        {/* Expected Attendees */}
                                        {event.attendees && (
                                            <div className="flex items-center">
                                                <FaUsers className="mr-2 text-purple-500" />
                                                {event.attendees} expected attendees
                                            </div>
                                        )}
                                    </div>
                                    
                                    {/* Description Preview */}
                                    {event.description && (
                                        <p className="text-gray-600 line-clamp-3 text-sm mb-4">
                                            {event.description}
                                        </p>
                                    )}
                                    
                                    {/* View Details Button */}
                                    <div className="mt-6">
                                        <button 
                                            onClick={() => handleViewDetails(event._id || event.id)}
                                            className="w-full bg-purple-500 text-white py-2 rounded-lg hover:bg-purple-600 transition-colors flex items-center justify-center gap-2"
                                        >
                                            <FaEye />
                                            View Event Details
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default UpcomingEvents;