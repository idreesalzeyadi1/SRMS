import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useSchoolData } from "../context/SchoolDataContext";
import { getRole } from "../utils/role";
import LoadingScreen from "./LoadingScreen";

// Wrap a page with <ProtectedRoute allow="admin"> or "teacher" — redirects
// to the login page if the signed-in user doesn't have that role.
export default function ProtectedRoute({ allow, children }) {
  const { user, authLoading } = useAuth();
  const { data, loading } = useSchoolData();

  if (authLoading || loading) return <LoadingScreen />;
  if (!user) return <Navigate to="/" replace />;

  const { role } = getRole(user, data);
  if (role !== allow) return <Navigate to="/" replace />;

  return children;
}
