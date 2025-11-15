import React, { useState, useEffect, useContext, useRef } from "react";
import { Link } from "react-router-dom";
import AuthContext from "../context/AuthContext";
import { FaUserCircle } from "react-icons/fa";
import axios from "axios";

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [userData, setUserData] = useState(null);
  const [isLoadingUserData, setIsLoadingUserData] = useState(false);
  const { user, logOut, loading } = useContext(AuthContext);
  const userMenuRef = useRef(null);

  // Track scroll position
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 100) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);

    // Cleanup
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setUserMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Fetch user data
  useEffect(() => {
    if (user?.email) {
      setIsLoadingUserData(true);
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
          setIsLoadingUserData(false);
        });
    }
  }, [user]);

  const handleLogout = () => {
    logOut()
      .then(() => {
        console.log("User signed out");
      })
      .catch((error) => {
        console.error("Error signing out:", error);
      });
  };

  // User Authentication Section - Displaying Login/Register or User Profile
  const renderAuthSection = () => {
    // If the auth context is still loading or user data is loading for logged-in user
    if (loading || (user && user.emailVerified && isLoadingUserData)) {
      return (
        <div className="flex items-center justify-center w-10 h-10">
          <span className="loading loading-ring loading-xl text-blue-600"></span>
        </div>
      );
    }

    // If user is logged in and email is verified
    if (user && user.emailVerified) {
      return (
        <div className="relative" ref={userMenuRef}>
          <button
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            className="flex items-center focus:outline-none"
          >
            <div className="relative">
              {/* Green active status indicator moved to bottom right and slightly up */}
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white rounded-full z-10"></div>

              {userData?.image ? (
                <img
                  src={userData.image}
                  alt={userData.name || "User"}
                  className="w-10 h-10 rounded-full border-2 border-blue-500 object-cover hover:border-blue-600 transition-colors"
                />
              ) : (
                <FaUserCircle className="text-3xl text-blue-600 hover:text-blue-800 transition-colors" />
              )}
            </div>
          </button>

          {/* User Menu Dropdown */}
          {userMenuOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-white rounded-md shadow-lg border border-gray-200 overflow-hidden animate-fadeIn">
              <div className="py-2">
                <div className="px-4 py-2 border-b border-gray-100">
                  <div className="flex items-center gap-2 mb-2">
                    {userData?.image ? (
                      <img
                        src={userData.image}
                        alt={userData.name || "User"}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <FaUserCircle className="text-3xl text-gray-400" />
                    )}
                    <div className="flex flex-col">
                      <span className="font-medium text-sm text-gray-800">
                        {userData?.name || "User"}
                      </span>
                      <span className="text-xs text-gray-500 truncate">
                        {user.email}
                      </span>
                    </div>
                  </div>
                </div>
                {/* Only show Dashboard link if user role is admin */}
                {userData?.role === "admin" && (
                  <Link
                    to="/dashboard"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600"
                    onClick={() => setUserMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                )}
                <Link
                  to="/profile"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600"
                  onClick={() => setUserMenuOpen(false)}
                >
                  Profile
                </Link>
                <button
                  onClick={() => {
                    handleLogout();
                    setUserMenuOpen(false);
                  }}
                  className="w-full text-left block px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                >
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      );
    }

    // If no user is logged in
    return (
      <>
        {/* Desktop Login/Register Buttons */}
        <div className="hidden md:flex items-center gap-4">
          <Link
            to="/register"
            className="text-gray-700 hover:text-blue-600 transition-colors font-medium"
          >
            Register
          </Link>
          <Link
            to="/login"
            className="bg-blue-600 px-4 py-2 rounded text-white hover:bg-blue-700 transition-colors shadow hover:shadow-md"
          >
            Login
          </Link>
        </div>
        {/* Mobile Login/Register Buttons */}
        <div className="md:hidden flex items-center gap-2">
          <Link
            to="/register"
            className="text-gray-700 hover:text-blue-600 text-sm font-medium"
          >
            Register
          </Link>
          <Link
            to="/login"
            className="bg-blue-600 px-3 py-1.5 rounded text-white hover:bg-blue-700 transition-colors text-sm shadow"
          >
            Login
          </Link>
        </div>
      </>
    );
  };

  return (
    <div
      className={`sticky top-0 z-50 w-full flex justify-center transition-all duration-300 ${
        isScrolled ? "px-4 md:px-8 pt-2" : ""
      }`}
    >
      <nav
        className={`w-full transition-all duration-300 ${
          isScrolled
            ? "bg-white/20 backdrop-blur-md shadow-lg rounded-xl max-w-[95%] md:max-w-[90%]"
            : "bg-white shadow-md w-full"
        }`}
      >
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              {/* Hamburger Menu Button */}
              <div className="relative">
                <button
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="md:hidden text-blue-600 p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    {menuOpen ? (
                      <path d="M6 18L18 6M6 6l12 12" />
                    ) : (
                      <path d="M4 6h16M4 12h16M4 18h16" />
                    )}
                  </svg>
                </button>

                {/* Hamburger Dropdown */}
                {menuOpen && (
                  <div className="absolute left-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 overflow-hidden animate-fadeIn">
                    <div className="py-1">
                      <Link
                        to="/"
                        onClick={() => setMenuOpen(false)}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 border-l-4 border-transparent hover:border-blue-500"
                      >
                        Home
                      </Link>
                      {/* Only show Dashboard link if user is logged in, verified, and has admin role */}
                      {user && user.emailVerified && userData?.role === "admin" && (
                        <Link
                          to="/dashboard"
                          onClick={() => setMenuOpen(false)}
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 border-l-4 border-transparent hover:border-blue-500"
                        >
                          Dashboard
                        </Link>
                      )}
                      <Link
                        to="/alumni"
                        onClick={() => setMenuOpen(false)}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 border-l-4 border-transparent hover:border-blue-500"
                      >
                        Alumni
                      </Link>
                      <Link
                        to="/committee"
                        onClick={() => setMenuOpen(false)}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 border-l-4 border-transparent hover:border-blue-500"
                      >
                        Committee
                      </Link>
                      <Link
                        to="/past-events"
                        onClick={() => setMenuOpen(false)}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 border-l-4 border-transparent hover:border-blue-500"
                      >
                        News & Events
                      </Link>
                      <Link
                        to="/about"
                        onClick={() => setMenuOpen(false)}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 border-l-4 border-transparent hover:border-blue-500"
                      >
                        About
                      </Link>
                      <Link
                        to="/research"
                        onClick={() => setMenuOpen(false)}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 border-l-4 border-transparent hover:border-blue-500"
                      >
                        Research
                      </Link>
                      <Link
                        to="/contact"
                        onClick={() => setMenuOpen(false)}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 border-l-4 border-transparent hover:border-blue-500"
                      >
                        Contact Us
                      </Link>
                    </div>
                  </div>
                )}
              </div>

              {/* Logo */}
              <Link to="/" className="flex items-center group">
                <img
                  src="https://res.cloudinary.com/dnyapvuyc/image/upload/v1/logo_adlk7b"
                  alt="DCE Alumni Logo"
                  className="h-10 w-auto transition-transform duration-300 transform group-hover:scale-105"
                />
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-8">
              {/* Primary Links */}
              <Link
                to="/"
                className="text-gray-700 hover:text-blue-600 transition-all font-medium relative group"
              >
                Home
                <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-blue-600 group-hover:w-full transition-all duration-300 ease-in-out"></span>
              </Link>
              <Link
                to="/alumni"
                className="text-gray-700 hover:text-blue-600 transition-all font-medium relative group"
              >
                Alumni
                <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-blue-600 group-hover:w-full transition-all duration-300 ease-in-out"></span>
              </Link>
              <Link
                to="/committee"
                className="text-gray-700 hover:text-blue-600 transition-all font-medium relative group"
              >
                Committee
                <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-blue-600 group-hover:w-full transition-all duration-300 ease-in-out"></span>
              </Link>
              <Link
                to="/past-events"
                className="text-gray-700 hover:text-blue-600 transition-all font-medium relative group"
              >
                News & Events
                <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-blue-600 group-hover:w-full transition-all duration-300 ease-in-out"></span>
              </Link>

              {/* Secondary Links */}
              <Link
                to="/research"
                className="text-gray-700 hover:text-blue-600 transition-all font-medium relative group"
              >
                Research
                <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-blue-600 group-hover:w-full transition-all duration-300 ease-in-out"></span>
              </Link>
              <Link
                to="/about"
                className="text-gray-700 hover:text-blue-600 transition-all font-medium relative group"
              >
                About
                <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-blue-600 group-hover:w-full transition-all duration-300 ease-in-out"></span>
              </Link>
              <Link
                to="/contact"
                className="text-gray-700 hover:text-blue-600 transition-all font-medium relative group"
              >
                Contact Us
                <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-blue-600 group-hover:w-full transition-all duration-300 ease-in-out"></span>
              </Link>
            </div>

            {/* User Auth Section - Login/Register Buttons or User Profile */}
            <div className="flex items-center gap-4">
              {renderAuthSection()}
            </div>
          </div>
        </div>
      </nav>
    </div>
  );
};

export default Navbar;
