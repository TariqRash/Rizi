# RIZI Data/Form Integrity Audit (December 2025)

This document is the “platform-wide form/data integrity audit” for RIZI ريزي.

It covers:
- **Schema mappings** (DB ⇄ API ⇄ UI)
- **Referential integrity** expectations
- **CRUD coverage** per core model
- **Field existence** + shape drift risks
- **Validation sync** (client/server) and a plan to unify
- **Automation** hooks to keep this from drifting

## Core multi-tenancy contract

### Tenant context
All compound-scoped reads/writes must resolve an **active compound** context from:
- `x-compound-id` header OR
- `active_compound_id` cookie

If no compound context exists, compound-scoped API routes must return **400**.

### RBAC
Compound resources require the user to have a record in `CompoundRoleAssignment` for the active compound.

At a minimum, writes require `COMPOUND_ADMIN` (or higher, depending on future role model).

## DB schema inventory (Prisma)

Relevant models for the initial compound-management modules:

- `Compound`
- `CompoundRoleAssignment`
- `Building`
- `Unit`
- `Resident`
- `HouseholdMember`

Relationships (high level):
- `Compound 1→N Building`
- `Building 1→N Unit`
- `Compound 1→N Unit`
- `Unit 1→N Resident`
- `Resident 1→N HouseholdMember`
- `User 1→N CompoundRoleAssignment`

Key uniqueness/index constraints:
- `Compound`: `@@unique([name])`
- `CompoundRoleAssignment`: `@@unique([compoundId, userId])`
- `Building`: `@@unique([compoundId, name])`
- `Unit`: `@@unique([buildingId, number])` + `@@index([compoundId, status])`
- `Resident`: `@@unique([compoundId, userId])`

## CRUD coverage matrix (DB ↔ API ↔ UI)

Legend:
- ✅ present
- ⚠️ present but integrity risk
- ❌ missing

### Compound

| Operation | DB layer | API route | UI surface | Notes |
|---|---:|---:|---:|---|
| List my compounds | ✅ | ✅ `GET /api/compounds/my` | ✅ `/dashboard/select-compound` | Must be user-scoped, not compound-scoped |
| Select active compound | ✅ (cookie) | ✅ `POST /api/compounds/select` | ✅ `/dashboard/select-compound` | Sets `active_compound_id` |
| Create compound | ✅ | ✅ `POST /api/onboarding/create-compound` | ✅ `/onboarding/compound` | Must also create `CompoundRoleAssignment` for creator |
| Update compound | ❌ | ❌ | ❌ | Admin flow pending |
| Delete compound | ❌ | ❌ | ❌ | Likely restricted to platform admin |

### Building

| Operation | DB layer | API route | UI surface | Notes |
|---|---:|---:|---:|---|
| List buildings (by compound) | ✅ | ✅ `GET /api/buildings` | ✅ `/dashboard/admin/buildings` | Requires compound context + role |
| Create building | ✅ | ✅ `POST /api/buildings` | ✅ `/dashboard/admin/buildings` | Should enforce unique `(compoundId, name)` |
| Read building | ✅ | ✅ `GET /api/buildings/[id]` | ⚠️ (depends on UI) | Must ensure building belongs to active compound |
| Update building | ✅ | ✅ `PUT/PATCH /api/buildings/[id]` | ⚠️ (depends on UI) | Must enforce compound scoping |
| Delete building | ✅ | ✅ `DELETE /api/buildings/[id]` | ⚠️ (depends on UI) | Must ensure no cross-tenant deletes |

### Unit

