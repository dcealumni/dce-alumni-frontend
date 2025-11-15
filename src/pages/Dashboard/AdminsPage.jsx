import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaEnvelope, FaPhone, FaTrash, FaEdit, FaSearch } from 'react-icons/fa';
import Swal from 'sweetalert2';

const AdminsPage = () => {
  // Add pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [adminsPerPage] = useState(6);
  
  const [admins, setAdmins] = useState([]);
  const [filteredAdmins, setFilteredAdmins] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchAdmins = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get('https://dce-server.vercel.app/users');
        // Filter only users with admin role
        const adminUsers = response.data.filter(user => user.role === 'admin');
        setAdmins(adminUsers);
        setFilteredAdmins(adminUsers);
        setError(null);
      } catch (err) {
        setError('Failed to fetch admin users. Please try again later.');
        console.error('Error fetching admins:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAdmins();
  }, []);

  // Search functionality
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredAdmins(admins);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = admins.filter(
      admin => 
        admin.name?.toLowerCase().includes(query) || 
        admin.email?.toLowerCase().includes(query)
    );
    
    setFilteredAdmins(filtered);
  }, [searchQuery, admins]);

  const handleRemoveAdmin = async (adminId) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'This will change the admin role to user!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, remove admin!'
    });

    if (result.isConfirmed) {
      try {
        // Update the user role to 'user' instead of deleting
        const response = await axios.patch(`https://dce-server.vercel.app/users/${adminId}`, { role: 'user' });
        
        if (response.data.success) {
          // Remove from admins list in UI
          const updatedAdmins = admins.filter(admin => (admin._id?.$oid || admin._id || admin.id) !== adminId);
          setAdmins(updatedAdmins);
          setFilteredAdmins(updatedAdmins.filter(
            admin => 
              !searchQuery.trim() || 
              admin.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
              admin.email?.toLowerCase().includes(searchQuery.toLowerCase())
          ));
          
          Swal.fire({
            title: 'Success!',
            text: response.data.message || 'Admin role updated successfully!',
            icon: 'success',
            confirmButtonColor: '#3085d6'
          });
        } else {
          Swal.fire({
            title: 'Error!',
            text: response.data.message || 'Failed to remove admin',
            icon: 'error',
            confirmButtonColor: '#d33'
          });
        }
      } catch (err) {
        console.error('Error removing admin:', err);
        
        let errorMessage = 'Failed to remove admin. Please try again.';
        if (err.response && err.response.data && err.response.data.message) {
          errorMessage = err.response.data.message;
        }
        
        Swal.fire({
          title: 'Error!',
          text: errorMessage,
          icon: 'error',
          confirmButtonColor: '#d33'
        });
      }
    }
  };

  // Add pagination calculations
  const indexOfLastAdmin = currentPage * adminsPerPage;
  const indexOfFirstAdmin = indexOfLastAdmin - adminsPerPage;
  const currentAdmins = filteredAdmins.slice(indexOfFirstAdmin, indexOfLastAdmin);
  const totalPages = Math.ceil(filteredAdmins.length / adminsPerPage);

  // Add pagination handler
  const handlePageChange = (pageNumber) => setCurrentPage(pageNumber);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded shadow-md">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold">Admins Management</h1>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          {/* Search Bar */}
          <div className="relative w-full sm:w-64 md:w-80">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <FaSearch className="w-4 h-4 text-gray-500" />
            </div>
            <input 
              type="text"
              className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 p-2.5 shadow-sm"
              placeholder="Search by name or email"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>
      
      {filteredAdmins.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <p className="text-gray-600">
            {searchQuery ? "No admins match your search query." : "No administrators found."}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Admin
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact Information
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentAdmins.map((admin) => (
                  <tr key={admin._id?.$oid || admin._id || admin.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-8 w-8">
                          {admin.image ? (
                            <img className="h-8 w-8 rounded-full object-cover" src={admin.image} alt={admin.name} />
                          ) : (
                            <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-sm">
                              {admin.name?.charAt(0).toUpperCase() || 'A'}
                            </div>
                          )}
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900">{admin.name}</div>
                          <div className="text-xs text-gray-500">
                            Joined: {new Date(admin.createdAt || Date.now()).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex flex-col">
                        <div className="text-sm text-gray-900 flex items-center">
                          <FaEnvelope className="mr-2 text-gray-400" />
                          <span className="truncate max-w-[200px]">{admin.email}</span>
                        </div>
                        {admin.phone && (
                          <div className="text-xs text-gray-500 flex items-center mt-0.5">
                            <FaPhone className="mr-2 text-gray-400" />
                            {admin.phone}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        Active
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">
                      <button 
                        onClick={() => handleRemoveAdmin(admin._id?.$oid || admin._id || admin.id)}
                        className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm font-medium"
                      >
                        Remove Admin
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          <div className="px-4 py-3 bg-gray-50 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Showing <span className="font-medium">{indexOfFirstAdmin + 1}</span> to{' '}
                <span className="font-medium">{Math.min(indexOfLastAdmin, filteredAdmins.length)}</span> of{' '}
                <span className="font-medium">{filteredAdmins.length}</span> administrators
                {searchQuery && admins.length !== filteredAdmins.length ? 
                  ` (filtered from ${admins.length} total)` : ""}
              </div>
              <div className="flex space-x-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((number) => (
                  <button
                    key={number}
                    onClick={() => handlePageChange(number)}
                    className={`px-3 py-1 text-sm rounded-md ${
                      currentPage === number
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {number}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminsPage;