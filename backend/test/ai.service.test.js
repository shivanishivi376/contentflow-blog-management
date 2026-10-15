import test from 'node:test';
import assert from 'node:assert/strict';
import { generateAIContent } from '../src/services/aiService.js';

const withOpenRouterResponse = async (content, run) => {
  const originalApiKey = process.env.OPENROUTER_API_KEY;
  const originalFetch = globalThis.fetch;
  process.env.OPENROUTER_API_KEY = 'test-key';
  let requestedBody;
  globalThis.fetch = async (_url, options) => {
    requestedBody = JSON.parse(options.body);
    return {
      ok: true,
      json: async () => ({
        choices: [{ message: { content } }]
      })
    };
  };

  try {
    await run(() => requestedBody);
  } finally {
    globalThis.fetch = originalFetch;
    if (originalApiKey === undefined) delete process.env.OPENROUTER_API_KEY;
    else process.env.OPENROUTER_API_KEY = originalApiKey;
  }
};

test('generates an article without adding a reference ID to the prompt or result', async () => {
  await withOpenRouterResponse(
    '<h3>AI in Everyday Work</h3>\n<p>Artificial intelligence can help people complete routine tasks.</p>\n<p>Ref ID: 718182</p>',
    async (getRequestedBody) => {
      const response = await generateAIContent({ topic: 'AI in everyday work' });
      const prompt = getRequestedBody().messages.at(-1).content;

      assert.match(response.result, /<h3>AI in Everyday Work<\/h3>/);
      assert.doesNotMatch(response.result, /Ref ID|718182/);
      assert.doesNotMatch(prompt, /Ref ID|Variation Ref/);
    }
  );
});

test('rejects a response that contains leaked planning text instead of an article', async () => {
  await withOpenRouterResponse(
    'I need to interpret this vague topic creatively.\n\nWait, let me re-read carefully:\n### Title\n- Do not include reasoning.\nRef ID: 718182',
    async () => {
      await assert.rejects(
        generateAIContent({ topic: 'aiii' }),
        (error) => {
          assert.equal(error.code, 'AI_INVALID_RESPONSE');
          assert.match(error.message, /could not create a complete article/i);
          assert.doesNotMatch(error.message, /718182|reasoning/i);
          return true;
        }
      );
    }
  );
});
