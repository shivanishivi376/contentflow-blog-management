import { isOpenRouterConfigured, queryOpenRouter } from '../integrations/openrouter/openrouterClient.js';
import AppError from '../utils/AppError.js';

/**
 * Clean and format AI response to ensure pure HTML suitable for rich text editors (TipTap / Quill)
 */
export const formatAIHtmlOutput = (rawOutput) => {
  if (!rawOutput) return '';

  let text = rawOutput.trim();

  // 1. Remove <think> ... </think> or <thought> ... </thought> tags (common in reasoning models)
  text = text.replace(/<think>[\s\S]*?<\/think>/gi, '');
  text = text.replace(/<thought>[\s\S]*?<\/thought>/gi, '');

  // 2. Extract content from code block if the LLM wrapped response in markdown fences
  const codeBlockMatch = text.match(/```(?:html|xml|markdown)?\s*([\s\S]*?)```/i);
  if (codeBlockMatch && codeBlockMatch[1].trim()) {
    text = codeBlockMatch[1].trim();
  } else {
    // Remove standalone fences
    text = text.replace(/```(?:html|xml|markdown)?/gi, '').replace(/```/g, '').trim();
  }

  text = text.replace(
    /(?:^|\n)\s*(?:Wait,\s*let me re-read(?: carefully)?|Identify the Core Challenge|Internal (?:analysis|notes)|Planning notes?)\s*:?[^\n]*[\s\S]*$/i,
    ''
  );
  text = text.replace(
    /<p\b[^>]*>\s*(?:Ref ID|Variation Ref)\s*:[\s\S]*?<\/p>/gi,
    ''
  );
  text = text.replace(/(?:^|\n)\s*(?:[-*]\s*)?(?:Ref ID|Variation Ref)\s*:\s*[^\n]*/gi, '');

  // 3. Remove outer HTML document wrappers (e.g. <!DOCTYPE...>, <html>, <body>, <article>)
  text = text.replace(/<!DOCTYPE[^>]*>/gi, '')
             .replace(/<\/?(?:html|body|article|header|head|meta|title)[^>]*>/gi, '')
             .trim();

  // 4. Extract content after explicit section markers if present
  const lastDraftMatch = text.match(/(?:Final (?:Output|Article|Response)|Blog Post|Revised [Dd]raft|Draft):\s*\n*([\s\S]*)/i);
  if (lastDraftMatch && lastDraftMatch[1].trim()) {
    text = lastDraftMatch[1].trim();
  }

  // 5. Strip top reasoning/thinking lines if present before actual article starts
  const lines = text.split('\n');
  let firstArticleLineIndex = -1;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line.includes('`')) continue;

    const htmlHeading = line.match(/^<h[1-6][^>]*>(.*?)<\/h[1-6]>/i)?.[1]
      ?.replace(/<[^>]*>/g, '')
      .trim();
    const markdownHeading = line.match(/^#{1-6}\s+(.+)$/)?.[1]?.trim();
    const headingText = htmlHeading || markdownHeading;
    if (/^(?:article\s+)?title$/i.test(headingText || '')) continue;

    if (/^<h[1-6][^>]*>/i.test(line) || /^#{1-6}\s+/i.test(line) || /^<p>(?!\s*(?:\d+\.|\*|Analyze|Thinking|Draft:))/i.test(line)) {
      firstArticleLineIndex = i;
      break;
    }
  }

  if (firstArticleLineIndex > 0) {
    text = lines.slice(firstArticleLineIndex).join('\n').trim();
  }

  // 6. Strip trailing word count analysis / mental checks if the LLM appended them
  text = text.replace(/(?:<p>|\n)\s*(?:Now count words|Word Count Check|Let's count words|Word count roughly)[\s\S]*/i, '').trim();

  // 7. Remove conversational intro lines
  text = text.replace(/^(?:Here's|Here is|Sure,|Certainly,|Below is|I've generated)[^\n]*\n+/gi, '').trim();

  // 8. Convert Markdown to HTML
  text = text.replace(/^### (.*)$/gm, '<h3>$1</h3>');
  text = text.replace(/^## (.*)$/gm, '<h2>$1</h2>');
  text = text.replace(/^# (.*)$/gm, '<h1>$1</h1>');

  text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  text = text.replace(/__(.*?)__/g, '<strong>$1</strong>');
  text = text.replace(/\*(.*?)\*/g, '<em>$1</em>');
  text = text.replace(/_(.*?)_/g, '<em>$1</em>');

  // Convert markdown lists (- item, * item, 1. item) into <ul> / <ol>
  text = text.replace(/(?:^(?:[-*]|\d+\.) .*(?:\n|$))+/gm, (listBlock) => {
    const items = listBlock.trim().split('\n').map(line => line.replace(/^(?:[-*]|\d+\.)\s*/, '').trim()).filter(Boolean);
    const liItems = items.map(item => `  <li>${item}</li>`).join('\n');
    return `<ul>\n${liItems}\n</ul>`;
  });

  // 9. Format Paragraphs & Normalize Block Structure
  const blocks = text.split(/\n\s*\n/);
  const formattedBlocks = blocks.map((block) => {
    const trimmed = block.trim();
    if (!trimmed) return '';
    if (/^<(h[1-6]|p|ul|ol|blockquote|div|section)[^>]*>/i.test(trimmed)) {
      return trimmed;
    }
    return `<p>${trimmed.replace(/\n/g, '<br/>')}</p>`;
  });

  return formattedBlocks.filter(Boolean).join('\n\n');
};

export const generateAIContent = async ({ topic, context = '', tone = 'informative', length = 'medium' }) => {
  if (isOpenRouterConfigured()) {
    const lengthMap = {
      short: 'approx 200 words',
      medium: 'approx 450 words',
      long: 'approx 800 words'
    };
    const targetLength = lengthMap[length] || lengthMap.medium;

    const prompt = `Write a fresh, unique, and engaging blog post article about: "${topic}".
Context/Additional details: ${context || 'None'}
Desired Tone: ${tone} (Ensure the writing style strictly matches a ${tone} tone)
Target Length: ${targetLength}

CRITICAL INSTRUCTIONS:
- Write a well-structured article specifically tailored to the topic "${topic}" and context provided.
- Start directly with a main title heading: <h3>Title</h3>
- Format using clean HTML paragraph tags <p>, subheadings <h3>, and bullet lists <ul><li>.
- Do NOT include any reasoning steps, thinking logs, planning notes, or intro text like "Here is your article".
- Do NOT repeat these instructions or include identifiers, reference numbers, analysis, or commentary.
- Do NOT wrap in markdown code blocks (\`\`\`html). Output raw HTML markup directly.
`;

    const rawHtml = await queryOpenRouter({
      prompt,
      systemPrompt: 'You are an expert blog author and content creator. Return only the finished article as clean HTML. Never reveal internal analysis, repeat the request, include reference IDs, add commentary, or use markdown code fences.',
      temperature: 0.75,
      maxTokens: 2000,
    });

    const cleanHtml = formatAIHtmlOutput(rawHtml);
    const title = cleanHtml.match(/<h[1-6]\b[^>]*>([\s\S]*?)<\/h[1-6]>/i)?.[1]
      ?.replace(/<[^>]*>/g, '')
      .trim();
    if (
      !title ||
      /^(?:article\s+)?title$/i.test(title) ||
      !/<p\b[^>]*>[\s\S]*?<\/p>/i.test(cleanHtml)
    ) {
      throw new AppError(
        'The AI could not create a complete article. Please try again.',
        502,
        'AI_INVALID_RESPONSE'
      );
    }
    return { result: cleanHtml, isMock: false };
  }

  // Fallback template for local testing when API key is missing
  const fallbackHtml = `
    <h3>Introduction to ${topic}</h3>
    <p>In today's fast-evolving landscape, understanding <strong>${topic}</strong> is essential for professionals and enthusiasts alike.</p>
    <h3>Key Insights & Takeaways</h3>
    <p>${context || `Exploring the core concepts behind ${topic} provides valuable insights into industry best practices.`}</p>
    <ul>
      <li>Comprehensive breakdown of ${topic} fundamentals.</li>
      <li>Practical application strategies for real-world scenarios.</li>
      <li>Future outlook and trend analysis.</li>
    </ul>
    <h3>Conclusion</h3>
    <p>By leveraging these principles of ${topic}, teams can achieve sustainable success and innovation.</p>
  `;

  return { result: formatAIHtmlOutput(fallbackHtml), isMock: true };
};

export const improveAIText = async ({ text, action = 'improve', tone = 'professional' }) => {
  if (isOpenRouterConfigured()) {
    const uniqueNonce = Math.floor(Math.random() * 1000000);
    const prompt = `Perform action "${action}" with tone "${tone}" on the following text:

"${text}"

Return ONLY the improved text snippet formatted in clean HTML.
Do NOT include reasoning steps, markdown code blocks, or intro commentary.
(Variation Ref: ${uniqueNonce})`;

    const rawImproved = await queryOpenRouter({
      prompt,
      systemPrompt: 'You are an expert copy editor. Return ONLY clean HTML revised text.',
      temperature: 0.7,
      maxTokens: 1500,
    });

    const cleanImproved = formatAIHtmlOutput(rawImproved);
    return { result: cleanImproved, isMock: false };
  }

  // Fallback mock responses
  let result = text;
  if (action === 'expand') {
    result = `<p>${text}</p><p>Furthermore, taking a deeper look reveals additional nuances that significantly impact performance, optimization, and team collaboration.</p>`;
  } else if (action === 'shorten') {
    result = `<p>${text.slice(0, Math.floor(text.length * 0.6))}...</p>`;
  } else if (action === 'rewrite' || action === 'improve') {
    result = `<p>${text.replace(/([.!?])/g, '$1 In addition, this enhances overall clarity and readability.')}</p>`;
  } else {
    result = `<p>${text}</p>`;
  }

  return { result: formatAIHtmlOutput(result), isMock: true };
};

export const generateAIMetadata = async ({ title, content = '' }) => {
  if (isOpenRouterConfigured()) {
    const uniqueNonce = Math.floor(Math.random() * 1000000);
    const prompt = `For the article title "${title}" and content preview: "${content.slice(0, 300)}":
Provide:
1. An optimized Meta Title (under 60 chars)
2. An engaging Meta Description (under 155 chars)
3. 3 suggested alternative blog titles

Format output strictly as valid JSON:
{
  "metaTitle": "...",
  "metaDescription": "...",
  "suggestedTitles": ["...", "...", "..."]
}
(Variation Ref: ${uniqueNonce})`;

    const rawJson = await queryOpenRouter({ prompt, maxTokens: 500, temperature: 0.7 });

    try {
      const cleanJson = rawJson.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleanJson);
      return { ...parsed, isMock: false };
    } catch {
      // Fallback if parsing failed
    }
  }

  const cleanTitle = title || 'Blog Article';
  return {
    metaTitle: `${cleanTitle} | Expert Guide`,
    metaDescription: `Read our comprehensive guide on ${cleanTitle}. Learn key insights, strategies, and best practices.`,
    suggestedTitles: [
      `Mastering ${cleanTitle}: Complete Handbook`,
      `Why ${cleanTitle} Matters for Your Team`,
      `The Ultimate Guide to ${cleanTitle}`
    ],
    isMock: true
  };
};
