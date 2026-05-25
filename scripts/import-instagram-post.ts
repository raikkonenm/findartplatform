/**
 * Import an Instagram carousel into the featured exhibition record.
 *
 * Instagram exposes the first public preview image without authentication, but full
 * carousel media usually requires a logged-in browser session. This script opens a
 * visible Playwright Chromium window at Instagram's login page and waits while you
 * log in manually. The authenticated browser session is saved locally under
 * .instagram-session/ and is ignored by git.
 *
 *   npm run import:instagram -- "https://www.instagram.com/p/DYkL7iRCpHt/" call-me-we-by-lom-of-lama
 *
 * Never commit browser session storage or cookie values.
 */

import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { chromium, type BrowserContext, type Page } from "playwright";

type ImageCandidate = {
  url: string;
  width?: number;
};

type InstagramMedia = {
  image_versions2?: {
    candidates?: ImageCandidate[];
  };
};

type InstagramItem = InstagramMedia & {
  caption?: {
    text?: string;
  };
  carousel_media?: InstagramMedia[];
};

const postUrl = process.argv[2];
const slug = process.argv[3] ?? "call-me-we-by-lom-of-lama";
const projectRoot = path.resolve(import.meta.dirname, "..");
const outputDirectory = path.join(projectRoot, "public", "exhibitions", slug);
const dataFile = path.join(projectRoot, "src", "data", "exhibitions.ts");
const sessionDirectory = path.join(projectRoot, ".instagram-session");
const startMarker = `  // INSTAGRAM_IMPORT_START: ${slug}`;
const endMarker = `  // INSTAGRAM_IMPORT_END: ${slug}`;

if (!postUrl) {
  throw new Error("Usage: node scripts/import-instagram-post.ts <instagram-url> [slug]");
}

function shortcodeFromUrl(url: string) {
  const shortcode = new URL(url).pathname.match(/\/p\/([^/]+)/)?.[1];

  if (!shortcode) {
    throw new Error("Expected an Instagram post URL in the format /p/<shortcode>/.");
  }

  return shortcode;
}

function cleanCaption(text: string) {
  return text.replace(/^[\s\S]*?Instagram:\s*"/, "").replace(/"\s*$/, "").trim();
}

function valueAfterLabel(caption: string, label: string) {
  return caption.match(new RegExp(`^${label}:\\s*@?(.+)$`, "im"))?.[1]?.trim();
}

function parseDetails(caption: string) {
  const lines = caption.split(/\r?\n/).map((line) => line.trim());
  const heading = lines[0] ?? "Imported Exhibition";
  const titleMatch = heading.match(/^(.+?)\s+BY\s+(.+)$/i);
  const detailsLine = lines.find((line) => /,\s*[^,]+,\s*[^,]+,\s*\d{1,2}\s+\w+\s+[-\u2013\u2014]\s+\d{1,2}\s+\w+\s+\d{4}/.test(line));
  const detailMatch = detailsLine?.match(
    /^(.*?),\s*(.*?),\s*(.*?),\s*(\d{1,2}\s+\w+)\s+[-\u2013\u2014]\s+(\d{1,2}\s+\w+\s+\d{4})$/,
  );
  const prose = caption
    .replace(/^.*?\n+/, "")
    .replace(/\n+Artist:[\s\S]*$/i, "")
    .trim();

  return {
    title: titleMatch?.[1]?.trim() ?? heading,
    artist: valueAfterLabel(caption, "Artist") ?? titleMatch?.[2]?.trim(),
    photographer: valueAfterLabel(caption, "Photo"),
    gallery: detailMatch?.[1]?.trim(),
    city: detailMatch?.[2]?.trim(),
    country: detailMatch?.[3]?.trim(),
    startDate: detailMatch?.[4]?.trim(),
    endDate: detailMatch?.[5]?.trim(),
    year: detailMatch?.[5]?.match(/\d{4}/)?.[0],
    description: prose,
  };
}

function bestSource(media: InstagramMedia) {
  return media.image_versions2?.candidates
    ?.slice()
    .sort((first, second) => (second.width ?? 0) - (first.width ?? 0))[0]?.url;
}

