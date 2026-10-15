# Collaborative Blog Writing & Publishing Platform — V1
# Beginner-Friendly Module-by-Module Implementation Plan

## 0. How to Use This Plan

This document converts the V1 Development Specification into an implementation sequence.

The rule is:

> **Do not build everything at once. Build one module, finish its backend, connect its frontend, test it, then move to the next module.**

For every module:

1. Understand the feature.
2. Create the database model(s).
3. Create validation rules.
4. Create repository/data-access functions where useful.
5. Create service/business logic.
6. Create controller.
7. Create routes.
8. Add authentication/authorization middleware where required.
9. Test the API in Postman.
10. Build the React UI.
11. Connect UI to API.
12. Test the complete feature.
13. Commit the working feature to Git.
14. Move to the next module.

The specification explicitly asks for modular, beginner-understandable development, clean separation of responsibilities, server-side authorization, and incremental implementation. fileciteturn0file0L1357-L1375

---

# 1. Final Technology Stack

## Frontend

- React
- Vite
- Redux Toolkit
- React Router
- Axios
- TipTap
- Bootstrap or another consistent UI system
- Charting library for Admin analytics

## Backend

- Node.js
- Express.js
- MongoDB Atlas
- Mongoose
- JWT
- Google OAuth
- bcrypt/bcryptjs
- Multer
- Cloudinary
- OpenRouter
- Nodemailer/SMTP
- Dev.to API

## Development Tools

- VS Code
- Git/GitHub
- Postman
- MongoDB Atlas
- Browser DevTools

---

# 2. Recommended Project Structure

Build the project as two applications.

```text
collaborative-blog-platform/
│
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── constants/
│   │   ├── controllers/
│   │   ├── integrations/
│   │   │   ├── cloudinary/
│   │   │   ├── google/
│   │   │   ├── openrouter/
│   │   │   ├── smtp/
│   │   │   └── devto/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── repositories/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── utils/
│   │   ├── validators/
│   │   └── app.js
│   ├── server.js
│   ├── .env
│   ├── .env.example
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── app/
    │   │   ├── store/
    │   │   ├── routes/
    │   │   └── providers/
    │   ├── features/
    │   │   ├── auth/
    │   │   ├── admin/
    │   │   ├── blogs/
    │   │   ├── editor/
    │   │   ├── teams/
    │   │   ├── users/
    │   │   ├── interests/
    │   │   └── analytics/
    │   ├── components/
    │   ├── layouts/
    │   ├── pages/
    │   ├── hooks/
    │   ├── services/
    │   ├── utils/
    │   └── constants/
    └── package.json
```

---

# 3. Development Order

Do NOT follow the specification's section order blindly.

Use this implementation order:

```text
PHASE 1
Project Setup
        ↓
PHASE 2
Database + Backend Foundation
        ↓
PHASE 3
Authentication
        ↓
PHASE 4
Admin Foundation
        ↓
PHASE 5
Categories / Keywords / Interests
        ↓
PHASE 6
User Onboarding
        ↓
PHASE 7
Teams + RBAC + Invitations
        ↓
PHASE 8
Blog Basic CRUD
        ↓
PHASE 9
Blog Editor + Media
        ↓
PHASE 10
Version History
        ↓
PHASE 11
Comments
        ↓
PHASE 12
Review Workflow
        ↓
PHASE 13
Publishing
        ↓
PHASE 14
Public API + Public Blog Page
        ↓
PHASE 15
AI Assistant
        ↓
PHASE 16
Dev.to Publishing
        ↓
PHASE 17
Dashboard Recommendations
        ↓
PHASE 18
Admin Analytics
        ↓
PHASE 19
Testing + Security
        ↓
PHASE 20
Deployment
```

This order intentionally puts authentication, authorization, data relationships, and the core blog lifecycle before AI and external publishing.

---

# PHASE 1 — PROJECT SETUP

## Module 1. Backend Project Initialization

### Goal

Create a running Express backend.

### Tasks

- [ ] Create `backend` folder.
- [ ] Initialize npm.
- [ ] Install Express.
- [ ] Install dotenv.
- [ ] Install cors.
- [ ] Install mongoose.
- [ ] Add nodemon or Node watch mode.
- [ ] Create `server.js`.
- [ ] Create `src/app.js`.
- [ ] Add `/api/health` route.
- [ ] Start server.
- [ ] Test health endpoint.

### Expected result

```text
GET /api/health

{
  "success": true,
  "message": "API is running"
}
```

### Do not proceed until

- Server starts without errors.
- Health endpoint works.

---

# Module 2. Frontend Project Initialization

### Goal

Create the React application.

### Tasks

- [ ] Create Vite React project.
- [ ] Install React Router.
- [ ] Install Redux Toolkit.
- [ ] Install React Redux.
- [ ] Install Axios.
- [ ] Add UI library.
- [ ] Create basic layouts.
- [ ] Create route configuration.
- [ ] Create Axios instance.
- [ ] Add environment configuration.
- [ ] Run frontend.

### Expected result

```text
/
      → basic application
/login
      → login page
/signup
      → signup page
```

---

# Module 3. Git Setup

### Tasks

- [ ] Create Git repository.
- [ ] Add `.gitignore`.
- [ ] Ignore `.env`.
- [ ] Add `.env.example`.
- [ ] Create initial commit.
- [ ] Push to GitHub.

### Commit

```text
chore: initialize collaborative blog platform
```

---

# PHASE 2 — DATABASE + BACKEND FOUNDATION

# Module 4. MongoDB Atlas Connection

### Goal

Connect Express to MongoDB Atlas.

### Tasks

- [ ] Create MongoDB Atlas database.
- [ ] Create database user.
- [ ] Configure network access.
- [ ] Add `MONGODB_URI`.
- [ ] Create `src/config/database.js`.
- [ ] Connect using Mongoose.
- [ ] Handle connection errors.
- [ ] Test connection.

### Expected result

