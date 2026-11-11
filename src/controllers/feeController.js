
const { pool, wrap, studentIdFor } = require('../utils/helpers');

// FR-08: Derive payment status from stored amounts.
function statusOf(amount, paid) {
  amount = Number(amount);
  paid = Number(paid);

  if (paid >= amount) return 'Paid';
  if (paid > 0) return 'Partially Paid';
  return 'Pending';
}

const withStatus = (rows) =>
  rows.map((r) => ({
    ...r,
    status: statusOf(r.amount, r.paid_amount)
  }));

// Strict YYYY-MM-DD calendar date validation.
function validDate(value) {
  if (typeof value !== 'string' ||
      !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const date = new Date(`${value}T00:00:00.000Z`);

  return !Number.isNaN(date.getTime()) &&
    date.toISOString().slice(0, 10) === value;
}

// FR-07: Fee input validation.
function validate(b, partial = false) {
  const errors = [];
  const data = {};

  if (!partial || b.student_id !== undefined) {
    const v = Number(b.student_id);

    if (Number.isInteger(v) && v > 0) {
      data.student_id = v;
    } else {
      errors.push('student_id must be a positive integer');
    }
  }

  if (!partial || b.amount !== undefined) {
    const v = Number(b.amount);

    if (Number.isFinite(v) && v > 0 && v <= 99999999.99) {
      data.amount = v;
    } else {
      errors.push('amount must be greater than 0 and within the database limit');
    }
  }

  if (b.paid_amount !== undefined) {
    const v = Number(b.paid_amount);

    if (Number.isFinite(v) && v >= 0 && v <= 99999999.99) {
      data.paid_amount = v;
    } else {
      errors.push('paid_amount must be a valid non-negative amount');
    }
  }

  if (!partial || b.due_date !== undefined) {
    if (validDate(b.due_date)) {
      data.due_date = b.due_date;
    } else {
      errors.push('due_date must be a valid YYYY-MM-DD date');
    }
  }

  if (b.description !== undefined) {
    const description = String(b.description).trim();

    if (!description || description.length > 100) {
      errors.push('description must contain 1-100 characters');
    } else {
      data.description = description;
    }
  }

  if (
    data.amount !== undefined &&
    data.paid_amount !== undefined &&
    data.paid_amount > data.amount
  ) {
    errors.push('paid_amount cannot exceed amount');
  }

  return { errors, data };
}

// FR-07: Create a fee record.
exports.create = wrap(async (req, res) => {
  const { errors, data } = validate(req.body, false);

  if (errors.length) {
    return res.status(400).json({
      error: 'Validation failed',
      details: errors
    });
  }

  const [students] = await pool.query(
    'SELECT student_id FROM students WHERE student_id = ?',
    [data.student_id]
  );

  if (!students[0]) {
    return res.status(404).json({ error: 'Student not found' });
  }

  const [result] = await pool.query(
    'INSERT INTO fees SET ?',
    [{ ...data, updated_by: req.session.user.id }]
  );

  res.status(201).json({
    message: 'Fee record created',
    fee_id: result.insertId
  });
});

// FR-07 / FR-08: Update fee and payment information.
exports.update = wrap(async (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ error: 'Invalid fee ID' });
  }

  const { errors, data } = validate(req.body, true);

  if (errors.length) {
    return res.status(400).json({
      error: 'Validation failed',
      details: errors
    });
  }

  delete data.student_id;

  if (!Object.keys(data).length) {
    return res.status(400).json({ error: 'No fields to update' });
  }

  const [current] = await pool.query(
    'SELECT amount, paid_amount FROM fees WHERE fee_id = ?',
    [id]
  );

  if (!current[0]) {
    return res.status(404).json({ error: 'Fee record not found' });
  }

  const amount = data.amount ?? Number(current[0].amount);
  const paid = data.paid_amount ?? Number(current[0].paid_amount);

  if (paid > amount) {
    return res.status(400).json({
      error: 'paid_amount cannot exceed amount'
    });
  }

  await pool.query(
    'UPDATE fees SET ?, updated_by = ? WHERE fee_id = ?',
    [data, req.session.user.id, id]
  );

  res.json({ message: 'Fee record updated' });
});

// Admin: View all fee records.
exports.list = wrap(async (req, res) => {
  const [rows] = await pool.query(
    `SELECT f.*, s.srn, s.name
     FROM fees f
     JOIN students s ON s.student_id = f.student_id
     ORDER BY f.due_date DESC`
  );

  res.json(withStatus(rows));
});

// Student: View only their own fee records.
exports.mine = wrap(async (req, res) => {
  const sid = await studentIdFor(req.session.user.id);

  if (!sid) return res.json([]);

  const [rows] = await pool.query(
    `SELECT * FROM fees
     WHERE student_id = ?
     ORDER BY due_date DESC`,
    [sid]
  );

  res.json(withStatus(rows));
});

exports.statusOf = statusOf;
exports.validate = validate;
exports.validDate = validDate;
