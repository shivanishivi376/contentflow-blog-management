# Collaborative Blog Writing & Publishing Platform — V2

## Beginner-Friendly, Backward-Compatible Implementation Plan

### 0. V2 Objective

V2 is an **incremental update to the existing V1 implementation**, not a rewrite.

The V1 plan already establishes the application around React/Vite/Redux Toolkit on the frontend and Node.js/Express/MongoDB/Mongoose on the backend, with authentication, RBAC, teams, blogs, editor, workflow, publishing, public APIs, AI, external publishing, recommendations, analytics, testing, and deployment.

V2 introduces the new **Customer Panel UX and blog workflow shown in the approved wireframe**:

```text
AUTH
  ↓
ONBOARDING
  ├── Individual
  └── Team
        ↓
     Select own role
        ↓
     Invite remaining roles
        ↓
     Interests
        ↓
    DASHBOARD
        ↓
 ┌──────┼────────┐
 ↓      ↓        ↓
Recommended   My Blogs   Quick Navigation
                         ├── Create Blog
                         └── All Blogs
```

The central rule for V2 is:

> **Do not replace working V1 functionality when the new UI can be implemented on top of it.**

V2 should therefore be treated as a **UI + workflow evolution layer over V1**, with additive backend changes only where the new wireframe requires them.

---

# 1. V2 Non-Breaking Rules

These rules apply to the entire V2 implementation.

## Rule 1 — Do not rewrite working backend modules

Do not unnecessarily rewrite:

- Authentication
- JWT handling
- Refresh tokens
- Admin authentication
- RBAC
- Categories
- Subcategories
- Keywords
- Interests
- Blog CRUD
- Media
- TipTap
- Version history
- Comments
- Workflow
- Publishing
- Public API
- AI
- Dev.to
- Recommendations
- Analytics

The V1 architecture deliberately separates controllers, services, middleware, data access, and integrations. Preserve those boundaries.

---

## Rule 2 — UI changes must not change API contracts unnecessarily

Before changing an endpoint:

```text
Existing API
     ↓
Check existing consumers
     ↓
Can V2 use existing API?
     │
   YES → reuse it
     │
   NO
     ↓
Add/extend endpoint
```

Do not rename an existing endpoint simply to make the UI cleaner.

Existing core backend API endpoints to reuse:
- Auth: `/api/auth/signup`, `/api/auth/login`, `/api/auth/refresh`, `/api/auth/logout`, `/api/auth/forgot-password`, `/api/auth/reset-password`
- Users: `/api/users/me`, `/api/users/me/password`, `/api/users/me/recommendations`
- Onboarding: `/api/onboarding/complete`
- Teams & Invitations: `/api/teams/me`, `/api/teams/:teamId/invitations/link`, `/api/invitations/:token`, `/api/invitations/:token/accept`
- Blogs & Workflow: `/api/blogs`, `/api/blogs/:id`, `/api/blogs/:id/status`, `/api/blogs/:id/versions`, `/api/blogs/:id/publish/devto`
- Categories & Metadata: `/api/categories`, `/api/subcategories`, `/api/keywords`, `/api/interests`
- Comments & Media: `/api/comments`, `/api/media/upload`

If a response needs additional data:

```text
Existing response
       +
New optional fields
```

rather than removing or renaming existing fields.

---

## Rule 3 — Database changes must be additive

Prefer:

```text
ADD FIELD
ADD INDEX
ADD OPTIONAL RELATIONSHIP
ADD STATUS
```

Avoid:

```text
DELETE FIELD
RENAME FIELD
CHANGE EXISTING FIELD TYPE
DROP COLLECTION
```

unless a migration has been explicitly tested.

Existing records must continue to load.

---

## Rule 4 — Preserve existing routes

Existing routes such as:

```text
/dashboard
/blogs
/blogs/create
/blogs/:id
/blogs/:id/edit
/blogs/:id/review
/blogs/:id/publish
/profile
/team
```

must continue to work.

V2 can improve their UI without breaking their URLs.

The V1 route map already separates these customer routes from Admin and Public routes.

---

## Rule 5 — Preserve existing permissions

The existing permission-based authorization system remains authoritative.

Do not replace:

```text
hasPermission(user, "BLOG_CREATE")
```

with hard-coded UI role checks.

V1 explicitly requires permission-based authorization rather than scattering checks such as `role === "Writer"` throughout the application.

---

## Rule 6 — UI must never become the security layer

The new wireframe may hide/show buttons depending on role.

That is only a UX optimization.

Backend authorization must continue checking:

```text
Authentication
      +
Permission
      +
Team membership
      +
Assignment
      +
Blog status
```

