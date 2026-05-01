<div align="center">

# DevHacks DevOps Lab Showcase

**A lab project for demonstrating DevOps concepts learned during the DevOps lab**

<br>

*Built to show the workflow, tooling, and deployment concepts, not to ship a production product.*

<br>

[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-4.0.3-6DB33F?style=for-the-badge&logo=springboot&logoColor=white)](https://spring.io/projects/spring-boot)
[![React](https://img.shields.io/badge/React-19.2-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev)
[![Docker](https://img.shields.io/badge/Docker-Compose%20%26%20Sandbox-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://docker.com)
[![MySQL](https://img.shields.io/badge/MySQL-8.0-4479A1?style=for-the-badge&logo=mysql&logoColor=white)](https://mysql.com)

<br>

This repository demonstrates a full stack with **Docker-based deployment**, **backend/frontend containerization**, **sandboxed execution**, and **basic CI/CD-style project organization**.<br>
The current emphasis is on **learning and showcasing DevOps practices**, not on final product polish.<br>

<br>

[Getting Started](#getting-started) · [Project Purpose](#project-purpose) · [Current Architecture](#current-architecture-placeholder) · [Deployment](#deployment) · [Project Details](#project-details)

</div>

<br>

---

## Project Purpose

This project is not being developed as a production product.

Its goal is to demonstrate DevOps concepts covered in the DevOps lab, including:

- containerization with Docker
- multi-service orchestration with Docker Compose
- isolated sandbox execution
- environment-based configuration
- frontend/backend service separation
- deployment-oriented project structure

The architecture and naming in this README will be updated later as the lab work evolves.

---

## Current Architecture Placeholder

The current architecture section is intentionally kept as a placeholder.

It will be updated later with the final lab architecture diagram and deployment flow once the project structure is finalized.

---

## Getting Started

### Quick Start (Docker Compose)

```bash
git clone https://github.com/ShivsharanSanjawad/devOpsProject
cd devOpsProject 
cp .env.example .env
docker compose up --build
```

Open `http://localhost:5173`.

### Required `.env` values

- `DB_USERNAME`
- `DB_PASSWORD`
- `JWT_SECRET` (minimum 32 characters)

### Default service ports

- Frontend: `5173`
- Backend API: `8080`
- MySQL: `3307` (host) -> `3306` (container)

---

## Deployment

The project is currently organized to run with Docker Compose:

- `backend` builds the Spring Boot API image
- `frontend` builds the Vite React app image
- `sandbox` provides the isolated code execution environment
- `db` runs MySQL as a managed service container

Use `docker compose up --build` from the project root to start the stack.

---

## Project Details

This section groups additional notes about the project while the documentation is evolving.

<details>
<summary><b>Open project details</b></summary>

### Project context

The project focuses on demonstrating DevOps concepts learned during the DevOps lab, including containerization, orchestration, sandboxing, and service separation.

### Additional notes

- The architecture section will be updated later with a final diagram.
- The repository is organized for lab demonstration and deployment practice.
- The current stack uses Docker Compose for local service orchestration.

This section is intentionally lightweight and will be expanded as the project evolves.

</details>

---

## Features

| Feature | Description |
|---------|-------------|
| **Practice Arena** | Solve coding problems with real-time judging across C++, Java, and Python |
| **1v1 Blitz Battles** | Real-time head-to-head coding duels via WebSocket with live opponent tracking |
| **Contest System** | Create & join timed contests with live leaderboards and score tracking |
| **AI Hints** | Progressive 3-level hint system powered by Gemini 2.5 Flash |
| **Auto Plagiarism Detection** | Every submission analyzed for AI-generation and copy-paste before execution |
| **Mock Interviews** | FAANG-style AI interview evaluation with hire/no-hire recommendations |
| **Game Modes** | Blitz battles, Ctrl+Fix It (debug challenges), and competitive contests |
| **Community Forum** | Discussion posts with tags and engagement |
| **Gamification** | Coins, XP, streaks, and profile stats |
| **Dual Auth** | JWT + OAuth 2.0 (GitHub & Google) with email OTP verification |

---

## System Architecture

```
┌────────────────────────────────────────────────────────────────────────┐
│                         CLIENT (React 19 + Vite 7)                    │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌────────────┐  │
│  │ Practice  │ │  Battle  │ │ Contest  │ │Interview │ │ Community  │  │
│  │  Page     │ │  Arena   │ │  Arena   │ │   Page   │ │   Forum    │  │
│  └────┬─────┘ └────┬─────┘ └────┬─────┘ └────┬─────┘ └────────────┘  │
│       │             │            │             │                       │
│       ▼             ▼            ▼             ▼                       │
│  ┌──────────────────────────────────────────────────┐                 │
│  │    Axios HTTP Client  +  STOMP/WebSocket Client   │                │
│  └──────────────────────┬───────────────────────────┘                 │
└─────────────────────────┼─────────────────────────────────────────────┘
                          │  REST API (JWT Bearer) + WebSocket (STOMP)
                          ▼
┌────────────────────────────────────────────────────────────────────────┐
│                    SPRING BOOT 4.0.3 BACKEND                          │
│                                                                        │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌──────────────┐ │
│  │   Auth &    │  │  Problem &  │  │   Battle    │  │   Contest    │ │
│  │  Security   │  │  Judging    │  │   Service   │  │   Service    │ │
│  │  (JWT+OAuth)│  │  Engine     │  │  (WebSocket)│  │ (Leaderboard)│ │
│  └─────────────┘  └──────┬──────┘  └─────────────┘  └──────────────┘ │
│                          │                                             │
│  ┌─────────────┐  ┌──────▼──────┐  ┌─────────────┐  ┌──────────────┐ │
│  │  Gemini AI  │  │  Docker     │  │ Notification │  │    Job       │ │
│  │  Service    │  │  Sandbox    │  │  Service     │  │   Queue      │ │
│  │ (Hints/Plag │  │  (Isolated  │  │ (WebSocket   │  │ (Async       │ │
│  │  /Interview)│  │   Judge)    │  │  Push)       │  │  Workers)    │ │
│  └─────────────┘  └──────┬──────┘  └─────────────┘  └──────────────┘ │
│                          │                                             │
│  ┌───────────────────────▼────────────────────────────────────────┐   │
│  │                    MySQL + Flyway Migrations                    │   │
│  │  Users · Problems · Submissions · Contests · Battles · OTPs   │   │
│  └────────────────────────────────────────────────────────────────┘   │
└────────────────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌────────────────────────────────────────────────────────────────────────┐
│                 DOCKER SANDBOX (Isolated Execution Engine)             │
│                                                                        │
│  Ubuntu 22.04 | GCC/G++ | Python 3 | JDK 17 | Node.js                │
│  cgroups v2 · seccomp · per-user isolation · ulimits                  │
└────────────────────────────────────────────────────────────────────────┘
```

> [!NOTE]
> When running via Docker Compose the backend runs inside its own container (Docker-in-Docker). It auto-detects this environment (`/.dockerenv`) and adjusts Docker flags accordingly — `--cgroupns host` and seccomp profiles are only applied on bare-metal Linux where they are supported.

---

## Docker Sandbox: Secure Code Execution

> [!IMPORTANT]
> Executing untrusted user code on a server is extremely dangerous — users could wipe the filesystem, fork-bomb the server, open network connections, or consume infinite resources.

CodeStorm solves this with a **5-layer defense-in-depth isolation architecture**:

```
┌──────────────────────────────────────────────────────────┐
│  LAYER 1: Docker Container Isolation                     │
│  • Separate filesystem namespace                         │
│  • No host network access                                │
│  • Read-only root filesystem (--read-only)               │
│  • No privileged escalation (--no-new-privileges)        │
├──────────────────────────────────────────────────────────┤
│  LAYER 2: Seccomp System Call Filter                     │
│  • Default policy: SCMP_ACT_KILL (deny all)              │
│  • Whitelist of ~50 safe syscalls only                   │
│  • Blocks: socket, connect, bind (no network)            │
│  • Blocks: mount, chroot, ptrace (no escalation)         │
│  • kill/tkill only allowed for self-signal (arg0 == 0)   │
├──────────────────────────────────────────────────────────┤
│  LAYER 3: cgroups v2 Resource Limits                     │
│  • memory.max → Hard memory cap (e.g., 256MB)            │
│  • memory.swap.max → 0 (no swap, instant OOM)            │
│  • cpu.max → 100ms/100ms (100% of one core max)          │
│  • Per-submission cgroup created & destroyed              │
├──────────────────────────────────────────────────────────┤
│  LAYER 4: Per-User OS-Level Isolation                    │
│  • Each submission runs as a unique Linux user            │
│  • ulimit -u 256 (max 256 processes — no fork bombs)     │
│  • ulimit -f 10240 (max 10MB file output)                │
│  • ulimit -n 64 (max 64 open file descriptors)           │
│  • ulimit -s 65536 (64MB stack size)                     │
│  • User created → code executed → user deleted           │
├──────────────────────────────────────────────────────────┤
│  LAYER 5: Time-Bounded Execution                         │
│  • timeout --kill-after=1s <time_limit>                  │
│  • Wall-clock timer via nanosecond timestamps            │
│  • /usr/bin/time -v for precise resource measurement     │
│  • Automatic cleanup: cgroup.kill → userdel → rm workdir │
└──────────────────────────────────────────────────────────┘
```

### Seccomp Profile

The seccomp profile uses a **default-KILL policy** — any system call not explicitly whitelisted will instantly terminate the process at the kernel level.

```json
{
  "defaultAction": "SCMP_ACT_KILL",
  "architectures": ["SCMP_ARCH_X86_64"],
  "syscalls": [
    {
      "names": ["read","write","open","mmap","brk","execve","exit","..."],
      "action": "SCMP_ACT_ALLOW"
    },
    {
      "names": ["kill","tkill"],
      "action": "SCMP_ACT_ALLOW",
      "args": [{"index": 0, "value": 0, "op": "SCMP_CMP_EQ"}]
    }
  ]
}
```

> [!NOTE]
> Only ~50 safe operations are permitted. Network syscalls (`socket`, `connect`, `bind`) are completely absent — making it impossible to open any network connection from user code.

---

## Online Judge Engine

### Judging Pipeline

```
Submit Code → Job Queue (Async) → Plagiarism Check (Gemini AI)
                                        │
                                        ▼
                                  Penalty Applied?
                                  (AI-Generated/Plagiarised → flag)
                                        │
                                        ▼
                              Docker Sandbox Execution
                                        │
                        ┌───────────────┼───────────────┐
                        ▼               ▼               ▼
                   Compile          Run Tests       Collect Stats
                   (gcc/javac/      (per test       (time via
                    python)          case with       /usr/bin/time,
                                     diff check)     memory via
                                                      cgroup.peak)
                                        │
                                        ▼
                                  Save Verdict
                                  (AC/WA/TLE/MLE/RE/CE)
                                        │
                                ┌───────┴───────┐
                                ▼               ▼
                        WebSocket Push    Battle Check
                        (real-time         (if 1v1 →
                         to client)         update state)
```

### Supported Languages

| Language | Compiler/Runtime | Compile Command | Run Command |
|----------|------------------|-----------------|-------------|
| **C++** | GCC/G++ | `g++ -O2 -std=c++17 -o solution solution.cpp` | `./solution` |
| **Java** | OpenJDK 17 | `javac Solution.java` | `java -Xmx{mem}m Solution` |
| **Python** | Python 3 | *(interpreted)* | `python3 solution.py` |

### Verdict Types

| Verdict | Meaning |
|---------|---------|
| `AC` | Accepted — all test cases passed |
| `WA` | Wrong Answer — output didn't match expected |
| `TLE` | Time Limit Exceeded |
| `MLE` | Memory Limit Exceeded |
| `RE` | Runtime Error |
| `CE` | Compilation Error |

### Checker Modes
- **EXACT** — Byte-for-byte output match (with whitespace trimming)
- **FLOAT_TOLERANCE** — Floating point comparison with configurable epsilon

---

## Gemini AI Integration

CodeStorm integrates **Google Gemini 2.5 Flash** across three distinct services:

### 1. Smart Hints (`GeminiHintService`)

Progressive hint system that never gives away the full solution:

| Level | What It Provides |
|-------|-----------------|
| **Level 1** | Gentle conceptual nudge |
| **Level 2** | Algorithm/approach suggestion |
| **Level 3** | Pseudocode walkthrough |

Gemini receives the problem statement, user's current code, and hint level — returning a contextual, pedagogically appropriate hint.

### 2. Auto Plagiarism Detection (`GeminiPlagiarismService`)

Runs automatically on **every submission before Docker execution**:

```
Code Submitted
      │
      ▼
  Gemini Analysis
  ├── AI-generated patterns (ChatGPT/Copilot signatures, perfect comments, generic naming)
  ├── Plagiarism indicators (tutorial copy-paste, style inconsistencies)
  └── Human code signals (natural imperfections, personal style)
      │
      ▼
  Returns: Verdict + Originality Score (0-100) + AI Likelihood (0-100)
      │
      ├── LIKELY_ORIGINAL → continue normally
      ├── SUSPICIOUS → continue (flagged for review)
      ├── LIKELY_AI_GENERATED → automatic penalty applied
      └── LIKELY_PLAGIARISED → automatic penalty applied
```

> [!TIP]
> Plagiarism check runs **before** sandbox execution — catching cheating before wasting compute resources.

### 3. Mock Interview Evaluator (`GeminiInterviewService`)

Gemini acts as a senior FAANG interviewer, evaluating:
- Code quality assessment (1-10)
- Time/space complexity analysis
- Communication clarity score
- Edge case handling review
- Specific improvement suggestions
- Overall hire/no-hire recommendation

Also supports generating interview-style questions from any problem.

---

## 1v1 Blitz Battle System

Real-time competitive coding duels powered by WebSocket.

```
     Player 1                    Server                    Player 2
        │                          │                          │
        │── Create Battle ────────▶│                          │
        │◀── Party Code ──────────│                          │
        │                          │◀── Join (Party Code) ───│
        │                          │                          │
        │◀── WebSocket: BATTLE_STARTED ─────────────────────▶│
        │        (Problem assigned, timer starts)             │
        │                          │                          │
        │── Submit Code ──────────▶│                          │
        │                   [Plagiarism Check]                │
        │                   [Docker Judging]                  │
        │◀── Result (AC/WA) ──────│                          │
        │                          │──▶ WebSocket: opponent   │
        │                          │    verdict broadcast ───▶│
        │                          │                          │
        │                          │◀── Submit Code ─────────│
        │                          │   [Plagiarism + Judge]   │
        │◀── WebSocket: BATTLE_COMPLETED ───────────────────▶│
        │        (Winner declared, stats shown)               │
```

**Battle States:** `WAITING` → `IN_PROGRESS` → `COMPLETED`

**Key Features:**
- **STOMP over SockJS** WebSocket for real-time bidirectional communication
- **Polling fallback** — if WebSocket drops, client polls every 3 seconds
- **Race condition safe** — synchronized verdict handling, first AC wins
- **Random problem assignment** based on selected difficulty
- **Party code system** — share 6-char code to invite opponent

---

## Contest System

Full competitive programming contest platform:

| Feature | Description |
|---------|-------------|
| **Create Contests** | Set name, description, start/end time, add multiple problems |
| **Registration** | Users register before start, tracked via ContestParticipant |
| **Live Arena** | Dedicated contest page with problem list + submission panel |
| **Real-Time Leaderboard** | Auto-calculated scores, sorted by problems solved + time |
| **Score Tracking** | Per-problem AC tracking, total score aggregation |
| **Contest Submissions** | Scoped to contest + time window, separate from practice |

```
Contest ──┬── ContestProblem (many) ──── Problem
          └── ContestParticipant (many) ── User
                   ├── score (total points)
                   ├── solvedProblemIds (JSON set)
                   └── lastAcceptedAt (tiebreaker)
```

---

## Authentication & Security

| Feature | Details |
|---------|---------|
| **JWT Auth** | HS512-signed tokens, 1-hour access + 7-day refresh tokens |
| **OAuth 2.0** | GitHub & Google social login with automatic account linking |
| **OTP Verification** | Email-based OTP for signup verification via Gmail SMTP |
| **CORS Policy** | Whitelisted origins, configurable per environment |
| **Role-Based Access** | Admin endpoints protected, user-scoped data access |

```
User → Login → Spring Security AuthManager → BCrypt validation
     → JWT pair generated (access + refresh)
     → All requests: Authorization: Bearer <token>
     → JwtAuthenticationFilter validates per request
     → SecurityContext populated → access granted
```

---

## Database Schema

<details>
<summary><b>Entity Relationship Overview</b></summary>
<br>

```
Users ─────────┬──── Submissions ────── Problems
               │          │                 │
               │          │            TestCases
               │          │
               ├──── Battles (1v1)
               │     (player1, player2, verdicts, winner)
               │
               ├──── ContestParticipant ──── Contest
               │     (score, solved set)        │
               │                          ContestProblem
               ├──── CoinTransactions
               └──── OTPs (email verification)

Problems ─────┬──── Topics (many-to-many)
              ├──── CompanyTags (many-to-many)
              ├──── TestCases (ordered set)
              └──── ProblemSolutions
```

</details>

### Key Entities (18 total)

| Entity | Purpose | Key Fields |
|--------|---------|-----------|
| `User` | Platform users | username, email, bcrypt password, coins, xp, streak, avatar, role |
| `Problem` | Coding challenges | title, body, difficulty, timeLimit, memoryLimit, checkerType |
| `Submission` | Code submissions | code, language, verdict, timeMs, memoryKb, plagiarism fields |
| `TestCase` | I/O test pairs | input, expectedOutput, ordering, isSample |
| `Battle` | 1v1 matches | partyCode, player1/2, verdicts, status, winnerId |
| `Contest` | Competitions | name, startTime, endTime, createdBy |
| `ContestParticipant` | Contest entries | score, solvedProblemIds, lastAcceptedAt |
| `CoinTransaction` | Currency ledger | amount, type, description, timestamp |

**Database Features:** Flyway migrations · JPA/Hibernate · UUID primary keys · Optimistic locking

---

## API Reference

<details>
<summary><b>Auth & Users</b></summary>
<br>

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/signUp` | Register with OTP verification |
| `POST` | `/api/login` | JWT token pair generation |
| `POST` | `/api/refresh-token` | Token refresh |
| `GET` | `/api/profile` | User profile with stats |
| | | OAuth2: GitHub + Google login flows |

</details>

<details>
<summary><b>Problems & Judging</b></summary>
<br>

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/problems` | Browse problems (filtered by difficulty/topic) |
| `GET` | `/api/problems/{id}/detail` | Full problem detail with test cases |
| `POST` | `/api/submissions` | Submit code → async judging pipeline |
| `GET` | `/api/submissions/{id}` | Poll submission result |

</details>

<details>
<summary><b>Battles</b></summary>
<br>

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/battle/create` | Create 1v1 room |
| `POST` | `/api/battle/join` | Join via party code |
| `GET` | `/api/battle/code/{code}` | Poll battle state |
| | `/topic/battle/{id}` | WebSocket: real-time updates |

</details>

<details>
<summary><b>Contests</b></summary>
<br>

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET/POST/PUT/DELETE` | `/api/contests` | Full CRUD |
| `POST` | `/api/contests/{id}/register` | Join contest |
| `POST` | `/api/contests/{id}/submit` | Contest submission |
| `GET` | `/api/contests/{id}/leaderboard` | Live rankings |

</details>

<details>
<summary><b>AI Services</b></summary>
<br>

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/hints` | Get progressive AI hints |
| `POST` | `/api/plagiarism-check` | Manual plagiarism analysis |
| `POST` | `/api/interview/evaluate` | Mock interview evaluation |
| `POST` | `/api/interview/questions` | Generate interview questions |

</details>

<details>
<summary><b>WebSocket Channels</b></summary>
<br>

| Channel | Description |
|---------|-------------|
| `/user/queue/submission-result` | Personal judging results |
| `/topic/battle/{battleId}` | Battle state broadcasts |

</details>

---

## Frontend

### Pages (14 total)

| Page | Function |
|------|----------|
| `LandingPage` | Hero, features grid, leaderboard, CTA |
| `LoginPage` / `RegisterPage` | JWT + OAuth2 auth flows |
| `Homepage` | Dashboard with activity, stats, action cards |
| `PracticePage` | Problem browser with difficulty/topic filters |
| `ProblemSolvingPage` | Split-pane: description + Monaco editor + output panel |
| `GamePage` | Game mode selector hub |
| `BlitzBattlePage` | Full 1v1 battle arena with live opponent tracking |
| `ContestsPage` | Browse, create, register for contests |
| `ContestArena` | Live contest environment with problem tabs |
| `MockInterviewPage` | AI interview session with evaluation |
| `ProfilePage` | User stats, solve history, achievements |
| `CommunityPage` | Discussion forum with posts and interaction |

### Monaco Editor Integration
- Full VS Code editing experience in-browser
- Language-specific syntax highlighting (Python, C++, Java)
- Auto-indentation, bracket matching, minimap
- Custom dark theme matching the platform aesthetic

---

## Performance & Scalability

| Aspect | Implementation |
|--------|---------------|
| **Async Judging** | Submissions queued via `JobQueueService` — non-blocking API |
| **Connection Pooling** | HikariCP: 20 max connections, 5 minimum idle |
| **Persistent Sandbox** | Single long-running Docker container — no cold-start per submission |
| **Per-Submission Isolation** | Unique Linux user + cgroup per run, cleaned up after execution |
| **WebSocket Scaling** | STOMP message broker with topic/queue separation |
| **Database Indexing** | UUID PKs, indexed foreign keys, JPQL optimized queries |
| **Frontend Optimization** | Vite 7 tree-shaking, lazy loading, code splitting |
| **Resource Management** | cgroup `memory.peak` tracking, `/usr/bin/time` for CPU profiling |

---

## Tech Stack

### Backend

| Component | Technology | Version |
|-----------|-----------|---------|
| Framework | Spring Boot | 4.0.3 |
| Language | Java | 17 |
| Database | MySQL | 8.0 |
| Migrations | Flyway | Latest |
| Auth | JWT (jjwt) + Spring Security + OAuth2 | 0.12.3 |
| WebSocket | Spring WebSocket + STOMP | 4.0.3 |
| AI | Google GenAI SDK (Gemini 2.5 Flash) | 1.1.0 |
| Sandbox | Docker + Ubuntu 22.04 | Latest |
| Email | Spring Mail (Gmail SMTP) | 4.0.3 |
| Build | Maven | 3.x |

### Frontend

| Component | Technology | Version |
|-----------|-----------|---------|
| Framework | React | 19.2 |
| Build Tool | Vite | 7.3 |
| Styling | TailwindCSS | 4.2 |
| Editor | Monaco Editor | 4.7 |
| Animations | Framer Motion | 12.34 |
| Icons | Lucide React | 575+ |
| WebSocket | STOMP.js + SockJS | 7.3 |
| HTTP | Axios | 1.13 |
| Routing | React Router | 7.13 |

---

## Environment Variables

All configuration lives in a single `.env` file (see `.env.example`).

### Required

| Variable | Description | Example |
|----------|-------------|---------|
| `DB_USERNAME` | MySQL username | `root` |
| `DB_PASSWORD` | MySQL password | `s3cret` |
| `JWT_SECRET` | JWT signing key (min 32 chars) | `a-long-random-string...` |

### Feature Toggles

| Variable | Default | What it controls |
|----------|---------|------------------|
| `SPRING_PROFILES_ACTIVE` | *(empty)* | Set to `oauth` to enable Google OAuth2 login (requires `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`). Leave empty to disable. |
| `GOOGLE_CLIENT_ID` | *(empty)* | Google OAuth2 Client ID (from Google Cloud Console). Only needed when `SPRING_PROFILES_ACTIVE=oauth`. |
| `GOOGLE_CLIENT_SECRET` | *(empty)* | Google OAuth2 Client Secret. Only needed when `SPRING_PROFILES_ACTIVE=oauth`. |
| `GEMINI_API_KEY` | *(empty)* | Google Gemini API key. Enables AI hints, plagiarism detection, and mock interviews. Without it these features gracefully degrade (hints return a fallback, plagiarism defaults to "SUSPICIOUS"). |
| `MAIL_ENABLED` | `false` | Email OTP verification via Gmail SMTP. Set to `true` and provide Gmail credentials below. |
| `MAIL_USERNAME` | *(empty)* | Gmail address for SMTP. Only needed when `MAIL_ENABLED=true`. |
| `MAIL_PASSWORD` | *(empty)* | Gmail App Password. Only needed when `MAIL_ENABLED=true`. |

### Optional Overrides

| Variable | Default | Description |
|----------|---------|-------------|
| `DB_URL` | `jdbc:mysql://localhost:3306/codestorm...` | Full JDBC connection string. Docker Compose sets this automatically. |
| `DB_PORT` | `3307` | Host port mapped to MySQL in Docker Compose. Change if `3307` is taken. |
| `CORS_ALLOWED_ORIGINS` | `http://localhost:5173` | Comma-separated origins the backend allows. |
| `OAUTH_SUCCESS_REDIRECT` | `http://localhost:5173/oauth2/callback` | Where to redirect after OAuth2 login. |
| `COOKIE_SECURE` | `false` | Set to `true` in production (HTTPS-only cookies). |
| `VITE_BASE_URL` | `http://localhost:8080/api` | API base URL baked into the frontend at build time. |

---

## Future Roadmap

| Feature | Description |
|---------|-------------|
| **AI Code Reviews** | Gemini-powered line-by-line code review feedback |
| **Team Battles** | 2v2 and 3v3 team competitive modes |
| **Live Spectating** | Watch ongoing battles in real-time |
| **Problem Creation Studio** | AI-assisted problem statement & test case generation |
| **Mobile App** | React Native companion app |
| **Analytics Dashboard** | ML-powered skill gap analysis & personalized practice |

---

<div align="center">
<br>

*Built for DevHacks 2026*

<br>
</div>
