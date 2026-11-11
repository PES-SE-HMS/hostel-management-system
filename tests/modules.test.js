
const test = require('node:test');
const assert = require('node:assert');

const {
  statusOf,
  validate: validateFee,
  validDate
} = require('../src/controllers/feeController');

const {
  validate: validateComplaint,
  isValidTransition
} = require('../src/controllers/complaintController');

const { validate: validateLeave } =
  require('../src/controllers/leaveController');

// FR-07: Fee record validation.
test('TC-FEE-01: valid fee record passes validation', () => {
  const result = validateFee({
    student_id: '1',
    amount: '1000',
    due_date: '2026-11-30'
  }, false);

  assert.deepStrictEqual(result.errors, []);
  assert.strictEqual(result.data.amount, 1000);
});

// FR-07: Invalid fee inputs.
test('TC-FEE-02: invalid fee amounts are rejected', () => {
  assert.ok(validateFee({
    student_id: '1',
    amount: '-100',
    due_date: '2026-11-30'
  }, false).errors.length > 0);

  assert.ok(validateFee({
    student_id: '1',
    amount: 'Infinity',
    due_date: '2026-11-30'
  }, false).errors.length > 0);
});

// FR-07: Calendar date validation.
test('TC-FEE-03: impossible dates are rejected', () => {
  assert.strictEqual(validDate('2026-11-30'), true);
  assert.strictEqual(validDate('2026-02-31'), false);
  assert.strictEqual(validDate('invalid'), false);
});

// FR-08: Payment status calculation.
test('TC-FEE-04: payment status is calculated correctly', () => {
  assert.strictEqual(statusOf(1000, 0), 'Pending');
  assert.strictEqual(statusOf(1000, 400), 'Partially Paid');
  assert.strictEqual(statusOf(1000, 1000), 'Paid');
});

// FR-08: Payment cannot exceed total fee.
test('TC-FEE-05: excessive payment is rejected', () => {
  const result = validateFee({
    amount: '1000',
    paid_amount: '1200'
  }, true);

  assert.ok(result.errors.length > 0);
});

// FR-09: Valid complaint submission.
test('TC-COMP-01: valid complaint passes validation', () => {
  const result = validateComplaint({
    category: 'plumbing',
    description: 'Water leakage in bathroom'
  });

  assert.deepStrictEqual(result.errors, []);
  assert.strictEqual(result.data.category, 'plumbing');
});

// FR-09: Invalid complaints.
test('TC-COMP-02: invalid complaints are rejected', () => {
  const result = validateComplaint({
    category: 'invalid',
    description: 'bad'
  });

  assert.ok(result.errors.length >= 2);
});

// FR-11: Maintenance status transitions.
test('TC-MAINT-01: valid maintenance transitions are allowed', () => {
  assert.strictEqual(
    isValidTransition('assigned', 'in_progress'),
    true
  );

  assert.strictEqual(
    isValidTransition('in_progress', 'resolved'),
    true
  );
});

// FR-11: Invalid transitions.
test('TC-MAINT-02: invalid maintenance transitions are rejected', () => {
  assert.strictEqual(
    isValidTransition('open', 'resolved'),
    false
  );

  assert.strictEqual(
    isValidTransition('resolved', 'in_progress'),
    false
  );
});

// Existing leave validation tests.
test('TC-LEAVE-01: valid leave request passes validation', () => {
  assert.deepStrictEqual(
    validateLeave({
      from_date: '2026-11-01',
      to_date: '2026-11-03',
      reason: 'Family function'
    }),
    []
  );
});

test('TC-LEAVE-02: invalid leave requests are rejected', () => {
  assert.ok(
    validateLeave({
      from_date: '2026-11-05',
      to_date: '2026-11-03',
      reason: 'x'
    }).length >= 2
  );
});
