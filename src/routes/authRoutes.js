const express = require('express');
const router = express.Router();
const User = require('../models/User'); // Impor model (yang berisi controller)
const upload = require('../utils/fileUploader'); // Impor Multer

// --- Definisi Rute ---

// Rute Registrasi (dengan upload foto)
router.get('/register', User.handleGetRegisterPage);
router.post('/register', upload.single('profilePicture'), User.handleRegisterUser);

// Rute Login
router.get('/login', User.handleGetLoginPage);
router.post('/login', User.handleLoginUser);

// Rute Logout
router.get('/logout', User.handleLogoutUser);

module.exports = router;