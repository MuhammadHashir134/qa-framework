export const CONTRACTOR_ID = '1000050326';

export const EXPECTED_LABELS = {
  personal: {
    name: 'Name',
    nationalId: 'National ID / Residence Number',
    phone: 'Phone Number',
    email: 'Email',
  },
  company: {
    cr: 'Commercial Registration Number',
    tax: 'Tax Number',
    ministry: 'Ministry Number',
  },
};

export const FIELD_VALIDATIONS = {
  nationalIdRegex: /^\d{10}$/,
  phoneRegex: /^0\d{9}$/,
  emailRegex: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  crNumberRegex: /^\d{10}$/,
  taxNumberRegex: /^\d{15}$/,
  ministryNumberRegex: /^\d{10}$/,
};
