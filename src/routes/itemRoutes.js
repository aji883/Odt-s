const express = require('express');
const router = express.Router();
const { isLoggedIn } = require('../middleware/authMiddleware');
const upload = require('../utils/fileUploader');
const Item = require('../models/Item');
const fs = require('fs');
const path = require('path');

// --- Logika Controller Dimasukkan Langsung ---

/**
 * @desc    Menampilkan halaman utama (Homepage)
 * @route   GET /
 */
const getHomepage = async (req, res) => {
    try {
        const items = await Item.findAllWithLimit(6); // Pastikan fungsi ini ada di Item Model
        res.render('index', {
            title: "Selamat Datang di Odt's",
            items: items
        });
    } catch (error) {
         console.error("Error get homepage items:", error);
         const dummyItems = [
             { id: 1, title: 'Gagal Memuat Data', image_url: 'uploads/placeholder.jpg', author: 'Sistem' },
             { id: 2, title: 'Coba Lagi Nanti', image_url: 'uploads/placeholder.jpg', author: 'Sistem' }
         ];
         res.render('index', { title: "Selamat Datang di Odt's", items: dummyItems });
    }
};

/**
 * @desc    Menampilkan halaman form untuk menambah item baru
 * @route   GET /items/new
 */
const getNewItemForm = (req, res) => {
    res.render('newItem', {
        title: 'Upload Item Baru'
    });
};

/**
 * @desc    Memproses dan menyimpan data item baru ke database
 * @route   POST /items
 */
const createItem = async (req, res) => {
    try {
        const { title, description, category, size, status, price } = req.body;
        const userId = req.session.userId;

        if (!req.file) {
            return res.status(400).send('Silakan upload sebuah gambar.');
        }

        const imageUrl = req.file.path.replace(/\\/g, "/");

        const newItem = {
            title,
            description,
            category,
            size,
            status,
            price: status === 'Dijual' ? price : null,
            imageUrl,
            userId
        };

        await Item.create(newItem);

        res.redirect('/user/profile');
    } catch (error) {
        console.error('Error saat membuat item:', error);
        res.status(500).send('Terjadi error saat membuat item.');
    }
};

/**
 * @desc    Menampilkan halaman detail untuk satu item
 * @route   GET /items/:id
 */
const getItemDetails = async (req, res) => {
    try {
        const itemId = req.params.id;
        const item = await Item.findById(itemId); // Mengambil data item + owner_username

        if (!item) {
            return res.status(404).send('Item tidak ditemukan.');
        }

        const isOwner = req.session.userId === item.user_id;

        res.render('itemDetail', {
            title: item.title,
            item: item,
            isOwner: isOwner
        });
    } catch (error) {
        console.error("Error get item details:", error);
        res.status(500).send('Error Server');
    }
};

/**
 * @desc    Menampilkan halaman form untuk mengedit item
 * @route   GET /items/:id/edit
 */
const getEditItemForm = async (req, res) => {
    try {
        const itemId = req.params.id;
        const item = await Item.findById(itemId);

        if (!item || item.user_id !== req.session.userId) {
            return res.status(404).send('Item tidak ditemukan atau Anda tidak berhak mengeditnya.');
        }

        res.render('editItem', {
            title: `Edit Item: ${item.title}`,
            item: item
        });
    } catch (error) {
        console.error("Error get edit form:", error);
        res.status(500).send('Error Server');
    }
};

/**
 * @desc    Memproses update data item
 * @route   POST /items/:id/edit
 */
const updateItem = async (req, res) => {
    try {
        const itemId = req.params.id;
        const item = await Item.findById(itemId);

        if (!item || item.user_id !== req.session.userId) {
            return res.status(403).send('Akses ditolak.');
        }

        const { title, description, category, size, status, price } = req.body;
        let currentImageUrl = item.image_url;

        let newImageUrl;
        if (req.file) {
            newImageUrl = req.file.path.replace(/\\/g, "/");
        }

        const updatedData = {
            title,
            description,
            category,
            size,
            status,
            price: status === 'Dijual' ? price : null,
            imageUrl: newImageUrl // Akan undefined jika req.file tidak ada
        };

        const updated = await Item.update(itemId, updatedData);

        if (updated && newImageUrl && currentImageUrl && fs.existsSync(currentImageUrl)) {
             try { fs.unlinkSync(currentImageUrl); } catch(err){ console.error("Gagal hapus gambar lama:", err); }
        }

        res.redirect('/user/profile');
    } catch (error) {
        console.error("Error update item:", error);
        res.status(500).send('Error Server');
    }
};

/**
 * @desc    Memproses penghapusan item
 * @route   POST /items/:id/delete
 */
const deleteItem = async (req, res) => {
    try {
        const itemId = req.params.id;
        const item = await Item.findById(itemId);

        if (!item || item.user_id !== req.session.userId) {
            return res.status(403).send('Akses ditolak.');
        }

        const deleted = await Item.deleteById(itemId);

        if (deleted && item.image_url && fs.existsSync(item.image_url)) {
             try { fs.unlinkSync(item.image_url); } catch(err){ console.error("Gagal hapus gambar:", err); }
        }

        res.redirect('/user/profile');
    } catch (error) {
        console.error("Error delete item:", error);
        res.status(500).send('Error Server');
    }
};


// --- Definisi Rute ---

// Rute Halaman Utama
router.get('/', getHomepage);

// Rute Tambah Item
router.get('/items/new', isLoggedIn, getNewItemForm);
router.post('/items', isLoggedIn, upload.single('itemImage'), createItem);

// Rute Halaman Detail Item
router.get('/items/:id', getItemDetails);

// Rute Edit Item
router.get('/items/:id/edit', isLoggedIn, getEditItemForm);
router.post('/items/:id/edit', isLoggedIn, upload.single('itemImage'), updateItem);

// Rute Hapus Item
router.post('/items/:id/delete', isLoggedIn, deleteItem);

module.exports = router;