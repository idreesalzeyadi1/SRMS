import { useEffect, useMemo, useState } from "react";
import { Search, School, Lock } from "lucide-react";
import Card from "../components/Card";
import EmptyNote from "../components/EmptyNote";
import CountdownBlock from "../components/CountdownBlock";
import ResultCard from "../components/ResultCard";
import LoadingScreen from "../components/LoadingScreen";
import Blobs from "../components/Blobs";
import { useSchoolData } from "../context/SchoolDataContext";
import { key } from "../utils/helpers";

export default function ResultPage() {
  const { data, loading } = useSchoolData();
  const [cls, setCls] = useState("");
  const [search, setSearch] = useState("");
  const [student, setStudent] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  const target = data?.countdown?.targetDateTime ? new Date(data.countdown.targetDateTime).getTime() : null;
  const announced = target !== null && now >= target;
  const students = cls && data ? data.studentsByClass[cls] || [] : [];

  const rows = useMemo(() => {
    if (!data || !announced || !cls || !student) return [];
    const out = [];
    data.subjects.forEach((subj) => {
      const tests = data.testsByClassSubject[key(cls, subj)] || [];
      tests.forEach((t) => {
        const marks = data.marksByTest[t.id]?.[student];
        if (marks !== undefined && marks !== "") {
          out.push({ subject: subj, testType: t.type, obtained: Number(marks), total: t.totalMarks });
        }
      });
    });
    return out;
  }, [announced, cls, student, data]);

  const grandObtained = rows.reduce((a, r) => a + r.obtained, 0);
  const grandTotal = rows.reduce((a, r) => a + r.total, 0);
  const pct = grandTotal ? (grandObtained / grandTotal) * 100 : 0;

  if (loading || !data) return <LoadingScreen />;

  // Form submission logic for exact full name match
  function handleSearchSubmit(e) {
    e.preventDefault();
    setErrorMsg("");

    const trimmedInput = search.trim();
    if (!trimmedInput) return;

    // Check exact name match (case-insensitive)
    const matchedStudent = students.find(
      (s) => s.trim().toLowerCase() === trimmedInput.toLowerCase()
    );

    if (matchedStudent) {
      setStudent(matchedStudent);
    } else {
      setErrorMsg("Student record not found. Please type your exact full name.");
    }
  }

  const shell = (children) => (
    <div className="smrs" style={{ minHeight: 640 }}>
      <Blobs />
      <div className="smrs-content">
        <header className="px-6 pt-6 pb-4 flex items-center gap-2.5">
          <div
            style={{
              width: 36, height: 36, borderRadius: 10,
              background: "linear-gradient(135deg, var(--emerald), var(--teal))",
              display: "flex", itemsCenter: "center", justifyContent: "center",
            }}
          >
            <School size={18} color="#04150F" />
          </div>
          <h1 className="text-lg" style={{ fontWeight: 700, letterSpacing: "-0.01em" }}>
            Marks &amp; Result System
          </h1>
        </header>
        <main className="max-w-6xl mx-auto px-6 pb-8">{children}</main>
      </div>
    </div>
  );

  if (!target) {
    return shell(<EmptyNote text="The result date has not been announced by the admin yet. Please check back later." />);
  }
  if (!announced) {
    return shell(<CountdownBlock label={data.countdown.label} target={target} now={now} />);
  }

  return shell(
    <div className="space-y-5">
      {!student && (
        <>
          <Card title="Select Your Class" delay={0}>
            <select
              className="smrs-select w-64"
              value={cls}
              onChange={(e) => {
                setCls(e.target.value);
                setStudent("");
                setSearch("");
                setErrorMsg("");
              }}
            >
              <option value="">-- Choose Class --</option>
              {data.classes.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </Card>

          {cls && (
            <Card title="Search Your Result" delay={0.05}>
              <form onSubmit={handleSearchSubmit} className="space-y-3">
                <div className="flex flex-wrap items-center gap-3">
                  <div className="relative w-72">
                    <Search size={14} style={{ position: "absolute", left: 10, top: 11, color: "var(--text-soft)" }} />
                    <input
                      className="smrs-input w-full"
                      style={{ paddingLeft: 30 }}
                      placeholder="Enter your exact full name..."
                      value={search}
                      onChange={(e) => {
                        setSearch(e.target.value);
                        setErrorMsg("");
                      }}
                    />
                  </div>

                  <button type="submit" className="smrs-btn gold">
                    View Result
                  </button>
                </div>

                <p className="text-xs text-gray-500 flex items-center gap-1 font-medium pt-1">
                  <Lock size={12} className="text-amber-500" /> For privacy protection, type your exact full name and press View Result.
                </p>

                {errorMsg && (
                  <p className="text-xs font-semibold text-rose-500 pt-1">
                    {errorMsg}
                  </p>
                )}
              </form>
            </Card>
          )}
        </>
      )}

      {student && (
        <div>
          <button
            className="smrs-btn ghost smrs-no-print mb-4"
            onClick={() => {
              setStudent("");
              setSearch("");
              setErrorMsg("");
            }}
          >
            ← Go Back
          </button>
          <ResultCard
            label={data.countdown.label}
            cls={cls}
            student={student}
            rows={rows}
            grandObtained={grandObtained}
            grandTotal={grandTotal}
            pct={pct}
          />
        </div>
      )}
    </div>
  );
}