import React, { useState, useContext, useEffect } from "react";
import {
  FaEdit,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaTimes,
  FaGraduationCap,
  FaBriefcase,
  FaIdCard,
  FaUsers,
  FaUniversity,
  FaBookReader,
  FaUserGraduate, // Add this for alumni registration button
  FaFlask, // Add this for research community button
} from "react-icons/fa";
import { Link } from "react-router-dom"; // Add this import
import AuthContext from "../context/AuthContext";
import axios from "axios";
import ImageUpload from '../Components/ImageUpload';

const Profile = () => {
  const { user } = useContext(AuthContext);
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    name: "",
    title: "",
    email: "",
    phone: "",
    location: "",
    bio: "",
    education: [],
    workExperience: [],
    studentId: "",
    batch: "",
    graduationYear: "",
    department: "Dyes and Chemical Engineering",
    university: "Bangladesh University of Textiles",
    currentPosition: "",
    company: "",
    industry: "",
    workLocation: "",
    linkedin: "",
    facebook: "",
    twitter: "",
    researchGate: "",
    image: "",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [alumniRegistrationStatus, setAlumniRegistrationStatus] = useState(null);
  const [isRegistering, setIsRegistering] = useState(false);
  const [registrationMessage, setRegistrationMessage] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateMessage, setUpdateMessage] = useState("");
  const [isRefreshingStatus, setIsRefreshingStatus] = useState(false);
  const [hasResearchProfile, setHasResearchProfile] = useState(false); // Add this state

  // Fetch user data when component mounts
  useEffect(() => {
    if (user?.email) {
      setLoading(true);
      setError(null);
      
      // Fetch user profile data
      axios.get(`https://dce-server.vercel.app/users/${user.email}`)
        .then(response => {
          if (response.data) {
            const data = {
              ...response.data,
              education: response.data.education || [],
              workExperience: response.data.workExperience || []
            };
            setProfileData(data);
          }
          setLoading(false);
        })
        .catch(error => {
          console.error("Error fetching user data:", error);
          setError("Failed to load profile data");
          setLoading(false);
        });

      // Check alumni registration status - try multiple methods
      const checkAlumniStatus = async () => {
        try {
          // Primary: try checking status by Firebase UID
          const statusResponse = await axios.get(`https://dce-server.vercel.app/alumni-registration/status-by-uid/${user.uid}`);
          console.log('Initial alumni registration status by UID:', statusResponse.data);
          
          if (statusResponse.data && statusResponse.data.success && statusResponse.data.registration) {
            const registration = statusResponse.data.registration;
            let status = registration.status;
            
            // Handle different status values
            if (status === 'accepted') {
              status = 'approved'; // Convert 'accepted' to 'approved' for frontend
            }
            
            // Also check approval field as fallback
            if (!status && registration.approval === true) {
              status = 'approved';
            } else if (!status && registration.approval === false) {
              status = 'rejected';
            } else if (!status) {
              status = 'pending';
            }
            
            // Additional check: if approvedAt exists, should be approved
            if (registration.approvedAt && status !== 'approved') {
              status = 'approved';
            }
            
            setAlumniRegistrationStatus(status);
            return;
          }
        } catch (statusError) {
          console.error("Error fetching alumni status by UID:", statusError);
          
          try {
            // Fallback: try checking if user has submitted
            const checkResponse = await axios.get(`https://dce-server.vercel.app/alumni-registration/check-by-uid/${user.uid}`);
            console.log('Initial alumni registration check by UID:', checkResponse.data);
            
            if (checkResponse.data.hasSubmitted && checkResponse.data.submission) {
              const submission = checkResponse.data.submission;
              let status = submission.status || 'pending';
              
              // Handle different status values
              if (status === 'accepted') {
                status = 'approved'; // Convert 'accepted' to 'approved' for frontend
              }
              
              // Check for approval field
              if (submission.approval === true) {
                status = 'approved';
              }
              
              // Additional check: if approvedAt exists, should be approved
              if (submission.approvedAt && status !== 'approved') {
                status = 'approved';
              }
              
              setAlumniRegistrationStatus(status);
            } else {
              setAlumniRegistrationStatus(null);
            }
          } catch (checkError) {
            console.error("Error checking alumni submission by UID:", checkError);
            console.log('Check Error response:', checkError.response?.data);
            setAlumniRegistrationStatus(null);
          }
        }
      };

      checkAlumniStatus();
      
      // Check if user has a research profile with meaningful content
      axios.get(`https://dce-server.vercel.app/research/${user.email}`)
        .then(response => {
          if (response.data && response.data._id) {
            // Check if profile has meaningful research content
            const profile = response.data;
            const hasResearchAreas = profile.researchAreas && profile.researchAreas.length > 0;
            const hasPublications = profile.publications && profile.publications.length > 0;
            const hasBio = profile.bio && profile.bio.trim() !== '';
            const hasProjects = profile.ongoingProjects && profile.ongoingProjects.length > 0;
            
            // Only consider it a "real" profile if it has research content
            if (hasResearchAreas || hasPublications || hasBio || hasProjects) {
              setHasResearchProfile(true);
            } else {
              // Profile exists but is empty (auto-created) - treat as no profile
              setHasResearchProfile(false);
            }
          } else {
            setHasResearchProfile(false);
          }
        })
        .catch(error => {
          console.error("Error checking research profile:", error);
          setHasResearchProfile(false);
        });
    }
  }, [user]);

  // Add periodic status checking every 2 minutes
  useEffect(() => {
    if (!user?.email) return;

    const statusInterval = setInterval(() => {
      refreshAlumniStatus();
    }, 120000); // Check every 2 minutes

    return () => clearInterval(statusInterval);
  }, [user]);

  // Add page visibility listener to refresh status when user returns to page
  useEffect(() => {
    if (!user?.email) return;

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        // Page became visible, refresh alumni status
        setTimeout(() => {
          refreshAlumniStatus();
        }, 500);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSkillChange = (e) => {
    const skills = e.target.value.split(",").map((skill) => skill.trim());
    setProfileData((prev) => ({
      ...prev,
      skills,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!user?.email) {
      setUpdateMessage("User not found. Please log in again.");
      return;
    }

    setIsUpdating(true);
    setUpdateMessage("");

    try {
      const updatedData = {
        ...profileData,
        email: user.email, // Ensure email is included
        image: profileData.image
      };

      // Try PUT first for existing users, if it fails with 404, use POST to create
      try {
        const response = await axios.put(`https://dce-server.vercel.app/users/${user.email}`, updatedData);
        
        setUpdateMessage(
          alumniRegistrationStatus === 'approved' 
            ? "Profile updated successfully! Alumni directory will show updated information." 
            : "Profile updated successfully!"
        );
        setIsEditing(false);
        
        // Update local state with saved data
        setProfileData(updatedData);
        
        // Clear success message after 4 seconds
        setTimeout(() => {
          setUpdateMessage("");
        }, 4000);
      } catch (putError) {
        // If PUT fails (user doesn't exist), try POST to create
        if (putError.response && putError.response.status === 404) {
          const createResponse = await axios.post(`https://dce-server.vercel.app/users`, updatedData);
          
          setUpdateMessage("Profile created successfully!");
          setIsEditing(false);
          
          // Update local state with saved data
          setProfileData(updatedData);
          
          // Clear success message after 4 seconds
          setTimeout(() => {
            setUpdateMessage("");
          }, 4000);
        } else {
          throw putError; // Re-throw if it's a different error
        }
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      setUpdateMessage("Failed to update profile. Please try again.");
      
      // Clear error message after 5 seconds
      setTimeout(() => {
        setUpdateMessage("");
      }, 5000);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
      
      const formData = new FormData();
      formData.append('image', file);
      
      axios.post(`https://dce-server.vercel.app/users/${user.email}/upload-image`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      .then(response => {
        setProfileData(prev => ({
          ...prev,
          imageUrl: response.data.imageUrl
        }));
      })
      .catch(error => {
        console.error('Error uploading image:', error);
      });
    }
  };

  // Function to get alumni registration status display
  const getAlumniStatusDisplay = () => {
    switch (alumniRegistrationStatus) {
      case 'pending':
        return {
          text: 'Alumni Registration Pending',
          color: 'text-yellow-600 border-yellow-600',
          bgColor: 'bg-yellow-50'
        };
      case 'approved':
      case 'accepted': // Handle both 'approved' and 'accepted'
        return {
          text: 'Alumni Registration Approved',
          color: 'text-green-600 border-green-600',
          bgColor: 'bg-green-50'
        };
      case 'rejected':
        return {
          text: 'Alumni Registration Rejected',
          color: 'text-red-600 border-red-600',
          bgColor: 'bg-red-50'
        };
      default:
        return null;
    }
  };

  // Function to refresh alumni registration status
  const refreshAlumniStatus = async () => {
    if (!user?.email) return;

    setIsRefreshingStatus(true);
    console.log('=== REFRESHING ALUMNI STATUS ===');
    console.log('User Email:', user.email);
    console.log('User UID:', user.uid);

    try {
      // Method 1: Try checking by Firebase UID (Primary method)
      console.log('Method 1: Checking status by UID...');
      const statusResponse = await axios.get(`https://dce-server.vercel.app/alumni-registration/status-by-uid/${user.uid}`);
      console.log('Status by UID response full:', statusResponse);
      console.log('Status by UID response data:', statusResponse.data);
      
      if (statusResponse.data && statusResponse.data.success) {
        console.log('Raw API response data:', JSON.stringify(statusResponse.data, null, 2));
        
        // Access nested registration object
        const registration = statusResponse.data.registration;
        if (!registration) {
          console.log('❌ No registration object found in response');
          throw new Error('No registration data');
        }
        
        let status = registration.status;
        console.log('Original status from API:', status);
        console.log('Approval field from API:', registration.approval);
        console.log('ApprovedAt field from API:', registration.approvedAt);
        
        // Handle different status values
        if (status === 'accepted') {
          status = 'approved'; // Convert 'accepted' to 'approved' for frontend
          console.log('Converted "accepted" to "approved"');
        }
        
        // Also check approval field as fallback
        if (!status && registration.approval === true) {
          status = 'approved';
          console.log('Set status to "approved" based on approval field');
        } else if (!status && registration.approval === false) {
          status = 'rejected';
          console.log('Set status to "rejected" based on approval field');
        } else if (!status) {
          status = 'pending';
          console.log('Defaulted status to "pending"');
        }
        
        // Additional check: if approvedAt exists, should be approved
        if (registration.approvedAt && status !== 'approved') {
          status = 'approved';
          console.log('Set status to "approved" based on approvedAt field');
        }
        
        console.log('✅ Final status being set:', status);
        setAlumniRegistrationStatus(status);
        setIsRefreshingStatus(false);
        return;
      }
    } catch (statusError) {
      console.error("❌ Error fetching alumni status by UID:", statusError);
      console.log("Status error response:", statusError.response?.data);
      console.log("Status error status:", statusError.response?.status);
    }

    try {
      // Method 2: Try checking if user has submitted (fallback)
      console.log('Method 2: Checking submission by UID...');
      const checkResponse = await axios.get(`https://dce-server.vercel.app/alumni-registration/check-by-uid/${user.uid}`);
      console.log('Check by UID response full:', checkResponse);
      console.log('Check by UID response data:', checkResponse.data);
      
      if (checkResponse.data.hasSubmitted) {
        console.log('Check method - Raw API response:', JSON.stringify(checkResponse.data, null, 2));
        
        // Access nested submission object
        const submission = checkResponse.data.submission;
        if (!submission) {
          console.log('❌ No submission object found in check response');
          throw new Error('No submission data');
        }
        
        let status = submission.status || 'pending';
        console.log('Check method - Original status:', status);
        console.log('Check method - Approval field:', submission.approval);
        console.log('Check method - ApprovedAt field:', submission.approvedAt);
        
        // Handle different status values
        if (status === 'accepted') {
          status = 'approved'; // Convert 'accepted' to 'approved' for frontend
          console.log('Check method - Converted "accepted" to "approved"');
        }
        
        // Check for approval field
        if (submission.approval === true) {
          status = 'approved';
          console.log('Check method - Set to "approved" based on approval field');
        }
        
        // Additional check: if approvedAt exists, should be approved
        if (submission.approvedAt && status !== 'approved') {
          status = 'approved';
          console.log('Check method - Set to "approved" based on approvedAt field');
        }
        
        console.log('✅ Check method - Final status:', status);
        setAlumniRegistrationStatus(status);
        setIsRefreshingStatus(false);
        return;
      } else {
        console.log('❌ No submission found by UID');
      }
    } catch (checkError) {
      console.error("❌ Error checking submission by UID:", checkError);
      console.log("Check error response:", checkError.response?.data);
      console.log("Check error status:", checkError.response?.status);
    }

    try {
      // Method 3: Try checking by email (fallback)
      console.log('Method 3: Checking by email...');
      const emailResponse = await axios.get(`https://dce-server.vercel.app/alumni-registration/status/${user.email}`);
      console.log('Email response full:', emailResponse);
      console.log('Email response data:', emailResponse.data);
      
      // Handle different response formats
      let status = emailResponse.data.status || emailResponse.data;
      
      // Handle different status values
      if (status === 'accepted') {
        status = 'approved'; // Convert 'accepted' to 'approved' for frontend
      }
      
      console.log('Parsed status from email:', status);
      
      if (status && status !== 'null' && status !== null) {
        console.log('✅ Setting status from email method:', status);
        setAlumniRegistrationStatus(status);
        setIsRefreshingStatus(false);
        return;
      }
    } catch (emailError) {
      console.error("❌ Error fetching alumni status by email:", emailError);
      console.log("Email error response:", emailError.response?.data);
      console.log("Email error status:", emailError.response?.status);
    }

    try {
      // Method 3: Try checking approved alumni list
      console.log('Method 3: Checking approved alumni list...');
      const approvedResponse = await axios.get('https://dce-server.vercel.app/alumni-registration/approved');
      console.log('Approved alumni response:', approvedResponse.data);
      
      const approvedAlumni = approvedResponse.data;
      const userInApproved = approvedAlumni.find(alumni => 
        alumni.email === user.email || alumni.firebaseUid === user.uid
      );
      
      if (userInApproved) {
        console.log('✅ Found in approved list:', userInApproved);
        setAlumniRegistrationStatus('approved');
        setIsRefreshingStatus(false);
        return;
      }
    } catch (approvedError) {
      console.error("❌ Error checking approved list:", approvedError);
    }

    try {
      // Method 4: Try checking pending alumni list
      console.log('Method 4: Checking pending alumni list...');
      const pendingResponse = await axios.get('https://dce-server.vercel.app/alumni-registration/pending');
      console.log('Pending alumni response:', pendingResponse.data);
      
      const pendingAlumni = pendingResponse.data;
      const userInPending = pendingAlumni.find(alumni => 
        alumni.email === user.email || alumni.firebaseUid === user.uid
      );
      
      if (userInPending) {
        console.log('✅ Found in pending list:', userInPending);
        setAlumniRegistrationStatus('pending');
        setIsRefreshingStatus(false);
        return;
      }
    } catch (pendingError) {
      console.error("❌ Error checking pending list:", pendingError);
    }

    // If all methods fail, assume no registration
    console.log('❌ All methods failed, setting status to null');
    setAlumniRegistrationStatus(null);
    
    setIsRefreshingStatus(false);
  };

  // Function to handle alumni registration using profile data
  const handleAlumniRegistration = async () => {
    // Validate required fields
    const requiredFields = ['name', 'email', 'phone', 'studentId', 'batch', 'graduationYear'];
    const missingFields = [];
    
    requiredFields.forEach(field => {
      if (!profileData[field] || profileData[field].trim() === '') {
        missingFields.push(field);
      }
    });

    if (missingFields.length > 0) {
      const fieldNames = missingFields.map(field => {
        switch(field) {
          case 'studentId': return 'Student ID';
          case 'graduationYear': return 'Graduation Year';
          default: return field.charAt(0).toUpperCase() + field.slice(1);
        }
      }).join(', ');
      
      setRegistrationMessage(`Please complete the following required fields: ${fieldNames}`);
      setTimeout(() => setRegistrationMessage(''), 5000);
      return;
    }

    setIsRegistering(true);
    setRegistrationMessage('');

    try {
      // Create FormData for multipart/form-data submission
      const formDataToSend = new FormData();
      
      // Append Firebase UID and user email
      formDataToSend.append('firebaseUid', user.uid);
      formDataToSend.append('userEmail', user.email);
      
      // Append all required and optional profile fields
      formDataToSend.append('name', profileData.name);
      formDataToSend.append('email', profileData.email);
      formDataToSend.append('phone', profileData.phone);
      formDataToSend.append('batch', profileData.batch);
      formDataToSend.append('graduationYear', profileData.graduationYear);
      formDataToSend.append('studentId', profileData.studentId);
      formDataToSend.append('currentPosition', profileData.currentPosition || '');
      formDataToSend.append('company', profileData.company || '');
      formDataToSend.append('industry', profileData.industry || '');
      formDataToSend.append('workLocation', profileData.workLocation || '');
      formDataToSend.append('linkedin', profileData.linkedin || '');
      formDataToSend.append('facebook', profileData.facebook || '');
      formDataToSend.append('twitter', profileData.twitter || '');
      formDataToSend.append('researchGate', profileData.researchGate || '');
      formDataToSend.append('bio', profileData.bio || '');
      
      // If user has profile image, include it (this would need to be handled by backend)
      if (profileData.image) {
        formDataToSend.append('existingImageUrl', profileData.image);
      }

      // Submit registration data
      const response = await axios.post('https://dce-server.vercel.app/alumni-registration', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.success) {
        setRegistrationMessage('Alumni registration submitted successfully! Awaiting approval.');
        setAlumniRegistrationStatus('pending');
        
        // Refresh the alumni status from server to ensure consistency
        setTimeout(async () => {
          try {
            const statusResponse = await axios.get(`https://dce-server.vercel.app/alumni-registration/status/${user.email}`);
            setAlumniRegistrationStatus(statusResponse.data.status);
          } catch (error) {
            console.error('Error refreshing alumni status:', error);
          }
        }, 1000);
        
        // Auto-clear success message after 5 seconds
        setTimeout(() => setRegistrationMessage(''), 5000);
      }
    } catch (error) {
      console.error('Error submitting alumni registration:', error);
      
      if (error.response?.data?.message === 'User has already submitted registration') {
        setRegistrationMessage('You have already submitted your alumni registration.');
        setAlumniRegistrationStatus('pending');
        
        // Also try to get the actual status from server
        try {
          const statusResponse = await axios.get(`https://dce-server.vercel.app/alumni-registration/status/${user.email}`);
          setAlumniRegistrationStatus(statusResponse.data.status);
        } catch (statusError) {
          console.error('Error getting actual status:', statusError);
        }
      } else {
        setRegistrationMessage('Error submitting registration. Please try again.');
      }
      
      // Auto-clear error message after 5 seconds
      setTimeout(() => setRegistrationMessage(''), 5000);
    } finally {
      setIsRegistering(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">Loading profile...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-600">{error}</div>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">No profile data available</div>
      </div>
    );
  }

  const statusDisplay = getAlumniStatusDisplay();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-6">
      {/* Toast Notification */}
      {updateMessage && updateMessage.includes('successfully') && (
        <div className="fixed top-4 right-4 z-50 bg-emerald-600 text-white px-6 py-4 rounded-xl shadow-xl flex items-center gap-3 animate-fade-in border border-emerald-500">
          <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          </div>
          <span className="font-medium">Profile updated successfully!</span>
        </div>
      )}
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Column - Profile Card */}
          <div className="lg:w-1/3">
            <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
              {/* Header Background */}
              <div className="bg-gradient-to-r from-slate-700 to-slate-600 h-24 relative">
                <div className="absolute inset-0 bg-gradient-to-r from-slate-700/90 to-slate-600/90"></div>
              </div>
              
              {/* Profile Content */}
              <div className="px-6 pb-6 -mt-16 relative">
                {/* Profile Image */}
                <div className="flex justify-center mb-4">
                  <div className="relative group">
                    <img
                      src={profileData.image || "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp"}
                      alt="Profile"
                      className="w-28 h-28 rounded-full border-4 border-white shadow-xl object-cover bg-white"
                    />
                    
                    {/* Image Upload Overlay */}
                    <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <ImageUpload 
                        email={user.email} 
                        onImageUpload={(imageUrl) => {
                          setProfileData(prev => ({
                            ...prev,
                            image: imageUrl
                          }));
                        }} 
                      />
                    </div>
                  </div>
                </div>

                {/* Name and Title */}
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold text-slate-800 mb-1">{profileData.name}</h2>
                  <p className="text-slate-600 font-medium mb-3">{profileData.title}</p>
                  
                  {/* Current Position Badge */}
                  {profileData.currentPosition && (
                    <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 mb-4">
                      <FaBriefcase className="w-3 h-3 mr-2" />
                      {profileData.currentPosition}
                    </div>
                  )}

                  {/* Edit Profile Button */}
                  <button
                    onClick={() => setIsEditing(true)}
                    className="w-full flex items-center justify-center gap-2 bg-slate-700 text-white hover:bg-slate-800 py-3 rounded-xl transition-all duration-200 font-medium shadow-md hover:shadow-lg"
                  >
                    <FaEdit className="w-4 h-4" /> Edit Profile
                  </button>

                  {/* Alumni Registration Button/Status */}
                  <div className="mt-4">
                    {user && user.emailVerified && (
                      <>
                        {!alumniRegistrationStatus || alumniRegistrationStatus === 'rejected' ? (
                          // Show register button if not registered or rejected
                          <button 
                            onClick={handleAlumniRegistration}
                            disabled={isRegistering}
                            className="w-full flex items-center justify-center gap-2 bg-emerald-600 text-white hover:bg-emerald-700 disabled:bg-emerald-400 py-3 rounded-xl transition-all duration-200 font-medium shadow-md hover:shadow-lg"
                          >
                            {isRegistering ? (
                              <>
                                <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                {alumniRegistrationStatus === 'rejected' ? 'Re-applying...' : 'Registering...'}
                              </>
                            ) : (
                              <>
                                <FaUserGraduate /> {alumniRegistrationStatus === 'rejected' ? 'Re-apply as Alumni' : 'Register as Alumni'}
                              </>
                            )}
                          </button>
                        ) : (
                          // Show status for pending/approved
                          <div className={`w-full flex items-center justify-center gap-2 border-2 py-2 rounded-md ${getAlumniStatusDisplay()?.color} ${getAlumniStatusDisplay()?.bgColor}`}>
                            <FaUserGraduate /> {getAlumniStatusDisplay()?.text}
                          </div>
                        )}
                        
                        {/* Show rejected message separately */}
                        {alumniRegistrationStatus === 'rejected' && (
                          <div className="mt-2 p-3 rounded-md text-sm bg-red-50 text-red-800 border border-red-200">
                            <div className="flex items-center gap-2">
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                              </svg>
                              Your alumni registration was rejected. You can update your profile and re-apply.
                            </div>
                          </div>
                        )}
                      </>
                    )}
                    
                    {/* Registration Message */}
                    {registrationMessage && (
                      <div className={`mt-2 p-3 rounded-md text-sm ${
                        registrationMessage.includes('successfully') 
                          ? 'bg-green-50 text-green-800 border border-green-200' 
                          : 'bg-red-50 text-red-800 border border-red-200'
                      }`}>
                        {registrationMessage}
                      </div>
                    )} 
                  </div>

                  {/* Research Community Button - Only for approved alumni */}
                  {alumniRegistrationStatus === 'approved' && (
                    <div className="mt-4">
                      {!hasResearchProfile ? (
                        <Link 
                          to="/research-profile" 
                          className="w-full flex items-center justify-center gap-2 bg-purple-600 text-white hover:bg-purple-700 py-3 rounded-xl transition-all duration-200 font-medium shadow-md hover:shadow-lg"
                        >
                          <FaFlask className="w-4 h-4" /> Join our research community
                        </Link>
                      ) : (
                        <Link 
                          to="/research-profile" 
                          className="w-full flex items-center justify-center gap-2 bg-purple-100 text-purple-800 border-2 border-purple-600 hover:bg-purple-200 py-3 rounded-xl transition-all duration-200 font-medium"
                        >
                          <FaFlask className="w-4 h-4" /> View research profile
                        </Link>
                      )}
                    </div>
                  )}
                </div>
                  
                {/* Academic Information */}
                <div className="border-t border-slate-200 pt-6">
                  <h3 className="text-lg font-semibold text-slate-800 mb-4">Academic Details</h3>
                  <div className="space-y-4">
                    {/* Student ID */}
                    <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                      <div className="w-10 h-10 rounded-xl bg-slate-600 flex items-center justify-center">
                        <FaIdCard className="text-white w-4 h-4" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-slate-500 mb-1">Student ID</p>
                        <p className="text-slate-800 font-semibold">{profileData.studentId || "Not specified"}</p>
                      </div>
                    </div>

                    {/* Batch */}
                    <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                      <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center">
                        <FaUsers className="text-white w-4 h-4" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-slate-500 mb-1">Batch</p>
                        <p className="text-slate-800 font-semibold">{profileData.batch || "Not specified"}</p>
                      </div>
                    </div>

                    {/* Graduation Year */}
                    <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                      <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center">
                        <FaGraduationCap className="text-white w-4 h-4" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-slate-500 mb-1">Graduation Year</p>
                        <p className="text-slate-800 font-semibold">{profileData.graduationYear || "Not specified"}</p>
                      </div>
                    </div>

                    {/* Department */}
                    <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                      <div className="w-10 h-10 rounded-xl bg-purple-600 flex items-center justify-center">
                        <FaBookReader className="text-white w-4 h-4" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-slate-500 mb-1">Department</p>
                        <p className="text-slate-800 font-semibold">{profileData.department}</p>
                      </div>
                    </div>

                    {/* University */}
                    <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                      <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center">
                        <FaUniversity className="text-white w-4 h-4" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-slate-500 mb-1">University</p>
                        <p className="text-slate-800 font-semibold">{profileData.university}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="border-t border-slate-200 pt-8 mt-8 mx-4">
                <h3 className="text-lg font-semibold text-slate-800 mb-4">Contact Information</h3>
                <div className="space-y-4">
                  {/* Email */}
                  <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                    <div className="w-10 h-10 rounded-xl bg-red-500 flex items-center justify-center">
                      <FaEnvelope className="text-white w-4 h-4" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-slate-500 mb-1">Email</p>
                      <p className="text-slate-800 font-semibold">{profileData.email}</p>
                    </div>
                  </div>

                  {/* Phone */}
                  <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                    <div className="w-10 h-10 rounded-xl bg-green-500 flex items-center justify-center">
                      <FaPhone className="text-white w-4 h-4" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-slate-500 mb-1">Phone</p>
                      <p className="text-slate-800 font-semibold">{profileData.phone}</p>
                    </div>
                  </div>

                  {/* Location */}
                  <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                    <div className="w-10 h-10 rounded-xl bg-orange-500 flex items-center justify-center">
                      <FaMapMarkerAlt className="text-white w-4 h-4" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-slate-500 mb-1">Location</p>
                      <p className="text-slate-800 font-semibold">{profileData.location}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Main Content */}
          <div className="lg:w-2/3 space-y-6">
            {/* About Section */}
            <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8">
              <h3 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-3">
                <div className="w-8 h-8 bg-slate-600 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                About Me
              </h3>
              <div className="prose prose-slate max-w-none">
                <p className="text-slate-600 text-lg leading-relaxed">{profileData.bio || "No bio available yet."}</p>
              </div>
            </div>

            {/* Professional Information */}
            {(profileData.currentPosition || profileData.company || profileData.workLocation) && (
              <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8">
                <h3 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                    <FaBriefcase className="text-white w-5 h-5" />
                  </div>
                  Professional Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {profileData.currentPosition && (
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                      <p className="text-sm font-medium text-slate-500 mb-2">Position</p>
                      <p className="font-semibold text-slate-800 text-lg">{profileData.currentPosition}</p>
                    </div>
                  )}
                  {profileData.company && (
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                      <p className="text-sm font-medium text-slate-500 mb-2">Company</p>
                      <p className="font-semibold text-slate-800 text-lg">{profileData.company}</p>
                    </div>
                  )}
                  {profileData.workLocation && (
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                      <p className="text-sm font-medium text-slate-500 mb-2">Work Location</p>
                      <p className="font-semibold text-slate-800 text-lg">{profileData.workLocation}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Social Media */}
            {(profileData.linkedin || profileData.facebook || profileData.twitter || profileData.researchGate) && (
              <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8">
                <h3 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-3">
                  <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z" />
                      <path d="M15 7v2a4 4 0 01-4 4H9.828l-1.766 1.767c.28.149.599.233.938.233h2l3 3v-3h2a2 2 0 002-2V9a2 2 0 00-2-2h-1z" />
                    </svg>
                  </div>
                  Social Media
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {profileData.linkedin && (
                    <a
                      href={profileData.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex items-center gap-3 px-4 py-3 bg-blue-50 border border-blue-200 rounded-xl hover:bg-blue-600 text-blue-700 hover:text-white transition-all duration-200 hover:shadow-lg hover:scale-105"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                      </svg>
                      <span className="font-medium">LinkedIn</span>
                    </a>
                  )}
                  {profileData.facebook && (
                    <a
                      href={profileData.facebook}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex items-center gap-3 px-4 py-3 bg-blue-50 border border-blue-200 rounded-xl hover:bg-blue-600 text-blue-700 hover:text-white transition-all duration-200 hover:shadow-lg hover:scale-105"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z"/>
                      </svg>
                      <span className="font-medium">Facebook</span>
                    </a>
                  )}
                  {profileData.twitter && (
                    <a
                      href={profileData.twitter}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex items-center gap-3 px-4 py-3 bg-sky-50 border border-sky-200 rounded-xl hover:bg-sky-500 text-sky-700 hover:text-white transition-all duration-200 hover:shadow-lg hover:scale-105"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                      </svg>
                      <span className="font-medium">Twitter</span>
                    </a>
                  )}
                  {profileData.researchGate && (
                    <a
                      href={profileData.researchGate}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex items-center gap-3 px-4 py-3 bg-teal-50 border border-teal-200 rounded-xl hover:bg-teal-600 text-teal-700 hover:text-white transition-all duration-200 hover:shadow-lg hover:scale-105"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M19.586 0c-.818 0-1.508.19-2.073.565-.563.377-.996.974-1.298 1.794-.302.82-.453 1.797-.453 2.931 0 1.336.275 2.535.826 3.596.551 1.061 1.304 1.962 2.26 2.704l.402-.402c-.897-.693-1.584-1.461-2.062-2.304-.478-.843-.717-1.75-.717-2.72 0-1.148.128-2.113.385-2.893.256-.78.622-1.378 1.097-1.794.475-.416 1.024-.624 1.647-.624.623 0 1.172.208 1.647.624.475.416.841 1.014 1.097 1.794.256.78.385 1.745.385 2.893 0 .97-.239 1.877-.717 2.72-.478.843-1.165 1.611-2.062 2.304l.402.402c.956-.742 1.709-1.643 2.26-2.704.551-1.061.826-2.26.826-3.596 0-1.134-.151-2.111-.453-2.931-.302-.82-.735-1.417-1.298-1.794C21.094.19 20.404 0 19.586 0zM5.772 8.542c0 1.41.179 2.581.538 3.512.359.932.871 1.617 1.536 2.056.665.439 1.46.658 2.384.658.924 0 1.719-.219 2.384-.658.665-.439 1.177-1.124 1.536-2.056.359-.931.538-2.102.538-3.512 0-1.41-.179-2.581-.538-3.512-.359-.932-.871-1.617-1.536-2.056-.665-.439-1.46-.658-2.384-.658-.924 0-1.719.219-2.384.658-.665.439-1.177 1.124-1.536 2.056-.359.931-.538 2.102-.538 3.512zm2.686 0c0-.939.072-1.715.217-2.328.145-.613.353-1.061.624-1.344.271-.283.597-.424.978-.424.381 0 .707.141.978.424.271.283.479.731.624 1.344.145.613.217 1.389.217 2.328 0 .939-.072 1.715-.217 2.328-.145.613-.353 1.061-.624 1.344-.271.283-.597.424-.978.424-.381 0-.707-.141-.978-.424-.271-.283-.479-.731-.624-1.344-.145-.613-.217-1.389-.217-2.328z"/>
                      </svg>
                      <span className="font-medium">ResearchGate</span>
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* Work Experience */}
            <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8">
              <h3 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-3">
                <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
                  <FaBriefcase className="text-white w-5 h-5" />
                </div>
                Work Experience
              </h3>
              <div className="space-y-6">
                {(profileData?.workExperience || []).length > 0 ? (
                  (profileData?.workExperience || []).map((experience, index) => (
                    <div key={index} className="relative bg-slate-50 p-6 rounded-xl border border-slate-200 hover:shadow-md transition-shadow duration-200">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <FaBriefcase className="text-emerald-600 w-5 h-5" />
                        </div>
                        <div className="flex-1">
                          <h4 className="text-lg font-semibold text-slate-800 mb-1">
                            {experience.organization}
                          </h4>
                          <p className="text-emerald-600 font-medium mb-2">{experience.role}</p>
                          <div className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-slate-200 text-slate-700">
                            {experience.startDate} - {experience.currentlyWorking ? "Present" : experience.endDate}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-slate-500">
                    <FaBriefcase className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                    <p>No work experience added yet</p>
                  </div>
                )}
              </div>
            </div>

            {/* Education */}
            <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8">
              <h3 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-3">
                <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                  <FaGraduationCap className="text-white w-5 h-5" />
                </div>
                Education
              </h3>
              <div className="space-y-6">
                {(profileData?.education || []).length > 0 ? (
                  (profileData?.education || []).map((edu, index) => (
                    <div key={index} className="relative bg-slate-50 p-6 rounded-xl border border-slate-200 hover:shadow-md transition-shadow duration-200">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <FaGraduationCap className="text-indigo-600 w-5 h-5" />
                        </div>
                        <div className="flex-1">
                          <h4 className="text-lg font-semibold text-slate-800 mb-1">
                            {edu.institution}
                          </h4>
                          <p className="text-indigo-600 font-medium mb-2">{edu.department}</p>
                          <div className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-slate-200 text-slate-700">
                            {edu.startDate} - {edu.currentlyStudying ? "Present" : edu.endDate}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-slate-500">
                    <FaGraduationCap className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                    <p>No education history added yet</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Modal - Keep existing modal code */}
      {isEditing && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Edit Profile</h2>
              <button
                onClick={() => setIsEditing(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <FaTimes />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Personal Information */}
              <div>
                <h3 className="font-medium mb-4">Personal Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={profileData.name}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-md px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Title
                    </label>
                    <input
                      type="text"
                      name="title"
                      value={profileData.title}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-md px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={profileData.phone}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, "");
                        setProfileData((prev) => ({
                          ...prev,
                          phone: value,
                        }));
                      }}
                      pattern="[0-9]*"
                      className="w-full border border-gray-300 rounded-md px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Location
                    </label>
                    <input
                      type="text"
                      name="location"
                      value={profileData.location}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-md px-3 py-2"
                    />
                  </div>
                   <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Student ID
                    </label>
                    <input
                      type="text"
                      name="studentId"
                      value={profileData.studentId}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-md px-3 py-2"
                      placeholder="Enter your student ID"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Batch
                    </label>
                    <input
                      type="text"
                      name="batch"
                      value={profileData.batch}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-md px-3 py-2"
                      placeholder="Enter your batch (e.g., 13th)"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Graduation Year
                    </label>
                    <input
                      type="text"
                      name="graduationYear"
                      value={profileData.graduationYear}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-md px-3 py-2"
                      placeholder="Enter graduation year (e.g., 2023)"
                    />
                  </div>
                </div>
              </div>

              {/* Professional Information */}
              <div>
                <h3 className="font-medium mb-4">Professional Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Position
                    </label>
                    <select
                      name="currentPosition"
                      value={profileData.currentPosition}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-md px-3 py-2"
                    >
                      <option value="">Select Position</option>
                      <option value="Student">Student</option>
                      <option value="Academic">Academic</option>
                      <option value="Industry">Industry</option>
                      <option value="Business">Business</option>
                      <option value="Abroad">Abroad</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Company/Organization
                    </label>
                    <input
                      type="text"
                      name="company"
                      value={profileData.company}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-md px-3 py-2"
                      placeholder="e.g., Google, Microsoft"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Work Location
                    </label>
                    <input
                      type="text"
                      name="workLocation"
                      value={profileData.workLocation}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-md px-3 py-2"
                      placeholder="e.g., Dhaka, Bangladesh"
                    />
                  </div>
                </div>
              </div>

              {/* Social Media Links */}
              <div>
                <h3 className="font-medium mb-4">Social Media Links</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      LinkedIn
                    </label>
                    <input
                      type="url"
                      name="linkedin"
                      value={profileData.linkedin}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-md px-3 py-2"
                      placeholder="https://linkedin.com/in/yourprofile"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Facebook
                    </label>
                    <input
                      type="url"
                      name="facebook"
                      value={profileData.facebook}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-md px-3 py-2"
                      placeholder="https://facebook.com/yourprofile"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Twitter
                    </label>
                    <input
                      type="url"
                      name="twitter"
                      value={profileData.twitter}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-md px-3 py-2"
                      placeholder="https://twitter.com/yourprofile"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      ResearchGate
                    </label>
                    <input
                      type="url"
                      name="researchGate"
                      value={profileData.researchGate}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-md px-3 py-2"
                      placeholder="https://researchgate.net/profile/yourprofile"
                    />
                  </div>
                </div>
              </div>

              {/* Bio, Education and Work Experience Fields */}
              <div>
                <h3 className="font-medium mb-4">Additional Information</h3>

                {/* Bio */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    About Me
                  </label>
                  <textarea
                    name="bio"
                    rows="4"
                    value={profileData.bio}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    placeholder="Write something about yourself..."
                  ></textarea>
                </div>

                {/* Education */}
                <div className="mb-4">
                  <label className="flex text-sm font-medium text-gray-700 mb-1 items-center gap-2">
                    <FaGraduationCap className="text-gray-600" />
                    Education
                  </label>
                  <div className="space-y-4">
                    {(profileData?.education || []).map((edu, index) => (
                      <div key={index} className="border rounded-lg p-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Institution
                            </label>
                            <input
                              type="text"
                              value={edu.institution || ""}
                              onChange={(e) => {
                                const newEducation = [...profileData.education];
                                newEducation[index] = {
                                  ...newEducation[index],
                                  institution: e.target.value,
                                };
                                setProfileData((prev) => ({
                                  ...prev,
                                  education: newEducation,
                                }));
                              }}
                              className="w-full border border-gray-300 rounded-md px-3 py-2"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Department/Subject
                            </label>
                            <input
                              type="text"
                              value={edu.department || ""}
                              onChange={(e) => {
                                const newEducation = [...profileData.education];
                                newEducation[index] = {
                                  ...newEducation[index],
                                  department: e.target.value,
                                };
                                setProfileData((prev) => ({
                                  ...prev,
                                  education: newEducation,
                                }));
                              }}
                              className="w-full border border-gray-300 rounded-md px-3 py-2"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Start Date
                            </label>
                            <input
                              type="date"
                              value={edu.startDate || ""}
                              onChange={(e) => {
                                const newEducation = [...profileData.education];
                                newEducation[index] = {
                                  ...newEducation[index],
                                  startDate: e.target.value,
                                };
                                setProfileData((prev) => ({
                                  ...prev,
                                  education: newEducation,
                                }));
                              }}
                              className="w-full border border-gray-300 rounded-md px-3 py-2"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              End Date
                            </label>
                            <input
                              type="date"
                              value={edu.endDate || ""}
                              disabled={edu.currentlyStudying}
                              onChange={(e) => {
                                const newEducation = [...profileData.education];
                                newEducation[index] = {
                                  ...newEducation[index],
                                  endDate: e.target.value,
                                };
                                setProfileData((prev) => ({
                                  ...prev,
                                  education: newEducation,
                                }));
                              }}
                              className="w-full border border-gray-300 rounded-md px-3 py-2"
                            />
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              id={`currentlyStudying-${index}`}
                              checked={edu.currentlyStudying || false}
                              onChange={(e) => {
                                const newEducation = [...profileData.education];
                                newEducation[index] = {
                                  ...newEducation[index],
                                  currentlyStudying: e.target.checked,
                                  endDate: e.target.checked ? "" : newEducation[index].endDate,
                                };
                                setProfileData((prev) => ({
                                  ...prev,
                                  education: newEducation,
                                }));
                              }}
                              className="mr-2"
                            />
                            <label
                              htmlFor={`currentlyStudying-${index}`}
                              className="text-sm text-gray-600"
                            >
                              Currently Studying Here
                            </label>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setProfileData((prev) => ({
                                ...prev,
                                education: prev.education.filter((_, i) => i !== index),
                              }));
                            }}
                            className="text-red-500 hover:text-red-700"
                          >
                            <FaTimes />
                          </button>
                        </div>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => {
                        setProfileData((prev) => ({
                          ...prev,
                          education: [
                            ...prev.education,
                            {
                              institution: "",
                              department: "",
                              startDate: "",
                              endDate: "",
                              currentlyStudying: false,
                            },
                          ],
                        }));
                      }}
                      className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                    >
                      + Add Education
                    </button>
                  </div>
                </div>

                {/* Work Experience */}
                <div>
                  <label className="flex text-sm font-medium text-gray-700 mb-1 items-center gap-2">
                    <FaBriefcase className="text-gray-600" />
                    Work Experience
                  </label>
                  <div className="space-y-4">
                    {(profileData?.workExperience || []).map((exp, index) => (
                      <div key={index} className="border rounded-lg p-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Organization
                            </label>
                            <input
                              type="text"
                              value={exp.organization || ""}
                              onChange={(e) => {
                                const newExperience = [...profileData.workExperience];
                                newExperience[index] = {
                                  ...newExperience[index],
                                  organization: e.target.value,
                                };
                                setProfileData((prev) => ({
                                  ...prev,
                                  workExperience: newExperience,
                                }));
                              }}
                              className="w-full border border-gray-300 rounded-md px-3 py-2"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Role/Position
                            </label>
                            <input
                              type="text"
                              value={exp.role || ""}
                              onChange={(e) => {
                                const newExperience = [...profileData.workExperience];
                                newExperience[index] = {
                                  ...newExperience[index],
                                  role: e.target.value,
                                };
                                setProfileData((prev) => ({
                                  ...prev,
                                  workExperience: newExperience,
                                }));
                              }}
                              className="w-full border border-gray-300 rounded-md px-3 py-2"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Start Date
                            </label>
                            <input
                              type="date"
                              value={exp.startDate || ""}
                              onChange={(e) => {
                                const newExperience = [...profileData.workExperience];
                                newExperience[index] = {
                                  ...newExperience[index],
                                  startDate: e.target.value,
                                };
                                setProfileData((prev) => ({
                                  ...prev,
                                  workExperience: newExperience,
                                }));
                              }}
                              className="w-full border border-gray-300 rounded-md px-3 py-2"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              End Date
                            </label>
                            <input
                              type="date"
                              value={exp.endDate || ""}
                              disabled={exp.currentlyWorking}
                              onChange={(e) => {
                                const newExperience = [...profileData.workExperience];
                                newExperience[index] = {
                                  ...newExperience[index],
                                  endDate: e.target.value,
                                };
                                setProfileData((prev) => ({
                                  ...prev,
                                  workExperience: newExperience,
                                }));
                              }}
                              className="w-full border border-gray-300 rounded-md px-3 py-2"
                            />
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              id={`currentlyWorking-${index}`}
                              checked={exp.currentlyWorking || false}
                              onChange={(e) => {
                                const newExperience = [...profileData.workExperience];
                                newExperience[index] = {
                                  ...newExperience[index],
                                  currentlyWorking: e.target.checked,
                                  endDate: e.target.checked ? "" : newExperience[index].endDate,
                                };
                                setProfileData((prev) => ({
                                  ...prev,
                                  workExperience: newExperience,
                                }));
                              }}
                              className="mr-2"
                            />
                            <label
                              htmlFor={`currentlyWorking-${index}`}
                              className="text-sm text-gray-600"
                            >
                              Currently Working Here
                            </label>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setProfileData((prev) => ({
                                ...prev,
                                workExperience: prev.workExperience.filter((_, i) => i !== index),
                              }));
                            }}
                            className="text-red-500 hover:text-red-700"
                          >
                            <FaTimes />
                          </button>
                        </div>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => {
                        setProfileData((prev) => ({
                          ...prev,
                          workExperience: [
                            ...prev.workExperience,
                            {
                              organization: "",
                              role: "",
                              startDate: "",
                              endDate: "",
                              currentlyWorking: false,
                            },
                          ],
                        }));
                      }}
                      className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                    >
                      + Add Work Experience
                    </button>
                  </div>
                </div>
              </div>

              {/* Submit Buttons */}
              {/* Update Message */}
              {updateMessage && (
                <div className={`mb-4 p-3 rounded-md text-sm ${
                  updateMessage.includes('successfully') 
                    ? 'bg-green-50 text-green-800 border border-green-200' 
                    : 'bg-red-50 text-red-800 border border-red-200'
                }`}>
                  {updateMessage}
                </div>
              )}

              <div className="flex justify-end gap-4 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  disabled={isUpdating}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isUpdating ? (
                    <>
                      <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Saving...
                    </>
                  ) : (
                    'Save Changes'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
