const express = require('express');
const router = express.Router();
const { isLoggedIn } = require('../middleware/authMiddleware');
const Item = require('../models/Item');
const User = require('../models/User');
const Favorite = require('../models/Favorite');
const upload = require('../utils/fileUploader'); // <-- PERBAIKAN: TAMBAHKAN IMPOR INI

/**
 * @desc    [PRIBADI] Menampilkan halaman profil PENGGUNA YANG LOGIN
 * @route   GET /user/profile
 */
router.get('/profile', isLoggedIn, async (req, res) => {
    try {
        const { userId, username, email, phoneNumber, profilePicture } = req.session;
        const userItems = await Item.findByUserId(userId);

        res.render('profile', {
            title: 'LemaRI-ku',
            username: username,
            email: email,
            phoneNumber: phoneNumber,
            profilePicture: profilePicture,
            items: userItems,
            bodyClass: 'page-profile'
        });
    } catch (error) {
        console.error("Error saat mengambil item profil:", error);
        res.status(500).send('Terjadi error di server');
    }
});

/**
 * @desc    [PRIBADI] Menampilkan halaman Item Favorit
 * @route   GET /user/favorites
 */
router.get('/favorites', isLoggedIn, Favorite.handleGetFavoritesPage);

/**
 * @desc    [PRIBADI] Menampilkan halaman form Edit Profil
 * @route   GET /user/profile/edit
 */
router.get('/profile/edit', isLoggedIn, User.handleGetEditProfilePage);

/**
 * @desc    [PRIBADI] Memproses update data profil
 * @route   POST /user/profile/edit
 */
router.post('/profile/edit', isLoggedIn, upload.single('profilePicture'), User.handleUpdateProfile);

/**
 * @desc    [PUBLIK] Menampilkan halaman profil PENGGUNA LAIN
 * @route   GET /user/:id
 */
router.get('/:id', async (req, res) => {
    try {
        const userId = req.params.id;
        
        if (req.session.userId == userId) {
            return res.redirect('/user/profile');
        }

        const profileUser = await User.findById(userId);
        if (!profileUser) {
            return res.status(404).send('Pengguna tidak ditemukan.');
        }

        const userItems = await Item.findByUserId(userId);

        res.render('publicProfile', {
            title: profileUser.username,
            profileUser: profileUser,
            items: userItems,
            bodyClass: 'page-profile'
        });
    } catch (error) {
        console.error("Error saat mengambil profil publik:", error);
        res.status(500).send('Terjadi error di server');
    }
});

module.exports = router;