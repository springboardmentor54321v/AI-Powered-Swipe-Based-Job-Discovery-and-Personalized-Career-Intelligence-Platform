# SwipeX Database Design (Milestone 1 - Day 2)

This document specifies the database schema for **Users** and **Roles** in SwipeX, adhering to Milestone 1 architecture requirements.

---

## 1. Entity-Relationship Overview

```text
  ┌──────────────┐                  ┌──────────────┐
  │    roles     │ 1              * │    users     │
  ├──────────────┼──────────────────┼──────────────┤
  │ id (PK)      │                  │ id (PK)      │
  │ name         │                  │ name         │
  │ description  │                  │ email (UQ)   │
  │ created_at   │                  │ password_hash│
  └──────────────┘                  │ role_id (FK) ├───► references roles.id
                                    │ oauth_prov   │
                                    │ oauth_prov_id│
                                    │ is_active    │
                                    │ created_at   │
                                    │ updated_at   │
                                    └──────────────┘
```

### Relationship:
- **`users.role_id → roles.id`**
- **Cardinality**: 1-to-many (`roles` 1 ── * `users`).
- **Semantics**:
  - One role can belong to many users.
  - Each user has exactly **one primary role** in Milestone 1 (`JOB_SEEKER`, `RECRUITER`, or `ADMIN`).
  - Referential integrity: `ON DELETE RESTRICT` prevents deleting active roles associated with existing users.

---

## 2. Roles Table (`roles`)

Stores system role definitions and associated metadata.

| Field | Type | Modifiers | Purpose |
| :--- | :--- | :--- | :--- |
| **`id`** | `INTEGER` | Primary Key, Auto-increment | Unique role identifier |
| **`name`** | `VARCHAR(50)` | UNIQUE, NOT NULL, INDEX | Role name (`JOB_SEEKER`, `RECRUITER`, `ADMIN`) |
| **`description`** | `VARCHAR(255)` | NULLABLE | Human-readable role meaning and responsibilities |
| **`created_at`** | `TIMESTAMP WITH TIME ZONE` | NOT NULL | Record creation timestamp |

### Required Seed Roles (Milestone 1)

| Role Name | Description |
| :--- | :--- |
| **`JOB_SEEKER`** | Candidate discovering jobs, swiping, uploading resumes, and tracking applications. |
| **`RECRUITER`** | Employer/recruiter posting jobs, reviewing candidate applications, and managing pipelines. |
| **`ADMIN`** | Platform administrator managing user accounts, platform settings, and audit logs. |

---

## 3. Users Table (`users`)

Stores user credentials, primary role reference, external OAuth provider identities, and account lifecycle metadata.

| Field | Type | Modifiers | Purpose |
| :--- | :--- | :--- | :--- |
| **`id`** | `INTEGER` | Primary Key, Auto-increment | Unique user identifier |
| **`name`** | `VARCHAR(255)` | NOT NULL | Full user display name |
| **`email`** | `VARCHAR(255)` | UNIQUE, NOT NULL, INDEX | User login identity and contact email |
| **`password_hash`** | `VARCHAR(255)` | NULLABLE | Securely hashed password (nullable for OAuth-only users) |
| **`role_id`** | `INTEGER` | NOT NULL, INDEX, FK(`roles.id`) | Link to role; references `roles.id` |
| **`oauth_provider`** | `VARCHAR(50)` | NULLABLE | External login provider (e.g., `'google'`) |
| **`oauth_provider_id`** | `VARCHAR(255)` | NULLABLE | External provider unique subject identity |
| **`is_active`** | `BOOLEAN` | NOT NULL, DEFAULT `TRUE` | Account status flag (active / suspended) |
| **`created_at`** | `TIMESTAMP WITH TIME ZONE` | NOT NULL | Account creation timestamp |
| **`updated_at`** | `TIMESTAMP WITH TIME ZONE` | NOT NULL | Last account modification timestamp |

---

## 4. Security & Integrity Rules

1. **No Plain-text Passwords**: Passwords must never be stored in plain text. Stored representations use Django's robust PBKDF2 / Argon2 password hashing system via `AbstractBaseUser`.
2. **Nullable / Unusable Passwords**: Users registered purely via Google OAuth2 will not have a local password set initially; they are marked with an unusable password via `set_unusable_password()` and authenticate via Google until a local password is created.
3. **Unique Email Index**: Ensures each email is registered once, avoiding duplicate accounts across local and OAuth registration flows.
4. **Foreign Key Enforcement**: `role_id` strictly requires a valid ID in the `roles` table (`models.PROTECT`).
5. **Django Custom User**: Implemented in `apps.users.models.User` and configured via `AUTH_USER_MODEL = 'users.User'`.
