import { useContext } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import AuthContext from '../context/AuthContext';

export const PrivateRoute = ({ children }) => {
    const { user, loading } = useContext(AuthContext);
    const location = useLocation();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600">
                    <span className="sr-only">Loading...</span>
                </div>
            </div>
        );
    }

    if (!user || !user.emailVerified) {
        // Redirect to login and save the attempted location
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return children;
};