---

# 2. V2 Wireframe → Application Mapping

The new UI should be implemented as the following screens.

```text
1. Auth
2. Onboarding - Account Type
3. Onboarding - Team Roles
4. Onboarding - Interests
5. Dashboard
6. My Blogs
7. Create Blog - Basic Details
8. Create Blog - Assignment
9. Create Blog - Writing
10. Create Blog - Review
11. Create Blog - Publish
12. Profile
13. Team / Invitation management
```

The important UI difference from V1 is that these screens should now feel like **one cohesive SaaS product**, rather than independent feature pages.

---

# 3. V2 Global Customer UI

## Module V2-01 — Customer Application Shell

Create/rework:

```text
frontend/src/layouts/CustomerLayout.jsx
frontend/src/components/layout/Sidebar.jsx
frontend/src/components/layout/Topbar.jsx
frontend/src/components/layout/PageHeader.jsx
frontend/src/components/layout/UserMenu.jsx
```

### Sidebar

The new Customer Panel sidebar should contain:

```text
BlogWrite

Dashboard
My Blogs
Create Blog

────────────

Profile
Team
Settings
Help & Support

────────────

Logout
```

The exact visibility of Team-related navigation should depend on account type/permissions.

### Topbar

Include:

```text
Search
Notifications
User Avatar
User Name
Dropdown
```

### UI rule

All customer pages should use the same:

- Sidebar
- Topbar
- Typography
- Buttons
- Cards
- Tables
- Status badges
- Form controls
- Empty states
- Loading states
- Toasts
- Confirmation dialogs

---

# PHASE 1 — V2 FOUNDATION AUDIT

## Module V2-02 — Audit Existing V1 Implementation

Before changing code, inspect:

```text
backend/
frontend/
routes
controllers
services
models
Redux slices
API services
existing customer pages
existing CSS/UI components
```

Create a V2 compatibility matrix:

| Existing V1 Feature | Current Route/API | V2 Change | Breaking? |
|---|---|---|---|
| Login | Existing | Visual redesign | No |
| Signup | Existing | Visual redesign | No |
| Onboarding | Existing | New step UI | No |
| Teams | Existing | New role invitation UI | No |
| Blog CRUD | Existing | New table UI | No |
| Editor | Existing | New stepper UI | No |
| Review | Existing | New review UI | No |
| Publishing | Existing | New publish UI | No |
| Profile | Existing | New profile layout | No |

Do not start UI refactoring until this audit is complete.

---

## Module V2-03 — Baseline Regression

Before touching the application:

```text
[ ] Frontend builds
[ ] Backend starts
[ ] Authentication works
[ ] Existing APIs work
[ ] Existing blog CRUD works
[ ] Existing editor opens
[ ] Existing workflow works
[ ] Existing public blog works
[ ] Existing Admin works
```

Record the baseline.

V2 is not allowed to be considered successful if a previously working V1 flow stops working.

---

# PHASE 2 — DESIGN SYSTEM + UI SHELL

## Module V2-04 — Customer Design System

Create reusable components:

```text
Button
Input
Select
MultiSelect
Card
Badge
Avatar
Modal
Dropdown
Table
Tabs
Stepper
Toast
EmptyState
LoadingState
ConfirmDialog
```

### Visual direction

Use the approved wireframe:

```text
Theme:
Light SaaS

Background:
White / very light gray

Primary:
Blue

Typography:
Modern sans-serif

Cards:
Rounded

Borders:
Subtle

Shadows:
Light

Layout:
Desktop-first responsive
```

Do not introduce a second UI system if V1 already has a stable component system.

---

## Module V2-05 — Customer Layout

Update all customer-facing pages to use:

```text
CustomerLayout
    ├── Sidebar
    ├── Topbar
    └── Main Content
```

Do not modify:

```text
AdminLayout
PublicLayout
```

unless necessary.

This isolates the V2 redesign to the Customer Panel.

---

# PHASE 3 — AUTHENTICATION UI UPDATE

## Module V2-06 — Login UI

Update:

```text
/login
```

to match the new wireframe.

Include:

```text
Logo
Welcome message
Email
Password
Remember me
Forgot password
Sign In
Google Sign In
Sign Up
```

### Backend

Do not change the existing authentication contract unless the audit proves it is necessary.

The V1 authentication flow already covers signup, login, JWT, refresh, logout, password reset and Google authentication.

---

## Module V2-07 — Signup UI

Keep the existing signup functionality.

After successful signup:

```text
Signup
  ↓
Authentication
  ↓
Onboarding
```

