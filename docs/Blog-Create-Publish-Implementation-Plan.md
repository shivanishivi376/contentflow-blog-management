# Blog Create & Publish Flow — Implementation Specification

**Stack:** Node.js / Express.js v5 (ES Modules) + MongoDB (Mongoose) + React 19 (Vite, Redux Toolkit, TipTap, Bootstrap)

---

## 1. Data Model (Mongoose Schemas)

### `Blog` Schema (`backend/src/models/Blog.js`)
| Field | Type | Description / Constraints |
|---|---|---|
| `_id` | ObjectId | Primary Key |
| `title` | String | Required, trim, 3–200 characters |
| `description` | String | Trim, default empty string |
| `slug` | String | Unique, auto-generated from title, lowercase |
| `category` | ObjectId (ref: `Category`) | Required |
| `subcategory` | ObjectId (ref: `Subcategory`) | Required |
| `primaryKeywords` | Array of ObjectId (ref: `Keyword`) | Optional |
| `secondaryKeywords` | Array of ObjectId (ref: `Keyword`) | Optional |
| `metaTitle` | String | Nullable |
| `metaDescription` | String | Nullable |
| `featuredImage` | String | URL / Cloudinary public ID |
| `content` | String | TipTap JSON / HTML content (current live draft) |
| `accountType` | Enum (`INDIVIDUAL` \| `TEAM`) | Defaults to `INDIVIDUAL` |
| `author` | ObjectId (ref: `User`) | Required (Creator) |
| `team` | ObjectId (ref: `Team`) | Required if `accountType === 'TEAM'` |
| `writer` | ObjectId (ref: `User`) | Team assigned writer |
| `reviewer` | ObjectId (ref: `User`) | Team assigned reviewer |
| `publisher` | ObjectId (ref: `User`) | Team assigned publisher |
| `status` | Enum | `DRAFT`, `IN_WRITING`, `IN_REVIEW`, `RE_ASSIGN`, `IN_PUBLISHING`, `PUBLISHED`, `PUBLISH_FAILED` |
| `publishFailReason` | String | Nullable; detailed failure error string |
| `publishFailedAt` | Date | Nullable |
| `publishedAt` | Date | Nullable |
| `publishedBy` | ObjectId (ref: `User`) | Nullable |
| `createdAt` / `updatedAt` | Date | Managed by Mongoose `timestamps` |

> **Validation Rule (Team Mode)**: At API level, when setting `writer`, `reviewer`, `publisher`, enforce that all 3 user ObjectIds are pairwise distinct (`new Set([writer, reviewer, publisher]).size === 3`).

---

### `BlogVersion` Schema (`backend/src/models/BlogVersion.js`)
| Field | Type | Description |
|---|---|---|
| `_id` | ObjectId | Primary Key |
| `blogId` | ObjectId (ref: `Blog`) | Required FK |
| `versionNumber` | Number | Incremental version index |
| `title` | String | Document title snapshot |
| `content` | String | Snapshot of blog content |
| `changeSummary` | String | e.g. "Auto-save", "Submitted for review", "Re-assign revision" |
| `createdBy` | ObjectId (ref: `User`) | Author of the snapshot |
| `createdAt` | Date | Managed by Mongoose `timestamps` |

---

### `Comment` Schema (`backend/src/models/Comment.js`)
| Field | Type | Description |
|---|---|---|
| `_id` | ObjectId | Primary Key |
| `blog` | ObjectId (ref: `Blog`) | Required FK |
| `author` | ObjectId (ref: `User`) | Comment author |
| `content` | String | Comment text |
| `parentComment` | ObjectId (ref: `Comment`) | Optional for nested replies |
| `isReviewFeedback` | Boolean | `true` when attached to a reviewer rejection |
| `status` | Enum (`OPEN` \| `RESOLVED`) | Default `'OPEN'` |
| `resolvedBy` | ObjectId (ref: `User`) | Nullable |
| `resolvedAt` | Date | Nullable |

---

### `ExternalPublication` Schema (`backend/src/models/ExternalPublication.js`)
| Field | Type | Description |
|---|---|---|
| `_id` | ObjectId | Primary Key |
| `blog` | ObjectId (ref: `Blog`) | Required FK |
| `user` | ObjectId (ref: `User`) | User initiating sync |
| `externalPlatform` | Enum (`DEVTO`) | Default `'DEVTO'` |
| `externalArticleId` | String | Dev.to Article ID |
| `externalUrl` | String | Dev.to Article canonical URL |
| `publicationStatus` | Enum (`SUCCESS` \| `FAILED`) | |
| `responseMetadata` | Mixed | Raw API response / error details |

---

## 2. Server-Enforced Status State Machine

Status modifications are derived strictly on the backend. The client triggers named workflow actions, and the server validates and transitions status according to the state table:

```
DRAFT --(START_WRITING)--> IN_WRITING
IN_WRITING --(SUBMIT_FOR_REVIEW)--> IN_REVIEW
IN_REVIEW --(APPROVE)--> IN_PUBLISHING --(PUBLISH_SUCCESS)--> PUBLISHED
IN_REVIEW --(REJECT)--> RE_ASSIGN --(RESUME_WRITING)--> IN_WRITING
IN_PUBLISHING --(PUBLISH_FAIL)--> PUBLISH_FAILED
PUBLISH_FAILED --(RETRY)--> IN_PUBLISHING
```

### Transition Matrix Implementation (`backend/src/constants/workflow.js`)

