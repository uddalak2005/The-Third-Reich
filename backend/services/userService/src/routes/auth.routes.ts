import { registerUser, loginUser, getUser } from '../controllers/user.controller';
import Router from 'express';

const router = Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get("/me", getUser);

export default router;
