import { NextResponse } from "next/server";

// All submissions and inquiries route to a single mailbox.
const SUBMISSION_RECIPIENT = "raikkonenmaria7@gmail.com";

const SUBMISSION_TYPES = new Set([
  "exhibition",
  "artist",
  "opportunity",
  "index",
  "contribute",
  "contact",
] as const);
type SubmissionType = typeof SUBMISSION_TYPES extends Set<infer T> ? T : never;

// Field lists per type — the API sanitises + validates against these,
// so submissions can't smuggle arbitrary keys or skip required fields.
const FIELDS: Record<SubmissionType, readonly string[]> = {
  exhibition: [
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
  ],
  artist: [
    "Name",
    "Email",
    "Instagram",
    "Artist Statement / CV",
    "Portfolio / Documentation Link",
    "Website (optional)",
    "Additional Notes (optional)",
  ],
  opportunity: [
    "Name",
    "Email",
    "Organization",
    "Opportunity Title",
    "Opportunity Type",
    "Deadline",
    "Location",
    "For (audience)",
    "Application Fee",
    "Application Link",
    "Website (optional)",
    "Description",
  ],
  index: ["Name", "Email", "Website URL", "Instagram", "Short Description"],
  contribute: [
    "Name",
    "Email",
    "Contribution Type",
    "Pitch Title",
    "Pitch",
    "Sample / Portfolio Link",
    "Short Bio",
    "Notes (optional)",
  ],
  contact: ["Name", "Email", "Topic", "Subject", "Message"],
};

const REQUIRED: Record<SubmissionType, readonly string[]> = {
  exhibition: [
    "Name",
    "Email",
    "Exhibition Title",
    "Artists",
    "Venue / City / Country",
    "Opening Date",
    "Closing Date",
    "Documentation Link",
    "Exhibition Text",
  ],
  artist: [
    "Name",
    "Email",
    "Instagram",
    "Artist Statement / CV",
    "Portfolio / Documentation Link",
  ],
  opportunity: [
    "Name",
    "Email",
    "Organization",
    "Opportunity Title",
    "Opportunity Type",
    "Deadline",
    "Location",
    "For (audience)",
    "Application Fee",
    "Application Link",
    "Description",
  ],
  index: ["Name", "Email", "Website URL", "Short Description"],
  contribute: [
    "Name",
    "Email",
    "Contribution Type",
    "Pitch Title",
    "Pitch",
    "Sample / Portfolio Link",
    "Short Bio",
  ],
  contact: ["Name", "Email", "Topic", "Subject", "Message"],
};

function subjectFor(type: SubmissionType, payload: Record<string, string>): string {
  switch (type) {
    case "exhibition":
      return `New FindArt Exhibition Submission — ${payload["Exhibition Title"] || payload.Name}`;
    case "artist":
      return `New ArtNomads Artist Submission — ${payload.Name}`;
    case "opportunity":
      return `New Opportunity Submission — ${payload["Opportunity Title"] || payload.Name}`;
    case "index":
      return `New Index Website Submission — ${payload.Name}`;
    case "contribute":
      return `New Editorial Pitch — ${payload["Pitch Title"] || payload.Name}`;
    case "contact":
      return `FindArt Contact: ${payload.Subject || payload.Topic || payload.Name}`;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isSubmissionType(value: unknown): value is SubmissionType {
  return typeof value === "string" && (SUBMISSION_TYPES as Set<string>).has(value);
}

export async function POST(request: Request) {
  let input: unknown;

  try {
    input = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid submission." }, { status: 400 });
  }

  if (!isRecord(input) || !isSubmissionType(input.submissionType)) {
    return NextResponse.json({ error: "Invalid submission." }, { status: 400 });
  }

  const submissionType = input.submissionType;
  const fields = FIELDS[submissionType];
  const requiredFields = REQUIRED[submissionType];

  const payload = Object.fromEntries(
    fields.map((field) => [field, typeof input[field] === "string" ? (input[field] as string).trim() : ""]),
  ) as Record<string, string>;

  if (requiredFields.some((field) => payload[field].length === 0)) {
    return NextResponse.json({ error: "Required fields are missing." }, { status: 400 });
  }

  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.SUBMISSION_FROM_EMAIL;

  if (!apiKey || !fromEmail) {
    return NextResponse.json({ error: "Email delivery is not configured." }, { status: 503 });
  }

  const text = fields.map((field) => `${field}:\n${payload[field]}`).join("\n\n");
  const subject = subjectFor(submissionType, payload);

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: fromEmail,
        to: [SUBMISSION_RECIPIENT],
        reply_to: payload.Email || undefined,
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
