import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2'; // Add SweetAlert import
import { FaPlus, FaEdit, FaTrash, FaCalendarAlt, FaMapMarkerAlt, FaUsers, FaNewspaper, FaClock, FaHistory, FaStar } from 'react-icons/fa';

const NewsEventsPage = () => {
    const [allEvents, setAllEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [deletingId, setDeletingId] = useState(null);

    useEffect(() => {
        fetchEvents();
    }, []);

    const fetchEvents = async () => {
        try {
            setLoading(true);
            const response = await axios.get('https://dce-server.vercel.app/events');
            
            // Handle the API response structure
            let eventsData = [];
            if (response.data && Array.isArray(response.data.events)) {
                eventsData = response.data.events;
            } else if (Array.isArray(response.data)) {
                eventsData = response.data;
            } else if (response.data && Array.isArray(response.data.data)) {
                eventsData = response.data.data;
            }
            
            setAllEvents(eventsData);
            setError(null);
        } catch (err) {
            console.error('Error fetching events:', err);
            setError('Failed to fetch events');
        } finally {
            setLoading(false);
        }
    };

    // Separate data by type
    const newsItems = allEvents.filter(item => item.eventType === 'News');
    const upcomingEvents = allEvents.filter(item => item.eventType === 'Upcoming');
    const successStories = allEvents.filter(item => item.eventType === 'Success Story'); // Add this line
    const pastEvents = allEvents.filter(item => 
        item.eventType !== 'News' && 
        item.eventType !== 'Upcoming' &&
        item.eventType !== 'Success Story' && // Add this line
        (item.eventType === 'Event' || item.eventType === 'Past' || !item.eventType)
    );

    const handleDelete = async (id, title) => {
        const result = await Swal.fire({
            title: 'Delete Content?',
            text: `Are you sure you want to delete "${title}"?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes, delete it!'
        });

        if (result.isConfirmed) {
            try {
                setDeletingId(id);
                
                // Show deleting progress
                Swal.fire({
                    title: 'Deleting...',
                    allowOutsideClick: false,
                    allowEscapeKey: false,
                    showConfirmButton: false,
                    didOpen: () => {
                        Swal.showLoading();
                    }
                });

                await axios.delete(`https://dce-server.vercel.app/events/${id}`);
                setAllEvents(allEvents.filter(event => event._id !== id));
                
                Swal.fire({
                    title: 'Deleted!',
                    text: 'Content has been deleted successfully.',
                    icon: 'success',
                    timer: 2000,
                    showConfirmButton: false
                });
            } catch (err) {
                console.error('Delete error:', err);
                Swal.fire({
                    title: 'Error!',
                    text: 'Failed to delete content. Please try again.',
                    icon: 'error',
                    confirmButtonColor: '#ef4444'
                });
            } finally {
                setDeletingId(null);
            }
        }
    };

    // Format date to readable format
    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    // Event Card Component
    const EventCard = ({ event, bgColor, textColor }) => (
        <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="aspect-w-16 aspect-h-9 relative">
                <img 
                    src={event.images && event.images[0] ? event.images[0] : '/event-placeholder.jpg'} 
                    alt={event.title} 
                    className="w-full h-32 object-cover"
                    onError={(e) => {
                        e.target.src = '/event-placeholder.jpg';
                    }}
                />
                {event.eventType && (
                    <div className={`absolute top-1 right-1 text-white text-xs px-1.5 py-0.5 rounded ${bgColor}`}>
                        {event.eventType}
                    </div>
                )}
            </div>
            
            <div className="p-3">
                <h3 className="text-base font-bold mb-1 line-clamp-1">
                    {event.title}
                </h3>
                
                <div className="space-y-1 mb-2 text-xs">
                    <div className="flex items-center text-gray-600">
                        <FaCalendarAlt className="mr-1" />
                        <span>{formatDate(event.date)}</span>
                        {event.time && <span className="ml-1 text-xs">• {event.time}</span>}
                    </div>
                    
                    {event.location && (
                        <div className="flex items-center text-gray-600">
                            <FaMapMarkerAlt className="mr-1" />
                            <span className="truncate">{event.location}</span>
                        </div>
                    )}
                </div>
                
                <div className="flex justify-end space-x-1 mt-2">
                    <Link 
                        to={`/dashboard/events/edit/${event._id}`} 
                        className="btn btn-xs btn-outline btn-primary"
                    >
                        <FaEdit />
                        <span className="ml-1">Edit</span>
                    </Link>
                    <button 
                        onClick={() => handleDelete(event._id, event.title)}
                        className="btn btn-xs btn-outline btn-error"
                        disabled={deletingId === event._id}
                    >
                        {deletingId === event._id ? (
                            <span className="loading loading-spinner loading-xs"></span>
                        ) : (
                            <><FaTrash /><span className="ml-1">Delete</span></>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="flex justify-center items-center h-64">
                    <div className="loading loading-spinner loading-lg"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h1 className="text-2xl font-bold">Events & News Management</h1>
                
                {/* Updated Dropdown Menu with Success Story */}
                <div className="dropdown dropdown-end">
                    <div tabIndex={0} role="button" className="btn btn-primary">
                        <FaPlus className="mr-2" />
                        Create New
                        <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                        </svg>
                    </div>
                    <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-56">
                        <li>
                            <Link to="/dashboard/events/add-news" className="flex items-center gap-2">
                                <FaNewspaper className="text-green-500" />
                                Add Latest News
                            </Link>
                        </li>
                        <li>
                            <Link to="/dashboard/events/add-upcoming" className="flex items-center gap-2">
                                <FaClock className="text-purple-500" />
                                Add Upcoming Event
                            </Link>
                        </li>
                        <li>
                            <Link to="/dashboard/events/add-success-story" className="flex items-center gap-2">
                                <FaStar className="text-yellow-500" />
                                Add Success Story
                            </Link>
                        </li>
                        <li>
                            <Link to="/dashboard/events/add" className="flex items-center gap-2">
                                <FaCalendarAlt className="text-blue-500" />
                                Add Past Event
                            </Link>
                        </li>
                    </ul>
                </div>
            </div>

            {error && (
                <div className="alert alert-error">
                    <span>{error}</span>
                </div>
            )}

            {/* LATEST NEWS SECTION */}
            <div className="bg-green-50 p-6 rounded-lg">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <FaNewspaper className="text-2xl text-green-600" />
                        <h2 className="text-xl font-bold text-gray-800">Latest News</h2>
                        <span className="badge badge-success">{newsItems.length}</span>
                    </div>
                    <Link to="/dashboard/events/add-news" className="btn btn-sm btn-success">
                        <FaPlus className="mr-1" />
                        Add News
                    </Link>
                </div>

                {newsItems.length === 0 ? (
                    <div className="text-center py-8 bg-white rounded-lg">
                        <FaNewspaper className="text-gray-300 text-4xl mx-auto mb-2" />
                        <h3 className="text-lg font-medium text-gray-500">No News Found</h3>
                        <p className="mt-1 text-gray-400">Create your first news article</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {newsItems.map((news) => (
                            <EventCard 
                                key={news._id} 
                                event={news} 
                                bgColor="bg-green-600"
                                textColor="text-green-600"
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* ALUMNI SUCCESS STORIES SECTION */}
            <div className="bg-yellow-50 p-6 rounded-lg">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <FaStar className="text-2xl text-yellow-600" />
                        <h2 className="text-xl font-bold text-gray-800">Alumni Success Stories</h2>
                        <span className="badge badge-warning">{successStories.length}</span>
                    </div>
                    <Link to="/dashboard/events/add-success-story" className="btn btn-sm btn-warning">
                        <FaPlus className="mr-1" />
                        Add Success Story
                    </Link>
                </div>

                {successStories.length === 0 ? (
                    <div className="text-center py-8 bg-white rounded-lg">
                        <FaStar className="text-gray-300 text-4xl mx-auto mb-2" />
                        <h3 className="text-lg font-medium text-gray-500">No Success Stories Found</h3>
                        <p className="mt-1 text-gray-400">Share inspiring alumni achievements</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {successStories.map((story) => (
                            <EventCard 
                                key={story._id} 
                                event={story} 
                                bgColor="bg-yellow-600"
                                textColor="text-yellow-600"
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* UPCOMING EVENTS SECTION */}
            <div className="bg-purple-50 p-6 rounded-lg">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <FaClock className="text-2xl text-purple-600" />
                        <h2 className="text-xl font-bold text-gray-800">Upcoming Events</h2>
                        <span className="badge badge-secondary">{upcomingEvents.length}</span>
                    </div>
                    <Link to="/dashboard/events/add-upcoming" className="btn btn-sm btn-secondary">
                        <FaPlus className="mr-1" />
                        Add Upcoming Event
                    </Link>
                </div>

                {upcomingEvents.length === 0 ? (
                    <div className="text-center py-8 bg-white rounded-lg">
                        <FaClock className="text-gray-300 text-4xl mx-auto mb-2" />
                        <h3 className="text-lg font-medium text-gray-500">No Upcoming Events</h3>
                        <p className="mt-1 text-gray-400">Schedule your next event</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {upcomingEvents.map((event) => (
                            <EventCard 
                                key={event._id} 
                                event={event} 
                                bgColor="bg-purple-600"
                                textColor="text-purple-600"
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* PAST EVENTS SECTION */}
            <div className="bg-blue-50 p-6 rounded-lg">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <FaHistory className="text-2xl text-blue-600" />
                        <h2 className="text-xl font-bold text-gray-800">Past Events</h2>
                        <span className="badge badge-primary">{pastEvents.length}</span>
                    </div>
                    <Link to="/dashboard/events/add" className="btn btn-sm btn-primary">
                        <FaPlus className="mr-1" />
                        Add Past Event
                    </Link>
                </div>

                {pastEvents.length === 0 ? (
                    <div className="text-center py-8 bg-white rounded-lg">
                        <FaHistory className="text-gray-300 text-4xl mx-auto mb-2" />
                        <h3 className="text-lg font-medium text-gray-500">No Past Events</h3>
                        <p className="mt-1 text-gray-400">Add your first past event</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {pastEvents.map((event) => (
                            <EventCard 
                                key={event._id} 
                                event={event} 
                                bgColor="bg-blue-600"
                                textColor="text-blue-600"
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default NewsEventsPage;