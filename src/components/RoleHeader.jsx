import { Link } from "react-router-dom";
import { School, LogOut, ExternalLink } from "lucide-react";
import { useAuth } from "../context/AuthContext";

// Shared header for the Admin and Teacher pages — shows who's logged in,
// a quick link to the public result page, and logout.
export default function RoleHeader({ roleLabel, name }) {
  const { logout } = useAuth();

  return (
    <header className="smrs-no-print px-6 pt-6 pb-4">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-2.5">
          <div
            style={{
              width: 36, height: 36, borderRadius: 10,
              background: "linear-gradient(135deg, var(--emerald), var(--teal))",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}
          >
            <School size={18} color="#04150F" />
          </div>
          <div>
            <h1 className="text-lg" style={{ fontWeight: 700, letterSpacing: "-0.01em" }}>
              Marks &amp; Result System
            </h1>
            <p className="text-xs" style={{ color: "var(--text-soft)" }}>
              {roleLabel}{name ? ` — ${name}` : ""}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link to="/result" target="_blank" className="smrs-btn ghost">
            <ExternalLink size={14} /> Result page
          </Link>
          <button className="smrs-btn ghost" onClick={() => logout()}>
            <LogOut size={14} /> Logout
          </button>
        </div>
      </div>
    </header>
  );
}
