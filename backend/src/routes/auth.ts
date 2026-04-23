import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../utils/db';

const router = Router();

// POST /auth/signup
router.post('/signup', async (req: Request, res: Response) => {
  const { name, phone, email, password, role = 'client' } = req.body;
  if (!name || !password || (!phone && !email)) {
    return res.status(400).json({ error: 'Name, password, and phone or email are required' });
  }
  try {
    const existing = await pool.query(
      'SELECT id FROM users WHERE phone = $1 OR email = $2',
      [phone || null, email || null]
    );
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'User already exists' });
    }
    const hashed = await bcrypt.hash(password, 10);
    const result = await pool.query(
      `INSERT INTO users (name, phone, email, password_hash, role)
       VALUES ($1, $2, $3, $4, $5) RETURNING id, name, phone, email, role`,
      [name, phone || null, email || null, hashed, role]
    );
    const user = result.rows[0];
    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET!, { expiresIn: '7d' });
    return res.status(201).json({ token, user });
  } catch (err: any) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
});

// POST /auth/login
router.post('/login', async (req: Request, res: Response) => {
  const { phone, email, password } = req.body;
  if (!password || (!phone && !email)) {
    return res.status(400).json({ error: 'Credentials required' });
  }
  try {
    const result = await pool.query(
      'SELECT * FROM users WHERE phone = $1 OR email = $2',
      [phone || null, email || null]
    );
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const user = result.rows[0];
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' });
    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET!, { expiresIn: '7d' });
    return res.json({ token, user: { id: user.id, name: user.name, phone: user.phone, email: user.email, role: user.role } });
  } catch (err: any) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
});

// GET /auth/me
router.get('/me', async (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) return res.status(401).json({ error: 'Unauthorized' });
  try {
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: string };
    const result = await pool.query('SELECT id, name, phone, email, role FROM users WHERE id = $1', [decoded.id]);
    if (!result.rows[0]) return res.status(404).json({ error: 'User not found' });
    return res.json(result.rows[0]);
  } catch {
    return res.status(401).json({ error: 'Invalid token' });
  }
});

export default router;
