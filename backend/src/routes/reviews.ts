import { Router, Response } from 'express';
import pool from '../utils/db';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();

// POST /reviews
router.post('/', authenticate, async (req: AuthRequest, res: Response) => {
  const { worker_id, booking_id, rating, comment } = req.body;
  const user_id = req.user!.id;
  if (!worker_id || !rating) return res.status(400).json({ error: 'worker_id and rating required' });
  try {
    const result = await pool.query(
      `INSERT INTO reviews (user_id, worker_id, booking_id, rating, comment)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [user_id, worker_id, booking_id || null, rating, comment || '']
    );
    return res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
});

// GET /reviews/worker/:id
router.get('/worker/:id', async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  try {
    const result = await pool.query(`
      SELECT r.*, u.name as reviewer_name
      FROM reviews r
      JOIN users u ON u.id = r.user_id
      WHERE r.worker_id = $1
      ORDER BY r.created_at DESC
    `, [id]);
    return res.json(result.rows);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
});

export default router;
