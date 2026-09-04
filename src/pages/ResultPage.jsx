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
  const students = cls && data ? data.studentsByClass?.[cls] || [] : [];

  const rows = useMemo(() => {
    if (!data || !cls || !student) return [];
    const out = [];

    const subjectsList = data.subjects || [];
    const testsObj = data.testsByClassSubject || {};
    const marksObj = data.marksByTest || {};

    subjectsList.forEach((subj) => {
      const tests = testsObj[key(cls, subj)] || [];
      tests.forEach((t) => {
        const studentMarksMap = marksObj[t.id] || {};
        
        const foundKey = Object.keys(studentMarksMap).find(
          (k) => k.trim().toLowerCase() === student.trim().toLowerCase()
        );

        const marks = foundKey ? studentMarksMap[foundKey] : undefined;
        if (marks !== undefined && marks !== null && marks !== "") {
          out.push({
            subject: subj,
            testType: t.type || "Assessment",
            obtained: Number(marks),
            total: Number(t.totalMarks || 100)
          });
        }
      });
    });
    return out;
  }, [cls, student, data]);

  const grandObtained = rows.reduce((a, r) => a + r.obtained, 0);
  const grandTotal = rows.reduce((a, r) => a + r.total, 0);
  const pct = grandTotal ? (grandObtained / grandTotal) * 100 : 0;

  if (loading || !data) return <LoadingScreen />;

  function handleSearchSubmit(e) {
    e.preventDefault();
    setErrorMsg("");

    const trimmedInput = search.trim();
    if (!trimmedInput) return;

    const matchedStudent = students.find(
      (s) => s.trim().toLowerCase() === trimmedInput.toLowerCase()
    );

    if (matchedStudent) {
      setStudent(matchedStudent);
    } else {
      setStudent("");
      setErrorMsg("Student record not found. Please type your exact full name.");
    }
  }

  const shell = (children) => (
    <div className="smrs" style={{ minHeight: 640 }}>
      <Blobs />
      <div className="smrs-content">
        <main className="max-w-5xl mx-auto px-4 py-6">{children}</main>
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
    <div className="space-y-6">
      {/* Permanent Header Section */}
      <header className="bg-white text-slate-900 rounded-2xl p-6 shadow-xl border-2 border-emerald-900/20 text-center relative overflow-hidden font-sans">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="w-20 h-20 flex-shrink-0 relative">
            <svg viewBox="0 0 200 200" className="w-full h-full drop-shadow-md">
              <path d="M100 10 L170 35 V105 C170 150 100 185 100 185 C100 185 30 150 30 105 V35 Z" fill="#881337" stroke="#D97706" strokeWidth="4"/>
              <path d="M100 18 L162 40 V102 C162 142 100 174 100 174 C100 174 38 142 38 102 V40 Z" fill="#9F1239"/>
              <line x1="100" y1="40" x2="100" y2="170" stroke="#D97706" strokeWidth="3"/>
              <line x1="40" y1="105" x2="160" y2="105" stroke="#D97706" strokeWidth="3"/>
              <path d="M40 25 C70 5 130 5 160 25 L150 38 C125 22 75 22 50 38 Z" fill="#B45309" stroke="#FBBF24" strokeWidth="2"/>
              <text x="100" y="24" fill="#FFFFFF" fontSize="12" fontWeight="bold" textAnchor="middle">I AM TO LEARN</text>
            </svg>
          </div>

          <div className="flex-1 text-center">
            <h1 className="text-xl sm:text-2xl font-black text-emerald-950 tracking-tight uppercase leading-tight">
              GREENWICH GRAMMAR SCHOOL &amp; COLLEGE
            </h1>
            <p className="text-xs font-bold text-emerald-800 tracking-widest uppercase mt-0.5">
              PESHAWAR, KHYBER PAKHTUNKHWA
            </p>
            <div className="mt-2 inline-block bg-gradient-to-r from-emerald-900 to-teal-900 text-amber-300 font-bold text-xs tracking-wider uppercase px-4 py-1 rounded-full shadow border border-amber-400/40">
              MARKS &amp; RESULT PORTAL
            </div>
          </div>

          <div className="w-20 h-20 hidden sm:block"></div>
        </div>
      </header>

      {/* Result Search Control Panel */}
      <Card title="Search Student Result" delay={0.05}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold mb-1 text-gray-300">1. Select Class</label>
            <select
              className="smrs-select w-full"
              value={cls}
              onChange={(e) => {
                setCls(e.target.value);
                setStudent("");
                setSearch("");
                setErrorMsg("");
              }}
            >
              <option value="">-- Choose Class --</option>
              {(data.classes || []).map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1 text-gray-300">2. Enter Full Name</label>
            <form onSubmit={handleSearchSubmit} className="flex gap-2">
              <div className="relative flex-1">
                <Search size={14} style={{ position: "absolute", left: 10, top: 11, color: "var(--text-soft)" }} />
                <input
                  disabled={!cls}
                  className="smrs-input w-full"
                  style={{ paddingLeft: 30 }}
                  placeholder={cls ? "Type exact student name..." : "Select class first"}
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setErrorMsg("");
                  }}
                />
              </div>

              <button type="submit" disabled={!cls} className="smrs-btn gold">
                View
              </button>
            </form>
          </div>
        </div>

        {errorMsg && (
          <p className="text-xs font-semibold text-rose-500 pt-2">
            {errorMsg}
          </p>
        )}
      </Card>

      {/* Dynamic Result Card Render */}
      {student && (
        <ResultCard
          label={data.countdown?.label}
          cls={cls}
          student={student}
          rows={rows}
          grandObtained={grandObtained}
          grandTotal={grandTotal}
          pct={pct}
        />
      )}
    </div>
  );
}