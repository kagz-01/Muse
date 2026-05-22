interface LinkParseResult {
  title: string;
  description: string;
  image?: string;
  url: string;
  source: string;
  favicon?: string;
  type: "article" | "image" | "video" | "document" | "unknown";
}

// Mock link parser - in production, would use a library like metascraper or open-graph-scraper
const parseLinkMetadata = async (url: string): Promise<LinkParseResult> => {
  try {
    const urlObj = new URL(url);
    const domain = urlObj.hostname;

    // Mock responses for common domains for demo
    const mockResponses: Record<string, LinkParseResult> = {
      "github.com": {
        title: "GitHub: The Complete Developer Platform",
        description:
          "GitHub is the complete developer platform to build, scale, and deliver secure software.",
        url,
        source: domain,
        type: "article",
        image: "https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png",
      },
      "medium.com": {
        title: "Medium – Where good ideas find you.",
        description:
          "Take part in our community of millions of writers. Read, write, and share stories that matter.",
        url,
        source: domain,
        type: "article",
      },
      "youtube.com": {
        title: "YouTube",
        description:
          "Enjoy the videos and music you love, upload original content, and share it all with friends.",
        url,
        source: domain,
        type: "video",
      },
      "twitter.com": {
        title: "X. It's what's happening",
        description: "From breaking news and entertainment to sports and politics.",
        url,
        source: domain,
        type: "article",
      },
    };

    // Check if domain matches any mock
    for (const [mockDomain, response] of Object.entries(mockResponses)) {
      if (domain.includes(mockDomain)) {
        return response;
      }
    }

    // Generic fallback for unknown URLs
    return {
      title: urlObj.hostname,
      description: "Link content",
      url,
      source: domain,
      type: "unknown",
    };
  } catch (err) {
    throw new Error("Invalid URL provided");
  }
};

export const handler = async (req: Request) => {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
    });
  }

  try {
    const { url } = await req.json();

    if (!url) {
      return new Response(JSON.stringify({ error: "URL required" }), {
        status: 400,
      });
    }

    const metadata = await parseLinkMetadata(url);

    return new Response(JSON.stringify(metadata), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(
      JSON.stringify({
        error: err instanceof Error ? err.message : "Failed to parse link",
      }),
      { status: 400 }
    );
  }
};
