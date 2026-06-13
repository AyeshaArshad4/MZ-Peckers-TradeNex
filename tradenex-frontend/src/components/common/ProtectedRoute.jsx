import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';

export default function ProtectedRoute({ children, roles = [] }) {
  const { user, accessToken } = useSelector((s) => s.auth);
  const location = useLocation();

  // Not logged in at all
  if (!accessToken || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Wrong role
  if (roles.length && !roles.includes(user.role)) {
    return <Navigate to="/login" replace />;
  }

  // Customer not yet approved (Admins skip this check)
  if (user.role === 'Customer' && user.approvalStatus !== 'Approved') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#E8E4D1]">
        <div className="card p-8 max-w-md text-center">
          <div className="text-5xl mb-4">⏳</div>
          <h2 className="font-display text-xl font-bold text-[#3F454D] mb-2">Awaiting Approval</h2>
          <p className="text-[#66707A] text-sm">Your account is pending admin approval. You'll be notified once approved.</p>
          <button onClick={() => { localStorage.clear(); window.location.href = '/login'; }}
            className="btn-secondary mt-6">Back to Login</button>
        </div>
      </div>
    );
  }

  return children;
}