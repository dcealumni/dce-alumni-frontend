import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaStar, FaQuoteLeft, FaEye, FaArrowRight, FaCalendarAlt, FaGraduationCap, FaBriefcase, FaTrophy } from 'react-icons/fa';

const AlumniSuccessStories = () => {
    const navigate = useNavigate();
    const [successStories, setSuccessStories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch success stories from API
    useEffect(() => {
        const fetchSuccessStories = async () => {
            try {
                setLoading(true);
                const response = await axios.get(`${import.meta.env.VITE_API_URL}events`);
                console.log('All Events API Response:', response.data);
                
                let allEvents = [];
                if (response.data.success && response.data.events) {
                    allEvents = response.data.events;
                } else if (Array.isArray(response.data)) {
                    allEvents = response.data;
                } else {
                    setError('No events data found');
                    return;
                }
                
                // Filter for success stories only
                const stories = allEvents.filter(item => item.eventType === 'Success Story');
                console.log('Filtered Success Stories:', stories);
                setSuccessStories(stories);
                
            } catch (err) {
                console.error('Error fetching success stories:', err);
                setError('Failed to load success stories. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        fetchSuccessStories();
    }, []);

    // Format date
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

    const handleViewDetails = (storyId) => {
        navigate(`/events/${storyId}`);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="loading loading-spinner loading-lg"></div>
                    <p className="mt-4 text-gray-600">Loading success stories...</p>
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
                {/* Header */}
                <div className="mb-16 text-center">
                    <div className="flex items-center justify-center gap-3 mb-4">
                        <FaTrophy className="text-4xl text-yellow-500" />
                        <h1 className="text-4xl font-bold text-gray-900">Alumni Success Stories</h1>
                    </div>
                    <p className="text-gray-600 text-lg max-w-3xl mx-auto">
                        Celebrating the remarkable achievements of our DCE graduates who are making their mark in the textile industry and beyond
                    </p>
                </div>

                {/* Success Stories Grid */}
                {successStories.length === 0 ? (
                    <div className="bg-yellow-50 rounded-xl shadow-sm border-2 border-yellow-300 p-16 text-center">
                        <FaStar className="text-yellow-400 text-6xl mx-auto mb-6" />
                        <h3 className="text-xl font-semibold text-yellow-800 mb-3">No Success Stories Yet</h3>
                        <p className="text-yellow-700">Check back soon for inspiring alumni achievements and stories!</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {successStories.map((story) => (
                            <div key={story._id} className="group bg-gradient-to-br from-yellow-50 to-orange-50 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 border-2 border-yellow-200 overflow-hidden">
                                {/* Story Image */}
                                <div className="h-48 overflow-hidden">
                                    <img 
                                        src={(story.images && story.images[0]) ? story.images[0] : 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'} 
                                        alt={story.alumniName || story.title}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                    />
                                </div>
                                
                                {/* Story Content */}
                                <div className="p-4">
                                    {/* Header */}
                                    <div className="flex items-center justify-between mb-3">
                                        <span className="bg-yellow-200 text-yellow-900 border border-yellow-400 text-xs font-medium px-2 py-1 rounded-md flex items-center gap-1">
                                            <FaStar className="text-xs" />
                                            SUCCESS STORY
                                        </span>
                                        <div className="flex items-center text-xs text-gray-600">
                                            <FaCalendarAlt className="mr-1" />
                                            {formatDate(story.date || story.createdAt)}
                                        </div>
                                    </div>
                                    
                                    {/* Alumni Name & Title */}
                                    <div className="mb-3">
                                        <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-yellow-700 transition-colors line-clamp-1">
                                            {story.alumniName || story.title}
                                        </h3>
                                        
                                        {/* Professional Details */}
                                        <div className="space-y-1">
                                            {story.graduationYear && (
                                                <div className="flex items-center text-blue-700 text-xs">
                                                    <FaGraduationCap className="mr-1" />
                                                    <span className="font-medium">Class of {story.graduationYear}</span>
                                                </div>
                                            )}
                                            
                                            {(story.currentPosition || story.company) && (
                                                <div className="flex items-center text-gray-700 text-xs">
                                                    <FaBriefcase className="mr-1" />
                                                    <span className="line-clamp-1">
                                                        {story.currentPosition && story.company 
                                                            ? `${story.currentPosition} at ${story.company}`
                                                            : story.currentPosition || story.company
                                                        }
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    
                                    {/* Achievement/Description */}
                                    <div className="mb-3">
                                        <p className="text-gray-700 text-xs line-clamp-2 leading-relaxed">
                                            {story.achievement || story.description || 'An inspiring success story from our alumni community showcasing excellence in their professional journey.'}
                                        </p>
                                    </div>
                                    
                                    {/* Quote Section */}
                                    {story.quote && (
                                        <div className="mb-3 bg-white/70 p-3 rounded-md border border-yellow-200">
                                            <FaQuoteLeft className="text-yellow-500 mb-1 text-xs" />
                                            <p className="text-gray-700 italic text-xs line-clamp-2">
                                                "{story.quote}"
                                            </p>
                                        </div>
                                    )}
                                    
                                    {/* Additional Details Grid */}
                                    {(story.industry || story.location || story.yearsOfExperience) && (
                                        <div className="grid grid-cols-3 gap-2 mb-4">
                                            {/* Industry */}
                                            {story.industry && (
                                                <div className="text-center">
                                                    <div className="w-6 h-6 bg-yellow-200 rounded-md flex items-center justify-center mx-auto mb-1 border border-yellow-400">
                                                        <FaBriefcase className="text-xs text-yellow-700" />
                                                    </div>
                                                    <p className="font-medium text-gray-900 text-xs mb-1">Industry</p>
                                                    <p className="text-gray-700 text-xs truncate" title={story.industry}>
                                                        {story.industry}
                                                    </p>
                                                </div>
                                            )}
                                            
                                            {/* Location */}
                                            {story.location && (
                                                <div className="text-center">
                                                    <div className="w-6 h-6 bg-yellow-200 rounded-md flex items-center justify-center mx-auto mb-1 border border-yellow-400">
                                                        <FaCalendarAlt className="text-xs text-yellow-700" />
                                                    </div>
                                                    <p className="font-medium text-gray-900 text-xs mb-1">Location</p>
                                                    <p className="text-gray-700 text-xs truncate" title={story.location}>
                                                        {story.location}
                                                    </p>
                                                </div>
                                            )}
                                            
                                            {/* Experience */}
                                            {story.yearsOfExperience && (
                                                <div className="text-center">
                                                    <div className="w-6 h-6 bg-yellow-200 rounded-md flex items-center justify-center mx-auto mb-1 border border-yellow-400">
                                                        <FaTrophy className="text-xs text-yellow-700" />
                                                    </div>
                                                    <p className="font-medium text-gray-900 text-xs mb-1">Experience</p>
                                                    <p className="text-gray-700 text-xs">
                                                        {story.yearsOfExperience} years
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                    
                                    {/* Action Button */}
                                    <div className="pt-3 border-t border-yellow-300">
                                        <button 
                                            onClick={() => handleViewDetails(story._id)}
                                            className="w-full bg-yellow-600 hover:bg-yellow-700 text-white font-medium px-3 py-2 rounded-md flex items-center justify-center gap-2 transition-colors hover:shadow-md text-sm"
                                        >
                                            <FaEye />
                                            Read Full Story
                                            <FaArrowRight className="text-xs" />
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

export default AlumniSuccessStories;