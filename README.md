# JEE Academy Portal - MERN Stack Web Application

A full-stack web application designed for a premier IIT-JEE coaching institute. The portal features a timed **Tuesday & Saturday Test Series**, real-time answer autosaving, **automatic competition rankings (1, 2, 2, 4)**, comprehensive **PCM study material distribution**, **student progress analytics**, a **daily study planner**, **manual fee accounting in integer paise**, and **official examination announcements** (NTA, JEE Advanced, CBSE).

---

## 1. Technology Stack

- **Frontend (`client`)**:
  - React 18 with Vite
  - Tailwind CSS (Navy Blue `#0a192f`, White, and Teal `#0d9488` color palette)
  - React Router v6 (Nested role-based routing and protection)
  - Axios (Configured with credentials and automatic CSRF header handling)
  - Recharts (Performance trends, percentage scores, subject breakdowns)
  - Lucide React (Clean, modern iconography)
  - Inter typography via Google Fonts

- **Backend (`server`)**:
  - Node.js (ES Modules) & Express.js
  - MongoDB with Mongoose ODM (Includes embedded `mongodb-memory-server` fallback for zero-configuration execution)
  - JWT Authentication using secure HTTP-only cookies (`token`)
  - CSRF Token verification (`csrf_token` cookie and `X-CSRF-Token` header)
  - bcryptjs password hashing
  - Multer for secure file uploads with MIME validation and directory scoping
  - Express Rate Limiting on authentication endpoints

---

## 2. Project Directory Structure

```
c:\Wisdom_Tutorials\
├── package.json               # Root scripts for client, server, seed, test, and build
├── README.md                  # Comprehensive system documentation
│
├── client\                    # React + Vite Frontend
│   ├── package.json
│   ├── vite.config.js         # API proxy configured to http://localhost:5000
│   ├── tailwind.config.js     # Custom Navy & Teal design palette
│   ├── postcss.config.js
│   ├── index.html             # SEO meta tags and Google Fonts Inter
│   ├── .env.example
│   └── src\
│       ├── api\
│       │   └── apiClient.js   # Axios instance with credentials & CSRF interceptor
│       ├── context\
│       │   ├── AuthContext.jsx # User state, login/logout, session refresh
│       │   └── ToastContext.jsx# Sleek feedback notifications
│       ├── components\
│       │   ├── common\        # Badge, Modal, ConfirmDialog, StatCard, EmptyState, etc.
│       │   └── layout\        # Navbar, Footer, Sidebar, Header, ProtectedRoute
│       └── pages\
│           ├── public\        # Home, Courses, About, Contact, Login, Register, EnrollmentStatus
│           ├── student\       # Dashboard, Tests, TestTaking, Results, Progress, Materials, Planner, Fees, Announcements, Profile
│           ├── teacher\       # Dashboard, Batches, Students, Tests, CreateTest, Results, Materials, Fees
│           └── admin\         # Dashboard, Enrollments, Users, Courses, Batches, Fees, Announcements, Inquiries, Reports
│
└── server\                    # Express + MongoDB Backend
    ├── package.json
    ├── .env.example           # Example environment configuration
    ├── .env                   # Local configuration
    ├── uploads\               # Configurable directory for uploaded materials
    └── src\
        ├── server.js          # Express app entry, middleware, CORS, rate limits
        ├── config\
        │   ├── constants.js   # Roles, subjects, statuses, exam organizations
        │   └── db.js          # MongoDB connection with MongoMemoryServer fallback
        ├── middleware\
        │   ├── auth.js        # JWT verify, role guard, batch authorization, CSRF check
        │   ├── upload.js      # Multer storage, size limits, filetype checks
        │   └── errorHandler.js# Centralized error mapping
        ├── models\            # 14 Mongoose Schema models
        ├── controllers\       # Business logic controllers
        ├── routes\            # RESTful Express route definitions
        ├── utils\             # Competition ranking, Asia/Kolkata date helpers, audit logger
        ├── scripts\
        │   └── seed.js        # Realistic demonstration dataset generator
        └── tests\
            ├── runAllTests.js # Automated unit & integration tests
            └── testLiveEndpoints.js # Live HTTP endpoint integration checks
```

---

## 3. Demonstration Accounts & Credentials

The portal is seeded with realistic demonstration accounts. The login screen (`/login`) includes **1-Click Demo Fill buttons** for rapid testing:

| Role | Account Name | Email | Password | Details / Status |
| :--- | :--- | :--- | :--- | :--- |
| **Admin** | Dr. Vikram Malhotra | `admin@jeeacademy.com` | `Admin@123` | Full academy administrative control |
| **Teacher** | Prof. Harish Verma | `verma.physics@jeeacademy.com` | `Teacher@123` | Senior Physics Faculty (Batch Alpha & Beta) |
| **Teacher** | Prof. Rajesh Sharma | `sharma.maths@jeeacademy.com` | `Teacher@123` | Senior Mathematics Faculty (Batch Alpha) |
| **Student** | Aarav Patel | `aarav.patel@student.com` | `Student@123` | Batch Alpha (Morning) • Fees Paid in Full |
| **Student** | Ananya Sharma | `ananya.sharma@student.com` | `Student@123` | Batch Alpha • Partial Fees • Declining Score Demo |
| **Student** | Rohan Gupta | `rohan.gupta@student.com` | `Student@123` | Batch Alpha • Overdue Installment Demo |
| **Student** | Kavya Sen | `kavya.sen@student.com` | `Student@123` | Application Pending Admin Approval |
| **Student** | Rahul Bose | `rahul.bose@student.com` | `Student@123` | Application Rejected with Feedback |

