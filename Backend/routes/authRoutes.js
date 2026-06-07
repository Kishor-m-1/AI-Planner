import express from 'express';
// Double check your authController file to see if your functions are named register and login
import { login, register } from '../controllers/authController.js';

const router = express.Router();

// Route mappings
router.post('/register', register);
router.post('/login', login);

export default router;