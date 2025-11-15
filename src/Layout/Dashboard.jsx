import React, { useContext, useEffect, useState } from "react";
import { useNavigate, Link, Outlet, useLocation } from "react-router-dom";
import AuthContext from "../context/AuthContext";
import axios from "axios";
import { 
  FaHome, 
  FaUserShield, 
  FaUserGraduate, 
  FaUserPlus, 
  FaUsers,
  FaBars,
  FaTimes,
  FaUserTie,
  FaCalendarAlt
} from "react-icons/fa";

const Dashboard = () => {
  const { user, loading } = useContext(AuthContext);
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  // Mobile sidebar state only
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Only redirect if authentication check is complete and user is not logged in
    if (!loading && !user) {
      navigate("/login", { replace: true });
      return;
    }

    // Fetch user data only if user exists and auth check is complete
    if (!loading && user?.email) {
      setIsLoading(true);
      axios
        .get(`https://dce-server.vercel.app/users/${user.email}`)
        .then((response) => {
          if (response.data) {
            setUserData(response.data);
          }
        })
        .catch((error) => {
          console.error("Error fetching user data:", error);
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [user, navigate, loading]);

  // Check if current path is active
  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  const menuItems = [
    { 
      path: "/dashboard", 
      name: "Dashboard Home", 
      icon: <FaHome className="mr-3 text-lg" /> 
    },
    { 
      path: "/dashboard/admins", 
      name: "Admins", 
      icon: <FaUserShield className="mr-3 text-lg" /> 
    },
    { 
      path: "/dashboard/alumni", 
      name: "Alumni", 
      icon: <FaUserGraduate className="mr-3 text-lg" /> 
    },
    { 
      path: "/dashboard/alumni-requests", 
      name: "Alumni Requests", 
      icon: <FaUserPlus className="mr-3 text-lg" /> 
    },
    { 
      path: "/dashboard/users", 
      name: "Users", 
      icon: <FaUsers className="mr-3 text-lg" /> 
    },
    { 
      path: "/dashboard/committee", 
      name: "Committee", 
      icon: <FaUserTie className="mr-3 text-lg" /> 
    },
    { 
      path: "/dashboard/events", 
      name: "News & Events", 
      icon: <FaCalendarAlt className="mr-3 text-lg" /> 
    },
  ];

  // Show loading indicator while authentication status is being checked
  if (loading || (user && isLoading)) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <span className="loading loading-ring loading-lg text-blue-600"></span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Dashboard Layout */}
      <div className="flex h-screen overflow-hidden">
        {/* Sidebar - Desktop (always visible) */}
        <div className="bg-white shadow-lg w-64 hidden md:block">
          <div className="h-full flex flex-col">
            {/* Sidebar Header */}
            <div className="flex items-center h-16 px-4 border-b">
              <Link to="/" className="text-xl font-bold text-blue-600">DCE Alumni</Link>
            </div>
            
            {/* Nav Links */}
            <nav className="flex-1 pt-4 px-2 overflow-y-auto">
              <ul className="space-y-1">
                {menuItems.map((item, index) => (
                  <li key={index}>
                    <Link
                      to={item.path}
                      className={`flex items-center px-4 py-3 transition-colors duration-200 rounded-md ${
                        isActive(item.path)
                          ? "bg-blue-50 text-blue-600"
                          : "text-gray-600 hover:bg-gray-100"
                      }`}
                    >
                      {item.icon}
                      <span>{item.name}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </div>
        
        {/* Mobile Sidebar Overlay */}
        <div 
          className={`fixed inset-0 z-20 bg-black bg-opacity-50 transition-opacity md:hidden ${
            mobileSidebarOpen ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
          onClick={() => setMobileSidebarOpen(false)}
        ></div>
        
        {/* Mobile Sidebar */}
        <div 
          className={`fixed inset-y-0 left-0 z-30 w-64 bg-white shadow-lg transform transition-transform md:hidden ${
            mobileSidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="h-full flex flex-col">
            {/* Sidebar Header */}
            <div className="flex items-center justify-between h-16 px-4 border-b">
              <h2 className="text-xl font-bold text-blue-600">DCE Alumni</h2>
              <button 
                onClick={() => setMobileSidebarOpen(false)}
                className="p-2 rounded-md bg-gray-100 text-gray-600 hover:bg-gray-200"
              >
                <FaTimes />
              </button>
            </div>
            
            {/* Nav Links */}
            <nav className="flex-1 pt-4 px-2 overflow-y-auto">
              <ul className="space-y-1">
                {menuItems.map((item, index) => (
                  <li key={index}>
                    <Link
                      to={item.path}
                      onClick={() => setMobileSidebarOpen(false)}
                      className={`flex items-center px-4 py-3 transition-colors duration-200 rounded-md ${
                        isActive(item.path)
                          ? "bg-blue-50 text-blue-600"
                          : "text-gray-600 hover:bg-gray-100"
                      }`}
                    >
                      {item.icon}
                      <span>{item.name}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </div>
        
        {/* Main Content Area */}
        <div className="flex-1 overflow-auto">
          {/* Top Bar */}
          <header className="bg-white shadow-sm h-16 flex items-center justify-between px-6">
            <div className="flex items-center">
              <button
                className="mr-4 text-gray-600 md:hidden"
                onClick={() => setMobileSidebarOpen(true)}
              >
                <FaBars size={24} />
              </button>
              <h1 className="text-xl font-semibold text-gray-800">
                {location.pathname === "/dashboard" && "Dashboard"}
                {location.pathname === "/dashboard/admins" && "Admins Management"}
                {location.pathname === "/dashboard/alumni" && "Alumni Management"}
                {location.pathname === "/dashboard/alumni-requests" && "Alumni Requests"}
                {location.pathname === "/dashboard/users" && "Users Management"}
                {location.pathname === "/dashboard/committee" && "Committee Management"}
                {location.pathname === "/dashboard/events" && "News & Events Management"}
              </h1>
            </div>
            
            {/* User Info in topbar */}
            <div className="flex items-center space-x-3">
              <div className="text-right">
                <div className="text-sm font-semibold">{userData?.name || "Tuhin Al Mamun"}</div>
                <div className="text-xs text-gray-500">{userData?.role || "User"}</div>
              </div>
              {userData?.image ? (
                <img
                  src={userData.image}
                  alt={userData.name || "User"}
                  className="w-8 h-8 rounded-full object-cover"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm">
                  {(userData?.name?.charAt(0) || "T").toUpperCase()}
                </div>
              )}
            </div>
          </header>
          
          {/* Content Area */}
          <div className="p-6">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;