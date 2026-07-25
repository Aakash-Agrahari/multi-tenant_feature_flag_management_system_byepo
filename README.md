# Feature Flag Management Platform

A production-style, multi-tenant feature flag SaaS platform — one Express/MongoDB backend serving three independent React (Vite) frontends for **Super Admins**, **Organization Admins**, and **End Users**.

Built with deterministic percentage rollouts, full audit logging, and scheduled feature releases.

---

## 1. Architecture Overview

```
feature-flag-platform/
├── backend/                 Express + MongoDB API (MVC architecture)
├── super-admin-portal/      React app — platform-wide administration
├── org-admin-portal/        React app — per-organization flag management
├── end-user-portal/         React app — feature availability for end users
└── Feature-Flag-Platform.postman_collection.json
```

### Backend (MVC)

```
backend/
├── config/          Environment-driven config (db connection, role constants)
├── models/          Mongoose schemas: Organization, User, FeatureFlag, AuditLog
├── controllers/      Business logic
├── routes/           Express routers (thin — just wiring)
├── middleware/        auth, role authorization, org-scoping, validation, error handling
├── validators/         express-validator chains per resource
├── utils/              ApiError, asyncHandler, standardized responses, rollout hashing
├── scripts/            Super Admin seeding, scheduled-release cron job
├── app.js               Express app assembly (helmet, cors, morgan, routes)
└── server.js             Entry point
```

**Design decisions worth knowing:**

- **Multi-tenancy / org isolation** is enforced centrally in `middleware/scopeToOrg.js`, which derives `req.orgId` from the authenticated user's JWT (never from client input) for Org Admins and End Users. Every flag/audit/user query is filtered by this value, so one organization can never see another's data. Super Admins bypass this scope since they operate platform-wide.
- **Percentage rollout** (`utils/rollout.js`) is deterministic, not "first X% of users." Each user is bucketed via `SHA-256(featureKey:identifier) mod 100`, so the same user always lands in the same bucket for a given flag — consistent across sessions, refreshes, and server restarts, and independent of how many other users exist.
- **Scheduled releases** are evaluated *live* on every read (`isLive()` / `evaluateFlagForUser()` in the flag model/utils), not by a batch job that flips a boolean. This means correctness never depends on a background process running. A `node-cron` job still runs every minute purely for observability/logging — a natural hook point for future webhook/Slack notifications.
- **Audit logs** are written transactionally alongside every CREATE/UPDATE/DELETE/ENABLE/DISABLE action, capturing who, what org, what flag, previous state, new state, and timestamp.
- **Auth** is fully custom: JWT signed with `jsonwebtoken`, passwords hashed with `bcrypt` (10 salt rounds), no third-party auth providers.

### Data Model

| Collection | Key relationships & indexes |
|---|---|
| `Organization` | `createdBy → User`. Unique `name`/`slug`. |
| `User` | `organization → Organization` (null for Super Admin). Compound index `{organization, role}`. Password never returned by default (`select: false`). |
| `FeatureFlag` | `organization → Organization`. Compound **unique** index `{organization, key}` — same key can exist in different orgs, never twice in one org. |
| `AuditLog` | `organization → Organization`, `featureFlag → FeatureFlag` (nullable — survives flag deletion via denormalized `featureKey`). Index `{organization, createdAt: -1}` for fast recent-history queries. |

### Frontends

All three are independent Vite + React apps (separate `package.json`, separate dev servers, separate ports) that talk to the same backend via `VITE_API_BASE_URL`. Each stores its own JWT under a distinct `localStorage` key (`sap_token`, `oap_token`, `eup_token`) so you can be logged into all three simultaneously in the same browser without collisions.

| Portal | Port | Color identity | Capabilities |
|---|---|---|---|
| Super Admin | 5173 | Indigo | Login, create/view organizations, org-level stats |
| Org Admin | 5174 | Teal | Signup/login, full flag CRUD, rollout %, scheduling, enable/disable, search/filter, audit log viewer, end-user provisioning |
| End User | 5175 | Amber | Login, see which features are available to them and why |

---

## 2. Prerequisites

- **Node.js** 18+ and npm
- **MongoDB** running locally (or a connection string to Atlas/remote instance)

---

## 3. Backend Setup

```bash
cd backend
npm install
cp .env.example .env
```

Edit `.env`:

```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://127.0.0.1:27017/feature_flag_platform
JWT_SECRET=replace_this_with_a_long_random_secret_of_your_own
JWT_EXPIRES_IN=7d
CORS_ORIGINS=http://localhost:5173,http://localhost:5174,http://localhost:5175
SUPER_ADMIN_EMAIL=superadmin@platform.com
SUPER_ADMIN_PASSWORD=keep_your_password_here
SUPER_ADMIN_NAME=Platform Super Admin
```

