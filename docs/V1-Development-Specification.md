# Collaborative Blog Writing & Publishing Platform — V1

## 1. Project Overview

Build a full-stack **Blog Writing, Collaboration, Review, and Publishing Platform**.

The platform will allow users to discover blogs based on their interests, create and manage blog content, collaborate through team-based Writer/Reviewer/Publisher workflows, use AI assistance while writing, maintain automatic version history, publish approved content, and expose published blogs through a completely public API.

The application will have **two separate panels**:

1. **Admin Panel**
2. **Main User Panel**

The application should be designed with clean separation of concerns, reusable components, scalable backend architecture, proper authentication/authorization, validation, error handling, and maintainable code.

---

# 2. Technology Stack

## Frontend

- React
- Redux Toolkit
- React Router
- TipTap rich-text editor
- Axios or an equivalent HTTP client
- A suitable charting library for Admin analytics
- Responsive UI

## Backend

- Node.js
- Express.js
- REST APIs
- JWT authentication
- Google OAuth
- Multer
- Cloudinary
- OpenRouter API
- Proper middleware architecture

## Database

- MongoDB Atlas
- Mongoose ODM

## External Services

- Google OAuth
- Cloudinary for media storage
- OpenRouter public API for AI functionality
- SMTP server for platform emails
- Dev.to API for third-party publishing

---

# 3. Application Architecture

Use a modular architecture.

## Frontend Structure

Separate the application into:

```text
src/
├── app/
│   ├── store/
│   ├── routes/
│   └── providers/
│
├── features/
│   ├── auth/
│   ├── admin/
│   ├── blogs/
│   ├── editor/
│   ├── teams/
│   ├── users/
│   ├── interests/
│   └── analytics/
│
├── components/
├── layouts/
├── pages/
├── hooks/
├── services/
├── utils/
└── constants/
```

Use Redux Toolkit for global application state such as:

- Authentication
- Current user
- Team information
- Interests
- Blog state
- Categories/subcategories
- Notifications
- UI state where appropriate

Do not put every piece of local component state into Redux.

---

# 4. Admin Panel

The Admin Panel is completely separate from the Main User Panel.

## Admin Authentication

There must be exactly **one main Admin account**.

Requirements:

- Separate Admin login page.
- No Admin signup page.
- Admin credentials must never be hardcoded into frontend code.
- Password must be securely hashed.
- Admin authentication must be separate from normal user authentication.
- Admin APIs must have dedicated authentication/authorization middleware.
- Normal users must never be able to access Admin APIs or Admin routes.

Initial Admin credentials can be configured securely through environment variables or an initialization mechanism.

---

# 5. Admin Dashboard & Analytics

Create an Admin Dashboard containing graphical and tabular analytics.

## Overview Cards

Display:

- Total Blogs
- Draft Blogs
- Blogs In Writing
- Blogs In Review
- Blogs Re-Assigned
- Blogs In Publishing
- Published Blogs
- Total Users
- Total Teams

## Graphical Analytics

Include:

- Blogs created over time
- Blogs published over time
- Blogs by category
- Blogs by status
- Top authors

## Tabular Analytics

Include:

- Recent blogs
- Top authors
- Category-wise blog count
- Publishing activity

Use MongoDB aggregation pipelines for analytics.

Do not introduce a separate analytics database for V1.

---

# 6. Category, Subcategory & Keyword Management

The Admin must have complete CRUD functionality for:

- Categories
- Subcategories
- Primary Keywords
- Secondary Keywords

The hierarchy must be:

```text
Category
    ↓
Subcategory
    ↓
Primary Keywords
Secondary Keywords
```

Example:

```text
Technology
    └── Web Development
          ├── Primary Keywords
          │     ├── React
          │     ├── Node.js
          │     └── Express
          │
          └── Secondary Keywords
                ├── REST API
                ├── JWT
                └── MongoDB
```

Requirements:

- Every subcategory belongs to one category.
- Keywords belong to a specific subcategory.
- Primary and secondary keywords must be distinguishable.
- Dropdowns in the Blog Creation flow must be dynamically populated.
- Selecting a category should load only its subcategories.
- Selecting a subcategory should load only its associated keywords.
- Backend must validate all category/subcategory/keyword relationships.
- Users must not be able to submit unrelated category/keyword combinations by manipulating API requests.

---

# 7. Interest Topics

The Admin must have CRUD functionality for global interest topics.

Examples:

- Technology
- Gaming
- Anime
- Finance
- Travel
- Programming
- Artificial Intelligence

