import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { SchoolDataProvider } from "./context/SchoolDataContext";
import ProtectedRoute from "./components/ProtectedRoute";
import LoginPage from "./pages/LoginPage";
import AdminDashboard from "./pages/AdminDashboard";
import TeacherPanel from "./pages/TeacherPanel";
import ResultPage from "./pages/ResultPage";

export default function App() {
  return (
    <AuthProvider>
      <SchoolDataProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<LoginPage />} />
            <Route path="/result" element={<ResultPage />} />
            <Route
              path="/admin"
              element={
                <ProtectedRoute allow="admin">
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/teacher"
              element={
                <ProtectedRoute allow="teacher">
                  <TeacherPanel />
                </ProtectedRoute>
              }
            />
          </Routes>
        </BrowserRouter>
      </SchoolDataProvider>
    </AuthProvider>
  );
}
