import React, { useContext, useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import AuthContext from "../context/AuthContext";
import axios from "axios";

export const AdminRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);
  const [userData, setUserData] = useState(null);
  const [isCheckingRole, setIsCheckingRole] = useState(true);

  useEffect(() => {
    const checkUserRole = async () => {
      if (!user?.email) {
        setIsCheckingRole(false);
        return;
      }

      try {
        const response = await axios.get(`https://dce-server.vercel.app/users/${user.email}`);
        setUserData(response.data);
      } catch (error) {
        console.error("Error checking user role:", error);
      } finally {
        setIsCheckingRole(false);
      }
    };

    checkUserRole();
  }, [user]);

  if (loading || isCheckingRole) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <span className="loading loading-ring loading-lg text-blue-600"></span>
      </div>
    );
  }

  if (!user || !userData || userData.role !== "admin") {
    return <Navigate to="/" replace />;
  }

  return children;
};