*Note: All demo student accounts use password `Student@123`.*

---

## 4. Installation & Local Setup

### Prerequisites
- **Node.js**: v18+ (tested on Node v24.14.1)
- **npm**: v9+ (tested on npm 11.12.1)
- **MongoDB**: Optional. If a local MongoDB instance is running at `mongodb://127.0.0.1:27017/jee_academy`, the app connects to it automatically. If not, the server seamlessly initializes an embedded in-memory database using `mongodb-memory-server` without any configuration required.

### Step 1: Install Dependencies
Run npm install in both `server` and `client` directories:
```powershell
# In server directory
cd server
npm install

# In client directory
cd ../client
npm install
```

### Step 2: Configure Environment Variables
Verify `.env` in `server/`:
```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://127.0.0.1:27017/jee_academy
JWT_SECRET=jee_academy_jwt_secret_dev_key_2026_xyz
JWT_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:5173,http://127.0.0.1:5173
UPLOAD_DIR=uploads
```

### Step 3: Populate Demonstration Database
Run the seed script to populate realistic courses, cohorts, mock tests, fee accounts, and planner tasks:
```powershell
cd server
npm run seed
```

### Step 4: Run Applications Locally

**Terminal 1 — Backend API Server (Port 5000):**
```powershell
cd server
npm run dev
# Server runs at http://localhost:5000
```

**Terminal 2 — Frontend Client (Port 5173):**
```powershell
cd client
npm run dev
# App opens at http://localhost:5173
```

---

## 5. Core System Specifications & Rules

### A. Tuesday & Saturday Test Series
1. **Schedule**: Tests are scheduled on Tuesdays and Saturdays by default. Dates and times are stored in UTC and computed/rendered in **Asia/Kolkata (IST)**.
2. **Access Windows**: Tests open at the configured start time and close at `scheduledStartTime + durationMinutes`.
3. **Late Entrants**: A late student entering an active test receives only the remaining scheduled time. Attempts are blocked once the duration expires.
4. **Question Format**: Single-correct MCQs with 4 options (A, B, C, D). Questions and marking schemes lock once the test begins.
5. **Autosave & Finalization**: Selected options and review flags autosave to the backend. If time runs out, attempts automatically finalize on the server.
6. **One Attempt Constraint**: Enforced by a unique compound database index on `{ student: 1, test: 1 }`.

### B. Automatic Scoring & Competition Rankings
- **Scoring Scheme**:
  - Correct answer: `+marks` (Default: +4)
  - Incorrect answer: `-penalty` (Default: -1)
  - Unanswered: `0`
- **Competition Ranking Rule**:
  - Uses standard competition ranking (`1, 2, 2, 4`).
  - Ties are **never broken by submission speed**.
  - Absent students are displayed separately without an assigned rank.
- **Answer Release**: Correct options and explanations remain hidden from students until results are published by faculty.

### C. Declining Performance Monitoring Rule
In the Teacher Dashboard, students with declining recent performance are detected using the following rule:
> **Documented Rule**: A student is flagged as having declining recent performance if they have completed at least 2 tests and their percentage score on their most recent test dropped by **5.0% or more** compared to their previous test.

### D. Fee Management
- Monetary values are stored consistently in **integer paise** (1 INR = 100 paise) to prevent floating-point inaccuracies.
- **Derived Balances**: Paid amount is calculated from the sum of non-cancelled payment records; balance is calculated as `totalAgreedFee - paidAmount`.
- **Derived Overdue**: Computed by checking installment due dates against cumulative payments.
- **Permissions**: Students see their own fee history. Teachers have read-only batch fee views. Only Admins can configure schedules, record payments, and cancel erroneous receipts with audit logs.

### E. Enrollment Workflow
- Public registration creates **Student** accounts only.
- Unapproved students are guided to the `/enrollment-status` screen and cannot access batch resources.
- Admins review applications:
  - **Approve**: Assigns active batch, initializes student fee schedule, and unlocks portal access.
  - **Reject**: Records formal feedback explanation viewable by the candidate.

---

## 6. Automated Testing & Verification

Run the test suite in the `server` directory:
```powershell
cd server
npm test
```

### Verified Test Cases (12/12 Passed):
1. **Scoring**: Correct marking (+4), penalties (-1), and unanswered (0).
2. **Negative Marking**: Preservation of negative total scores without truncation.
3. **Competition Rankings**: Correct competition ranking (`1, 2, 2, 4`) with tied scores.
4. **Tie Handling**: Speed does not break ties.
5. **Test Boundaries**: Future start times rejected.
6. **Test Expiry**: Concluded test windows rejected.
7. **Late Entrant Calculations**: Accurate remaining time deduction.
8. **Fee Balances**: Installment calculations, partial payments, and overdue amounts.
9. **Public Registration Security**: Role escalation blocked (students only).
10. **Batch Access Restrictions**: Teachers restricted to assigned cohorts.
11. **Student Privacy**: Students restricted from accessing other candidates' records.
12. **Declining Student Detection**: Proper identification of >= 5.0% performance drops.

### Production Build Verification:
Frontend production compilation verified:
```powershell
cd client
npm run build
# Built cleanly with 0 errors
```
