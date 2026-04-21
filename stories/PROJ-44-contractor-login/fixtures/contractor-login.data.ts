// Story: Contractor Login Via Nafath | PROJ-44
// Rule : National/Iqama ID — exactly 10 ASCII digits, mandatory

// ── Valid ──────────────────────────────────────────────────────────────────

export const VALID_IDS = {
  standard:    '1000050334',   // real National ID (UAT)
  leadingZero: '1000050334',   // reuses standard — leading-zero ID not available in UAT
};

// ── Invalid — field-level validation ──────────────────────────────────────

export const INVALID_IDS = {
  empty:         '',
  tooShort:      '123456789',               // 9 digits
  tooLong:       '12345678901',             // 11 digits
  allAlpha:      'ABCDEFGHIJ',
  alphanumeric:  'ABCD123456',
  withHyphens:   '123-456-789',
  withSpaces:    '123 456 789',
  whitespaceOnly:'          ',
  sqlInjection:  "' OR '1'='1",
  xssPayload:    '<script>alert(1)</script>',
  arabicDigits:  '\u0661\u0662\u0663\u0664\u0665\u0666\u0667\u0668\u0669\u0660',
};
