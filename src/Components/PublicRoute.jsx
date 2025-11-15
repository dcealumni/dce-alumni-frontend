import { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';

export const PublicRoute = ({ children }) => {
    const { user, loading } = useContext(AuthContext);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600">
                    <span className="sr-only">Loading...</span>
                </div>
            </div>
        );
    }

    if (user && user.emailVerified) {
        return <Navigate to="/" replace />;
    }

    return children;
};