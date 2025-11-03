const express = require('express');
const router = express.Router();

// Impor middleware
const { isLoggedIn } = require('../middleware/authMiddleware');
const upload = require('../utils/fileUploader');

// Impor model (yang sudah berisi logika controller)
const Item = require('../models/Item');
const User = require('../models/User'); // Pastikan User diimpor untuk pencarian
const fs = require('fs');
const path = require('path');

// --- Logika Controller Dimasukkan Langsung ---

// ... (Semua fungsi handler Anda: handleGetHomepage, handleCreateItem, dll.) ...

/**
 * @desc    Menampilkan halaman Explore (Item Acak atau Pencarian User)
 * @route   GET /items
 */
const handleGetExplorePage = async (req, res) => {
    try {
        const searchQuery = req.query.search;
        let items = [];
        let userResults = [];

        if (searchQuery) {
            // Jika ada query pencarian, cari pengguna
            userResults = await User.searchByUsername(searchQuery);
        } else {
            // Jika tidak ada, tampilkan semua item (diacak)
            items = await Item.findAll(); // Mengambil semua item
            items.sort(() => 0.5 - Math.random()); // Acak array
        }

        res.render('explore', { // Tetap render view 'explore.ejs'
            title: 'Explore',
            items: items,
            userResults: userResults,
            searchQuery: searchQuery || ''
        });
    } catch (error) {
        console.error("Error get explore page:", error);
        res.status(500).send('Error Server');
    }
};

// ... (Semua fungsi handler lainnya: handleGetItemDetails, handleUpdateItem, dll.) ...


// --- Definisi Rute ---

router.get('/', Item.handleGetHomepage);

// Rute Tambah Item
router.get('/items/new', isLoggedIn, Item.handleGetNewItemForm);
router.post('/items', isLoggedIn, upload.single('itemImage'), Item.handleCreateItem);

// Rute Halaman Detail Item
router.get('/items/:id', Item.handleGetItemDetails);

// Rute Edit Item
router.get('/items/:id/edit', isLoggedIn, Item.handleGetEditItemForm);
router.post('/items/:id/edit', isLoggedIn, upload.single('itemImage'), Item.handleUpdateItem);

// Rute Hapus Item
router.post('/items/:id/delete', isLoggedIn, Item.handleDeleteItem);

// Rute Explore (DIUBAH KE /items)
router.get('/items', handleGetExplorePage); // <-- PERUBAHAN DI SINI

module.exports = router;