Do not automatically send new users directly to Dashboard if onboarding is incomplete.

---

# PHASE 4 — NEW ONBOARDING EXPERIENCE

## Module V2-08 — Onboarding Stepper

Create:

```text
features/onboarding/
    OnboardingLayout.jsx
    AccountTypeStep.jsx
    TeamRoleStep.jsx
    InterestsStep.jsx
    onboardingSlice.js
```

Visual stepper:

```text
Account Type
     ●
     │
Team Roles
     ○
     │
Interests
     ○
```

For Individual:

```text
Account Type
     ↓
Interests
     ↓
Dashboard
```

For Team:

```text
Account Type
     ↓
Team Roles
     ↓
Interests
     ↓
Dashboard
```

---

## Module V2-09 — Individual Onboarding

Flow:

```text
Account Type
      ↓
Individual
      ↓
Interests
      ↓
Complete
      ↓
Dashboard
```

This remains compatible with V1, which already defines Individual onboarding as Individual → Interests → Dashboard and specifies that no team is created.

---

## Module V2-10 — Team Role Selection

The new wireframe changes the onboarding experience to:

```text
Choose your role in the team

○ Writer
○ Editor
○ Reviewer
```

The user selects **their own role**.

Then the remaining roles receive invitation-link actions:

```text
Your Role
──────────────
Writer ✓

Invite Remaining Team Members
────────────────────────────
Editor      [Generate Invite Link]
Reviewer    [Generate Invite Link]
```

### Compatibility requirement

V1 currently defines in `User`, `Team`, and `Invitation` schemas:

```text
Writer
Reviewer
Publisher
```

as default workflow roles (`enum: ['Writer', 'Reviewer', 'Publisher']`).

The new V2 wireframe presents:

```text
Writer
Editor
Reviewer
```

Therefore V2 must **not simply delete/rename Publisher in the database**.

Use an additive migration strategy:

```text
Existing Publisher role / permission
        ↓
KEEP (or map to Editor capabilities)

New Editor workflow role enum / permission
        ↓
ADD (Additive update to Mongoose schema enums)
```

The final mapping must be decided from the existing implementation before changing role data.

If the current backend uses Publisher for final publishing (`publisher` field in Blog model), preserve that behavior until the Editor/Reviewer workflow has been fully verified.

---

## Module V2-11 — Invitation Link UI

The new onboarding UI needs:

```text
[Generate Invite Link]
```

After generation:

```text
┌───────────────────────────────────────┐
│ Invite Link                           │
│                                       │
│ https://.../invite/xxxxxxxx           │
│                                       │
│ [Copy Link]                           │
│                                       │
│ Expires in 7 days                     │
└───────────────────────────────────────┘
```

Reuse the existing invitation backend.

V1 already defines invitation tokens, role association, expiration, acceptance and revocation.

---

## Module V2-12 — Interests UI

Replace the existing basic interest selector with the new visual chip/grid UI:

```text
Choose your interests

Search interests...

[ Technology ] [ AI ] [ Business ]
[ Gaming ]     [ Finance ] [ Travel ]
[ Science ]    [ Design ]  [ Marketing ]
[ Health ]     [ Lifestyle ]

5 selected

                         [ Continue → ]
```

Reuse the existing Interest model and API.

V1 already stores selected interests against the User document.

---

# PHASE 5 — DASHBOARD V2

## Module V2-13 — Dashboard Backend Audit

Reuse the existing recommendation service.

V1 intentionally uses simple interest matching rather than machine-learning recommendations.

Do not replace this with a new recommendation engine.

---

## Module V2-14 — Dashboard UI

Implement the new wireframe:

```text
Good morning, Anuj 👋
Here's what's happening today.

┌────────┐ ┌────────┐ ┌──────────┐ ┌──────────┐
│ Drafts │ │ Review │ │Published │ │Total Views│
│   8    │ │   3    │ │   24     │ │  12.4K   │
└────────┘ └────────┘ └──────────┘ └──────────┘
```

Then:

```text
Recommended For You
────────────────────────────────

[Blog Card] [Blog Card] [Blog Card]
```

Then:

```text
My Blogs
────────────────────────────────

Title | Status | Category | Updated | Actions
```

Then:

```text
Quick Navigation

[ + Create Blog ]
[ All Blogs ]
```

---

# PHASE 6 — MY BLOGS V2

## Module V2-15 — Blog Table

Update:

```text
/blogs
```

to the new wireframe.

Toolbar:

```text
Search blogs...

[All Status]
[All Categories]
[Sort]
[Filter]
```

Table:

```text
Title
Category
Status
Author
Updated
Actions
```

