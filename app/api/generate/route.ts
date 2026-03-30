import Anthropic from '@anthropic-ai/sdk';
import { SYSTEM_PROMPT } from '@/lib/system-prompt';
import { GenerateRequest } from '@/lib/types';

export const maxDuration = 60;

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

    const stream = anthropic.messages.stream({
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

    const encoder = new TextEncoder();

    const readable = new ReadableStream({
      async start(controller) {
        try {
          let fullText = '';

          stream.on('text', (text) => {
            fullText += text;
            // Send a heartbeat to keep the connection alive
            controller.enqueue(encoder.encode(' '));
          });

          const finalMessage = await stream.finalMessage();

          const textBlock = finalMessage.content.find((block) => block.type === 'text');
          if (!textBlock || textBlock.type !== 'text') {
            controller.enqueue(
              encoder.encode(JSON.stringify({ error: 'No text response from Claude' }))
            );
            controller.close();
            return;
          }

          let jsonText = textBlock.text.trim();
          if (jsonText.startsWith('```')) {
            jsonText = jsonText.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
          }

          const concepts = JSON.parse(jsonText);
          // Clear the heartbeat spaces and send real data
          controller.enqueue(
            encoder.encode('\n' + JSON.stringify({ concepts }))
          );
          controller.close();
        } catch (err) {
          const message = err instanceof Error ? err.message : 'Unknown error';
          controller.enqueue(
            encoder.encode('\n' + JSON.stringify({ error: message }))
          );
          controller.close();
        }
      },
    });

    return new Response(readable, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Transfer-Encoding': 'chunked',
      },
    });
  } catch (error) {
    console.error('Generate error:', error);
    const message =
      error instanceof Error ? error.message : 'Unknown error occurred';
    return Response.json({ error: message }, { status: 500 });
  }
}
