export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const target = searchParams.get("url");
    if (!target) return new Response("Missing url", { status: 400 });

    const allow = [
      /^http(s)?:\/\/(192\.168\.2\.\d+)(:\d+)?/i,
      /^http(s)?:\/\/(82\.29\.59\.80)(:\d+)?/i,
      /^http(s)?:\/\/(comercial\.techto\.com\.br)/i,
    ];
    if (!allow.some((r) => r.test(target))) {
      return new Response("Blocked by allowlist", { status: 403 });
    }

    const upstream = await fetch(target, { redirect: "follow" });
    const contentType = upstream.headers.get("content-type") || "";

    if (!contentType.includes("text/html")) {
      const blob = await upstream.arrayBuffer();
      return new Response(blob, {
        headers: { "content-type": contentType },
      });
    }

    let html = await upstream.text();

    const baseTag = `<base href="${target}">`;
    if (/<head[^>]*>/i.test(html)) {
      html = html.replace(/<head([^>]*)>/i, `<head$1>${baseTag}`);
    } else {
      html = `${baseTag}${html}`;
    }

    html = html
      .replace(/<meta[^>]+http-equiv=["']x-frame-options["'][^>]*>/gi, "")
      .replace(/<meta[^>]+http-equiv=["']content-security-policy["'][^>]*>/gi, "");

    return new Response(html, {
      headers: {
        "content-type": "text/html; charset=utf-8",
      
      },
    });
  } catch (err) {
    return new Response(`Proxy error: ${err?.message || err}`, { status: 500 });
  }
}