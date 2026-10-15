# Team Users Workflow + ACL Implementation Plan

> **For Antigravity:** You have full access to the existing codebase. Treat the repository as the source of truth for implementation details. Before modifying code, inspect the current architecture and update this plan to match the existing models, services, APIs, routes, components, and patterns. Do not create duplicate implementations where an existing equivalent can be extended.

## Goal

Implement a complete Team-user workflow with:

- One Team Owner per team.
- Owner chooses exactly one workflow role: `Writer`, `Reviewer`, or `Publisher`.
- The other two roles can have multiple team members.
- Role-specific invitations.
- Role-based frontend visibility.
- Backend-enforced ACL.
- Blog workflow/state-based authorization.
- No regression to the existing Individual-user workflow.

---

# Phase 1 — Existing Codebase Audit

Before writing or modifying code:

- [ ] Inspect the complete repository.
- [ ] Identify the existing User model and authentication/session mechanism.
- [ ] Identify the existing Team model.
- [ ] Identify how team members/memberships are currently stored.
- [ ] Identify the current owner implementation.
- [ ] Identify existing role/permission/ACL logic.
- [ ] Identify onboarding screens and APIs.
- [ ] Identify existing invitation functionality, if any.
- [ ] Identify Blog models and current blog status/workflow.
- [ ] Identify all Blog-related APIs and mutation endpoints.
- [ ] Identify frontend routing, sidebar, tabs, and action components.
- [ ] Identify existing authorization middleware/guards/hooks.
- [ ] Identify the existing test structure and commands.

### Required output from the audit

Create a gap analysis:

```text
Existing functionality
        ↓
Required functionality
        ↓
Already supported
Needs modification
Missing
Potential conflicts/regressions
```

Do not start implementation until the existing flow has been mapped.

---

# Phase 2 — Define the Team Membership Model

The final business model must represent ownership and workflow role separately.

Conceptually:

```text
Team
 └── ownerUserId

TeamMembership
 ├── teamId
 ├── userId
 ├── role: writer | reviewer | publisher
 ├── isOwner
 └── status
```

Use the repository's existing structure if an equivalent model already exists.

## Rules

- [ ] Every Team has exactly one owner.
- [ ] The owner has exactly one workflow role.
- [ ] `owner` must not be implemented as a fourth workflow role.
- [ ] `isOwner` and `role` must remain separate concepts.
- [ ] The owner's selected role must not be available for additional invited members.
- [ ] The other two roles can have multiple members.
- [ ] A member cannot assign themselves another role through a frontend/API payload.
- [ ] Role must come from trusted server-side team membership data.

Example:

```text
Team A

User A → Owner + Writer
User B → Reviewer
User C → Reviewer
User D → Publisher
User E → Publisher
```

This is valid.

---

# Phase 3 — Team Onboarding

Update the existing Team onboarding flow.

## Required flow

```text
Onboarding
    ↓
Select "Team"
    ↓
Create Team
    ↓
Current User becomes Team Owner
    ↓
Select own role
    ↓
Writer / Reviewer / Publisher
    ↓
Create owner membership
    ↓
Determine remaining two roles
    ↓
Invite members
```

## Requirements

- [ ] Automatically make the onboarding user the Team Owner.
- [ ] Require exactly one role selection.
- [ ] Create the owner's membership with `isOwner=true`.
- [ ] Store the selected workflow role.
- [ ] Determine the two remaining available roles server-side.
- [ ] Prevent the frontend from assigning itself arbitrary ownership.
- [ ] Prevent creation of multiple owners.
- [ ] Preserve the existing Individual onboarding flow.

---

# Phase 4 — Invitation System

Implement or extend the existing invitation system.

Each invitation must be tied to:

```text
Team
+
Specific workflow role
+
Secure invitation token
```

Conceptually:

```text
Invitation
 ├── teamId
 ├── role
 ├── invitedEmail (optional)
 ├── token
 ├── status
 ├── expiresAt
 └── acceptedAt
```

## Invitation requirements

- [ ] Support invitation by email.
- [ ] Support copying an invitation link.
- [ ] Invitation must be role-specific.
- [ ] Example: Reviewer invitation can only create a Reviewer membership.
- [ ] The invitee cannot modify the role.
- [ ] Generate secure invitation tokens.
- [ ] Add expiration.
- [ ] Make invitations single-use.
- [ ] Reject expired invitations.
- [ ] Reject invalid invitations.
- [ ] Reject already-used invitations.
- [ ] Reject revoked invitations if revocation already exists or is required by the current architecture.
- [ ] Ensure invitation acceptance is atomic.
- [ ] Ensure invitations cannot assign the owner's selected role.

