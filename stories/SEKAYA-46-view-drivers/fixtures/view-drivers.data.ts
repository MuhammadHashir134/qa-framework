// Story: View Drivers | SEKAYA-46
// Rule: Driver Management page displays list of drivers with filterable status

// ── Valid Search Inputs ────────────────────────────────────────────────────

export const VALID_SEARCH_INPUTS = {
  existingDriver:   'أحمد مجابيب',           // real driver name from UAT
  partialName:      'أحمد',                 // partial search
  employeeId:       '135',                  // search by Employee ID
  driverId:         'DR-0119',              // search by Driver ID
  phoneNumber:      '0500395577',           // search by phone
};

// ── Invalid Search Inputs ──────────────────────────────────────────────────

export const INVALID_SEARCH_INPUTS = {
  nonexistentDriver: 'ZZZZZZZZZ',            // driver that doesn't exist
  specialCharacters: '!@#$%^&*()',
  xssPayload:        '<script>alert(1)</script>',
  sqlInjection:      "' OR '1'='1",
  veryLongString:    'a'.repeat(500),       // extremely long search
  emptyString:       '',
  whitespaceOnly:    '   ',
  arabicSpecial:     '!@#$%^&*()',
};

// ── Valid Filter Options ───────────────────────────────────────────────────

export const VALID_FILTER_OPTIONS = {
  ready:    'Ready',
  notReady: 'Not Ready',
  all:      'All',
};

// ── Test Data for Assertions ───────────────────────────────────────────────

export const EXPECTED_COLUMNS = [
  'Driver Name',
  'Employee ID',
  'Driver Phone',
  'National ID / Iqama',
  'Status',
];

export const EXPECTED_STATS = {
  totalDriversLabel: /Total Drivers/i,
  assignedDriversLabel: /Assigned Drivers/i,
  nonAssignedDriversLabel: /Non-Assigned Drivers/i,
  newDriversLabel: /New Drivers This Month/i,
};

export const VALID_STATUSES = [
  'Ready',
  'Not Ready',
];