```text
MongoDB connected successfully
Server running successfully
```

---

# Module 5. Environment Configuration

Create:

```text
.env
.env.example
```

Required variables from the specification include:

```env
MONGODB_URI=

JWT_ACCESS_SECRET=
JWT_REFRESH_SECRET=

GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

OPENROUTER_API_KEY=

SMTP_HOST=
SMTP_PORT=
SMTP_USERNAME=
SMTP_PASSWORD=

DEVTO_API_KEY=
```

The specification explicitly requires secrets to remain in environment configuration and `.env` files must not be committed. fileciteturn0file0L1496-L1524

---

# Module 6. Central Error Handling

### Create

```text
middleware/errorMiddleware.js
utils/AppError.js
```

### Standard response

```json
{
  "success": false,
  "message": "Blog not found",
  "data": null,
  "error": {
    "code": "BLOG_NOT_FOUND"
  }
}
```

### Handle

- Validation errors
- Authentication errors
- Authorization errors
- Database errors
- Duplicate records
- External API errors

The specification requires consistent API responses and centralized Express error handling. fileciteturn0file0L1218-L1253

---

# Module 7. Request Validation

Choose one validation library and use it consistently.

Create:

```text
validators/
    auth.validator.js
    blog.validator.js
    team.validator.js
    category.validator.js
```

Validate both:

```text
Frontend
+
Backend
```

Backend validation is authoritative.

---

# Module 8. Authentication Utilities

Create:

```text
utils/password.js
utils/jwt.js
utils/token.js
```

Implement:

- Password hashing
- Password comparison
- Access token creation
- Refresh token creation
- Token verification
- Token expiration handling

The specification requires short-lived access tokens and long-lived refresh tokens with rotation/revocation where appropriate. fileciteturn0file0L347-L364

---

# PHASE 3 — USER AUTHENTICATION

# Module 9. User Model

Create:

```text
models/User.js
```

Include fields for:

```text
name
username
email
password
profileImage
bio
interests
accountType
team
workflowRole
onboardingCompleted
authProvider
isActive
timestamps
```

Add indexes for:

```text
email
username
```

---

# Module 10. RefreshToken Model

Create:

```text
models/RefreshToken.js
```

Store enough information to support:

- Token rotation
- Revocation
- Expiration
- User association

Never store sensitive token information carelessly.

---

# Module 11. Signup

### Backend

Create:

```text
POST /api/auth/signup
```

Flow:

```text
Request
 ↓
Validate
 ↓
Check email
 ↓
Hash password
 ↓
Create User
 ↓
Return safe user information
```

Do not return the password.

---

# Module 12. Login

Create:

```text
POST /api/auth/login
```

Flow:

```text
Email + Password
        ↓
Find user
        ↓
Compare password
        ↓
Create access token
        ↓
Create refresh token
        ↓
Return authentication response
```

---

# Module 13. Authentication Middleware

Create:

```text
middleware/authMiddleware.js
```

Responsibilities:

- Read access token.
- Verify token.
- Identify user.
- Attach user to request.
- Reject invalid/expired tokens.

Example:

```text
Authorization: Bearer <accessToken>
```

---

# Module 14. Refresh Token

Create:

```text
POST /api/auth/refresh
```

Implement:

```text
Refresh token
 ↓
Validate
 ↓
Check revocation
 ↓
Rotate token
 ↓
Issue new access token
```

---

# Module 15. Logout

Create:

```text
POST /api/auth/logout
```

Revoke/delete the refresh token.

---

# Module 16. Forgot/Reset Password

Create:

```text
POST /api/auth/forgot-password
POST /api/auth/reset-password
```

Later connect the email service.

---

# Module 17. Frontend Authentication

Create:

```text
features/auth/
    authSlice.js
    authService.js
    components/
    pages/
```

Pages:

```text
/login
/signup
/forgot-password
/reset-password
```

Redux should hold global authentication state, while local form state remains local.

---

# Module 18. Protected Routes

Create:

```text
ProtectedRoute
```

Protect:

```text
/dashboard
/blogs/*
/profile
/team
```

Remember:

> Frontend protection improves UX. Backend authorization provides actual security.

---

# PHASE 4 — ADMIN FOUNDATION

# Module 19. Admin Model

Create:

```text
models/Admin.js
```

There must be exactly one main Admin account according to the specification. There is no Admin signup. fileciteturn0file0L106-L124

---

# Module 20. Admin Initialization

Create a secure initialization/seed script.

Example:

```text
npm run seed:admin
```

Admin credentials come from environment variables.

Never hardcode them into React.

---

# Module 21. Admin Login

Create:

```text
POST /api/admin/login
```

Frontend:

```text
/admin/login
```

Use separate Admin authentication middleware.

---

# Module 22. Admin Route Protection

Create:

```text
adminAuthMiddleware
```

Protect:

```text
/api/admin/*
```

Normal users must receive `403 Forbidden`.

---

# Module 23. Admin Layout

Create:

```text
layouts/AdminLayout.jsx
```

Sidebar:

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
Logout
```

---

# PHASE 5 — CATEGORY / SUBCATEGORY / KEYWORD SYSTEM

# Module 24. Category Model + CRUD

Create:

```text
models/Category.js
```

Endpoints:

```text
GET    /api/categories
GET    /api/categories/:id
POST   /api/categories
PATCH  /api/categories/:id
DELETE /api/categories/:id
```

Admin authorization required for mutations.

---

# Module 25. Subcategory Model + CRUD

Create:

```text
models/Subcategory.js
```

Relationship:

```text
Category
   ↓
Subcategory
```

Validate that every subcategory references a valid category.

---

# Module 26. Keyword Model + CRUD

Create:

```text
models/Keyword.js
```

Fields should distinguish:

```text
primary
secondary
```

Relationship:

```text
Category
 ↓
Subcategory
 ↓
Keyword
```

---

# Module 27. Dynamic Category UI

Blog creation should work like:

```text
Select Category
      ↓
