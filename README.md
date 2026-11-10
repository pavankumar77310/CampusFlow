# CampusFlow – An Intelligent Campus Coordination and Resource Management System

**Academic Project**: B.Tech Computer Science and Engineering  
**Course**: Software Engineering & System Design  
**Status**: Completed & Production-Ready  

---

## 1. Executive Summary

**CampusFlow** is an intelligent, full-stack campus management platform designed to unify and automate university operations into a single digital ecosystem. It eliminates manual paperwork, resolves facility scheduling conflicts, facilitates academic conference registrations, broadcasts university circulars with priority tags, and provides visual administrative analytics.

The system enforces **Role-Based Access Control (RBAC)** across three primary stakeholders:
- 👑 **Administrators**: Complete operational oversight, user lifecycle management, facility inventory controls, booking reviews, and executive Recharts analytics.
- 👨‍🏫 **Faculty Members**: Event organization, attendee roster inspection, department-targeted circular broadcasting, and priority lab/hall reservation.
- 🎓 **Students**: Seamless discovery of campus workshops, one-click event registration with capacity tracking, conflict-free facility booking, and personalized notification feeds.

---

## 2. Technology Stack

### Frontend
- **React.js 18** with **Vite** build tooling
- **Tailwind CSS** for responsive design and custom academic theme
- **React Router DOM v6** with nested protected routes and role gating
- **Recharts** for interactive administrative data visualization
- **Lucide React** for modern UI iconography
- **Axios** with automatic JWT Bearer token request/response interceptors

### Backend
- **Node.js** (v18+) & **Express.js** REST API architecture
- **JWT (JSON Web Tokens)** for stateless authentication
- **bcryptjs** for 10-round salted password hashing
- **Role-Based Access Control (RBAC)** middleware
- **Interval Overlap Algorithm** for double-booking prevention

### Database
- **MongoDB Atlas** with **Mongoose ODM**
- In-Memory MongoDB engine automatic fallback for offline development & instant evaluation
- Relational integrity with Mongoose `ObjectId` references and compound unique indexes

---

## 3. MongoDB Collections & Schemas

The application persists all application data directly into 7 MongoDB collections:

### 1. `users`
- `name` (String, required)
- `email` (String, unique, required)
- `password` (String, bcrypt hashed, required)
- `role` (Enum: `'student' | 'faculty' | 'admin'`, default: `'student'`)
- `idNumber` (String, Student Roll No / Employee ID, required)
- `department` (String, required)
- `yearOfStudy` (String, e.g., '1st Year', '2nd Year', '3rd Year', '4th Year', 'Faculty', 'Staff')
- `phone` (String)
- `avatar` (String URL)
- `isActive` (Boolean, default: `true`)
- Timestamps (`createdAt`, `updatedAt`)

### 2. `resources`
- `name` (String, e.g., "Dr. APJ Abdul Kalam Seminar Hall")
- `category` (Enum: `'Seminar Hall' | 'Classroom' | 'Laboratory' | 'Auditorium' | 'Sports Facility' | 'Projector' | 'Campus Equipment'`)
- `code` (String, unique uppercase identifier, e.g., "SEM-KALAM-02")
- `location` (String, e.g., "Science Block, 1st Floor")
- `capacity` (Number)
- `features` (Array of Strings: `["Projector", "WiFi", "AC", "Surround Sound"]`)
- `isAvailable` (Boolean, default: `true`)
- `maintenanceStatus` (Enum: `'Operational' | 'Under Maintenance' | 'Out of Order'`)
- Timestamps

### 3. `bookings`
- `resource` (ObjectId ref `'Resource'`, required)
- `user` (ObjectId ref `'User'`, required)
- `bookingDate` (String: `YYYY-MM-DD`, indexed)
- `startTime` (String: `HH:MM` 24-hr format)
- `endTime` (String: `HH:MM` 24-hr format)
- `purpose` (String, required)
- `attendeesCount` (Number)
- `status` (Enum: `'pending' | 'approved' | 'rejected' | 'cancelled'`)
- `adminRemarks` (String)
- `approvedBy` (ObjectId ref `'User'`)
- Timestamps

### 4. `events`
- `title` (String, required)
- `description` (String, required)
- `category` (Enum: `'Technical' | 'Cultural' | 'Sports' | 'Academic' | 'Workshop' | 'Seminar' | 'Placement' | 'Other'`)
- `date` (String: `YYYY-MM-DD`)
- `startTime` & `endTime` (String: `HH:MM`)
- `venue` (String, required)
- `organizer` (ObjectId ref `'User'`, required)
- `organizerName` (String)
- `department` (String, required)
- `maxCapacity` (Number, required)
- `registeredCount` (Number, default: 0)
- `status` (Enum: `'upcoming' | 'ongoing' | 'completed' | 'cancelled'`)
- `bannerUrl` (String)
- Timestamps

