import { Navigate } from 'react-router-dom';
import { useAuth } from './useAuth';

/**
 * Wrapper component for protected routes
 * Redirects to /login if user is not authenticated
 */
export function ProtectedRoute({ children, requiredRole }) {
  const { isAuthenticated, loading, user } = useAuth();
  const userRole = user?.role || 'user';

  if (loading) {
    return (
      <div className="min-h-screen bg-pixel-darker text-white flex items-center justify-center">
        <div className="text-center">
          <p className="font-pixel text-2xl">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-pixel-darker text-white flex items-center justify-center">
        <div className="text-center">
          <p className="font-pixel text-2xl">Loading...</p>
        </div>
      </div>
    );
  }

  if (requiredRole && userRole !== requiredRole) {
    const redirectPath = userRole === 'admin' ? '/dashboard/admin' : '/dashboard/user';
    return <Navigate to={redirectPath} replace />;
  }

  return children;
}

export default ProtectedRoute;