Fetch subcategories
      ↓
Select Subcategory
      ↓
Fetch keywords
```

Never send all unrelated keywords and rely only on frontend filtering.

---

# PHASE 6 — INTERESTS

# Module 28. Interest Model

Create:

```text
models/Interest.js
```

Examples:

```text
Technology
Gaming
Anime
Finance
Travel
Programming
Artificial Intelligence
```

---

# Module 29. Interest CRUD

Admin endpoints:

```text
GET
POST
PATCH
DELETE
```

Frontend:

```text
/admin/interests
```

---

# PHASE 7 — RBAC

# Module 30. Permission Model

Create:

```text
models/Permission.js
```

Examples:

```text
BLOG_VIEW
BLOG_CREATE
BLOG_EDIT
BLOG_REVIEW
BLOG_PUBLISH
USER_MANAGE
CATEGORY_MANAGE
ANALYTICS_VIEW
COMMENT_MANAGE
```

---

# Module 31. Role Model

Create:

```text
models/Role.js
```

Default roles:

```text
Writer
Reviewer
Publisher
```

Also support custom roles.

Relationship:

```text
Role
 ↓
Permissions
```

Do not write authorization as:

```js
if (role === "Writer")
```

everywhere.

Prefer:

```js
hasPermission(user, "BLOG_CREATE")
```

The specification explicitly requires permission-based custom roles rather than authorization logic hard-coded around role names. fileciteturn0file0L242-L281

---

# Module 32. Permission Middleware

Create:

```text
middleware/permissionMiddleware.js
```

Example:

```text
requirePermission("BLOG_CREATE")
```

This becomes the central authorization mechanism.

---

# Module 33. Admin RBAC UI

Create:

```text
/admin/roles
/admin/permissions
```

Admin can:

- Create role
- Edit role
- Assign permissions
- Remove permissions
- View permissions

---

# PHASE 8 — USER ONBOARDING

# Module 34. Onboarding State

Add:

```text
accountType
onboardingCompleted
```

Possible account types:

```text
INDIVIDUAL
TEAM
```

---

# Module 35. Onboarding Step 1

Question:

```text
Individual
OR
Team
```

---

# Module 36. Individual Onboarding

Flow:

```text
Signup
 ↓
Individual
 ↓
Interests
 ↓
Complete
 ↓
Dashboard
```

No team is created.

---

# Module 37. Team Onboarding

Flow:

```text
Signup
 ↓
Team
 ↓
Team Name
 ↓
Workflow Role
 ↓
Create Team
 ↓
Interests
 ↓
Dashboard
```

The creator becomes:

```text
Team Owner
+
Selected Workflow Role
```

---

# Module 38. Interest Selection

Allow multiple interests.

Example:

```text
Technology ✓
Gaming ✓
Finance
Travel ✓
```

Save them to the User document.

---

# PHASE 9 — TEAMS

# Module 39. Team Model

Create:

```text
models/Team.js
```

V1 rules:

```text
One user → maximum one team
One team → one owner
One Writer position
One Reviewer position
One Publisher position
```

---

# Module 40. Team Membership

Create membership structure carefully so it can later support multiple teams.

Store:

```text
user
team
workflowRole
isOwner
status
```

---

# Module 41. Team Dashboard

Create:

```text
/team
```

Show:

- Team name
- Owner
- Members
- Roles
- Pending invitations
- Team settings

---

# Module 42. Team Owner Permissions

Owner can:

- View members
- Invite members
- Revoke invitations
- Remove members
- Change workflow role
- Manage team settings

But:

```text
Owner ≠ automatically Writer/Reviewer/Publisher
```

Workflow permissions still depend on assigned role. fileciteturn0file0L444-L463

---

# PHASE 10 — INVITATIONS

# Module 43. Invitation Model

Create:

```text
models/Invitation.js
```

Fields:

```text
token
team
email
assignedRole
expiresAt
status
createdBy
acceptedBy
```

Statuses:

```text
Pending
Accepted
Expired
Revoked
```

---

# Module 44. Invitation Link

Create:

```text
POST /api/teams/:teamId/invitations/link
```

Generate cryptographically secure token.

Never encode authorization only into the URL.

Server stores:

```text
token → team → role
```

---

# Module 45. Invitation Acceptance

Create:

```text
GET /api/invitations/:token
POST /api/invitations/:token/accept
```

Validate:

```text
token
expiration
status
user eligibility
team role availability
```

---

# Module 46. Email Invitation

After SMTP is implemented:

```text
Owner
 ↓
Enter email + role
 ↓
Create invitation
 ↓
Send email
 ↓
User opens link
 ↓
Login/signup
 ↓
Accept
 ↓
Team membership
```

---

# PHASE 11 — SMTP

# Module 47. SMTP Configuration Model

Create:

```text
models/SMTPConfiguration.js
```

Store sensitive values securely.

Never return SMTP password to frontend.

---

# Module 48. SMTP Admin UI

Create:

```text
/admin/smtp
```

Fields:

```text
Host
Port
Username
Password
Sender Email
Sender Name
Email Notifications
```

Toggle:

```text
ON
OFF
```

---

# Module 49. Email Service

Create:

```text
integrations/smtp/emailService.js
```

Every platform email should go through this service.

Before sending:

```text
SMTP enabled?
      ↓