### 5. `eventregistrations`
- `event` (ObjectId ref `'Event'`, required)
- `user` (ObjectId ref `'User'`, required)
- `status` (Enum: `'registered' | 'cancelled'`)
- `attendance` (Boolean)
- `registeredAt` (Date)
- **Constraint**: Unique compound index `{ event: 1, user: 1 }` strictly prevents duplicate registrations.

### 6. `announcements`
- `title` (String, required)
- `content` (String, required)
- `category` (Enum: `'General' | 'Academic' | 'Exam' | 'Event' | 'Placement' | 'Sports' | 'Emergency'`)
- `department` (String, default: `'All Departments'`)
- `priority` (Enum: `'low' | 'medium' | 'high' | 'urgent'`)
- `author` (ObjectId ref `'User'`, required)
- `authorName` (String)
- `authorRole` (String)
- `isPinned` (Boolean, default: `false`)
- Timestamps

### 7. `notifications`
- `user` (ObjectId ref `'User'`, required)
- `title` (String, required)
- `message` (String, required)
- `type` (Enum: `'booking' | 'event' | 'announcement' | 'system'`)
- `read` (Boolean, default: `false`)
- `link` (String, target route)
- Timestamps

---

## 4. REST API Endpoint Reference

| Method | Endpoint | Access Level | Description |
|---|---|---|---|
| **POST** | `/api/auth/register` | Public | Register new Student, Faculty, or Admin (requires key) |
| **POST** | `/api/auth/login` | Public | Authenticate user & return signed JWT Bearer token |
| **GET** | `/api/auth/profile` | Authenticated | Retrieve authenticated user profile |
| **PUT** | `/api/auth/profile` | Authenticated | Update user information or password |
| **GET** | `/api/users` | Admin | Search & filter registered campus members |
| **GET** | `/api/users/:id` | Admin / Self | View single user details |
| **PUT** | `/api/users/:id` | Admin | Update user status and privileges |
| **DELETE** | `/api/users/:id` | Admin | Delete user account |
| **GET** | `/api/events` | Public / Auth | List events with user registration badges |
| **POST** | `/api/events` | Admin / Faculty | Create new campus event |
| **GET** | `/api/events/:id` | Public / Auth | Get event details |
| **PUT** | `/api/events/:id` | Admin / Organizer | Update event information |
| **DELETE** | `/api/events/:id` | Admin / Organizer | Delete event and linked registrations |
| **POST** | `/api/events/:id/register` | Authenticated | Register student for event (atomic capacity check) |
| **POST** | `/api/events/:id/cancel` | Authenticated | Cancel event registration |
| **GET** | `/api/events/:id/participants`| Admin / Organizer | Inspect roster of registered student participants |
| **GET** | `/api/resources` | Public / Auth | List facilities with category and location filters |
| **POST** | `/api/resources` | Admin | Register new facility or campus equipment |
| **PUT** | `/api/resources/:id` | Admin | Update facility details or maintenance status |
| **DELETE** | `/api/resources/:id` | Admin | Delete campus resource |
| **GET** | `/api/bookings` | Authenticated | List bookings (Admin gets all, Student gets own) |
| **POST** | `/api/bookings` | Authenticated | Submit reservation (evaluates overlap conflict) |
| **PUT** | `/api/bookings/:id/status` | Admin | Approve or reject booking with feedback remarks |
| **DELETE** | `/api/bookings/:id` | Authenticated | Cancel own booking or admin deletion |
| **GET** | `/api/announcements` | Public / Auth | Retrieve circulars sorted by pinned & priority |
| **POST** | `/api/announcements` | Admin / Faculty | Publish announcement with broadcast alerts |
| **PUT** | `/api/announcements/:id` | Admin / Author | Edit announcement content |
| **DELETE** | `/api/announcements/:id` | Admin / Author | Remove announcement |
| **GET** | `/api/notifications` | Authenticated | Get user's notifications and unread counter |
| **PUT** | `/api/notifications/:id/read` | Authenticated | Mark individual notification as read |
| **PUT** | `/api/notifications/read-all` | Authenticated | Mark all notifications read |
| **GET** | `/api/stats/admin` | Admin | Executive metrics & Recharts analytics data |
| **GET** | `/api/stats/student` | Student / Admin | Student personal dashboard metrics |
| **GET** | `/api/stats/faculty` | Faculty / Admin | Faculty departmental metrics |
| **GET** | `/api/health` | Public | System uptime & health check |

---

## 5. Conflict-Free Booking & Capacity Algorithms

### Interval Overlap Conflict Detection
When a booking request is submitted for resource $R$ on date $D$ with interval $[T_{\text{start}}, T_{\text{end}}]$:
$$\text{Conflict} \iff \exists B \in \text{Bookings}(R, D, \text{status} \in \{\text{'approved'}, \text{'pending'}\}) : (T_{\text{start}} < B_{\text{end}}) \land (T_{\text{end}} > B_{\text{start}})$$
If a conflict is detected, the API rejects the request with **HTTP 409 Conflict** and returns the conflicting reservation details so the user can choose a different time slot.

