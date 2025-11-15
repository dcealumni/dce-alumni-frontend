import React, { useState, useContext } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  FaEnvelope,
  FaLock,
  FaSignInAlt,
  FaEye,
  FaEyeSlash,
} from "react-icons/fa";
import AuthContext from "../context/AuthContext";

const Login = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false); // Add loading state
  const { signIn, validateEmail } = useContext(AuthContext);

  const handleEmailChange = (e) => {
    const newEmail = e.target.value;
    setEmail(newEmail);
    
    if (newEmail && !validateEmail(newEmail)) {
      setEmailError("Please enter a valid email address");
    } else {
      setEmailError("");
    }
  };
  
  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
  };

  const handleLogin = (e) => {
    e.preventDefault();
    setIsLoading(true); // Start loading
    setEmailError(""); // Clear previous errors
    
    // Validate email
    if (!validateEmail(email)) {
      setEmailError("Please enter a valid email address");
      setIsLoading(false);
      return;
    }
    
    signIn(email, password)
      .then(result => {
        const destination = location.state?.from?.pathname || "/profile";
        navigate(destination);
      })
      .catch(error => {
        setIsLoading(false); // Stop loading on error
        if (error.message === "EMAIL_NOT_VERIFIED") {
          setEmailError("Please verify your email before logging in");
          navigate("/verify-email", { 
            state: { email: email } 
          });
        } else if (error.code === 'auth/invalid-credential') {
          setEmailError("Invalid email or password. Please check your credentials and try again.");
        } else if (error.code === 'auth/too-many-requests') {
          setEmailError("Too many failed login attempts. Please try again later.");
        } else {
          setEmailError("An error occurred during login. Please try again.");
        }
      });
  };

  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center px-4 py-10 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-5xl w-full bg-white rounded-2xl shadow-2xl overflow-hidden grid md:grid-cols-2 border border-gray-100">
        {/* Left side - Form */}
        <div className="p-0 order-1 md:order-0 flex flex-col">
          <div className="p-6 md:p-8 flex-1">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Welcome Back</h2>
              <div className="bg-blue-600 p-2 rounded-lg shadow-md">
                <FaSignInAlt className="text-white text-lg" />
              </div>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              {/* Email Field */}
              <div>
                <label className="block text-gray-700 font-medium mb-1 text-sm">
                  Email Address
                </label>
                <div className="relative group">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors">
                    <FaEnvelope className="text-sm" />
                  </div>
                  <input
                    name="email"
                    type="email"
                    value={email}
                    onChange={handleEmailChange}
                    className={`w-full px-9 py-3 bg-gray-50 border ${
                      emailError ? "border-red-500" : "border-gray-200"
                    } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all text-sm`}
                    placeholder="Enter your email"
                    required
                  />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <label className="block text-gray-700 font-medium mb-1 text-sm">
                  Password
                </label>
                <div className="relative group">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors">
                    <FaLock className="text-sm" />
                  </div>
                  <input
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={handlePasswordChange}
                    className="w-full px-9 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all text-sm"
                    placeholder="Enter your password"
                    required
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <FaEyeSlash className="text-sm" />
                    ) : (
                      <FaEye className="text-sm" />
                    )}
                  </button>
                </div>
                <div className="flex justify-end mt-1">
                  <Link
                    to="/forgot-password"
                    className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
                  >
                    Forgot Password?
                  </Link>
                </div>
              </div>

              {/* Error Message Display */}
              {emailError && (
                <div className="text-red-600 text-sm font-medium text-center bg-red-50 p-3 rounded-lg">
                  {emailError}
                </div>
              )}

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 shadow-md text-sm disabled:bg-blue-400 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Signing in...
                    </span>
                  ) : (
                    "Login"
                  )}
                </button>
              </div>
            </form>

            <div className="mt-6 text-center">
              <p className="text-gray-600 text-sm">
                Don't have an account?{" "}
                <Link
                  to="/register"
                  className="text-blue-600 hover:text-blue-800 font-medium transition-colors"
                >
                  Register Now
                </Link>
              </p>
            </div>
          </div>
        </div>

        {/* Right side - Info */}
        <div className="hidden md:flex flex-col items-center justify-center bg-gradient-to-br from-blue-600 to-indigo-700 p-6 text-white order-0 md:order-1">
          <div className="mb-6 text-center">
            <h2 className="text-2xl font-bold mb-2">Welcome Back!</h2>
            <p className="text-blue-100 max-w-md text-sm">
              Sign in to access your account and stay connected with the alumni network
            </p>
          </div>
          <div className="mt-6 space-y-2">
            <div className="flex items-center gap-2">
              <div className="bg-blue-500 rounded-full w-6 h-6 flex items-center justify-center">
                <FaSignInAlt className="text-white text-xs" />
              </div>
              <p className="text-sm">Access your profile</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="bg-blue-500 rounded-full w-6 h-6 flex items-center justify-center">
                <FaSignInAlt className="text-white text-xs" />
              </div>
              <p className="text-sm">Connect with alumni</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="bg-blue-500 rounded-full w-6 h-6 flex items-center justify-center">
                <FaSignInAlt className="text-white text-xs" />
              </div>
              <p className="text-sm">Explore opportunities</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;