export const VALID_IDS = {
  beneficiary: "1234567890",
  contractor:  "9876543210",
  driver:      "1122334455",
};

export const INVALID_IDS = {
  empty:        "",
  tooShort:     "12345",
  tooLong:      "12345678901",
  nonNumeric:   "ABCD123456",
  specialChars: "123-456-789",
  withSpaces:   "123 456 789",
};
