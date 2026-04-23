import { Router, Response } from 'express';
import pool from '../utils/db';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();

// POST /bookings
router.post('/', authenticate, async (req: AuthRequest, res: Response) => {
  const { worker_id, service_id, scheduled_at, address, notes } = req.body;
  const user_id = req.user!.id;
  try {
    const result = await pool.query(
      `INSERT INTO bookings (user_id, worker_id, service_id, scheduled_at, address, notes, status, payment_status)
       VALUES ($1, $2, $3, $4, $5, $6, 'pending', 'unpaid') RETURNING *`,
      [user_id, worker_id, service_id, scheduled_at, address, notes]
    );
    return res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
});

// GET /bookings/:id
router.get('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  try {
    const result = await pool.query(`
      SELECT b.*, 
        u.name as client_name, u.phone as client_phone,
        wu.name as worker_name, wu.phone as worker_phone,
        s.name as service_name, s.base_price,
        w.pricing as worker_pricing
      FROM bookings b
      JOIN users u ON u.id = b.user_id
      JOIN workers w ON w.id = b.worker_id
      JOIN users wu ON wu.id = w.user_id
      JOIN services s ON s.id = b.service_id
      WHERE b.id = $1
    `, [id]);
    if (!result.rows[0]) return res.status(404).json({ error: 'Booking not found' });
    return res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
});

// GET /bookings — list bookings for the current user/worker
router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
  const user_id = req.user!.id;
  const role = req.user!.role;
  try {
    let query: string;
    let params: any[];
    if (role === 'worker') {
      const workerResult = await pool.query('SELECT id FROM workers WHERE user_id = $1', [user_id]);
      const workerId = workerResult.rows[0]?.id;
      query = `
        SELECT b.*, u.name as client_name, s.name as service_name, s.base_price
        FROM bookings b
        JOIN users u ON u.id = b.user_id
        JOIN services s ON s.id = b.service_id
        WHERE b.worker_id = $1
        ORDER BY b.created_at DESC
      `;
      params = [workerId];
    } else {
      query = `
        SELECT b.*, wu.name as worker_name, s.name as service_name, s.base_price
        FROM bookings b
        JOIN workers w ON w.id = b.worker_id
        JOIN users wu ON wu.id = w.user_id
        JOIN services s ON s.id = b.service_id
        WHERE b.user_id = $1
        ORDER BY b.created_at DESC
      `;
      params = [user_id];
    }
    const result = await pool.query(query, params);
    return res.json(result.rows);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
});

// PATCH /bookings/:id/status
router.patch('/:id/status', authenticate, async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { status } = req.body; // pending | confirmed | in_progress | completed | cancelled
  try {
    const result = await pool.query(
      'UPDATE bookings SET status=$1 WHERE id=$2 RETURNING *',
      [status, id]
    );
    return res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
});

export default router;
