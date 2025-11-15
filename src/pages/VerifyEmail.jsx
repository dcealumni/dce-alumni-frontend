import React, { useContext, useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { FaEnvelope, FaCheckCircle, FaRedo } from "react-icons/fa";
import AuthContext from "../context/AuthContext";

const VerifyEmail = () => {
  const { tempUserData, verifyEmail, logOut } = useContext(AuthContext);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  
  useEffect(() => {
    // Get email from location state or tempUserData
    if (location.state && location.state.email) {
      setEmail(location.state.email);
    } else if (tempUserData && tempUserData.email) {
      setEmail(tempUserData.email);
    }
  }, [location.state, tempUserData]);

  const handleResendVerification = () => {
    setLoading(true);
    verifyEmail()
      .then(() => {
        setResendSuccess(true);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error resending verification email:", error);
        setLoading(false);
      });
  };

  const handleLogout = () => {
    logOut().then(() => {
      navigate("/login");
    });
  };

  if (!email) {
    return (
      <div className="min-h-[calc(100vh-80px)] flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <h2 className="text-xl font-bold mb-4">No user information found</h2>
          <Link
            to="/login"
            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg font-medium"
          >
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center px-4 py-10 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 p-8">
        <div className="flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-6">
            <FaEnvelope className="text-blue-600 text-2xl" />
          </div>
          
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Verify Your Email</h2>
          <p className="text-gray-600 mb-6">
            We've sent a verification email to <span className="font-medium">{email}</span>
          </p>
          
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6 text-left w-full">
            <h3 className="text-blue-800 font-medium mb-2 flex items-center">
              <FaCheckCircle className="mr-2" /> Follow these steps:
            </h3>
            <ol className="list-decimal pl-5 space-y-2 text-gray-700 text-sm">
              <li>Open the email from DCE Alumni Network</li>
              <li>Click on the verification link in the email</li>
              <li>Once verified, return to this page and login</li>
            </ol>
          </div>
          
          <div className="flex flex-col w-full gap-3">
            <button
              onClick={handleResendVerification}
              disabled={loading || resendSuccess}
              className={`flex items-center justify-center gap-2 py-3 px-6 rounded-lg font-medium transition-colors ${
                resendSuccess || loading
                  ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700 text-white"
              }`}
            >
              {loading ? (
                "Sending..."
              ) : resendSuccess ? (
                <>
                  <FaCheckCircle /> Email Sent
                </>
              ) : (
                <>
                  <FaRedo /> Resend Verification Email
                </>
              )}
            </button>
            
            <button
              onClick={handleLogout}
              className="py-3 px-6 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-100 transition-colors"
            >
              Back to Login
            </button>
          </div>
          
          {resendSuccess && (
            <p className="text-green-600 text-sm mt-4">
              Verification email sent successfully!
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;