Example:

```text
Owner selected Writer

Available invitations:
    Reviewer → multiple users allowed
    Publisher → multiple users allowed

Writer invitation → NOT allowed
```

---

# Phase 5 — Invitation Signup/Login Flow

The invitation flow must work whether the user:

- Creates a new account.
- Already has an account.

Required flow:

```text
Invitation Link
      ↓
Validate invitation
      ↓
Display Team + Assigned Role
      ↓
Signup/Login
      ↓
Revalidate invitation server-side
      ↓
Create Team Membership
      ↓
Assign invitation role
      ↓
Mark invitation consumed
      ↓
Open Team application
```

## Requirements

- [ ] Never trust the role submitted by the frontend.
- [ ] Resolve the role from the invitation on the server.
- [ ] Revalidate the invitation after authentication.
- [ ] Create the correct team membership.
- [ ] Prevent invitation reuse.
- [ ] Prevent cross-team membership manipulation.
- [ ] Preserve invitation context during signup securely.

---

# Phase 6 — Define the Permission Model

Do not scatter direct role checks throughout the codebase.

Create or extend a centralized permission system.

Conceptually:

```text
DASHBOARD_VIEW
SETTINGS_VIEW
BLOGS_VIEW

BLOG_CREATE_BASIC_DETAILS
BLOG_ASSIGN

BLOG_WRITE
BLOG_AI_WRITE
BLOG_VERSION_HISTORY
BLOG_COMMENT
BLOG_SUBMIT_REVIEW

BLOG_APPROVE
BLOG_REJECT
BLOG_SUBMIT_PUBLISH

BLOG_PUBLISH
BLOG_PUBLISH_DEVTO
```

## Permission mapping

### Writer

```text
Dashboard
Settings
Blogs
Basic Details*
Assignment*
Write Blog
AI Writer
Version History
Comments
Submit for Review
```

### Reviewer

```text
Dashboard
Settings
Blogs
Basic Details*
Assignment*
Comments
Approve
Reject
Submit for Publish
```

### Publisher

```text
Dashboard
Settings
Blogs
Basic Details*
Assignment*
Comments
Publish
Publish to DEV.to
```

`*` Verify against the existing implementation whether Basic Details/Assignment are **owner-only** or available to all team members. The requirement specifically says the Team Owner is responsible for these operations, so the preferred implementation is to enforce them with `isOwner=true`.

---

# Phase 7 — Backend ACL

Backend authorization must be the **security boundary**.

Frontend hiding is not sufficient.

Every protected API must verify:

```text
Authenticated User
        +
Active Team Membership
        +
Correct Permission
        +
Correct Team
        +
Valid Blog State
```

## Implement/extend centralized authorization

Conceptually:

```text
authorize(permission)
```

or the equivalent pattern already used by the project.

## Requirements

- [ ] Resolve current user's team membership from trusted server-side data.
- [ ] Resolve role from the database/session context.
- [ ] Resolve permissions centrally.
- [ ] Reject unauthorized requests consistently.
- [ ] Reject inactive/removed members.
- [ ] Prevent manipulated `teamId`.
- [ ] Prevent manipulated `role`.
- [ ] Prevent manipulated `membershipId`.
- [ ] Prevent access to another team's blogs.
- [ ] Ensure every protected endpoint uses authorization.

---

# Phase 8 — Blog Workflow Authorization

Treat the blog workflow as a state machine.

The exact existing statuses should be reused where possible.

Conceptually:

```text
Draft
  ↓
In Review
  ↓
Ready to Publish
  ↓
Published
```

Rejection path:

```text
In Review
  ↓
Changes Requested
  ↓
Draft
```

## Requirements

- [ ] Identify the existing Blog status implementation.
- [ ] Define legal transitions.
- [ ] Define which role can perform each transition.
- [ ] Validate state transitions on the backend.
- [ ] Do not allow a role to bypass required workflow steps.
- [ ] Combine permission checking with state validation.

For example:

```text
Writer:
    Draft → In Review

Reviewer:
    In Review → Changes Requested
    In Review → Ready to Publish

Publisher:
    Ready to Publish → Published
```

