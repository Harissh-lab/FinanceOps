import { Role } from '@prisma/client';
import { Router } from 'express';
import { requireAuth } from '../../middlewares/auth';
import { requireRole } from '../../middlewares/role';
import { validateRequest } from '../../middlewares/validate';
import { createUser, deleteUser, getUserById, listUsers, updateUser } from './users.controller';
import {
  createUserSchema,
  updateUserSchema,
  userIdParamSchema,
  userListQuerySchema,
} from './users.schemas';

const router = Router();

router.use(requireAuth, requireRole(Role.ADMIN));

router.post('/', validateRequest({ body: createUserSchema }), createUser);
router.get('/', validateRequest({ query: userListQuerySchema }), listUsers);
router.get('/:id', validateRequest({ params: userIdParamSchema }), getUserById);
router.patch(
  '/:id',
  validateRequest({ params: userIdParamSchema, body: updateUserSchema }),
  updateUser,
);
router.delete('/:id', validateRequest({ params: userIdParamSchema }), deleteUser);

export default router;
