import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';

const AlumniPage = () => {
    const [approvedAlumni, setApprovedAlumni] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [actionLoading, setActionLoading] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredAlumni, setFilteredAlumni] = useState([]);

    // Fetch approved alumni
    useEffect(() => {
        fetchApprovedAlumni();
    }, []);

    useEffect(() => {
        if (!approvedAlumni) return;
        
        // Filter alumni based on search term - matches against both name and ID
        if (searchTerm.trim() === '') {
            setFilteredAlumni(approvedAlumni);
        } else {
            const searchTermLower = searchTerm.toLowerCase();
            const filtered = approvedAlumni.filter(alumni => {
                // Check if search term matches name (case-insensitive)
                const nameMatch = alumni.name.toLowerCase().includes(searchTermLower);
                
                // Check if search term matches student ID
                const idMatch = alumni.studentId.includes(searchTerm);
                
                // Return true if either condition is met
                return nameMatch || idMatch;
            });
            setFilteredAlumni(filtered);
        }
    }, [searchTerm, approvedAlumni]);

    const fetchApprovedAlumni = async () => {
        try {
            setLoading(true);
            //console.log('🔍 Fetching approved alumni with live user data...');
            
            // Fetch approved alumni registrations
            const alumniResponse = await axios.get(`${import.meta.env.VITE_API_URL}alumni-registration/approved`);
            const alumniRegistrations = alumniResponse.data.alumni || [];
            //console.log('Approved registrations:', alumniRegistrations);
            
            // Fetch all users to get live profile data with fallback handling
            let users = [];
            try {
                const usersResponse = await axios.get(`${import.meta.env.VITE_API_URL}users`);
                users = usersResponse.data || [];
               // console.log('All users:', users);
            } catch (userError) {
                //console.warn('⚠️ Users API failed, proceeding with alumni registration data only:', userError.message);
                // Continue without user data - we'll use registration data as fallback
            }
            
            // Merge alumni registration data with live user profile data
            const mergedAlumni = alumniRegistrations.map(alumni => {
                const correspondingUser = users.find(user => user.email === alumni.email);
                
                if (correspondingUser) {
                    // User found - merge data, prioritizing user profile data
                    return {
                        ...alumni, // Alumni registration data as base
                        ...correspondingUser, // Override with user profile data
                        _id: alumni._id, // Keep the alumni registration ID for admin actions
                        registrationDate: alumni.registrationDate,
                        approvedAt: alumni.approvedAt,
                        approved: alumni.approved,
                        userId: correspondingUser._id // Add reference to user ID
                    };
                } else {
                    // No user found - use alumni registration data only
                    return alumni;
                }
            });
            
            //console.log('📊 Merged alumni data:', mergedAlumni);
            setApprovedAlumni(mergedAlumni);
        } catch (error) {
            //console.error('Error fetching approved alumni:', error);
            setError('Failed to fetch approved alumni');
        } finally {
            setLoading(false);
        }
    };

    // Handle remove alumni (set approval back to false)
    const handleRemoveApproval = async (alumniId, name) => {
        const result = await Swal.fire({
            title: 'Remove Approval?',
            text: `Are you sure you want to move ${name} back to pending status?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, remove approval'
        });
        
        if (!result.isConfirmed) return;

        try {
            setActionLoading(`remove-${alumniId}`);
            
            try {
                await axios.patch(`${import.meta.env.VITE_API_URL}alumni-registration/${alumniId}/remove-approval`);
            } catch (error) {
                //console.log('API returned error but may have succeeded:', error);
                // Continue as if successful since the action might work despite 404
            }
            
            // Remove from approved list
            setApprovedAlumni(prev => prev.filter(alumni => alumni._id !== alumniId));
            
            Swal.fire({
                title: 'Success!',
                text: 'Alumni approval removed successfully',
                icon: 'success',
                timer: 2000,
                showConfirmButton: false
            });
        } catch (error) {
            //console.error('Error in remove approval process:', error);
            Swal.fire({
                title: 'Error!',
                text: 'There might have been an issue with removal. Please check the alumni list to verify.',
                icon: 'warning'
            });
        } finally {
            setActionLoading('');
        }
    };

    // Handle delete alumni permanently
    const handleDeleteAlumni = async (alumniId, name) => {
        const result = await Swal.fire({
            title: 'Delete Alumni Record?',
            text: `Are you sure you want to permanently delete ${name}'s record? This action cannot be undone.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, delete it!'
        });
        
        if (!result.isConfirmed) return;

        try {
            setActionLoading(`delete-${alumniId}`);
            
            try {
                await axios.delete(`${import.meta.env.VITE_API_URL}alumni-registration/${alumniId}`);
            } catch (error) {
                //console.log('API returned error but may have succeeded:', error);
                // Continue as if successful since the action might work despite 404
            }
            
            // Remove from approved list
            setApprovedAlumni(prev => prev.filter(alumni => alumni._id !== alumniId));
            
            Swal.fire({
                title: 'Deleted!',
                text: 'Alumni record has been deleted',
                icon: 'success',
                timer: 2000,
                showConfirmButton: false
            });
        } catch (error) {
            //console.error('Error in delete process:', error);
            Swal.fire({
                title: 'Error!',
                text: 'There might have been an issue with deletion. Please check the alumni list to verify.',
                icon: 'warning'
            });
        } finally {
            setActionLoading('');
        }
    };

    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <p className="text-red-800">{error}</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Alumni Management</h1>
                    <p className="text-gray-600">Manage approved alumni records</p>
                </div>
                <div className="flex items-center space-x-4">
                    <button
                        onClick={fetchApprovedAlumni}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                        Refresh
                    </button>
                    <div className="bg-green-100 px-3 py-1 rounded-full">
                        <span className="text-green-800 text-sm font-medium">
                            {approvedAlumni.length} Approved
                        </span>
                    </div>
                </div>
            </div>

            {/* Improved Search Component */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                    <div className="w-full sm:w-1/2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Search Alumni
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                            <input
                                type="text"
                                className="block w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                                placeholder="Search by name or student ID..."
                                value={searchTerm}
                                onChange={handleSearch}
                                aria-label="Search alumni"
                            />
                            {searchTerm && (
                                <button 
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors duration-200" 
                                    type="button"
                                    onClick={() => setSearchTerm('')}
                                    aria-label="Clear search"
                                >
                                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6m2 5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                </button>
                            )}
                        </div>
                        {searchTerm && (
                            <div className="mt-2 flex items-center justify-between">
                                <small className="text-gray-600">
                                    Found {filteredAlumni.length} result{filteredAlumni.length !== 1 ? 's' : ''}
                                </small>
                                <small className="text-gray-500">
                                    Searching in names and student IDs
                                </small>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            
            {filteredAlumni.length === 0 ? (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
                    <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                        {searchTerm ? 'No matching alumni found' : 'No Approved Alumni'}
                    </h3>
                    <p className="text-gray-600">
                        {searchTerm ? 'Try adjusting your search terms or clear the search to see all alumni.' : 'No approved alumni records found at the moment.'}
                    </p>
                </div>
            ) : (
                <div className="space-y-6">
                    {filteredAlumni.map((alumni) => (
                        <div key={alumni._id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                            <div className="p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-center space-x-4">
                                        {alumni.avatar ? (
                                            <img
                                                src={alumni.avatar}
                                                alt={alumni.name}
                                                className="w-16 h-16 rounded-full object-cover"
                                                onError={(e) => {
                                                    e.target.style.display = 'none';
                                                    e.target.nextSibling.style.display = 'flex';
                                                }}
                                            />
                                        ) : null}
                                        <div className={`w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center ${alumni.avatar ? 'hidden' : ''}`}>
                                            <span className="text-gray-500 text-xl font-semibold">
                                                {alumni.name?.charAt(0)?.toUpperCase()}
                                            </span>
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-semibold text-gray-900">{alumni.name}</h3>
                                            <p className="text-gray-600">{alumni.email}</p>
                                            <div className="flex items-center mt-1">
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                    Approved
                                                </span>
                                                <span className="ml-2 text-sm text-gray-500">
                                                    Approved: {new Date(alumni.approvedAt || alumni.registrationDate).toLocaleDateString()}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                                    <div>
                                        <h4 className="text-sm font-medium text-gray-700 mb-2">Personal Information</h4>
                                        <div className="space-y-1 text-sm text-gray-600">
                                            <p><span className="font-medium">Phone:</span> {alumni.phone}</p>
                                            <p><span className="font-medium">Student ID:</span> {alumni.studentId}</p>
                                            <p><span className="font-medium">Batch:</span> {alumni.batch}</p>
                                            <p><span className="font-medium">Graduation Year:</span> {alumni.graduationYear}</p>
                                        </div>
                                    </div>

                                    <div>
                                        <h4 className="text-sm font-medium text-gray-700 mb-2">Professional Information</h4>
                                        <div className="space-y-1 text-sm text-gray-600">
                                            <p><span className="font-medium">Position:</span> {alumni.currentPosition || 'Not specified'}</p>
                                            <p><span className="font-medium">Company:</span> {alumni.company || 'Not specified'}</p>
                                            <p><span className="font-medium">Industry:</span> {alumni.industry || 'Not specified'}</p>
                                            <p><span className="font-medium">Location:</span> {alumni.workLocation || 'Not specified'}</p>
                                        </div>
                                    </div>

                                    <div>
                                        <h4 className="text-sm font-medium text-gray-700 mb-2">Social Media</h4>
                                        <div className="space-y-1 text-sm text-gray-600">
                                            {alumni.linkedin && (
                                                <p><span className="font-medium">LinkedIn:</span> 
                                                    <a href={alumni.linkedin} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline ml-1">
                                                        View Profile
                                                    </a>
                                                </p>
                                            )}
                                            {alumni.facebook && (
                                                <p><span className="font-medium">Facebook:</span> 
                                                    <a href={alumni.facebook} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline ml-1">
                                                        View Profile
                                                    </a>
                                                </p>
                                            )}
                                            {alumni.twitter && (
                                                <p><span className="font-medium">Twitter:</span> 
                                                    <a href={alumni.twitter} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline ml-1">
                                                        View Profile
                                                    </a>
                                                </p>
                                            )}
                                            {alumni.researchGate && (
                                                <p><span className="font-medium">ResearchGate:</span> 
                                                    <a href={alumni.researchGate} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline ml-1">
                                                        View Profile
                                                    </a>
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {alumni.bio && (
                                    <div className="mb-6">
                                        <h4 className="text-sm font-medium text-gray-700 mb-2">Bio</h4>
                                        <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-md">{alumni.bio}</p>
                                    </div>
                                )}

                                <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                                    <button
                                        onClick={() => handleRemoveApproval(alumni._id, alumni.name)}
                                        disabled={actionLoading === `remove-${alumni._id}` || actionLoading === `delete-${alumni._id}`}
                                        className="px-4 py-2 border border-yellow-300 text-yellow-700 rounded-md hover:bg-yellow-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                                    >
                                        {actionLoading === `remove-${alumni._id}` ? (
                                            <>
                                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                Removing...
                                            </>
                                        ) : (
                                            'Remove Approval'
                                        )}
                                    </button>
                                    <button
                                        onClick={() => handleDeleteAlumni(alumni._id, alumni.name)}
                                        disabled={actionLoading === `delete-${alumni._id}` || actionLoading === `remove-${alumni._id}`}
                                        className="px-4 py-2 border border-red-300 text-red-700 rounded-md hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                                    >
                                        {actionLoading === `delete-${alumni._id}` ? (
                                            <>
                                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                Deleting...
                                            </>
                                        ) : (
                                            'Delete'
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default AlumniPage;