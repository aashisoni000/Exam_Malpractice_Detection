# ExamGuard — Online Exam Malpractice Detection System

A full-stack web application for detecting and preventing exam malpractice in online assessments.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19 + Vite + Tailwind CSS v4 |
| Backend | Node.js + Express |
| Database | MySQL (mysql2) |
| HTTP Client | Axios |
| Routing | React Router DOM v7 |

---

## Project Structure

```
exam-malpractice-detection/
│
├── frontend/                   # React + Vite + Tailwind
│   ├── src/
│   │   ├── components/         # Reusable UI components
│   │   │   ├── Navbar.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   └── Icons.jsx
│   │   ├── pages/              # Page-level components
│   │   │   ├── Login.jsx
│   │   │   ├── StudentDashboard.jsx
│   │   │   ├── AdminDashboard.jsx
│   │   │   └── NotFound.jsx
│   │   ├── layouts/            # Shared layout shells (navbar + sidebar)
│   │   │   ├── StudentLayout.jsx
│   │   │   └── AdminLayout.jsx
│   │   ├── services/           # API service layer
│   │   │   └── api.js          # Axios instance + API modules
│   │   ├── App.jsx             # Root router + route guards
│   │   ├── main.jsx            # React entry point
│   │   └── index.css           # Global styles + Tailwind
│   ├── index.html
│   └── vite.config.js
│
├── backend/                    # Node.js + Express API
│   ├── server.js               # Entry point, middleware, route mounts
│   ├── config/
│   │   └── env.js              # Validated env config
│   ├── db/
│   │   └── db.js               # MySQL connection pool
│   ├── routes/
│   │   └── authRoutes.js       # /api/login
│   ├── controllers/
│   │   └── authController.js   # Auth logic (mock → DB)
│   ├── middleware/
│   │   └── roleMiddleware.js   # RBAC middleware
│   ├── .env                    # Environment variables (do NOT commit)
│   └── package.json
│
└── README.md
```

---

## Getting Started

### Prerequisites

- Node.js v18+
- npm v9+
- MySQL (optional for initial setup — mock auth is used by default)

---

### Backend Setup

```bash
cd backend
npm install
```

Configure environment variables in `backend/.env`:

```env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=exam_malpractice_db
JWT_SECRET=your_secret_key
```

Start the backend:

```bash
npm run dev     # Development (nodemon)
npm start       # Production
```

Backend runs at: **http://localhost:5000**

Health check: **http://localhost:5000/api/health**

---

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at: **http://localhost:5173**

---

## Authentication

Currently uses **mock authentication** (hardcoded users). Switch to database auth by updating `authController.js`.

### Demo Credentials

| Role | Email | Password |
|---|---|---|
| Student | student@exam.com | student123 |
| Admin | admin@exam.com | admin123 |

---

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | /api/health | Server health check |
| POST | /api/login | Login with email, password, role |

### POST /api/login

**Request:**
```json
{
  "email": "student@exam.com",
  "password": "student123",
  "role": "student"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful. Welcome, John Doe!",
  "user": { "id": 1, "email": "student@exam.com", "role": "student", "name": "John Doe" },
  "redirectTo": "/student-dashboard"
}
```

---

## Routes

| Path | Component | Access |
|---|---|---|
| `/login` | Login | Public |
| `/student-dashboard` | StudentDashboard | Student only |
| `/admin-dashboard` | AdminDashboard | Admin only |
| `/*` | NotFound | Public |

---

## Planned Features (Future Sprints)

- [ ] JWT-based authentication
- [ ] Database user authentication
- [ ] Student exam management
- [ ] IP address logging
- [ ] Suspicion detection engine
- [ ] Real-time monitoring
- [ ] Analytics charts (Chart.js / Recharts)
- [ ] Email notifications

---

## Development Notes

- The Vite dev server proxies `/api/*` to `http://localhost:5000` — no CORS issues in development.
- `roleMiddleware.js` is scaffolded for JWT — attach it to routes when tokens are implemented.
- `db.js` gracefully handles DB connection failures in dev mode (app still runs without a database).
- All future route modules should be added in `backend/routes/` and mounted in `server.js`.