Actions:

```text
View
Edit
Delete
More
```

Reuse the existing Blog CRUD APIs.

V1 already defines:

```text
GET    /api/blogs
GET    /api/blogs/:id
PATCH  /api/blogs/:id
DELETE /api/blogs/:id
```

and authorization must account for user, permission, account type, team membership, assignment and blog status.

---

## Module V2-16 — Blog Status Badges

Standardize status rendering.

Existing backend statuses must remain valid:

```text
DRAFT
IN_WRITING
IN_REVIEW
RE_ASSIGN
IN_PUBLISHING
PUBLISHED
```

V1 explicitly defines these centralized status constants.

The UI may display friendlier labels:

```text
DRAFT          → Draft
IN_WRITING     → In Writing
IN_REVIEW      → In Review
RE_ASSIGN      → Changes Requested
IN_PUBLISHING  → Ready to Publish
PUBLISHED      → Published
```

Do not change the database values merely to change their display text.

---

# PHASE 7 — CREATE BLOG V2

## Module V2-17 — Create Blog Stepper

Replace the old single-page navigation experience with:

```text
Basic Details
     ↓
Assignment
     ↓
Writing
     ↓
Review
     ↓
Publish
```

For Individual:

```text
Basic Details
     ↓
Writing
     ↓
Review
     ↓
Publish
```

The Assignment step must not appear for Individual accounts.

---

## Module V2-18 — Basic Details UI

Wireframe fields:

```text
Blog Title
Category
Subcategory
Primary Keywords
Secondary Keywords
Slug
Featured Image
Short Description
```

Reuse existing category/subcategory/keyword APIs.

The V1 implementation already requires these relationships to be validated on both frontend and backend. 

### Important

Do not remove existing fields simply because they aren't visually prominent in the new wireframe.

If a V1 field is required by the backend:

```text
Keep it
```

It can be moved into an expandable/advanced section if necessary.

---

# PHASE 8 — ASSIGNMENT UI

## Module V2-19 — Team Assignment Screen

New wireframe:

```text
Assign to your team

Writer
[ Select writer ]

Editor
[ Select editor ]

Reviewer
[ Select reviewer ]

Due Date
[ Select date ]

Instructions
[ Optional instructions ]

[ Back ]                 [ Next → ]
```

### Backend validation

Before assignment:

```text
User belongs to team
        ↓
Membership is accepted
        ↓
Correct permission
        ↓
Correct role availability
        ↓
Assign
```

V1 already requires same-team membership, accepted membership, workflow permission and role availability.

Do not move these checks into React.

---

# PHASE 9 — WRITING UI

## Module V2-20 — Editor Layout

Keep the existing TipTap editor implementation.

Only redesign the surrounding UI.

```text
┌───────────────────────────────────────────────┐
│ Stepper                                        │
├───────────────────────────────────────────────┤
│                                               │
│  Paragraph ▼   B I U  H1 H2  Link Image ...  │
│                                               │
│  Start writing your blog content here...      │
│                                               │
│                                               │
├───────────────────────────────────────────────┤
│ Words: 1,240       Saved a few seconds ago ✓  │
│                                               │
│ [Back] [Save Draft]              [Next →]     │
└───────────────────────────────────────────────┘
```

Do not rebuild TipTap unless the current implementation is incompatible.

V1 already defines TipTap, formatting features, images, tables and undo/redo.

---

## Module V2-21 — Auto-save

Keep the existing debounce strategy.

```text
User types
    ↓
Debounce
    ↓
Save draft
```

Do not save every keystroke.

V1 specifies a 2–5 second debounce approach.

---

# PHASE 10 — REVIEW UI

## Module V2-22 — Review Screen

New layout:

```text
Preview
──────────────────────────

Featured Image

Blog Title

Content preview


Reviewer Comments
──────────────────────────

[ Add comment... ]


[Request Changes] [Approve & Next →]
```

Reuse existing comment functionality.

V1 already defines a dedicated comment panel and explicitly does not require Google Docs-style inline comments.

---

## Module V2-23 — Review State Handling

Approved:

```text
IN_REVIEW
    ↓
Approve
    ↓
IN_PUBLISHING
```

Rejected:

```text
IN_REVIEW
    ↓
Reject
    ↓
RE_ASSIGN
    ↓
IN_WRITING
```

The backend workflow service remains the source of truth. V1 explicitly requires controlled status transitions rather than allowing arbitrary status changes from the frontend.

---

# PHASE 11 — PUBLISH UI

## Module V2-24 — Publish Screen

New wireframe:

