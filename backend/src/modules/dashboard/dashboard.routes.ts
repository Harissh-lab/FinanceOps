import { Router } from 'express';
import { requireAuth } from '../../middlewares/auth';
import {
  getCategoryBreakdown,
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

export default router;
