const express = require('express');
const router = express.Router();
const { isLoggedIn } = require('../middleware/authMiddleware');
const Item = require('../models/Item'); // Impor model langsung di sini

/**
 * @desc    Menampilkan halaman profil pengguna (Lemari Virtual)
 * @route   GET /user/profile
 */
router.get('/profile', isLoggedIn, async (req, res) => {
    try {
        const { userId, username, email } = req.session;

        // MENGAMBIL DATA ASLI DARI DATABASE
        // Menggunakan fungsi findByUserId yang ada di Item model
        const userItems = await Item.findByUserId(userId);

        // Me-render file 'profile.ejs' dan mengirimkan data asli dari database
        res.render('profile', {
            title: 'LemaRI-ku',
            username: username,
            email: email,
            items: userItems, // Variabel 'items' sekarang berisi data asli
            bodyClass: 'page-profile'
        });
    } catch (error) {
        console.error("Error saat mengambil item profil:", error);
        res.status(500).send('Terjadi error di server');
    }
});

module.exports = router;