```text
Publish Settings

URL Slug
[ the-future-of-ai-in-2026 ]

Meta Title
[ The Future of AI in 2026 ]

Meta Description
[ Discover how AI... ]

Publish Date

○ Publish Now
○ Schedule for later

[ Back ]                  [ Publish Now ]
```

Before publishing, retain all V1 validations:

```text
Content exists
Metadata exists
Approved state
Unique slug
Valid media
Authorized publisher
```

These validations are already required by the V1 publishing workflow.

---

# PHASE 12 — PROFILE V2

## Module V2-25 — Profile UI

Update:

```text
/profile
```

to the new layout.

Structure:

```text
┌─────────────────────────────────────────────┐
│ Avatar                                      │
│                                             │
│ Anuj Vashisht                               │
│ email@example.com                            │
│ Team Owner                                  │
│                                             │
│ [ Edit Profile ]                            │
└─────────────────────────────────────────────┘


Personal Information

First Name
Last Name
Email
Account Type
Bio


Interests

[Technology] [AI] [Business] [Gaming]


Account Settings

Password & Security
Notifications
Team Management
Connected Accounts
Delete Account
```

Reuse the existing Profile APIs rather than creating a second profile system.

V1 already defines `/api/users/me`, profile update, profile-image upload and password update APIs.

---

# PHASE 13 — TEAM MANAGEMENT V2

## Module V2-26 — Team Page

Create/update:

```text
/team
```

UI:

```text
Team Members (3)

Anuj Vashisht
Team Owner

Rahul Sharma
Writer

Priya Mehta
Reviewer
```

Actions for authorized owner:

```text
Invite Member
Generate Invite Link
Revoke Invitation
Remove Member
Change Role
```

Do not change the existing Team membership model unnecessarily.

V1 already separates team, membership, workflow role, owner status and membership status.

---

# PHASE 14 — INVITATION MANAGEMENT

## Module V2-27 — Invitation Modal

Reuse the V1 invitation service.

New UI:

```text
Invite Team Member

Role

○ Writer
○ Editor
○ Reviewer

[ Generate Invite Link ]
```

Then:

```text
Invite Link

https://blogwrite.com/invite/abc123

[Copy Link]
```

Existing token security remains unchanged.

V1 specifically requires a cryptographically secure invitation token stored server-side and associated with team and role.

---

# PHASE 15 — REDUX V2

## Module V2-28 — State Audit

Do not create Redux state merely for the new UI.

Reuse existing slices where possible:

```text
authSlice
userSlice
blogSlice
teamSlice
interestSlice
categorySlice
notificationSlice
uiSlice
```

This follows the V1 rule that only genuinely global state belongs in Redux.

---

## Module V2-29 — Onboarding State

Add only if required:

```text
onboardingSlice
```

Possible state:

```text
accountType
selectedRole
teamId
selectedInterests
currentStep
```

Do not put individual form fields such as:

```text
blogTitle
description
metaDescription
```

into Redux unless there is an actual cross-page requirement.

---

# PHASE 16 — ROUTING V2

## Module V2-30 — Customer Routes

Maintain existing routes.

Recommended final structure:

```text
/auth
    /login
    /signup
    /forgot-password
    /reset-password

/onboarding
    /account-type
    /team-role
    /interests

/dashboard

/blogs
/blogs/create
/blogs/:id
/blogs/:id/edit
/blogs/:id/review
/blogs/:id/publish

/profile
/team
```

Existing V1 routes remain aliases where required.

Do not remove old URLs until all internal links and existing bookmarks have been verified.

---

# PHASE 17 — UI IMPLEMENTATION ORDER

The UI should not be updated randomly.

Use this order:

```text
1. Design System
        ↓
2. Customer Layout
        ↓
3. Auth
        ↓
4. Onboarding
        ↓
5. Dashboard
        ↓
6. My Blogs
        ↓
7. Create Blog - Basic Details
        ↓
8. Assignment
        ↓
9. Writing
        ↓
10. Review
        ↓
11. Publish
        ↓
12. Profile
        ↓
13. Team
        ↓
14. Invitation UI
        ↓
15. Responsive polish
```

After each screen:

```text
UI
 ↓
Existing API
 ↓
Integration
 ↓
Regression test
```

This preserves V1's incremental development principle of completing backend, frontend, integration and testing before moving forward.

---

# PHASE 18 — BACKWARD COMPATIBILITY LAYER

## Module V2-31 — API Compatibility

For every API modified:

```text
Old request
   ↓
Still accepted?

YES → keep working

New request
   ↓
Supported additionally
```

If an endpoint absolutely must change:

