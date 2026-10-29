const AppError = require('./AppError');

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^\+?[0-9\s-]{6,20}$/;

const FIELDS = {
  name: { required: true, max: 100 },
  email: { required: true, max: 100, pattern: EMAIL_RE },
  phone: { required: false, max: 20, pattern: PHONE_RE },
  department: { required: false, max: 50 },
};

// Returns a clean student object or throws a 400 with every field error at once.
function validateStudent(body) {
  const errors = {};
  const student = {};

  for (const [field, rules] of Object.entries(FIELDS)) {
    const raw = body?.[field];
    const value = typeof raw === 'string' ? raw.trim() : raw;

    if (value === undefined || value === null || value === '') {
      if (rules.required) errors[field] = `${field} is required`;
      else student[field] = null;
      continue;
    }
    if (typeof value !== 'string') {
      errors[field] = `${field} must be a string`;
    } else if (value.length > rules.max) {
      errors[field] = `${field} must be at most ${rules.max} characters`;
    } else if (rules.pattern && !rules.pattern.test(value)) {
      errors[field] = `${field} is invalid`;
    } else {
      student[field] = field === 'email' ? value.toLowerCase() : value;
    }
  }

  if (Object.keys(errors).length > 0) {
    throw new AppError(400, 'Validation failed', errors);
  }
  return student;
}

function parseId(raw) {
  const id = Number(raw);
  if (!Number.isInteger(id) || id <= 0) {
    throw new AppError(400, 'Invalid student id');
  }
  return id;
}

module.exports = { validateStudent, parseId };
