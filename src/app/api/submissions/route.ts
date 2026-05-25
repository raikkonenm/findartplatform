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

const defaultSubmissionEndpoint =
  "https://script.google.com/macros/s/AKfycbyJL_rMz1y_pJtkPYCXv5rwu7kxATDCyLdRw0OPEtzLLUL-Jj0DliYEcTA8OVJKH_LE/exec";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export async function POST(request: Request) {
  const endpoint = process.env.GOOGLE_SHEETS_SUBMISSION_URL ?? defaultSubmissionEndpoint;

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

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      cache: "no-store",
    });

    if (!response.ok) {
      return NextResponse.json({ error: "Unable to save submission." }, { status: 502 });
    }
  } catch {
    return NextResponse.json({ error: "Unable to save submission." }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
