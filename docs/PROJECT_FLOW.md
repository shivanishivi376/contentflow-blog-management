# 🌊 MERN Stack Blog Project - Application Flow & Architecture

This document details the system architecture, data models, end-to-end data flows, and core user journeys within the Collaborative Blog Writing & Publishing Platform.

---

## 1. High-Level Architecture Flow

The platform follows a layered MERN architecture with clean separation between UI components, business logic, data persistence, and external service adapters.

```
[ Browser / React 19 Client ]
        │
        ▼ (Axios REST + Centralized Auth Tokens)
[ Express 5 Middleware Pipeline ]
   ├── rateLimiter (authLimiter, publicLimiter)
   ├── actorAuthMiddleware (Polymorphic: Admin or User/Team)
   ├── authMiddleware / adminAuthMiddleware
   ├── teamMembershipMiddleware & teamPermissionMiddleware
   └── validateRequest (Joi Schema Validation)
        │
        ▼
[ Controllers Layer (21 Controllers) ]
        │
        ▼
[ Services Layer (25 Business Logic Services) ]
   ├── Generative AI (OpenRouter / Gemini)
   ├── Google OAuth Verification (google-auth-library)
   ├── Dev.to Cross-Publishing (Turndown + REST)
   ├── Media Delivery (Cloudinary via Multer stream)
   └── Email Notifications (Nodemailer SMTP)
        │
        ▼
[ Repository Data Access Layer (13 Repositories) ]
        │
        ▼
[ MongoDB Database (18 Mongoose Schemas & Compound Indexes) ]
```

1. **Client Tier (React 19 / Vite 8)**:
   - Global application state is managed via Redux Toolkit (`auth` and `admin` slices) with `localStorage` persistence.
   - Reusable UI primitives (`CustomerComponents.jsx`) and Material UI 9 provide a unified design system.
   - `ConfirmationContext` (`useConfirm()`) supplies accessible, promise-based confirmation modals for destructive operations (logout, deletions, unlinking configurations).
2. **Routing & Middleware Pipeline (Express 5)**:
   - `actorAuthMiddleware` enables polymorphic authentication across taxonomy routes (`/api/categories`, `/api/subcategories`, `/api/keywords`), identifying whether the actor is an Admin or a User/Team member.
   - `authMiddleware` and `adminAuthMiddleware` protect standard and administrative endpoints respectively.
   - `teamMembershipMiddleware` and `teamPermissionMiddleware` enforce role-based access for team members according to the `TEAM_WORKFLOW_PERMISSIONS` matrix.
3. **Services & Repositories Tier**:
   - Controllers remain thin HTTP wrappers delegating all workflows, validation, and third-party integrations to dedicated service modules.
   - Repositories abstract all Mongoose queries, keeping services cleanly decoupled from database-specific concerns.

---

## 2. Core User Journeys & Workflows

### A. Dual Authentication & Onboarding Journey

```
[ New User ] ──► Sign Up (Email/Password) ─────────┐
      │                                             ▼
      └────────► Continue with Google ──► [ Verify ID Token ] ──► [ Provision User ]
                                                                        │
                                                                        ▼
                                                         [ Redirect to /onboarding ]
                                                                        │
                                             ┌──────────────────────────┴──────────────────────────┐
                                             ▼                                                     ▼
                                     [ Individual Mode ]                                   [ Team Mode ]
                                             │                                                     │
                                     Select Interests                                      Create Team Name
                                             │                                             Assign Initial Role
                                             │                                             Invite Teammates
                                             │                                                     │
                                             └──────────────────────────┬──────────────────────────┘
                                                                        ▼
                                                         [ Redirect to /dashboard ]
```

1. **Local Signup & Login**:
   - Signup verifies uniqueness of email and username, validates optional team invitation tokens, and hashes passwords using `bcryptjs`.
   - Login generates a short-lived **JWT Access Token** (15m) and a rotating **JWT Refresh Token** (7d) stored securely in `localStorage`.
