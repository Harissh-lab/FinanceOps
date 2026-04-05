import { Router } from 'express';
import { requireAuth } from '../../middlewares/auth';
import {
  getCategoryBreakdown,
  getHealthScore,
  getRecentTransactions,
  getSummary,
  getTrends,
} from './dashboard.controller';

const router = Router();

router.use(requireAuth);

router.get('/summary', getSummary);
router.get('/trends', getTrends);
router.get('/categories', getCategoryBreakdown);
router.get('/recent', getRecentTransactions);
router.get('/health-score', getHealthScore);

export default router;
