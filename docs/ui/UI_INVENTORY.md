# Frontend UI Inventory

**Project:** Collaborative Blog Writing & Publishing Platform  
**Architecture:** Feature-Based React SPA (Vite + React Router v7 + Redux Toolkit + Bootstrap 5 / React-Bootstrap + TipTap)  
**Date of Audit:** August 2026  

---

## 1. Executive Summary & Scope

The frontend codebase is organized using a feature-folder pattern inside `frontend/src/features/`. The layout system is split across three distinct user experience domains:

1. **Customer Workspace Panel (`/dashboard`, `/blogs`, `/blogs/create`, `/blogs/:id/edit`, `/profile`, `/team`)**: Built around `CustomerLayout.jsx` with a sticky left sidebar and topbar navigation.
2. **Admin Control Room Panel (`/admin/*`)**: Built around `AdminLayout.jsx` featuring a dedicated dark/slate administrative sidebar and top header.
3. **Public Reader Portal (`/read`, `/blog/:slug`) & Auth/Onboarding Flow (`/login`, `/signup`, `/onboarding`)**: Unwrapped or standalone container layouts.

This document presents a complete structural inventory of all routes, pages, layouts, navigation structures, reusable UI components, forms, tables, cards, modals, feedback states, responsive behaviors, and design tokens present in the frontend.

---

## 2. Routes & Pages Matrix