2. **Google OAuth Sign-In**:
   - The user clicks **Continue with Google** (`GoogleAuthButton.jsx`).
   - The client receives an ID token from Google Identity Services and sends it to `POST /api/auth/google`.
   - The backend validates the ID token's signature, audience (`GOOGLE_CLIENT_ID`), and email verification claim using `google-auth-library`.
   - If a matching account already exists: the user is automatically linked to Google without altering their password.
   - If new: an `INDIVIDUAL` account is created with `authProvider: 'GOOGLE'` and `onboardingCompleted: false`.
3. **Onboarding**:
   - Users with `onboardingCompleted: false` are routed to `/onboarding`.
   - Users choose **Individual** (solo blogging) or **Team** (newsroom collaboration).
   - Team creators define team settings and send email or link invitations with predefined roles (`Writer`, `Reviewer`, `Publisher`).
   - Users select interest tags to personalize their feed.

---

### B. Editorial Workflow Journey (7 Statuses)

```
[ DRAFT ]
   │
   ▼ (Team Owner assigns Writer, Reviewer, Publisher)
[ IN_WRITING ] ◄─────────────────────────────────────────┐
   │                                                     │
   ▼ (Assigned Writer submits content)                   │
[ IN_REVIEW ]                                            │ (Writer resumes edits)
   │                                                     │
   ├──► [ RE_ASSIGN ] ───────────────────────────────────┘
   │       (Reviewer rejects; automated revision comment created)
   │
   ▼ (Reviewer approves content)
[ IN_PUBLISHING ]
   │
   ├──► [ PUBLISHED ] ──► (Dev.to Cross-Publishing via Modal or Auto-Sync)
   │
   ▼ (Validation fails)
[ PUBLISH_FAILED ] ──► (Publisher clicks Retry) ──► [ IN_PUBLISHING ]
```

1. **Blog Creation**:
   - User provides title, slug, and hierarchical taxonomy (Category → Subcategory → Primary/Secondary Keywords).
   - Team blogs initialize in `DRAFT`. Individual blogs initialize directly in `IN_WRITING`.
2. **Writing & Autosave**:
   - The assigned Writer formats content using the **Tiptap rich text editor**.
   - `useAutoSave` debounces saves by 2.5 seconds to `PATCH /api/blogs/:id/content`.
   - Each save automatically appends an immutable `BlogVersion` snapshot.
3. **AI Writing Assistant**:
   - Writers use the AI Assistant to generate full drafts, rewrite/expand selected text, or generate SEO meta tags.
   - Works via OpenRouter API (Google Gemini 2.5 Flash) with transparent local mock templates when keys are unconfigured.
4. **Editorial Review**:
   - Writer clicks **Submit for Review** (`IN_REVIEW`).
   - The assigned Reviewer inspects the content:
     - **Approval**: Transitions status to `IN_PUBLISHING`.
     - **Revision Request**: Transitions status to `RE_ASSIGN` and automatically creates a review comment with the feedback reason. The Writer resumes editing.
5. **Publishing & Dev.to Cross-Posting**:
   - The assigned Publisher clicks **Publish Article Now** (`PUBLISHED`).
   - Dev.to cross-publishing can be triggered during publishing or anytime post-publication using the `DevToPublishModal`.
   - The backend converts TipTap HTML to Markdown with `turndown`, validates public image URLs, sets Dev.to tags, and tracks the external publication in `ExternalPublication`.

---

### C. Scoped Taxonomy Journey (`/categories`)

```
[ User visits /categories ]
   ├── Category Tab: Add/Edit/Delete scoped Categories
   ├── Subcategory Tab: Add/Edit/Delete scoped Subcategories
   └── Keywords Tab: Add/Edit/Delete Primary & Secondary Keywords
           │
           ▼
[ Automatic Scoping via actorAuthMiddleware ]
   ├── GLOBAL: Managed by Admins, visible to all users
   ├── INDIVIDUAL: Created by solo users, private to their account
   └── TEAM: Created by team members, shared with active teammates
```

1. Normal users can manage their own taxonomy classifications directly from `/categories`.
2. The UI renders distinct badges for `GLOBAL`, `INDIVIDUAL`, and `TEAM` scopes.
3. When creating or editing blogs, the taxonomy dropdowns display all accessible categories (System Global + User Private + Team Shared).

---

### D. Threaded Comments & Review Feedback Journey

