import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { School, LogIn } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useSchoolData } from "../context/SchoolDataContext";
import { getRole } from "../utils/role";
import Blobs from "../components/Blobs";
import LoadingScreen from "../components/LoadingScreen";

export default function LoginPage() {
  const { user, authLoading, login, logout } = useAuth();
  const { data, loading } = useSchoolData();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Once a user is signed in, figure out their role from Firestore data
  // and send them to the right dashboard — or bounce them out if their
  // email isn't registered as an admin or teacher.
  useEffect(() => {
    if (authLoading || loading || !user) return;
    const { role } = getRole(user, data);
    if (role === "admin") navigate("/admin", { replace: true });
    else if (role === "teacher") navigate("/teacher", { replace: true });
    else {
      setError("Aapka account admin ya teacher ke taur par register nahi hai. Admin se contact karein.");
      logout();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, authLoading, loading, data]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await login(email, password);
    } catch (err) {
      setError("Email ya password ghalat hai.");
    } finally {
      setSubmitting(false);
    }
  }

  if (authLoading || loading) return <LoadingScreen />;

  return (
    <div className="smrs flex items-center justify-center" style={{ minHeight: 640 }}>
      <Blobs />
      <div className="smrs-content w-full flex items-center justify-center px-6" style={{ minHeight: 640 }}>
        <div className="smrs-glass smrs-fade p-8 w-full" style={{ maxWidth: 380 }}>
          <div className="flex items-center gap-2.5 mb-6 justify-center">
            <div
              style={{
                width: 40, height: 40, borderRadius: 11,
                background: "linear-gradient(135deg, var(--emerald), var(--teal))",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}
            >
              <School size={20} color="#04150F" />
            </div>
            <div>
              <h1 className="text-base" style={{ fontWeight: 700 }}>Marks &amp; Result System</h1>
              <p className="text-xs" style={{ color: "var(--text-soft)" }}>Admin &amp; Teacher login</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block text-xs mb-1" style={{ color: "var(--text-soft)" }}>Email</label>
              <input
                type="email"
                required
                className="smrs-input w-full"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@school.com"
              />
            </div>
            <div>
              <label className="block text-xs mb-1" style={{ color: "var(--text-soft)" }}>Password</label>
              <input
                type="password"
                required
                className="smrs-input w-full"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>
            {error && <p className="text-sm" style={{ color: "var(--bad)" }}>{error}</p>}
            <button type="submit" disabled={submitting} className="smrs-btn gold w-full justify-center mt-2">
              <LogIn size={15} /> {submitting ? "Sign in ho raha hai..." : "Login"}
            </button>
          </form>

          <p className="text-xs text-center mt-6" style={{ color: "var(--text-faint)" }}>
            Sirf result dekhna hai?{" "}
            <Link to="/result" style={{ color: "var(--teal)", fontWeight: 600 }}>Yahan click karein</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
