# 📖 Blog MERN Stack Project - Setup & Testing Guide

This guide provides step-by-step instructions for configuring, running, and testing the Collaborative Blog Writing & Publishing Platform with all current features and functionality.

---

## 🛠️ 1. Project Overview & Architecture

* **Backend**: Node.js (ES Modules), Express.js v5, MongoDB with Mongoose v9, JSON Web Tokens (JWT) with refresh token rotation, Google OAuth ID-token verification (`google-auth-library`), bcryptjs password hashing, Joi validation, express-rate-limit.
* **Frontend**: React 19, Vite 8, Redux Toolkit, React Router v7, `@react-oauth/google` Google Sign-In, Tiptap rich text editor (with Link & Image extensions), Material UI (MUI) v9, Bootstrap 5, Axios HTTP client, centralized `useConfirm` modal system.
* **Integrations**: OpenRouter AI (configurable Google Gemini 2.5 Flash with mock fallback for local development), Cloudinary (media storage via Multer memory buffer), Dev.to API (one-click & modal cross-publishing via `turndown` Markdown converter), Nodemailer/SMTP (email notifications with DB configuration and live test/unlink tools).

---

## ⚙️ 2. Environment Setup

Configuration is managed via `.env` files in `backend/` and `frontend/`.

### Backend `.env` Key Variables:
```env
PORT=4000
NODE_ENV=development
MONGODB_URI=<your_mongodb_connection_string>

# JWT Secret Keys
JWT_ACCESS_SECRET=replace-with-a-strong-access-secret
JWT_REFRESH_SECRET=replace-with-a-strong-refresh-secret
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
PASSWORD_RESET_EXPIRES_IN=1h

# Google OAuth (Google Cloud Console Web Client ID)
GOOGLE_CLIENT_ID=<your_google_client_id>.apps.googleusercontent.com

# Cloudinary (image uploads)
CLOUDINARY_CLOUD_NAME=<your_cloudinary_cloud_name>
CLOUDINARY_API_KEY=<your_cloudinary_api_key>
CLOUDINARY_API_SECRET=<your_cloudinary_api_secret>

# OpenRouter AI (content generation)
OPENROUTER_API_KEY=<your_openrouter_api_key>
OPENROUTER_MODEL=google/gemini-2.5-flash

# SMTP Email (Nodemailer fallback)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=<your_smtp_username>
SMTP_PASSWORD=<your_smtp_app_password>
SMTP_SENDER_EMAIL=<your_sender_email>
SMTP_SENDER_NAME="Blog Platform"

# Dev.to Cross-Publishing
DEVTO_API_KEY=<your_devto_api_key>

# Seed Credentials (used by npm run seed:admin)
ADMIN_NAME=Main Admin
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=AdminPass123!
```

### Frontend `.env`:
```env
VITE_API_URL=http://localhost:4000
VITE_GOOGLE_CLIENT_ID=<your_google_client_id>.apps.googleusercontent.com
```

> **Note**:
> - **AI Writer**: Works out of the box even without an OpenRouter key by returning clean template mock articles (`isMock: true`).
> - **Google OAuth**: If `VITE_GOOGLE_CLIENT_ID` is omitted, the Google button is disabled with an informational message, allowing standard email/password login to continue without errors.

---

## 🚀 3. Installation, Seeding & Migrations

### 3.1 Install Dependencies

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 3.2 Run Database Scripts

Run these scripts from the `backend/` directory:

```bash
cd backend

# 1. Seed RBAC permissions and default roles (Writer, Reviewer, Publisher)
npm run seed:rbac

# 2. Seed default Main Admin account
npm run seed:admin

# 3. Migrate and synchronize taxonomy indexes (Categories, Subcategories, Keywords)
npm run migrate:categories
```

**What the scripts do:**
- `seed:rbac` — Populates 19 standard permission codes and default roles (Writer, Reviewer, Publisher) with their respective workflow capabilities.
- `seed:admin` — Creates or updates the single Main Admin account defined in `ADMIN_*` environment variables.
- `migrate:categories` — Removes legacy single-field unique indexes on category/subcategory slugs, assigns `GLOBAL` scope to legacy taxonomy records, and creates new compound indexes for scoped taxonomy support.

---

## 🔑 4. Credentials for Testing

### 🛡️ Admin Portal Access
* **Login URL**: `http://localhost:5173/admin/login`
* **Email**: `admin@example.com`
* **Password**: `AdminPass123!`

### 👤 Standard User Access
* **Sign Up URL**: `http://localhost:5173/signup`
* **Login URL**: `http://localhost:5173/login`
* Register new individual or team accounts, or sign in directly with Google.

---

## 🖥️ 5. Running the Application

### Start Backend Server
```bash
cd backend
npm run dev
```
* **API URL**: `http://localhost:4000`
* **Health Check**: `http://localhost:4000/api/health`

