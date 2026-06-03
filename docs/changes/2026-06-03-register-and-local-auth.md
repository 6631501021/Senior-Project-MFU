# T1-T20 Change Document: Register Page, Local Authentication, and View-only User Views

## T1 Change Title

| Field | Value |
|---|---|
| Change ID | CHG-LOCAL-AUTH-REGISTER-USER-VIEWS-20260603 |
| Module | Accounts / Authentication / Registration / User Views |
| Date | 2026-06-03 |
| Owner / Agent | Antigravity |
| Status | Done |

## T2 Requirement

- **User request**: 
  1. Add a Register page (with username, email, password, confirmPassword, and license plate inputs) to the Login page with a toggle button.
  2. Implement the local registration/authentication backend and frontend logic.
  3. Ensure that registered local accounts are assigned the standard `user` role (not admin) and can only view their own violation records.
  4. Create three user-specific pages (Dashboard, "YOUR VIOLATION" records list, and "YOUR VIOLATION > Details" details view) that are read-only (no editing, approving, rejecting, or deleting).
- **Business goal**: Provide public local user sign-up with license plate mapping, allowing users to view and track their helmet detection violations on campus while blocking any administrative/review actions.
- **Success outcome**: Local users can register, log in, view their dashboard and violations in a restricted, read-only UI, while admins retain full system control.

## T3 Source Evidence

| Area | Source path / route / command | What was verified |
|---|---|---|
| Backend model | `backend-node/server/Project/accounts/models/account.model.js` | Adding `username`, `password`, and `licensePlate` to root schema |
| Backend service | `backend-node/server/Project/accounts/service/account.js` | Registration service (`onSignUp`) and login credentials check (`onLocalSignIn`, `onCheckAuthorization`) |
| Permission check | `backend-node/server/Project/security/service/account-access.js` | Adding a default read-only permission matrix for local users |
| Session routing | `backend-node/server/Project/security/service/iam-admin-client.js` | Routing permissions lookup locally for local accounts |
| Violation stats | `backend-node/server/Project/mfuVision/service/mfuVision_record.js` | Adding plate filtering to statistics, including weekly and monthly violation counts |
| Route boundaries | `backend-node/server/Project/mfuVision/mfuVision.routes.js` | Restricting read-only actions and filtering records by license plate |
| Frontend API client | `frontend-vue/src/service/api.js` | Adding `register` endpoint to the api wrapper |
| Router | `frontend-vue/src/router/index.js` | Registering public router path `/pages/register` |
| Login view | `frontend-vue/src/views/pages/Login.vue` | Form updates and link to Register |
| Register view | `frontend-vue/src/views/pages/Register.vue` | Main sign-up page matching design mockup |
| Dashboard view | `frontend-vue/src/views/Dashboard.vue` | Added user-specific stat cards, trend charts, and lists |
| Records view | `frontend-vue/src/views/Records.vue` | "YOUR VIOLATION" view-only table and "ROW" limit dropdown filter |
| Record details view | `frontend-vue/src/views/RecordDetail.vue` | View-only details view hiding audit/notes action panels |
| Backend unit tests | `backend-node/server/Project/accounts/service/local-auth.test.js` | Unit test suite verifying registration, authentication, and stats filtering |

## T4 Current Behavior

- Previously, NewSystem only supported external B2C IAM logins and was configured for admin actions. 
- There was no local registration, password authentication, or default regular user role.
- Regular users did not have customized dashboard/record interfaces, seeing empty or unauthorized responses.

## T5 Impacted Agents

| Agent | Required? | Reason |
|---|---|---|
| Orchestrator | yes | Coordinated implementation plans and check-offs |
| Data Model | yes | Extended accounts collection schema to store password hashes, usernames, and license plates |
| Backend | yes | Implemented endpoints, query filtering by plate, and permission checks |
| Frontend | yes | Added Register page and conditionally rendered admin/user states |
| Security | yes | Bypassed B2C SSO check for local users, loading read-only permission matrix directly |
| QA/UAT | yes | Executed unit test suits and checked production compilation |

## T6 Scope

