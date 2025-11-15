import React, { useState, useContext, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import axios from 'axios';

const Alumni = () => {
    const { user } = useContext(AuthContext);

    // State for search and filters
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedPosition, setSelectedPosition] = useState('all');
    const [selectedBatch, setSelectedBatch] = useState('all');
    const [alumni, setAlumni] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedAlumni, setSelectedAlumni] = useState(null);
    const [showModal, setShowModal] = useState(false);

    // Fetch approved alumni from database
    useEffect(() => {
        fetchApprovedAlumni();
    }, []);

    const fetchApprovedAlumni = async () => {
        try {
            setLoading(true);
            console.log('🔍 Fetching alumni data using JOIN approach...');
            
            // Fetch approved alumni registrations
            const alumniRegistrationsResponse = await axios.get(`${import.meta.env.VITE_API_URL}alumni-registration/approved`);
            const approvedRegistrations = alumniRegistrationsResponse.data.alumni || [];
            console.log('Approved registrations:', approvedRegistrations);
            
            // Fetch all users with fallback handling
            let allUsers = [];
            try {
                const usersResponse = await axios.get(`${import.meta.env.VITE_API_URL}users`);
                allUsers = usersResponse.data || [];
                console.log('All users:', allUsers);
            } catch (userError) {
                console.warn('⚠️ Users API failed, proceeding with alumni registration data only:', userError.message);
                // Continue without user data - we'll use registration data as fallback
            }
            
            // Join the data: match alumni-registrations.userEmail with users.email
            const joinedAlumniData = [];
            
            approvedRegistrations.forEach(registration => {
                // Only process approved registrations
                if (registration.approval === true) {
                    // Find matching user by email
                    const matchingUser = allUsers.find(user => 
                        user.email === registration.userEmail || user.email === registration.email
                    );
                    
                    if (matchingUser) {
                        // Merge data from both collections, prioritizing user data for current info
                        const mergedData = {
                        _id: registration._id,
                        // Personal info from user collection (most up-to-date)
                        name: matchingUser.name || registration.name,
                        email: matchingUser.email,
                        phone: matchingUser.phone || registration.phone,
                        bio: matchingUser.bio || registration.bio,
                        
                        // Academic info (prefer user data if available, fallback to registration)
                        studentId: matchingUser.studentId || registration.studentId,
                        batch: matchingUser.batch || registration.batch,
                        graduationYear: matchingUser.graduationYear || registration.graduationYear,
                        department: matchingUser.department || registration.department,
                        university: matchingUser.university || registration.university,
                        
                        // Professional info (prefer user data)
                        currentPosition: matchingUser.currentPosition || registration.currentPosition,
                        company: matchingUser.company || registration.company,
                        industry: matchingUser.industry || registration.industry,
                        workLocation: matchingUser.workLocation || registration.workLocation,
                        location: matchingUser.location || registration.location,
                        
                        // Social media (prefer user data)
                        linkedin: matchingUser.linkedin || registration.linkedin,
                        facebook: matchingUser.facebook || registration.facebook,
                        twitter: matchingUser.twitter || registration.twitter,
                        researchGate: matchingUser.researchGate || registration.researchGate,
                        
                        // Avatar/Image (prefer user data)
                        avatar: matchingUser.image || registration.avatar || registration.image,
                        image: matchingUser.image || registration.avatar || registration.image,
                        
                        // Registration metadata
                        registrationDate: registration.registrationDate,
                        approvedAt: registration.approvedAt,
                        status: registration.status,
                        approval: registration.approval
                    };
                    
                        joinedAlumniData.push(mergedData);
                        console.log('✅ Merged alumni data:', mergedData.name, mergedData.email);
                    } else {
                        // No matching user found, use registration data only
                        const registrationOnlyData = {
                            _id: registration._id,
                            // Use registration data as-is
                            name: registration.name,
                            email: registration.email || registration.userEmail,
                            phone: registration.phone,
                            bio: registration.bio,
                            
                            // Academic info from registration
                            studentId: registration.studentId,
                            batch: registration.batch,
                            graduationYear: registration.graduationYear,
                            department: registration.department,
                            university: registration.university,
                            
                            // Professional info from registration
                            currentPosition: registration.currentPosition,
                            company: registration.company,
                            industry: registration.industry,
                            workLocation: registration.workLocation,
                            location: registration.location,
                            
                            // Social media from registration
                            linkedin: registration.linkedin,
                            facebook: registration.facebook,
                            twitter: registration.twitter,
                            researchGate: registration.researchGate,
                            
                            // Avatar/Image from registration
                            avatar: registration.avatar || registration.image,
                            image: registration.avatar || registration.image,
                            
                            // Registration metadata
                            registrationDate: registration.registrationDate,
                            approvedAt: registration.approvedAt,
                            status: registration.status,
                            approval: registration.approval
                        };
                        
                        joinedAlumniData.push(registrationOnlyData);
                        console.log('📋 Registration-only data:', registrationOnlyData.name, registrationOnlyData.email);
                    }
                }
            });
            
            console.log('📊 Final joined alumni data:', joinedAlumniData);
            setAlumni(joinedAlumniData);
            
            // Show notification if users API failed but we still have alumni data
            if (allUsers.length === 0 && joinedAlumniData.length > 0) {
                console.info('ℹ️ Showing alumni data from registrations only. Live user profiles may not be available.');
            }
            
        } catch (error) {
            console.error('Error fetching alumni data:', error);
            setError('Failed to fetch alumni data');
        } finally {
            setLoading(false);
        }
    };

    // Available batches for filter
    const batches = [...new Set(alumni.map(alumni => alumni.batch))].sort((a, b) => a - b);

    // Available positions for filter
    const positions = [...new Set(alumni.map(alumni => alumni.currentPosition).filter(Boolean))];

    // Filter alumni based on search term and filters
    const filteredAlumni = alumni.filter(alumni => {
        const matchesSearch = alumni.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            (alumni.currentPosition && alumni.currentPosition.toLowerCase().includes(searchTerm.toLowerCase())) ||
                            (alumni.company && alumni.company.toLowerCase().includes(searchTerm.toLowerCase()));
        
        const matchesPosition = selectedPosition === 'all' || alumni.currentPosition === selectedPosition;
        const matchesBatch = selectedBatch === 'all' || alumni.batch === selectedBatch;
        
        return matchesSearch && matchesPosition && matchesBatch;
    });

    // Handle card click to show modal
    const handleCardClick = (alumniData) => {
        setSelectedAlumni(alumniData);
        setShowModal(true);
    };

    // Close modal
    const closeModal = () => {
        setShowModal(false);
        setSelectedAlumni(null);
    };

    // Get social media links
    const getSocialLinks = (alumni) => {
        const links = [];
        if (alumni.linkedin) links.push({ type: 'linkedin', url: alumni.linkedin });
        if (alumni.facebook) links.push({ type: 'facebook', url: alumni.facebook });
        if (alumni.twitter) links.push({ type: 'twitter', url: alumni.twitter });
        if (alumni.researchGate) links.push({ type: 'researchgate', url: alumni.researchGate });
        return links;
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className='min-h-screen'>
            {/* Hero Section */}
            <div className="bg-gradient-to-r from-blue-900 to-indigo-800 text-white py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                        <div>
                            <h1 className="text-4xl font-bold mb-2">Alumni Directory</h1>
                            <p className="text-lg text-blue-100">Connect with BUTEX DCE graduates across the globe</p>
                            <p className="text-sm text-blue-200 mt-1">Showing live data from user profiles</p>
                        </div>
                        
                        <div className="mt-4 md:mt-0">
                           
                        </div>
                    </div>
                </div>
            </div>

            {/* Search and Filter Section */}
            <div className="bg-gray-50 border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    {/* Search Bar */}
                    <div className="relative mb-6">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                        <input
                            type="text"
                            placeholder="Search alumni by name, position, or company..."
                            className="pl-10 pr-4 py-2 border border-gray-300 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    
                    {/* Filter options */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        {/* Position Filter */}
                        <div>
                            <label htmlFor="position-filter" className="block text-sm font-medium text-gray-700 mb-1">Position</label>
                            <select
                                id="position-filter"
                                className="border border-gray-300 rounded-md py-2 pl-3 pr-10 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                value={selectedPosition}
                                onChange={(e) => setSelectedPosition(e.target.value)}
                            >
                                <option value="all">All Positions</option>
                                {positions.map(position => (
                                    <option key={position} value={position}>{position}</option>
                                ))}
                            </select>
                        </div>

                        {/* Batch Filter */}
                        <div>
                            <label htmlFor="batch-filter" className="block text-sm font-medium text-gray-700 mb-1">Batch</label>
                            <select
                                id="batch-filter"
                                className="border border-gray-300 rounded-md py-2 pl-3 pr-10 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                value={selectedBatch}
                                onChange={(e) => setSelectedBatch(e.target.value)}
                            >
                                <option value="all">All Batches</option>
                                {batches.map(batch => (
                                    <option key={batch} value={batch}>Batch {batch}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            {/* Alumni Directory */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {error ? (
                    <div className="text-center py-12">
                        <p className="text-red-500 text-lg">{error}</p>
                        <button 
                            onClick={fetchApprovedAlumni}
                            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                        >
                            Retry
                        </button>
                    </div>
                ) : filteredAlumni.length === 0 ? (
                    <div className="text-center py-12">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p className="text-gray-500 text-lg">No alumni found matching your search criteria</p>
                        <button 
                            className="mt-4 text-blue-600 hover:text-blue-800 font-medium"
                            onClick={() => {
                                setSearchTerm('');
                                setSelectedPosition('all');
                                setSelectedBatch('all');
                            }}
                        >
                            Clear filters
                        </button>
                    </div>
                ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredAlumni.map(alumni => (
                            <div 
                                key={alumni._id} 
                                className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
                                onClick={() => handleCardClick(alumni)}
                            >
                                <div className="p-5 flex flex-col md:flex-row md:items-center gap-4">
                                    <div className="flex-shrink-0">
                                        {alumni.avatar ? (
                                            <img 
                                                src={alumni.avatar} 
                                                alt={alumni.name}
                                                className="w-20 h-20 rounded-full object-cover border-2 border-blue-100"
                                                onError={(e) => {
                                                    e.target.style.display = 'none';
                                                    e.target.nextSibling.style.display = 'flex';
                                                }}
                                            />
                                        ) : null}
                                        <div className={`w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center border-2 border-blue-100 ${alumni.avatar ? 'hidden' : ''}`}>
                                            <span className="text-gray-500 text-xl font-semibold">
                                                {alumni.name?.charAt(0)?.toUpperCase()}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-lg font-bold text-gray-900">{alumni.name}</h3>
                                        {alumni.title && (
                                            <p className="text-xs text-gray-500 mb-1">{alumni.title}</p>
                                        )}
                                        <p className="text-sm text-blue-600 mb-1">Batch {alumni.batch}</p>
                                        <p className="text-sm text-gray-600 mb-1">
                                            {alumni.currentPosition || 'Position not specified'}
                                            {alumni.company && ` at ${alumni.company}`}
                                        </p>
                                        {(alumni.location || alumni.workLocation) && (
                                            <p className="text-xs text-gray-500 mb-2 flex items-center gap-1">
                                                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                                                </svg>
                                                {alumni.location || alumni.workLocation}
                                            </p>
                                        )}
                                        
                                        <div className="flex flex-wrap gap-3 mt-3">
                                            <a 
                                                href={`mailto:${alumni.email}`} 
                                                className="text-gray-500 hover:text-blue-600" 
                                                title="Email"
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                                </svg>
                                            </a>
                                            {alumni.phone && (
                                                <a 
                                                    href={`tel:${alumni.phone}`} 
                                                    className="text-gray-500 hover:text-blue-600" 
                                                    title="Phone"
                                                    onClick={(e) => e.stopPropagation()}
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                                    </svg>
                                                </a>
                                            )}
                                            {getSocialLinks(alumni).map((link, index) => (
                                                <a 
                                                    key={index}
                                                    href={link.url} 
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-gray-500 hover:text-blue-600" 
                                                    title={link.type}
                                                    onClick={(e) => e.stopPropagation()}
                                                >
                                                    {link.type === 'linkedin' && (
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                                                            <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                                                        </svg>
                                                    )}
                                                    {link.type === 'facebook' && (
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                                                            <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z"/>
                                                        </svg>
                                                    )}
                                                    {link.type === 'twitter' && (
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                                                            <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                                                        </svg>
                                                    )}
                                                    {link.type === 'researchgate' && (
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                                                            <path d="M19.586 0c-.818 0-1.508.19-2.073.565-.563.377-.996.974-1.298 1.794-.302.82-.453 1.797-.453 2.931 0 1.336.275 2.535.826 3.596.551 1.061 1.304 1.962 2.26 2.704l.402-.402c-.897-.693-1.584-1.461-2.062-2.304-.478-.843-.717-1.75-.717-2.72 0-1.148.128-2.113.385-2.893.256-.78.622-1.378 1.097-1.794.475-.416 1.024-.624 1.647-.624.623 0 1.172.208 1.647.624.475.416.841 1.014 1.097 1.794.256.78.385 1.745.385 2.893 0 .97-.239 1.877-.717 2.72-.478.843-1.165 1.611-2.062 2.304l.402.402c.956-.742 1.709-1.643 2.26-2.704.551-1.061.826-2.26.826-3.596 0-1.134-.151-2.111-.453-2.931-.302-.82-.735-1.417-1.298-1.794C21.094.19 20.404 0 19.586 0zM5.772 8.542c0 1.41.179 2.581.538 3.512.359.932.871 1.617 1.536 2.056.665.439 1.46.658 2.384.658.924 0 1.719-.219 2.384-.658.665-.439 1.177-1.124 1.536-2.056.359-.931.538-2.102.538-3.512 0-1.41-.179-2.581-.538-3.512-.359-.932-.871-1.617-1.536-2.056-.665-.439-1.46-.658-2.384-.658-.924 0-1.719.219-2.384.658-.665.439-1.177 1.124-1.536 2.056-.359.931-.538 2.102-.538 3.512zm2.686 0c0-.939.072-1.715.217-2.328.145-.613.353-1.061.624-1.344.271-.283.597-.424.978-.424.381 0 .707.141.978.424.271.283.479.731.624 1.344.145.613.217 1.389.217 2.328 0 .939-.072 1.715-.217 2.328-.145.613-.353 1.061-.624 1.344-.271.283-.597.424-.978.424-.381 0-.707-.141-.978-.424-.271-.283-.479-.731-.624-1.344-.145-.613-.217-1.389-.217-2.328z"/>
                                                        </svg>
                                                    )}
                                                </a>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                <div className="mt-8 flex flex-col items-center space-y-2">
                    <p className="text-sm text-gray-500">
                        Showing {filteredAlumni.length} of {alumni.length} approved alumni
                    </p>
                </div>
            </div>

            {/* Modal for full alumni information */}
            {showModal && selectedAlumni && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={closeModal}>
                    <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                        <div className="p-6">
                            {/* Header */}
                            <div className="flex justify-between items-start mb-6">
                                <div className="flex items-center space-x-4">
                                    {selectedAlumni.avatar ? (
                                        <img
                                            src={selectedAlumni.avatar}
                                            alt={selectedAlumni.name}
                                            className="w-20 h-20 rounded-full object-cover border-2 border-blue-100"
                                            onError={(e) => {
                                                e.target.style.display = 'none';
                                                e.target.nextSibling.style.display = 'flex';
                                            }}
                                        />
                                    ) : null}
                                    <div className={`w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center border-2 border-blue-100 ${selectedAlumni.avatar ? 'hidden' : ''}`}>
                                        <span className="text-gray-500 text-xl font-semibold">
                                            {selectedAlumni.name?.charAt(0)?.toUpperCase()}
                                        </span>
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-bold text-gray-900">{selectedAlumni.name}</h2>
                                        <p className="text-lg text-blue-600">Batch {selectedAlumni.batch}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={closeModal}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            {/* Content */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Personal Information */}
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Personal Information</h3>
                                    <div className="space-y-2 text-sm">
                                        <p><span className="font-medium text-gray-700">Email:</span> {selectedAlumni.email}</p>
                                        {selectedAlumni.phone && (
                                            <p><span className="font-medium text-gray-700">Phone:</span> {selectedAlumni.phone}</p>
                                        )}
                                        {selectedAlumni.title && (
                                            <p><span className="font-medium text-gray-700">Title:</span> {selectedAlumni.title}</p>
                                        )}
                                        {(selectedAlumni.location || selectedAlumni.workLocation) && (
                                            <p><span className="font-medium text-gray-700">Location:</span> {selectedAlumni.location || selectedAlumni.workLocation}</p>
                                        )}
                                        {selectedAlumni.studentId && (
                                            <p><span className="font-medium text-gray-700">Student ID:</span> {selectedAlumni.studentId}</p>
                                        )}
                                        {selectedAlumni.graduationYear && (
                                            <p><span className="font-medium text-gray-700">Graduation Year:</span> {selectedAlumni.graduationYear}</p>
                                        )}
                                        {selectedAlumni.department && (
                                            <p><span className="font-medium text-gray-700">Department:</span> {selectedAlumni.department}</p>
                                        )}
                                        {selectedAlumni.university && (
                                            <p><span className="font-medium text-gray-700">University:</span> {selectedAlumni.university}</p>
                                        )}
                                    </div>
                                </div>

                                {/* Professional Information */}
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Professional Information</h3>
                                    <div className="space-y-2 text-sm">
                                        {selectedAlumni.currentPosition && (
                                            <p><span className="font-medium text-gray-700">Position:</span> {selectedAlumni.currentPosition}</p>
                                        )}
                                        {selectedAlumni.company && (
                                            <p><span className="font-medium text-gray-700">Company:</span> {selectedAlumni.company}</p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Education */}
                            {selectedAlumni.education && selectedAlumni.education.length > 0 && (
                                <div className="mt-6">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Education</h3>
                                    <div className="space-y-3">
                                        {selectedAlumni.education.map((edu, index) => (
                                            <div key={index} className="bg-gray-50 p-3 rounded-md">
                                                <p className="font-medium text-gray-900">{edu.institution}</p>
                                                {edu.department && (
                                                    <p className="text-sm text-gray-600">{edu.department}</p>
                                                )}
                                                <p className="text-xs text-gray-500">
                                                    {edu.startDate} - {edu.currentlyStudying ? 'Present' : (edu.endDate || 'N/A')}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Work Experience */}
                            {selectedAlumni.workExperience && selectedAlumni.workExperience.length > 0 && (
                                <div className="mt-6">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Work Experience</h3>
                                    <div className="space-y-3">
                                        {selectedAlumni.workExperience.map((work, index) => (
                                            <div key={index} className="bg-gray-50 p-3 rounded-md">
                                                <p className="font-medium text-gray-900">{work.role}</p>
                                                <p className="text-sm text-gray-600">{work.organization}</p>
                                                <p className="text-xs text-gray-500">
                                                    {work.startDate} - {work.currentlyWorking ? 'Present' : (work.endDate || 'N/A')}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Bio */}
                            {selectedAlumni.bio && (
                                <div className="mt-6">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Bio</h3>
                                    <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-md">{selectedAlumni.bio}</p>
                                </div>
                            )}

                            {/* Social Media */}
                            {getSocialLinks(selectedAlumni).length > 0 && (
                                <div className="mt-6">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Social Media</h3>
                                    <div className="flex flex-wrap gap-4">
                                        {getSocialLinks(selectedAlumni).map((link, index) => (
                                            <a
                                                key={index}
                                                href={link.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700 hover:text-blue-600 transition-colors"
                                            >
                                                {link.type === 'linkedin' && (
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                                                        <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                                                    </svg>
                                                )}
                                                {link.type === 'facebook' && (
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                                                        <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z"/>
                                                    </svg>
                                                )}
                                                {link.type === 'twitter' && (
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                                                        <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                                                    </svg>
                                                )}
                                                {link.type === 'researchgate' && (
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                                                        <path d="M19.586 0c-.818 0-1.508.19-2.073.565-.563.377-.996.974-1.298 1.794-.302.82-.453 1.797-.453 2.931 0 1.336.275 2.535.826 3.596.551 1.061 1.304 1.962 2.26 2.704l.402-.402c-.897-.693-1.584-1.461-2.062-2.304-.478-.843-.717-1.75-.717-2.72 0-1.148.128-2.113.385-2.893.256-.78.622-1.378 1.097-1.794.475-.416 1.024-.624 1.647-.624.623 0 1.172.208 1.647.624.475.416.841 1.014 1.097 1.794.256.78.385 1.745.385 2.893 0 .97-.239 1.877-.717 2.72-.478.843-1.165 1.611-2.062 2.304l.402.402c.956-.742 1.709-1.643 2.26-2.704.551-1.061.826-2.26.826-3.596 0-1.134-.151-2.111-.453-2.931-.302-.82-.735-1.417-1.298-1.794C21.094.19 20.404 0 19.586 0zM5.772 8.542c0 1.41.179 2.581.538 3.512.359.932.871 1.617 1.536 2.056.665.439 1.46.658 2.384.658.924 0 1.719-.219 2.384-.658.665-.439 1.177-1.124 1.536-2.056.359-.931.538-2.102.538-3.512 0-1.41-.179-2.581-.538-3.512-.359-.932-.871-1.617-1.536-2.056-.665-.439-1.46-.658-2.384-.658-.924 0-1.719.219-2.384.658-.665.439-1.177 1.124-1.536 2.056-.359.931-.538 2.102-.538 3.512zm2.686 0c0-.939.072-1.715.217-2.328.145-.613.353-1.061.624-1.344.271-.283.597-.424.978-.424.381 0 .707.141.978.424.271.283.479.731.624 1.344.145.613.217 1.389.217 2.328 0 .939-.072 1.715-.217 2.328-.145.613-.353 1.061-.624 1.344-.271.283-.597.424-.978.424-.381 0-.707-.141-.978-.424-.271-.283-.479-.731-.624-1.344-.145-.613-.217-1.389-.217-2.328z"/>
                                                    </svg>
                                                )}
                                                <span className="capitalize">{link.type === 'researchgate' ? 'ResearchGate' : link.type}</span>
                                            </a>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Contact Actions */}
                            <div className="mt-6 pt-4 border-t border-gray-200 flex space-x-4">
                                <a
                                    href={`mailto:${selectedAlumni.email}`}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center space-x-2"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                    <span>Send Email</span>
                                </a>
                                {selectedAlumni.phone && (
                                    <a
                                        href={`tel:${selectedAlumni.phone}`}
                                        className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 flex items-center space-x-2"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                        </svg>
                                        <span>Call</span>
                                    </a>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Alumni;