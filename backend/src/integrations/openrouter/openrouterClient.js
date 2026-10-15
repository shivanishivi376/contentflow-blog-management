import AppError from '../../utils/AppError.js';

const DEFAULT_OPENROUTER_MODEL = 'google/gemma-4-31b-it:free';

export const isOpenRouterConfigured = () => Boolean(process.env.OPENROUTER_API_KEY);

const getUserFriendlyProviderError = (status, providerMessage = '') => {
  if (
    status === 400 &&
    /not a valid model|model.*not found|invalid model/i.test(providerMessage)
  ) {
    return 'Our AI writing assistant is temporarily unavailable. Please try again shortly.';
  }

  if (status === 401 || status === 403 || status === 402 || status === 404) {
    return 'Our AI writing assistant is temporarily unavailable. Please try again later.';
  }

  if (status === 429) {
    return 'The AI writing assistant is busy right now. Please wait a moment and try again.';
  }

  return 'We could not reach the AI writing service. Please try again in a moment.';
};

export const toOpenRouterAppError = (status, providerMessage = '') =>
  new AppError(
    getUserFriendlyProviderError(status, providerMessage),
    status === 429 ? 429 : 503,
    status === 429 ? 'AI_RATE_LIMITED' : 'AI_SERVICE_UNAVAILABLE'
  );

export const queryOpenRouter = async ({
  prompt,
  systemPrompt,
  model: modelOverride,
  maxTokens = 2000,
  temperature = 0.7,
}) => {
  // Fetch API key and model dynamically from environment variables
  const apiKey = process.env.OPENROUTER_API_KEY;
  const targetModel = modelOverride || process.env.OPENROUTER_MODEL || DEFAULT_OPENROUTER_MODEL;

  if (!apiKey) {
    throw toOpenRouterAppError(503);
  }

  let response;
  try {
    response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'HTTP-Referer': 'http://localhost:5173',
      'X-Title': 'Content Flow',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: targetModel,
      temperature,
      messages: [
        ...(systemPrompt ? [{ role: 'system', content: systemPrompt }] : []),
        { role: 'user', content: prompt },
      ],
      max_tokens: maxTokens,
    }),
    });
  } catch {
    throw toOpenRouterAppError(0);
  }

  if (!response.ok) {
    let providerMessage = '';
    try {
      const errorBody = await response.json();
      providerMessage = String(errorBody?.error?.message || '');
    } catch {
      providerMessage = '';
    }
    throw toOpenRouterAppError(response.status, providerMessage);
  }

  try {
    const data = await response.json();
    const text = data.choices?.[0]?.message?.content?.trim();
    if (!text) {
      throw toOpenRouterAppError(502);
    }
    return text;
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw toOpenRouterAppError(502);
  }
};