Adapt this to the repository's existing workflow if it already has equivalent states.

---

# Phase 9 — Writer ACL

Writer-specific privileges:

```text
Write Blog
AI Writer
Version History
Comments
Submit for Review
```

Writer must not be able to:

```text
Approve
Reject
Submit for Publish
Publish
Publish to DEV.to
```

## Frontend

- [ ] Show writer actions.
- [ ] Hide reviewer actions.
- [ ] Hide publisher actions.
- [ ] Hide unauthorized tabs.
- [ ] Block direct navigation to writer-restricted pages/actions.

## Backend

- [ ] Protect every writer endpoint.
- [ ] Reject reviewer/publisher operations from writer users.

---

# Phase 10 — Reviewer ACL

Reviewer-specific privileges:

```text
Comments
Approve
Reject
Submit for Publish
```

Reviewer must not be able to:

```text
Writer-only editing operations
Publish
Publish to DEV.to
```

## Frontend

- [ ] Show reviewer actions.
- [ ] Hide writer-specific actions where not applicable.
- [ ] Hide publisher actions.
- [ ] Prevent unauthorized route access.

## Backend

- [ ] Protect reviewer endpoints.
- [ ] Reject writer/publisher-only operations.

---

# Phase 11 — Publisher ACL

Publisher-specific privileges:

```text
Comments
Publish
Publish to DEV.to
```

Publisher must not be able to:

```text
Approve
Reject
Submit for Review
```

## Frontend

- [ ] Show publisher actions.
- [ ] Hide writer/reviewer-only actions.
- [ ] Protect publisher routes.

## Backend

- [ ] Protect publish endpoints.
- [ ] Protect DEV.to publishing endpoint.
- [ ] Validate current blog state before publishing.

---

# Phase 12 — Dashboard, Settings and Blogs

All three Team workflow roles should have:

```text
Dashboard ✅
Settings  ✅
Blogs     ✅
```

The Blogs section is shared.

## Requirements

- [ ] Every active team member can see team blogs.
- [ ] Blog listing is scoped to the current team.
- [ ] Users cannot retrieve blogs from another team.
- [ ] All users see the blog but only see actions they are authorized to perform.
- [ ] Frontend tabs/actions reflect the permission system.

---

# Phase 13 — Frontend ACL Architecture

Create/extend a reusable frontend permission utility.

Prefer:

```text
hasPermission(BLOG_WRITE)
```

instead of scattered checks such as:

```text
role === "writer"
```

## Requirements

- [ ] Sidebar visibility uses permissions.
- [ ] Tabs use permissions.
- [ ] Buttons/actions use permissions.
- [ ] Protected routes use permissions.
- [ ] UI does not duplicate role logic unnecessarily.
- [ ] Permission state comes from trusted authenticated/team context.
- [ ] Refreshing the page must preserve correct permissions.

Example:

```text
Writer:
    Writer tab      ✅
    Reviewer tab    ❌
    Publisher tab   ❌
```

The same rule must work on the backend.

---

# Phase 14 — Team Ownership

Implement ownership independently from workflow role.

Example:

```text
User A
isOwner = true
role = writer
```

This does **not** mean:

```text
User A = writer + reviewer + publisher
```

## Requirements

- [ ] Exactly one owner per team.
- [ ] Owner can be Writer, Reviewer, or Publisher.
- [ ] Owner does not automatically receive other workflow permissions.
- [ ] Only an authorized owner-management operation can transfer ownership.
- [ ] Prevent arbitrary ownership changes via API manipulation.
- [ ] Preserve existing ownership behavior if already implemented.

For ownership transfer, use an atomic operation:

```text
Old Owner → isOwner=false
New Owner → isOwner=true
```

Do not automatically change the new owner's workflow role unless explicitly required by existing business rules.

---

# Phase 15 — Security / Edge Cases

Add backend tests for:

```text
User without team membership
Removed team member
Expired invitation
Invalid invitation
Used invitation
Wrong team
Cross-team blog access
Modified teamId
Modified role
Modified membershipId
Unauthorized API action
Unauthorized route
Unauthorized publish
Unauthorized DEV.to publish
Invalid blog state transition
Duplicate owner
Duplicate invitation acceptance
```

The backend must reject these scenarios even when the frontend is bypassed.

---

# Phase 16 — Test Matrix

Create an automated permission matrix.