async function waitForLogin(context: BrowserContext, page: Page) {
  await page.goto("https://www.instagram.com/accounts/login/", { waitUntil: "domcontentloaded" });
  console.log("Visible Chromium is open on Instagram. Log in manually in that window.");
  console.log("The import will continue automatically after an authenticated session is detected.");

  while (true) {
    const cookies = await context.cookies("https://www.instagram.com/");
    if (cookies.some((cookie) => cookie.name === "sessionid" && cookie.value.length > 0)) {
      console.log("Instagram login detected. Continuing import...");
      return;
    }

    await page.waitForTimeout(1000);
  }
}

async function loadCarousel(page: Page, shortcode: string) {
  await page.goto(postUrl!, { waitUntil: "domcontentloaded" });

  const result = await page.evaluate(async (currentShortcode) => {
    const response = await fetch(`/api/v1/media/shortcode/${currentShortcode}/info/`, {
      credentials: "include",
      headers: {
        "X-IG-App-ID": "936619743392459",
      },
    });

    return {
      ok: response.ok,
      status: response.status,
      payload: response.ok ? await response.json() : undefined,
    };
  }, shortcode);

  if (!result.ok) {
    throw new Error(`Instagram media request failed with HTTP ${result.status}. Log in again and retry.`);
  }

  const payload = result.payload as { items?: InstagramItem[] };
  const item = payload.items?.[0];

  if (!item) {
    throw new Error("Instagram did not return a media item for this post.");
  }

  const media = item.carousel_media ?? [item];
  const sources = media.map(bestSource).filter((src): src is string => Boolean(src));

  if (sources.length === 0) {
    throw new Error("Instagram returned the post but no downloadable image sources.");
  }

  return {
    caption: item.caption?.text ?? "",
    sources,
  };
}

async function downloadImage(context: BrowserContext, src: string, destination: string) {
  const response = await context.request.get(src, {
    headers: {
      Referer: "https://www.instagram.com/",
    },
  });

  if (!response.ok()) {
    throw new Error(`Unable to download image: HTTP ${response.status()}.`);
  }

  await writeFile(destination, await response.body());
}

async function main() {
  const shortcode = shortcodeFromUrl(postUrl);
  const context = await chromium.launchPersistentContext(sessionDirectory, {
    headless: false,
    viewport: null,
  });

  try {
    const page = context.pages()[0] ?? (await context.newPage());
    await waitForLogin(context, page);
    const { caption, sources } = await loadCarousel(page, shortcode);
    const details = parseDetails(cleanCaption(caption));

    await mkdir(outputDirectory, { recursive: true });

    const images: { src: string; caption?: string }[] = [];

    for (const [index, src] of sources.entries()) {
      const filename = `${String(index + 1).padStart(2, "0")}.jpg`;
      const destination = path.join(outputDirectory, filename);
      await downloadImage(context, src, destination);
      images.push({
        src: `/exhibitions/${slug}/${filename}`,
        caption: details.photographer
          ? `Installation view. Photo: ${details.photographer}`
          : "Installation view.",
      });
    }

    const record = {
      slug,
      title: details.title,
      subtitle: details.artist,
      venue: details.gallery,
      gallery: details.gallery,
      city: details.city,
      country: details.country,
      year: details.year,
      dates: [details.startDate, details.endDate].filter(Boolean).join(" - "),
      startDate: details.startDate,
      endDate: details.endDate,
      artists: details.artist ? [details.artist] : undefined,
      photographer: details.photographer,
      summary: details.description.split(/\n\n/)[0],
      description: details.description,
      previewImage: images[0]?.src,
      heroImage: images[0]?.src,
      images,
      instagramUrl: postUrl,
    };

    const source = await readFile(dataFile, "utf8");
    const start = source.indexOf(startMarker);
    const end = source.indexOf(endMarker);

    if (start < 0 || end < 0 || end <= start) {
      throw new Error(`Unable to locate import markers for ${slug} in src/data/exhibitions.ts.`);
    }

    const block = `${startMarker}\n${JSON.stringify(record, null, 2)
      .split("\n")
      .map((line) => `  ${line}`)
      .join("\n")},\n`;
    const updated = `${source.slice(0, start)}${block}${source.slice(end)}`;

    await writeFile(dataFile, updated, "utf8");
    console.log(`Imported ${images.length} images for ${record.title} into ${outputDirectory}.`);
  } finally {
    await context.close();
  }
}

await main();
