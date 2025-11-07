const express = require('express');
const router = express.Router();
const { isLoggedIn } = require('../middleware/authMiddleware');
const upload = require('../utils/fileUploader');
const Item = require('../models/Item');
const Favorite = require('../models/Favorite'); // <-- Impor model Favorite

// Rute Halaman Utama
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

// Rute Explore (sudah di /items)
router.get('/items', Item.handleGetExplorePage);

// --- RUTE BARU UNTUK FAVORIT ---
router.post('/items/:id/favorite', isLoggedIn, Favorite.handleToggleFavorite);

module.exports = router;