import { doc, onSnapshot, setDoc } from "firebase/firestore";
import { db } from "./config";

// Poora school data (classes, subjects, teachers, students, tests, marks,
// countdown) is ek hi Firestore document me store hota hai:
// collection "schoolData" -> document "main".
const DOC_REF = doc(db, "schoolData", "main");

// Real-time listener - jaise hi kisi teacher ya admin ne data change kya,
// baaki sab clients par turant update aa jayega.
export function subscribeSchoolData(onData, onError) {
  return onSnapshot(
    DOC_REF,
    (snap) => onData(snap.exists() ? snap.data() : null),
    onError
  );
}

export async function saveSchoolData(data) {
  await setDoc(DOC_REF, data);
}
