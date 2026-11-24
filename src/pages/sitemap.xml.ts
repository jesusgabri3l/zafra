import type { APIRoute } from 'astro';

export const prerender = true;

export const GET: APIRoute = () => {
  const base = import.meta.env.BASE_URL.replace(/\/?$/, '/');
  const origin = import.meta.env.SITE?.replace(/\/?$/, '') ?? '';
  const loc = `${origin}${base}`;
  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>${loc}</loc></url>
</urlset>`;
  return new Response(body, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
};