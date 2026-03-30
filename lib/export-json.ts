import { GeminiPrompt } from './types';

export async function copyGeminiJson(geminiJson: GeminiPrompt): Promise<void> {
  const jsonString = JSON.stringify(geminiJson, null, 2);
  await navigator.clipboard.writeText(jsonString);
}
