const express = require('express');
const router = express.Router();
const { isLoggedIn, isAdmin } = require('../middleware/authMiddleware');
const User = require('../models/User');
const Item = require('../models/Item');
const fs = require('fs');
const path = require('path');

// --- Logika Controller Dimasukkan Langsung ---

/**
 * @desc    Menampilkan dashboard admin
 * @route   GET /admin/dashboard
 */
const getAdminDashboard = async (req, res) => {
    try {
        // Ambil data untuk statistik
        const users = await User.findAll();
        const items = await Item.findAll(); // Pastikan Item.findAll() ada di model
        
        // Render file dashboard.ejs
        res.render('admin/dashboard', {
            title: 'Dashboard Admin',
            userCount: users.length,
            itemCount: items.length
        });
    } catch (error) {
        console.error("Error get admin dashboard:", error);
        res.status(500).send('Error Server');
    }
};

/**
 * @desc    Menampilkan daftar semua pengguna
 * @route   GET /admin/users
 */
const getAllUsers = async (req, res) => {
    try {
        const users = await User.findAll();
        res.render('admin/users', {
            title: 'Manajemen Pengguna',
            users: users,
            layout: false // Sesuaikan jika Anda pakai layout
        });
    } catch (error) {
        console.error("Error mengambil semua user:", error);
        res.status(500).send('Error Server');
    }
};

/**
 * @desc    Menghapus pengguna (sebagai admin)
 * @route   POST /admin/users/:id/delete
 */
const deleteUser = async (req, res) => {
    try {
        const userIdToDelete = req.params.id;
        if (req.session.userId == userIdToDelete) {
             return res.status(400).send('Admin tidak bisa menghapus akunnya sendiri.');
        }
        await User.deleteById(userIdToDelete);
        res.redirect('/admin/users');
    } catch (error) {
        console.error("Error menghapus user:", error);
        res.status(500).send('Error Server');
    }
};

/**
 * @desc    Menampilkan semua item dari semua pengguna untuk moderasi
 * @route   GET /admin/items
 */
const getModerationFeed = async (req, res) => {
    try {
        const items = await Item.findAll();
        res.render('admin/items', {
            title: 'Moderasi Konten Item',
            items: items,
            layout: false // Sesuaikan jika Anda pakai layout
        });
    } catch (error) {
        console.error("Error mengambil semua item:", error);
        res.status(500).send('Error Server');
    }
};

/**
 * @desc    Menghapus item (sebagai admin)
 * @route   POST /admin/items/:id/delete
 */
const deleteItemByAdmin = async (req, res) => {
    try {
        const itemId = req.params.id;
        const item = await Item.findById(itemId);

        if (!item) {
            return res.status(404).send('Item tidak ditemukan.');
        }

        const deleted = await Item.deleteById(itemId);

        if (deleted && item.image_url && fs.existsSync(item.image_url)) {
            try { fs.unlinkSync(item.image_url); } catch(err){ console.error(err); }
        }
        
        res.redirect('/admin/items'); // Kembali ke halaman moderasi item
    } catch (error) {
        console.error("Error delete item by admin:", error);
        res.status(500).send('Error Server');
    }
};

/**
 * @desc    Memblokir seorang pengguna
 * @route   POST /admin/users/:id/ban
 */
const banUser = async (req, res) => {
    try {
        const userIdToBan = req.params.id;
        if (req.session.userId == userIdToBan) {
            return res.status(400).send('Tidak bisa memblokir akun sendiri.');
        }
        await User.updateStatus(userIdToBan, 'banned');
        res.redirect('/admin/users');
    } catch (error) {
        console.error("Error memblokir user:", error);
        res.status(500).send('Error Server');
    }
};

/**
 * @desc    Membuka blokir seorang pengguna
 * @route   POST /admin/users/:id/unban
 */
const unbanUser = async (req, res) => {
    try {
        const userIdToUnban = req.params.id;
        await User.updateStatus(userIdToUnban, 'active');
        res.redirect('/admin/users');
    } catch (error) {
        console.error("Error membuka blokir user:", error);
        res.status(500).send('Error Server');
    }
};


// --- Definisi Rute ---

// Proteksi semua rute di bawah ini agar hanya bisa diakses oleh Admin yang sudah login
router.use(isLoggedIn, isAdmin); 

// Rute Dashboard
router.get('/dashboard', getAdminDashboard);

// Rute Manajemen Pengguna
router.get('/users', getAllUsers);
router.post('/users/:id/delete', deleteUser);
router.post('/users/:id/ban', banUser);
router.post('/users/:id/unban', unbanUser);

// Rute Moderasi Konten
router.get('/items', getModerationFeed);
router.post('/items/:id/delete', deleteItemByAdmin);

module.exports = router;