# School Administration System

Full-stack prototype built with Spring Boot + React + Spring Data JPA + H2 (in-memory).

## Prerequisites

| Tool | Version |
|---|---|
| Java JDK | 17+ |
| Maven | 3.8+ (or use included wrapper) |
| Node.js | 18+ |
| npm | 9+ |

Check versions: `java -version`, `mvn -version`, `node -v`

---

## Running Locally

### 1. Start the Backend

```bash
cd "FSAD Project/backend"
mvn spring-boot:run
```

- Starts on **http://localhost:8080**
- H2 Console: **http://localhost:8080/h2-console**
  - JDBC URL: `jdbc:h2:mem:schooldb`
  - User: `sa`, Password: *(empty)*

### 2. Start the Frontend

Open a new terminal tab:

```bash
cd "FSAD Project/frontend"
npm install
npm run dev
```

- Opens at **http://localhost:5173**

---

## Default Login Credentials

| Username | Password | Role | Access |
|---|---|---|---|
| `admin` | `admin123` | ADMIN | All modules |
| `principal` | `principal123` | PRINCIPAL | Schedule, Reports, Analysis |
| `clerk1` | `clerk123` | CLERK | Admission, Fee Payment |
| `clerk2` | `clerk123` | CLERK | Admission, Fee Payment |
| `teacher1` | `teacher123` | TEACHER | Attendance, Syllabus, Performance |
| `teacher2` | `teacher123` | TEACHER | Attendance, Syllabus, Performance |
| `teacher3` | `teacher123` | TEACHER | Attendance, Syllabus, Performance |

---

## Modules

| # | Module | Role |
|---|---|---|
| 1 | Registration / Login | All |
| 2 | Admission | Clerk |
| 3 | Fee Payment | Clerk |
| 4 | Attendance | Teacher |
| 5 | Syllabus | Teacher |
| 6 | Student Performance | Teacher |
| 7 | Class Scheduling | Principal |
| 8 | Reports | Principal |
| 9 | Analysis | Principal |

---

## API Endpoints (Backend)

| Method | Endpoint | Role |
|---|---|---|
| POST | /api/auth/login | Public |
| GET/POST | /api/students | Clerk+ |
| GET/POST | /api/admissions | Clerk |
| GET/POST | /api/fees | Clerk |
| GET/POST | /api/attendance/bulk | Teacher |
| GET/POST | /api/performance | Teacher |
| GET/POST | /api/syllabus | Teacher |
| GET/POST/DELETE | /api/schedule | Principal |
| GET | /api/analysis/overview | Principal |

---

## Tech Stack

- **Backend:** Spring Boot 3.2, Spring Security + JWT, Spring Data JPA, Hibernate, H2
- **Frontend:** React 18, Vite, React Router v6, Axios

---

## Notes

- Data resets on every backend restart (H2 in-memory). Switch to MySQL by changing `application.properties`.
- To switch to MySQL: replace H2 dependency with `mysql-connector-j` and update `application.properties` with your MySQL URL/credentials.
