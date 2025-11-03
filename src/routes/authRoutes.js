const express = require('express');
const router = express.Router();
const User = require('../models/User'); // Impor model
const bcrypt = require('bcryptjs'); // Impor bcrypt

// --- Logika Controller Dimasukkan Langsung ---

const getLoginPage = (req, res) => {
    res.render('login', { title: 'Login ke Odt\'s' });
};

const getRegisterPage = (req, res) => {
    res.render('register', { title: 'Daftar Akun Baru' });
};

const registerUser = async (req, res) => {
    try {
        const { username, email, password } = req.body;
        const userExists = await User.findByEmail(email);
        if (userExists) {
            return res.status(400).send('Email sudah terdaftar.');
        }
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        await User.create({ username, email, password: hashedPassword });
        res.redirect('/auth/login');
    } catch (error) {
        console.error(error);
        res.status(500).send('Terjadi error saat registrasi.');
    }
};

const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findByEmail(email);
        if (!user) {
            return res.status(400).send('Email atau password salah.');
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).send('Email atau password salah.');
        }
        req.session.userId = user.id;
        req.session.username = user.username;
        req.session.email = user.email;
        req.session.role = user.role; // Menyimpan role saat login
        res.redirect('/user/profile');
    } catch (error) {
        console.error(error);
        res.status(500).send('Terjadi error saat login.');
    }
};

const logoutUser = (req, res) => {
    req.session.destroy(err => {
        if (err) return res.redirect('/');
        res.clearCookie('connect.sid');
        res.redirect('/auth/login');
    });
};


// --- Definisi Rute ---

router.get('/register', getRegisterPage);
router.post('/register', registerUser);
router.get('/login', getLoginPage);
router.post('/login', loginUser);
router.get('/logout', logoutUser);

module.exports = router;