```javascript
import { BLOG_STATUS } from './blogStatus.js';

export const TRANSITIONS = {
  [BLOG_STATUS.DRAFT]:          { START_WRITING: BLOG_STATUS.IN_WRITING },
  [BLOG_STATUS.IN_WRITING]:     { SUBMIT_FOR_REVIEW: BLOG_STATUS.IN_REVIEW },
  [BLOG_STATUS.IN_REVIEW]:      { APPROVE: BLOG_STATUS.IN_PUBLISHING, REJECT: BLOG_STATUS.RE_ASSIGN },
  [BLOG_STATUS.RE_ASSIGN]:      { RESUME_WRITING: BLOG_STATUS.IN_WRITING },
  [BLOG_STATUS.IN_PUBLISHING]:  { PUBLISH_SUCCESS: BLOG_STATUS.PUBLISHED, PUBLISH_FAIL: BLOG_STATUS.PUBLISH_FAILED },
  [BLOG_STATUS.PUBLISH_FAILED]: { RETRY: BLOG_STATUS.IN_PUBLISHING }
};

export function transition(currentStatus, action) {
  const next = TRANSITIONS[currentStatus]?.[action];
  if (!next) {
    throw new Error(`Invalid transition: ${action} from status ${currentStatus}`);
  }
  return next;
}
```

---

## 3. Backend API Specification

```http
POST   /api/blogs                            Create basic details -> Status: DRAFT
PATCH  /api/blogs/:id                        Update basic details / metadata

POST   /api/blogs/:id/assignment             Set team roles (writer, reviewer, publisher)
                                             Validates: 3 distinct user IDs required

PATCH  /api/blogs/:id/content                Content autosave endpoint (debounced)
POST   /api/blogs/:id/content/ai-generate    AI Text Generation (OpenRouter Client)
GET    /api/blogs/:id/versions               List version history
GET    /api/blogs/:id/versions/:versionId    Get version snapshot details
POST   /api/blogs/:id/versions/:versionId/restore Restore blog content to snapshot

GET    /api/blogs/:id/comments               List blog comments
POST   /api/blogs/:id/comments               Add inline or review feedback comment
PATCH  /api/blogs/:id/comments/:commentId/resolve Resolve comment

POST   /api/blogs/:id/status                 Trigger action: { action: 'SUBMIT_FOR_REVIEW' | 'APPROVE' | 'REJECT' }
POST   /api/blogs/:id/publish                Execute publishing workflow -> PUBLISHED / PUBLISH_FAILED
POST   /api/blogs/:id/publish/retry          Retry publishing from PUBLISH_FAILED

POST   /api/blogs/:id/publish/devto          Sync article to Dev.to
GET    /api/blogs/:id/external-publications  Get Dev.to sync history
```

---

## 4. Frontend Component Structure

```
frontend/src/features/blogs/
├── components/
│   ├── BasicDetailsForm.jsx          # Title, slug, category, keywords, cover image
│   ├── AssignmentModal.jsx           # Team role assignment (Writer, Reviewer, Publisher)
│   ├── BlogWorkflowWorkspace.jsx     # Main workspace with TipTap editor & tabs
│   ├── WorkflowActionsBar.jsx        # Role-sensitive state action buttons
│   ├── WorkflowStepper.jsx          # Visual status progress bar
│   ├── RevisionRequestModal.jsx      # Rejection reason modal (attached as comment)
│   ├── PublishFailedBanner.jsx       # Error banner displaying publishFailReason & retry button
│   ├── DevToPublishModal.jsx         # Dev.to API token & cross-posting modal
│   └── CommentsPanel.jsx             # Review feedback & comment thread
├── pages/
│   ├── BlogCreatePage.jsx            # Creation wizard (Step 1: Details, Step 2: Team Setup)
│   ├── BlogEditPage.jsx              # Authoring / Reviewing / Publishing workspace
│   ├── BlogsListPage.jsx             # Filterable blog dashboard
│   └── PublicBlogDetailPage.jsx      # Public reader view (/blog/:slug)
└── hooks/
    └── useAutosave.js                # 2.5s debounced content autosave hook
```

---

## 5. Phased Build Order

1. **Data Schema Updates**: Update [`backend/src/models/Blog.js`](file:///c:/Users/HP/Downloads/BLOG%20MERNSTACK%20PROJECT/BLOG%20MERNSTACK%20PROJECT/backend/src/models/Blog.js) & [`Comment.js`](file:///c:/Users/HP/Downloads/BLOG%20MERNSTACK%20PROJECT/BLOG%20MERNSTACK%20PROJECT/backend/src/models/Comment.js) with required fields & status enums.
2. **Status Machine Logic**: Implement deterministic action transition helper in [`backend/src/constants/workflow.js`](file:///c:/Users/HP/Downloads/BLOG%20MERNSTACK%20PROJECT/BLOG%20MERNSTACK%20PROJECT/backend/src/constants/workflow.js).
3. **Basic Details & Assignment API**: Add backend validation for team user uniqueness.
4. **Editor & Autosave Hook**: Build [`useAutosave.js`](file:///c:/Users/HP/Downloads/BLOG%20MERNSTACK%20PROJECT/BLOG%20MERNSTACK%20PROJECT/frontend/src/features/blogs/hooks/useAutosave.js) frontend hook and wire TipTap editor updates.
5. **AI Workspace Tab**: Integrate OpenRouter client for inline content generation.
6. **Comments & Review Feedback**: Connect review rejection feedback directly into comment threads.
7. **Workflow Actions & Publishing**: Implement `/status`, `/publish`, and `/publish/retry` routes with automatic error handling for `PUBLISH_FAILED`.
8. **Dev.to Integration**: Connect Dev.to cross-posting adapter with `ExternalPublication` tracking.
9. **Role Permission Enforcement**: Wire permission checks to restrict actions by assigned `writer`, `reviewer`, or `publisher`.
