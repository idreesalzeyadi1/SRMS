export function getRole(user, data) {
  if (!user || !user.email) return { role: "none" };

  const email = user.email.trim().toLowerCase();

  // Environment variable se fetch karein, fallback ke sath
  const rawAdminEmails = import.meta.env.VITE_ADMIN_EMAILS || "admin@gmail.com";
  const adminEmails = rawAdminEmails
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);

  // 1. Immediate Admin Check
  if (adminEmails.includes(email)) {
    return { role: "admin" };
  }

  // 2. Safe Teacher Check
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