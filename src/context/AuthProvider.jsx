import React, { useEffect, useState } from "react";
import AuthContext from "./AuthContext";
import { 
  createUserWithEmailAndPassword, 
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  sendEmailVerification,
  updateProfile,
  fetchSignInMethodsForEmail
} from "firebase/auth";
import auth from "../firebase/firebase.init";

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tempUserData, setTempUserData] = useState(null);
  
  // Email validation function
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };
  
  // create user with email validation
  const createUser = (email, password) => {
    if (!validateEmail(email)) {
      return Promise.reject(new Error("Invalid email address"));
    }
    
    setLoading(true);
    return createUserWithEmailAndPassword(auth, email, password)
      .then(result => {
        // Store temporary user data
        setTempUserData(result.user);
        
        // Send email verification
        return sendEmailVerification(result.user)
          .then(() => {
            // Sign out immediately so they can't access protected resources
            return signOut(auth).then(() => {
              setLoading(false);
              return { user: result.user, email };
            });
          });
      })
      .catch(error => {
        setLoading(false);
        throw error; // Re-throw the error to be caught in the component
      });
  };

  // sign in user with email validation and check verification
  const signIn = (email, password) => {
    if (!validateEmail(email)) {
      return Promise.reject(new Error("Invalid email address"));
    }
    
    return signInWithEmailAndPassword(auth, email, password)
      .then(result => {
        if (!result.user.emailVerified) {
          setTempUserData(result.user);
          return signOut(auth).then(() => {
            return Promise.reject(new Error("EMAIL_NOT_VERIFIED"));
          });
        }
        return result;
      });
  };

  // Update verifyEmail function to remove console.log
  const verifyEmail = () => {
    if (tempUserData) {
      return signInWithEmailAndPassword(auth, tempUserData.email, "temporary-password")
        .catch(error => {
          // This will fail because we don't know the password, but we just need to access the user
          return sendEmailVerification(tempUserData);
        });
    }
    return Promise.reject(new Error("No user to verify"));
  };

  // check if user exists by email - improved method
  const checkUserExists = (email) => {
    return fetchSignInMethodsForEmail(auth, email)
      .then(methods => {
        // If the array has any elements, the email exists
        return methods.length > 0;
      })
      .catch(() => {
        // For security reasons, return false instead of throwing an error
        return false;
      });
  };

  // Update logOut function
  const logOut = () => {
    setLoading(true);
    setTempUserData(null);
    return signOut(auth)
      .then(() => {
        setUser(null);
        window.location.href = '/login'; // Use window.location for redirect
      });
  };

  // onAuthStateChanged
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, currentUser => {
      // Only set authenticated user if email is verified
      if (currentUser && !currentUser.emailVerified) {
        setTempUserData(currentUser);
        signOut(auth).then(() => {
          setUser(null);
          setLoading(false);
        });
      } else {
        setUser(currentUser);
        setLoading(false);
      }
    });
    return() => {
        unsubscribe();
    };
  }, []);

  const authInfo = {
    user,
    tempUserData,
    loading,
    createUser,
    signIn,
    logOut,
    verifyEmail,
    validateEmail,
    checkUserExists
  };

  return <AuthContext.Provider value={authInfo}>{children}</AuthContext.Provider>;
};

export default AuthProvider;