Make sure MongoDB is running, then seed the Super Admin account (there is no public signup for this role by design):

```bash
npm run seed:superadmin
```

Start the API:

```bash
npm run dev      # auto-restarts on file changes (node --watch)
# or
npm start
```

The API will be live at `http://localhost:5000/api`. Verify with:

```bash
curl http://localhost:5000/api/health
```

---

## 4. Frontend Setup

Each portal is set up the same way. Open **three separate terminals**.

### Super Admin Portal
```bash
cd super-admin-portal
npm install
cp .env.example .env      # VITE_API_BASE_URL=http://localhost:5000/api
npm run dev                # http://localhost:5173
```

### Organization Admin Portal
```bash
cd org-admin-portal
npm install
cp .env.example .env
npm run dev                # http://localhost:5174
```

### End User Portal
```bash
cd end-user-portal
npm install
cp .env.example .env
npm run dev                # http://localhost:5175
```

---

## 5. Walking Through the Product

1. **Super Admin** (`http://localhost:5173`) — log in with the seeded credentials from your `.env`. Create an organization (e.g. "Acme Corp").
2. **Org Admin** (`http://localhost:5174/signup`) — since Org Admins self-register, sign up with any organization name (you can create a *new* one here too — signup creates both the org and the admin in one step) or use one created by the Super Admin. Log in, then:
   - Create a feature flag, e.g. key `new-checkout-flow`, rollout `50%`, enabled.
   - Optionally set a scheduled release time in the future to see the "Scheduled" badge.
   - Toggle it on/off and watch the Audit Logs page record every action.
   - Create an End User account under **End Users**.
3. **End User Portal** (`http://localhost:5175`) — log in with the end-user credentials the Org Admin just created. You'll see every flag in that organization along with whether it's available to you and why (disabled / scheduled / in-rollout / excluded-from-rollout). Refresh — the result is deterministic and won't flip randomly.

---

## 6. API Reference (summary)

Full request/response examples are in **`Feature-Flag-Platform.postman_collection.json`** — import it into Postman and set the `baseUrl` variable (defaults to `http://localhost:5000/api`). Tokens are captured automatically into collection variables as you run the Auth requests.

| Method | Endpoint | Role | Description |
|---|---|---|---|
| POST | `/auth/super-admin/login` | Public | Super Admin login |
| POST | `/auth/org-admin/signup` | Public | Create org + first Org Admin |
| POST | `/auth/login` | Public | Org Admin / End User login |
| GET | `/auth/me` | Authenticated | Current user profile |
| POST | `/organizations` | Super Admin | Create organization |
| GET | `/organizations` | Super Admin | List all organizations |
| GET | `/organizations/:id` | Super Admin | Get one organization |
| GET | `/organizations/:id/stats` | Super Admin | Org-level statistics |
| POST | `/flags` | Org Admin | Create feature flag |
| GET | `/flags?search=&status=` | Org Admin | List/search/filter flags |
| GET | `/flags/:id` | Org Admin | Get one flag |
| PATCH | `/flags/:id` | Org Admin | Update flag (name, rollout %, schedule, etc.) |
| PATCH | `/flags/:id/toggle` | Org Admin | Enable/disable flag |
| DELETE | `/flags/:id` | Org Admin | Delete flag |
| GET | `/flags/evaluate` | End User | Evaluate all flags for the caller |
| GET | `/flags/evaluate/:key` | End User | Evaluate a single flag for the caller |
| GET | `/audit-logs?page=&limit=` | Org Admin | Paginated audit history |
| POST | `/users/end-users` | Org Admin | Provision an End User |
| GET | `/users/end-users` | Org Admin | List End Users |
| GET | `/stats/dashboard` | Super Admin / Org Admin | Role-aware dashboard summary |
| GET | `/health` | Public | Health check |

All responses follow the envelope: `{ success, message, data?, meta? }`. Errors follow `{ success: false, message, errors? }`.

---

## 7. Security Notes

- Passwords are hashed with bcrypt and never returned in any API response (`select: false` at the schema level).
- `helmet` sets standard security headers; `cors` is locked to an explicit origin allow-list via `CORS_ORIGINS`.
- All mutating endpoints require both authentication (`authenticate`) and role authorization (`authorize(...)`), plus org-scoping (`scopeToOrg`) for tenant isolation.
- Centralized error handling ensures stack traces and internal errors never leak to clients in production.

## 8. Known Extension Points

- Wire the scheduled-release cron job (`backend/scripts/scheduledReleaseChecker.js`) to a webhook/Slack notifier when a release goes live.
- Add refresh tokens / shorter-lived access tokens for stronger session hygiene.
- Add a "kill switch" audit view showing rollout-percentage history as a timeline.
