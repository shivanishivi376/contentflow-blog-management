# Dev.to publishing integration

The existing authenticated publish endpoint publishes a blog locally first, then creates or updates the matching Dev.to article. A Dev.to outage or rejected article does not undo local publication; its status and error are saved on the blog for retry.

## Configuration

Set `DEVTO_API_KEY` in `backend/.env` (it is already included in `backend/.env.example`). Do not add the real key to source control or send it in a frontend request.

## Postman: publish a blog

- **Method:** `POST`
- **URL:** `{{apiBaseUrl}}/api/blogs/{{blogId}}/publish`
- **Headers:**
  - `Authorization: Bearer {{accessToken}}`
  - `Content-Type: application/json`
- **Body:** no body is required (`{}` is accepted).

This endpoint uses the existing `BLOG_PUBLISH` authorization middleware and blog-specific workflow authorization.

Successful response (`200`):

```json
{
  "success": true,
  "message": "Blog published successfully",
  "data": {
    "blog": {
      "status": "PUBLISHED",
      "devToPublished": true,
      "devToArticleId": 123456,
      "devToUrl": "https://dev.to/example/article"
    },
    "devTo": {
      "published": true,
      "articleId": 123456,
      "url": "https://dev.to/example/article"
    }
  },
  "error": null
}
```

If Dev.to fails, the same endpoint still returns `200` because the local blog publication succeeded. The blog's `devToPublished` is `false`, and `devToPublishError` contains the safe, user-facing reason:

```json
{
  "success": true,
  "message": "Blog published successfully, but Dev.to publishing failed.",
  "data": {
    "blog": {
      "status": "PUBLISHED",
      "devToPublished": false,
      "devToPublishError": "Dev.to rejected the API key. Check DEVTO_API_KEY."
    },
    "devTo": {
      "published": false,
      "error": "Dev.to rejected the API key. Check DEVTO_API_KEY."
    }
  },
  "error": null
}
```

## Retry or sync Dev.to independently

After the blog is locally published, use the existing endpoint:

- **Method:** `POST`
- **URL:** `{{apiBaseUrl}}/api/blogs/{{blogId}}/publish/devto`
- **Headers:** `Authorization: Bearer {{accessToken}}`, `Content-Type: application/json`
- **Body:** optional `{"tags":["javascript","nodejs","mern"]}` (maximum of four tags are sent).

The API key is always loaded by the backend. This endpoint updates the existing Dev.to article when an article ID is recorded and creates one only when none exists.

## API calls and content handling

- Create: `POST https://dev.to/api/articles`
- Update: `PUT https://dev.to/api/articles/{articleId}`
- Authentication header: `api-key: <server-side DEVTO_API_KEY>` (Dev.to's API uses this header rather than `Authorization: Bearer`).
- TipTap HTML is converted to Markdown server-side. Public HTTP(S) image URLs, including Cloudinary URLs, become Markdown images; the featured image is sent as `cover_image`.
- Category and keyword slugs/names supply up to four valid Dev.to tags.

If the remote create request times out after Dev.to accepted it, the remote result may be uncertain because Dev.to does not provide a create idempotency key. Check the Dev.to account before repeatedly retrying that specific timeout.
