import React from 'react';
import { FaCalendarAlt, FaMapMarkerAlt, FaUsers, FaClock, FaEye, FaArrowRight } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const UniversalCard = ({ item, type, colorScheme, category }) => {
  const navigate = useNavigate();

  const handleViewDetails = (itemId) => {
    navigate(`/events/${itemId}`);
  };

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

  // Default color scheme if none provided
  const defaultColorScheme = {
    border: 'border-gray-200',
    cardBg: 'bg-white',
    badgeBg: 'bg-blue-100',
    badgeText: 'text-blue-800',
    badgeBorder: 'border-blue-300',
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-600',
    borderTop: 'border-gray-200',
    button: 'bg-blue-600 hover:bg-blue-700',
    hoverText: 'text-blue-700',
    icon: '📅'
  };

  // Merge provided colorScheme with defaults
  const colors = { ...defaultColorScheme, ...colorScheme };

  // Determine display type and badge text
  const getDisplayType = () => {
    if (type === 'News') return 'NEWS';
    if (type === 'Upcoming') return 'UPCOMING';
    if (type === 'Past') return 'PAST EVENT';
    return item.eventType || category?.name || 'EVENT';
  };

  // Get appropriate date display
  const getDateDisplay = () => {
    if (type === 'News') {
      return getTimeAgo(item.createdAt || item.date);
    }
    return formatDate(item.date);
  };

  return (
    <div className={`group rounded-xl shadow-md hover:shadow-lg transition-all duration-300 border-2 ${colors.border} overflow-hidden ${colors.cardBg}`}>
      {/* Image Section */}
      <div className="h-72 overflow-hidden">
        <img 
          src={(item.images && item.images[0]) ? item.images[0] : `https://via.placeholder.com/400x288?text=${encodeURIComponent(type || 'Event')}`} 
          alt={item.title || 'Event Image'}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            e.target.src = `https://via.placeholder.com/400x288?text=${encodeURIComponent(type || 'Event')}`;
          }}
        />
      </div>
      
      {/* Content Section */}
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <span className={`${colors.badgeBg} ${colors.badgeText} border-2 ${colors.badgeBorder} text-sm font-medium px-3 py-1 rounded-lg flex items-center gap-1`}>
            <span className="text-sm">{colors.icon}</span>
            {getDisplayType()}
          </span>
          <div className="flex items-center text-sm text-gray-700">
            <FaCalendarAlt className="mr-2" />
            <span>{getDateDisplay()}</span>
          </div>
        </div>
        
        {/* Title and Description */}
        <div className="mb-4">
          <h3 className={`text-lg font-bold text-gray-900 mb-2 transition-colors line-clamp-2`}>
            {item.title || 'Untitled'}
          </h3>
          {type !== 'News' && (
            <p className="text-gray-800 text-sm line-clamp-2 leading-relaxed">
              {item.description || 'No description available for this event.'}
            </p>
          )}
        </div>
        
        {/* Event Details - Only for Events (not News) */}
        {type !== 'News' && (
          <div className="grid grid-cols-3 gap-3 mb-6">
            {/* Time */}
            <div className="text-center">
              <div className={`w-8 h-8 ${colors.iconBg} rounded-lg flex items-center justify-center mx-auto mb-2 border ${colors.badgeBorder}`}>
                <FaClock className={`text-xs ${colors.iconColor}`} />
              </div>
              <p className="font-medium text-gray-900 text-xs mb-1">Time</p>
              <p className="text-gray-800 text-xs">{item.time || 'N/A'}</p>
            </div>
            
            {/* Location */}
            <div className="text-center">
              <div className={`w-8 h-8 ${colors.iconBg} rounded-lg flex items-center justify-center mx-auto mb-2 border ${colors.badgeBorder}`}>
                <FaMapMarkerAlt className={`text-xs ${colors.iconColor}`} />
              </div>
              <p className="font-medium text-gray-900 text-xs mb-1">Location</p>
              <p className="text-gray-800 text-xs truncate" title={item.location || 'N/A'}>
                {item.location || 'N/A'}
              </p>
            </div>
            
            {/* Attendees */}
            <div className="text-center">
              <div className={`w-8 h-8 ${colors.iconBg} rounded-lg flex items-center justify-center mx-auto mb-2 border ${colors.badgeBorder}`}>
                <FaUsers className={`text-xs ${colors.iconColor}`} />
              </div>
              <p className="font-medium text-gray-900 text-xs mb-1">Attendees</p>
              <p className="text-gray-800 text-xs">
                {item.attendees ? `${item.attendees}` : 'N/A'}
              </p>
            </div>
          </div>
        )}
        
        {/* Action Button */}
        <div className={`pt-4 border-t-2 ${colors.borderTop}`}>
          <button 
            onClick={() => handleViewDetails(item._id)}
            className={`w-full ${colors.button} text-white font-medium px-4 py-3 rounded-lg flex items-center justify-center gap-2 transition-colors hover:shadow-md`}
          >
            <FaEye />
            {type === 'News' ? 'Read More' : 'View Details'}
            <FaArrowRight className="text-sm" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default UniversalCard;

// Color schemes
const upcomingColorScheme = {
  primary: 'bg-blue-600',
  secondary: 'bg-blue-50',
  accent: 'text-blue-600',
  border: 'border-blue-200',
  cardBg: 'bg-blue-50',
  badgeBg: 'bg-blue-200',
  badgeText: 'text-blue-800',
  badgeBorder: 'border-blue-300',
  iconBg: 'bg-blue-100',
  iconColor: 'text-blue-600',
  borderTop: 'border-blue-200',
  button: 'bg-blue-600 hover:bg-blue-700',
  hoverText: 'text-blue-700',
  icon: '📅'
};

const newsColorScheme = {
  primary: 'bg-cyan-600',
  secondary: 'bg-cyan-50',
  accent: 'text-cyan-600',
  border: 'border-cyan-200',
  cardBg: 'bg-cyan-50',
  badgeBg: 'bg-cyan-200',
  badgeText: 'text-cyan-800',
  badgeBorder: 'border-cyan-300',
  iconBg: 'bg-cyan-100',
  iconColor: 'text-cyan-600',
  borderTop: 'border-cyan-200',
  button: 'bg-cyan-600 hover:bg-cyan-700',
  hoverText: 'text-cyan-700',
  icon: '📰'
};