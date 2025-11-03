const express = require('express');
const router = express.Router();
const User = require('../models/User'); // Impor model (yang berisi controller)

// --- Definisi Rute ---

router.get('/register', User.handleGetRegisterPage);
router.post('/register', User.handleRegisterUser);
router.get('/login', User.handleGetLoginPage);
router.post('/login', User.handleLoginUser);
router.get('/logout', User.handleLogoutUser);

module.exports = router;