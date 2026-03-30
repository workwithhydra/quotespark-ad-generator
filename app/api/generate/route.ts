import Anthropic from '@anthropic-ai/sdk';
import { SYSTEM_PROMPT } from '@/lib/system-prompt';
import { AdConcept, GenerateRequest } from '@/lib/types';

export const maxDuration = 30;

export async function POST(request: Request) {
  try {
    if (!process.env.ANTHROPIC_API_KEY) {
      return Response.json(
        { error: 'ANTHROPIC_API_KEY is not set. Add it in Vercel project settings → Environment Variables, then redeploy.' },
        { status: 500 }
      );
    }

    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });
    const body: GenerateRequest = await request.json();
    const { angleFocus, proofPoints, conceptCount = 5 } = body;

    let userMessage = `Generate ${conceptCount} ad concepts for QuoteSpark.`;

    if (angleFocus) {
      userMessage += ` Focus on this angle: ${angleFocus}.`;
    } else {
      userMessage += ` Diversify across different angles.`;
    }

    if (proofPoints) {
      userMessage += ` Use these proof points: ${proofPoints}`;
    }

    userMessage += ` Return exactly ${conceptCount} concepts as a JSON array.`;

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 8192,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: userMessage,
        },
      ],
    });

    const textBlock = message.content.find((block) => block.type === 'text');
    if (!textBlock || textBlock.type !== 'text') {
      return Response.json(
        { error: 'No text response from Claude' },
        { status: 500 }
      );
    }

    let jsonText = textBlock.text.trim();

    // Strip markdown code fences if present
    if (jsonText.startsWith('```')) {
      jsonText = jsonText.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
    }

    const concepts: AdConcept[] = JSON.parse(jsonText);

    return Response.json({ concepts });
  } catch (error) {
    console.error('Generate error:', error);
    const message =
      error instanceof Error ? error.message : 'Unknown error occurred';
    return Response.json({ error: message }, { status: 500 });
  }
}
