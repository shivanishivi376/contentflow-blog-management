import express from 'express';
import cors from 'cors';
import './models/index.js';
import AppError from './utils/AppError.js';
import errorMiddleware from './middleware/errorMiddleware.js';
import validateRequest from './middleware/validateRequest.js';
import { healthCheckSchema } from './validators/health.validator.js';
import { authLimiter, publicLimiter } from './middleware/rateLimiter.js';
import authRoutes from './routes/authRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import subcategoryRoutes from './routes/subcategoryRoutes.js';
import keywordRoutes from './routes/keywordRoutes.js';
import interestRoutes from './routes/interestRoutes.js';
import permissionRoutes from './routes/permissionRoutes.js';
import roleRoutes from './routes/roleRoutes.js';
import onboardingRoutes from './routes/onboardingRoutes.js';
import teamRoutes from './routes/teamRoutes.js';
import invitationRoutes from './routes/invitationRoutes.js';
import smtpRoutes from './routes/smtpRoutes.js';
import blogRoutes from './routes/blogRoutes.js';
import mediaRoutes from './routes/mediaRoutes.js';
import commentRoutes from './routes/commentRoutes.js';
import publicRoutes from './routes/publicRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import userRoutes from './routes/userRoutes.js';

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Routes
app.get('/api/health', validateRequest(healthCheckSchema, 'query'), (req, res) => {
  res.status(200).json({
    success: true,
    message: 'API is running'
  });
});

app.use('/api/public', publicLimiter, publicRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/users', userRoutes);
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/admin/smtp', smtpRoutes);
app.use('/api/blogs', blogRoutes);
app.use('/api/media', mediaRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/subcategories', subcategoryRoutes);
app.use('/api/keywords', keywordRoutes);
app.use('/api/interests', interestRoutes);
app.use('/api/permissions', permissionRoutes);
app.use('/api/roles', roleRoutes);
app.use('/api/onboarding', onboardingRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/invitations', invitationRoutes);

app.use((req, res, next) => {
  next(new AppError('Route not found', 404, 'ROUTE_NOT_FOUND'));
});

app.use(errorMiddleware);

export default app;
