import { Role } from '@prisma/client';
import { Router } from 'express';
import { requireAuth } from '../../middlewares/auth';
import { requireRole } from '../../middlewares/role';
import { upload } from '../../middlewares/upload';
import { validateRequest } from '../../middlewares/validate';
import {
  createRecord,
  deleteRecord,
  getRecordById,
  importRecords,
  listRecords,
  updateRecord,
} from './records.controller';
import {
  createRecordSchema,
  importOptionsSchema,
  recordIdParamSchema,
  recordListQuerySchema,
  updateRecordSchema,
} from './records.schemas';

const router = Router();

router.use(requireAuth);

router.get(
  '/',
  requireRole(Role.ANALYST, Role.ADMIN),
  validateRequest({ query: recordListQuerySchema }),
  listRecords,
);
router.get(
  '/:id',
  requireRole(Role.ANALYST, Role.ADMIN),
  validateRequest({ params: recordIdParamSchema }),
  getRecordById,
);
router.post(
  '/import',
  requireRole(Role.ANALYST, Role.ADMIN),
  validateRequest({ query: importOptionsSchema }),
  upload.single('file'),
  importRecords,
);
router.post(
  '/',
  requireRole(Role.ANALYST, Role.ADMIN),
  validateRequest({ body: createRecordSchema }),
  createRecord,
);
router.patch(
  '/:id',
  requireRole(Role.ADMIN),
  validateRequest({ params: recordIdParamSchema, body: updateRecordSchema }),
  updateRecord,
);
router.delete('/:id', requireRole(Role.ADMIN), validateRequest({ params: recordIdParamSchema }), deleteRecord);

export default router;
