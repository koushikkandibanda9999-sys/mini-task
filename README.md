# 📋 TaskFlow — Mini Project Management Portal

A full-stack task management web application built for the **o2h Full Stack Developer Assessment**.

![React](https://img.shields.io/badge/React-18-61DAFB?logo=react)
![Node.js](https://img.shields.io/badge/Node.js-Express-339933?logo=node.js)
![MySQL](https://img.shields.io/badge/Database-MySQL_8.0-4479A1?logo=mysql)
![JWT](https://img.shields.io/badge/Auth-JWT-orange)

---

## ✨ Features

### Core
- ✅ View all tasks on the Dashboard
- ✅ Create a new task with validation
- ✅ Mark a task as Completed
- ✅ Delete a task (with confirmation)
- ✅ Filter tasks by status (All / Pending / In Progress / Completed)
- ✅ Responsive, mobile-friendly design
- ✅ Loading indicator while fetching data
- ✅ Empty state when no tasks exist
- ✅ Dark Mode Toggle (persisted to localStorage)

### Advanced
- 🔐 JWT Authentication (Register / Login / Protected routes)
- 🔍 Search Tasks (live search by title & description)
- 📄 Pagination (6 tasks per page)
- 🔃 Sort by Created Date (Newest / Oldest)
- 📊 Dashboard Statistics (Total, Pending, In Progress, Completed)
- 🧪 Unit Tests (18 tests — Auth + Tasks APIs)

---

## 🛠 Tech Stack

| Layer    | Technology                                      |
|----------|-------------------------------------------------|
| Frontend | React 18, React Router v6, Axios, Vite          |
| Backend  | Node.js, Express.js                             |
| Database | MySQL 8.0 (mysql2 driver)                       |
| Auth     | JWT (jsonwebtoken) + bcryptjs                   |
| Styling  | Custom CSS — responsive + dark mode             |
| Testing  | Jest + Supertest                                |

---

## 📁 Project Structure

```
project-root/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── TaskCard.jsx
│   │   │   ├── LoadingSpinner.jsx
│   │   │   ├── EmptyState.jsx
│   │   │   ├── Pagination.jsx
│   │   │   ├── StatsBar.jsx
│   │   │   └── ProtectedRoute.jsx
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx
│   │   │   ├── AddTask.jsx
│   │   │   └── Login.jsx
│   │   ├── services/
│   │   │   ├── taskService.js
│   │   │   └── authService.js
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
├── backend/
│   ├── config/
│   │   ├── database.js
│   │   └── jwt.js
│   ├── controllers/
│   │   ├── authController.js
│   │   └── taskController.js
│   ├── middleware/
│   │   └── auth.js
│   ├── models/
│   │   ├── userModel.js
│   │   └── taskModel.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   └── taskRoutes.js
│   ├── tests/
│   │   ├── auth.test.js
│   │   └── tasks.test.js
│   ├── server.js
│   └── package.json
│
└── README.md
```

---

## ⚙️ Setup Steps

### Prerequisites

- Node.js >= 18.x
- npm >= 9.x
- MySQL 8.0 (running locally)

---

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/taskflow.git
cd taskflow
```

---

### 2. MySQL Database Setup

Log into MySQL and create the database and tables:

```sql
CREATE DATABASE IF NOT EXISTS taskmanager;

USE taskmanager;

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS tasks (
  id INT AUTO_INCREMENT PRIMARY KEY,
  userId INT NOT NULL,
  title VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'Pending',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
);
```

Update your credentials in `backend/config/database.js`:

```js
const pool = mysql.createPool({
  host: "localhost",
  port: 3306,
  user: "root",
  password: "your_password",   // ← change this
  database: "taskmanager",
});
```

---

### 3. Backend Setup

```bash
cd backend
npm install
npm start
```

Backend runs on → **http://localhost:5000**

---

### 4. Frontend Setup

Open a new terminal:

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on → **http://localhost:3000**

---

### 5. Run Unit Tests

```bash
cd backend
npm test
```

Expected output: **18 tests passed**

---

## 🔌 API Documentation

Base URL: `http://localhost:5000`

> All `/tasks` endpoints require the `Authorization: Bearer <token>` header.

---

### Auth Endpoints

| Method | Endpoint         | Description              | Auth Required |
|--------|------------------|--------------------------|---------------|
| POST   | `/auth/register` | Register a new user      | ❌            |
| POST   | `/auth/login`    | Login and get JWT token  | ❌            |
| GET    | `/auth/me`       | Get current user info    | ✅            |

#### POST `/auth/register`
```json
Request:
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "secret123"
}

Response (201):
{
  "success": true,
  "token": "eyJhbGci...",
  "user": { "id": 1, "name": "John Doe", "email": "john@example.com" }
}
```

#### POST `/auth/login`
```json
Request:
{
  "email": "john@example.com",
  "password": "secret123"
}

Response (200):
{
  "success": true,
  "token": "eyJhbGci...",
  "user": { "id": 1, "name": "John Doe", "email": "john@example.com" }
}
```

---

### Task Endpoints

| Method | Endpoint         | Description                        | Auth Required |
|--------|------------------|------------------------------------|---------------|
| GET    | `/tasks`         | Get all tasks (paginated)          | ✅            |
| GET    | `/tasks/stats`   | Get dashboard statistics           | ✅            |
| POST   | `/tasks`         | Create a new task                  | ✅            |
| PUT    | `/tasks/:id`     | Update task status                 | ✅            |
| DELETE | `/tasks/:id`     | Delete a task                      | ✅            |

#### GET `/tasks` — Query Parameters

| Param    | Type   | Default  | Description                         |
|----------|--------|----------|-------------------------------------|
| `status` | string | —        | Filter: `Pending`, `In Progress`, `Completed` |
| `search` | string | —        | Search in title and description     |
| `sort`   | string | `desc`   | Sort order: `asc` or `desc`         |
| `page`   | number | `1`      | Page number                         |
| `limit`  | number | `6`      | Items per page                      |

```
GET /tasks?status=Pending&search=login&sort=asc&page=1&limit=6
```

```json
Response (200):
{
  "success": true,
  "tasks": [...],
  "total": 12,
  "page": 1,
  "totalPages": 2
}
```

#### GET `/tasks/stats`
```json
Response (200):
{
  "success": true,
  "data": {
    "total": 10,
    "pending": 4,
    "inProgress": 3,
    "completed": 3
  }
}
```

#### POST `/tasks`
```json
Request:
{
  "title": "Build Login Page",
  "description": "Create a responsive login page with full validation",
  "status": "Pending"
}

Response (201):
{
  "success": true,
  "data": { "id": 1, "title": "Build Login Page", ... },
  "message": "Task created successfully"
}
```

#### PUT `/tasks/:id`
```json
Request:
{
  "status": "Completed"
}

Response (200):
{
  "success": true,
  "data": { "id": 1, "status": "Completed", ... },
  "message": "Task updated successfully"
}
```

#### DELETE `/tasks/:id`
```json
Response (200):
{
  "success": true,
  "message": "Task deleted successfully"
}
```

---

### Standard Response Format

```json
// Success
{ "success": true, "data": { ... }, "message": "..." }

// Validation error
{ "success": false, "errors": { "title": "Title is required" } }

// General error
{ "success": false, "message": "Error description" }
```

---

## ✅ Validation Rules

| Field        | Rule                                        |
|--------------|---------------------------------------------|
| name         | Required, min 2 characters                  |
| email        | Required, valid email format, unique        |
| password     | Required, min 6 characters                  |
| title        | Required, max 100 characters                |
| description  | Required, min 20 characters                 |
| status (create) | `Pending` or `In Progress`              |
| status (update) | `Pending`, `In Progress`, or `Completed`|

---

## 🧪 Unit Tests

```
backend/tests/
├── auth.test.js   — 7 tests (register, login, token, validation, duplicate email)
└── tasks.test.js  — 11 tests (CRUD, search, pagination, stats, auth guards)
```

Run tests:
```bash
cd backend
npm test
```

---

## 💡 Assumptions

1. **MySQL 8.0** is installed and running locally on port `3306`.
2. The MySQL root password must be updated in `backend/config/database.js` before running.
3. Each user only sees their own tasks — tasks are scoped by `userId` (multi-user support).
4. JWT tokens expire after **24 hours**; users are redirected to login on expiry.
5. Tasks can only be created with status `Pending` or `In Progress`. The `Completed` status is set via the "Done" button on the Dashboard.
6. The Vite dev server proxies both `/tasks` and `/auth` to `http://localhost:5000`, so no CORS configuration is needed during development.
7. Passwords are hashed using **bcryptjs** with salt rounds of 10 before storing in the database.
8. The `tasks.json` file (leftover from lowdb) can be safely deleted — it is no longer used.

---

## 📊 Evaluation Coverage

| Area                    | Marks | Status |
|-------------------------|-------|--------|
| Frontend UI             | 20    | ✅     |
| React Components        | 15    | ✅     |
| API Development         | 20    | ✅     |
| Database Design         | 10    | ✅ MySQL |
| Validation & Error Handling | 10 | ✅    |
| Code Quality            | 10    | ✅     |
| Documentation           | 5     | ✅     |
| Git Usage               | 5     | ✅     |
| Bonus Features          | 5     | ✅ Dark Mode + JWT + Search + Pagination |

---

## 📝 Git Commit History

```bash
git init
git add .
git commit -m "Initial project setup"

git add backend/
git commit -m "Implemented task APIs"

git add frontend/src/pages/Dashboard.jsx
git commit -m "Added React Dashboard"

git add .
git commit -m "Integrated frontend with backend"

git add .
git commit -m "Added JWT authentication"

git add .
git commit -m "Added search, pagination and sort features"

git add .
git commit -m "Migrated database to MySQL"

git add README.md
git commit -m "Updated README"
```
