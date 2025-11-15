import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { FaCalendarAlt, FaMapMarkerAlt, FaUsers, FaChevronLeft, FaClock, FaDownload, FaExternalLinkAlt, FaPlus, FaNewspaper } from 'react-icons/fa';

const EventDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [event, setEvent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeImage, setActiveImage] = useState(0);

    useEffect(() => {
        const fetchEventDetail = async () => {
            try {
                setLoading(true);
                const response = await axios.get(`${import.meta.env.VITE_API_URL}events/${id}`);
                console.log("API Response:", response.data);
                
                // Handle different API response structures
                let eventData;
                if (response.data && response.data.event) {
                    eventData = response.data.event;
                } else if (response.data && response.data.data) {
                    eventData = response.data.data;
                } else {
                    eventData = response.data;
                }
                
                setEvent(eventData);
                setError(null);
            } catch (err) {
                console.error("Error fetching event:", err);
                setError("Failed to load event details");
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchEventDetail();
        }
    }, [id]);

    // Format date to readable format
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
            return 'Invalid date';
        }
    };

    const handlePhotoDownload = () => {
        // If we have a Google Drive link, open it in a new tab
        if (event && event.photoLink) {
            window.open(event.photoLink, '_blank');
        } else {
            // Fallback alert if no link is available
            alert("No photo downloads are available for this event.");
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="loading loading-spinner loading-lg"></div>
                    <p className="mt-4 text-gray-600">Loading event details...</p>
                </div>
            </div>
        );
    }

    if (error || !event) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="bg-white p-8 rounded shadow-md max-w-md w-full text-center">
                    <h2 className="text-2xl font-bold text-red-500 mb-4">Error</h2>
                    <p className="text-gray-600">
                        {error || "Event not found. It may have been removed or is unavailable."}
                    </p>
                    <button 
                        onClick={() => navigate('/events')}
                        className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                    >
                        Back to Events
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4">
            <div className="max-w-6xl mx-auto bg-white rounded-lg shadow-md overflow-hidden">
                {/* Back Button */}
                <div className="p-6 border-b">
                    <button 
                        onClick={() => navigate('/events')}
                        className="flex items-center text-blue-600 hover:text-blue-800"
                    >
                        <FaChevronLeft className="mr-2" />
                        <span>Back to All Events</span>
                    </button>
                </div>
                
                <div className="p-6">
                    {/* Event Header */}
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
                        <h1 className="text-3xl font-bold text-gray-900 mb-2 md:mb-0">{event.title}</h1>
                        
                        {event.eventType && (
                            <span className="inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                                {event.eventType}
                            </span>
                        )}
                    </div>
                    
                    {/* Event Details */}
                    <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-8">
                        <div className="flex items-center">
                            <FaCalendarAlt className="mr-2 text-gray-500" />
                            {formatDate(event.date)}
                        </div>
                        
                        {event.time && (
                            <div className="flex items-center">
                                <FaClock className="mr-2 text-gray-500" />
                                {event.time}
                            </div>
                        )}
                        
                        {event.location && (
                            <div className="flex items-center">
                                <FaMapMarkerAlt className="mr-2 text-gray-500" />
                                {event.location}
                            </div>
                        )}
                        
                        {event.attendees && (
                            <div className="flex items-center">
                                <FaUsers className="mr-2 text-gray-500" />
                                {event.attendees} Attendees
                            </div>
                        )}
                    </div>
                    
                    {/* Image Gallery */}
                    {event.images && event.images.length > 0 && (
                        <div className="mb-10">
                            {/* Main Image */}
                            <div className="rounded-lg overflow-hidden mb-4 border">
                                <img 
                                    src={event.images[activeImage]} 
                                    alt={`${event.title} - Featured image`}
                                    className="w-full h-96 object-contain"
                                    onError={(e) => {
                                        e.target.src = '/event-placeholder.jpg'; // Fallback image
                                    }}
                                />
                            </div>
                            
                            {/* Image Thumbnails */}
                            {event.images.length > 1 && (
                                <div className="flex gap-3 overflow-x-auto pb-2">
                                    {event.images.map((image, index) => (
                                        <button 
                                            key={index} 
                                            className={`w-24 h-24 rounded-md overflow-hidden flex-shrink-0 transition ${
                                                index === activeImage ? "ring-2 ring-blue-600" : "opacity-70 hover:opacity-100"
                                            }`}
                                            onClick={() => setActiveImage(index)}
                                        >
                                            <img 
                                                src={image} 
                                                alt={`Thumbnail ${index + 1}`} 
                                                className="w-full h-full object-cover"
                                                onError={(e) => {
                                                    e.target.src = '/event-placeholder.jpg';
                                                }}
                                            />
                                        </button>
                                    ))}
                                </div>
                            )}
                            
                            {/* Download Photos Button - Changes based on photoLink availability */}
                            <div className="mt-4">
                                {event.photoLink ? (
                                    <button 
                                        onClick={handlePhotoDownload}
                                        className="inline-flex items-center bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
                                    >
                                        <FaDownload className="mr-2" />
                                        Download Event Photos
                                        <FaExternalLinkAlt className="ml-2 text-xs" />
                                    </button>
                                ) : (
                                    <div className="text-sm text-gray-500 italic">
                                        No additional photo downloads available for this event.
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                    
                    {/* Event Description */}
                    <div className="mb-10">
                        <h2 className="text-xl font-semibold mb-4">About This Event</h2>
                        <div className="prose max-w-none text-gray-700 whitespace-pre-wrap">
                            {event.description}
                        </div>
                    </div>
                    
                    {/* Event Highlights */}
                    {event.highlights && event.highlights.length > 0 && (
                        <div className="mb-10">
                            <h2 className="text-xl font-semibold mb-4">Event Highlights</h2>
                            <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {event.highlights.map((highlight, index) => (
                                    <li key={index} className="flex items-center bg-gray-50 p-3 rounded-lg">
                                        <div className="flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-600 rounded-full mr-3 flex-shrink-0">
                                            {index + 1}
                                        </div>
                                        <span>{highlight}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                    
                    {/* Google Drive Link (if no images but link exists) */}
                    {(!event.images || event.images.length === 0) && event.photoLink && (
                        <div className="mb-10">
                            <h2 className="text-xl font-semibold mb-4">Event Photos</h2>
                            <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                                <p className="mb-4">Photos from this event are available for download.</p>
                                <button 
                                    onClick={handlePhotoDownload}
                                    className="inline-flex items-center bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
                                >
                                    <FaDownload className="mr-2" />
                                    View Photo Album
                                    <FaExternalLinkAlt className="ml-2 text-xs" />
                                </button>
                            </div>
                        </div>
                    )}
                    
                    {/* Event Created Date */}
                    {event.createdAt && (
                        <div className="text-sm text-gray-500 mt-8">
                            Event posted on: {formatDate(event.createdAt)}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default EventDetail;