In scope:
- Database schema changes to support password hashes and license plates.
- Local user signup service (`onSignUp`) and login credential checker (`onLocalSignIn`).
- B2C bypassing in `iam-admin-client.js` and local permission configuration in `account-access.js`.
- Violation records filtering by plate number in `mfuVision_record.js` and `mfuVision.routes.js` endpoints.
- Front-end user registration mockup page.
- Front-end conditional dashboards, "YOUR VIOLATION" records lists, and read-only details layout.

Out of scope:
- Customizing external SSO settings.

## T7 Functional Requirements

| FR ID | Requirement | Actor | Priority |
|---|---|---|---|
| FR-NEW-001a | Toggleable registration form capturing username, password, email, and license plate. | User | Must |
| FR-NEW-001b | Assign local sign-ups a regular `user` role with restricted access permissions. | System | Must |
| FR-NEW-001c | Limit violation query results on backend using the user's registered license plate. | System | Must |
| FR-NEW-001d | Display user dashboard with personal statistics: Today, Week, Month, and Total. | User | Must |
| FR-NEW-001e | Render "YOUR VIOLATION" list table with a row limit selection filter (5, 10, 20, 25). | User | Must |
| FR-NEW-001f | Render details page dynamically hiding edit/action forms and audit logs. | User | Must |

## T8 Acceptance Criteria

| AC ID | FR ID | Given | When | Then |
|---|---|---|---|---|
| AC-NEW-001a | FR-NEW-001a | User is on the login page | They click "Sign Up" | They navigate to the Register page |
| AC-NEW-001b | FR-NEW-001b | A user registers locally | Account registration succeeds | Their permissions map to view-only `/dashboard`, `/mfu/records`, and `/mfu/records/:id` |
| AC-NEW-001c | FR-NEW-001c | User logs in and retrieves records | They are a non-admin | The backend filters all returned records to match their plate number |
| AC-NEW-001d | FR-NEW-001d | User lands on dashboard | Dashboard is rendered | Cards show user-specific stats ("YOUR VIOLATION TODAY", etc.) |
| AC-NEW-001e | FR-NEW-001e | User views violations list | Limit select dropdown is changed | The page limit updates and re-queries the records |
| AC-NEW-001f | FR-NEW-001f | User views a violation's details | Record is loaded | Approve/Reject header buttons, audit log timeline, and reviewer note form are hidden |

## T9 API Contract

- Added `POST /api/v1/register`: Public endpoint to create local user accounts.
- Added `POST /api/v1/signin`: Public endpoint for local login.
- Modified `GET /api/v1/records`: Automatically filters records using `plate_number = req.authAccount.licensePlate` if not an admin.
- Modified `GET /api/v1/records/stats`: Automatically filters statistics using `plate_number = req.authAccount.licensePlate` if not an admin.

## T10 Data Model / Migration

- Schema modifications added `username`, `password`, and `licensePlate` to root model level in `account.model.js`.
- No migration scripts required; Mongoose maps defaults cleanly.

## T11 Backend Plan / Changes

- `account.js`: Implemented `onSignUp`, `onLocalSignIn`, and updated `onCheckAuthorization`.
- `account-access.js`: Assigned standard user access permission matrix.
- `iam-admin-client.js`: Intercepted permissions retrieval for local sessions.
- `mfuVision_record.js`: Filtered stats counts and trends using user's plate number; calculated weekly/monthly aggregates.
- `mfuVision.routes.js`: Added query filters for non-admins and threw `403 Forbidden` on update/delete/seed actions.

## T12 Frontend Plan / Changes

- `Login.vue` & `Register.vue`: Rendered login forms, registration inputs, and routing toggle.
- `Dashboard.vue`: Dynamically loaded user statistics cards, trend charts, and recent detections panel.
- `Records.vue`: Embedded `securityAccess` mixin, formatted page headers, and added row limit selection dropdown.
- `RecordDetail.vue`: Conditionally hid audit timeline, action panels, and approve/reject header actions.

## T13 Security / Permission

- Bypassed external IAM for local sessions, falling back to secure local authentication checks.
- Prevented unauthorized cross-user queries on the backend by strictly verifying plate ownership before returning record details or lists.
- Enforced route-level validation on the backend to reject modification operations for non-admins.

