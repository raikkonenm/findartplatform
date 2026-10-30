export function captureEnabled(env: Record<string, string | undefined>): boolean;
export function makeReceipt(type: string, fields: Record<string, string>, key: string | undefined, id?: string): { id: string; fingerprint: string; marker: string } | null;
export function captureSubmission(input: { id: string; type: string; fields: Record<string, string>; receivedAt?: string }, env: Record<string, string | undefined>, fetchImpl?: typeof fetch): Promise<unknown>;