| Route Path | Associated Component | Layout Container | Protection / Access Level | Primary Purpose |
| :--- | :--- | :--- | :--- | :--- |
| `/` | `Navigate` (Redirect) | N/A | Public | Redirects root traffic to `/read` |
| `/read` | [`PublicBlogFeedPage.jsx`](file:///c:/Users/HP/Downloads/BLOG%20MERNSTACK%20PROJECT/BLOG%20MERNSTACK%20PROJECT/frontend/src/features/blogs/pages/PublicBlogFeedPage.jsx) | Standalone (`.admin-page` container) | Public | Browse published articles by topic/category with live search |
| `/blog/:slug` | [`PublicBlogDetailPage.jsx`](file:///c:/Users/HP/Downloads/BLOG%20MERNSTACK%20PROJECT/BLOG%20MERNSTACK%20PROJECT/frontend/src/features/blogs/pages/PublicBlogDetailPage.jsx) | Standalone (`.admin-page` container) | Public | Full article reader view with HTML content render, author bio, & tags |
| `/login` | [`LoginPage.jsx`](file:///c:/Users/HP/Downloads/BLOG%20MERNSTACK%20PROJECT/BLOG%20MERNSTACK%20PROJECT/frontend/src/features/auth/pages/LoginPage.jsx) | Standalone (`.auth-shell`) | Public (Unauthenticated) | Email/password login with Google Auth button placeholder |
| `/signup` | [`SignupPage.jsx`](file:///c:/Users/HP/Downloads/BLOG%20MERNSTACK%20PROJECT/BLOG%20MERNSTACK%20PROJECT/frontend/src/features/auth/pages/SignupPage.jsx) | Standalone (`.auth-shell`) | Public (Unauthenticated) | Registration form for new individual/team creators |
| `/forgot-password` | [`ForgotPasswordPage.jsx`](file:///c:/Users/HP/Downloads/BLOG%20MERNSTACK%20PROJECT/BLOG%20MERNSTACK%20PROJECT/frontend/src/features/auth/pages/ForgotPasswordPage.jsx) | Standalone (`.auth-shell` + `AuthHero`) | Public (Unauthenticated) | Password reset request form with dev token display |
| `/reset-password` | [`ResetPasswordPage.jsx`](file:///c:/Users/HP/Downloads/BLOG%20MERNSTACK%20PROJECT/BLOG%20MERNSTACK%20PROJECT/frontend/src/features/auth/pages/ResetPasswordPage.jsx) | Standalone (`.auth-shell` + `AuthHero`) | Public (Unauthenticated) | Password reset token submission form |
| `/admin/login` | [`AdminLoginPage.jsx`](file:///c:/Users/HP/Downloads/BLOG%20MERNSTACK%20PROJECT/BLOG%20MERNSTACK%20PROJECT/frontend/src/features/admin/pages/AdminLoginPage.jsx) | Standalone (`.auth-shell`) | Public (Admin Auth) | Dedicated login for platform administrators |
| `/onboarding` | [`OnboardingPage.jsx`](file:///c:/Users/HP/Downloads/BLOG%20MERNSTACK%20PROJECT/BLOG%20MERNSTACK%20PROJECT/frontend/src/features/onboarding/pages/OnboardingPage.jsx) | Standalone (`.auth-shell`) | `ProtectedRoute` | 3-Step wizard (Account type, Team roles & invite, Topic interests) |
| `/welcome` | [`WelcomePage.jsx`](file:///c:/Users/HP/Downloads/BLOG%20MERNSTACK%20PROJECT/BLOG%20MERNSTACK%20PROJECT/frontend/src/features/onboarding/pages/WelcomePage.jsx) | Standalone (`.route-placeholder`) | `ProtectedRoute` | Post-onboarding success celebration landing screen |
| `/dashboard` | [`DashboardFeedPage.jsx`](file:///c:/Users/HP/Downloads/BLOG%20MERNSTACK%20PROJECT/BLOG%20MERNSTACK%20PROJECT/frontend/src/features/dashboard/pages/DashboardFeedPage.jsx) | `CustomerLayout` | `CustomerRoute` | SaaS dashboard with metrics, recommendations, and recent posts |
| `/blogs` | [`BlogsListPage.jsx`](file:///c:/Users/HP/Downloads/BLOG%20MERNSTACK%20PROJECT/BLOG%20MERNSTACK%20PROJECT/frontend/src/features/blogs/pages/BlogsListPage.jsx) | `CustomerLayout` | `CustomerRoute` | Full blog management table with filtering, search, & Dev.to modal |
| `/blogs/create` | [`BlogCreatePage.jsx`](file:///c:/Users/HP/Downloads/BLOG%20MERNSTACK%20PROJECT/BLOG%20MERNSTACK%20PROJECT/frontend/src/features/blogs/pages/BlogCreatePage.jsx) | `CustomerLayout` | `CustomerRoute` | Multi-step creation stepper (Basic details, Taxonomy, Assignments, Writing) |
| `/blogs/:id/edit` | [`BlogEditPage.jsx`](file:///c:/Users/HP/Downloads/BLOG%20MERNSTACK%20PROJECT/BLOG%20MERNSTACK%20PROJECT/frontend/src/features/blogs/pages/BlogEditPage.jsx) | `CustomerLayout` | `CustomerRoute` | Main TipTap rich editor, workflow status bar, AI modal, version history |
| `/profile` | [`ProfilePage.jsx`](file:///c:/Users/HP/Downloads/BLOG%20MERNSTACK%20PROJECT/BLOG%20MERNSTACK%20PROJECT/frontend/src/features/profile/pages/ProfilePage.jsx) | `CustomerLayout` | `CustomerRoute` | 3-Column user profile, security settings, bio, avatar, and team list |
| `/team` | [`TeamDashboardPage.jsx`](file:///c:/Users/HP/Downloads/BLOG%20MERNSTACK%20PROJECT/BLOG%20MERNSTACK%20PROJECT/frontend/src/features/teams/pages/TeamDashboardPage.jsx) | `CustomerLayout` | `CustomerRoute` | Team workspace management, member table, invite link generator modal |
| `/admin/dashboard` | [`AdminAnalyticsPage.jsx`](file:///c:/Users/HP/Downloads/BLOG%20MERNSTACK%20PROJECT/BLOG%20MERNSTACK%20PROJECT/frontend/src/features/admin/pages/AdminAnalyticsPage.jsx) | `AdminLayout` | `AdminProtectedRoute` | Real-time platform metrics, lifecycle pipeline, author leaderboard |
| `/admin/analytics` | [`AdminAnalyticsPage.jsx`](file:///c:/Users/HP/Downloads/BLOG%20MERNSTACK%20PROJECT/BLOG%20MERNSTACK%20PROJECT/frontend/src/features/admin/pages/AdminAnalyticsPage.jsx) | `AdminLayout` | `AdminProtectedRoute` | Duplicate route pointing to analytics dashboard |
| `/admin/categories` | [`AdminCategoriesPage.jsx`](file:///c:/Users/HP/Downloads/BLOG%20MERNSTACK%20PROJECT/BLOG%20MERNSTACK%20PROJECT/frontend/src/features/admin/pages/AdminCategoriesPage.jsx) | `AdminLayout` | `AdminProtectedRoute` | Category taxonomy CRUD management |
| `/admin/subcategories` | [`AdminSubcategoriesPage.jsx`](file:///c:/Users/HP/Downloads/BLOG%20MERNSTACK%20PROJECT/BLOG%20MERNSTACK%20PROJECT/frontend/src/features/admin/pages/AdminSubcategoriesPage.jsx) | `AdminLayout` | `AdminProtectedRoute` | Subcategory taxonomy CRUD management |
| `/admin/keywords` | [`AdminKeywordsPage.jsx`](file:///c:/Users/HP/Downloads/BLOG%20MERNSTACK%20PROJECT/BLOG%20MERNSTACK%20PROJECT/frontend/src/features/admin/pages/AdminKeywordsPage.jsx) | `AdminLayout` | `AdminProtectedRoute` | Primary & Secondary SEO keyword taxonomy management |
| `/admin/interests` | [`AdminInterestsPage.jsx`](file:///c:/Users/HP/Downloads/BLOG%20MERNSTACK%20PROJECT/BLOG%20MERNSTACK%20PROJECT/frontend/src/features/interests/pages/AdminInterestsPage.jsx) | `AdminLayout` | `AdminProtectedRoute` | User interest topic taxonomy management |
| `/admin/users` | [`AdminUsersPage.jsx`](file:///c:/Users/HP/Downloads/BLOG%20MERNSTACK%20PROJECT/BLOG%20MERNSTACK%20PROJECT/frontend/src/features/admin/pages/AdminUsersPage.jsx) | `AdminLayout` | `AdminProtectedRoute` | User management list & role assignment |
| `/admin/teams` | [`AdminTeamsPage.jsx`](file:///c:/Users/HP/Downloads/BLOG%20MERNSTACK%20PROJECT/BLOG%20MERNSTACK%20PROJECT/frontend/src/features/admin/pages/AdminTeamsPage.jsx) | `AdminLayout` | `AdminProtectedRoute` | Team organization list & member auditing |
| `/admin/roles` | [`AdminRolesPage.jsx`](file:///c:/Users/HP/Downloads/BLOG%20MERNSTACK%20PROJECT/BLOG%20MERNSTACK%20PROJECT/frontend/src/features/admin/pages/AdminRolesPage.jsx) | `AdminLayout` | `AdminProtectedRoute` | System RBAC roles management |
| `/admin/permissions` | [`AdminPermissionsPage.jsx`](file:///c:/Users/HP/Downloads/BLOG%20MERNSTACK%20PROJECT/BLOG%20MERNSTACK%20PROJECT/frontend/src/features/admin/pages/AdminPermissionsPage.jsx) | `AdminLayout` | `AdminProtectedRoute` | System permission nodes definition |
| `/admin/smtp` | [`AdminSMTPPage.jsx`](file:///c:/Users/HP/Downloads/BLOG%20MERNSTACK%20PROJECT/BLOG%20MERNSTACK%20PROJECT/frontend/src/features/admin/pages/AdminSMTPPage.jsx) | `AdminLayout` | `AdminProtectedRoute` | System email notification SMTP configuration |

---

## 3. Application Layouts & Navigation Structure

### A. Customer SaaS Workspace Layout (`CustomerLayout.jsx`)
- **Shell Structure**: Split 2-column view with a 260px fixed/sticky sidebar (`Sidebar.jsx`) and a flexible content zone (`v2-customer-main`) containing topbar (`Topbar.jsx`) and main view container (`v2-customer-content`).
- **Sidebar Component (`Sidebar.jsx`)**:
  - Brand header: "BlogWrite Platform V2" with logo icon.
  - Section 1 ("MAIN MENU"): Dashboard (`/dashboard`), My Blogs (`/blogs`), Create Blog (`/blogs/create`).
  - Section 2 ("ACCOUNT & SETTINGS"): Profile (`/profile`), Team (`/team` - conditionally rendered if `isTeamUser`).
  - Active Link Styling: `.v2-nav-item.active` (light blue background `#eff6ff` + blue text `#2563eb`).
- **Topbar Component (`Topbar.jsx`)**:
  - Global Search Input: Rounded pill input with search icon placeholder (`Search blogs, drafts...`).
  - User Badge: Display name, account type (`Individual` vs `Team`), and circular avatar initials/image.
  - Quick Logout Action: Door icon button triggering logout handler.

### B. Admin Control Room Layout (`AdminLayout.jsx`)
- **Shell Structure**: Flex container with a 260px sticky sidebar (`admin-sidebar`) and main content region (`admin-content`).
- **Sidebar Component (`AdminLayout.jsx`)**:
  - Brand header: "CB Control Room - Admin Panel".
  - Navigation links (11 items): Dashboard, Categories, Subcategories, Keywords, Interests, Users, Teams, Roles, Permissions, SMTP, Analytics.
  - Footer Action: Full-width red-accented "Sign Out" button.
- **Top Header Component (`AdminLayout.jsx`)**:
  - Header text: "Platform administration / Admin Workspace".

### C. Unwrapped & Standalone Views
- **Auth Shell (`.auth-shell`)**: Centered grid or single card wrapper for Login, Signup, Forgot Password, and Reset Password pages.
- **Public Blog Feed (`PublicBlogFeedPage.jsx`)**: Standalone 1200px max-width container with topic pill filter buttons and search input.

---

## 4. Reusable UI Components Inventory

### A. Core Primitive Components ([`CustomerComponents.jsx`](file:///c:/Users/HP/Downloads/BLOG%20MERNSTACK%20PROJECT/BLOG%20MERNSTACK%20PROJECT/frontend/src/components/ui/CustomerComponents.jsx))

1. **`Button`**:
   - Props: `variant` ('primary' | 'secondary' | 'outline' | 'danger' | 'ghost'), `size` ('sm' | 'md' | 'lg'), `isLoading`, `disabled`, `type`, `className`.
   - Features: Built-in loading spinner (`.v2-spinner-sm`), disabled state styling.
2. **`Input`**:
   - Props: `label`, `error`, `helperText`, `id`, standard input props.
   - Features: Label binding, error outline (`.v2-input-error`), helper/error messaging.
3. **`Select`**:
   - Props: `label`, `error`, `options` (array of `{ label, value }`), standard select props.
4. **`Card`**:
   - Props: `title`, `subtitle`, `action` (header button/link slot), `className`, `children`.
   - Layout: Standard white panel with border radius (16px), subtle shadow, header slot.
5. **`Badge`**:
   - Props: `variant` ('neutral' | 'success' | 'warning' | 'info' | 'danger'), `size`, `children`.
   - Styling: Rounded pill badges with background/text color tokens.
6. **`Avatar`**:
   - Props: `name`, `src`, `size` ('sm' | 'md' | 'lg').
   - Fallback: Auto-generates uppercase 2-letter initials from name string.
7. **`Modal`**:
   - Props: `isOpen`, `onClose`, `title`, `footer`, `children`.
   - Mechanics: Fixed backdrop overlay (`rgba(15,23,42,0.5)`), click propagation stopping on container.
8. **`Table`**:
   - Props: `headers` (string array), `children` (`<tr>` rows).
   - Wrapper: Overflow horizontal scroll container with standardized header styles.
9. **`EmptyState`**:
   - Props: `title`, `description`, `action`, `icon`.
   - Layout: Centered column layout with padded whitespace.
10. **`LoadingState`**:
    - Props: `message`.
    - Components: Centered animated CSS spinner (`v2-spinner-lg`).

### B. Feature-Specific Components

1. **`CategorySelector.jsx`**: Hierarchical dropdown cascade (Category -> Subcategory -> Keyword Checkboxes by primary/secondary type).
2. **`CommentsPanel.jsx`**: Right-side drawer for editorial and peer discussion comments per blog.
3. **`WorkflowActionsBar.jsx`**: Status action toolbar (`DRAFT` -> `IN_WRITING` -> `IN_REVIEW` -> `RE_ASSIGN` -> `IN_PUBLISHING` -> `PUBLISHED`).
4. **`DevToPublishModal.jsx`**: Modal form for cross-posting published articles to Dev.to using API key and tags.
5. **`BlogEditor.jsx` & `Toolbar.jsx`**: TipTap rich text editor with toolbar controls (bold, italic, headings, lists, blockquotes, image embedding, link insertion).
6. **`AIAssistantModal.jsx`**: 3-Tab AI Co-pilot modal (Draft Generator, Polish & Rewrite, SEO Metadata generation).
7. **`VersionHistoryDrawer.jsx`**: Slide-out drawer displaying full article version snapshots with restore functionality.
8. **`AuthHero.jsx`**: Side panel for auth pages featuring marketing copy, badges, and 3 feature points.

---

## 5. Forms Inventory

| Form Name | Component / Location | Fields & Inputs | Validation & Submission |
| :--- | :--- | :--- | :--- |
| **Login Form** | `LoginPage.jsx` | Email, Password, Remember Me checkbox | Required check, dispatches `loginUser`, redirects to `/dashboard` or `/onboarding` |
| **Signup Form** | `SignupPage.jsx` | Full Name, Username, Email, Password | Required check, dispatches `signupUser`, redirects to `/login` |
| **Forgot Password** | `ForgotPasswordPage.jsx` | Email input | Required check, displays dev reset token on response |
| **Reset Password** | `ResetPasswordPage.jsx` | Reset Token, New Password | Required check, dispatches `resetPasswordAction`, redirects to `/login` |
| **Onboarding Form** | `OnboardingPage.jsx` | Account Type cards (Individual/Team), Team Name, Workflow Role radio cards, Topic Interest chips with live search | Step 1: Min 2 char team name if team; Step 2: Role check; Step 3: At least 1 interest selected |
| **Create Blog Stepper** | `BlogCreatePage.jsx` | Title, URL Slug, Featured Cover Image file, Short Summary, Category/Subcategory dropdowns, Content body textarea, Team assignments | Title & slug auto-generation, step validation before progression, saves draft |
| **Edit Blog Form** | `BlogEditPage.jsx` | Title, Slug, TipTap rich text editor, Status select, SEO Meta Title, Meta Description, Short Summary, Category/Subcategory | Auto-save hook (2.5s debounced), manual submit, AI assistant content/meta injectors |
| **Team Invite Modal** | `TeamDashboardPage.jsx` | Role dropdown (Writer/Reviewer/Publisher), Invitee Email | Generates 7-day valid invitation link with clipboard copy action |
| **Profile & Security** | `ProfilePage.jsx` | First Name, Last Name, Bio textarea, Avatar upload modal trigger, Password update inputs | Password match check, API submission, profile reload |
| **Admin Taxonomy Forms** | `AdminCategoriesPage.jsx`, `Subcategories`, `Keywords`, `Interests` | Name, Slug, Description, Parent category selects | Inline edit/create toggle, submit to REST endpoints |
| **AI Co-Pilot Form** | `AIAssistantModal.jsx` | Topic, Tone, Length, Context, Target text, Polish action | Direct API integration with option to apply content directly to editor state |
| **Dev.to Cross-Post** | `DevToPublishModal.jsx` | Dev.to API Key, Tags comma-separated input | Cross-posts article to Dev.to REST API and records publication link |

---

## 6. Tables Inventory

1. **My Blogs Table (`BlogsListPage.jsx`)**:
   - Columns: Title & Summary, Category, Status Badge, Author Name, Actions (Edit, Dev.to Cross-post, Delete).
   - Features: Search input, status filter select dropdown, confirm prompt on deletion.
2. **Team Members Table (`TeamDashboardPage.jsx`)**:
   - Columns: Member Name + Avatar, Email Address, Role Badge, Status Badge (Active).
   - Context: Distinguishes current user (`(You)`) and team owner.
3. **Top Authors Leaderboard Table (`AdminAnalyticsPage.jsx`)**:
   - Columns: Author Name, Username, Published Articles Count.
4. **Admin Data List Views (`AdminCategoriesPage.jsx`, `AdminUsersPage.jsx`, etc.)**:
   - Custom `.admin-table` or `.admin-row` flex lists with item title, description/email, and row actions (Edit, Delete, Assign Role).

---

## 7. Cards Inventory

1. **Dashboard Metrics Cards (`DashboardFeedPage.jsx`)**:
   - Metrics: Drafts in Progress, In Review/Re-assign, Published Posts, Total Content Items.
2. **Recommended Article Cards (`DashboardFeedPage.jsx`)**:
   - Content: Category badge, title, 2-line clamped summary, author line. Clickable card navigating to blog detail.
3. **Onboarding Account Choice Cards (`OnboardingPage.jsx`)**:
   - Cards: Individual vs Team choice cards with active border highlighting (`2px solid #2563eb`).
4. **Public Feed Cards (`PublicBlogFeedPage.jsx`)**:
   - Layout: Article cover image preview (180px height), category tag, title, 3-line description clamp, author & publish date footer.
5. **Profile Overview Cards (`ProfilePage.jsx`)**:
   - Cards: 88px circular avatar card with edit badge, Personal Info form card, Account Settings navigation list card, Team Members list card.
6. **Analytics Pipeline Card (`AdminAnalyticsPage.jsx`)**:
   - Lifecycle breakdown cards: Drafts, In Writing, In Review, Re-assigned, In Publishing, Published.

---

## 8. Modals & Drawers Inventory

| Component / File | Trigger Mechanism | Layout & Contents | Primary Action |
| :--- | :--- | :--- | :--- |
| **`Modal.jsx`** | Shared UI Primitive | Fixed backdrop overlay, title header, body slot, footer button slot | Reusable dialog container |
| **`AIAssistantModal.jsx`** | "✨ AI Assistant" toolbar button in `BlogEditPage` | 3-Tab Modal (Draft Generator, Polish & Rewrite, SEO Metadata) | Generates AI text/metadata and applies directly to TipTap state |
| **`DevToPublishModal.jsx`** | "Dev.to" button on published rows in `BlogsListPage` | Fixed modal dialog with API key & tags input | Cross-posts article to Dev.to platform |
| **`VersionHistoryDrawer.jsx`**| "📜 History" toolbar button in `BlogEditPage` | Right-side slide-out drawer listing snapshot timestamps and authors | Restores selected historical version into current editor state |
| **`CommentsPanel.jsx`** | "💬 Discussion" toolbar button in `BlogEditPage` | Right-side slide-out drawer with comment list and new comment form | Posts editorial feedback comments per blog post |
| **Team Invite Modal** | "+ Invite Member" in `TeamDashboardPage` | Standard `Modal` instance with role select and email input | Generates and copies invitation link |

---

## 9. State Management UI Inventory (Empty, Loading, Error)

### A. Empty States
- **`EmptyState.jsx`**: Standardized component rendering icon, title, description, and action button. Used in `DashboardFeedPage` (No Recommended/No Recent Blogs), `BlogsListPage` (No matching filter), `TeamDashboardPage` (No pending invites).
- **`.admin-empty`**: Text class used in admin pages when no categories, users, or analytics data exist.

### B. Loading States
- **`LoadingState.jsx`**: Full component with centered spinning loader (`.v2-spinner-lg`) and custom message. Used across `DashboardFeedPage`, `BlogsListPage`, `TeamDashboardPage`, `ProfilePage`.
- **Inline Button Loaders**: `.v2-btn-spinner-wrap` displaying small spinning ring inside disabled buttons during form submission.
- **Auto-Save Status Indicator (`BlogEditPage.jsx`)**: Real-time status text (`⏳ Auto-saving...`, `✓ Saved`, `✎ Typing...`).

### C. Error States
- **`.auth-alert.error`**: Light red banner (`rgba(180,35,24,0.08)`) with dark red text (`#dc2626`). Used across auth pages, onboarding, blog creation, and admin panels.
- **`.v2-input-error`**: Red border highlight on invalid input fields.

---

## 10. Responsive Behavior Analysis

### Breakpoints & CSS Media Queries
- **Main Breakpoint 1 (`max-width: 960px`)**:
  - `AdminLayout`: Sidebar shifts from 260px sticky column to top stacked block (`flex-direction: column`).
  - Auth Grid (`.auth-grid`): Shifts from 2-column hero/form grid to 1-column layout.
  - Blog Create Shell (`.blog-create-shell`): Category selector and form stack vertically.
- **Main Breakpoint 2 (`max-width: 640px`)**:
  - Auth Shell: Reduced padding (14px).
  - Selector Grid (`.selector-grid`): Category selectors collapse to 1 column.
  - Admin Grid (`.admin-grid`): 2-column admin forms stack to 1 column.
  - Admin Row (`.admin-row`): Flex row converts to flex column alignment.
  - Team Grid (`.team-grid`): Team dashboard members and side panels stack vertically.
- **App.css Breakpoint (`max-width: 1024px`)**:
  - Legacy Vite template hero adjustments and next steps list stacking.

---

## 11. Existing Design System Tokens

### A. CSS Custom Properties (`:root` in `index.css`)
```css
--bg: #f8fafc;
--bg-strong: #0f172a;
--panel: #ffffff;
--panel-border: #e2e8f0;
--text: #475569;
--text-strong: #0f172a;
--accent: #2563eb;
--accent-strong: #1d4ed8;
--success: #166534;
--error: #dc2626;
--shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05);
```

### B. Customer SaaS Component Tokens (`:root` in `CustomerComponents.css`)
```css
--v2-primary: #2563eb;
--v2-primary-hover: #1d4ed8;
--v2-primary-light: #eff6ff;
--v2-bg: #f8fafc;
--v2-surface: #ffffff;
--v2-border: #e2e8f0;
--v2-text-main: #0f172a;
--v2-text-muted: #64748b;
--v2-radius: 12px;
--v2-shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.05);
--v2-shadow-md: 0 4px 12px rgba(0, 0, 0, 0.06);
```

### C. Typography Rules
- **Font Family**: `Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`.
- **Headings**:
  - Hero Display: `clamp(2.3rem, 4vw, 4.6rem)`, letter-spacing `-0.06em`, line-height `0.98`.
  - H1 Page Titles: `1.8rem`, color `#0f172a`, font-weight `700` or `800`.
  - H2 Section Titles: `1.5rem`, color `#0f172a`.
  - H3 Card Titles: `1.15rem`, font-weight `700`.
- **Body Text**: `0.9rem` to `1.05rem`, line-height `1.5` to `1.7`, color `#475569` / `#64748b`.
