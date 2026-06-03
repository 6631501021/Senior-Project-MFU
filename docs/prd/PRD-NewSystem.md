# PRD: NewSystem

## Document Control

| Field | Value |
|---|---|
| Product | NewSystem |
| Version | 0.1 |
| Status | Baseline From Current Repo |
| Source checked date | 2026-05-28 |
| Related workflow | `docs/AI-WORKFLOW.md` |
| Related agents | `docs/agents/README.md` |

## Source Truth

This PRD must stay aligned with current source. If source and PRD conflict, source wins until PRD is updated.

| Area | Source |
|---|---|
| Backend mounted routes | `backend-node/server/routes/app.routes.js` |
| Backend module routes | `backend-node/server/Project/*/*.routes.js` |
| Frontend routes | `frontend-vue/src/router/index.js` |
| Frontend API wrapper | `frontend-vue/src/service/api.js` |
| Test commands | `backend-node/package.json`, `frontend-vue/package.json` |

## Product Overview

NewSystem is an IAM-integrated agreement management system for MFU. It provides:

- NewSystem document registry
- IAM delegated authentication and permission filtering
- account directory and lifecycle surfaces
- security permission management
- settings, runtime access, backup, email, and HR/reference data management
- Vue frontend and Node.js backend delivery through Docker/GitLab pipeline

## Current Mounted Backend Routes

| Mount | Route file | Notes |
|---|---|---|
| `/api/v1/mfu` | `backend-node/server/Project/mfuVision/mfuVision.routes.js` | helmet detection records API |
| `/video_helmet` | `backend-node/config/express.js` | Helmet Detection stream proxy |
| `/video_moto` | `backend-node/config/express.js` | Motorcycle Tracking stream proxy |
| `/video_plate` | `backend-node/config/express.js` | License Plate stream proxy |
| `/api/records` | `backend-node/config/express.js` | legacy 10 latest records API (no auth) |
| `/api/v1/newSystem` | `backend-node/server/Project/newSystem/newSystem.routes.js` | document registry API |
| `/api/v1/setting` | `backend-node/server/Project/settings/settings.routes.js` | settings/runtime/backup/email/HR/reference APIs |
| `/api/v1/security` | `backend-node/server/Project/security/security.routes.js` | security/RBAC/audit proxy APIs |
| `/api/v1` | `backend-node/server/Project/accounts/accounts.routes.js` | sign-in, auth/session, account APIs |

Known compatibility note:

- `frontend-vue/src/service/api.js` currently calls document endpoints with lowercase `/api/v1/newsystem/...`.
- Backend route mount is `/api/v1/newSystem`.
- Any change touching this area must verify runtime compatibility before changing casing.

## Current Frontend Route Domains

| UI route | Permission | View |
|---|---|---|
| `/dashboard` | `/dashboard:view` | `src/views/Dashboard` |
| `/mfu/realtime` | - | `src/views/RealTimeDetection` |
| `/mfu/records` | - | `src/views/Records` |
| `/mfu/records/:id` | - | `src/views/RecordDetail` |
| `/mfu/analytics` | - | `src/views/Analytics` |
| `/newSystem/registry` | `/newsystem/registry:view` | `projects/views/newSystem/NewSystemRegistry` |
| `/operations/business` | `/operations/business:view` | `projects/views/operations/BusinessOperations` |
| `/accounts/directory` | `/accounts/directory:view` | `projects/views/accounts/Management` |
| `/security/permissions/menu` | `/security/permissions/menu:view` | `projects/views/security/CreateMenu` |
| `/security/permissions/group` | `/security/permissions/group:view` | `projects/views/security/CreateGroup` |
| `/security/permissions/matrix` | `/security/permissions/matrix:view` | `projects/views/security/PermissionMatrix` |
| `/security/audit` | `/security/audit:view` | `projects/views/security/AuditExplorer` |
| `/config/*`, `/setting/*` | matching config/setting permission | `projects/views/setting/*` |

## Functional Areas

### FR-NEW-001 Authentication And Session

Users can sign in locally or via Google, sign up locally, bootstrap session through `/auth/me`, manage sessions, use 2FA, and manage trusted devices.

#### Local Registration and Authentication
- **Local Sign Up**: Accessible publicly at `/pages/register` (frontend) and `/api/v1/register` (backend). Captures `username`, `email`, `password`, `confirmPassword`, and `licensePlate` (stored in `userinfo.licensePlate` in the `Information_Accounts` collection).
- **Local Sign In**: Handles local email/password credentials via `POST /api/v1/signin` (intercepted to verify locally if the user is registered locally), provisioning a local token stored in `control.device`.
- **Session Interceptors**: Requests with a local session token to `/auth/me`, `/auth/sessions`, and `/auth/logout` are processed locally using the database, bypassing the external IAM/B2C IAM servers.

Source:

- `backend-node/server/Project/accounts/accounts.routes.js`
- `backend-node/server/Project/accounts/service/account.js`
- `backend-node/server/Project/accounts/models/account.model.js`
- `frontend-vue/src/store/modules/Authen/index.js`
- `frontend-vue/src/views/pages/Login.vue`
- `frontend-vue/src/views/pages/Register.vue`