| Capability | Owner Writer | Owner Reviewer | Owner Publisher | Reviewer | Publisher |
|---|---:|---:|---:|---:|---:|
| Dashboard | ✅ | ✅ | ✅ | ✅ | ✅ |
| Settings | ✅ | ✅ | ✅ | ✅ | ✅ |
| Blogs | ✅ | ✅ | ✅ | ✅ | ✅ |
| Basic Details | ✅ | ✅ | ✅ | Depends* | Depends* |
| Assignment | ✅ | ✅ | ✅ | Depends* | Depends* |
| Write | ✅ | ❌ | ❌ | ❌ | ❌ |
| AI Writer | ✅ | ❌ | ❌ | ❌ | ❌ |
| Version History | ✅ | ❌ | ❌ | ❌ | ❌ |
| Comments | ✅ | ✅ | ✅ | ✅ | ✅ |
| Submit Review | ✅ | ❌ | ❌ | ❌ | ❌ |
| Approve | ❌ | ✅ | ❌ | ✅ | ❌ |
| Reject | ❌ | ✅ | ❌ | ✅ | ❌ |
| Submit Publish | ❌ | ✅ | ❌ | ✅ | ❌ |
| Publish | ❌ | ❌ | ✅ | ❌ | ✅ |
| DEV.to Publish | ❌ | ❌ | ✅ | ❌ | ✅ |

`Depends*` should follow the final owner-only interpretation after inspecting the existing implementation.

Tests must cover both:

```text
Frontend visibility
+
Backend authorization
```

---

# Phase 17 — Individual User Regression

Do not break the existing Individual-user flow.

Verify:

- [ ] Individual onboarding still works.
- [ ] Individual users can still create blogs.
- [ ] Individual users can still edit blogs.
- [ ] Individual users can still publish.
- [ ] Existing AI functionality remains intact.
- [ ] Existing DEV.to publishing remains intact.
- [ ] Existing dashboard/settings behavior remains intact.
- [ ] Existing authentication is unaffected.

The Team ACL should not accidentally force Individual users through Team membership checks.

---

# Phase 18 — End-to-End Validation

Perform the complete scenario:

```text
1. Create Team as User A.
2. User A becomes Owner.
3. User A selects Writer.
4. Generate Reviewer invitation.
5. Generate Publisher invitation.
6. Add multiple Reviewers.
7. Add multiple Publishers.
8. Verify sidebar/permissions for every role.
9. Create blog.
10. Writer edits blog.
11. Writer uses AI Writer.
12. Writer submits for review.
13. Reviewer comments.
14. Reviewer rejects.
15. Verify blog returns to appropriate writer state.
16. Writer resubmits.
17. Reviewer approves.
18. Reviewer submits for publishing.
19. Publisher publishes.
20. Publisher publishes to DEV.to.
21. Attempt unauthorized actions through direct API calls.
22. Verify every unauthorized operation is rejected.
23. Verify Individual-user workflow still works.
```

---

# Final Implementation Rules for Antigravity

### 1. Repository is the source of truth

Do not assume filenames, models, routes, controllers, services, or components from this plan. Inspect and adapt.

### 2. Reuse existing architecture

Before creating anything:

```text
Search existing implementation
        ↓
Extend existing implementation
        ↓
Create new abstraction only when necessary
```

### 3. Do not duplicate ACL logic

Use one permission model across frontend and backend wherever practical.

### 4. Backend is authoritative

A hidden UI element is **not** an authorization mechanism.

Every protected API must independently validate permissions.

### 5. Do not over-permission the owner

Owner ≠ superuser.

Example:

```text
Owner + Writer
```

means:

```text
Owner responsibilities
+
Writer workflow permissions
```

not:

```text
Writer + Reviewer + Publisher
```

### 6. Preserve current functionality

Do not rewrite unrelated parts of the application.

### 7. Test before declaring completion

The implementation is complete only when:

```text
Onboarding ✅
Invitations ✅
Membership ✅
ACL ✅
Frontend visibility ✅
Backend authorization ✅
Blog state transitions ✅
DEV.to publishing ACL ✅
Individual-user regression ✅
End-to-end workflow ✅
```

### 8. Update the plan after repository inspection

**Before implementation, Antigravity should convert this business-level plan into a repository-specific implementation plan containing the actual files, models, APIs, services, hooks, middleware, components, and tests that need to change.**

That repository-specific plan should be the one used for implementation.
