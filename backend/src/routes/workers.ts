import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
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
    if (service) {
      query += ` AND JSON_CONTAINS(w.skills, JSON_QUOTE(?))`;
      params.push(service);
    }
    if (location) {
      query += ` AND w.location LIKE ?`;
      params.push(`%${location}%`);
    }
    query += ` ORDER BY avg_rating DESC LIMIT ? OFFSET ?`;
    params.push(Number(limit), offset);

    const [rows]: any = await pool.query(query, params);
    const [countRows]: any = await pool.execute(`SELECT COUNT(*) as count FROM workers w JOIN users u ON u.id = w.user_id WHERE 1=1`);
    
    return res.json({ workers: rows, total: countRows[0].count });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
});

// GET /workers/:id
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const [rows]: any = await pool.execute(`
      SELECT w.*, u.name, u.phone, u.email,
        COALESCE((SELECT AVG(rating) FROM reviews WHERE worker_id = w.id), 0) as avg_rating,
        (SELECT COUNT(*) FROM reviews WHERE worker_id = w.id) as review_count
      FROM workers w
      JOIN users u ON u.id = w.user_id
      WHERE w.id = ?
    `, [id]);
    if (!rows[0]) return res.status(404).json({ error: 'Worker not found' });
    return res.json(rows[0]);
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
    const [existing]: any = await pool.execute('SELECT id FROM workers WHERE user_id = ?', [userId]);
    if (existing.length > 0) {
      return res.status(409).json({ error: 'Worker profile already exists' });
    }
    const id = uuidv4();
    await pool.execute(
      `INSERT INTO workers (id, user_id, skills, experience, bio, location, pricing, verification_status)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'pending')`,
      [id, userId, JSON.stringify(skills), experience, bio, location, JSON.stringify(pricing)]
    );
    // Update user role to worker
    await pool.execute('UPDATE users SET role = ? WHERE id = ?', ['worker', userId]);
    
    const [newWorker]: any = await pool.execute('SELECT * FROM workers WHERE id = ?', [id]);
    return res.status(201).json(newWorker[0]);
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
    await pool.execute(
      `UPDATE workers SET skills=?, experience=?, bio=?, location=?, pricing=?
       WHERE id=? AND user_id=?`,
      [JSON.stringify(skills), experience, bio, location, JSON.stringify(pricing), id, req.user!.id]
    );
    const [updated]: any = await pool.execute('SELECT * FROM workers WHERE id = ?', [id]);
    if (!updated[0]) return res.status(404).json({ error: 'Not found' });
    return res.json(updated[0]);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
});

export default router;
