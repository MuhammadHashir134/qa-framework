// ─────────────────────────────────────────────────────────
// Global Constants — shared across all stories
// ─────────────────────────────────────────────────────────

export const TIMEOUTS = {
  short:     3_000,
  medium:   10_000,
  long:     30_000,
  nafath:   60_000,   // external auth services need more time
  api:       5_000,
};

export const HTTP_STATUS = {
  OK:           200,
  CREATED:      201,
  NO_CONTENT:   204,
  BAD_REQUEST:  400,
  UNAUTHORIZED: 401,
  FORBIDDEN:    403,
  NOT_FOUND:    404,
  SERVER_ERROR: 500,
};

export const TEST_TAGS = {
  smoke:      '@smoke',
  regression: '@regression',
  ui:         '@ui',
  api:        '@api',
  critical:   '@critical',
  wip:        '@wip',
};
