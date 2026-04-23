import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth';
import workerRoutes from './routes/workers';
import serviceRoutes from './routes/services';
import bookingRoutes from './routes/bookings';
import paymentRoutes from './routes/payments';
import reviewRoutes from './routes/reviews';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:3000', credentials: true }));
app.use(express.json());

app.get('/health', (_req, res) => res.json({ status: 'ok', service: 'ShramSetu API' }));

app.use('/auth', authRoutes);
app.use('/workers', workerRoutes);
app.use('/services', serviceRoutes);
app.use('/bookings', bookingRoutes);
app.use('/payments', paymentRoutes);
app.use('/reviews', reviewRoutes);

app.listen(PORT, () => {
  console.log(`🚀 ShramSetu API running on http://localhost:${PORT}`);
});

export default app;
