const { pool, wrap } = require('../utils/helpers');

function occupancySummary(totalBeds, occupiedBeds) {
  const total = Math.max(0, Number(totalBeds) || 0);
  const occupied = Math.min(total, Math.max(0, Number(occupiedBeds) || 0));
  return {
    total_beds: total,
    occupied_beds: occupied,
    available_beds: total - occupied,
    occupancy_percent: total ? Math.round((occupied / total) * 100) : 0
  };
}

// FR-17: each summary is aggregated from its source table without join fan-out.
exports.summary = wrap(async (req, res) => {
  const [[beds]] = await pool.query(
    `SELECT
       (SELECT COUNT(*) FROM beds) AS total_beds,
       (SELECT COUNT(DISTINCT bed_id) FROM allocations WHERE status = 'active') AS occupied_beds`
  );

  const [[fees]] = await pool.query(
    `SELECT COUNT(*) AS total,
            COALESCE(SUM(paid_amount >= amount), 0) AS paid,
            COALESCE(SUM(paid_amount > 0 AND paid_amount < amount), 0) AS partially_paid,
            COALESCE(SUM(paid_amount = 0), 0) AS pending,
            COALESCE(SUM(amount), 0) AS total_billed,
            COALESCE(SUM(paid_amount), 0) AS total_collected
       FROM fees`
  );

  const [[complaints]] = await pool.query(
    `SELECT COUNT(*) AS total,
            COALESCE(SUM(status = 'open'), 0) AS open_count,
            COALESCE(SUM(status = 'assigned'), 0) AS assigned,
            COALESCE(SUM(status = 'in_progress'), 0) AS in_progress,
            COALESCE(SUM(status = 'resolved'), 0) AS resolved
       FROM complaints`
  );

  res.json({
    occupancy: occupancySummary(beds.total_beds, beds.occupied_beds),
    fees: {
      total: Number(fees.total),
      paid: Number(fees.paid),
      partially_paid: Number(fees.partially_paid),
      pending: Number(fees.pending),
      total_billed: Number(fees.total_billed),
      total_collected: Number(fees.total_collected)
    },
    complaints: {
      total: Number(complaints.total),
      open_count: Number(complaints.open_count),
      assigned: Number(complaints.assigned),
      in_progress: Number(complaints.in_progress),
      resolved: Number(complaints.resolved)
    }
  });
});

exports.occupancySummary = occupancySummary;
