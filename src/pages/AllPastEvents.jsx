import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaHistory, FaArrowLeft, FaSearch, FaFilter, FaCalendar } from 'react-icons/fa';
import UniversalCard from '../components/UniversalCard';

const AllPastEvents = () => {
  const navigate = useNavigate();
  const [pastEvents, setPastEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('newest');

  const pastColorScheme = {
    primary: 'bg-purple-600',
    secondary: 'bg-purple-50',
    accent: 'text-purple-600',
    border: 'border-purple-200',
    cardBg: 'bg-white',
    badgeBg: 'bg-purple-100',
    badgeText: 'text-purple-800',
    badgeBorder: 'border-purple-300',
    iconBg: 'bg-purple-100',
    iconColor: 'text-purple-600',
    borderTop: 'border-purple-200',
    button: 'bg-purple-600 hover:bg-purple-700',
    hoverText: 'text-purple-700',
    icon: '🏛️'
  };

  const eventCategories = [
    { name: 'Workshop', color: 'bg-blue-100 text-blue-800', icon: '🛠️' },
    { name: 'Seminar', color: 'bg-green-100 text-green-800', icon: '📚' },
    { name: 'Conference', color: 'bg-purple-100 text-purple-800', icon: '🎤' },
    { name: 'Social', color: 'bg-pink-100 text-pink-800', icon: '🎉' },
    { name: 'Meeting', color: 'bg-yellow-100 text-yellow-800', icon: '💼' }
  ];

  useEffect(() => {
    fetchPastEvents();
  }, []);

  const fetchPastEvents = async () => {
    try {
      const response = await axios.get('https://dce-server.vercel.app/events');
      console.log('API Response:', response.data);
      
      const allEvents = response.data.events || response.data || [];
      
      // Filter for ONLY Events with eventType === 'Event'
      const pastEventsOnly = allEvents.filter(event => 
        event.eventType === 'Event' // ONLY events, nothing else
      );
      
      console.log('Filtered Past Events Only:', pastEventsOnly);
      setPastEvents(pastEventsOnly);
    } catch (error) {
      console.error('Error fetching past events:', error);
      setPastEvents([]); // Empty array if error
    } finally {
      setLoading(false);
    }
  };

  const filteredEvents = pastEvents
    .filter(event => 
      event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.location.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === 'newest') return new Date(b.date) - new Date(a.date);
      if (sortBy === 'oldest') return new Date(a.date) - new Date(b.date);
      if (sortBy === 'title') return a.title.localeCompare(b.title);
      return 0;
    });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading past events...</p>
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
            className="flex items-center gap-2 text-purple-600 hover:text-purple-700 font-medium mb-4 transition-colors"
          >
            <FaArrowLeft />
            Back to News & Events
          </button>
          
          <div className="flex items-center gap-4 mb-6">
            <div className="w-1 h-8 bg-purple-600 rounded-full"></div>
            <h1 className="text-4xl font-bold text-gray-900">All Past Events</h1>
            <FaHistory className="text-3xl text-purple-600" />
          </div>
          
          <p className="text-gray-600 text-lg">
            Explore our history of successful events and gatherings
          </p>
        </div>

        {/* Search and Filter */}
        <div className="bg-white rounded-xl shadow-sm border p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search events..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            
            <div className="relative">
              <FaFilter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="pl-10 pr-8 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent appearance-none bg-white min-w-[160px]"
              >
                <option value="newest">Most Recent</option>
                <option value="oldest">Oldest First</option>
                <option value="title">By Title</option>
              </select>
            </div>
          </div>
          
          <div className="mt-4 text-sm text-gray-500">
            Showing {filteredEvents.length} of {pastEvents.length} past events
          </div>
        </div>

        {/* Events Grid */}
        {filteredEvents.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border p-16 text-center">
            <FaHistory className="text-gray-300 text-6xl mx-auto mb-6" />
            <h3 className="text-xl font-semibold text-gray-800 mb-3">
              {searchTerm ? 'No events found' : 'No past events available'}
            </h3>
            <p className="text-gray-600">
              {searchTerm ? 'Try adjusting your search terms.' : 'Events will appear here once they are completed.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredEvents.map((event, index) => {
              const category = eventCategories[index % eventCategories.length];
              return (
                <UniversalCard
                  key={event._id}
                  item={event}
                  type="Past"
                  colorScheme={pastColorScheme}
                  category={category}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default AllPastEvents;