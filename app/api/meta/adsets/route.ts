export const maxDuration = 30;

export async function POST(request: Request) {
  try {
    const { campaign_id, access_token } = await request.json();
    if (!campaign_id || !access_token) {
      return Response.json({ error: 'Missing campaign_id or access_token' }, { status: 400 });
    }

    const res = await fetch(
      `https://graph.facebook.com/v21.0/${campaign_id}/adsets?fields=id,name,status,daily_budget,lifetime_budget&limit=50&access_token=${encodeURIComponent(access_token)}`
    );
    const data = await res.json();

    if (data.error) {
      return Response.json({ error: data.error.message }, { status: 400 });
    }

    return Response.json({ adsets: data.data ?? [] });
  } catch (err) {
    return Response.json({ error: err instanceof Error ? err.message : 'Unknown error' }, { status: 500 });
  }
}
