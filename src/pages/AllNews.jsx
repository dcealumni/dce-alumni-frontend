import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaNewspaper, FaArrowLeft, FaSearch, FaFilter } from 'react-icons/fa';
import UniversalCard from '../components/UniversalCard';

const AllNews = () => {
  const navigate = useNavigate();
  const [newsItems, setNewsItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('newest');

  const newsColorScheme = {
    primary: 'bg-cyan-600',
    secondary: 'bg-cyan-50',
    accent: 'text-cyan-600',
    border: 'border-cyan-200',
    cardBg: 'bg-white',
    badgeBg: 'bg-cyan-100',
    badgeText: 'text-cyan-800',
    badgeBorder: 'border-cyan-300',
    iconBg: 'bg-cyan-100',
    iconColor: 'text-cyan-600',
    borderTop: 'border-cyan-200',
    button: 'bg-cyan-600 hover:bg-cyan-700',
    hoverText: 'text-cyan-700',
    icon: '📰'
  };

  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async () => {
    try {
      const response = await axios.get('https://dce-server.vercel.app/events');
      console.log('API Response:', response.data);
      
      const allEvents = response.data.events || response.data || [];
      
      // Filter for ONLY News items (eventType === 'News')
      const newsOnly = allEvents.filter(event => event.eventType === 'News');
      
      console.log('Filtered News Only:', newsOnly);
      setNewsItems(newsOnly);
    } catch (error) {
      console.error('Error fetching news:', error);
      setNewsItems([]); // Empty array if error
    } finally {
      setLoading(false);
    }
  };

  const filteredNews = newsItems
    .filter(news => 
      news.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      news.description.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === 'newest') return new Date(b.createdAt) - new Date(a.createdAt);
      if (sortBy === 'oldest') return new Date(a.createdAt) - new Date(b.createdAt);
      if (sortBy === 'title') return a.title.localeCompare(b.title);
      return 0;
    });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-cyan-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading news...</p>
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
            className="flex items-center gap-2 text-cyan-600 hover:text-cyan-700 font-medium mb-4 transition-colors"
          >
            <FaArrowLeft />
            Back to News & Events
          </button>
          
          <div className="flex items-center gap-4 mb-6">
            <div className="w-1 h-8 bg-cyan-600 rounded-full"></div>
            <h1 className="text-4xl font-bold text-gray-900">All News</h1>
            <FaNewspaper className="text-3xl text-cyan-600" />
          </div>
          
          <p className="text-gray-600 text-lg">
            Stay updated with the latest news from DCE Alumni Association
          </p>
        </div>

        {/* Search and Filter */}
        <div className="bg-white rounded-xl shadow-sm border p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search news..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              />
            </div>
            
            <div className="relative">
              <FaFilter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="pl-10 pr-8 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent appearance-none bg-white min-w-[160px]"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="title">By Title</option>
              </select>
            </div>
          </div>
          
          <div className="mt-4 text-sm text-gray-500">
            Showing {filteredNews.length} of {newsItems.length} news articles
          </div>
        </div>

        {/* News Grid */}
        {filteredNews.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border p-16 text-center">
            <FaNewspaper className="text-gray-300 text-6xl mx-auto mb-6" />
            <h3 className="text-xl font-semibold text-gray-800 mb-3">
              {searchTerm ? 'No news found' : 'No news available'}
            </h3>
            <p className="text-gray-600">
              {searchTerm ? 'Try adjusting your search terms.' : 'Check back later for updates.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredNews.map((newsItem) => (
              <UniversalCard
                key={newsItem._id}
                item={newsItem}
                type="News"
                colorScheme={newsColorScheme}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AllNews;