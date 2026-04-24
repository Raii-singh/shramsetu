import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import pool from '../utils/db';

const router = Router();

// Helper to get worker ID
const getWorkerId = async (userId: string) => {
  const [rows]: any = await pool.execute('SELECT id FROM workers WHERE user_id = ?', [userId]);
  return rows[0]?.id || null;
};

// POST /auth/signup
router.post('/signup', async (req: Request, res: Response) => {
  const { name, phone, email, password, role = 'client' } = req.body;
  if (!name || !password || (!phone && !email)) {
    return res.status(400).json({ error: 'Name, password, and phone or email are required' });
  }
  try {
    const [existing]: any = await pool.execute(
      'SELECT id FROM users WHERE phone = ? OR email = ?',
      [phone || null, email || null]
    );
    if (existing.length > 0) {
      return res.status(409).json({ error: 'User already exists' });
    }
    const id = uuidv4();
    const hashed = await bcrypt.hash(password, 10);
    await pool.execute(
      `INSERT INTO users (id, name, phone, email, password_hash, role)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [id, name, phone || null, email || null, hashed, role]
    );
    
    const user = { id, name, phone, email, role, workerId: null };
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
    const [rows]: any = await pool.execute(
      'SELECT * FROM users WHERE phone = ? OR email = ?',
      [phone || null, email || null]
    );
    if (rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const user = rows[0];
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' });
    
    let workerId = null;
    if (user.role === 'worker') {
      workerId = await getWorkerId(user.id);
    }

    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET!, { expiresIn: '7d' });
    return res.json({ token, user: { id: user.id, name: user.name, phone: user.phone, email: user.email, role: user.role, workerId } });
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
    const [rows]: any = await pool.execute('SELECT id, name, phone, email, role FROM users WHERE id = ?', [decoded.id]);
    if (!rows[0]) return res.status(404).json({ error: 'User not found' });
    
    const user = rows[0];
    let workerId = null;
    if (user.role === 'worker') {
      workerId = await getWorkerId(user.id);
    }

    return res.json({ ...user, workerId });
  } catch {
    return res.status(401).json({ error: 'Invalid token' });
  }
});

export default router;
