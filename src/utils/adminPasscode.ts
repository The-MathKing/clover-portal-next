import { timingSafeEqual } from 'crypto';

// Passcode for the internal developer tools. Set ADMIN_PASSCODE in the server environment only
// (never NEXT_PUBLIC_). Fails closed: with no passcode configured, every request is rejected.
export function isAdminPasscode(input: unknown): boolean {
  const expected = process.env.ADMIN_PASSCODE;
  if (!expected || typeof input !== 'string') return false;
  const given = Buffer.from(input.trim());
  const want = Buffer.from(expected);
  return given.length === want.length && timingSafeEqual(given, want);
}
