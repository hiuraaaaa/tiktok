// api/tikwm.js
export const config = { runtime: 'edge' };

export default async function handler(req) {
  const { searchParams } = new URL(req.url);
  const tiktokUrl = searchParams.get('url');
  const origin = req.headers.get('origin') || '*';

  if (!tiktokUrl) {
    return json({ status: false, message: 'Missing url' }, 400, origin);
  }

  const upstream = 'https://api.nekorinn.my.id/downloader/tikwm?url=' + encodeURIComponent(tiktokUrl);

  try {
    const resp = await fetch(upstream, { redirect: 'follow' });
    const text = await resp.text(); // aman walau content-type tidak pas
    return new Response(text, {
      status: resp.status,
      headers: cors(origin, resp.headers.get('content-type') || 'application/json')
    });
  } catch (e) {
    return json({ status: false, message: 'Upstream fetch failed' }, 502, origin);
  }
}

function cors(origin, type) {
  return {
    'content-type': type,
    'Access-Control-Allow-Origin': origin,
    'Vary': 'Origin',
    'Access-Control-Allow-Methods': 'GET,HEAD,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type,Authorization'
  };
}
function json(obj, code, origin) {
  return new Response(JSON.stringify(obj), { status: code, headers: cors(origin, 'application/json') });
}
