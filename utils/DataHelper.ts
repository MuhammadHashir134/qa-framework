// ─────────────────────────────────────────────────────────
// DataHelper — generate test data for any story
// Uses @faker-js/faker for realistic random data
// ─────────────────────────────────────────────────────────

import { faker } from '@faker-js/faker';

export class DataHelper {

  // ── Identity ───────────────────────────────────────────

  static nationalId(length = 10): string {
    return Array.from({ length }, () => faker.number.int({ min: 0, max: 9 })).join('');
  }

  static fullName(): string {
    return faker.person.fullName();
  }

  static firstName(): string {
    return faker.person.firstName();
  }

  static lastName(): string {
    return faker.person.lastName();
  }

  // ── Contact ────────────────────────────────────────────

  static email(): string {
    return faker.internet.email();
  }

  static phone(): string {
    return faker.phone.number('05########');
  }

  static saudiPhone(): string {
    return `05${faker.number.int({ min: 10000000, max: 99999999 })}`;
  }

  // ── Address ────────────────────────────────────────────

  static address(): string {
    return faker.location.streetAddress();
  }

  static city(): string {
    return faker.location.city();
  }

  // ── Credentials ────────────────────────────────────────

  static password(length = 12): string {
    return faker.internet.password({ length, memorable: false });
  }

  static username(): string {
    return faker.internet.userName();
  }

  // ── Numbers ────────────────────────────────────────────

  static randomInt(min = 1, max = 1000): number {
    return faker.number.int({ min, max });
  }

  static randomFloat(min = 1, max = 1000, fractionDigits = 2): number {
    return parseFloat(faker.number.float({ min, max, fractionDigits }).toFixed(fractionDigits));
  }

  // ── Text ───────────────────────────────────────────────

  static sentence(): string {
    return faker.lorem.sentence();
  }

  static paragraph(): string {
    return faker.lorem.paragraph();
  }

  static word(): string {
    return faker.lorem.word();
  }

  // ── Dates ──────────────────────────────────────────────

  static futureDate(days = 30): string {
    return faker.date.soon({ days }).toISOString().split('T')[0];
  }

  static pastDate(days = 30): string {
    return faker.date.recent({ days }).toISOString().split('T')[0];
  }

  // ── Boundary values (for validation testing) ───────────

  static tooShort(minLength: number): string {
    return 'a'.repeat(minLength - 1);
  }

  static tooLong(maxLength: number): string {
    return 'a'.repeat(maxLength + 1);
  }

  static exactLength(length: number, char = 'a'): string {
    return char.repeat(length);
  }

  static numericTooShort(minLength: number): string {
    return '1'.repeat(minLength - 1);
  }

  static numericTooLong(maxLength: number): string {
    return '1'.repeat(maxLength + 1);
  }

  // ── Special inputs (for negative testing) ─────────────

  static sqlInjection(): string {
    return "' OR '1'='1";
  }

  static xssPayload(): string {
    return '<script>alert("xss")</script>';
  }

  static specialChars(): string {
    return '!@#$%^&*()_+-=[]{}|;\':",.<>?/`~';
  }

  static unicodeText(): string {
    return 'مرحبا بالعالم';  // Arabic — relevant for Saudi apps
  }

  static whitespaceOnly(): string {
    return '   ';
  }
}