No → do not send
Yes → send
```

---

# PHASE 12 — BLOG DATABASE + BASIC CRUD

# Module 50. Blog Model

Create:

```text
models/Blog.js
```

Core fields:

```text
title
description
slug
category
subcategory
primaryKeywords
secondaryKeywords
featuredImage
content
author
accountType
team
writer
reviewer
publisher
status
publishedAt
publishedBy
metadata
```

Indexes:

```text
slug
status
category
subcategory
author
team
publishedAt
```

---

# Module 51. Blog Status Constants

Create:

```text
constants/blogStatus.js
```

Values:

```text
DRAFT
IN_WRITING
IN_REVIEW
RE_ASSIGN
IN_PUBLISHING
PUBLISHED
```

Do not use random strings throughout the application.

---

# Module 52. Blog Creation

Create:

```text
POST /api/blogs
```

Individual:

```text
Create → Draft
```

Team:

```text
Authorized Writer → Draft
```

---

# Module 53. Blog Basic Details

Create UI for:

```text
Title
Description
Category
Subcategory
Primary Keywords
Secondary Keywords
Slug
Featured Image
```

Validate relationships server-side.

The specification requires category, subcategory, keyword, slug, and other fields to be validated on both frontend and backend. fileciteturn0file0L739-L761

---

# Module 54. Blog CRUD

Implement:

```text
GET /api/blogs
GET /api/blogs/:id
PATCH /api/blogs/:id
DELETE /api/blogs/:id
```

Authorization must depend on:

```text
User
+
Permission
+
Account Type
+
Team Membership
+
Assignment
+
Blog Status
```

---

# PHASE 13 — MEDIA UPLOAD

# Module 55. Cloudinary Configuration

Create:

```text
integrations/cloudinary/
```

Configure:

```text
cloud name
API key
API secret
```

---

# Module 56. Multer Configuration

Create:

```text
middleware/uploadMiddleware.js
```

Validate:

- MIME type
- File extension
- File size
- Number of files

---

# Module 57. Media Model

Create:

```text
models/Media.js
```

Store:

```text
url
publicId
fileType
metadata
owner
```

---

# Module 58. Media API

Create:

```text
POST   /api/media
DELETE /api/media/:id
```

Flow:

```text
React
 ↓
multipart/form-data
 ↓
Express
 ↓
Multer
 ↓
Cloudinary
 ↓
MongoDB
 ↓
URL
```

Do not store large media files directly in MongoDB. fileciteturn0file0L1044-L1085

---

# PHASE 14 — TIPTAP EDITOR

# Module 59. TipTap Setup

Install TipTap packages.

Create:

```text
features/editor/
    BlogEditor.jsx
    Toolbar.jsx
    editorConfig.js
```

---

# Module 60. Editor Features

Implement one at a time:

1. [ ] Paragraphs
2. [ ] Bold
3. [ ] Italic
4. [ ] Headings
5. [ ] Lists
6. [ ] Links
7. [ ] Quotes
8. [ ] Code blocks
9. [ ] Images
10. [ ] Tables
11. [ ] Undo/redo

The specification lists these as the V1 editor capabilities. fileciteturn0file0L797-L814

---

# Module 61. Editor Auto-Save

Do not save on every keystroke.

Use:

```text
Typing
 ↓
Debounce
 ↓
Save
```

Example:

```text
User stops typing
        ↓
Wait 2–5 seconds
        ↓
Save draft
```

---

# Module 62. Metadata Editing

Add:

```text
Meta Title
Meta Description
Author Name
```

---

# PHASE 15 — VERSION HISTORY

# Module 63. BlogVersion Model

Create:

```text
models/BlogVersion.js
```

Fields:

```text
blogId
versionNumber
content
metadata
createdBy
createdAt
changeSummary
```

---

# Module 64. Meaningful Version Creation

Do not create:

```text
v1
v2
v3
v4
...
```

for every keystroke.

Create versions after meaningful changes.

---

# Module 65. Version History API

Create:

```text
GET  /api/blogs/:id/versions
GET  /api/blogs/:id/versions/:versionId
POST /api/blogs/:id/versions/:versionId/restore
```

---

# Module 66. Version UI

Display:

```text
v1
v2
v3
v4
```

Allow:

- View
- Compare
- Restore

Important:

```text
Restore v2
    ↓
Create v5
```

Never delete v3/v4.

---

# PHASE 16 — COMMENTS

# Module 67. Comment Model

Create:

```text
models/Comment.js
```

Fields:

```text
blog
author
content
parentComment
status
createdAt
updatedAt
```

Statuses:

```text
OPEN
RESOLVED
```

---

# Module 68. Comment API

Implement:

```text
POST   /api/comments
GET    /api/blogs/:id/comments
PATCH  /api/comments/:id
DELETE /api/comments/:id
POST   /api/comments/:id/replies
POST   /api/comments/:id/resolve
```

---

# Module 69. Comment UI

Create dedicated comment panel.

V1 does NOT include inline Google Docs-style comments.

---

# PHASE 17 — WORKFLOW STATE MACHINE

# Module 70. Workflow Service

Create:

```text
services/blogWorkflowService.js
constants/workflow.js
```

Represent transitions explicitly.

```text
Draft
 ↓
In Writing
 ↓
In Review
 ├── Reject → Re Assign
 │              ↓
 │          In Writing
 │
 └── Approve → In Publishing
                    ↓
                Published
```

The specification requires the backend to validate current status, permission, assigned user, and requested transition. fileciteturn0file0L1412-L1464

---

# Module 71. Transition API

Create a controlled endpoint such as:

```text
PATCH /api/blogs/:id/status
```

Request:

```json
{
  "status": "IN_REVIEW"
}
```

Backend decides whether it is legal.

Never allow arbitrary:

```json
{
  "status": "PUBLISHED"
}
```

without authorization and transition validation.

---

# PHASE 18 — TEAM ASSIGNMENT

# Module 72. Assignment Step

For Team blogs:

```text
Writer
Reviewer
Publisher
```

Validate:

- Same team
- Accepted membership
- Correct workflow permission
- Role availability

After assignment:

```text
Draft → In Writing
```

---

# Module 73. Writer Workflow

Writer can:

```text
Edit content
Save
Add comments
Resolve appropriate comments
Submit for review
```

Submit:

```text
In Writing → In Review
```

---

# PHASE 19 — REVIEW

# Module 74. Reviewer Dashboard

Create:

```text
/blogs/review
```

Show assigned blogs.

---

# Module 75. Review Screen

Reviewer can:

- Read blog
- View comments
- Add comments
- Resolve comments
- Approve
- Reject

---

# Module 76. Reject Workflow

Reject requires reason/comment.

Flow:

```text
In Review
 ↓
