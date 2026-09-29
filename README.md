# AI-Powered Customer Support Refund System

A small full-stack refund support workflow. The backend owns policy decisions, AI classification, audit logging, and local JSON storage. The Next.js frontend provides a customer request form and an operations dashboard.

## Run with Docker

```bash
cp .env.example .env
# Add OPENAI_API_KEY to .env when you want live classification
docker-compose up --build
```

Open http://localhost:3000 for the customer form and http://localhost:3000/admin for the request dashboard. Without an API key, the backend uses a deterministic mock classifier, so the full workflow still runs. JSON files under `backend/data/` are mounted into the backend container and persist across restarts.

## Local development

```bash
npm install
npm run install:all
npm run dev
```

The backend runs on port 4000 and the frontend on port 3000. `NEXT_PUBLIC_BACKEND_URL` controls the browser-facing API URL.

## Architecture

```text
Customer browser -> Next.js UI -> Express API -> JSON data store
                                      |\
                                      | -> deterministic policy engine (source of truth)
                                      | -> guarded OpenAI-compatible classifier / mock fallback
                                      ` -> requests.json audit log
```

`POST /api/refunds` accepts `{ customerId, orderId, message }`. It loads the matching records, evaluates `policy/policy.md` through pure rules, asks the backend-only AI layer to classify and draft language, applies escalation for AI-detected suspicion only when policy approved, then logs the complete decision. `GET /api/refunds` feeds the admin table. Health and context helpers are available at `/api/health`, `/api/customers/:id`, and `/api/orders/:id`.

## AI and guardrails

The AI system prompt explicitly treats customer text as data and keeps it separate from system policy instructions. Input is truncated and known prompt-injection phrases are neutralized. Output must validate against a Zod schema; API or parsing failures escalate rather than guess. The model cannot alter the rule fired or override a deterministic denial/escalation. It can add escalation to an otherwise approved request when its validated `suspicious` flag is true.

## Assumptions and trade-offs

- This is an assessment starter, so there is no authentication or authorization. The `/admin` page is intentionally public and must be protected before production use.
- For the AI layer, you need to provide an OpenAI API key in `.env` to get live classification. Without a key, the backend uses a deterministic mock classifier, so the full workflow still runs.
- JSON storage is simple and swappable through `backend/src/data/store.ts`, but it is not suitable for concurrent multi-instance production workloads.
- Seed data is synthetic and generated on first backend boot. Existing data files are preserved.
- CORS is permissive for local development. Production deployment should restrict origins and secrets.
