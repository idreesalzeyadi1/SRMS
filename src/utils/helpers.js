import { useEffect, useRef, useState } from "react";

export const DEFAULT_DATA = {
  classes: ["Class 6", "Class 7", "Class 8", "Class 9", "Class 10"],
  subjects: [
    "English",
    "Urdu",
    "Mathematics",
    "Physics",
    "Chemistry",
    "Biology",
    "Computer Science",
    "Islamiat",
    "Pakistan Studies",
  ],
  teachers: [],
  studentsByClass: {},
  testsByClassSubject: {},
  marksByTest: {},
  countdown: { label: "Mid Term Result", targetDateTime: "" },
};

export const TEST_TYPES = ["Mid Term", "Monthly Test", "Final Term", "Class Test", "Quiz"];

export const DONUT_COLORS = [
  "#6366F1", "#06B6D4", "#F59E0B", "#F43F5E",
  "#8B5CF6", "#10B981", "#3B82F6", "#FB923C",
];

export function uid(prefix = "id") {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

// Combines a class + subject into the key used across testsByClassSubject.
export function key(cls, subj) {
  return `${cls}||${subj}`;
}

export function gradeFor(pct) {
  if (pct >= 90) return "A+";
  if (pct >= 80) return "A";
  if (pct >= 70) return "B";
  if (pct >= 60) return "C";
  if (pct >= 50) return "D";
  return "F";
}

export function pad(n) {
  return String(n).padStart(2, "0");
}

// Animates a number counting up to `value` whenever it changes.
export function useCountUp(value, duration = 700) {
  const [display, setDisplay] = useState(0);
  const startRef = useRef(null);
  const fromRef = useRef(0);

  useEffect(() => {
    fromRef.current = display; // eslint-disable-line
    startRef.current = null;
    let raf;
    const step = (ts) => {
      if (!startRef.current) startRef.current = ts;
      const p = Math.min(1, (ts - startRef.current) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setDisplay(Math.round(fromRef.current + (value - fromRef.current) * eased));
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return display;
}