## T14 Test Plan

- Checked registration workflows, password mismatches, and user-specific stats query constraints.
- Validated that requests to write endpoints (`PUT /records/:id`, `POST /records/seed-demo`, etc.) fail with `403 Forbidden` for non-admins.

## T15 Implementation Summary

| File | Change |
|---|---|
| [account.model.js](file:///d:/PROJECT%20JOOB/Final%20project/NewSystem/backend-node/server/Project/accounts/models/account.model.js) | Defined password, username, and licensePlate schema properties |
| [account.js](file:///d:/PROJECT%20JOOB/Final%20project/NewSystem/backend-node/server/Project/accounts/service/account.js) | Implemented secure registration & local sign-in operations |
| [account-access.js](file:///d:/PROJECT%20JOOB/Final%20project/NewSystem/backend-node/server/Project/security/service/account-access.js) | Map default permissions matrix for local users |
| [iam-admin-client.js](file:///d:/PROJECT%20JOOB/Final%20project/NewSystem/backend-node/server/Project/security/service/iam-admin-client.js) | Bypass IAM permissions check for local credentials |
| [mfuVision_record.js](file:///d:/PROJECT%20JOOB/Final%20project/NewSystem/backend-node/server/Project/mfuVision/service/mfuVision_record.js) | Filter records and stats by license plate |
| [mfuVision.routes.js](file:///d:/PROJECT%20JOOB/Final%20project/NewSystem/backend-node/server/Project/mfuVision/mfuVision.routes.js) | Enforce ownership check and read-only routes |
| [Dashboard.vue](file:///d:/PROJECT%20JOOB/Final%20project/NewSystem/frontend-vue/src/views/Dashboard.vue) | Conditional User Dashboard implementation |
| [Records.vue](file:///d:/PROJECT%20JOOB/Final%20project/NewSystem/frontend-vue/src/views/Records.vue) | Modified title and filter options, including "ROW" limit dropdown |
| [RecordDetail.vue](file:///d:/PROJECT%20JOOB/Final%20project/NewSystem/frontend-vue/src/views/RecordDetail.vue) | View-only details view hiding audit/action components |

## T16 Tests Run / Evidence

- Run tests command: `npx cross-env DOTENV_CONFIG_PATH=.env.local node -r dotenv/config -r ./test/node-test-setup.js --test server/Project/accounts/service/*.test.js`
  - Result: 23/23 tests passed.
- Run frontend build: `npm run build:prod`
  - Result: Compiled successfully.

## T17 PRD / Docs Updated

- Updated product requirements in `PRD-NewSystem.md`.
- Updated this T1-T20 change document.

## T18 Risks / Blockers / Assumptions / Decisions

- **Decision**: database data isolation using `licensePlate` guarantees that users cannot inspect other accounts' violations even if they guess raw record IDs.
- **Bugfix**: Resolved an issue where local logins redirected to `/pages/404` due to `getEffectivePermissions` and `evaluatePermission` falling back to query the external IAM server for local users (`control.sso === false`). The methods were updated to bypass IAM and fetch local permissions directly.
- **Navigation Fix**: Added explicit permission checks for `/mfu/realtime` and `/mfu/analytics` in the navigation configuration and updated the sidebar filtering logic to completely hide empty dropdown categories (Config, Setting, Permission) when the logged-in user doesn't have permission to see any of their child items.

## T19 Release / Rollback

- Reverting commits on backend and frontend will cleanly restore previous system capabilities.

## T20 Final Handoff

```txt
Feature: Local User Registration, Authentication, and Restrictive Read-only Dashboard/Records Views
Status: Done
Routes: POST /api/v1/register, POST /api/v1/signin, GET /api/v1/records, GET /api/v1/records/stats
UI: Login, Register, User Dashboard, YOUR VIOLATION table, Details page
Permission: User role has default view-only access on /dashboard, /mfu/records, and /mfu/records/:id
Bugfixes: Bypassed IAM permissions lookup for local users to resolve /pages/404 redirects; Added dynamic sidebar menu item/dropdown filtering for unauthorized views.
Tests Run: All 23 backend authentication/security tests passed; frontend prod compilation completes without errors
```