1. **General Discussions**: Any authenticated team member or reader can comment on blogs.
2. **Threaded Replies**: Any user can reply directly to an existing comment using `POST /api/comments/:id/replies`, creating a nested conversation.
3. **Reviewer Authority**: Top-level review feedback comments on team blogs are strictly restricted to the assigned Reviewer or users with the Reviewer role.
4. **Status Resolution**: Comments can be marked `RESOLVED` or reopened with `POST /api/comments/:id/resolve`, tracking `resolvedBy` and `resolvedAt` timestamps.

---

### E. Admin Management Journey (`/admin/*`)

1. **Authentication**: Admins use a separate login portal (`/admin/login`) backed by the `Admin` model and `adminAuthMiddleware`.
2. **Platform Governance**:
   - Analytics Dashboard: User, team, blog, and publication metrics.
   - User & Team Management: Account status, memberships, and role assignments.
   - Taxonomy & Interests: System-wide `GLOBAL` categories, subcategories, keywords, and onboarding interests.
   - Dynamic RBAC: Roles and granular permission code mappings.
3. **SMTP Configuration Lifecycle**:
   - View existing SMTP settings (with password masked).
   - Update host, port, credentials, and sender info.
   - **Test Connection**: Send live test emails via `POST /api/admin/smtp/test`.
   - **Unlink Configuration**: Delete database settings via `DELETE /api/admin/smtp` to revert the system to environment variables.

---

## 3. Data Models Summary (18 Mongoose Models)

1. **User**: Authentication, profile info, `googleId`, `authProvider` (`LOCAL` / `GOOGLE`), `accountType` (`INDIVIDUAL` / `TEAM`), team reference, and `workflowRole`.
2. **Admin**: Independent administrative accounts with `isMainAdmin` uniqueness enforcement.
3. **Team**: Editorial teams with owner and embedded `members[]` array (`user`, `workflowRole`, `isOwner`, `status`).
4. **Invitation**: Team invite tokens with assigned role, optional email constraint, and expiration timestamp.
5. **Role**: Named RBAC roles (`Writer`, `Reviewer`, `Publisher`) referencing permission ObjectIds.
6. **Permission**: Granular permission definition records identified by unique codes (e.g. `BLOG_PUBLISH`).
7. **Category**: Taxonomy level 1 with `scope` (`GLOBAL` / `INDIVIDUAL` / `TEAM`), creator tracking, and team links.
8. **Subcategory**: Taxonomy level 2 linked to parent Category with scoped ownership.
9. **Keyword**: Taxonomy level 3 with `keywordType` (`primary` / `secondary`) and scoped ownership.
10. **Interest**: Reader interest topics chosen during onboarding.
11. **Blog**: Core blog entity with 7 workflow statuses, taxonomy links, workflow assignments, versioning, Dev.to metadata, and 6 query indexes.
12. **BlogVersion**: Immutable snapshots storing version number, content HTML, metadata, and author info.
13. **Comment**: Threaded blog comments with `parentComment`, review feedback flags, and open/resolved status.
14. **Media**: Uploaded media references (Cloudinary URL + public ID).
15. **RefreshToken**: Stored hashed refresh tokens for secure rotation.
16. **PasswordResetToken**: SHA-256 hashed single-use password reset tokens with expiration.
17. **SMTPConfiguration**: Admin-configured email server settings stored in MongoDB.
18. **ExternalPublication**: Cross-publishing history logs tracking Dev.to article IDs, URLs, and publication statuses.

---

## 4. Integration Adapters

* **Google Identity Services**: Seamless authentication verifying Google ID tokens with Google's public keys via `google-auth-library`.
* **OpenRouter AI (Google Gemini 2.5 Flash)**: Generates full blog posts, refines text, and produces SEO metadata with automatic HTML normalization.
* **Cloudinary CDN**: In-memory file upload via Multer stream with immediate CDN URL generation for inline editor images.
* **Dev.to REST API**: Converts TipTap HTML to standard Markdown using `turndown`, attaches tags, and publishes or syncs articles via server-side API key.
* **Nodemailer (SMTP)**: Delivers transactional invitations and password reset emails, reading configuration from MongoDB with `.env` fallback.