Interests are independent from the Category → Subcategory → Keyword hierarchy.

Users can select multiple interests.

These interests are used to personalize the user's dashboard.

---

# 8. Admin RBAC Management

The Admin must be able to manage roles and permissions.

Default workflow roles:

- Writer
- Reviewer
- Publisher

The system must also support custom roles.

Custom roles must be **permission-based**.

Example:

```text
Role: Content Manager

Permissions:
- View Blogs
- Create Blogs
- Edit Blogs
- View Analytics
- Manage Comments
- Review Blogs
- Publish Blogs
- Manage Users
- Manage Categories
```

Do not hard-code all authorization logic around role names.

Use a proper:

```text
Role → Permissions
```

relationship.

The permission system should be extensible.

---

# 9. SMTP Configuration

The Admin Panel must contain SMTP configuration settings.

Admin can configure:

- SMTP host
- SMTP port
- SMTP username
- SMTP password
- Sender email
- Sender name
- Other required SMTP configuration

Include an:

```text
Email Notifications: ON / OFF
```

toggle.

Behavior:

```text
Toggle OFF
    ↓
No platform email should be triggered.

Toggle ON
    ↓
Platform is allowed to send configured emails.
```

SMTP credentials must never be returned to the frontend in plaintext.

Sensitive credentials must be stored securely.

---

# 10. User Authentication

The Main User Panel must support:

## Normal Authentication

- Signup
- Login
- Logout
- Password hashing
- Forgot password
- Reset password
- Appropriate validation

## Google OAuth

Users can sign up/login using Google.

Google authentication should ultimately map to the application's own User account.

## JWT Architecture

Use:

- Short-lived access token
- Long-lived refresh token
- Refresh-token rotation/revocation where appropriate
- Authentication middleware
- Role/permission middleware

Both:

```text
Email/Password
Google OAuth
```

must ultimately use the application's backend-managed authentication/session model.

Authentication secrets must never be exposed to the React application unnecessarily.

---

# 11. User Onboarding

A newly registered user must see an onboarding flow on their first login.

Onboarding should contain:

## Step 1 — Scope

Ask:

```text
Are you an Individual Contributor
or
Are you working as part of a Team?
```

---

## Step 2A — Individual User

If the user selects:

```text
Individual
```

continue directly to interests.

No team is created.

Individual users can directly create and publish blogs without the Writer → Reviewer → Publisher workflow.

---

## Step 2B — Team User

If the user selects:

```text
Team
```

ask for:

- Team Name
- Workflow Role

The user can select exactly one:

- Writer
- Reviewer
- Publisher

The system creates the team.

The user who creates the team automatically becomes:

```text
Team Owner
+
Selected Workflow Role
```

Example:

```text
Anuj
Team Owner + Writer
```

Team Owner is an administrative permission and is separate from workflow permissions.

---

# 12. Team Owner Permissions

The Team Owner can:

- View team members
- Generate invitations
- Send email invitations
- Revoke invitations
- Remove team members
- Change workflow roles
- Manage team settings

The Team Owner cannot automatically:

- Review blogs
- Approve blogs
- Publish blogs
- Write blogs

unless they also possess the corresponding workflow role.

For example:

```text
Team Owner + Writer
```

can write blogs but cannot review or publish them unless they also have those permissions.

---

# 13. Team Structure

For V1:

- A user can belong to only one team.
- A team has one Team Owner.
- A team has one Writer workflow position.
- A team has one Reviewer workflow position.
- A team has one Publisher workflow position.

The architecture should remain clean enough to support multiple teams per user in a future version, but multi-team membership is NOT required for V1.

---

# 14. Team Invitations

The Team Owner can invite members using two methods.

## Method 1 — Invitation Link

Team Owner:

1. Selects a workflow role.
2. Generates a secure invitation link.
3. Copies and shares the link.

The invitation should have:

- Unique secure token
- Assigned team
- Assigned role
- Expiration date
- Status

Invitation states:

```text
Pending
Accepted
Expired
Revoked
```

The link becomes invalid after successful acceptance.

The role must be stored server-side and must not be changeable by manipulating the URL.

---

## Method 2 — Email Invitation

Team Owner:

1. Enters invitee email.
2. Selects role.
3. System generates invitation.
4. System sends email through configured SMTP.
5. User opens invitation.
6. User creates/logs into their account.
7. User accepts invitation.
8. User is added to the team with the assigned role.

---

# 15. Onboarding Interests

Users select multiple Interest Topics.

Example:

