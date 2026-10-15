import test from 'node:test';
import assert from 'node:assert/strict';
import {
  convertHtmlToMarkdown,
  createDevToArticle,
  getDevToTags,
  updateDevToArticle
} from '../src/integrations/devto/devtoClient.js';

test('converts rich editor HTML to Markdown and preserves public image URLs', () => {
  const markdown = convertHtmlToMarkdown(
    '<h2>Useful heading</h2><p>Read <strong>this</strong> guide.</p>' +
    '<ul><li>One</li><li>Two</li></ul>' +
    '<script>alert("unsafe")</script>' +
    '<p><img src="https://res.cloudinary.com/demo/image/upload/post.jpg" alt="Cover"></p>'
  );

  assert.match(markdown, /## Useful heading/);
  assert.match(markdown, /\*\*this\*\*/);
  assert.match(markdown, /-\s+One/);
  assert.match(markdown, /!\[Cover\]\(https:\/\/res\.cloudinary\.com\/demo\/image\/upload\/post\.jpg\)/);
  assert.doesNotMatch(markdown, /unsafe/);
});

test('derives at most four valid Dev.to tags from blog taxonomy', () => {
  const tags = getDevToTags({
    primaryKeywords: [{ slug: 'node-js' }, { name: 'MERN Stack' }],
    secondaryKeywords: [{ slug: 'backend' }, { slug: 'javascript' }, { slug: 'ignored' }],
    category: { slug: 'engineering' }
  });

  assert.deepEqual(tags, ['node_js', 'mernstack', 'backend', 'javascript']);
});

test('uses Dev.to defaults if taxonomy contains no valid tags', () => {
  assert.deepEqual(getDevToTags({ primaryKeywords: [], secondaryKeywords: [] }), [
    'webdev',
    'javascript',
    'mern'
  ]);
});

test('rejects image references that are not public HTTP URLs', () => {
  assert.throws(
    () => convertHtmlToMarkdown('<img src="/uploads/private.png" alt="Private">'),
    /valid public URL/
  );
});

test('removes unsafe links from the Markdown sent to Dev.to', () => {
  const markdown = convertHtmlToMarkdown(
    '<p><a href="javascript:alert(1)">Unsafe link</a> ' +
    '<a href="https://example.com/path">Safe link</a></p>'
  );

  assert.doesNotMatch(markdown, /javascript:/);
  assert.match(markdown, /\[Safe link\]\(https:\/\/example\.com\/path\)/);
  assert.match(markdown, /Unsafe link/);
});

test('creates and updates articles with the server key and Markdown payload', async () => {
  const originalApiKey = process.env.DEVTO_API_KEY;
  const originalFetch = globalThis.fetch;
  const requests = [];
  const testApiKey = `unit-test-${process.pid}`;
  process.env.DEVTO_API_KEY = testApiKey;
  globalThis.fetch = async (url, options) => {
    requests.push({ url, options });
    return {
      ok: true,
      json: async () => ({ id: 987654, url: 'https://dev.to/example/article' })
    };
  };

  try {
    const blog = {
      title: 'Test article',
      content: '<h1>Markdown heading</h1><p>Body</p>',
      category: { slug: 'testing' },
      featuredImage: 'https://res.cloudinary.com/demo/image/upload/cover.png'
    };

    await createDevToArticle({ blog, tags: [] });
    await updateDevToArticle({ blog, articleId: 987654, tags: [] });

    assert.equal(requests[0].options.method, 'POST');
    assert.equal(requests[1].options.method, 'PUT');
    assert.equal(requests[1].url, 'https://dev.to/api/articles/987654');
    assert.equal(requests[0].options.headers['api-key'], testApiKey);
    assert.equal(requests[0].options.headers.Authorization, undefined);

    const payload = JSON.parse(requests[0].options.body);
    assert.match(payload.article.body_markdown, /# Markdown heading/);
    assert.deepEqual(payload.article.tags, ['testing']);
    assert.equal(payload.article.cover_image, blog.featuredImage);
    assert.equal(payload.article.published, true);
  } finally {
    globalThis.fetch = originalFetch;
    if (originalApiKey === undefined) {
      delete process.env.DEVTO_API_KEY;
    } else {
      process.env.DEVTO_API_KEY = originalApiKey;
    }
  }
});

test('publishes without an invalid optional cover image', async () => {
  const originalApiKey = process.env.DEVTO_API_KEY;
  const originalFetch = globalThis.fetch;
  let payload;
  process.env.DEVTO_API_KEY = `unit-test-${process.pid}`;
  globalThis.fetch = async (_url, options) => {
    payload = JSON.parse(options.body);
    return {
      ok: true,
      json: async () => ({ id: 987655, url: 'https://dev.to/example/no-cover' })
    };
  };

  try {
    await createDevToArticle({
      blog: {
        title: 'Test article',
        content: '<p>Body</p>',
        featuredImage: '/uploads/private-cover.png'
      },
      tags: []
    });

    assert.equal(payload.article.cover_image, undefined);
    assert.equal(payload.article.published, true);
  } finally {
    globalThis.fetch = originalFetch;
    if (originalApiKey === undefined) {
      delete process.env.DEVTO_API_KEY;
    } else {
      process.env.DEVTO_API_KEY = originalApiKey;
    }
  }
});

test('retries Dev.to publishing without the cover image if Dev.to rejects it', async () => {
  const originalApiKey = process.env.DEVTO_API_KEY;
  const originalFetch = globalThis.fetch;
  const payloads = [];
  process.env.DEVTO_API_KEY = `unit-test-${process.pid}`;
  globalThis.fetch = async (_url, options) => {
    payloads.push(JSON.parse(options.body));
    if (payloads.length === 1) {
      return { ok: false, status: 422 };
    }
    return {
      ok: true,
      json: async () => ({ id: 987656, url: 'https://dev.to/example/retried-without-cover' })
    };
  };

  try {
    const result = await createDevToArticle({
      blog: {
        title: 'Test article',
        content: '<p>Body</p>',
        featuredImage: 'https://example.com/cover.png'
      },
      tags: []
    });

    assert.equal(payloads.length, 2);
    assert.equal(payloads[0].article.cover_image, 'https://example.com/cover.png');
    assert.equal(payloads[1].article.cover_image, undefined);
    assert.equal(payloads[1].article.published, true);
    assert.equal(result.url, 'https://dev.to/example/retried-without-cover');
  } finally {
    globalThis.fetch = originalFetch;
    if (originalApiKey === undefined) {
      delete process.env.DEVTO_API_KEY;
    } else {
      process.env.DEVTO_API_KEY = originalApiKey;
    }
  }
});
