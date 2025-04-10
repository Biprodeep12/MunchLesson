import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { messages } = req.body;

    const API_KEY = process.env.NEXT_PUBLIC_API_KEY;
    const API_URL = 'https://openrouter.ai/api/v1/chat/completions';

    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemma-3-1b-it:free',
        messages: [
          {
            role: 'system',
            content: `You are StudyBuddy AI, an intelligent and friendly AI tutor designed to help students learn effectively.
Your goal is to provide clear explanations, step-by-step problem-solving guidance, and engaging study strategies.

Key Responsibilities:
- Offer subject-specific help in Math, Science, Literature, History, and more.
- Assist with problem-solving, concept explanations, and study techniques.
- Encourage active learning with quizzes, mnemonics, and spaced repetition.
- Keep responses concise and engaging, avoiding unnecessary complexity.
- If a topic requires external resources, suggest helpful websites or books.

IMPORTANT: Keep a positive and encouraging tone, ensuring that students feel motivated to continue learning. If a question is outside academic subjects, politely redirect the user towards relevant educational topics.`,
          },
          ...messages,
        ],
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch AI response');
    }

    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    console.error('API error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