```text
/api/v1/...
/api/v2/...
```

should be considered instead of silently breaking the existing contract.

Do not introduce API versioning unnecessarily, but do not break consumers to avoid it.

---

## Module V2-32 — Database Compatibility

Before modifying a model:

```text
Find existing documents
        ↓
Check existing fields
        ↓
Check indexes
        ↓
Add optional V2 fields
        ↓
Test old documents
        ↓
Test new documents
```

Every existing V1 document must remain readable.

---

# PHASE 19 — ROLE MIGRATION SAFETY

This is the highest-risk V2 change.

V1 currently defines:

```text
Writer
Reviewer
Publisher
```

while the new wireframe displays:

```text
Writer
Editor
Reviewer
```

Do **not** perform a direct:

```text
Publisher → Editor
```

database rename.

Instead:

### Step 1

Inspect current role and permission records.

### Step 2

Determine what `Publisher` currently controls.

### Step 3

Add Editor permissions without removing Publisher.

### Step 4

Update the UI to display Editor where the new workflow requires it.

### Step 5

Update workflow assignment rules.

### Step 6

Test existing Publisher users.

### Step 7

Only after migration verification should obsolete role data be considered for cleanup.

This prevents existing team memberships and publishing permissions from breaking.

---

# PHASE 20 — WORKFLOW COMPATIBILITY

The V1 state machine remains the backend authority:

```text
DRAFT
  ↓
IN_WRITING
  ↓
IN_REVIEW
  ├── REJECT → RE_ASSIGN → IN_WRITING
  │
  └── APPROVE → IN_PUBLISHING
                    ↓
                PUBLISHED
```

The new UI simply visualizes that workflow as:

```text
Basic Details
      ↓
Assignment
      ↓
Writing
      ↓
Review
      ↓
Publish
```

Therefore:

> **The stepper is a UI representation of the existing state machine, not a replacement for it.**

---

# PHASE 21 — INDIVIDUAL USER COMPATIBILITY

Individual users must continue using the same Blog model.

V1 explicitly requires Individual users to bypass Writer/Reviewer/Publisher team workflow rather than creating a second blog system.

V2 flow:

```text
Basic Details
      ↓
Writing
      ↓
Review / Final Check
      ↓
Publish
```

No Team assignment API should be called.

---

# PHASE 22 — ADMIN PANEL PROTECTION

The V2 customer redesign must not accidentally modify Admin UI.

Keep:

```text
/admin/*
```

separate.

Existing Admin functionality includes:

```text
Dashboard
Categories
Subcategories
Keywords
Interests
Users
Teams
Roles
Permissions
SMTP
Analytics
```

V1 explicitly separates Admin authentication and route protection from normal users. 

After Customer UI changes, verify:

```text
Admin login
Admin routes
Admin permissions
Admin APIs
Admin analytics
```

---

# PHASE 23 — PUBLIC EXPERIENCE PROTECTION

Do not modify the Public Blog API merely because the Customer UI changed.

Existing public behavior must continue:

```text
GET /api/public/blogs
GET /api/public/blogs/:slug
GET /api/public/blogs/category/:categorySlug
GET /api/public/categories
```

Only published blogs should be exposed, and internal team information, comments, assignments and version history must remain private.

---

# PHASE 24 — RESPONSIVE UI

## Module V2-33 — Desktop

Primary target:

```text
1440px+
```

Use the wireframe as the desktop reference.

---

## Module V2-34 — Tablet

Test:

```text
1024px
768px
```

Sidebar should collapse appropriately.

Tables should remain usable.

---

## Module V2-35 — Mobile

Test:

```text
390px
375px
```

The sidebar becomes a drawer.

The blog table becomes:

```text
Blog Card / condensed list
```

The editor remains usable without horizontal overflow.

---

# PHASE 25 — UI STATES

Every V2 screen must support:

```text
Loading
Success
Error
Empty
Unauthorized
Forbidden
```

V1 already defines these as part of the module completion criteria.

Examples:

### My Blogs

```text
Loading → Skeleton

No blogs → Empty state + Create Blog

API failure → Error state + Retry
```

### Recommended Blogs

```text
Loading → Skeleton cards

No recommendations → "Explore blogs"

API failure → Retry
```

### Team

```text
No members → Invite member

Invitation expired → Expired badge

Invitation revoked → Revoked badge
```

---

# PHASE 26 — V2 TESTING STRATEGY

## Module V2-36 — UI Regression Tests

Verify every redesigned screen.

### Auth

```text
[ ] Login
[ ] Signup
[ ] Forgot password
[ ] Google login
[ ] Logout
```