Reject
 ↓
Re Assign
 ↓
In Writing
```

---

# Module 77. Approve Workflow

Flow:

```text
In Review
 ↓
Approve
 ↓
In Publishing
```

Only authorized reviewer can perform this transition.

---

# PHASE 20 — PUBLISHING

# Module 78. Publisher Dashboard

Create:

```text
/blogs/publishing
```

Show:

```text
Assigned publisher blogs
Status = In Publishing
```

---

# Module 79. Publishing Validation

Before publishing check:

- Content exists.
- Metadata exists.
- Approved state is correct.
- Slug is unique.
- Featured image/media is valid.
- Publisher is authorized.

---

# Module 80. Publish

Flow:

```text
In Publishing
 ↓
Validate
 ↓
Publish
 ↓
Published
```

Store:

```text
publishedAt
publishedBy
publicUrl
publicationMetadata
```

---

# PHASE 21 — INDIVIDUAL BLOG FLOW

# Module 81. Individual Publishing

Individual users bypass:

```text
Writer
Reviewer
Publisher
```

Flow:

```text
Draft
 ↓
Write
 ↓
Publish
 ↓
Published
```

Still use the same Blog model.

Do not create a second blog system.

---

# PHASE 22 — PUBLIC API

# Module 82. Public API Base

Create:

```text
/api/public
```

No authentication.

Only published content.

---

# Module 83. Public Blog Endpoints

Implement:

```text
GET /api/public/blogs
GET /api/public/blogs/:slug
GET /api/public/blogs/category/:categorySlug
GET /api/public/categories
```

Support:

- Pagination
- Search
- Category
- Subcategory
- Keywords
- Sorting
- Published-date filtering

---

# Module 84. Public API Security

Even though the API is public:

- Add rate limiting.
- Validate query parameters.
- Do not expose internal fields.
- Do not expose team information.
- Do not expose comments/internal assignments.
- Do not expose version history.
- Do not expose private user data.

Only:

```text
status = PUBLISHED
```

blogs can be returned. fileciteturn0file0L592-L643

---

# PHASE 23 — PUBLIC BLOG PAGE

# Module 85. Public Blog Route

Create:

```text
/blog/:slug
```

Fetch:

```text
GET /api/public/blogs/:slug
```

---

# Module 86. Public Blog UI

Display:

```text
Title
Description
Featured image
Author
Category
Subcategory
Published date
Content
Meta information
```

No login required.

---

# PHASE 24 — AI ASSISTANT

Implement AI only after the core editor and publishing workflow works.

# Module 87. OpenRouter Integration

Create:

```text
integrations/openrouter/
    openrouterClient.js
    aiService.js
```

Architecture:

```text
React
 ↓
Express
 ↓
AIService
 ↓
OpenRouter
 ↓
AI Model
```

Never call OpenRouter directly from React.

The specification explicitly requires all AI requests to pass through the Express backend and requires an AIService abstraction. fileciteturn0file0L826-L848

---

# Module 88. AI Generate Content

Endpoint:

```text
POST /api/ai/generate
```

Input:

```text
topic
context
tone
length
```

Return generated content.

---

# Module 89. AI Selection Editing

Implement:

```text
Improve
Rewrite
Expand
Shorten
Change Tone
```

Flow:

```text
Select text
 ↓
AI Assist
 ↓
Choose action
 ↓
Backend
 ↓
AI
 ↓
Result
 ↓
Accept / Reject
```

Never automatically replace user text.

---

# Module 90. AI Metadata

Implement:

```text
Generate title
Generate meta title
Generate meta description
Generate summary/excerpt
```

---

# PHASE 25 — DEV.TO

# Module 91. Publishing Abstraction

Create:

```text
integrations/publishing/
    publishingService.js
```

The core application should not directly depend on Dev.to-specific logic.

---

# Module 92. Dev.to Client

Create:

```text
integrations/devto/devtoClient.js
```

Implement publishing.

---

# Module 93. ExternalPublication Model

Create:

```text
models/ExternalPublication.js
```

Store:

```text
externalPlatform
externalArticleId
externalUrl
publicationStatus
publishedAt
responseMetadata
```

---

# Module 94. Publish to Dev.to

UI:

```text
Published Blog
       ↓
Publish to Dev.to
       ↓
Dev.to API
       ↓
Store external publication
```

V1 should implement Dev.to only, not multiple external platforms. fileciteturn0file0L1016-L1039

---

# PHASE 26 — USER PROFILE

# Module 95. Profile API

Implement:

```text
GET   /api/users/me
PATCH /api/users/me
POST  /api/users/me/profile-image
PATCH /api/users/me/password
```

---

# Module 96. Profile UI

Create:

```text
/profile
```

Display/edit:

```text
Profile picture
Full name
Username
Email
Bio
Interests
Account type
Team
Workflow role
Password
Logout
```

---

# PHASE 27 — DASHBOARD

# Module 97. Published Blog Query

Create service:

```text
getPublishedBlogsForUser()
```

V1 recommendation logic is simple interest matching.

---

# Module 98. Interest-Based Recommendations

Example:

```text
User:
Technology
Gaming

       ↓

Blogs:
Technology
Gaming

       ↓

