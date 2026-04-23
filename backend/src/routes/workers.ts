import { Router, Request, Response } from 'express';
import pool from '../utils/db';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();

// GET /workers?service=electrician&location=Delhi&page=1
router.get('/', async (req: Request, res: Response) => {
  const { service, location, page = 1, limit = 12 } = req.query;
  const offset = (Number(page) - 1) * Number(limit);
  try {
    let query = `
      SELECT w.*, u.name, u.phone, u.email,
        (SELECT AVG(rating) FROM reviews WHERE worker_id = w.id) as avg_rating,
        (SELECT COUNT(*) FROM reviews WHERE worker_id = w.id) as review_count
      FROM workers w
      JOIN users u ON u.id = w.user_id
      WHERE 1=1
    `;
    const params: any[] = [];
    let idx = 1;
    if (service) {
      query += ` AND $${idx} = ANY(w.skills)`;
      params.push(service);
      idx++;
    }
    if (location) {
      query += ` AND w.location ILIKE $${idx}`;
      params.push(`%${location}%`);
      idx++;
    }
    query += ` ORDER BY avg_rating DESC NULLS LAST LIMIT $${idx} OFFSET $${idx + 1}`;
    params.push(Number(limit), offset);
    const result = await pool.query(query, params);
    const countResult = await pool.query(`SELECT COUNT(*) FROM workers w JOIN users u ON u.id = w.user_id WHERE 1=1`);
    return res.json({ workers: result.rows, total: parseInt(countResult.rows[0].count) });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
});

// GET /workers/:id
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await pool.query(`
      SELECT w.*, u.name, u.phone, u.email,
        COALESCE((SELECT AVG(rating) FROM reviews WHERE worker_id = w.id), 0) as avg_rating,
        (SELECT COUNT(*) FROM reviews WHERE worker_id = w.id) as review_count
      FROM workers w
      JOIN users u ON u.id = w.user_id
      WHERE w.id = $1
    `, [id]);
    if (!result.rows[0]) return res.status(404).json({ error: 'Worker not found' });
    return res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
});

// POST /workers — create worker profile
router.post('/', authenticate, async (req: AuthRequest, res: Response) => {
  const { skills, experience, bio, location, pricing } = req.body;
  const userId = req.user!.id;
  try {
    const existing = await pool.query('SELECT id FROM workers WHERE user_id = $1', [userId]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'Worker profile already exists' });
    }
    const result = await pool.query(
      `INSERT INTO workers (user_id, skills, experience, bio, location, pricing, verification_status)
       VALUES ($1, $2, $3, $4, $5, $6, 'pending') RETURNING *`,
      [userId, skills, experience, bio, location, pricing]
    );
    // Update user role to worker
    await pool.query('UPDATE users SET role = $1 WHERE id = $2', ['worker', userId]);
    return res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
});

// PATCH /workers/:id — update worker profile
router.patch('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  const { skills, experience, bio, location, pricing } = req.body;
  const { id } = req.params;
  try {
    const result = await pool.query(
      `UPDATE workers SET skills=$1, experience=$2, bio=$3, location=$4, pricing=$5
       WHERE id=$6 AND user_id=$7 RETURNING *`,
      [skills, experience, bio, location, pricing, id, req.user!.id]
    );
    if (!result.rows[0]) return res.status(404).json({ error: 'Not found' });
    return res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
});

export default router;
