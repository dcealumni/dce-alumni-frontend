import React from 'react';
import { Link } from 'react-router-dom';
import { FaHome, FaExclamationTriangle } from 'react-icons/fa';
import Lottie from 'lottie-react';
import notFoundAnimation from '../assets/animations/404.json';

const NotFound = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
      {/* Animation container with reduced size */}
      <div className="w-full max-w-md mb-2">
        <Lottie 
          animationData={notFoundAnimation}
          loop={true}
          className="w-full h-[300px]"
        />
      </div>
      
      {/* Content container with improved spacing */}
      <div className="max-w-sm w-full text-center space-y-3">
        <div className="flex items-center justify-center space-x-2 text-blue-600">
          <FaExclamationTriangle className="text-2xl" />
          <h1 className="text-5xl font-bold">404</h1>
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-semibold text-gray-800">Page Not Found</h2>
          <p className="text-gray-600 text-sm">
            Sorry, we couldn't find the page you're looking for.
          </p>
        </div>
        
        {/* Compact button with hover effects */}
        <Link 
          to="/" 
          className="inline-flex items-center px-6 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-all duration-200 shadow hover:shadow-lg transform hover:-translate-y-0.5"
        >
          <FaHome className="text-lg mr-2" />
          Return Home
        </Link>
      </div>
    </div>
  );
};

export default NotFound;