```text
✓ Technology
✓ Gaming
✓ Anime
```

Store these interests on the user profile.

After onboarding is completed:

```text
Onboarding Complete
       ↓
Welcome Screen
       ↓
Dashboard
```

Do not show onboarding again unless the user explicitly edits their onboarding/profile preferences.

---

# 16. Main User Dashboard

The dashboard should show blogs based on the user's selected interests.

Include:

- Recommended/relevant blogs
- Blog cards
- Featured image
- Title
- Description/excerpt
- Category
- Author
- Published date

Also provide:

```text
My Published Blogs
```

tab showing the user's published content.

---

# 17. Public Blog API

Create a completely public, read-only API.

No authentication is required.

Only published blogs should be accessible.

Example endpoints:

```http
GET /api/public/blogs
GET /api/public/blogs/:slug
GET /api/public/blogs/category/:categorySlug
GET /api/public/categories
```

Support:

- Pagination
- Category filtering
- Subcategory filtering
- Keyword filtering
- Search
- Sorting
- Published-date filtering
- Slug-based retrieval

Example:

```http
GET /api/public/blogs/category/web-development
```

Only blogs with:

```text
status = Published
```

can be returned.

Never expose:

- Draft content
- Internal assignments
- Reviewer comments
- Team information
- Version history
- SMTP credentials
- Internal authentication information
- Private user information

Apply API rate limiting and proper validation.

---

# 18. Public Blog Page

The public blog page will live inside the same React application.

Example:

```text
/blog/my-awesome-blog
```

The page should fetch the published blog using the public API.

Display:

- Title
- Description
- Featured image
- Author
- Category
- Subcategory
- Published date
- Blog content
- Meta information where appropriate

Use the blog's unique slug for routing.

---

# 19. Blog Creation

Only a **Writer** can create a Team blog.

Individual users can create their own blogs directly.

Create a dedicated Blog Creation/Edit experience.

---

# 20. Blog Status State Machine

Use the following statuses:

```text
Draft
In Writing
In Review
Re Assign
In Publishing
Published
```

## Individual Flow

```text
Draft
  ↓
Write Content
  ↓
Publish
  ↓
Published
```

Individual users do not require reviewer/publisher stages.

## Team Flow

```text
Draft
  ↓
In Writing
  ↓
In Review
  ├── Rejected → Re Assign
  │                  ↓
  │              In Writing
  │
  └── Approved
         ↓
     In Publishing
         ↓
      Published
```

Backend must enforce valid state transitions.

Frontend buttons must never be the only authorization mechanism.

---

# 21. Blog Step 1 — Basic Details

Fields:

- Title
- Description
- Category
- Subcategory
- Primary Keywords
- Secondary Keywords
- Slug
- Featured Image

Requirements:

- Category is required.
- Subcategory must belong to selected category.
- Keywords must belong to selected subcategory.
- Slug must be unique.
- Slug should be URL-safe.
- Validate all fields on frontend and backend.

After basic details are saved:

```text
Status = Draft
```

---

# 22. Blog Step 2 — Assignment

This step applies only to Team blogs.

The Writer/authorized user assigns:

- Writer
- Reviewer
- Publisher

Only accepted team members can be assigned.

The system must validate that:

- Assigned Writer has Writer permissions.
- Assigned Reviewer has Reviewer permissions.
- Assigned Publisher has Publisher permissions.
- All assigned users belong to the same team.
- A user cannot assign someone outside their team.

After assignment:

```text
Status = In Writing
```

---

# 23. Blog Step 3 — Content Editor

Use **TipTap** as the rich-text editor.

The Content screen should support:

- Rich text formatting
- Headings
- Paragraphs
- Lists
- Links
- Images
- Quotes
- Code blocks where appropriate
- Tables where appropriate
- Media
- Undo/redo
- Auto-save

Additional fields:

- Meta Title
- Meta Description
- Author Name

The editor should be componentized and extensible.

---

# 24. AI Writing Assistant

Use **OpenRouter public API**.

Do not expose the OpenRouter API key in the frontend.

All AI requests must go through the Express backend.

Architecture:

```text
React + TipTap
      ↓
Express API
      ↓
AIService
      ↓
OpenRouter
      ↓
Selected AI Model
```

Create an `AIService` abstraction so the underlying provider/model can be changed later.

V1 AI functionality should include:

- Generate content
- Continue writing
- Improve selected text
- Rewrite selected text
- Expand selected text
- Shorten selected text
- Change tone
- Generate title suggestions
- Generate meta title
- Generate meta description
- Generate summary/excerpt