Dashboard
```

Do not build machine-learning recommendations in V1.

The specification explicitly keeps V1 recommendation logic to simple interest matching. fileciteturn0file0L1325-L1353

---

# Module 99. Dashboard UI

Show:

```text
Recommended Blogs
My Published Blogs
```

Blog cards:

```text
Image
Title
Excerpt
Category
Author
Published date
```

---

# PHASE 28 — ADMIN USER / TEAM VISIBILITY

# Module 100. User Management

Admin page:

```text
/admin/users
```

Show:

```text
Name
Username
Email
Account type
Team
Role
Created date
Status
```

---

# Module 101. Team Management

Admin page:

```text
/admin/teams
```

Show:

```text
Team
Owner
Members
Created date
```

---

# PHASE 29 — ADMIN ANALYTICS

# Module 102. Analytics Service

Create:

```text
services/analyticsService.js
```

Use MongoDB aggregation pipelines.

Do not create a separate analytics database.

---

# Module 103. Dashboard Cards

Implement:

```text
Total Blogs
Draft Blogs
Blogs In Writing
Blogs In Review
Blogs Re-Assigned
Blogs In Publishing
Published Blogs
Total Users
Total Teams
```

---

# Module 104. Analytics Queries

Implement:

```text
Blogs created over time
Blogs published over time
Blogs by category
Blogs by status
Top authors
```

---

# Module 105. Analytics UI

Create charts and tables.

Tables:

```text
Recent blogs
Top authors
Category-wise blog count
Publishing activity
```

---

# PHASE 30 — FRONTEND ROUTING

# Module 106. Route Map

Implement:

```text
ADMIN
/admin/login
/admin/dashboard
/admin/categories
/admin/subcategories
/admin/keywords
/admin/interests
/admin/users
/admin/roles
/admin/permissions
/admin/smtp
/admin/analytics

AUTH
/login
/signup
/forgot-password
/reset-password

ONBOARDING
/onboarding
/welcome

USER
/dashboard
/blogs
/blogs/create
/blogs/:id
/blogs/:id/edit
/blogs/:id/review
/blogs/:id/publish
/profile
/team

PUBLIC
/blog/:slug
```

These routes follow the application's specified separation between Admin, Main User, and Public blog experiences. fileciteturn0file0L1257-L1295

---

# PHASE 31 — FRONTEND REDUX

# Module 107. Redux Store

Create:

```text
app/store/store.js
```

---

# Module 108. Redux Slices

Create only the global state that is actually needed:

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

Do not put every form field into Redux.

---

# Module 109. API Service Layer

Create:

```text
services/api/
    authApi.js
    blogApi.js
    teamApi.js
    categoryApi.js
    interestApi.js
    userApi.js
    adminApi.js
    aiApi.js
    publishingApi.js
```

Keep API calls outside React components.

---

# PHASE 32 — UI QUALITY

# Module 110. Loading States

Every async feature should have:

```text
Loading
Success
Error
Empty
```

---

# Module 111. Toast Notifications

Use consistent notifications for:

```text
Success
Error
Warning
Info
```

---

# Module 112. Confirmation Dialogs

Use confirmation for:

```text
Delete blog
Delete comment
Delete category
Remove member
Revoke invitation
Restore version
Publish blog
```

---

# Module 113. Responsive UI

Test:

```text
Desktop
Tablet
Mobile
```

Especially:

```text
Admin sidebar
Blog editor
Blog cards
Comments
Team management
Tables
```

---

# PHASE 33 — SECURITY

# Module 114. Security Middleware

Implement:

- [ ] Helmet/security headers.
- [ ] CORS.
- [ ] Rate limiting.
- [ ] Request validation.
- [ ] File validation.
- [ ] Authentication middleware.
- [ ] Permission middleware.
- [ ] Secure cookies/token handling according to chosen architecture.
- [ ] Environment variable protection.

---

# Module 115. Authorization Audit

Check every sensitive endpoint.

For each endpoint ask:

```text
Who is the user?
 ↓
Are they authenticated?
 ↓
What permission do they have?
 ↓
Are they in the correct team?
 ↓
Are they assigned to this blog?
 ↓
Is the blog in the correct status?
 ↓
Is this transition allowed?
```

---

# PHASE 34 — TESTING

# Module 116. Authentication Tests

Test:

- [ ] Signup.
- [ ] Duplicate email.
- [ ] Invalid email.
- [ ] Weak password.
- [ ] Login.
- [ ] Wrong password.
- [ ] Refresh token.
- [ ] Logout.
- [ ] Forgot password.
- [ ] Reset password.
- [ ] Unauthorized API access.
- [ ] Google OAuth.

---

# Module 117. RBAC Tests

Test:

- [ ] Writer permission.
- [ ] Reviewer permission.
- [ ] Publisher permission.
- [ ] Team Owner permission.
- [ ] Custom role.
- [ ] Unauthorized action.

---

# Module 118. Team Tests

Test:

- [ ] Team creation.
- [ ] Invitation link.
- [ ] Email invitation.
- [ ] Accept invitation.
- [ ] Expired invitation.
- [ ] Revoked invitation.
- [ ] Duplicate role assignment.
- [ ] Unauthorized team access.

---

# Module 119. Blog Tests

Test:

- [ ] Create draft.
- [ ] Edit blog.
- [ ] Category validation.
- [ ] Subcategory validation.
- [ ] Keyword validation.
- [ ] Duplicate slug.
- [ ] Version creation.
- [ ] Version restoration.
- [ ] Comment creation.
- [ ] Comment reply.
- [ ] Comment resolution.

---

# Module 120. Workflow Tests

Test every valid transition:

```text
Draft → In Writing
In Writing → In Review
In Review → Re Assign
In Review → In Publishing
Re Assign → In Writing
In Publishing → Published
```

Also test invalid transitions.

Examples:

```text
Draft → Published ❌
Reviewer → Published ❌
Writer → Published ❌
```

---

# Module 121. Public API Tests

Test:

- [ ] Published blog accessible.
- [ ] Draft inaccessible.
- [ ] Category filter.
- [ ] Subcategory filter.
- [ ] Keyword filter.
- [ ] Search.
- [ ] Pagination.
- [ ] Sorting.
- [ ] Slug retrieval.
- [ ] Rate limiting.

---

# PHASE 35 — INTEGRATION TESTING

# Module 122. Individual User End-to-End Test

Run:

```text
Signup
 ↓
Login
 ↓
Onboarding
 ↓
Individual
 ↓
Select Interests
 ↓
