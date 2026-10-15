import test from 'node:test';
import assert from 'node:assert/strict';
import {
  queryOpenRouter,
  toOpenRouterAppError
} from '../src/integrations/openrouter/openrouterClient.js';

test('returns a friendly message for an invalid model configuration', () => {
  const error = toOpenRouterAppError(400, 'qwen model is not a valid model ID');

  assert.equal(error.statusCode, 503);
  assert.equal(error.code, 'AI_SERVICE_UNAVAILABLE');
  assert.equal(
    error.message,
    'Our AI writing assistant is temporarily unavailable. Please try again shortly.'
  );
  assert.doesNotMatch(error.message, /qwen|OpenRouter|model ID/i);
});

test('returns a retry-later message when OpenRouter is rate limited', () => {
  const error = toOpenRouterAppError(429, 'rate limit details');

  assert.equal(error.statusCode, 429);
  assert.equal(error.code, 'AI_RATE_LIMITED');
  assert.match(error.message, /busy right now/i);
});

test('does not expose provider details for other failures', () => {
  const error = toOpenRouterAppError(500, 'internal upstream response');

  assert.equal(error.statusCode, 503);
  assert.match(error.message, /try again in a moment/i);
  assert.doesNotMatch(error.message, /upstream response/i);
});

test('maps invalid-model API responses to a friendly error', async () => {
  const originalApiKey = process.env.OPENROUTER_API_KEY;
  const originalModel = process.env.OPENROUTER_MODEL;
  const originalFetch = globalThis.fetch;
  process.env.OPENROUTER_API_KEY = 'test-key';
  process.env.OPENROUTER_MODEL = 'google/gemma-4-31b-it:free';
  let requestedModel;
  globalThis.fetch = async (_url, options) => {
    requestedModel = JSON.parse(options.body).model;
    return {
      ok: false,
      status: 400,
      json: async () => ({
        error: { message: 'wen/qwen3.8-27b:free is not a valid model ID' }
      })
    };
  };

  try {
    await assert.rejects(queryOpenRouter({ prompt: 'test' }), (error) => {
      assert.equal(error.statusCode, 503);
      assert.equal(
        error.message,
        'Our AI writing assistant is temporarily unavailable. Please try again shortly.'
      );
      assert.doesNotMatch(error.message, /wen|qwen|valid model ID/i);
      return true;
    });
    assert.equal(requestedModel, 'google/gemma-4-31b-it:free');
  } finally {
    globalThis.fetch = originalFetch;
    if (originalApiKey === undefined) delete process.env.OPENROUTER_API_KEY;
    else process.env.OPENROUTER_API_KEY = originalApiKey;
    if (originalModel === undefined) delete process.env.OPENROUTER_MODEL;
    else process.env.OPENROUTER_MODEL = originalModel;
  }
});

test('maps network errors to a friendly retry message', async () => {
  const originalApiKey = process.env.OPENROUTER_API_KEY;
  const originalFetch = globalThis.fetch;
  process.env.OPENROUTER_API_KEY = 'test-key';
  globalThis.fetch = async () => {
    throw new TypeError('network details');
  };

  try {
    await assert.rejects(queryOpenRouter({ prompt: 'test' }), (error) => {
      assert.equal(error.statusCode, 503);
      assert.match(error.message, /try again in a moment/i);
      assert.doesNotMatch(error.message, /network details/i);
      return true;
    });
  } finally {
    globalThis.fetch = originalFetch;
    if (originalApiKey === undefined) delete process.env.OPENROUTER_API_KEY;
    else process.env.OPENROUTER_API_KEY = originalApiKey;
  }
});
