import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Committee = () => {
    const [committeeData, setCommitteeData] = useState({});
    const [activeYear, setActiveYear] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [committeeTerms, setCommitteeTerms] = useState([]);

    useEffect(() => {
        const fetchCommitteeData = async () => {
            try {
                setLoading(true);
                const response = await axios.get('https://dce-server.vercel.app/committees');
                
                console.log("API Response:", response.data);
                
                const committeesData = response.data.members || [];
                const organizedData = {};
                
                committeesData.forEach(member => {
                    const session = member.session || 'Unassigned';
                    if (!organizedData[session]) {
                        organizedData[session] = [];
                    }
                    organizedData[session].push(member);
                });
                
                setCommitteeData(organizedData);
                
                const terms = Object.keys(organizedData).sort((a, b) => b.localeCompare(a));
                setCommitteeTerms(terms);
                
                if (terms.length > 0) {
                    setActiveYear(terms[0]);
                }
                
                setLoading(false);
            } catch (err) {
                console.error('Error fetching committee data:', err);
                setError('Failed to load committee data. Please try again later.');
                setLoading(false);
            }
        };
        
        fetchCommitteeData();
    }, []);

    const filteredMembers = (committeeData[activeYear] || []).filter(member =>
        member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (member.batch && member.batch.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (member.description && member.description.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const groupMembersByPosition = () => {
        const positionOrder = [
            'President', 
            'Vice President', 
            'General Secretary', 
            'Treasurer',
            'Joint Secretary',
            'Organizing Secretary',
            'Publication Secretary',
            'Office Secretary',
            'Executive Member'
        ];
        
        const positionGroups = {};
        filteredMembers.forEach(member => {
            const position = member.position || 'Other';
            if (!positionGroups[position]) {
                positionGroups[position] = [];
            }
            positionGroups[position].push(member);
        });
        
        const sortedPositions = Object.keys(positionGroups).sort((a, b) => {
            const indexA = positionOrder.indexOf(a);
            const indexB = positionOrder.indexOf(b);
            
            if (indexA >= 0 && indexB >= 0) {
                return indexA - indexB;
            }
            if (indexA >= 0) {
                return -1;
            }
            if (indexB >= 0) {
                return 1;
            }
            return a.localeCompare(b);
        });
        
        return { positionGroups, sortedPositions };
    };

    const { positionGroups, sortedPositions } = groupMembersByPosition();

    // Function to get color scheme based on position
    const getCardColors = (position) => {
        const colorSchemes = {
            'President': {
                card: 'bg-blue-50',
                border: 'border-blue-200',
                name: 'text-blue-700',
                position: 'text-blue-800'
            },
            'Vice President': {
                card: 'bg-indigo-50',
                border: 'border-indigo-200',
                name: 'text-indigo-700',
                position: 'text-indigo-800'
            },
            'General Secretary': {
                card: 'bg-cyan-50',
                border: 'border-cyan-200',
                name: 'text-cyan-700',
                position: 'text-cyan-800'
            },
            'Treasurer': {
                card: 'bg-green-50',
                border: 'border-green-200',
                name: 'text-green-700',
                position: 'text-green-800'
            },
            'Joint Secretary': {
                card: 'bg-teal-50',
                border: 'border-teal-200',
                name: 'text-teal-700',
                position: 'text-teal-800'
            },
            'Executive Member': {
                card: 'bg-sky-50',
                border: 'border-sky-200',
                name: 'text-sky-700',
                position: 'text-sky-800'
            }
        };
        
        return colorSchemes[position] || {
            card: 'bg-gray-50',
            border: 'border-gray-200',
            name: 'text-blue-600',
            position: 'text-gray-700'
        };
    };

    // Updated MemberCard with rounded image corners and better color organization
    const MemberCard = ({ member }) => {
        const colors = getCardColors(member.position);
        
        return (
            <div className={`${colors.card} rounded-lg shadow-sm hover:shadow-md transition-all duration-200 border ${colors.border}`}>
                {/* Image container - with slightly rounded corners */}
                <div className="flex justify-center p-5 pb-3">
                    <div className="w-32 h-32 overflow-hidden rounded-md shadow-sm border border-white">
                        <img
                            src={member.image || "https://via.placeholder.com/300x300?text=No+Image"}
                            alt={member.name}
                            className="w-full h-full object-cover"
                            onError={(e) => { e.target.src = "https://via.placeholder.com/300x300?text=No+Image" }}
                        />
                    </div>
                </div>
                
                {/* Text content - with better color organization */}
                <div className="px-5 pb-5 text-center">
                    <h3 className={`${colors.name} font-medium text-lg mb-1`}>
                        {member.name}
                    </h3>
                    
                    <p className={`${colors.position} font-medium`}>
                        {member.position}
                    </p>
                    
                    {/* Additional info if needed */}
                    {(member.batch || member.session || member.description) && (
                        <div className="mt-3 pt-3 text-sm text-gray-600 border-t border-gray-200">
                            <div className="flex flex-wrap justify-center gap-2 mb-1">
                                {member.batch && (
                                    <span className="bg-white px-2 py-0.5 rounded text-xs border border-gray-100 shadow-sm">
                                        Batch: {member.batch}
                                    </span>
                                )}
                                {member.session && (
                                    <span className="bg-white px-2 py-0.5 rounded text-xs border border-gray-100 shadow-sm">
                                        Session: {member.session}
                                    </span>
                                )}
                            </div>
                            
                            {member.description && (
                                <p className="mt-2 text-xs line-clamp-2 italic">{member.description}</p>
                            )}
                        </div>
                    )}
                    
                    {/* Contact buttons if available */}
                    {(member.email || member.phone) && (
                        <div className="mt-3 pt-3 flex justify-center space-x-3 border-t border-gray-200">
                            {member.email && (
                                <a 
                                    href={`mailto:${member.email}`} 
                                    className={`${colors.name} hover:opacity-80 transition-opacity`}
                                    title={member.email}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                </a>
                            )}
                            {member.phone && (
                                <a 
                                    href={`tel:${member.phone}`} 
                                    className={`${colors.name} hover:opacity-80 transition-opacity`}
                                    title={member.phone}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                    </svg>
                                </a>
                            )}
                        </div>
                    )}
                </div>
            </div>
        );
    };

    return (
        <div className='min-h-screen bg-gray-50'>
            {/* Hero Section */}
            <div className="bg-gradient-to-r from-blue-800 via-blue-700 to-blue-800 text-white py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h1 className="text-2xl md:text-4xl font-bold">Committee Members</h1>
                    <p className="text-sm md:text-base mt-2 max-w-3xl">Meet the dedicated leaders of the BUTEX DCE Alumni Association</p>
                </div>
            </div>

            {/* Loading State */}
            {loading && (
                <div className="flex items-center justify-center py-20">
                    <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
                    <span className="ml-3 text-gray-700">Loading...</span>
                </div>
            )}

            {/* Error State */}
            {error && (
                <div className="text-center py-10 max-w-lg mx-auto">
                    <svg className="h-12 w-12 mx-auto text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <h3 className="mt-3 text-lg font-medium text-gray-900">{error}</h3>
                    <button
                        onClick={() => window.location.reload()}
                        className="mt-3 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition-colors"
                    >
                        Try Again
                    </button>
                </div>
            )}

            {/* Committee Selection and Search */}
            {!loading && !error && committeeTerms.length > 0 && (
                <>
                    <div className="bg-white border-b shadow-sm">
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                            <div className="py-4 grid gap-4 md:grid-cols-3 md:gap-6 md:py-5 md:items-end">
                                {/* Committee Dropdown */}
                                <div>
                                    <label htmlFor="committee-select" className="block text-xs font-medium text-gray-700 mb-1">
                                        Select Committee Session
                                    </label>
                                    <select
                                        id="committee-select"
                                        value={activeYear}
                                        onChange={(e) => setActiveYear(e.target.value)}
                                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                    >
                                        {committeeTerms.map((term) => (
                                            <option key={term} value={term}>
                                                {term === 'Unassigned' ? 'Unassigned' : `${term} Committee`}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Search Bar */}
                                <div>
                                    <label htmlFor="search" className="block text-xs font-medium text-gray-700 mb-1">
                                        Search Members
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                            </svg>
                                        </div>
                                        <input
                                            type="text"
                                            id="search"
                                            className="block w-full pl-10 pr-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                            placeholder="Search members..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                        />
                                    </div>
                                </div>

                                {/* Results Counter */}
                                <div className="text-xs text-right text-gray-600 self-end">
                                    <span className="font-medium">{filteredMembers.length}</span> member{filteredMembers.length !== 1 ? 's' : ''} found
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Committee Members */}
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                        <div className="mb-6">
                            <h2 className="text-xl font-bold text-gray-800 mb-1">Committee Members {activeYear !== 'Unassigned' ? activeYear : ''}</h2>
                            <div className="h-1 w-20 bg-blue-600 rounded-full"></div>
                        </div>

                        {/* Members grouped by position */}
                        {filteredMembers.length > 0 ? (
                            <div className="space-y-8">
                                {sortedPositions.map(position => (
                                    <div key={position} className="space-y-3">
                                        <h3 className="text-lg font-semibold text-gray-700 border-b border-gray-200 pb-1">{position}</h3>
                                        
                                        {/* 4 items per row on large screens, 1 on mobile */}
                                        <div className="grid gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                                            {positionGroups[position].map((member) => (
                                                <MemberCard key={member._id} member={member} />
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8 bg-white rounded-lg shadow-sm">
                                <svg className="h-10 w-10 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                                <h3 className="mt-2 text-sm font-medium text-gray-900">No committee members found</h3>
                                <p className="mt-1 text-xs text-gray-500">Try adjusting your search or select a different committee session.</p>
                                <button
                                    onClick={() => setSearchTerm('')}
                                    className="mt-3 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 text-sm rounded transition-colors"
                                >
                                    Clear Search
                                </button>
                            </div>
                        )}
                    </div>
                </>
            )}

            {/* No Data Message */}
            {!loading && !error && committeeTerms.length === 0 && (
                <div className="text-center py-12 max-w-lg mx-auto">
                    <svg className="h-12 w-12 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                    </svg>
                    <h3 className="mt-3 text-lg font-medium text-gray-900">No committee data available</h3>
                    <p className="mt-1 text-sm text-gray-500">There are no committee members added to the system yet.</p>
                </div>
            )}
        </div>
    );
};

export default Committee;