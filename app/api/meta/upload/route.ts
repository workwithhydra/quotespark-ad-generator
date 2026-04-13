export const maxDuration = 60;

interface ImageInput {
  name: string;
  base64: string;
}

interface UploadResult {
  name: string;
  success: boolean;
  hash?: string;
  url?: string;
  error?: string;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { ad_account_id, access_token, images } = body as {
      ad_account_id: string;
      access_token: string;
      images: ImageInput[];
    };

    if (!ad_account_id || !access_token || !images?.length) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Normalize account ID — ensure it starts with act_
    const accountId = ad_account_id.startsWith('act_')
      ? ad_account_id
      : `act_${ad_account_id}`;

    const results: UploadResult[] = [];

    for (const image of images) {
      try {
        const filename = `${image.name}-${Date.now()}.png`;

        // Build multipart form — Meta expects image as a named file field
        const formData = new FormData();
        const buffer = Buffer.from(image.base64, 'base64');
        const blob = new Blob([buffer], { type: 'image/png' });
        formData.append(filename, blob, filename);
        formData.append('access_token', access_token);

        const res = await fetch(
          `https://graph.facebook.com/v21.0/${accountId}/adimages`,
          { method: 'POST', body: formData }
        );

        const data = await res.json();

        if (!res.ok || data.error) {
          const errMsg = data.error?.message || `HTTP ${res.status}`;
          results.push({ name: image.name, success: false, error: errMsg });
          continue;
        }

        // Meta returns: { images: { "<filename>": { hash, url, width, height } } }
        const imageData = data.images?.[filename];
        if (!imageData) {
          results.push({ name: image.name, success: false, error: 'No image data returned' });
          continue;
        }

        results.push({
          name: image.name,
          success: true,
          hash: imageData.hash,
          url: imageData.url,
        });
      } catch (err) {
        const errMsg = err instanceof Error ? err.message : 'Unknown error';
        results.push({ name: image.name, success: false, error: errMsg });
      }
    }

    return Response.json({ results });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return Response.json({ error: message }, { status: 500 });
  }
}
