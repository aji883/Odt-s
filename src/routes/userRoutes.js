const express = require('express');
const router = express.Router();
const { isLoggedIn } = require('../middleware/authMiddleware');
const Item = require('../models/Item');
const User = require('../models/User');

/**
 * @desc    [PRIBADI] Menampilkan halaman profil PENGGUNA YANG LOGIN
 * @route   GET /user/profile
 * @note    Rute ini HARUS di atas '/user/:id'
 */
router.get('/profile', isLoggedIn, async (req, res) => {
    try {
        const { userId, username, email } = req.session;
        const userItems = await Item.findByUserId(userId);

        res.render('profile', { // Render profile.ejs
            title: 'LemaRI-ku',
            username: username,
            email: email,
            items: userItems,
            bodyClass: 'page-profile'
        });
    } catch (error) {
        console.error("Error saat mengambil item profil:", error);
        res.status(500).send('Terjadi error di server');
    }
});

/**
 * @desc    [PUBLIK] Menampilkan halaman profil PENGGUNA LAIN
 * @route   GET /user/:id
 */
router.get('/:id', async (req, res) => {
    try {
        const userId = req.params.id;
        
        // Cek jika user mencoba melihat profilnya sendiri via link publik
        if (req.session.userId == userId) {
            return res.redirect('/user/profile');
        }

        const profileUser = await User.findById(userId);

        if (!profileUser) {
            return res.status(404).send('Pengguna tidak ditemukan.');
        }

        const userItems = await Item.findByUserId(userId);

        res.render('publicProfile', { // Render view BARU: publicProfile.ejs
            title: profileUser.username,
            profileUser: profileUser,
            items: userItems,
            bodyClass: 'page-profile' // Menggunakan style CSS yang sama
        });
    } catch (error) {
        console.error("Error saat mengambil profil publik:", error);
        res.status(500).send('Terjadi error di server');
    }
});

module.exports = router;