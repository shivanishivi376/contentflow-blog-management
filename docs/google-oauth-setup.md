# Google sign-in setup

Google sign-in uses the Google Identity Services credential rendered by `@react-oauth/google`. The backend verifies the submitted ID token with Google's `google-auth-library`, checks its audience against `GOOGLE_CLIENT_ID`, and requires Google's verified email claim. Google tokens are never used as application access tokens.

## Configuration

1. Create a **Web application** OAuth client in Google Cloud Console.
2. Add the frontend's origin (for example, `http://localhost:5173`) to **Authorized JavaScript origins**.
3. Set `VITE_GOOGLE_CLIENT_ID` in `frontend/.env` to the web client ID.
4. Set the same client ID as `GOOGLE_CLIENT_ID` in `backend/.env`.
5. Restart Vite and the backend after changing environment variables.

This ID-token flow does not need a Google client secret or OAuth access token. The existing backend `.env.example` includes `GOOGLE_CLIENT_SECRET` only as an optional placeholder; do not set or expose it for this flow.

## API

`POST /api/auth/google`

```http
Content-Type: application/json
```

```json
{
  "credential": "<Google Identity Services ID token>"
}
```

The response uses the existing auth response envelope and includes the application's `accessToken`, `refreshToken`, and safe user object. It does not return Google's token. Google-only accounts start as ordinary `INDIVIDUAL` accounts and go through the existing onboarding flow.

Verified email addresses matching existing local accounts are linked to that user without changing their password, account type, or permissions. Existing password login remains enabled. Google users sign out using the existing application logout flow.
