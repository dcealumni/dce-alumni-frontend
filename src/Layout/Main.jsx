import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../Shared/Navbar';
import Footer from '../Shared/Footer';
import AuthProvider from '../context/AuthProvider';
import ScrollToTop from '../Components/ScrollToTop';

export const Main = () => {
  return (
    <AuthProvider>
      <div>
        <ScrollToTop />
        <Navbar />
        <Outlet />
        <Footer />
      </div>
    </AuthProvider>
  );
};
