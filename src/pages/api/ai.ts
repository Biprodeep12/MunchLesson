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
        model: 'deepseek/deepseek-r1-0528:free',
        messages: [
          {
            role: 'system',
            content: `You are StudyBuddy AI, an intelligent and friendly AI tutor designed to help students learn effectively. Your goal is to provide clear, concise explanations and brief responses to support fast learning.

Key Responsibilities:
- Offer quick, subject-specific help in Math, Science, Literature, History, and more.
- Give step-by-step guidance in a brief, to-the-point manner.
- Use short study tips like mnemonics, summaries, or key points.
- Keep answers under 3-4 sentences unless asked for more detail.
- Encourage learning with positivity and clarity.

IMPORTANT:Respond in English only Maintain an encouraging tone, and always redirect back to academic topics if off-subject.`,
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
