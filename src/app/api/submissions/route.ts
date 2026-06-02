import { NextResponse } from "next/server";

const exhibitionFields = [
  "Name",
  "Email",
  "Exhibition Title",
  "Artists",
  "Curator(s) (optional)",
  "Venue / City / Country",
  "Opening Date",
  "Closing Date",
  "Instagram (artist or venue)",
  "Photo Credit",
  "Documentation Link",
  "Website Link (optional)",
  "Exhibition Text",
  "Notes (optional)",
] as const;

const requiredExhibitionFields = [
  "Name",
  "Email",
  "Exhibition Title",
  "Artists",
  "Venue / City / Country",
  "Opening Date",
  "Closing Date",
  "Documentation Link",
  "Exhibition Text",
] as const;

const artistFields = [
  "Name",
  "Email",
  "Instagram",
  "Artist Statement / CV",
  "Portfolio / Documentation Link",
  "Website (optional)",
  "Additional Notes (optional)",
] as const;

const requiredArtistFields = [
  "Name",
  "Email",
  "Instagram",
  "Artist Statement / CV",
  "Portfolio / Documentation Link",
] as const;

const SUBMISSION_RECIPIENTS = {
  exhibition: "raikkonenmaria7@gmail.com",
  artist: "artcnomads@gmail.com",
} as const;

const SUBMISSIONS_ENABLED = false;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export async function POST(request: Request) {
  if (!SUBMISSIONS_ENABLED) {
    return NextResponse.json({ error: "Submissions are temporarily unavailable." }, { status: 503 });
  }

  let input: unknown;

  try {
    input = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid submission." }, { status: 400 });
  }

  if (!isRecord(input)) {
    return NextResponse.json({ error: "Invalid submission." }, { status: 400 });
  }

  const submissionType = input.submissionType === "artist" ? "artist" : "exhibition";
  const fields = submissionType === "artist" ? artistFields : exhibitionFields;
  const requiredFields =
    submissionType === "artist" ? requiredArtistFields : requiredExhibitionFields;
  const payload = Object.fromEntries(
    fields.map((field) => [field, typeof input[field] === "string" ? input[field].trim() : ""]),
  ) as Record<string, string>;

  if (requiredFields.some((field) => payload[field].length === 0)) {
    return NextResponse.json({ error: "Required fields are missing." }, { status: 400 });
  }

  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.SUBMISSION_FROM_EMAIL;
  const toEmail = SUBMISSION_RECIPIENTS[submissionType];

  if (!apiKey || !fromEmail) {
    return NextResponse.json({ error: "Email delivery is not configured." }, { status: 503 });
  }

  const text = fields.map((field) => `${field}:\n${payload[field]}`).join("\n\n");
  const subject =
    submissionType === "artist"
      ? `New ArtNomads Artist Submission \u2014 ${payload.Name}`
      : `New FindArt Exhibition Submission \u2014 ${payload["Exhibition Title"]}`;

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: fromEmail,
        to: [toEmail],
        subject,
        text,
      }),
      cache: "no-store",
    });

    if (!response.ok) {
      return NextResponse.json({ error: "Unable to send submission." }, { status: 502 });
    }
  } catch {
    return NextResponse.json({ error: "Unable to send submission." }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