For text editing, prefer a selection-based workflow:

```text
Select text
    ↓
AI Assist
    ↓
Improve / Rewrite / Expand / Shorten / Change Tone
    ↓
AI Result
    ↓
Accept / Reject
```

Do not automatically replace user content without user confirmation.

---

# 25. Automatic Version History

The system must automatically maintain blog version history.

Do not create a database version for every keystroke.

Use debounced auto-saving and meaningful-change detection.

Example:

```text
v1
v2
v3
v4
...
```

Each version should store:

- Blog ID
- Version number
- Full TipTap document content
- User who created the version
- Timestamp
- Relevant metadata
- Optional change summary

Users should be able to:

- View previous versions
- Compare versions
- Restore previous versions

Restoring an old version must create a **new version**.

Example:

```text
v1 → v2 → v3 → v4 → v5
                  ↓
             Restore v2
                  ↓
                  v6
```

Never delete previous versions as part of restoration.

---

# 26. Comments

Use a **general blog-level comment system** for V1.

Do not implement inline text comments.

Comments should be displayed in a dedicated panel/tab.

Features:

- Create comment
- Edit own comment
- Delete own comment
- Reply to comment
- Resolve comment
- Open/resolved state
- Author
- Timestamp

Comments remain associated with the blog independently from TipTap content versions.

---

# 27. Review Screen

The Reviewer receives blogs assigned to them.

Reviewer can:

- View blog details
- Read content
- View comments
- Add comments
- Resolve comments
- Approve blog
- Reject blog

If rejected:

```text
In Review
   ↓
Re Assign
```

The system should require an appropriate rejection reason/comment.

After rejection, the blog can return to the writing stage.

---

# 28. Publishing

Only the assigned Publisher can publish an approved Team blog.

The Publisher can only publish a blog when:

```text
Status = In Publishing
```

Publishing should validate that:

- Required metadata exists.
- Content exists.
- Blog is approved.
- Slug is valid and unique.
- Required image/media processing is complete.

After successful publishing:

```text
Status = Published
```

Store:

- Published timestamp
- Publisher
- Public URL
- Publication metadata

---

# 29. Third-Party Publishing

For V1, integrate **Dev.to** because it provides a free API and is simpler to implement than a full Medium integration.

Do not implement multiple third-party publishing integrations in V1.

After a blog is published on the platform:

```text
View Published Blog
Publish to Dev.to
```

The Dev.to integration should allow the user to publish the blog through the Dev.to API.

Store:

- External platform
- External article ID
- External URL
- Publication status
- Published timestamp
- Relevant API response metadata

Design this behind a simple publishing service abstraction so additional platforms can be added later.

---

# 30. Media Upload System

