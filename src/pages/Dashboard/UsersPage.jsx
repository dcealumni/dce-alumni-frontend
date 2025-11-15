import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaEnvelope, FaPhone, FaUserShield, FaTrash, FaSearch } from 'react-icons/fa';
import Swal from 'sweetalert2';

const UsersPage = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage] = useState(6);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get(`${import.meta.env.VITE_API_URL}users`);
        // Filter only users with role 'user' (not admins)
        const regularUsers = response.data.filter(user => user.role === 'user');
        setUsers(regularUsers);
        setFilteredUsers(regularUsers);
        setError(null);
      } catch (err) {
        setError('Failed to fetch users. Please try again later.');
        console.error('Error fetching users:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // Search functionality
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredUsers(users);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = users.filter(
      user => 
        user.name?.toLowerCase().includes(query) || 
        user.email?.toLowerCase().includes(query)
    );
    
    setFilteredUsers(filtered);
  }, [searchQuery, users]);

  const handleMakeAdmin = async (userId) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'This will change the user role to admin!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, make admin!'
    });

    if (result.isConfirmed) {
      try {
        // Update the user role to 'admin'
        const response = await axios.patch(`${import.meta.env.VITE_API_URL}users/${userId}`, { role: 'admin' });
        
        if (response.data.success) {
          // Remove from users list in UI
          const updatedUsers = users.filter(user => (user._id?.$oid || user._id || user.id) !== userId);
          setUsers(updatedUsers);
          setFilteredUsers(updatedUsers.filter(
            user => 
              !searchQuery.trim() || 
              user.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
              user.email?.toLowerCase().includes(searchQuery.toLowerCase())
          ));
          
          Swal.fire({
            title: 'Success!',
            text: response.data.message || 'User promoted to admin successfully!',
            icon: 'success',
            confirmButtonColor: '#3085d6'
          });
        } else {
          Swal.fire({
            title: 'Error!',
            text: response.data.message || 'Failed to make user admin',
            icon: 'error',
            confirmButtonColor: '#d33'
          });
        }
      } catch (err) {
        console.error('Error making user admin:', err);
        
        let errorMessage = 'Failed to make user admin. Please try again.';
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

  const handleDeleteUser = async (userId) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'This user will be permanently deleted!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete user!'
    });

    if (result.isConfirmed) {
      try {
        const response = await axios.delete(`https://dce-server.vercel.app/users/${userId}`);
        
        if (response.data.success) {
          // Remove from users list in UI
          const updatedUsers = users.filter(user => (user._id?.$oid || user._id || user.id) !== userId);
          setUsers(updatedUsers);
          setFilteredUsers(updatedUsers.filter(
            user => 
              !searchQuery.trim() || 
              user.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
              user.email?.toLowerCase().includes(searchQuery.toLowerCase())
          ));
          
          Swal.fire({
            title: 'Deleted!',
            text: response.data.message || 'User deleted successfully!',
            icon: 'success',
            confirmButtonColor: '#3085d6'
          });
        } else {
          Swal.fire({
            title: 'Error!',
            text: response.data.message || 'Failed to delete user',
            icon: 'error',
            confirmButtonColor: '#d33'
          });
        }
      } catch (err) {
        console.error('Error deleting user:', err);
        
        let errorMessage = 'Failed to delete user. Please try again.';
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

  // Pagination calculation
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  // Pagination handler
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
        <h1 className="text-2xl font-bold">Users Management</h1>
        
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
      
      {filteredUsers.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <p className="text-gray-600">
            {searchQuery ? "No users match your search query." : "No regular users found."}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact Information
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Join Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentUsers.map((user) => (
                  <tr key={user._id?.$oid || user._id || user.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-8 w-8">
                          {user.image ? (
                            <img className="h-8 w-8 rounded-full object-cover" src={user.image} alt={user.name} />
                          ) : (
                            <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 font-bold text-sm">
                              {user.name?.charAt(0).toUpperCase() || 'U'}
                            </div>
                          )}
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900">{user.name}</div>
                          <div className="text-xs text-gray-500">{user.role}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex flex-col">
                        <div className="text-sm text-gray-900 flex items-center">
                          <FaEnvelope className="mr-2 text-gray-400" />
                          {user.email}
                        </div>
                        {user.phone && (
                          <div className="text-xs text-gray-500 flex items-center mt-0.5">
                            <FaPhone className="mr-2 text-gray-400" />
                            {user.phone}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {new Date(user.createdAt || Date.now()).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">
                      <div className="flex space-x-3">
                        <button 
                          onClick={() => handleMakeAdmin(user._id?.$oid || user._id || user.id)}
                          className="text-blue-600 hover:text-blue-900 flex items-center"
                          title="Make admin"
                        >
                          <FaUserShield className="mr-1" />
                          <span>Make Admin</span>
                        </button>
                        <button 
                          onClick={() => handleDeleteUser(user._id?.$oid || user._id || user.id)}
                          className="text-red-600 hover:text-red-900 flex items-center"
                          title="Delete user"
                        >
                          <FaTrash className="mr-1" />
                          <span>Delete</span>
                        </button>
                      </div>
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
                Showing <span className="font-medium">{indexOfFirstUser + 1}</span> to{' '}
                <span className="font-medium">{Math.min(indexOfLastUser, filteredUsers.length)}</span> of{' '}
                <span className="font-medium">{filteredUsers.length}</span> users
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

export default UsersPage;