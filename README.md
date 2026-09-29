# AI-Powered Customer Support Refund System

A small full-stack refund support workflow. The backend owns policy decisions, AI classification, audit logging, and local JSON storage. The Next.js frontend provides a customer request form and an operations dashboard.

## Setup and run

### Docker

```bash
cp .env.example .env
# Edit .env and set OPENAI_API_KEY for live AI classification.
docker compose up --build
```

Docker Desktop must be running. Open http://localhost:3000 for the customer form and http://localhost:3000/admin for the request dashboard. Stop the stack with `docker compose down`. JSON files under `backend/data/` are mounted into the backend container and persist across restarts.

### Local development

```bash
npm install
npm run install:all
npm run dev
```

The backend runs on port 4000 and the frontend on port 3000. Open http://localhost:3000 and http://localhost:3000/admin. To stop both dev servers, press `Ctrl+C` in the terminal running `npm run dev`.

## Environment variables

Copy `.env.example` to `.env` at the repository root. For local development, the backend loads `backend/.env` if that file exists; otherwise it falls back to the repository-root `.env`. Environment variables already set in the shell take precedence. Restart the backend after changing environment values.

- `OPENAI_API_KEY`: required for live OpenAI requests. Keep this secret in `.env` or the runtime environment; never put it in frontend code or commit `.env`.
- `OPENAI_BASE_URL`: optional OpenAI-compatible API endpoint. Leave empty to use OpenAI's default endpoint.
- `AI_MODEL`: model name; defaults to `gpt-4o-mini`.
- `BACKEND_PORT`: backend host port; defaults to `4000`.
- `FRONTEND_PORT`: frontend host port; defaults to `3000` in Docker.
- `NEXT_PUBLIC_BACKEND_URL`: URL the browser uses to reach the backend; defaults to `http://localhost:4000`. For Docker on the host, keep this set to a browser-reachable host URL, not the compose service name.

Without `OPENAI_API_KEY`, the backend logs a warning and uses a deterministic mock classifier so the application remains usable. `AI_PROVIDER` is included in `.env.example` for clarity, but the current implementation uses the OpenAI-compatible client and does not switch providers based on that setting.

## Architecture

```text
Customer browser -> Next.js UI -> Express API -> JSON data store
                                      |\
                                      | -> deterministic policy engine (source of truth)
                                      | -> guarded OpenAI-compatible classifier / mock fallback
                                      ` -> requests.json audit log
```

`POST /api/refunds` accepts `{ customerId, orderId, message }`. It loads the matching records, evaluates `policy/policy.md` through pure rules, asks the backend-only AI layer to classify and draft language, applies escalation for AI-detected suspicion only when policy approved, then logs the complete decision. `GET /api/refunds` feeds the admin table. The frontend loads its dropdown choices from `GET /api/customers` and `GET /api/orders`; single-record helpers are available at `/api/customers/:id` and `/api/orders/:id`, and `/api/health` reports backend health.

## AI and guardrails

The AI system prompt explicitly treats customer text as data and keeps it separate from system policy instructions. Input is truncated and known prompt-injection phrases are neutralized. Output must validate against a Zod schema; API or parsing failures escalate rather than guess. The model cannot alter the rule fired or override a deterministic denial/escalation. It can add escalation to an otherwise approved request when its validated `suspicious` flag is true.

## Assumptions and trade-offs

- This is an assessment starter, so there is no authentication or authorization. The `/admin` page is intentionally public and must be protected before production use.
- For the AI layer, you need to provide an OpenAI API key in `.env` to get live classification. Without a key, the backend uses a deterministic mock classifier, so the full workflow still runs.
- JSON storage is simple and swappable through `backend/src/data/store.ts`, but it is not suitable for concurrent multi-instance production workloads.
- Seed data is synthetic and generated on first backend boot. Existing data files are preserved.
- CORS is permissive for local development. Production deployment should restrict origins and secrets.
