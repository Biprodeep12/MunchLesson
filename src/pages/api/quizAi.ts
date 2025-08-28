import { NextApiRequest, NextApiResponse } from 'next';

const API_KEY = process.env.NEXT_PUBLIC_API_FEED_KEY;
const API_URL = 'https://openrouter.ai/api/v1/chat/completions';

type OptionKey = 'A' | 'B' | 'C' | 'D';
type Options = Record<OptionKey, string>;

interface QuizQuestion {
  question: string;
  options: Options;
  correctAnswer: OptionKey;
  feedback: string;
}

interface QuizData {
  topic: string;
  questions: QuizQuestion[];
}

function isOptionKey(value: string): value is OptionKey {
  return ['A', 'B', 'C', 'D'].includes(value);
}

function isOptions(obj: unknown): obj is Options {
  if (typeof obj !== 'object' || obj === null) return false;

  const options = obj as Record<string, unknown>;
  return (
    typeof options.A === 'string' &&
    typeof options.B === 'string' &&
    typeof options.C === 'string' &&
    typeof options.D === 'string'
  );
}

function isQuizQuestion(obj: unknown): obj is QuizQuestion {
  if (typeof obj !== 'object' || obj === null) return false;

  const question = obj as Record<string, unknown>;
  return (
    typeof question.question === 'string' &&
    isOptions(question.options) &&
    typeof question.correctAnswer === 'string' &&
    isOptionKey(question.correctAnswer) &&
    typeof question.feedback === 'string'
  );
}

function isQuizData(obj: unknown): obj is QuizData {
  if (typeof obj !== 'object' || obj === null) return false;

  const quiz = obj as Record<string, unknown>;
  if (typeof quiz.topic !== 'string') return false;

  if (!Array.isArray(quiz.questions)) return false;
  if (quiz.questions.length !== 10) return false;

  return quiz.questions.every(isQuizQuestion);
}

function repairJson(jsonString: string): string {
  let repaired = jsonString
    .replace(/```json/g, '')
    .replace(/```/g, '')
    .trim();

  repaired = repaired.replace(
    /([{,]\s*)([A-Za-z_][A-Za-z0-9_]*)(\s*:)/g,
    '$1"$2"$3',
  );
  repaired = repaired.replace(/'/g, '"');
  repaired = repaired.replace(/,\s*([}\]])/g, '$1');

  return repaired;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<QuizData | { error: string; details?: string }>,
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { topic } = req.body;
    if (typeof topic !== 'string' || !topic.trim()) {
      return res
        .status(400)
        .json({ error: 'Topic is required and must be a string' });
    }

    console.log(`📡 Generating quiz for topic: ${topic}`);

    const systemPrompt = `You are a quiz generator. You MUST respond with ONLY a valid JSON object that strictly follows this exact structure:

{
  "topic": "Quiz Topic",
  "questions": [
    {
      "question": "Question text?",
      "options": {
        "A": "Option A text",
        "B": "Option B text",
        "C": "Option C text",
        "D": "Option D text"
      },
      "correctAnswer": "A",
      "feedback": "Short explanation of why this answer is correct and others are not"
    },
    {
      "question": "Question text?",
      "options": {
        "A": "Option A text",
        "B": "Option B text",
        "C": "Option C text",
        "D": "Option D text"
      },
      "correctAnswer": "B",
      "feedback": "Short explanation of why this answer is correct and others are not"
    }
    ... up to 10 questions total
  ]
}

STRICT RULES:
1. Respond with ONLY the JSON object. Do not include markdown, code blocks, or text outside JSON.
2. All strings MUST use double quotes.
3. There MUST be exactly 10 questions in the "questions" array.
4. Each "correctAnswer" MUST be one of "A", "B", "C", or "D".
5. Every question MUST include a "feedback" field.
6. Do NOT include comments inside the JSON.".`;

    let retries = 0;
    const maxRetries = 2;
    let quizData: QuizData | null = null;

    while (retries <= maxRetries && !quizData) {
      try {
        const response = await fetch(API_URL, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'openai/gpt-oss-20b:free',
            messages: [
              {
                role: 'system',
                content: systemPrompt,
              },
              {
                role: 'user',
                content: `Create a 10-question multiple-choice quiz about "${topic}". Respond with ONLY the JSON object.`,
              },
            ],
            response_format: { type: 'json_object' },
            max_tokens: 1500,
            temperature: 0.3,
          }),
        });

        if (!response.ok) {
          throw new Error(`API request failed with status ${response.status}`);
        }

        const data = await response.json();
        const rawContent = data.choices?.[0]?.message?.content?.trim();

        if (!rawContent) {
          throw new Error('Empty response from AI');
        }

        console.log('🔹 Raw AI Response:', rawContent);

        let parsed: unknown;
        try {
          parsed = JSON.parse(rawContent);
        } catch (e) {
          const repaired = repairJson(rawContent);
          console.log('🔹 Attempting to repair JSON:', repaired, e);
          parsed = JSON.parse(repaired);
        }

        if (isQuizData(parsed)) {
          quizData = parsed;
        } else {
          throw new Error('Response did not match expected quiz format');
        }
      } catch (error) {
        console.error(`❌ Attempt ${retries + 1} failed:`, error);
        if (retries >= maxRetries) {
          throw error;
        }
        retries++;
      }
    }

    if (!quizData) {
      throw new Error('Failed to generate valid quiz after retries');
    }

    return res.status(200).json(quizData);
  } catch (error) {
    console.error('❌ Final Error:', error);
    return res.status(500).json({
      error: 'Failed to generate quiz',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
