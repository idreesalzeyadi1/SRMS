import React from "react";
import { Printer, Award, CheckCircle2, XCircle } from "lucide-react";

export default function ResultCard({
  label,
  cls,
  student,
  rows = [],
  grandObtained = 0,
  grandTotal = 0,
  pct = 0,
  logoUrl = "/logo.png" // Agar logo image public folder me hai to path yahan dein
}) {
  const percentage = Number(pct).toFixed(1);
  const isPassed = percentage >= 40;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-4xl mx-auto my-6 p-2">
      {/* Action Bar (Print Button) */}
      <div className="flex justify-end mb-4 smrs-no-print">
        <button
          onClick={handlePrint}
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-4 py-2 rounded-lg shadow-md transition-all cursor-pointer text-sm"
        >
          <Printer size={16} /> Print / Save PDF
        </button>
      </div>

      {/* Official DMC Document Frame */}
      <div className="bg-white text-slate-900 rounded-xl p-8 shadow-2xl border-4 border-emerald-900/20 relative overflow-hidden font-sans">
        
        {/* Background Watermark Pattern */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none flex items-center justify-center">
          <div className="w-96 h-96 rounded-full border-[16px] border-emerald-900 flex items-center justify-center">
            <span className="text-6xl font-black text-emerald-900 text-center">GGS</span>
          </div>
        </div>

        {/* Header Section */}
        <header className="border-b-2 border-emerald-800 pb-5 mb-6 text-center relative">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            
            {/* School Crest / Logo Place */}
            <div className="w-20 h-20 flex-shrink-0">
              <img
                src={logoUrl}
                alt="Greenwich Grammar School & College Logo"
                className="w-full h-full object-contain"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.parentElement.innerHTML = `<div class="w-20 h-20 bg-emerald-900 text-amber-400 rounded-full flex items-center justify-center font-bold text-xs text-center border-2 border-amber-400 p-1">GGS PESHAWAR</div>`;
                }}
              />
            </div>

            {/* School Title */}
            <div className="flex-1 text-center">
              <h1 className="text-xl sm:text-2xl font-black text-emerald-950 tracking-wide uppercase">
                GREENWICH GRAMMAR SCHOOL &amp; COLLEGE
              </h1>
              <p className="text-xs font-bold text-emerald-800 uppercase tracking-widest mt-0.5">
                PESHAWAR, KHYBER PAKHTUNKHWA
              </p>
              <div className="mt-2 inline-block bg-emerald-900 text-amber-300 font-bold text-xs uppercase px-4 py-1 rounded-full shadow-sm border border-amber-400/40">
                Detailed Marks Certificate (DMC)
              </div>
            </div>

            <div className="w-20 h-20 hidden sm:block"></div>
          </div>
        </header>

        {/* Student Meta Details Grid */}
        <section className="bg-slate-50 border border-slate-200 rounded-lg p-4 mb-6 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
          <div>
            <span className="text-slate-500 font-medium">Student Name: </span>
            <strong className="text-slate-900 font-bold uppercase ml-1">{student}</strong>
          </div>
          <div>
            <span className="text-slate-500 font-medium">Class / Grade: </span>
            <strong className="text-slate-900 font-bold uppercase ml-1">{cls}</strong>
          </div>
          <div>
            <span className="text-slate-500 font-medium">Examination Session: </span>
            <strong className="text-slate-900 font-bold ml-1">{label || "Annual Examination"}</strong>
          </div>
          <div>
            <span className="text-slate-500 font-medium">Issue Date: </span>
            <strong className="text-slate-900 font-bold ml-1">{new Date().toLocaleDateString("en-GB", { day: 'numeric', month: 'short', year: 'numeric' })}</strong>
          </div>
        </section>

        {/* Marks Table / Ledger */}
        <section className="mb-6 overflow-x-auto">
          <table className="w-full text-left border-collapse border border-slate-300 text-sm">
            <thead>
              <tr className="bg-emerald-950 text-white font-bold uppercase text-xs">
                <th className="p-3 border border-emerald-900">#</th>
                <th className="p-3 border border-emerald-900">Subject</th>
                <th className="p-3 border border-emerald-900">Assessment Type</th>
                <th className="p-3 border border-emerald-900 text-center">Total Marks</th>
                <th className="p-3 border border-emerald-900 text-center">Obtained Marks</th>
                <th className="p-3 border border-emerald-900 text-center">Status</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center p-6 text-slate-500 border border-slate-200">
                    No examination records found for this student.
                  </td>
                </tr>
              ) : (
                rows.map((r, idx) => {
                  const subjectPct = r.total ? (r.obtained / r.total) * 100 : 0;
                  const passedSubject = subjectPct >= 40;
                  return (
                    <tr key={idx} className={idx % 2 === 0 ? "bg-white" : "bg-slate-50/80"}>
                      <td className="p-3 border border-slate-300 font-semibold text-slate-600">{idx + 1}</td>
                      <td className="p-3 border border-slate-300 font-bold text-slate-800">{r.subject}</td>
                      <td className="p-3 border border-slate-300 text-slate-600">{r.testType}</td>
                      <td className="p-3 border border-slate-300 text-center font-medium">{r.total}</td>
                      <td className="p-3 border border-slate-300 text-center font-bold text-slate-900">{r.obtained}</td>
                      <td className="p-3 border border-slate-300 text-center">
                        <span className={`inline-block px-2 py-0.5 text-xs font-bold rounded ${passedSubject ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"}`}>
                          {passedSubject ? "Pass" : "Fail"}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
            {/* Grand Total Row */}
            <tfoot>
              <tr className="bg-slate-100 font-bold text-slate-900 border-t-2 border-slate-400">
                <td colSpan={3} className="p-3 border border-slate-300 text-right uppercase tracking-wider text-xs">
                  Grand Total
                </td>
                <td className="p-3 border border-slate-300 text-center text-emerald-950 font-extrabold">{grandTotal}</td>
                <td className="p-3 border border-slate-300 text-center text-emerald-950 font-extrabold">{grandObtained}</td>
                <td className="p-3 border border-slate-300 text-center"></td>
              </tr>
            </tfoot>
          </table>
        </section>

        {/* Summary Metrics & Remarks */}
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-lg bg-emerald-950 text-white mb-8 shadow-inner">
          <div className="text-center sm:border-r border-emerald-800/80 pr-2">
            <span className="text-xs text-emerald-300 uppercase tracking-widest block mb-1">Percentage</span>
            <span className="text-2xl font-black text-amber-400">{percentage}%</span>
          </div>

          <div className="text-center sm:border-r border-emerald-800/80 pr-2">
            <span className="text-xs text-emerald-300 uppercase tracking-widest block mb-1">Grade / Status</span>
            <div className="flex items-center justify-center gap-1.5">
              {isPassed ? (
                <>
                  <CheckCircle2 size={18} className="text-emerald-400" />
                  <span className="text-lg font-bold text-emerald-300">PASSED</span>
                </>
              ) : (
                <>
                  <XCircle size={18} className="text-rose-400" />
                  <span className="text-lg font-bold text-rose-300">NEEDS IMPROVEMENT</span>
                </>
              )}
            </div>
          </div>

          <div className="text-center">
            <span className="text-xs text-emerald-300 uppercase tracking-widest block mb-1">Overall Performance</span>
            <span className="text-base font-bold text-slate-100">
              {percentage >= 80 ? "Excellent" : percentage >= 60 ? "Good" : percentage >= 40 ? "Satisfactory" : "Unsatisfactory"}
            </span>
          </div>
        </section>

        {/* Official Signatures & Verification Section */}
        <footer className="pt-12 mt-6 border-t border-slate-300 grid grid-cols-2 gap-8 text-center text-xs">
          <div>
            <div className="w-40 border-b-2 border-slate-400 mx-auto mb-1"></div>
            <p className="font-bold text-slate-700 uppercase">Checked By (Teacher)</p>
          </div>

          <div>
            <div className="w-40 border-b-2 border-slate-400 mx-auto mb-1"></div>
            <p className="font-bold text-slate-700 uppercase">Controller of Examinations / Principal</p>
          </div>
        </footer>

        {/* Footer Note */}
        <div className="mt-8 text-center text-[10px] text-slate-400 border-t border-slate-100 pt-2">
          Note: This document is computer-generated by Greenwich Grammar School &amp; College System. Errors and omissions are excepted.
        </div>

      </div>
    </div>
  );
}