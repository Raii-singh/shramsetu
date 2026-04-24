import { Router, Request, Response } from 'express';
import pool from '../utils/db';

const router = Router();

// GET /services
router.get('/', async (_req: Request, res: Response) => {
  try {
    const [rows]: any = await pool.execute('SELECT * FROM services ORDER BY category, name');
    return res.json(rows);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
});

export default router;
