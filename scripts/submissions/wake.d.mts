export function cronAuthorized(header: string | null, secret: string | undefined): boolean;
export function wakeSubmissionWorker(env: Record<string, string | undefined>, fetchImpl?: typeof fetch): Promise<{ disabled?: boolean; disabledByOwner?: boolean; dispatched?: boolean; revived?: boolean }>;
