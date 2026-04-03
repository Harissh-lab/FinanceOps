import { Router } from 'express';
import { validateRequest } from '../../middlewares/validate';
import { forgotPassword, login, logout, refreshToken, register, resetPassword } from './auth.controller';
import {
	forgotPasswordSchema,
	loginSchema,
	refreshSchema,
	registerSchema,
	resetPasswordSchema,
} from './auth.schemas';

const router = Router();

router.post('/register', validateRequest({ body: registerSchema }), register);
router.post('/login', validateRequest({ body: loginSchema }), login);
router.post('/forgot-password', validateRequest({ body: forgotPasswordSchema }), forgotPassword);
router.post('/reset-password', validateRequest({ body: resetPasswordSchema }), resetPassword);
router.post('/refresh', validateRequest({ body: refreshSchema }), refreshToken);
router.post('/logout', validateRequest({ body: refreshSchema }), logout);

export default router;