Dashboard
 ↓
Create Blog
 ↓
Write
 ↓
AI assist
 ↓
Save
 ↓
Publish
 ↓
Public Blog
```

Do not continue until this complete flow works.

---

# Module 123. Team End-to-End Test

Run:

```text
Signup
 ↓
Onboarding
 ↓
Team
 ↓
Create Team
 ↓
Become Owner + Writer
 ↓
Invite Reviewer
 ↓
Invite Publisher
 ↓
Create Blog
 ↓
Assign users
 ↓
Write
 ↓
Submit Review
 ↓
Reviewer Reviews
 ↓
Approve
 ↓
Publisher Publishes
 ↓
Public Blog
```

---

# Module 124. Rejection Flow Test

Test:

```text
Writer
 ↓
In Review
 ↓
Reviewer Rejects
 ↓
Re Assign
 ↓
Writer edits
 ↓
In Review
 ↓
Approve
 ↓
In Publishing
 ↓
Publish
```

---

# Module 125. Version Restore Test

Test:

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

Confirm that:

```text
v1
v2
v3
v4
```

all remain available.

---

# PHASE 36 — DEPLOYMENT

# Module 126. Backend Production Configuration

Prepare:

```text
Production MongoDB
Production environment variables
Cloudinary
OpenRouter
SMTP
Google OAuth
Dev.to
CORS
Rate limits
```

---

# Module 127. Frontend Production Configuration

Set:

```text
VITE_API_URL
```

Never place secret API keys in Vite environment variables.

Frontend environment variables are visible to the browser.

---

# Module 128. Database Production Checks

Before production:

- [ ] Verify indexes.
- [ ] Verify unique constraints.
- [ ] Verify database user permissions.
- [ ] Verify backup strategy.
- [ ] Verify connection string.
- [ ] Verify production database.

---

# Module 129. Production Security Checklist

- [ ] HTTPS.
- [ ] Strong JWT secrets.
- [ ] No `.env` in Git.
- [ ] No API keys in frontend.
- [ ] CORS restricted.
- [ ] Rate limiting enabled.
- [ ] Secure headers enabled.
- [ ] File upload limits enabled.
- [ ] Admin credentials configured securely.
- [ ] SMTP password never returned.
- [ ] OpenRouter key only on backend.
- [ ] Dev.to key only on backend.

---

# PHASE 37 — FINAL PROJECT VERIFICATION

Before declaring V1 complete, verify:

## Authentication

- [ ] Signup works.
- [ ] Login works.
- [ ] Logout works.
- [ ] Refresh works.
- [ ] Forgot/reset password works.
- [ ] Google login works.

## Admin

- [ ] Admin login works.
- [ ] Admin routes are protected.
- [ ] Dashboard works.
- [ ] Categories work.
- [ ] Subcategories work.
- [ ] Keywords work.
- [ ] Interests work.
- [ ] Users visible.
- [ ] Teams visible.
- [ ] Roles work.
- [ ] Permissions work.
- [ ] SMTP works.
- [ ] Email toggle works.
- [ ] Analytics work.

## User

- [ ] Onboarding works.
- [ ] Individual account works.
- [ ] Team account works.
- [ ] Interests work.
- [ ] Dashboard works.
- [ ] Profile works.

## Teams

- [ ] Team creation works.
- [ ] Invitations work.
- [ ] Roles work.
- [ ] Owner permissions work.
- [ ] Member removal works.
- [ ] Role changes work.

## Blogging

- [ ] Create blog.
- [ ] Edit blog.
- [ ] Category.
- [ ] Subcategory.
- [ ] Keywords.
- [ ] Slug.
- [ ] Featured image.
- [ ] TipTap.
- [ ] Media.
- [ ] Auto-save.
- [ ] Version history.
- [ ] Restore.
- [ ] Comments.
- [ ] Review.
- [ ] Reassignment.
- [ ] Publishing.

## AI

- [ ] Generate content.
- [ ] Continue writing.
- [ ] Improve.
- [ ] Rewrite.
- [ ] Expand.
- [ ] Shorten.
- [ ] Change tone.
- [ ] Title generation.
- [ ] Meta title.
- [ ] Meta description.
- [ ] Summary.

## Public

- [ ] Public API.
- [ ] Search.
- [ ] Filters.
- [ ] Pagination.
- [ ] Public blog page.
- [ ] Only published content visible.

## External Publishing

- [ ] Dev.to integration.
- [ ] External article ID stored.
- [ ] External URL stored.
- [ ] Publication status stored.

---

# 4. Exact Beginner Implementation Sequence

If you have zero experience with the architecture, implement in exactly this order:

```text
1. Backend setup
2. MongoDB connection
3. Environment variables
4. Error handling
5. Validation
6. User model
7. Signup
8. Login
9. JWT middleware
10. Refresh tokens
11. Logout
12. Frontend auth pages
13. Protected routes
14. Admin model
15. Admin login
16. Admin middleware
17. Admin layout
18. Category CRUD
19. Subcategory CRUD
20. Keyword CRUD
21. Interest CRUD
22. Role model
23. Permission model
24. Permission middleware
25. User onboarding
26. Team model
27. Team creation
28. Team membership
29. Invitations
30. SMTP
31. Blog model
32. Blog CRUD
33. Media upload
34. TipTap editor
35. Auto-save
36. Version history
37. Comments
38. Workflow state machine
39. Writer workflow
40. Reviewer workflow
41. Publisher workflow
42. Individual publishing
43. Public API
44. Public blog page
45. AI integration
46. Dev.to integration
47. User profile
48. Dashboard recommendations
49. Admin user/team management
50. Admin analytics
51. Security hardening
52. Automated tests
53. End-to-end tests
54. Deployment
55. Final verification
```

---

# 5. What You Should NOT Build Yet

Do not start with these:

```text
❌ AI
❌ Dev.to
❌ Analytics
❌ Advanced recommendations
❌ Real-time collaboration
❌ Microservices
❌ Mobile app
```

First build the foundation:

```text
Auth
 ↓