### Start Frontend Application
```bash
cd frontend
npm run dev
```
* **Frontend App**: `http://localhost:5173`

---

## 🧪 6. Testing Workflows

### 1. Google OAuth Sign-In & Account Linking
1. Configure `GOOGLE_CLIENT_ID` in `backend/.env` and `VITE_GOOGLE_CLIENT_ID` in `frontend/.env`.
2. Visit `http://localhost:5173/login` or `http://localhost:5173/signup`.
3. Click **"Continue with Google"** and complete Google authentication.
4. If the account is new: the system automatically provisions an `INDIVIDUAL` account with a generated username and redirects to `/onboarding`.
5. If an existing account already exists with the same email: the Google account is securely linked without resetting the user's password.

### 2. Scoped Taxonomy Management (`http://localhost:5173/categories`)
1. Log in as an individual user or team member.
2. Click **Categories** in the customer sidebar or visit `/categories`.
3. **Categories Tab**: View Global categories (system-wide) alongside your own personal/team categories. Click **Add Category** to create a custom category.
4. **Subcategories Tab**: Create subcategories linked to either global or personal categories.
5. **Keywords Tab**: Create primary and secondary keywords tagged to subcategories.
6. Verify that when you navigate to **Create Blog** (`/blogs/create`), your scoped categories and keywords appear in the taxonomy selector.

### 3. Individual Blog Workflow & Autosave
1. Navigate to **Create Blog** (`/blogs/create`).
2. Provide a title, slug, and select Category → Subcategory → Primary/Secondary Keywords.
3. In the Editor workspace (`/blogs/:id/edit`):
   - Type in the **Tiptap rich text editor**. Observe the debounced status badge update from `idle` → `saving...` → `saved ✓`.
   - Switch to the **AI Writer Tab**, provide a topic and tone, and insert generated content directly into the editor.
   - Click the **Version History** drawer to view auto-generated version snapshots and test reverting to a prior snapshot.
4. Click **Publish Article Now** in the top action bar to make the blog live.

### 4. Dev.to Cross-Publishing
1. Once a blog is published, click **Publish to Dev.to** from the workflow workspace.
2. The `DevToPublishModal` opens, displaying existing publications if any.
3. Enter comma-separated Dev.to tags (e.g. `javascript, webdev, react`).
4. Click **Publish to Dev.to**. The backend converts the TipTap HTML to clean Markdown via `turndown`, sends the request with the server-side `DEVTO_API_KEY`, and records an `ExternalPublication` entry.
5. The modal displays a green checkmark and a direct link to view the published article on Dev.to.

### 5. Team Collaborative Editorial Workflow (3 Users)
1. **User 1 (Team Owner)**: Sign up, complete onboarding by choosing **Team**, creating a team name, and selecting a role (e.g., Writer).
2. Go to the **Team Dashboard** (`/team`) and invite two teammates:
   - Invite User 2 as **Reviewer**.
   - Invite User 3 as **Publisher**.
3. **Users 2 & 3**: Accept their invitations via the invitation link to join the team.
4. **User 1**: Create a new team blog. In the blog workspace, assign:
   - **Writer**: User 1
   - **Reviewer**: User 2
   - **Publisher**: User 3
5. **Writing & Review Request**: User 1 writes content and clicks **Submit for Review** (status becomes `IN_REVIEW`).
6. **Review & Revision Request**: User 2 logs in, opens the blog:
   - If User 2 clicks **Request Revision** with feedback: status moves to `RE_ASSIGN` and an automated revision feedback comment is created. User 1 can edit and resubmit.
   - If User 2 clicks **Approve Blog**: status moves to `IN_PUBLISHING`.
7. **Publishing**: User 3 logs in, clicks **Publish Article Now**, and the blog becomes `PUBLISHED`.

### 6. Threaded Comments & Reviewer Permissions
1. Open any blog's **Comments Tab** or floating comments panel.
2. Post a general discussion comment.
3. Reply to any comment to test **threaded replies**.
4. Test Reviewer permissions: on team blogs, only the assigned Reviewer can post top-level review feedback comments.
5. Click **Resolve** on any comment to toggle status between `OPEN` and `RESOLVED` with resolver details displayed.

### 7. SMTP Email Configuration & Unlinking (`http://localhost:5173/admin/smtp`)
1. Log in as Main Admin at `/admin/login`.
2. Navigate to **SMTP Settings** (`/admin/smtp`).
3. Enter your SMTP host, port, username, password, and sender credentials. Click **Save Settings**.
4. In the **Test SMTP Connection** panel, enter a recipient email address and click **Send Test Email** to verify SMTP connectivity.
5. To reset the configuration, click **Unlink Configuration**. Confirm in the dialog to delete the database record and revert to default `.env` settings.
