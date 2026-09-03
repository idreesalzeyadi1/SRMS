# Marks & Result System

School ke tests/mid-term/monthly/final-term marks record karne, admin dashboard
se sab kuch dekhne, aur students ka result public link pe check karwane ka
poora project. React + Vite + Tailwind + Firebase (Auth + Firestore).

## Roles

| Role    | Route      | Access                                                        |
|---------|-----------|-----------------------------------------------------------------|
| Admin   | `/admin`   | Login required. Classes/subjects/teachers/students manage karta hai, dashboard dekhta hai, result countdown set karta hai. |
| Teacher | `/teacher` | Login required. Sirf apne allotted subjects ke tests aur marks entry kar sakta hai. |
| Public  | `/result`  | Koi login nahi. Class + naam select karke result dekha ja sakta hai. |
| —       | `/`        | Login page (Admin aur Teacher dono yahin se login karte hain). |

## Folder structure

```
src/
  firebase/
    config.js       -> Firebase app init (reads .env)
    auth.js          -> login/logout/subscribeAuth
    schoolData.js     -> Firestore read/write for the whole dataset
  context/
    AuthContext.jsx        -> current signed-in user
    SchoolDataContext.jsx  -> live school data + persist()
  utils/
    helpers.js   -> constants, uid(), key(), gradeFor(), useCountUp()
    role.js      -> works out admin / teacher / none from the user's email
  components/    -> shared UI (Card, StatTile, ResultCard, CountdownBlock, ProtectedRoute, RoleHeader, Blobs, LoadingScreen)
  pages/
    LoginPage.jsx        -> "/"
    AdminDashboard.jsx   -> "/admin"
    TeacherPanel.jsx     -> "/teacher"
    ResultPage.jsx        -> "/result"
  App.jsx    -> routes + providers
```

## 1. Firebase project setup

1. [Firebase console](https://console.firebase.google.com) me naya project banayein.
2. **Build → Firestore Database → Create database** (production mode).
3. **Build → Authentication → Sign-in method → Email/Password** enable karein.
4. **Build → Authentication → Users → Add user** — apna admin email + password add karein, aur har teacher ke liye bhi ek email + password (temporary) add kar dein. Yehi login credentials teacher ko de dein.
5. **Firestore → Rules** tab me is repo ki `firestore.rules` file ka content paste karke publish kar dein.
6. **Project settings → General → Your apps → Add app (Web)** se config values copy karein.

## 2. Project setup

```bash
npm install
cp .env.example .env
```

`.env` me apna Firebase config aur admin email(s) fill karein:

```
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
VITE_ADMIN_EMAILS=admin@yourschool.com
```

`VITE_ADMIN_EMAILS` comma-separated ho sakti hai agar ek se zyada admin chahiye.

```bash
npm run dev       # local development
npm run build      # production build (dist/ folder)
npm run preview    # preview the production build
```

## 3. Teachers add karna

1. Admin account se `/` par login karein → `/admin` khulega.
2. **Teachers** card me: naam, email (wahi jo Firebase Authentication me bana tha), aur unke subjects select karke **Teacher add karein**.
3. Woh teacher ab apna email/password se `/` par login karega aur seedha `/teacher` pe apne allotted subjects dekhega — dropdown se naam select karne ki zaroorat nahi.

## 4. Result & countdown

- Admin **Result countdown** card me label (e.g. "Mid Term Result") aur announce date/time set karta hai.
- `/result` par abhi tak countdown dikhega; date guzarne ke baad students apni class + naam select karke result dekh/print kar sakte hain.
- `/result` link kahin bhi share kiya ja sakta hai (WhatsApp group, school notice board QR code, etc.) — login ki zaroorat nahi.

## 5. Deploy

Kisi bhi static host pe deploy ho sakta hai (Vercel, Netlify, Firebase Hosting):

```bash
npm run build
```

`dist/` folder ko host kar dein. Environment variables (upar wale sab `VITE_...`) deploy platform ki settings me bhi add karna na bhoolein.

## Data model (Firestore)

Poora data ek hi document me: `schoolData/main`

```
{
  classes: string[],
  subjects: string[],
  teachers: [{ id, name, email, subjects: string[] }],
  studentsByClass: { [className]: string[] },
  testsByClassSubject: { "className||subject": [{ id, type, totalMarks, teacherName, createdAt }] },
  marksByTest: { [testId]: { [studentName]: number } },
  countdown: { label, targetDateTime }
}
```

Chota/medium school ke liye ek document kaafi hai — real-time listener (`onSnapshot`) ki wajah se sab logged-in users (teachers + admin) ko turant update mil jata hai.
