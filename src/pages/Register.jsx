import React, { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FaEnvelope,
  FaLock,
  FaUserPlus,
  FaCheckCircle,
  FaArrowRight,
  FaTimes,
  FaCheck,
  FaEye,
  FaEyeSlash,
  FaGoogle,
} from "react-icons/fa";
import AuthContext from "../context/AuthContext";
import axios from 'axios';

const Register = () => {
  const { createUser, validateEmail, checkUserExists } = useContext(AuthContext);
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [email, setEmail] = useState("");
  const [name, setName] = useState(""); // Add this line
  const [emailError, setEmailError] = useState("");
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordErrors, setPasswordErrors] = useState({
    length: true,
    uppercase: true,
    lowercase: true,
    number: true,
    symbol: true,
    match: true,
  });

  const validatePassword = (password, confirmPass) => {
    const errors = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
      symbol: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/.test(password),
      match: password === confirmPass || confirmPass === "",
    };

    setPasswordErrors(errors);
    return !Object.values(errors).includes(false);
  };

  const handlePasswordChange = (e) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
    validatePassword(newPassword, confirmPassword);
  };

  const handleConfirmPasswordChange = (e) => {
    const newConfirmPassword = e.target.value;
    setConfirmPassword(newConfirmPassword);
    validatePassword(password, newConfirmPassword);
  };

  const handleEmailChange = (e) => {
    const newEmail = e.target.value;
    setEmail(newEmail);

    if (newEmail && !validateEmail(newEmail)) {
      setEmailError("Please enter a valid email address");
    } else {
      setEmailError("");
    }
  };

  const handleNameChange = (e) => {
    const newName = e.target.value;
    setName(newName);
  };

  const handleRegister = (e) => {
    e.preventDefault();
    
    // Validate email
    if (!validateEmail(email)) {
      setEmailError("Please enter a valid email address");
      return;
    }
    
    // Validate password
    const isValid = validatePassword(password, confirmPassword);
    if (!isValid) {
      return;
    }

    // First create Firebase user
    createUser(email, password, name)
      .then(() => {
        // After successful Firebase registration, save user to MongoDB
        const userData = {
          name: name,
          email: email,
          title: "Not specified",
          phone: "Not specified",
          location: "Not specified",
          bio: "No bio available",
          education: [],
          workExperience: [],
          // Add these default fields
          department: "Dyes and Chemical Engineering",
          university: "Bangladesh University of Textiles",
          role: "user",
        };

        axios.post(`${import.meta.env.VITE_API_URL}users`, userData)
          .then(() => {
            navigate("/verify-email", { 
              state: { email: email, name: name }
            });
          })
          .catch(error => {
            console.error("Error saving user data:", error);
            setEmailError("Failed to save user data. Please try again.");
          });
      })
      .catch(error => {
        console.error(error);
        // Handle specific error codes
        if (error.code === 'auth/email-already-in-use') {
          setEmailError("This email is already registered. Please login or use a different email.");
        } else {
          setEmailError("Registration failed. Please try again.");
        }
      });
  };

  const hasPasswordErrors = Object.values(passwordErrors).some(
    (value) => value === false
  );

  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center px-4 py-10 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-5xl w-full bg-white rounded-2xl shadow-2xl overflow-hidden grid md:grid-cols-2 border border-gray-100">
        {/* Left side content */}
        <div className="hidden md:flex flex-col items-center justify-center bg-gradient-to-br from-blue-600 to-indigo-700 p-6 text-white order-1 md:order-0">
          <div className="mb-6 text-center">
            <h2 className="text-2xl font-bold mb-2">Join Our Network</h2>
            <p className="text-blue-100 max-w-md text-sm">
              Connect with fellow alumni and discover opportunities
            </p>
          </div>
          <div className="mt-6 space-y-2">
            <div className="flex items-center gap-2">
              <div className="bg-blue-500 rounded-full w-6 h-6 flex items-center justify-center">
                <FaCheckCircle className="text-white text-xs" />
              </div>
              <p className="text-sm">Connect with alumni</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="bg-blue-500 rounded-full w-6 h-6 flex items-center justify-center">
                <FaCheckCircle className="text-white text-xs" />
              </div>
              <p className="text-sm">Access exclusive events</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="bg-blue-500 rounded-full w-6 h-6 flex items-center justify-center">
                <FaCheckCircle className="text-white text-xs" />
              </div>
              <p className="text-sm">Join alumni discussions</p>
            </div>
          </div>
        </div>

        {/* Form Section */}
        <div className="p-0 order-0 md:order-1 flex flex-col">
          <div className="p-6 md:p-8 flex-1">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">
                Create Account
              </h2>
              <div className="bg-blue-600 p-2 rounded-lg shadow-md">
                <FaUserPlus className="text-white text-lg" />
              </div>
            </div>

            <form onSubmit={handleRegister} className="space-y-4">
              {/* Name Field */}
              <div>
                <label className="block text-gray-700 font-medium mb-1 text-sm">
                  Full Name
                </label>
                <div className="relative group">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors">
                    <FaUserPlus className="text-sm" />
                  </div>
                  <input
                    name="name"
                    type="text"
                    value={name}
                    onChange={handleNameChange}
                    className="w-full px-9 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all text-sm"
                    placeholder="Enter your full name"
                    required
                  />
                </div>
              </div>

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
                {emailError && (
                  <p className="text-red-500 text-xs mt-1">{emailError}</p>
                )}
              </div>

              {/* Password Field */}
              <div>
                <label className="block text-gray-700 font-medium mb-1 text-sm">
                  Create Password
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
                    onFocus={() => setPasswordFocused(true)}
                    onBlur={() => setPasswordFocused(false)}
                    className="w-full px-9 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all text-sm"
                    placeholder="Create a password"
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

                {/* Password Requirements */}
                {(passwordFocused || hasPasswordErrors) && password && (
                  <div className="mt-2 grid grid-cols-2 gap-x-2 gap-y-1">
                    <div className="flex items-center gap-1 text-xs">
                      {passwordErrors.length ? (
                        <FaCheck className="text-green-500" />
                      ) : (
                        <FaTimes className="text-red-500" />
                      )}
                      <span
                        className={
                          passwordErrors.length
                            ? "text-green-700"
                            : "text-red-500"
                        }
                      >
                        At least 8 characters
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-xs">
                      {passwordErrors.uppercase ? (
                        <FaCheck className="text-green-500" />
                      ) : (
                        <FaTimes className="text-red-500" />
                      )}
                      <span
                        className={
                          passwordErrors.uppercase
                            ? "text-green-700"
                            : "text-red-500"
                        }
                      >
                        One uppercase letter
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-xs">
                      {passwordErrors.lowercase ? (
                        <FaCheck className="text-green-500" />
                      ) : (
                        <FaTimes className="text-red-500" />
                      )}
                      <span
                        className={
                          passwordErrors.lowercase
                            ? "text-green-700"
                            : "text-red-500"
                        }
                      >
                        One lowercase letter
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-xs">
                      {passwordErrors.number ? (
                        <FaCheck className="text-green-500" />
                      ) : (
                        <FaTimes className="text-red-500" />
                      )}
                      <span
                        className={
                          passwordErrors.number
                            ? "text-green-700"
                            : "text-red-500"
                        }
                      >
                        One number
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-xs">
                      {passwordErrors.symbol ? (
                        <FaCheck className="text-green-500" />
                      ) : (
                        <FaTimes className="text-red-500" />
                      )}
                      <span
                        className={
                          passwordErrors.symbol
                            ? "text-green-700"
                            : "text-red-500"
                        }
                      >
                        One special character
                      </span>
                    </div>
                    {confirmPassword && (
                      <div className="flex items-center gap-1 text-xs">
                        {passwordErrors.match ? (
                          <FaCheck className="text-green-500" />
                        ) : (
                          <FaTimes className="text-red-500" />
                        )}
                        <span
                          className={
                            passwordErrors.match
                              ? "text-green-700"
                              : "text-red-500"
                          }
                        >
                          Passwords match
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Confirm Password Field */}
              <div>
                <label className="block text-gray-700 font-medium mb-1 text-sm">
                  Confirm Password
                </label>
                <div className="relative group">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors">
                    <FaCheckCircle className="text-sm" />
                  </div>
                  <input
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={handleConfirmPasswordChange}
                    className={`w-full px-9 py-3 bg-gray-50 border ${
                      !passwordErrors.match && confirmPassword
                        ? "border-red-500"
                        : "border-gray-200"
                    } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all text-sm`}
                    placeholder="Re-enter your password"
                    required
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <FaEyeSlash className="text-sm" />
                    ) : (
                      <FaEye className="text-sm" />
                    )}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 shadow-md flex items-center justify-center gap-2 text-sm"
                >
                  Create Account
                  <FaArrowRight className="text-sm" />
                </button>
              </div>

              {/* Login Link */}
              <div className="mt-6 text-center">
                <p className="text-gray-600 text-sm">
                  Already have an account?{" "}
                  <Link
                    to="/login"
                    className="text-blue-600 hover:text-blue-800 font-medium transition-colors"
                  >
                    Log in
                  </Link>
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;