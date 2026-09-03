import { useState } from "react";
import { useSchoolData } from "../context/SchoolDataContext";
import RoleHeader from "../components/RoleHeader";
import LoadingScreen from "../components/LoadingScreen";
import {
  Layers, BookOpen, Users, GraduationCap, ClipboardCheck, Plus,
  Trash2, X, Lock, Eye, EyeOff, BarChart2, Award, Send, CheckCircle2, Clock
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, CartesianGrid
} from "recharts";
import Card from "../components/Card";
import StatTile from "../components/StatTile";
import EmptyNote from "../components/EmptyNote";
import { key, uid, DONUT_COLORS } from "../utils/helpers";

export default function AdminDashboard() {
  const { data, loading, persist } = useSchoolData();

  const [activeTab, setActiveTab] = useState("overview");

  // Form & Input States
  const [newClass, setNewClass] = useState("");
  const [newSubject, setNewSubject] = useState("");
  const [newTeacherName, setNewTeacherName] = useState("");
  const [newTeacherEmail, setNewTeacherEmail] = useState("");
  const [newTeacherPassword, setNewTeacherPassword] = useState("");
  const [newTeacherSubjects, setNewTeacherSubjects] = useState([]);
  const [studentClass, setStudentClass] = useState(data?.classes?.[0] || "");
  const [studentBulk, setStudentBulk] = useState("");

  // Ledger States
  const [selectedTeacherName, setSelectedTeacherName] = useState("");
  const [selectedRecordClass, setSelectedRecordClass] = useState("");
  const [selectedRecordSubject, setSelectedRecordSubject] = useState("");
  const [selectedTestId, setSelectedTestId] = useState("");

  // Result Declaration & Countdown States
  const [selectedClassesToDeclare, setSelectedClassesToDeclare] = useState([]);
  const [termType, setTermType] = useState("Mid Term");
  const [cdLabel, setCdLabel] = useState(data?.countdown?.label || "Mid Term Result Announcement");
  const [cdDate, setCdDate] = useState(data?.countdown?.targetDateTime || "");
  const [publishSuccess, setPublishSuccess] = useState(false);

  if (loading || !data) return <LoadingScreen />;

  const totalTests = Object.values(data.testsByClassSubject || {}).reduce((a, arr) => a + arr.length, 0);
  const totalStudents = Object.values(data.studentsByClass || {}).reduce((a, arr) => a + arr.length, 0);

  const testsPerClass = data.classes.map((c) => ({
    name: c.replace("Class ", "C"),
    tests: data.subjects.reduce((sum, s) => sum + (data.testsByClassSubject[key(c, s)]?.length || 0), 0),
  }));

  const studentsPerClass = data.classes
    .map((c) => ({ name: c, value: (data.studentsByClass[c] || []).length }))
    .filter((d) => d.value > 0);

  function addClass() {
    const trimmed = newClass.trim();
    if (!trimmed || data.classes.includes(trimmed)) return;
    persist({ ...data, classes: [...data.classes, trimmed] });
    setNewClass("");
  }

  function removeClass(classToRemove) {
    const updatedClasses = data.classes.filter((c) => c !== classToRemove);
    persist({ ...data, classes: updatedClasses });
  }

  function addSubject() {
    const trimmed = newSubject.trim();
    if (!trimmed || data.subjects.includes(trimmed)) return;
    persist({ ...data, subjects: [...data.subjects, trimmed] });
    setNewSubject("");
  }

  function removeSubject(subjectToRemove) {
    const updatedSubjects = data.subjects.filter((s) => s !== subjectToRemove);
    persist({ ...data, subjects: updatedSubjects });
  }

  function toggleNewTeacherSubject(s) {
    setNewTeacherSubjects((cur) => (cur.includes(s) ? cur.filter((x) => x !== s) : [...cur, s]));
  }

  function toggleExistingTeacherSubject(teacherId, subjName) {
    const updatedTeachers = data.teachers.map((t) => {
      if (t.id === teacherId) {
        const currentSubjs = t.subjects || [];
        const updatedSubjs = currentSubjs.includes(subjName)
          ? currentSubjs.filter((s) => s !== subjName)
          : [...currentSubjs, subjName];
        return { ...t, subjects: updatedSubjs };
      }
      return t;
    });
    persist({ ...data, teachers: updatedTeachers });
  }

  function addTeacher() {
    if (!newTeacherName.trim() || !newTeacherEmail.trim() || !newTeacherPassword.trim()) return;
    persist({
      ...data,
      teachers: [
        ...data.teachers,
        {
          id: uid("teacher"),
          name: newTeacherName.trim(),
          email: newTeacherEmail.trim().toLowerCase(),
          password: newTeacherPassword.trim(),
          subjects: newTeacherSubjects,
        },
      ],
    });
    setNewTeacherName("");
    setNewTeacherEmail("");
    setNewTeacherPassword("");
    setNewTeacherSubjects([]);
  }

  function removeTeacher(id) { persist({ ...data, teachers: data.teachers.filter((t) => t.id !== id) }); }

  function addStudents() {
    const names = studentBulk.split("\n").map((n) => n.trim()).filter(Boolean);
    if (!studentClass || names.length === 0) return;
    const existing = data.studentsByClass[studentClass] || [];
    const merged = [...existing, ...names.filter((n) => !existing.includes(n))];
    persist({ ...data, studentsByClass: { ...data.studentsByClass, [studentClass]: merged } });
    setStudentBulk("");
  }

  function saveCountdown() {
    persist({
      ...data,
      countdown: { label: cdLabel, targetDateTime: cdDate, active: true },
    });
  }

  function toggleClassSelection(className) {
    setSelectedClassesToDeclare((prev) =>
      prev.includes(className) ? prev.filter((c) => c !== className) : [...prev, className]
    );
  }

  function handleReleaseResult() {
    if (selectedClassesToDeclare.length === 0) return;

    const publishedRecords = data.publishedResults || {};
    const updatedPublished = { ...publishedRecords };

    selectedClassesToDeclare.forEach((cls) => {
      const studentsList = data.studentsByClass[cls] || [];
      const compiledDMC = studentsList.map((studentName) => {
        let grandTotalMax = 0;
        let grandTotalObtained = 0;
        const subjectBreakdown = [];

        data.subjects.forEach((subj) => {
          const tests = data.testsByClassSubject[key(cls, subj)] || [];
          const termTests = tests.filter((t) => !termType || t.type.toLowerCase().includes(termType.toLowerCase()));

          let subjMax = 0;
          let subjObtained = 0;

          termTests.forEach((test) => {
            const mark = data.marksByTest[test.id]?.[studentName];
            if (mark !== undefined && mark !== "") {
              subjMax += Number(test.totalMarks);
              subjObtained += Number(mark);
            }
          });

          if (subjMax > 0) {
            grandTotalMax += subjMax;
            grandTotalObtained += subjObtained;
            subjectBreakdown.push({
              subjectName: subj,
              max: subjMax,
              obtained: subjObtained,
              pct: ((subjObtained / subjMax) * 100).toFixed(0),
            });
          }
        });

        const overallPct = grandTotalMax > 0 ? ((grandTotalObtained / grandTotalMax) * 100).toFixed(1) : 0;
        return {
          studentName,
          grandTotalMax,
          grandTotalObtained,
          overallPct,
          isPassed: overallPct >= 40,
          subjectBreakdown,
        };
      });

      updatedPublished[cls] = {
        term: termType,
        publishedAt: new Date().toLocaleDateString(),
        results: compiledDMC,
      };
    });

    persist({
      ...data,
      publishedResults: updatedPublished,
      countdown: { ...data.countdown, active: false },
    });

    setPublishSuccess(true);
    setSelectedClassesToDeclare([]);
    setTimeout(() => setPublishSuccess(false), 2500);
  }

  // --- DELETE PUBLISHED RESULT HANDLER ---
  function deletePublishedResult(classToDelete) {
    const updatedPublished = { ...(data.publishedResults || {}) };
    delete updatedPublished[classToDelete];

    persist({
      ...data,
      publishedResults: updatedPublished,
    });
  }

  const selectedTeacherObj = data.teachers.find((t) => t.name === selectedTeacherName);
  const selectedRecordKey = key(selectedRecordClass, selectedRecordSubject);
  const availableTestsForSelection = (data.testsByClassSubject[selectedRecordKey] || []).filter(
    (t) => !selectedTeacherName || t.teacherName === selectedTeacherName
  );

  const activeTestObj = availableTestsForSelection.find((t) => t.id === selectedTestId);
  const activeTestMarks = activeTestObj ? data.marksByTest[activeTestObj.id] || {} : {};
  const activeClassStudents = data.studentsByClass[selectedRecordClass] || [];

  const ledgerRows = activeClassStudents.map((studentName) => {
    const val = activeTestMarks[studentName];
    const score = val !== "" && val !== undefined ? Number(val) : null;
    return { name: studentName, score };
  });

  return (
    <>
      <RoleHeader roleLabel="Admin" />
      <main className="max-w-6xl mx-auto px-6 pb-8 space-y-6">
        {/* Navigation Tabs */}
        <div className="flex border-b border-gray-800 gap-6 text-sm font-semibold">
          <button
            className={`pb-3 flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === "overview" ? "border-b-2 border-indigo-500 text-indigo-400" : "text-gray-400 hover:text-gray-200"
            }`}
            onClick={() => setActiveTab("overview")}
          >
            <Layers size={16} /> Admin Management
          </button>
          <button
            className={`pb-3 flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === "records" ? "border-b-2 border-indigo-500 text-indigo-400" : "text-gray-400 hover:text-gray-200"
            }`}
            onClick={() => setActiveTab("records")}
          >
            <BarChart2 size={16} /> Teacher Test History
          </button>
          <button
            className={`pb-3 flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === "results" ? "border-b-2 border-indigo-500 text-indigo-400" : "text-gray-400 hover:text-gray-200"
            }`}
            onClick={() => setActiveTab("results")}
          >
            <Award size={16} /> Declare Result &amp; Countdown
          </button>
        </div>

        {/* Global Stat Tiles */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <StatTile icon={Layers} label="Classes" value={data.classes.length} gradient="linear-gradient(135deg,#6366F1,#8B5CF6)" delay={0} />
          <StatTile icon={BookOpen} label="Subjects" value={data.subjects.length} gradient="linear-gradient(135deg,#06B6D4,#3B82F6)" delay={0.05} />
          <StatTile icon={Users} label="Teachers" value={data.teachers.length} gradient="linear-gradient(135deg,#F59E0B,#F43F5E)" delay={0.1} />
          <StatTile icon={GraduationCap} label="Students" value={totalStudents} gradient="linear-gradient(135deg,#10B981,#06B6D4)" delay={0.15} />
          <StatTile icon={ClipboardCheck} label="Tests Conducted" value={totalTests} gradient="linear-gradient(135deg,#8B5CF6,#F43F5E)" delay={0.2} />
        </div>

        {activeTab === "overview" && (
          <>
            <div className="grid md:grid-cols-2 gap-4">
              <Card title="Tests Conducted per Class" delay={0.05}>
                <div style={{ width: "100%", height: 220 }}>
                  <ResponsiveContainer>
                    <BarChart data={testsPerClass} margin={{ left: -20 }}>
                      <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
                      <XAxis dataKey="name" tick={{ fill: "#5B6478", fontSize: 12 }} axisLine={{ stroke: "#E2E6EF" }} tickLine={false} />
                      <YAxis allowDecimals={false} tick={{ fill: "#5B6478", fontSize: 12 }} axisLine={false} tickLine={false} />
                      <Tooltip contentStyle={{ background: "#FFFFFF", border: "1px solid #E2E6EF", borderRadius: 10, color: "#101528" }} />
                      <Bar dataKey="tests" radius={[6, 6, 0, 0]} fill="#6366F1" isAnimationActive={true} animationDuration={1000} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </Card>

              <Card title="Students per Class" delay={0.1}>
                {studentsPerClass.length === 0 ? (
                  <EmptyNote text="No students added yet." />
                ) : (
                  <div style={{ width: "100%", height: 220 }}>
                    <ResponsiveContainer>
                      <PieChart>
                        <Pie data={studentsPerClass} dataKey="value" nameKey="name" innerRadius={55} outerRadius={82} paddingAngle={3} isAnimationActive={true}>
                          {studentsPerClass.map((_, i) => <Cell key={i} fill={DONUT_COLORS[i % DONUT_COLORS.length]} stroke="none" />)}
                        </Pie>
                        <Tooltip contentStyle={{ background: "#FFFFFF", border: "1px solid #E2E6EF", borderRadius: 10, color: "#101528" }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </Card>
            </div>

            {/* CLASS & SUBJECT MANAGEMENT */}
            <div className="grid md:grid-cols-2 gap-4">
              <Card title="Manage Classes (Add / Delete)" delay={0.05}>
                <div className="flex flex-wrap gap-2 mb-3">
                  {data.classes.map((c) => (
                    <span key={c} className="smrs-chip flex items-center gap-1.5 bg-slate-800 text-gray-200 border border-slate-700 px-2.5 py-1 rounded-md text-xs">
                      {c}
                      <X size={13} className="cursor-pointer text-red-400 hover:text-red-300" onClick={() => removeClass(c)} />
                    </span>
                  ))}
                  {data.classes.length === 0 && <span className="text-xs text-gray-500">No classes added yet.</span>}
                </div>
                <div className="flex gap-2">
                  <input className="smrs-input flex-1" placeholder="New class name (e.g. Grade 9, 10th Science)" value={newClass} onChange={(e) => setNewClass(e.target.value)} />
                  <button className="px-3 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-lg shadow transition-colors cursor-pointer flex items-center justify-center" onClick={addClass}><Plus size={16} /></button>
                </div>
              </Card>

              <Card title="Manage Subjects (Add / Delete)" delay={0.1}>
                <div className="flex flex-wrap gap-2 mb-3">
                  {data.subjects.map((s) => (
                    <span key={s} className="smrs-chip flex items-center gap-1.5 bg-slate-800 text-gray-200 border border-slate-700 px-2.5 py-1 rounded-md text-xs">
                      {s}
                      <X size={13} className="cursor-pointer text-red-400 hover:text-red-300" onClick={() => removeSubject(s)} />
                    </span>
                  ))}
                  {data.subjects.length === 0 && <span className="text-xs text-gray-500">No subjects added yet.</span>}
                </div>
                <div className="flex gap-2">
                  <input className="smrs-input flex-1" placeholder="New subject name (e.g. Computer Science)" value={newSubject} onChange={(e) => setNewSubject(e.target.value)} />
                  <button className="px-3 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-lg shadow transition-colors cursor-pointer flex items-center justify-center" onClick={addSubject}><Plus size={16} /></button>
                </div>
              </Card>
            </div>

            {/* TEACHERS MANAGEMENT */}
            <Card title="Teachers &amp; Subject Allotments" delay={0.05}>
              <div className="space-y-3 mb-4">
                {data.teachers.map((t) => (
                  <div key={t.id} className="p-3 rounded-lg border bg-slate-900/60 border-slate-800">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold text-indigo-300">{t.name}</p>
                        <p className="text-xs text-gray-400">{t.email}</p>
                      </div>
                      <Trash2 size={15} className="cursor-pointer text-red-400 hover:text-red-300" onClick={() => removeTeacher(t.id)} />
                    </div>
                    <div className="mt-2 border-t border-slate-800 pt-2 flex flex-wrap gap-1.5">
                      {data.subjects.map((s) => {
                        const isAssigned = (t.subjects || []).includes(s);
                        return (
                          <span
                            key={s}
                            onClick={() => toggleExistingTeacherSubject(t.id, s)}
                            className={`cursor-pointer text-xs px-2.5 py-1 rounded-md font-medium transition-all ${
                              isAssigned 
                                ? "bg-indigo-600 text-white shadow-sm" 
                                : "bg-slate-800 text-gray-400 border border-slate-700 opacity-60 hover:opacity-100"
                            }`}
                          >
                            {s}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                ))}
                {data.teachers.length === 0 && <EmptyNote text="No teachers added yet." />}
              </div>

              <div className="rounded-lg p-4 bg-slate-900/40 border border-slate-800">
                <h4 className="text-xs font-bold text-gray-300 mb-3">Add New Teacher</h4>
                <div className="grid sm:grid-cols-3 gap-3 mb-3">
                  <input className="smrs-input w-full" value={newTeacherName} onChange={(e) => setNewTeacherName(e.target.value)} placeholder="Teacher Name" />
                  <input type="email" className="smrs-input w-full" value={newTeacherEmail} onChange={(e) => setNewTeacherEmail(e.target.value)} placeholder="Email Address" />
                  <input type="password" className="smrs-input w-full" value={newTeacherPassword} onChange={(e) => setNewTeacherPassword(e.target.value)} placeholder="Assigned Password" />
                </div>
                <label className="block text-xs mb-1 text-gray-400">Select &amp; Allot Initial Subjects</label>
                <div className="flex flex-wrap gap-2 mb-4">
                  {data.subjects.map((s) => (
                    <span 
                      key={s} 
                      className={`cursor-pointer text-xs px-2.5 py-1 rounded-md font-medium transition-all ${
                        newTeacherSubjects.includes(s) 
                          ? "bg-indigo-600 text-white" 
                          : "bg-slate-800 text-gray-400 border border-slate-700"
                      }`} 
                      onClick={() => toggleNewTeacherSubject(s)}
                    >
                      {s}
                    </span>
                  ))}
                </div>
                <button className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold rounded-lg shadow-md transition-all cursor-pointer" onClick={addTeacher}>Add Teacher</button>
              </div>
            </Card>

            {/* STUDENTS MANAGEMENT */}
            <Card title="Students" delay={0.1}>
              <div className="rounded-lg p-4 mb-4 bg-slate-900/40 border border-slate-800">
                <label className="block text-xs mb-1 text-gray-400">Select Class</label>
                <select className="smrs-select w-52 mb-3" value={studentClass} onChange={(e) => setStudentClass(e.target.value)}>
                  {data.classes.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
                <label className="block text-xs mb-1 text-gray-400">Student Names (One per line)</label>
                <textarea className="smrs-input w-full" rows={3} value={studentBulk} onChange={(e) => setStudentBulk(e.target.value)} placeholder={"John Doe\nJane Smith..."} />
                <button className="mt-3 px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold rounded-lg shadow-md transition-all cursor-pointer" onClick={addStudents}>Add Students</button>
              </div>
            </Card>
          </>
        )}

        {/* DECLARE RESULT & COUNTDOWN TAB */}
        {activeTab === "results" && (
          <div className="space-y-6">
            {/* 1. Countdown Setup Card */}
            <Card title="1. Set Result Announcement Countdown" delay={0.05}>
              <div className="flex flex-wrap items-end gap-3">
                <div>
                  <label className="block text-xs mb-1 text-gray-400">Countdown Title / Label</label>
                  <input className="smrs-input w-64" value={cdLabel} onChange={(e) => setCdLabel(e.target.value)} />
                </div>
                <div>
                  <label className="block text-xs mb-1 text-gray-400">Target Date &amp; Time</label>
                  <input type="datetime-local" className="smrs-input" value={cdDate} onChange={(e) => setCdDate(e.target.value)} />
                </div>
                <button 
                  className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold rounded-lg shadow-lg hover:shadow-indigo-500/20 transition-all flex items-center gap-2 cursor-pointer" 
                  onClick={saveCountdown}
                >
                  <Clock size={16} /> Start Countdown Banner
                </button>
              </div>
            </Card>

            {/* 2. Release Result Card */}
            <Card title="2. Select Classes &amp; Publish Result" delay={0.1}>
              <div className="mb-4">
                <label className="block text-xs mb-2 text-gray-400">Select Exam Term</label>
                <select className="smrs-select w-64" value={termType} onChange={(e) => setTermType(e.target.value)}>
                  <option value="Mid Term">Mid Term</option>
                  <option value="Monthly Test">Monthly Tests</option>
                  <option value="Final Term">Final Exam</option>
                </select>
              </div>

              <div className="mb-5">
                <label className="block text-xs mb-2 text-gray-400">Check the classes whose results you wish to publish:</label>
                <div className="flex flex-wrap gap-2.5">
                  {data.classes.map((c) => {
                    const isChecked = selectedClassesToDeclare.includes(c);
                    return (
                      <button
                        key={c}
                        onClick={() => toggleClassSelection(c)}
                        className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 cursor-pointer transition-all border ${
                          isChecked 
                            ? "bg-indigo-600 text-white border-indigo-400 shadow-md shadow-indigo-500/20" 
                            : "bg-slate-800 text-gray-300 border-slate-700 hover:bg-slate-700"
                        }`}
                      >
                        <input type="checkbox" checked={isChecked} onChange={() => {}} className="pointer-events-none accent-indigo-400" />
                        {c}
                      </button>
                    );
                  })}
                </div>
              </div>

              <button
                disabled={selectedClassesToDeclare.length === 0}
                className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-40 text-white font-bold rounded-lg shadow-lg hover:shadow-emerald-500/20 transition-all flex items-center gap-2 cursor-pointer"
                onClick={handleReleaseResult}
              >
                <Send size={16} /> Publish Result &amp; Remove Countdown
              </button>

              {publishSuccess && (
                <div className="mt-4 p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-lg text-sm flex items-center gap-2">
                  <CheckCircle2 size={16} /> Selected Classes result published successfully!
                </div>
              )}
            </Card>

            {/* 3. Published Results History & Delete Card */}
            <Card title="3. Published Results History &amp; Management" delay={0.15}>
              {Object.keys(data.publishedResults || {}).length === 0 ? (
                <EmptyNote text="No results have been declared/published yet." />
              ) : (
                <div className="space-y-3">
                  {Object.entries(data.publishedResults || {}).map(([clsName, info]) => (
                    <div key={clsName} className="flex items-center justify-between p-3.5 rounded-lg bg-slate-900/80 border border-slate-800 shadow-sm">
                      <div>
                        <h4 className="text-sm font-bold text-indigo-300">{clsName}</h4>
                        <p className="text-xs text-gray-400">Exam Term: {info.term} | Released On: {info.publishedAt}</p>
                        <p className="text-xs text-gray-500">{info.results?.length || 0} Students Included</p>
                      </div>

                      <button
                        onClick={() => deletePublishedResult(clsName)}
                        className="px-3 py-1.5 bg-rose-600/20 hover:bg-rose-600/30 border border-rose-500/30 text-rose-400 hover:text-rose-300 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-all cursor-pointer"
                      >
                        <Trash2 size={14} /> Delete Result
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        )}
      </main>
    </>
  );
}