| Operation | DB layer | API route | UI surface | Notes |
|---|---:|---:|---:|---|
| List units (by compound) | ✅ | ✅ `GET /api/units` | ✅ `/dashboard/admin/units` | Supports `buildingId` filter |
| Create unit | ✅ | ✅ `POST /api/units` | ✅ `/dashboard/admin/units` | Must ensure buildingId belongs to compound |
| Read unit | ✅ | ✅ `GET /api/units/[id]` | ⚠️ | Must ensure unit belongs to active compound |
| Update unit | ✅ | ✅ `PUT/PATCH /api/units/[id]` | ⚠️ | Must enforce compound scoping |
| Delete unit | ✅ | ✅ `DELETE /api/units/[id]` | ⚠️ | Must enforce compound scoping |

### Resident

| Operation | DB layer | API route | UI surface | Notes |
|---|---:|---:|---:|---|
| List residents | ✅ | ✅ `GET /api/residents` | ✅ `/dashboard/admin/residents` | Must be compound-scoped |
| Create resident | ✅ | ✅ `POST /api/residents` | ✅ `/dashboard/admin/residents` | Must validate unit belongs to compound |
| Read resident | ✅ | ✅ `GET /api/residents/[id]` | ⚠️ | Must ensure resident belongs to active compound |
| Update resident | ✅ | ✅ `PUT/PATCH /api/residents/[id]` | ⚠️ | Must enforce compound scoping |
| Delete resident | ✅ | ✅ `DELETE /api/residents/[id]` | ⚠️ | Must enforce compound scoping |

### HouseholdMember

| Operation | DB layer | API route | UI surface | Notes |
|---|---:|---:|---:|---|
| List household members for resident | ✅ | ✅ `GET /api/residents/[id]/household` | ✅ (resident details UI) | Must ensure resident belongs to compound |
| Add household member | ✅ | ✅ `POST /api/residents/[id]/household` | ✅ | Must ensure resident belongs to compound |
| Update household member | ✅ | ✅ `PUT/PATCH /api/household-members/[id]` | ⚠️ | Must ensure member’s resident belongs to compound |
| Delete household member | ✅ | ✅ `DELETE /api/household-members/[id]` | ⚠️ | Must ensure member’s resident belongs to compound |

## Integrity risks found (actionable)

### 1) Compound billing scoping drift
Prisma defines `Subscription.compoundId` as unique (1 subscription per compound), but several billing routes historically queried subscription by **userId**.

Status: **partially migrated** — `generate-invoice-storage` now reads compoundId from cookie/header, but still calls `db.subscription.findByUserId(user.id)` in the handler.

Impact:
- Wrong subscription fetched (or none) for compound-billing
- Drift between app assumptions and DB constraints

Fix recommendation:
- Introduce DB methods that match the schema: `subscription.findByCompoundId(compoundId)` / `subscription.updateByCompoundId(compoundId, ...)`.
- Deprecate userId-based subscription lookups for compound-billing.

### 2) Validation duplication
Many forms validate client-side ad-hoc (component-level checks) while APIs validate server-side ad-hoc.

Impact:
- UI accepts values server rejects / vice versa
- Hard to maintain across Arabic/English UI surfaces

Fix recommendation:
- Shared Zod schemas per module (Buildings/Units/Residents).

## Automation plan

1) **CI quality gates**
- `npm run test:all` (jsdom + node suites)
- `npm run lint`
- `npx tsc -p tsconfig.json --noEmit`
- `npm run build`

2) **Integrity script**
The repo already includes `npm run audit:data-integrity` (`src/scripts/dataIntegrityAudit.ts`).

Next step: extend this script to also:
- assert that compound-scoped API routes read compound context
- assert that billing routes don’t query subscriptions by userId (if compound billing is enforced)

3) **Schema + API drift checks**
A lightweight static checker should:
- parse Prisma schema (or use Prisma DMMF)
- verify that each model’s expected API routes exist
- verify route handlers are guarded by `withCompoundAuth` or an equivalent compound-context check

---

> This audit intentionally starts with Buildings/Units/Residents/HouseholdMembers because those are the first true multi-tenant CRUD domains. The same methodology extends cleanly to Service Requests, Visitors, Access Logs, and Facility Bookings.