Implement **Multer + Cloudinary**.

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
```

Use this for:

- User profile images
- Blog featured images
- Images inside blog content
- Other supported media

Store appropriate Cloudinary information in MongoDB, such as:

- URL
- Public ID
- File type
- Metadata

Requirements:

- File type validation
- File size limits
- Secure upload handling
- Unique Cloudinary identifiers
- Replace/remove functionality
- Cleanup of obsolete Cloudinary assets where appropriate

Do not store large media files directly in MongoDB.

---

# 31. User Profile

Create a dedicated User Profile section.

V1 profile fields:

- Profile picture
- Full name
- Username
- Email
- Bio
- Interests
- Account type
- Team information
- Workflow role
- Change password
- Logout

Team information should only be displayed when applicable.

Profile image uploads must use the Multer + Cloudinary pipeline.

---

# 32. Database Models

Design MongoDB/Mongoose schemas around clear responsibilities.

Expected core models include:

```text
Admin
User
Team
Role
Permission
Interest
Category
Subcategory
Keyword
Blog
BlogVersion
Comment
Invitation
Media
SMTPConfiguration
ExternalPublication
RefreshToken
```

The exact model breakdown can be adjusted if a better normalized/embedded MongoDB design is appropriate.

Use indexes for frequently queried fields such as:

- Email
- Username
- Slug
- Category
- Status
- Team ID
- Author ID
- Published date
- Invitation token
- External publication identifiers

---

# 33. Backend API Architecture

Use RESTful APIs with clear separation.

Suggested structure:

```text
/api/auth/*
/api/admin/*
/api/users/*
/api/teams/*
/api/categories/*
/api/interests/*
/api/blogs/*
/api/comments/*
/api/media/*
/api/ai/*
/api/publishing/*
/api/public/*
```

Use middleware for:

- Authentication
- Admin authentication
- Authorization
- Role/permission checks
- Request validation
- Error handling
- Rate limiting
- File validation
- Logging

Never rely solely on frontend authorization.

---

# 34. API Security

Implement:

- Password hashing
- JWT authentication
- Refresh-token security
- Input validation
- Request sanitization where appropriate
- Rate limiting
- CORS configuration
- Secure HTTP headers
- File-upload validation
- Authorization middleware
- Protection against unauthorized state transitions
- Secure environment-variable handling
- No API keys in frontend code
- No SMTP credentials exposed through API responses

All sensitive configuration must be stored using environment variables/secrets.

---

# 35. Error Handling

Create centralized Express error handling.

API responses should follow a consistent structure.

Example:

```text
{
  success: false,
  message: "Blog not found",
  data: null,
  error: {
    code: "BLOG_NOT_FOUND"
  }
}
```

Successful responses should also follow a consistent structure.

Handle:

- Validation errors
- Authentication errors
- Authorization errors
- Database errors
- File upload errors
- Cloudinary errors
- OpenRouter errors
- Dev.to API errors
- SMTP errors
- Invalid workflow transitions
- Expired invitations
- Duplicate slugs
- Duplicate emails/usernames

---

# 36. Frontend Routing

Create clear route separation.

Example:

```text
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

/login
/signup
/onboarding
/welcome

/dashboard
/blogs
/blogs/create
/blogs/:id
/blogs/:id/edit
/blogs/:id/review
/blogs/:id/publish

/profile
/team

/blog/:slug
```

Protect routes using appropriate authentication and authorization guards.

---

# 37. UI/UX Requirements

The application should have a professional SaaS-style interface.

Requirements:

- Responsive design
- Clean navigation
- Separate Admin and User layouts
- Clear status indicators
- Loading states
- Empty states
- Error states
- Confirmation dialogs for destructive actions
- Toast notifications
- Form validation
- Accessible form controls
- Pagination where required
- Search/filter controls for large datasets

The Blog Editor should provide a distraction-free writing experience.

The workflow status should always be visible to relevant users.

---

# 38. Dashboard Blog Recommendation Logic

For V1, use simple interest-based matching.

Example:

```text
User Interests:
Gaming
Technology

        ↓

Published blogs matching relevant interests

        ↓

Dashboard
```

Do not build a complex recommendation engine in V1.

The architecture can later be extended with:

- Keyword matching
- Popularity
- Views
- Engagement
- Personalized ranking

---

# 39. Development Principles

Follow these principles throughout the project:

- Keep frontend and backend responsibilities separated.
- Use reusable React components.
- Use Redux Toolkit only where global state is appropriate.
- Keep API calls inside service layers.
- Keep business logic out of React components.
- Keep controllers thin.
- Put business logic in services.
- Use repository/data-access patterns where useful.
- Avoid massive files.
- Use meaningful naming conventions.
- Avoid duplicated logic.
- Validate both frontend and backend.
- Keep authorization server-side.
- Use environment variables for secrets.
- Write modular code.
- Keep the application easy to extend.

---

# 40. Recommended Backend Layering

Use a structure similar to:

```text
backend/
├── src/
│   ├── config/
│   ├── controllers/
│   ├── services/
│   ├── repositories/
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   ├── validators/
│   ├── utils/
│   ├── integrations/
│   │   ├── cloudinary/
│   │   ├── google/
│   │   ├── openrouter/
│   │   ├── smtp/
│   │   └── devto/
│   ├── constants/
│   └── app.js
│
└── server.js
```

Keep integrations isolated so external services can be replaced without rewriting core business logic.

---

# 41. Workflow Authorization

The backend must implement the blog workflow as a state machine.

Example:

```text
Draft
  → In Writing

In Writing
  → In Review

In Review
  → Re Assign
  → In Publishing

Re Assign
  → In Writing

In Publishing
  → Published
```

Only valid transitions should be accepted.

Example:

A Publisher must not be able to directly move:

```text
Draft → Published
```

A Reviewer must not be able to move:

```text
Draft → Published
```

The server must validate both:

```text
Current Status
+
User Permission
+
Assigned User
+
Requested Transition
```

before allowing a transition.

---

# 42. Individual vs Team Authorization

Individual users:

```text
Create
  ↓
Write
  ↓
Publish
```

Team users:

```text
Writer
  ↓
Reviewer
  ↓
Publisher
```

The backend must determine the user's account type and enforce the appropriate workflow.

Do not duplicate the entire blog system for Individual and Team users. Reuse the same Blog model and workflow services wherever possible.

---

# 43. Environment Configuration

Use environment variables for:

```text
MONGODB_URI
JWT_ACCESS_SECRET
JWT_REFRESH_SECRET

GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET

CLOUDINARY_CLOUD_NAME
CLOUDINARY_API_KEY
CLOUDINARY_API_SECRET

OPENROUTER_API_KEY

SMTP_HOST
SMTP_PORT
SMTP_USERNAME
SMTP_PASSWORD

DEVTO_API_KEY
```

Do not commit `.env` files containing secrets.

Provide a `.env.example`.

---

# 44. Testing Requirements

Implement appropriate testing for critical backend functionality.

At minimum test:

## Authentication

- Signup
- Login
- Google OAuth flow
- Token refresh
- Unauthorized requests
- Invalid credentials

## RBAC

- Writer permissions
- Reviewer permissions
- Publisher permissions
- Team Owner permissions
- Custom role permissions
- Unauthorized actions

## Blog Workflow

- Valid state transitions
- Invalid state transitions
- Individual publishing
- Team publishing
- Reviewer rejection
- Reviewer approval
- Publisher restrictions

## Team

- Team creation
- Invitation generation
- Invitation acceptance
- Invitation expiration
- Invitation revocation
- Duplicate role assignment
- Unauthorized team access

## Blog

- Category validation
- Subcategory validation
- Keyword validation
- Slug uniqueness
- Draft creation
- Version creation
- Version restoration

## Public API

- Published blogs are accessible.
- Drafts are not accessible.
- Category filtering works.
- Slug retrieval works.
- Pagination works.

---

# 45. V1 Scope

The first version must include:

### Admin

- Admin authentication
- Admin dashboard
- Analytics
- Category CRUD
- Subcategory CRUD
- Primary/secondary keyword CRUD
- Interest CRUD
- User/team visibility
- Role management
- Permission management
- Custom roles
- SMTP configuration
- Email toggle

### Users

- Signup
- Login
- Google OAuth
- JWT authentication
- Onboarding
- Individual account
- Team account
- Team Owner
- Invitations
- Interests
- Dashboard
- Profile

### Blogging

- Blog CRUD
- Basic details
- Category/subcategory
- Keywords
- Slug
- TipTap editor
- Media upload
- Cloudinary
- AI assistance through OpenRouter
- Automatic version history
- Comments
- Review
- Reassignment
- Publishing
- Public blog pages

### External/Public

- Public blog API
- Category-based public API
- Search/filter/pagination
- Dev.to publishing

---

# 46. Explicitly Out of Scope for V1

Do NOT unnecessarily implement:

- Multiple teams per user
- Complex recommendation algorithms
- Inline Google Docs-style comments
- Multiple external publishing platforms
- Advanced analytics
- Separate analytics database
- Microservices
- Real-time collaborative editing
- Complex notification infrastructure
- Native mobile application
- Payment/subscription system

The architecture should remain extensible, but V1 should stay focused and manageable.

---

# 47. Final Goal

The finished application should feel like a real collaborative content-management and publishing SaaS rather than a basic CRUD blog application.

The core experience should be:

```text
                    ┌───────────────┐
                    │  Admin Panel  │
                    └───────┬───────┘
                            │
             Categories / Roles / SMTP / Analytics
                            │
                            ▼
┌───────────────────────────────────────────────────────┐
│                 Main User Platform                    │
│                                                       │
│  Authentication → Onboarding → Dashboard → Profile   │
│                         │                             │
│                         ▼                             │
│                  Create Blog                          │
│                         │                             │
│              ┌──────────┴──────────┐                  │
│              │                     │                  │
│         Individual              Team                  │
│              │                     │                  │
│          Write/Publish         Writer                 │
│                                    ↓                  │
│                                 Reviewer               │
│                                    ↓                  │
│                                 Publisher              │
│                                    ↓                  │
│                                Published               │
│                                                       │
└─────────────────────────┬─────────────────────────────┘
                          │
                          ▼
                 Public Blog API
                          │
                 ┌────────┴────────┐
                 │                 │
          React Public Page     Dev.to
             /blog/:slug       Publishing
```

Prioritize **clean architecture, security, maintainability, and a beginner-understandable implementation** over unnecessary complexity. Build the application incrementally, keeping each module independently testable and ensuring that backend authorization—not merely frontend UI restrictions—enforces all critical business rules.