Users
 ↓
Teams
 ↓
RBAC
 ↓
Blogs
 ↓
Workflow
 ↓
Publishing
```

The V1 specification explicitly excludes real-time collaborative editing, multiple teams per user, complex recommendations, multiple external publishing platforms, advanced analytics, microservices, mobile applications, and payments. fileciteturn0file0L1654-L1667

---

# 6. Definition of Done for Every Module

A module is NOT finished merely because its code exists.

Mark a module complete only when:

- [ ] Database/model is complete.
- [ ] Backend validation is complete.
- [ ] Service/business logic is complete.
- [ ] Controller is complete.
- [ ] Route is complete.
- [ ] Authorization is complete.
- [ ] API tested in Postman.
- [ ] Frontend page/component is complete.
- [ ] API connected to frontend.
- [ ] Loading state works.
- [ ] Error state works.
- [ ] Success state works.
- [ ] Unauthorized case tested.
- [ ] Database records verified.
- [ ] Git commit created.

---

# 7. Recommended Git Commit Strategy

Do small commits.

Examples:

```text
chore: initialize backend
chore: connect mongodb
feat: add user model
feat: implement signup
feat: implement login
feat: add jwt middleware
feat: add refresh token rotation
feat: add admin authentication
feat: add category management
feat: add subcategory management
feat: add keyword management
feat: add interest management
feat: add role permission system
feat: add onboarding
feat: add team creation
feat: add team invitations
feat: add blog crud
feat: add cloudinary uploads
feat: integrate tiptap editor
feat: add blog versions
feat: add comments
feat: implement blog workflow
feat: add reviewer workflow
feat: add publisher workflow
feat: add public blog api
feat: add ai writing assistant
feat: add devto publishing
feat: add analytics
test: add authentication tests
test: add workflow tests
test: add public api tests
```

---

# 8. The Most Important Architecture Rule

For almost every feature, use this flow:

```text
React Component
      ↓
Redux/API Service
      ↓
Express Route
      ↓
Middleware
      ↓
Controller
      ↓
Service
      ↓
Repository/Data Access
      ↓
Mongoose Model
      ↓
MongoDB
```

External services should be isolated:

```text
Service
   ↓
Integration
   ├── Cloudinary
   ├── Google
   ├── OpenRouter
   ├── SMTP
   └── Dev.to
```

This follows the specification's requirement to keep controllers thin, business logic in services, API calls in service layers, and external integrations isolated. fileciteturn0file0L1357-L1375

---

# 9. Final Architecture

```text
                         ┌──────────────────┐
                         │   React Frontend │
                         └────────┬─────────┘
                                  │
                         Axios / REST API
                                  │
                                  ▼
                         ┌──────────────────┐
                         │ Express Backend  │
                         └────────┬─────────┘
                                  │
             ┌────────────────────┼────────────────────┐
             │                    │                    │
             ▼                    ▼                    ▼
        Middleware            Services             Controllers
             │                    │
             │                    ├── Auth
             │                    ├── Blog
             │                    ├── Team
             │                    ├── Workflow
             │                    ├── AI
             │                    ├── Publishing
             │                    └── Analytics
             │
             ▼
        Authorization
             │
             ▼
        Data Access
             │
             ▼
        ┌─────────────┐
        │  MongoDB    │
        └─────────────┘

External Integrations:

OpenRouter ── AIService
Cloudinary ── MediaService
Google ────── AuthService
SMTP ──────── EmailService
Dev.to ────── PublishingService
```

---

# 10. Milestone Plan

## Milestone 1 — Foundation

```text
Backend
Frontend
MongoDB
Environment
Error handling
Validation
```

## Milestone 2 — Authentication

```text
Signup
Login
JWT
Refresh
Logout
Protected routes
```

## Milestone 3 — Admin

```text
Admin login
Categories
Subcategories
Keywords
Interests
```

## Milestone 4 — RBAC + Teams

```text
Roles
Permissions
Teams
Owner
Invitations
SMTP
```

## Milestone 5 — Blog Core

```text
Blog model
CRUD
Media
TipTap
Auto-save
```

## Milestone 6 — Workflow

```text
Writer
Reviewer
Publisher
State machine
Comments
Version history
```

## Milestone 7 — Publishing

```text
Individual publishing
Team publishing
Public API
Public blog page
```

## Milestone 8 — Advanced Features

```text
AI
Dev.to
Recommendations
Analytics
```

## Milestone 9 — Production

```text
Security
Testing
Deployment
Monitoring
Final QA
```

---

# 11. Your First Task

Do NOT start by creating 100 files.

Start with only:

```text
collaborative-blog-platform/
│
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── utils/
│   │   ├── validators/
│   │   └── app.js
│   ├── server.js
│   ├── .env
│   ├── .env.example
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── app/
    │   ├── components/
    │   ├── features/
    │   ├── layouts/
    │   ├── pages/
    │   ├── services/
    │   └── utils/
    └── package.json
```

Then complete only:

```text
Module 1
 ↓
Module 2
 ↓
Module 3
 ↓
Module 4
```

After those four are working, begin authentication.

---

# 12. Golden Rule

Build the platform in this dependency order:

```text
FOUNDATION
    ↓
AUTHENTICATION
    ↓
AUTHORIZATION
    ↓
DATA MANAGEMENT
    ↓
TEAMS
    ↓
BLOG
    ↓
EDITOR
    ↓
WORKFLOW
    ↓
PUBLISHING
    ↓
PUBLIC API
    ↓
AI / EXTERNAL SERVICES
    ↓
ANALYTICS
    ↓
TESTING
    ↓
DEPLOYMENT
```

Do not skip ahead simply because a feature looks more interesting.

The V1 goal is a complete collaborative publishing SaaS with clean architecture, secure backend authorization, incremental implementation, and independently testable modules. fileciteturn0file0L1674-L1719
