import { Printer } from "lucide-react";
import { gradeFor } from "../utils/helpers";

export default function ResultCard({ label, cls, student, rows, grandObtained, grandTotal, pct }) {
  const grade = gradeFor(pct);
  const gradeColor = grade === "F" ? "var(--bad)" : "var(--good)";

  return (
    <div>
      <div
        className="smrs-print-area smrs-glass smrs-fade p-8"
        style={{ borderTop: "3px solid transparent", borderImage: "linear-gradient(90deg, var(--emerald), var(--cyan)) 1" }}
      >
        <div className="text-center mb-6">
          <p className="text-xs tracking-wide" style={{ color: "var(--text-soft)" }}>School name yahan ayega</p>
          <h2
            className="text-2xl mt-1"
            style={{
              fontWeight: 700,
              background: "linear-gradient(90deg,var(--emerald),var(--cyan))",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            {label}
          </h2>
        </div>

        <div
          className="flex justify-between text-sm mb-5"
          style={{ borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)", padding: "0.6rem 0" }}
        >
          <span><span style={{ color: "var(--text-soft)" }}>Student: </span>{student}</span>
          <span><span style={{ color: "var(--text-soft)" }}>Class: </span>{cls}</span>
        </div>

        {rows.length === 0 ? (
          <p className="text-sm text-center py-6" style={{ color: "var(--text-soft)" }}>
            Is student ke liye abhi tak koi marks entry nahi hui.
          </p>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table className="smrs-ledger mb-5">
              <thead><tr><th>Subject</th><th>Test</th><th>Obtained</th><th>Total</th></tr></thead>
              <tbody>
                {rows.map((r, i) => (
                  <tr key={i}><td>{r.subject}</td><td>{r.testType}</td><td>{r.obtained}</td><td>{r.total}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {rows.length > 0 && (
          <div className="flex items-center justify-between rounded-lg p-4" style={{ background: "rgba(255,255,255,0.03)" }}>
            <div><p className="text-xs" style={{ color: "var(--text-soft)" }}>Total</p><p className="serif text-lg" style={{ fontWeight: 700 }}>{grandObtained} / {grandTotal}</p></div>
            <div><p className="text-xs" style={{ color: "var(--text-soft)" }}>Percentage</p><p className="serif text-lg" style={{ fontWeight: 700 }}>{pct.toFixed(1)}%</p></div>
            <div><p className="text-xs" style={{ color: "var(--text-soft)" }}>Grade</p><p className="serif text-lg" style={{ fontWeight: 800, color: gradeColor }}>{grade}</p></div>
          </div>
        )}

        <div className="flex justify-between mt-10 text-xs" style={{ color: "var(--text-soft)" }}>
          <span>Class Teacher ________________</span>
          <span>Principal ________________</span>
        </div>
      </div>
      <button className="smrs-btn gold smrs-no-print mt-4" onClick={() => window.print()}>
        <Printer size={14} /> Print / Save
      </button>
    </div>
  );
}
