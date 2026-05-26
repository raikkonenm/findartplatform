import { NextResponse } from "next/server";

const submissionFields = [
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

const requiredFields = [
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

type SubmissionField = (typeof submissionFields)[number];
type SubmissionPayload = Record<SubmissionField, string>;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export async function POST(request: Request) {
  let input: unknown;

  try {
    input = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid submission." }, { status: 400 });
  }

  if (!isRecord(input)) {
    return NextResponse.json({ error: "Invalid submission." }, { status: 400 });
  }

  const payload = Object.fromEntries(
    submissionFields.map((field) => [field, typeof input[field] === "string" ? input[field].trim() : ""]),
  ) as SubmissionPayload;

  if (requiredFields.some((field) => payload[field].length === 0)) {
    return NextResponse.json({ error: "Required fields are missing." }, { status: 400 });
  }

  const apiKey = process.env.RESEND_API_KEY;
  const toEmail = process.env.SUBMISSION_TO_EMAIL;
  const fromEmail = process.env.SUBMISSION_FROM_EMAIL;

  if (!apiKey || !toEmail || !fromEmail) {
    return NextResponse.json({ error: "Email delivery is not configured." }, { status: 503 });
  }

  const text = submissionFields
    .map((field) => `${field}:\n${payload[field]}`)
    .join("\n\n");

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
        subject: `New FindArt Exhibition Submission — ${payload["Exhibition Title"]}`,
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