### FR-NEW-002 Account Directory And Lifecycle

Authorized users can list accounts, invite/update accounts, manage status, lifecycle, sessions, trusted devices, and effective permissions.

Source:

- `backend-node/server/Project/accounts/accounts.routes.js`
- `frontend-vue/src/store/modules/Accounts/index.js`
- `frontend-vue/src/projects/views/accounts`

### FR-NEW-003 NewSystem Document Registry

Authorized users can list, create, update, delete, seed demo, and view stats for NewSystem documents.

Source:

- `backend-node/server/Project/newSystem/newSystem.routes.js`
- `backend-node/server/Project/newSystem/service/newSystem_document.js`
- `backend-node/server/Project/newSystem/models/newSystem_document.model.js`
- `frontend-vue/src/projects/views/newSystem/NewSystemRegistry.vue`

Current API contract:

| Method | Endpoint | Permission |
|---|---|---|
| GET | `/api/v1/newSystem/documents` | `/newsystem/registry:view` |
| GET | `/api/v1/newSystem/documents/stats` | `/newsystem/registry:view` or `/newsystem/reports:view` |
| POST | `/api/v1/newSystem/documents` | `/newsystem/registry:edit` |
| PUT | `/api/v1/newSystem/documents/:id` | `/newsystem/registry:edit` |
| DELETE | `/api/v1/newSystem/documents/:id` | `/newsystem/registry:delete` |
| POST | `/api/v1/newSystem/documents/seed-demo` | `/newsystem/registry:edit` |

### FR-NEW-004 Security And Permission Management

Authorized users can manage security types, menus, groups, permission matrix, assignments, and audit events through IAM admin proxy routes.

Source:

- `backend-node/server/Project/security/security.routes.js`
- `frontend-vue/src/store/modules/Security`
- `frontend-vue/src/projects/views/security`

### FR-NEW-005 Settings And Operations

Authorized users can manage setting messages, auth messages, status, groups, verification, email notifications/workflows, runtime access, database backup, lifecycle, HR, and reference data.

Source:

- `backend-node/server/Project/settings/settings.routes.js`
- `frontend-vue/src/store/modules/Setting/index.js`
- `frontend-vue/src/projects/views/setting`

### FR-NEW-006 MFU Vision Detection Records

Authorized users can view helmet violation analytics, list records, approve/reject detection records, view real-time streams proxied from external AI services, and manage audit logs.

Source:

- `backend-node/server/Project/mfuVision/mfuVision.routes.js`
- `backend-node/server/Project/mfuVision/models/mfuVision_record.model.js`
- `backend-node/server/Project/mfuVision/service/mfuVision_record.js`
- `frontend-vue/src/store/modules/MfuVision/index.js`
- `frontend-vue/src/views/Dashboard.vue`
- `frontend-vue/src/views/RealTimeDetection.vue`
- `frontend-vue/src/views/Records.vue`
- `frontend-vue/src/views/RecordDetail.vue`
- `frontend-vue/src/views/Analytics.vue`

Current API contract:

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/v1/mfu/records` | list detection records with filtering and pagination |
| GET | `/api/v1/mfu/records/stats` | fetch violation summary stats, hourly trend, breakdowns |
| GET | `/api/v1/mfu/records/:id` | retrieve single record detail by id |
| POST | `/api/v1/mfu/records` | create a new detection record (triggered by AI inference pipelines) |
| PUT | `/api/v1/mfu/records/:id` | update status, reviewer info, internal notes |
| DELETE | `/api/v1/mfu/records/:id` | remove violation record |
| POST | `/api/v1/mfu/records/seed-demo` | seed 50 demo records spanning 7 days for testing |

Data Schema (`mfu_records` collection):

- `plate_number`: String (Thai alphabet/number)
- `timestamp`: Date (detection time)
- `location`: String (installation point)
- `camera_id`: String (device ID)
- `violation_type`: String (no_helmet, unauthorized_entry, speeding, other)
- `image_url`: String (snapshot evidence path)
- `plate_image_url`: String (cropped license plate image path)
- `confidence`: Number (AI detection score 0.0 - 1.0)
- `status`: String (pending, approved, rejected)
- `reviewer`: String (assigned admin)
- `review_note`: String (observations/notes)
- `ai_metadata`: Object (YOLO pt file, inference time, detection counts)

## Non-Functional Requirements

| Area | Requirement |
|---|---|
| Security | protected routes require authentication and permission middleware |
| Maintainability | follow repo style before introducing new abstractions |
| Frontend structure | new UI work must be component-based |
| Compatibility | preserve existing API/response shape unless FR explicitly changes it |
| Testing | implementation must run scoped tests before handoff |
| Documentation | changes must produce T1-T20 handoff and PRD update decision |

## PRD Update Rules

Update this PRD when any change affects:

- FR/AC
- API endpoint, request, response, error behavior
- frontend route, page behavior, component workflow
- schema, migration, seed, index, rollback
- permission path/action/data scope
- test or release expectation

Use `docs/AI-WORKFLOW.md` section `T1-T20` for change documentation.
