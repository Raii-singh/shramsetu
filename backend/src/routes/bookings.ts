import { Router, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import pool from '../utils/db';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();

// POST /bookings
router.post('/', authenticate, async (req: AuthRequest, res: Response) => {
  const { worker_id, service_id, scheduled_at, address, notes } = req.body;
  const user_id = req.user!.id;
  try {
    const id = uuidv4();
    await pool.execute(
      `INSERT INTO bookings (id, user_id, worker_id, service_id, scheduled_at, address, notes, status, payment_status)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'pending', 'unpaid')`,
      [id, user_id, worker_id, service_id, scheduled_at, address, notes]
    );
    const [rows]: any = await pool.execute('SELECT * FROM bookings WHERE id = ?', [id]);
    return res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
});

// GET /bookings/:id
router.get('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  try {
    const [rows]: any = await pool.execute(`
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
      WHERE b.id = ?
    `, [id]);
    if (!rows[0]) return res.status(404).json({ error: 'Booking not found' });
    return res.json(rows[0]);
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
      const [workerResult]: any = await pool.execute('SELECT id FROM workers WHERE user_id = ?', [user_id]);
      const workerId = workerResult[0]?.id;
      if (!workerId) return res.json([]);
      
      query = `
        SELECT b.*, u.name as client_name, s.name as service_name, s.base_price
        FROM bookings b
        JOIN users u ON u.id = b.user_id
        JOIN services s ON s.id = b.service_id
        WHERE b.worker_id = ?
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
        WHERE b.user_id = ?
        ORDER BY b.created_at DESC
      `;
      params = [user_id];
    }
    const [rows]: any = await pool.execute(query, params);
    return res.json(rows);
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
    await pool.execute(
      'UPDATE bookings SET status=? WHERE id=?',
      [status, id]
    );
    const [rows]: any = await pool.execute('SELECT * FROM bookings WHERE id = ?', [id]);
    return res.json(rows[0]);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
});

export default router;