### Onboarding

```text
[ ] Individual selection
[ ] Team selection
[ ] Role selection
[ ] Invite link generation
[ ] Interests
[ ] Continue/back
[ ] Refresh during onboarding
[ ] Completed onboarding cannot repeat
```

### Dashboard

```text
[ ] Recommended blogs
[ ] My blogs
[ ] Quick navigation
[ ] Create Blog
[ ] All Blogs
```

### Blogs

```text
[ ] List
[ ] Search
[ ] Filter
[ ] Sort
[ ] View
[ ] Edit
[ ] Delete
[ ] Create
```

### Create Blog

```text
[ ] Basic Details
[ ] Assignment
[ ] Writing
[ ] Auto-save
[ ] Review
[ ] Request changes
[ ] Publish
```

### Profile

```text
[ ] View
[ ] Edit
[ ] Profile image
[ ] Interests
[ ] Password
```

---

# PHASE 27 — V1 REGRESSION TESTING

This phase is mandatory.

After the V2 UI work, run the complete V1 verification suite.

V1's final verification already requires authentication, Admin, User, Teams, Blogging, AI, Public and external publishing checks.

### Authentication

```text
[ ] Signup
[ ] Login
[ ] Refresh
[ ] Logout
[ ] Forgot/reset
[ ] Google
```

### Admin

```text
[ ] Login
[ ] Categories
[ ] Subcategories
[ ] Keywords
[ ] Interests
[ ] Users
[ ] Teams
[ ] Roles
[ ] Permissions
[ ] SMTP
[ ] Analytics
```

### Blogging

```text
[ ] CRUD
[ ] Media
[ ] TipTap
[ ] Auto-save
[ ] Version history
[ ] Restore
[ ] Comments
[ ] Review
[ ] Reassignment
[ ] Publishing
```

### Advanced Features

```text
[ ] AI
[ ] Dev.to
[ ] Public API
[ ] Public blog
[ ] Recommendations
[ ] Analytics
```

---

# PHASE 28 — END-TO-END TESTING

## Individual Flow

```text
Signup
  ↓
Login
  ↓
Onboarding
  ↓
Individual
  ↓
Interests
  ↓
Dashboard
  ↓
Create Blog
  ↓
Basic Details
  ↓
Writing
  ↓
Save
  ↓
Publish
  ↓
Public Blog
```

This preserves the V1 end-to-end Individual flow.

---

## Team Flow

V2:

```text
Signup
  ↓
Login
  ↓
Onboarding
  ↓
Team
  ↓
Select Own Role
  ↓
Generate Invitation Links
  ↓
Interests
  ↓
Dashboard
  ↓
Create Blog
  ↓
Basic Details
  ↓
Assignment
  ↓
Writing
  ↓
Submit Review
  ↓
Reviewer
  ↓
Approve
  ↓
Publish
  ↓
Public Blog
```

---

## Rejection Flow

```text
Writer
  ↓
In Review
  ↓
Reviewer Rejects
  ↓
Changes Requested
  ↓
Writer Edits
  ↓
In Review
  ↓
Approve
  ↓
Publish
```

The existing V1 rejection flow must continue working.

---

# PHASE 29 — VERSION HISTORY REGRESSION

The new UI must not break version history.

Verify:

```text
v1
 ↓
v2
 ↓
v3
 ↓
Restore v1
 ↓
v4
```

All versions must remain available:

```text
v1
v2
v3
v4
```

V1 explicitly requires restoration to create a new version rather than deleting later versions.

---

# PHASE 30 — GIT STRATEGY

Do not make one huge V2 commit.

Use small commits.

Recommended:

```text
chore: audit v1 customer panel

feat: add customer design system

feat: update customer layout

feat: redesign login and signup

feat: redesign onboarding

feat: add team role invitation UI

feat: redesign interests onboarding

feat: redesign customer dashboard

feat: redesign my blogs table

feat: add create blog stepper

feat: redesign blog assignment

feat: redesign blog editor shell

feat: redesign review screen

feat: redesign publish screen

feat: redesign profile

feat: redesign team management

test: add v2 customer panel regression tests
```

V1 already recommends small, focused Git commits.

---

# PHASE 31 — FEATURE FLAGS / SAFE ROLLOUT

If the existing application is already being used, introduce a temporary UI flag:

```text
V2_CUSTOMER_UI=true
```

Conceptually:

```text
V2_CUSTOMER_UI = false
        ↓
Existing V1 UI

V2_CUSTOMER_UI = true
        ↓
New V2 UI
```

This allows the new Customer Panel to be tested without removing the existing implementation.

