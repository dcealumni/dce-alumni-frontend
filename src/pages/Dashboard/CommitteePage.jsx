import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { FaPlus, FaEdit, FaTrash, FaSearch, FaFilter, FaTimes } from 'react-icons/fa';
import Swal from 'sweetalert2';

const CommitteePage = () => {
    const [committees, setCommittees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [deletingId, setDeletingId] = useState(null);
    
    // Search and filter states
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedPosition, setSelectedPosition] = useState('');

    useEffect(() => {
        fetchCommittees();
    }, []);

    const fetchCommittees = async () => {
        try {
            setLoading(true);
            const response = await axios.get('https://dce-server.vercel.app/committees');
            
            // Handle the API response structure: {success: true, members: Array}
            let committeesData = [];
            if (response.data && Array.isArray(response.data.members)) {
                committeesData = response.data.members;
            } else if (Array.isArray(response.data)) {
                committeesData = response.data;
            } else if (response.data && Array.isArray(response.data.committees)) {
                committeesData = response.data.committees;
            } else if (response.data && Array.isArray(response.data.data)) {
                committeesData = response.data.data;
            } else {
                committeesData = [];
            }
            
            setCommittees(committeesData);
            setError(null);
        } catch (err) {
            setError('Failed to fetch committee members');
            setCommittees([]);
        } finally {
            setLoading(false);
        }
    };

    // Enhanced filtering with search and position only
    const filteredCommittees = committees.filter(committee => {
        const matchesSearch = 
            (committee.name && committee.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (committee.position && committee.position.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (committee.batch && committee.batch.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (committee.session && committee.session.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (committee.email && committee.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (committee.phone && committee.phone.includes(searchTerm));

        const matchesPosition = selectedPosition === '' || committee.position === selectedPosition;

        return matchesSearch && matchesPosition;
    });

    // Get unique values for filter dropdown
    const getUniquePositions = () => {
        const positions = [...new Set(committees.map(committee => committee.position).filter(Boolean))];
        return positions.sort();
    };

    const getUniqueSessions = () => {
        const sessions = [...new Set(committees.map(committee => committee.session).filter(Boolean))];
        return sessions.length;
    };

    // Clear all filters
    const clearFilters = () => {
        setSearchTerm('');
        setSelectedPosition('');
    };

    // Check if any filters are active
    const hasActiveFilters = searchTerm || selectedPosition;

    const handleDelete = async (id, name) => {
        // Use SweetAlert for delete confirmation
        Swal.fire({
            title: 'Are you sure?',
            text: `You are about to delete ${name || 'this committee member'}. This action cannot be undone!`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes, delete it!',
            cancelButtonText: 'Cancel'
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    setDeletingId(id);
                    await axios.delete(`https://dce-server.vercel.app/committees/${id}`);
                    
                    // Show success message
                    Swal.fire({
                        title: 'Deleted!',
                        text: 'Committee member has been deleted successfully.',
                        icon: 'success',
                        timer: 2000,
                        showConfirmButton: false
                    });
                    
                    // Update state to remove the deleted item
                    setCommittees(committees.filter(committee => committee._id !== id));
                } catch (err) {
                    Swal.fire({
                        title: 'Error!',
                        text: 'Failed to delete committee member.',
                        icon: 'error'
                    });
                    console.error('Delete error:', err);
                } finally {
                    setDeletingId(null);
                }
            }
        });
    };

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
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">Committee Management</h1>
                <Link 
                    to="/dashboard/committee/add" 
                    className="btn btn-primary"
                >
                    <FaPlus className="mr-2" />
                    Add Committee Member
                </Link>
            </div>

            {/* Summary Stats - Moved to Top */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="stat bg-white rounded-lg shadow">
                    <div className="stat-title">Total Members</div>
                    <div className="stat-value text-primary">{committees.length}</div>
                </div>
                <div className="stat bg-white rounded-lg shadow">
                    <div className="stat-title">Filtered Results</div>
                    <div className="stat-value text-secondary">{filteredCommittees.length}</div>
                </div>
                <div className="stat bg-white rounded-lg shadow">
                    <div className="stat-title">Positions</div>
                    <div className="stat-value text-accent">{getUniquePositions().length}</div>
                </div>
                <div className="stat bg-white rounded-lg shadow">
                    <div className="stat-title">Sessions</div>
                    <div className="stat-value text-warning">{getUniqueSessions()}</div>
                </div>
            </div>

            {/* Simplified Search and Filter Section - Only Position Filter */}
            <div className="bg-white rounded-lg shadow p-6">
                <div className="space-y-4">
                    {/* Search Bar and Position Filter */}
                    <div className="grid gap-4 md:grid-cols-3">
                        {/* Search Bar */}
                        <div className="md:col-span-2">
                            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
                                <FaSearch className="inline mr-2" />
                                Search Committee Members
                            </label>
                            <div className="relative">
                                <input
                                    type="text"
                                    id="search"
                                    className="input input-bordered w-full pl-10"
                                    placeholder="Search by name, position, batch, session, email, or phone..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <FaSearch className="h-4 w-4 text-gray-400" />
                                </div>
                                {searchTerm && (
                                    <button
                                        onClick={() => setSearchTerm('')}
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                    >
                                        <FaTimes className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Position Filter Only */}
                        <div>
                            <label htmlFor="position-filter" className="block text-sm font-medium text-gray-700 mb-2">
                                <FaFilter className="inline mr-2" />
                                Filter by Position
                            </label>
                            <select
                                id="position-filter"
                                value={selectedPosition}
                                onChange={(e) => setSelectedPosition(e.target.value)}
                                className="select select-bordered w-full"
                            >
                                <option value="">All Positions</option>
                                {getUniquePositions().map((position) => (
                                    <option key={position} value={position}>
                                        {position}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Clear Filters Button */}
                    {hasActiveFilters && (
                        <div className="flex justify-end">
                            <button
                                onClick={clearFilters}
                                className="btn btn-outline btn-warning"
                            >
                                <FaTimes className="mr-2" />
                                Clear Filters
                            </button>
                        </div>
                    )}

                    {/* Active Filters Display */}
                    {hasActiveFilters && (
                        <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-200">
                            <span className="text-sm text-gray-500 font-medium">Active filters:</span>
                            {searchTerm && (
                                <span className="inline-flex items-center px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded-full">
                                    Search: "{searchTerm}"
                                    <button
                                        onClick={() => setSearchTerm('')}
                                        className="ml-2 text-blue-600 hover:text-blue-800"
                                    >
                                        <FaTimes className="h-3 w-3" />
                                    </button>
                                </span>
                            )}
                            {selectedPosition && (
                                <span className="inline-flex items-center px-3 py-1 text-sm bg-green-100 text-green-800 rounded-full">
                                    Position: {selectedPosition}
                                    <button
                                        onClick={() => setSelectedPosition('')}
                                        className="ml-2 text-green-600 hover:text-green-800"
                                    >
                                        <FaTimes className="h-3 w-3" />
                                    </button>
                                </span>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Error Display */}
            {error && (
                <div className="alert alert-error">
                    <span>{error}</span>
                </div>
            )}

            {/* Committee Members Table */}
            <div className="bg-white rounded-lg shadow">
                <div className="overflow-x-auto">
                    <table className="table w-full">
                        <thead>
                            <tr>
                                <th>Image</th>
                                <th>Name</th>
                                <th>Position</th>
                                <th>Batch</th>
                                <th>Session</th>
                                <th>Email</th>
                                <th>Phone</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {!Array.isArray(filteredCommittees) || filteredCommittees.length === 0 ? (
                                <tr>
                                    <td colSpan="8" className="text-center py-8">
                                        <div className="flex flex-col items-center space-y-2">
                                            <FaSearch className="h-8 w-8 text-gray-400" />
                                            <div className="text-gray-500">
                                                {hasActiveFilters 
                                                    ? 'No committee members match your search criteria'
                                                    : 'No committee members found'
                                                }
                                            </div>
                                            {hasActiveFilters && (
                                                <button
                                                    onClick={clearFilters}
                                                    className="btn btn-sm btn-outline btn-primary"
                                                >
                                                    Clear All Filters
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredCommittees.map((committee) => (
                                    <tr key={committee._id}>
                                        <td>
                                            <div className="avatar">
                                                <div className="mask mask-squircle w-12 h-12">
                                                    <img 
                                                        src={committee.image || '/placeholder-avatar.png'} 
                                                        alt={committee.name || 'Committee Member'}
                                                        onError={(e) => {
                                                            e.target.src = '/placeholder-avatar.png';
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="font-bold">{committee.name || 'N/A'}</div>
                                        </td>
                                        <td>
                                            <span className="badge badge-outline badge-primary">
                                                {committee.position || 'N/A'}
                                            </span>
                                        </td>
                                        <td>
                                            <span className="badge badge-outline badge-secondary">
                                                {committee.batch || 'N/A'}
                                            </span>
                                        </td>
                                        <td>
                                            <span className="badge badge-outline badge-accent">
                                                {committee.session || 'N/A'}
                                            </span>
                                        </td>
                                        <td>
                                            <span className="text-sm text-gray-600">
                                                {committee.email || 'N/A'}
                                            </span>
                                        </td>
                                        <td>
                                            <span className="text-sm text-gray-600">
                                                {committee.phone || 'N/A'}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="flex space-x-2">
                                                <Link 
                                                    to={`/dashboard/committee/edit/${committee._id}`}
                                                    className="btn btn-sm btn-outline btn-primary"
                                                    title="Edit"
                                                >
                                                    <FaEdit />
                                                </Link>
                                                <button 
                                                    onClick={() => handleDelete(committee._id, committee.name)}
                                                    className="btn btn-sm btn-outline btn-error"
                                                    disabled={deletingId === committee._id}
                                                    title="Delete"
                                                >
                                                    {deletingId === committee._id ? (
                                                        <span className="loading loading-spinner loading-xs"></span>
                                                    ) : (
                                                        <FaTrash />
                                                    )}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default CommitteePage;