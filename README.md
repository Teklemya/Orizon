
# Orizon

Orizon is a secure, student-centered web application that guides international students — particularly from Africa and Latin America — through their entire study abroad journey, from pre‑arrival (passport, tests, applications, visa) to post‑arrival (housing, mentorship, campus life).

> This repository contains the **full-stack monorepo** for Orizon (React web app + Node/Express API + Postgres).

---

## Problem

International students face **fragmented, confusing, and high-stakes challenges** when applying to and settling into universities abroad. Barriers include:
- Lack of **centralized resources** for passport/application/visa steps
- Minimal **mentorship** and peer guidance
- Difficulty tracking **immigration deadlines**
- Challenges integrating **socially and academically** after arrival
- Disproportionate impact on underrepresented regions (Africa, Latin America)

These lead to **inequities**, **missed deadlines**, and **lower success rates**.

## Solution

**Orizon** provides a comprehensive, safe, and community-driven platform:

- **Personalized Roadmap** — auto-generated checklists with dependencies & reminders (passport → tests → applications → visa → arrival).
- **Community Q&A** — Stack‑Overflow style forum with moderation and AI‑assisted duplicate detection.
- **Essay Studio** — drafting with AI feedback (clarity, structure, tone) and mentor reviews.
- **Mentor Matching** — hybrid rules + similarity to connect students with alumni/mentors.
- **Scholarship & Opportunity Posting** — native posting with moderation and deduplication; optional ingestion from Telegram/Discord/Email; Orizon is the **source of truth**.
- **Post‑Arrival Hub** — housing/roommate matching and campus life resources.

We **intentionally avoid** risky file vaults (no passport/I‑20 uploads) and full multilingual localization; instead we’ll add a “simplify text” helper later.

---

## Architecture (High Level)

- **Frontend:** React (Next.js optional), Tailwind CSS, React Query
- **Backend:** Node.js + Express, PostgreSQL (with `pgvector`), Redis (jobs/cache)
- **Realtime:** Socket.IO (websockets) or Supabase Realtime
- **AI Services:** RAG/embeddings & lightweight classifiers (LangChain.js or Python FastAPI sidecar)
- **Auth/Security:** OAuth2/OIDC, JWT, RBAC, Helmet, CORS, rate limiting, moderation tools
- **Infra:** Docker, CI/CD (GitHub Actions), Vercel (web), Railway/Fly/Render (API), Neon/Supabase (Postgres)
- **Observability:** OpenTelemetry, Sentry, Grafana

### Modules (bounded contexts)
- `accounts` — auth, RBAC, profiles
- `roadmap` — rules engine, timelines, reminders
- `community` — Q&A, moderation, duplicate detection
- `essay` — editor, AI critique, versions
- `mentors` — profiles, matching, booking
- `opportunities` — native posting, ingestion connectors, dedupe, tagging
- `housing` — listings, roommate matching (post‑arrival)

---

## Data Model (Starter)

- **users**: id, email, role, profile (country, stage, languages, major), reputation
- **roadmap_steps**: id, user_id, step_key, title, status, due_date, deps[]
- **posts** (Q&A): id, author_id, title, body, tags[], accepted_answer_id
- **answers**: id, post_id, author_id, body, flags[]
- **mentors**: user_id, topics[], availability
- **matches**: id, mentee_id, mentor_id, score
- **scholarships**: id, title, description, deadline, eligibility (jsonb), link, status
- **sources**: id, scholarship_id, platform, source_msg_id, permalink, posted_by
- **moderation**: id, scholarship_id, moderator_id, action, reason

---

## API (Planned)

```
POST   /auth/register | /auth/login
GET    /roadmap       | PUT /roadmap/:id
GET    /qna/posts     | POST /qna/posts | POST /qna/posts/:id/answers
POST   /essay/critique (AI)  | GET /essay/:id/versions
GET    /mentors/suggest      | POST /mentors/match
POST   /opportunities        | GET /opportunities
POST   /opportunities/ingest (webhook for Telegram/Discord/Email)
POST   /opportunities/:id/approve | :id/reject
```

---

## Security & Ethics

- No PII file storage; no document vaults
- RBAC on every route; server-side authorization
- Moderation queue; fraud/misinformation flags
- Transparent AI usage; human-in-the-loop on sensitive flows
- Data encrypted in transit; least-privilege secrets

---

## Roadmap (Weeks 1–4)

**Week 1–2 (Requirements & Docs)**
- Personas, functional/non-functional requirements
- DB schema draft & ADR: Orizon as source of truth (native posting + ingestion)
- Wireframes & flows (dashboard, roadmap, Q&A, posting)

**Week 3 (Backend Foundation)**
- Express app, Postgres migrations (Prisma)
- Auth (JWT/OIDC), RBAC
- API skeleton for roadmap & opportunities
- Moderation states; basic dedupe (hash)

**Week 4 (Frontend Foundation)**
- React app, Tailwind, React Query
- Auth screens, dashboard shell
- Roadmap + opportunities (read-only → then create)
- Socket.IO wiring (live updates)

---

## Getting Started

### Prereqs
- Node 20+, PNPM or NPM
- Postgres 15+ (pgvector extension recommended)
- Redis (optional for jobs)
- Docker (optional)

### Setup
```bash
# clone
git clone <YOUR_REPO_URL> orizon
cd orizon

# install
pnpm install  # or npm install

# env
cp .env.example .env
# fill DB_URL, JWT_SECRET, etc.

# dev (API)
pnpm --filter @orizon/api dev

# dev (Web)
pnpm --filter @orizon/web dev
```

### Env Vars (`.env.example`)
```
DATABASE_URL=postgres://user:pass@localhost:5432/orizon
JWT_SECRET=change_me
REDIS_URL=redis://localhost:6379
# Optional connectors (later):
TELEGRAM_BOT_TOKEN=
DISCORD_BOT_TOKEN=
```

---

## Contributing

- Use conventional commits (e.g., `feat:`, `fix:`, `docs:`)
- Create an issue → branch → PR → peer review (2 approvals)
- PRs must pass CI, lint, tests

---

## Team
- Marko — Full Stack Support Engineer
- Yishak — Backend Lead
- Prosper — Security Engineer (Secure Development)
- Abdoul — Frontend Development

---

## License
TBD (MIT recommended for academic projects)
