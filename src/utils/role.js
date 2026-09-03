// Works out which role a logged-in Firebase user has, using only data
// already in Firestore — no separate "users" collection needed.
//
// - Admin: email is listed in VITE_ADMIN_EMAILS (.env)
// - Teacher: email matches the "email" field on a teacher record that
//   the admin added from the Admin dashboard's Teachers panel
export function getRole(user, data) {
  if (!user || !data) return { role: "none" };

  const email = (user.email || "").toLowerCase();
  const adminEmails = (import.meta.env.VITE_ADMIN_EMAILS || "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);

  if (adminEmails.includes(email)) {
    return { role: "admin" };
  }

  const teacher = data.teachers.find((t) => (t.email || "").toLowerCase() === email);
  if (teacher) {
    return { role: "teacher", teacher };
  }

  return { role: "none" };
}
