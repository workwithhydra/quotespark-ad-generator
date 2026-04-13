export const maxDuration = 120;

interface AdInput {
  name: string;
  base64: string;
  headline: string;
  body: string;
}

interface AdResult {
  name: string;
  success: boolean;
  ad_id?: string;
  creative_id?: string;
  image_hash?: string;
  error?: string;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      ad_account_id,
      access_token,
      facebook_page_id,
      landing_page_url,
      adset_id,
      ads,
    } = body as {
      ad_account_id: string;
      access_token: string;
      facebook_page_id: string;
      landing_page_url: string;
      adset_id: string;
      ads: AdInput[];
    };

    if (!ad_account_id || !access_token || !facebook_page_id || !landing_page_url || !adset_id || !ads?.length) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const accountId = ad_account_id.startsWith('act_') ? ad_account_id : `act_${ad_account_id}`;
    const results: AdResult[] = [];

    for (const ad of ads) {
      try {
        const filename = `${ad.name}-${Date.now()}.png`;

        // Step 1: Upload image
        const imageForm = new FormData();
        const buffer = Buffer.from(ad.base64, 'base64');
        const blob = new Blob([buffer], { type: 'image/png' });
        imageForm.append(filename, blob, filename);
        imageForm.append('access_token', access_token);

        const imgRes = await fetch(
          `https://graph.facebook.com/v21.0/${accountId}/adimages`,
          { method: 'POST', body: imageForm }
        );
        const imgData = await imgRes.json();

        if (imgData.error) throw new Error(`Image upload: ${imgData.error.message}`);

        const imageHash = imgData.images?.[filename]?.hash;
        if (!imageHash) throw new Error('No image hash returned from Meta');

        // Step 2: Create ad creative
        const creativeRes = await fetch(
          `https://graph.facebook.com/v21.0/${accountId}/adcreatives`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              name: ad.name,
              object_story_spec: {
                page_id: facebook_page_id,
                link_data: {
                  image_hash: imageHash,
                  link: landing_page_url,
                  message: ad.body,
                  name: ad.headline,
                },
              },
              access_token,
            }),
          }
        );
        const creativeData = await creativeRes.json();

        if (creativeData.error) throw new Error(`Creative: ${creativeData.error.message}`);
        const creativeId = creativeData.id;

        // Step 3: Create ad (PAUSED — user activates manually)
        const adRes = await fetch(
          `https://graph.facebook.com/v21.0/${accountId}/ads`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              name: ad.name,
              adset_id: adset_id,
              creative: { creative_id: creativeId },
              status: 'PAUSED',
              access_token,
            }),
          }
        );
        const adData = await adRes.json();

        if (adData.error) throw new Error(`Ad creation: ${adData.error.message}`);

        results.push({
          name: ad.name,
          success: true,
          ad_id: adData.id,
          creative_id: creativeId,
          image_hash: imageHash,
        });
      } catch (err) {
        results.push({
          name: ad.name,
          success: false,
          error: err instanceof Error ? err.message : 'Unknown error',
        });
      }
    }

    return Response.json({ results });
  } catch (err) {
    return Response.json({ error: err instanceof Error ? err.message : 'Unknown error' }, { status: 500 });
  }
}
