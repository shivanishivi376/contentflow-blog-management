import TurndownService from 'turndown';

const DEVTO_API_URL = 'https://dev.to/api/articles';
const DEVTO_TIMEOUT_MS = 15000;
const turndownService = new TurndownService({
  bulletListMarker: '-',
  codeBlockStyle: 'fenced',
  headingStyle: 'atx'
});
turndownService.remove(['script', 'style', 'iframe', 'object']);
turndownService.addRule('publicImages', {
  filter: 'img',
  replacement: (_content, node) => {
    const source = node.getAttribute('src');
    if (!source) return '';
    const imageUrl = getPublicUrl(source, 'Article image URL');
    const alt = String(node.getAttribute('alt') || '').replace(/[\[\]]/g, '\\$&');
    return `![${alt}](${imageUrl})`;
  }
});
turndownService.addRule('safeLinks', {
  filter: 'a',
  replacement: (content, node) => {
    const href = node.getAttribute('href') || '';
    if (!/^(https?:\/\/|mailto:|\/|#)/i.test(href)) return content;
    return `[${content}](${href.replace(/[()]/g, encodeURIComponent)})`;
  }
});

export const isDevToConfigured = () => Boolean(process.env.DEVTO_API_KEY?.trim());

const normalizeTag = (value) =>
  String(value || '')
    .toLowerCase()
    .replace(/-/g, '_')
    .replace(/[^a-z0-9_]/g, '')
    .slice(0, 30);

export const getDevToTags = (blog, requestedTags = []) => {
  const sourceTags = Array.isArray(requestedTags) && requestedTags.length > 0
    ? requestedTags
    : [
        ...(blog.primaryKeywords || []),
        ...(blog.secondaryKeywords || []),
        blog.subcategory,
        blog.category
      ].map((item) => item?.slug || item?.name || '');

  const tags = [...new Set(sourceTags.map(normalizeTag).filter(Boolean))].slice(0, 4);
  return tags.length > 0 ? tags : ['webdev', 'javascript', 'mern'];
};

export const convertHtmlToMarkdown = (content = '') => {
  const markdown = turndownService.turndown(String(content));
  return markdown.replace(/\n{3,}/g, '\n\n').trim();
};

const normalizeArticleId = (id) => {
  const parsedId = Number(id);
  if (!Number.isSafeInteger(parsedId) || parsedId <= 0) {
    throw new Error('Dev.to returned an invalid article ID');
  }
  return parsedId;
};

const getPublicUrl = (value, fieldName) => {
  if (!value) return undefined;
  try {
    const url = new URL(value);
    if (!['http:', 'https:'].includes(url.protocol)) {
      throw new Error();
    }
    return url.toString();
  } catch {
    throw new Error(`${fieldName} must be a valid public URL`);
  }
};

export const createDevToArticle = async ({ blog, tags }) =>
  sendArticleRequest('POST', DEVTO_API_URL, { blog, tags });

export const updateDevToArticle = async ({ blog, articleId, tags }) => {
  const normalizedId = normalizeArticleId(articleId);
  return sendArticleRequest('PUT', `${DEVTO_API_URL}/${normalizedId}`, { blog, tags });
};

const sendArticleRequest = async (method, url, { blog, tags }) => {
  const apiKey = process.env.DEVTO_API_KEY?.trim();
  if (!apiKey) {
    throw new Error('Dev.to publishing is not configured. Set DEVTO_API_KEY on the backend.');
  }

  const title = String(blog.title || '').trim();
  const bodyMarkdown = convertHtmlToMarkdown(blog.content);
  if (title.length < 3 || title.length > 200) {
    throw new Error('Dev.to requires an article title between 3 and 200 characters.');
  }
  if (!bodyMarkdown) {
    throw new Error('Dev.to requires article content.');
  }

  const article = {
    title,
    body_markdown: bodyMarkdown,
    published: true,
    description: String(blog.description || '').slice(0, 200),
    tags: getDevToTags(blog, tags)
  };
  let coverImage;
  if (blog.featuredImage) {
    try {
      coverImage = getPublicUrl(blog.featuredImage, 'Cover image');
    } catch (error) {
      if (error.message !== 'Cover image must be a valid public URL') throw error;
    }
  }
  if (coverImage) article.cover_image = coverImage;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), DEVTO_TIMEOUT_MS);

  try {
    const requestOptions = {
      method,
      headers: {
        'api-key': apiKey,
        'Content-Type': 'application/json'
      },
      signal: controller.signal
    };
    let response = await fetch(url, {
      ...requestOptions,
      body: JSON.stringify({ article })
    });

    if (!response.ok && response.status === 422 && article.cover_image) {
      const articleWithoutCover = { ...article };
      delete articleWithoutCover.cover_image;
      response = await fetch(url, {
        ...requestOptions,
        body: JSON.stringify({ article: articleWithoutCover })
      });
    }

    if (!response.ok) {
      const messageByStatus = {
        401: 'Dev.to rejected the API key. Check DEVTO_API_KEY.',
        403: 'The configured Dev.to account is not allowed to publish this article.',
        422: 'Dev.to rejected the article. Check its title, content, image URL, and tags.'
      };
      throw new Error(
        messageByStatus[response.status] ||
        `Dev.to could not publish the article (HTTP ${response.status}).`
      );
    }

    const data = await response.json();
    if (!data || typeof data !== 'object') {
      throw new Error('Dev.to returned invalid article data.');
    }
    const id = normalizeArticleId(data.id);
    const articleUrl = getPublicUrl(data.url, 'Dev.to article URL');
    if (!articleUrl) {
      throw new Error('Dev.to returned an article without a valid public URL.');
    }

    return { id, url: articleUrl, rawResponse: data };
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error('Dev.to request timed out. The article may not have been published; retry to sync it.');
    }
    if (error instanceof TypeError) {
      throw new Error('Could not connect to Dev.to. Check the server network and try again.');
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
};
