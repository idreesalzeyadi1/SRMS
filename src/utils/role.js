// Works out which role a logged-in Firebase user has.
// Admin check works instantly using VITE_ADMIN_EMAILS (.env),
// without waiting for Firestore data to load.
export function getRole(user, data) {
  if (!user || !user.email) return { role: "none" };

  const email = user.email.trim().toLowerCase();

  // 1. Clean Environment Variable Parsing
  const adminEmails = (import.meta.env.VITE_ADMIN_EMAILS || "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);

  // 2. Immediate Admin Check (Data load hone ka wait kiye bina kaam karega)
  if (adminEmails.includes(email)) {
    return { role: "admin" };
  }

  // 3. Safe Teacher Check (Firestore data)
  if (!data || !Array.isArray(data.teachers)) {
    return { role: "none" };
  }

  const teacher = data.teachers.find(
    (t) => (t.email || "").trim().toLowerCase() === email
  );

  if (teacher) {
    return { role: "teacher", teacher };
  }

  return { role: "none" };
}