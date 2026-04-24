import { Router, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import pool from '../utils/db';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();

// POST /reviews
router.post('/', authenticate, async (req: AuthRequest, res: Response) => {
  const { worker_id, booking_id, rating, comment } = req.body;
  const user_id = req.user!.id;
  if (!worker_id || !rating) return res.status(400).json({ error: 'worker_id and rating required' });
  try {
    const id = uuidv4();
    await pool.execute(
      `INSERT INTO reviews (id, user_id, worker_id, booking_id, rating, comment)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [id, user_id, worker_id, booking_id || null, rating, comment || '']
    );
    const [rows]: any = await pool.execute('SELECT * FROM reviews WHERE id = ?', [id]);
    return res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
});

// GET /reviews/worker/:id
router.get('/worker/:id', async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  try {
    const [rows]: any = await pool.execute(`
      SELECT r.*, u.name as reviewer_name
      FROM reviews r
      JOIN users u ON u.id = r.user_id
      WHERE r.worker_id = ?
      ORDER BY r.created_at DESC
    `, [id]);
    return res.json(rows);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
});

export default router;
