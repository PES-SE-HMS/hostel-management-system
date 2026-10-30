// Seeds demo users, rooms and beds. Run: npm run seed (after loading schema.sql)
require('dotenv').config();
const bcrypt = require('bcryptjs');
const pool = require('../src/config/db');

(async () => {
  const users = [
    ['admin1', 'admin123', 'Hostel Administrator', 'admin'],
    ['warden1', 'warden123', 'Hostel Warden', 'warden'],
    ['maint1', 'maint123', 'Maintenance Staff', 'maintenance'],
    ['student1', 'student123', 'Demo Student', 'student'],
  ];
  for (const [u, p, n, r] of users) {
    const hash = await bcrypt.hash(p, 10);
    await pool.query(
      'INSERT IGNORE INTO users (username, password_hash, full_name, role) VALUES (?,?,?,?)',
      [u, hash, n, r]
    );
  }
  for (const block of ['A', 'B']) {
    for (let floor = 1; floor <= 2; floor++) {
      for (let n = 1; n <= 3; n++) {
        const num = `${block}${floor}0${n}`;
        const [res] = await pool.query(
          'INSERT IGNORE INTO rooms (room_number, block, floor, capacity) VALUES (?,?,?,2)',
          [num, block, floor]
        );
        if (res.insertId) {
          await pool.query('INSERT INTO beds (room_id, bed_number) VALUES (?,1),(?,2)', [res.insertId, res.insertId]);
        }
      }
    }
  }
  console.log('Seed complete.');
  await pool.end();
})().catch((e) => { console.error(e); process.exit(1); });
