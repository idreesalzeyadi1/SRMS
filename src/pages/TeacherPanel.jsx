import { useEffect, useState } from "react";
import { Search, Plus, Check, BookOpen, ClipboardCheck, Layers, FileText, BarChart2 } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, CartesianGrid
} from "recharts";
import Card from "../components/Card";
import StatTile from "../components/StatTile";
import EmptyNote from "../components/EmptyNote";
import LoadingScreen from "../components/LoadingScreen";
import RoleHeader from "../components/RoleHeader";
import { useAuth } from "../context/AuthContext";
import { useSchoolData } from "../context/SchoolDataContext";
import { getRole } from "../utils/role";
import { key, uid, TEST_TYPES, DONUT_COLORS } from "../utils/helpers";

export default function TeacherPanel() {
  const { user } = useAuth();
  const { data, loading, persist } = useSchoolData();

  // Mode Selection State ("entry" or "records")
  const [activeTab, setActiveTab] = useState("entry");

  const [subject, setSubject] = useState("");
  const [cls, setCls] = useState("");
  const [newCustomClass, setNewCustomClass] = useState("");
  const [showAddClassInput, setShowAddClassInput] = useState(false);
  const [testId, setTestId] = useState("");
  const [search, setSearch] = useState("");
  const [draft, setDraft] = useState({});
  const [showNewTest, setShowNewTest] = useState(false);
  const [newTestType, setNewTestType] = useState(TEST_TYPES[0]);
  const [newTestTotal, setNewTestTotal] = useState(100);
  const [savedFlash, setSavedFlash] = useState(false);

  // States for Records View
  const [recSubject, setRecSubject] = useState("");
  const [recCls, setRecCls] = useState("");
  const [recTestId, setRecTestId] = useState("");

  const { teacher } = data ? getRole(user, data) : {};

  // Safe Fallbacks for Data Structures
  const safeClasses = data?.classes || [];
  const safeTestsByClassSubject = data?.testsByClassSubject || {};
  const safeStudentsByClass = data?.studentsByClass || {};
  const safeMarksByTest = data?.marksByTest || {};

  // Compute teacher-specific test statistics for Recharts
  const testsPerClassData = data && teacher ? safeClasses.map((c) => {
    let count = 0;
    (teacher.subjects || []).forEach((s) => {
      const tests = safeTestsByClassSubject[key(c, s)] || [];
      count += tests.filter((t) => t.teacherName === teacher.name || !t.teacherName).length;
    });
    return { name: c, tests: count };
  }).filter((item) => item.tests > 0) : [];

  const totalMyTests = testsPerClassData.reduce((acc, curr) => acc + curr.tests, 0);

  const testsForKey = data && cls && subject ? safeTestsByClassSubject[key(cls, subject)] || [] : [];
  const selectedTest = testsForKey.find((t) => t.id === testId);
  const students = data && cls ? safeStudentsByClass[cls] || [] : [];
  const filteredStudents = students.filter((s) => s.toLowerCase().includes(search.toLowerCase()));

  // Records View calculations
  const recTestsForKey = data && recCls && recSubject ? safeTestsByClassSubject[key(recCls, recSubject)] || [] : [];
  const recSelectedTest = recTestsForKey.find((t) => t.id === recTestId);
  const recMarks = recSelectedTest?.id ? safeMarksByTest[recSelectedTest.id] || {} : {};
  const recStudents = data && recCls ? safeStudentsByClass[recCls] || [] : [];

  const recScores = recStudents.map((studentName) => {
    const markVal = recMarks[studentName];
    const score = markVal !== "" && markVal !== undefined ? Number(markVal) : null;
    return { name: studentName, score };
  });

  const validScores = recScores.filter((item) => item.score !== null).map((i) => i.score);
  const highestMark = validScores.length > 0 ? Math.max(...validScores) : 0;
  const avgMark = validScores.length > 0 ? (validScores.reduce((a, b) => a + b, 0) / validScores.length).toFixed(1) : 0;

  useEffect(() => {
    if (!data || !selectedTest?.id) { setDraft({}); return; }
    const existing = safeMarksByTest[selectedTest.id] || {};
    const merged = {};
    students.forEach((s) => { merged[s] = existing[s] ?? ""; });
    setDraft(merged);
  }, [testId, data, selectedTest?.id]);

  if (loading || !data) return <LoadingScreen />;

  function handleAddTeacherClass() {
    const trimmedClass = newCustomClass.trim();
    if (!trimmedClass) return;

    if (!safeClasses.includes(trimmedClass)) {
      persist({
        ...data,
        classes: [...safeClasses, trimmedClass],
      });
    }

    setCls(trimmedClass);
    setNewCustomClass("");
    setShowAddClassInput(false);
    setTestId("");
    setShowNewTest(false);
  }

  function addTest() {
    if (!cls || !subject || !newTestTotal) return;
    const test = {
      id: uid("test"),
      type: newTestType,
      totalMarks: Number(newTestTotal),
      teacherName: teacher?.name || "",
      createdAt: new Date().toISOString(),
    };
    const k = key(cls, subject);
    persist({
      ...data,
      testsByClassSubject: { 
        ...safeTestsByClassSubject, 
        [k]: [...(safeTestsByClassSubject[k] || []), test] 
      },
    });
    setTestId(test.id);
    setShowNewTest(false);
    setNewTestTotal(100);
  }

  function saveMarks() {
    if (!selectedTest?.id) return;
    persist({ 
      ...data, 
      marksByTest: { 
        ...safeMarksByTest, 
        [selectedTest.id]: { ...draft } 
      } 
    });
    setSavedFlash(true);
    setTimeout(() => setSavedFlash(false), 1800);
  }

  if (!teacher) {
    return (
      <>
        <RoleHeader roleLabel="Teacher" />
        <main className="max-w-6xl mx-auto px-6 pb-8">
          <EmptyNote text="Your teacher record was not found. Please contact Admin." />
        </main>
      </>
    );
  }

  return (
    <>
      <RoleHeader roleLabel="Teacher" name={teacher.name} />
      <main className="max-w-6xl mx-auto px-6 pb-8 space-y-5">
        {/* Navigation Tabs */}
        <div className="flex border-b border-gray-800 gap-6 text-sm font-semibold">
          <button
            className={`pb-3 flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === "entry"
                ? "border-b-2 border-indigo-500 text-indigo-400"
                : "text-gray-400 hover:text-gray-200"
            }`}
            onClick={() => setActiveTab("entry")}
          >
            <FileText size={16} /> Marks Entry Mode
          </button>
          <button
            className={`pb-3 flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === "records"
                ? "border-b-2 border-indigo-500 text-indigo-400"
                : "text-gray-400 hover:text-gray-200"
            }`}
            onClick={() => setActiveTab("records")}
          >
            <BarChart2 size={16} /> Test Records &amp; Ledger
          </button>
        </div>

        {/* Top Summary Stat Tiles */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <StatTile icon={BookOpen} label="Allotted Subjects" value={teacher.subjects?.length || 0} gradient="linear-gradient(135deg,#06B6D4,#3B82F6)" delay={0} />
          <StatTile icon={ClipboardCheck} label="Total Tests Conducted" value={totalMyTests} gradient="linear-gradient(135deg,#8B5CF6,#F43F5E)" delay={0.05} />
          <StatTile icon={Layers} label="Classes Covered" value={testsPerClassData.length} gradient="linear-gradient(135deg,#10B981,#06B6D4)" delay={0.1} />
        </div>

        {activeTab === "entry" ? (
          <>
            {/* Recharts Analytics Section */}
            <div className="grid md:grid-cols-2 gap-4">
              <Card title="Conducted Tests per Class" delay={0.05}>
                {testsPerClassData.length === 0 ? (
                  <EmptyNote text="No tests conducted in any class yet." />
                ) : (
                  <div style={{ width: "100%", height: 220 }}>
                    <ResponsiveContainer>
                      <BarChart data={testsPerClassData} margin={{ left: -20, top: 10 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
                        <XAxis dataKey="name" tick={{ fill: "#94A3B8", fontSize: 12 }} axisLine={{ stroke: "#334155" }} tickLine={false} />
                        <YAxis allowDecimals={false} tick={{ fill: "#94A3B8", fontSize: 12 }} axisLine={false} tickLine={false} />
                        <Tooltip
                          contentStyle={{ background: "#0F172A", border: "1px solid #334155", borderRadius: 10, color: "#F8FAFC" }}
                          cursor={{ fill: "rgba(99,102,241,0.12)" }}
                        />
                        <Bar
                          dataKey="tests"
                          radius={[6, 6, 0, 0]}
                          fill="#6366F1"
                          isAnimationActive={true}
                          animationDuration={1200}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </Card>

              <Card title="Test Distribution by Class" delay={0.1}>
                {testsPerClassData.length === 0 ? (
                  <EmptyNote text="Chart will update as soon as you conduct tests." />
                ) : (
                  <div style={{ width: "100%", height: 220 }}>
                    <ResponsiveContainer>
                      <PieChart>
                        <Pie
                          data={testsPerClassData}
                          dataKey="tests"
                          nameKey="name"
                          innerRadius={50}
                          outerRadius={75}
                          paddingAngle={4}
                          isAnimationActive={true}
                          animationDuration={1000}
                        >
                          {testsPerClassData.map((_, i) => (
                            <Cell key={i} fill={DONUT_COLORS[i % DONUT_COLORS.length]} stroke="none" />
                          ))}
                        </Pie>
                        <Tooltip contentStyle={{ background: "#0F172A", border: "1px solid #334155", borderRadius: 10, color: "#F8FAFC" }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </Card>
            </div>

            {/* Subjects Selection */}
            <Card title="Allotted Subjects (Assigned by Admin)" delay={0.05}>
              {(!teacher.subjects || teacher.subjects.length === 0) ? (
                <p className="text-sm text-gray-400">
                  No subjects allotted to you yet. Please request Admin to assign subjects.
                </p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {teacher.subjects.map((s) => (
                    <span
                      key={s}
                      className={`cursor-pointer text-xs px-3 py-1.5 rounded-lg font-semibold transition-all ${
                        subject === s
                          ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/20"
                          : "bg-slate-800 text-gray-300 border border-slate-700 hover:bg-slate-700"
                      }`}
                      onClick={() => { setSubject(s); setCls(""); setTestId(""); setShowNewTest(false); }}
                    >
                      {s}
                    </span>
                  ))}
                </div>
              )}
            </Card>

            {/* Class Selection & Custom Class Addition */}
            {subject && (
              <Card title="Select Class (or Add Custom Class)" delay={0.05}>
                <div className="flex flex-wrap gap-3 items-center">
                  <select className="smrs-select w-64" value={cls} onChange={(e) => { setCls(e.target.value); setTestId(""); setShowNewTest(false); }}>
                    <option value="">-- Select Class --</option>
                    {safeClasses.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>

                  <button
                    className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-gray-200 border border-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
                    onClick={() => setShowAddClassInput(!showAddClassInput)}
                  >
                    <Plus size={14} /> Add New Class
                  </button>
                </div>

                {showAddClassInput && (
                  <div className="mt-3 p-3 rounded-lg flex items-center gap-2 bg-slate-900/60 border border-slate-800">
                    <input
                      type="text"
                      className="smrs-input w-60"
                      placeholder="e.g. Grade 10 ICT"
                      value={newCustomClass}
                      onChange={(e) => setNewCustomClass(e.target.value)}
                    />
                    <button 
                      className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold rounded-lg shadow-md transition-all cursor-pointer text-xs" 
                      onClick={handleAddTeacherClass}
                    >
                      Save &amp; Select Class
                    </button>
                  </div>
                )}
              </Card>
            )}

            {/* Tests Entry Controls */}
            {subject && cls && (
              <Card title={`${subject} — Tests for ${cls}`} delay={0.05}>
                <div className="flex flex-wrap gap-2 mb-3">
                  {testsForKey.map((t) => (
                    <span 
                      key={t.id} 
                      className={`cursor-pointer text-xs px-3 py-1.5 rounded-lg font-semibold transition-all ${
                        testId === t.id 
                          ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/20" 
                          : "bg-slate-800 text-gray-300 border border-slate-700 hover:bg-slate-700"
                      }`} 
                      onClick={() => setTestId(t.id)}
                    >
                      {t.type} · /{t.totalMarks}
                    </span>
                  ))}
                  <span 
                    className="cursor-pointer text-xs px-3 py-1.5 rounded-lg font-semibold bg-emerald-600/20 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-600/30 flex items-center gap-1 transition-all" 
                    onClick={() => setShowNewTest((v) => !v)}
                  >
                    <Plus size={13} /> New Test
                  </span>
                </div>

                {showNewTest && (
                  <div className="rounded-lg p-4 flex flex-wrap items-end gap-3 bg-slate-900/60 border border-slate-800">
                    <div>
                      <label className="block text-xs mb-1 text-gray-400">Test Type</label>
                      <select className="smrs-select" value={newTestType} onChange={(e) => setNewTestType(e.target.value)}>
                        {TEST_TYPES.map((tt) => <option key={tt} value={tt}>{tt}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs mb-1 text-gray-400">Total Marks</label>
                      <input type="number" className="smrs-input w-28" value={newTestTotal} onChange={(e) => setNewTestTotal(e.target.value)} />
                    </div>
                    <button 
                      className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold rounded-lg shadow-md transition-all cursor-pointer text-xs" 
                      onClick={addTest}
                    >
                      Add Test
                    </button>
                  </div>
                )}
              </Card>
            )}

            {/* Student Marks Entry Table */}
            {selectedTest && (
              <Card title={`${selectedTest.type} — Marks Entry (/${selectedTest.totalMarks})`} delay={0.05}>
                {students.length === 0 ? (
                  <EmptyNote text={`No students found in ${cls}. Please add students from Admin tab.`} />
                ) : (
                  <>
                    <div className="relative mb-3 w-72">
                      <Search size={14} className="absolute left-2.5 top-3 text-gray-400" />
                      <input
                        className="smrs-input w-full pl-8"
                        placeholder="Search student name..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                      />
                    </div>
                    <div style={{ overflowX: "auto" }}>
                      <table className="smrs-ledger">
                        <thead><tr><th>Student Name</th><th style={{ width: 140 }}>Marks Obtained</th></tr></thead>
                        <tbody>
                          {filteredStudents.length === 0 ? (
                            <tr><td colSpan={2} className="text-center text-xs py-3 text-gray-400">No matching student found</td></tr>
                          ) : (
                            filteredStudents.map((s) => (
                              <tr key={s}>
                                <td>{s}</td>
                                <td>
                                  <input
                                    type="number"
                                    min={0}
                                    max={selectedTest.totalMarks}
                                    className="smrs-input w-24"
                                    value={draft[s] ?? ""}
                                    onChange={(e) => setDraft((d) => ({ ...d, [s]: e.target.value }))}
                                  />
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                    <div className="flex items-center gap-3 mt-4">
                      <button 
                        className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-lg shadow-lg transition-all cursor-pointer text-xs" 
                        onClick={saveMarks}
                      >
                        Save Marks
                      </button>
                      {savedFlash && <span className="text-sm font-semibold flex items-center gap-1 text-emerald-400"><Check size={16} /> Saved</span>}
                    </div>
                  </>
                )}
              </Card>
            )}
          </>
        ) : (
          /* Test Records & History Tab */
          <div className="space-y-5">
            <Card title="Search Previous Tests &amp; Records" delay={0.05}>
              <div className="grid sm:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="block text-xs mb-1 text-gray-400">1. Select Subject</label>
                  <select
                    className="smrs-select w-full"
                    value={recSubject}
                    onChange={(e) => { setRecSubject(e.target.value); setRecCls(""); setRecTestId(""); }}
                  >
                    <option value="">-- Choose Subject --</option>
                    {(teacher.subjects || []).map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs mb-1 text-gray-400">2. Select Class</label>
                  <select
                    className="smrs-select w-full"
                    disabled={!recSubject}
                    value={recCls}
                    onChange={(e) => { setRecCls(e.target.value); setRecTestId(""); }}
                  >
                    <option value="">-- Choose Class --</option>
                    {safeClasses.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs mb-1 text-gray-400">3. Select Test Record</label>
                  <select
                    className="smrs-select w-full"
                    disabled={!recCls}
                    value={recTestId}
                    onChange={(e) => setRecTestId(e.target.value)}
                  >
                    <option value="">-- Choose Test --</option>
                    {recTestsForKey.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.type} (Total: {t.totalMarks})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </Card>

            {recSelectedTest ? (
              <Card title={`Test Ledger: ${recSubject} — ${recCls} (${recSelectedTest.type})`} delay={0.1}>
                {/* Summary Metrics */}
                <div className="grid grid-cols-3 gap-3 mb-5 p-3 rounded-lg bg-slate-900/60 border border-slate-800">
                  <div>
                    <p className="text-xs text-gray-400">Total Students</p>
                    <p className="text-lg font-bold text-indigo-400">{recStudents.length}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Highest Score</p>
                    <p className="text-lg font-bold text-emerald-400">{highestMark} / {recSelectedTest.totalMarks}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Average Score</p>
                    <p className="text-lg font-bold text-amber-400">{avgMark}</p>
                  </div>
                </div>

                {/* Ledger Table */}
                <div style={{ overflowX: "auto" }}>
                  <table className="smrs-ledger">
                    <thead>
                      <tr>
                        <th>Student Name</th>
                        <th>Marks Obtained</th>
                        <th>Percentage</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recScores.map((item) => {
                        const scoreDisplay = item.score !== null ? item.score : "N/A";
                        const pct = item.score !== null ? ((item.score / recSelectedTest.totalMarks) * 100).toFixed(0) : null;
                        const isPass = pct !== null ? pct >= 40 : false;

                        return (
                          <tr key={item.name}>
                            <td className="font-medium">{item.name}</td>
                            <td>{scoreDisplay} / {recSelectedTest.totalMarks}</td>
                            <td>{pct !== null ? `${pct}%` : "—"}</td>
                            <td>
                              {pct === null ? (
                                <span className="text-gray-500 text-xs">Unmarked</span>
                              ) : isPass ? (
                                <span className="text-emerald-400 text-xs font-semibold px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">Passed</span>
                              ) : (
                                <span className="text-rose-400 text-xs font-semibold px-2 py-0.5 rounded bg-rose-500/10 border border-rose-500/20">Needs Improvement</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </Card>
            ) : (
              <EmptyNote text="Select Subject, Class, and Test from drop-downs to view records." />
            )}
          </div>
        )}
      </main>
    </>
  );
}