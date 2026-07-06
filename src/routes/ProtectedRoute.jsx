import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { LoadingSpinner } from "../components/ui/Feedback";

/**
 * Gates a route behind authentication and, optionally, one or more allowed roles.
 * Usage: <Route element={<ProtectedRoute role="admin" />}><Route path="/admin" element={<AdminDashboard />} /></Route>
 *        <Route element={<ProtectedRoute role={["seller", "admin"]} />}>...</Route>
 */
export default function ProtectedRoute({ children, role }) {
  const { isAuthenticated, isLoading, role: userRole } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const allowedRoles = Array.isArray(role) ? role : role ? [role] : null;
  // "superadmin" is a wildcard — it satisfies any role-gated route, mirroring the backend's requireRole.
  if (allowedRoles && !allowedRoles.includes(userRole) && userRole !== "superadmin") {
    return <Navigate to="/" replace />;
  }

  return children;
}
