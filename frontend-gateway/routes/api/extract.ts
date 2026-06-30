/// <reference path="../../types/fresh.d.ts" />

import { FreshContext } from "$fresh/server.ts";

export const handler = async (req: Request, _ctx: FreshContext) => {
  if (req.method !== "GET") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
    });
  }

  const urlStr = new URL(req.url).searchParams.get("url");

  if (!urlStr) {
    return new Response(JSON.stringify({ error: "URL is required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const targetUrl = new URL(urlStr);

    // Some sites actively block bot requests, provide basic generic fallback for known tough domains
    const hostname = targetUrl.hostname.toLowerCase();
    const isSocial = hostname.includes("x.com") ||
      hostname.includes("twitter.com") || hostname.includes("linkedin.com");

    const response = await fetch(targetUrl.toString(), {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept":
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5",
      },
    });

    if (!response.ok) {
      if (isSocial) {
        return new Response(
          JSON.stringify({
            title: "Social Media Signal",
            summary: `Content from ${hostname}`,
            image: "",
            source: hostname,
            type: "Post",
          }),
          { status: 200, headers: { "Content-Type": "application/json" } },
        );
      }
      throw new Error(`Failed to fetch: ${response.statusText}`);
    }

    const html = await response.text();

    // Naive HTML parsing via regex (fast for simple metadata)
    const getTagContent = (regex: RegExp) => {
      const match = html.match(regex);
      return match && match[1] ? match[1].trim() : "";
    };

    let title = getTagContent(
      /<meta[^>]*property=["']og:title["'][^>]*content=["'](.*?)["']/i,
    ) ||
      getTagContent(
        /<meta[^>]*name=["']twitter:title["'][^>]*content=["'](.*?)["']/i,
      ) ||
      getTagContent(/<title[^>]*>(.*?)<\/title>/i) ||
      "Unknown Title";

    let summary = getTagContent(
      /<meta[^>]*property=["']og:description["'][^>]*content=["'](.*?)["']/i,
    ) ||
      getTagContent(
        /<meta[^>]*name=["']description["'][^>]*content=["'](.*?)["']/i,
      ) ||
      getTagContent(
        /<meta[^>]*name=["']twitter:description["'][^>]*content=["'](.*?)["']/i,
      ) ||
      `Extracted from ${hostname}`;

    let image = getTagContent(
      /<meta[^>]*property=["']og:image["'][^>]*content=["'](.*?)["']/i,
    ) ||
      getTagContent(
        /<meta[^>]*name=["']twitter:image["'][^>]*content=["'](.*?)["']/i,
      ) ||
      "";

    // Clean up HTML entities in titles and summaries if they exist (naive replace)
    title = title.replace(/&#x27;/g, "'").replace(/&quot;/g, '"').replace(
      /&amp;/g,
      "&",
    );
    summary = summary.replace(/&#x27;/g, "'").replace(/&quot;/g, '"').replace(
      /&amp;/g,
      "&",
    );

    let type = "Article";
    if (isSocial) type = "Post";
    else if (hostname.includes("github.com")) type = "Repository";
    else if (
      hostname.includes("youtube.com") || hostname.includes("vimeo.com")
    ) type = "Video";

    return new Response(
      JSON.stringify({
        title,
        summary,
        image,
        source: hostname,
        type,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    const err = error as Error;
    // Fallback for completely failed fetches
    return new Response(
      JSON.stringify({
        title: "External Artifact",
        summary: `Could not reach link directly: ${err.message}`,
        image: "",
        source: "Unknown",
        type: "Article",
      }),
      {
        status: 200, // Return 200 so the client can still create the artifact gracefully
        headers: { "Content-Type": "application/json" },
      },
    );
  }
};
