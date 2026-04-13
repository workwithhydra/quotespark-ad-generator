export const maxDuration = 30;

export async function POST(request: Request) {
  try {
    const { account_id, access_token } = await request.json();
    if (!account_id || !access_token) {
      return Response.json({ error: 'Missing account_id or access_token' }, { status: 400 });
    }

    const accountId = account_id.startsWith('act_') ? account_id : `act_${account_id}`;

    const res = await fetch(
      `https://graph.facebook.com/v21.0/${accountId}/campaigns?fields=id,name,status,objective&limit=50&access_token=${encodeURIComponent(access_token)}`
    );
    const data = await res.json();

    if (data.error) {
      return Response.json({ error: data.error.message }, { status: 400 });
    }

    return Response.json({ campaigns: data.data ?? [] });
  } catch (err) {
    return Response.json({ error: err instanceof Error ? err.message : 'Unknown error' }, { status: 500 });
  }
}
