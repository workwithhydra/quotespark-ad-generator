import { toPng } from 'html-to-image';

export async function exportAdAsPng(
  elementId: string,
  filename: string
): Promise<void> {
  const element = document.getElementById(elementId);
  if (!element) {
    throw new Error(`Element with id "${elementId}" not found`);
  }

  // Wait for fonts to be ready
  await document.fonts.ready;

  const width = parseInt(element.style.width);
  const height = parseInt(element.style.height);

  // First pass to warm up (html-to-image sometimes misses fonts on first render)
  await toPng(element, { width, height, pixelRatio: 1, skipAutoScale: true });

  // Second pass for actual export
  const dataUrl = await toPng(element, {
    width,
    height,
    pixelRatio: 1,
    skipAutoScale: true,
    cacheBust: true,
  });

  const link = document.createElement('a');
  link.download = `${filename}.png`;
  link.href = dataUrl;
  link.click();
}
