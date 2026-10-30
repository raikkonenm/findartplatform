import { NextResponse } from "next/server";
import { cronAuthorized, wakeSubmissionWorker } from "../../../../../scripts/submissions/wake.mjs";

export const maxDuration = 30;
export async function GET(request: Request) {
  if (!cronAuthorized(request.headers.get("authorization"), process.env.CRON_SECRET)) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }
  try {
    return NextResponse.json(await wakeSubmissionWorker(process.env));
  } catch {
    console.error("FINDART_SUBMISSION_WORKER_WATCHDOG_FAILED");
    return NextResponse.json({ error: "Worker wake unavailable." }, { status: 503 });
  }
}
