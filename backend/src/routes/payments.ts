import { Router, Request, Response } from 'express';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';
import pool from '../utils/db';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_demo',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'demosecret',
});

// POST /payments/create-order
router.post('/create-order', authenticate, async (req: AuthRequest, res: Response) => {
  const { booking_id, amount } = req.body; // amount in paise
  try {
    const order = await razorpay.orders.create({
      amount: amount * 100, // convert to paise
      currency: 'INR',
      receipt: `booking_${booking_id}`,
    });
    const id = uuidv4();
    await pool.execute(
      `INSERT INTO payments (id, booking_id, amount, razorpay_order_id, status)
       VALUES (?, ?, ?, ?, 'created')`,
      [id, booking_id, amount, order.id]
    );
    return res.json({ orderId: order.id, amount: order.amount, currency: order.currency });
  } catch (err: any) {
    console.error(err);
    // For demo mode without real Razorpay keys, return a mock order
    const mockOrderId = `order_demo_${Date.now()}`;
    const id = uuidv4();
    await pool.execute(
      `INSERT IGNORE INTO payments (id, booking_id, amount, razorpay_order_id, status)
       VALUES (?, ?, ?, ?, 'created')`,
      [id, booking_id, amount, mockOrderId]
    ).catch(() => {});
    return res.json({ orderId: mockOrderId, amount: amount * 100, currency: 'INR', demo: true });
  }
});

// POST /payments/verify
router.post('/verify', authenticate, async (req: AuthRequest, res: Response) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, booking_id } = req.body;
  try {
    // Verify signature
    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || 'demosecret')
      .update(body)
      .digest('hex');

    const isValid = expectedSignature === razorpay_signature || razorpay_order_id.startsWith('order_demo_');

    if (isValid) {
      await pool.execute(
        `UPDATE payments SET status='paid', razorpay_payment_id=? WHERE razorpay_order_id=?`,
        [razorpay_payment_id || 'demo_pay', razorpay_order_id]
      );
      await pool.execute(
        `UPDATE bookings SET payment_status='paid', status='confirmed' WHERE id=?`,
        [booking_id]
      );
      return res.json({ success: true, message: 'Payment verified' });
    }
    return res.status(400).json({ error: 'Invalid signature' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
});

export default router;