Once V2 is verified:

```text
V2 UI
  ↓
100% users
  ↓
Remove temporary flag
```

Do not use a feature flag to bypass backend authorization.

---

# PHASE 32 — FINAL V2 ROUTE MAP

```text
CUSTOMER

/login
/signup
/forgot-password
/reset-password

/onboarding/account-type
/onboarding/team-role
/onboarding/interests

/dashboard

/blogs
/blogs/create
/blogs/:id
/blogs/:id/edit
/blogs/:id/review
/blogs/:id/publish

/profile
/team


ADMIN

/admin/login
/admin/dashboard
/admin/categories
/admin/subcategories
/admin/keywords
/admin/interests
/admin/users
/admin/teams
/admin/roles
/admin/permissions
/admin/smtp
/admin/analytics


PUBLIC

/blog/:slug

/api/public/*
```

The V1 architecture already defines this separation; V2 should preserve it.

---

# PHASE 33 — FINAL V2 DEFINITION OF DONE

V2 is complete only when:

## UI

```text
[ ] New Customer Layout
[ ] New Login
[ ] New Onboarding
[ ] New Team Role UI
[ ] New Interest UI
[ ] New Dashboard
[ ] New My Blogs
[ ] New Create Blog Stepper
[ ] New Assignment
[ ] New Writing UI
[ ] New Review UI
[ ] New Publish UI
[ ] New Profile
[ ] New Team UI
[ ] Responsive layouts
```

## Backend

```text
[ ] Existing APIs still work
[ ] New required APIs are backward compatible
[ ] Existing database documents still work
[ ] Existing permissions still work
[ ] Existing workflow still works
[ ] Role migration verified
```

## Regression

```text
[ ] Authentication
[ ] Admin
[ ] Teams
[ ] Invitations
[ ] Blog CRUD
[ ] Media
[ ] Editor
[ ] Auto-save
[ ] Versions
[ ] Comments
[ ] Review
[ ] Publishing
[ ] Public API
[ ] AI
[ ] Dev.to
[ ] Recommendations
[ ] Analytics
```

## Security

```text
[ ] No authorization removed
[ ] No secrets exposed
[ ] Existing JWT behavior preserved
[ ] Existing permission middleware preserved
[ ] Invitation tokens remain secure
[ ] File validation remains active
[ ] Public API remains restricted to published content
```

## Production Safety

```text
[ ] Frontend build succeeds
[ ] Backend starts
[ ] Database migration succeeds
[ ] Existing records load
[ ] Existing users can log in
[ ] Existing blogs open
[ ] Existing teams work
[ ] Existing Admin works
[ ] Public blogs work
[ ] V2 Customer Panel works
```

---

# FINAL V2 IMPLEMENTATION ORDER

The complete implementation sequence should therefore be:

```text
V1 BASELINE
     ↓
V2 COMPATIBILITY AUDIT
     ↓
DESIGN SYSTEM
     ↓
CUSTOMER LAYOUT
     ↓
AUTH UI
     ↓
ONBOARDING UI
     ↓
TEAM ROLE + INVITATION UI
     ↓
INTEREST UI
     ↓
DASHBOARD UI
     ↓
MY BLOGS UI
     ↓
CREATE BLOG STEPPER
     ↓
BASIC DETAILS UI
     ↓
ASSIGNMENT UI
     ↓
WRITING UI
     ↓
REVIEW UI
     ↓
PUBLISH UI
     ↓
PROFILE UI
     ↓
TEAM MANAGEMENT UI
     ↓
ROLE COMPATIBILITY MIGRATION
     ↓
RESPONSIVE POLISH
     ↓
V2 CUSTOMER REGRESSION
     ↓
V1 FULL REGRESSION
     ↓
INDIVIDUAL E2E
     ↓
TEAM E2E
     ↓
REJECTION E2E
     ↓
VERSION RESTORE E2E
     ↓
SECURITY AUDIT
     ↓
PRODUCTION BUILD
     ↓
V2 RELEASE
```

## The most important V2 principle

**Do not treat the new wireframe as a reason to rebuild the application.**

The wireframe changes primarily **how the existing functionality is presented and navigated**:

```text
V1 Backend / APIs / Models
            │
            │ KEEP
            ▼
      V2 Customer UI
            │
            ▼
     New UX / Navigation
            │
            ▼
Same underlying business logic
```

Where the new UX genuinely changes behavior—especially **Team onboarding roles and the Writer/Editor/Reviewer assignment model**—make the backend changes **additive and migration-safe**.

That approach lets you reach the new wireframe without sacrificing the V1 functionality that already works.