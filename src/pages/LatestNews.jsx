import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaCalendarAlt, FaMapMarkerAlt, FaUsers, FaClock, FaNewspaper, FaEye } from 'react-icons/fa';

const LatestNews = () => {
    const navigate = useNavigate();
    const [news, setNews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch news data
    useEffect(() => {
        const fetchNews = async () => {
            try {
                setLoading(true);
                const response = await axios.get('https://dce-server.vercel.app/events/news');
                console.log('API Response:', response.data);
                
                // Handle different API response structures
                if (response.data.success) {
                    setNews(response.data.news); // Use .news instead of .events
                } else {
                    setError('Failed to load latest news');
                }
            } catch (err) {
                console.error('Error fetching news:', err);
                setError('Failed to load news. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        fetchNews();
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

    // Get relative time (e.g., "2 days ago")
    const getRelativeTime = (dateString) => {
        if (!dateString) return '';
        
        try {
            const date = new Date(dateString);
            const now = new Date();
            const diffTime = Math.abs(now - date);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            
            if (diffDays === 1) return 'Yesterday';
            if (diffDays < 7) return `${diffDays} days ago`;
            if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
            if (diffDays < 365) return `${Math.ceil(diffDays / 30)} months ago`;
            return `${Math.ceil(diffDays / 365)} years ago`;
        } catch (e) {
            return '';
        }
    };

    const handleViewDetails = (newsId) => {
        navigate(`/news/${newsId}`);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="loading loading-spinner loading-lg"></div>
                    <p className="mt-4 text-gray-600">Loading latest news...</p>
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
        <div className="min-h-screen bg-gray-50 py-8 px-4">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
                        <FaNewspaper className="text-green-600" />
                        Latest News
                    </h1>
                    <p className="text-gray-600 mt-2">Stay updated with the latest news and announcements</p>
                </div>
                
                {news.length === 0 ? (
                    <div className="bg-white rounded-lg shadow-md p-8 text-center">
                        <FaNewspaper className="text-gray-300 text-6xl mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-gray-600 mb-2">No News Available</h3>
                        <p className="text-gray-500">Check back later for the latest updates and announcements.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {news.map((newsItem) => (
                            <div key={newsItem._id || newsItem.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 border-l-4 border-green-500">
                                {/* News Image */}
                                <div className="h-48 overflow-hidden">
                                    <img 
                                        src={(newsItem.images && newsItem.images[0]) ? newsItem.images[0] : '/news-placeholder.jpg'} 
                                        alt={newsItem.title}
                                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                                        onError={(e) => {
                                            e.target.src = '/news-placeholder.jpg';
                                        }}
                                    />
                                </div>
                                
                                {/* News Content */}
                                <div className="p-5">
                                    {/* News Type Badge */}
                                    <div className="flex justify-between items-center mb-3">
                                        <span className="inline-block bg-green-100 text-green-800 text-xs px-3 py-1 rounded-full font-medium">
                                            📰 Latest News
                                        </span>
                                        <span className="text-xs text-gray-500">
                                            {getRelativeTime(newsItem.date)}
                                        </span>
                                    </div>
                                    
                                    {/* News Title */}
                                    <h2 className="text-xl font-semibold mb-3 text-gray-800 hover:text-green-600 transition-colors">
                                        {newsItem.title}
                                    </h2>
                                    
                                    {/* News Details */}
                                    <div className="space-y-2 text-sm text-gray-600 mb-4">
                                        {/* Date */}
                                        <div className="flex items-center">
                                            <FaCalendarAlt className="mr-2 text-green-500" />
                                            {formatDate(newsItem.date)}
                                        </div>
                                        
                                        {/* Time (if available) */}
                                        {newsItem.time && (
                                            <div className="flex items-center">
                                                <FaClock className="mr-2 text-green-500" />
                                                {newsItem.time}
                                            </div>
                                        )}
                                        
                                        {/* Location (if available) */}
                                        {newsItem.location && (
                                            <div className="flex items-center">
                                                <FaMapMarkerAlt className="mr-2 text-green-500" />
                                                {newsItem.location}
                                            </div>
                                        )}
                                    </div>
                                    
                                    {/* Description Preview */}
                                    {newsItem.description && (
                                        <p className="text-gray-600 line-clamp-3 text-sm mb-4">
                                            {newsItem.description}
                                        </p>
                                    )}
                                    
                                    {/* Read More Button */}
                                    <div className="mt-6">
                                        <button 
                                            onClick={() => handleViewDetails(newsItem._id || newsItem.id)}
                                            className="w-full bg-green-500 text-white py-2 rounded-lg hover:bg-green-600 transition-colors flex items-center justify-center gap-2"
                                        >
                                            <FaEye />
                                            Read Full News
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

export default LatestNews;