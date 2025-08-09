// api/dl.js
export const config = { runtime: 'edge' };

export default async function handler(req) {
  const { searchParams } = new URL(req.url);
  const src = searchParams.get('src');
  const filename = (searchParams.get('filename') || 'media').replace(/[^a-z0-9._-]+/gi, '_');
  const asAttachment = (searchParams.get('attachment') ?? '1') === '1';
  const origin = req.headers.get('origin') || '*';

  if (!src) return plain('Missing src', 400, origin);

  try {
    const upstream = await fetch(src, { redirect: 'follow' });
    if (!upstream.ok) return plain('Upstream error: ' + upstream.status, 502, origin);

    const headers = new Headers(upstream.headers);
    headers.set('Access-Control-Allow-Origin', origin);
    headers.set('Vary', 'Origin');
    const ct = headers.get('content-type') || 'application/octet-stream';
    headers.set('content-type', ct);

    if (asAttachment) {
      headers.set('content-disposition', `attachment; filename="${filename}"`);
    }
    // hapus header yang sering bentrok
    headers.delete('content-security-policy');
    headers.delete('content-security-policy-report-only');
    headers.delete('clear-site-data');

    return new Response(upstream.body, { status: 200, headers });
  } catch (e) {
    return plain('Proxy fetch failed', 502, origin);
  }
}

function cors(origin) {
  return {
    'Access-Control-Allow-Origin': origin,
    'Vary': 'Origin',
    'Access-Control-Allow-Methods': 'GET,HEAD,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type,Authorization'
  };
}
function plain(text, code, origin) {
  return new Response(text, { status: code, headers: cors(origin) });
}
