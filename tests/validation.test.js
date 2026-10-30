const test = require('node:test');
const assert = require('node:assert');
const { validate } = require('../src/controllers/studentController');
const { requireRole } = require('../src/middleware/auth');

test('TC-STU-01: valid student passes validation and is normalised', () => {
  const { errors, data } = validate({ srn: 'pes2ug24cs271', name: 'Mayukh', email: 'A@B.com', year: 3 });
  assert.deepStrictEqual(errors, []);
  assert.strictEqual(data.srn, 'PES2UG24CS271');
  assert.strictEqual(data.email, 'a@b.com');
});

test('TC-DATA-01: missing/invalid fields are rejected', () => {
  const { errors } = validate({ srn: '', name: 'X', email: 'not-an-email', year: 9 });
  assert.ok(errors.length >= 3);
});

function run(mw, session) {
  let out = {};
  const res = { status(c) { out.status = c; return this; }, json(b) { out.body = b; return this; } };
  mw({ session }, res, () => { out.next = true; });
  return out;
}

test('TC-AUTH-02: role guard blocks unauthenticated and wrong-role users', () => {
  const guard = requireRole('admin');
  assert.strictEqual(run(guard, {}).status, 401);
  assert.strictEqual(run(guard, { user: { role: 'student' } }).status, 403);
  assert.strictEqual(run(guard, { user: { role: 'admin' } }).next, true);
});