### Atomic Event Overbooking Guard
Event registrations execute within a concurrency-safe atomic check:
$$\text{Registration Allowed} \iff (\text{registeredCount} < \text{maxCapacity}) \land \lnot(\exists \text{Registration}(E, U, \text{active}))$$
Compound unique indexing on `{ event: 1, user: 1 }` guarantees mathematical idempotency.

---

## 6. Demo Login Credentials

The project comes pre-seeded with realistic academic accounts for immediate viva presentation:

| Role | Email | Password | Pre-configured Privileges |
|---|---|---|---|
| 👑 **Administrator** | `admin@campusflow.edu` | `Admin@12345` | Full system control, Recharts analytics, approvals, user management |
| 👨‍🏫 **Faculty (CSE HOD)** | `faculty@campusflow.edu` | `Faculty@12345` | Event hosting, attendee rosters, circular publishing, room booking |
| 👩‍🏫 **Faculty (ECE)** | `dr.priya@campusflow.edu` | `Faculty@12345` | Department event hosting and facility reservation |
| 🎓 **Student (CSE)** | `student@campusflow.edu` | `Student@12345` | Event registrations, facility reservations, notifications |
| 🎓 **Student (IT)** | `ananya@campusflow.edu` | `Student@12345` | Event registrations, facility reservations |

> **Administrative Registration Secret**: `CAMPUSFLOW_ADMIN_2026` (used if registering an Admin via `/register`).

---

## 7. How to Setup and Run Locally

### Prerequisites
- **Node.js** (v18.0.0 or higher)
- **npm** (v9.0.0 or higher)

### Step 1: Install Dependencies
Open your terminal in the root directory:
```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### Step 2: Database Setup (MongoDB Atlas or Instant Fallback)
1. In `backend/.env`, configure your MongoDB Atlas connection string:
   ```env
   PORT=5000
   MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/campusflow?retryWrites=true&w=majority
   JWT_SECRET=campusflow_super_secret_jwt_key_2026_academic
   ADMIN_SECRET_KEY=CAMPUSFLOW_ADMIN_2026
   NODE_ENV=development
   ```
2. *(Optional)* If `MONGODB_URI` contains `your_mongodb_connection_string` or is left default, CampusFlow automatically launches its embedded In-Memory MongoDB engine so you can evaluate and run the system immediately!

### Step 3: Seed Academic Demo Data
Populate the database with rich academic demo data:
```bash
cd backend
npm run seed
```

### Step 4: Run Automated Tests
Execute the end-to-end API test suite (verifies 17 critical test cases):
```bash
cd backend
node testApi.js
```

### Step 5: Start the Servers

**Terminal 1 (Backend Server)**:
```bash
cd backend
npm start
# Server listens on http://localhost:5000
```

**Terminal 2 (Frontend Client)**:
```bash
cd frontend
npm run dev
# Frontend runs on http://localhost:5173
```

Now open **`http://localhost:5173`** in your browser!

---

## 8. MongoDB Atlas Cloud Configuration Guide

To deploy with an actual live MongoDB Atlas cluster:
1. Create a free account at [https://www.mongodb.com/atlas](https://www.mongodb.com/atlas).
2. Create a free **M0 Sandbox** cluster (AWS, Mumbai/Closest region).
3. Under **Database Access**, create a database user (e.g., `campusflow_admin`) with a secure password.
4. Under **Network Access**, click **Add IP Address** and choose **Allow Access from Anywhere** (`0.0.0.0/0`) for development.
5. In your cluster dashboard, click **Connect** -> **Drivers** (Node.js).
6. Copy the connection string and paste it into `backend/.env`:
   ```env
   MONGODB_URI=mongodb+srv://campusflow_admin:<your_password>@cluster0.xxxxx.mongodb.net/campusflow?retryWrites=true&w=majority
   ```
7. Restart the backend: `npm start`. Mongoose will connect directly to Atlas and auto-populate your cloud database.

---

## 9. Academic Project Deliverables Checklist

- [x] Complete React 18 + Vite frontend with Tailwind CSS
- [x] Node.js Express REST API backend with modular MVC architecture
- [x] MongoDB database with 7 relational collections & Mongoose schemas
- [x] All 8 required functional pages + Profile security page
- [x] JWT token authentication with bcrypt password hashing
- [x] Role-Based Access Control (Student, Faculty, Admin)
- [x] Conflict-free facility reservation algorithm with HTTP 409 warnings
- [x] Atomic event capacity management & duplicate prevention
- [x] Interactive Recharts visual analytics (Bar, Pie, Area)
- [x] Automated test suite with 17 passed test cases
- [x] Comprehensive documentation and viva presentation guide
