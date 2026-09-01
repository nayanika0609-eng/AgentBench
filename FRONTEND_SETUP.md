# AgentBench Frontend — Setup Guide

## 1. Install dependencies

```bash
cd AgentBench/frontend
npm install
```

## 2. Configure environment

`frontend/.env` (already created):

```
VITE_API_BASE_URL=http://localhost:8002
```

Point this at wherever your backend is running.

## 3. Run the backend

```bash
cd AgentBench/backend
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

## 4. Run the frontend

```bash
cd AgentBench/frontend
npm run dev
```

Open the printed local URL (typically http://localhost:5173).

## Backend changes made (additive only)

1. **CORS middleware added to `backend/app/main.py`** — the backend had none, so
   a separately-hosted frontend could not call it at all. `allow_origins=["*"]`
   is used for local development; restrict this to your deployed frontend
   origin in production.
2. **`GET /documents/project/{project_id}`** added to `backend/app/routers/documents.py`
   (+ `DocumentService.list_documents` + `DocumentListItem` schema) — there was
   previously no endpoint to list a project's documents (only upload existed),
   which is required for the Knowledge Base UI. It also returns `chunk_count`
   per document (via a join on `document_chunks`) so the UI can show real
   indexed-chunk counts instead of inventing them.

No existing endpoint, schema, or business logic was modified.

## Frontend routes

| Route | Description |
|---|---|
| `/login`, `/register` | Auth |
| `/dashboard` | Stats + charts (uses `GET /dashboard/`, `GET /leaderboard/`) |
| `/projects` | Project CRUD |
| `/projects/:projectId` | Workspace — Overview / Documents / Benchmarks / Results / RAG / Reports tabs |
| `/benchmarks/:benchmarkId/results` | Per-model results, scores, RAG metrics, exports |
| `/benchmarks/:benchmarkId/compare` | Charts, radar, winner cards, comparison table |
| `/leaderboard` | Global model leaderboard |
| `/profile` | Current user info + logout |

## Backend endpoints integrated

`POST /auth/register`, `POST /auth/login`, `GET /users/me`,
`GET/POST/PUT/DELETE /projects`, `GET /documents/project/{id}` (new),
`POST /documents/upload/{project_id}`, `POST /projects/{id}/benchmarks`,
`GET /projects/{id}/benchmarks`, `GET/DELETE /benchmarks/{id}`,
`GET /results/{benchmark_id}`, `GET /comparison/{benchmark_id}`,
`GET /dashboard/`, `GET /leaderboard/`, `POST /rag/ask`,
`GET /export/{benchmark_id}/{json,csv,pdf}`.

## Notes

- Benchmark creation (`POST /projects/{id}/benchmarks`) runs **synchronously**
  on the backend — the request blocks until every selected model has
  generated and been evaluated. The frontend reflects this honestly with an
  indeterminate execution overlay (real elapsed-time counter, no fabricated
  progress percentage).
- Evaluation scores that come back as `null` (e.g. `semantic_similarity`,
  `context_relevance_score`) are rendered as "N/A" / "Not evaluated" —
  never silently coerced to `0`.
- JWT is stored in `localStorage` and attached via an Axios request
  interceptor; a 401 response anywhere triggers automatic logout.
