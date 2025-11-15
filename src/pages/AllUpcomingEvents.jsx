import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaCalendarPlus, FaArrowLeft, FaSearch, FaFilter, FaClock } from 'react-icons/fa';
import UniversalCard from '../components/UniversalCard';

const AllUpcomingEvents = () => {
  const navigate = useNavigate();
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('soonest');

  const upcomingColorScheme = {
    primary: 'bg-blue-600',
    secondary: 'bg-blue-50',
    accent: 'text-blue-600',
    border: 'border-blue-200',
    cardBg: 'bg-white',
    badgeBg: 'bg-blue-100',
    badgeText: 'text-blue-800',
    badgeBorder: 'border-blue-300',
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-600',
    borderTop: 'border-blue-200',
    button: 'bg-blue-600 hover:bg-blue-700',
    hoverText: 'text-blue-700',
    icon: '📅'
  };

  useEffect(() => {
    fetchUpcomingEvents();
  }, []);

  const fetchUpcomingEvents = async () => {
    try {
      const response = await axios.get('https://dce-server.vercel.app/events');
      console.log('API Response:', response.data);
      
      const allEvents = response.data.events || response.data || [];
      
      // Filter for ONLY Upcoming Events (eventType === 'Upcoming')
      const upcomingEventsOnly = allEvents.filter(event => event.eventType === 'Upcoming');
      
      console.log('Filtered Upcoming Events Only:', upcomingEventsOnly);
      setUpcomingEvents(upcomingEventsOnly);
    } catch (error) {
      console.error('Error fetching upcoming events:', error);
      setUpcomingEvents([]); // Empty array if error
    } finally {
      setLoading(false);
    }
  };

  const filteredEvents = upcomingEvents
    .filter(event => 
      event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.location.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === 'soonest') return new Date(a.date) - new Date(b.date);
      if (sortBy === 'latest') return new Date(b.date) - new Date(a.date);
      if (sortBy === 'title') return a.title.localeCompare(b.title);
      return 0;
    });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading upcoming events...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/past-events')}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium mb-4 transition-colors"
          >
            <FaArrowLeft />
            Back to News & Events
          </button>
          
          <div className="flex items-center gap-4 mb-6">
            <div className="w-1 h-8 bg-blue-600 rounded-full"></div>
            <h1 className="text-4xl font-bold text-gray-900">All Upcoming Events</h1>
            <FaCalendarPlus className="text-3xl text-blue-600" />
          </div>
          
          <p className="text-gray-600 text-lg">
            Don't miss out on these exciting upcoming events and opportunities
          </p>
        </div>

        {/* Search and Filter */}
        <div className="bg-white rounded-xl shadow-sm border p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search upcoming events..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div className="relative">
              <FaFilter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="pl-10 pr-8 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white min-w-[160px]"
              >
                <option value="soonest">Soonest First</option>
                <option value="latest">Latest First</option>
                <option value="title">By Title</option>
              </select>
            </div>
          </div>
          
          <div className="mt-4 text-sm text-gray-500">
            Showing {filteredEvents.length} of {upcomingEvents.length} upcoming events
          </div>
        </div>

        {/* Events Grid */}
        {filteredEvents.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border p-16 text-center">
            <FaCalendarPlus className="text-gray-300 text-6xl mx-auto mb-6" />
            <h3 className="text-xl font-semibold text-gray-800 mb-3">
              {searchTerm ? 'No events found' : 'No upcoming events'}
            </h3>
            <p className="text-gray-600">
              {searchTerm ? 'Try adjusting your search terms.' : 'Stay tuned for exciting events coming soon!'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredEvents.map((event) => (
              <UniversalCard
                key={event._id}
                item={event}
                type="Upcoming"
                colorScheme={upcomingColorScheme}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AllUpcomingEvents;