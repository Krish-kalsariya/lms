import express from 'express';
import { register, login, logout, getUserProfile, updateProfile } from '../controllers/user.controller.js';

const router = express.Router();

// register
router.post('/register', register);
// login
router.post('/login', login);
// logout
router.post('/logout', logout);
// get profile
router.get('/profile', isAuthenticated, getUserProfile);
// update profile
router.put('/profile/update',isAuthenticated,upload.single('profilePhoto'),updateProfile);

export default router;
