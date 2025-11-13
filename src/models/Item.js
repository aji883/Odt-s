const db = require('../../config/db');
const fs = require('fs');
const path = require('path');
const Favorite = require('./Favorite');
const User = require('./User');

class Item {

    // --- 1. FUNGSI DATABASE MURNI (MODEL) ---

    static async create(newItem) {
        const { title, description, category, size, status, price, imageUrl, userId } = newItem;
        const sql = `INSERT INTO items (title, description, category, size, status, price, user_id, image_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
        const [result] = await db.execute(sql, [title, description, category, size, status, price, userId, imageUrl]);
        return result;
    }

    static async findByUserId(userId) {
        const sql = 'SELECT * FROM items WHERE user_id = ? ORDER BY created_at DESC';
        const [rows] = await db.execute(sql, [userId]);
        return rows;
    }

    /**
     * [FUNGSI YANG HILANG] Mencari item milik user yang BISA DI-SWAP
     */
    static async findSwappableByUserId(userId) {
        const sql = 'SELECT * FROM items WHERE user_id = ? AND status = "Bisa di-Swap" ORDER BY created_at DESC';
        const [rows] = await db.execute(sql, [userId]);
        return rows;
    }

    static async findById(id) {
        const sql = `
            SELECT
                i.*,
                u.username AS owner_username,
                COUNT(f.user_id) AS favorite_count
            FROM items i
            JOIN users u ON i.user_id = u.id
            LEFT JOIN favorites f ON i.id = f.item_id
            WHERE i.id = ?
            GROUP BY i.id, u.username
        `;
        const [rows] = await db.execute(sql, [id]);
        return rows[0];
    }

    static async update(id, itemData) {
        const { title, description, category, size, status, price, imageUrl } = itemData;
        let sql;
        let params;
        if (imageUrl !== undefined) {
            sql = `UPDATE items SET title = ?, description = ?, category = ?, size = ?, status = ?, price = ?, image_url = ? WHERE id = ?`;
            params = [title, description, category, size, status, price, imageUrl, id];
        } else {
            sql = `UPDATE items SET title = ?, description = ?, category = ?, size = ?, status = ?, price = ? WHERE id = ?`;
            params = [title, description, category, size, status, price, id];
        }
        const [result] = await db.execute(sql, params);
        return result.affectedRows > 0;
    }

    static async deleteById(id) {
        const sql = 'DELETE FROM items WHERE id = ?';
        const [result] = await db.execute(sql, [id]);
        return result.affectedRows > 0;
    }
    
    static async findAllWithLimit(limit = 6) {
        const sql = `
            SELECT i.*, u.username AS owner_username
            FROM items i
            JOIN users u ON i.user_id = u.id
            ORDER BY i.created_at DESC
            LIMIT ?
        `;
        const [rows] = await db.execute(sql, [limit]);
        return rows;
    }

    static async findAll() {
        const sql = `
            SELECT i.*, u.username AS owner_username, u.status AS owner_status
            FROM items i
            JOIN users u ON i.user_id = u.id
            ORDER BY i.created_at DESC
        `;
        const [rows] = await db.execute(sql);
        return rows;
    }

    static async findRandom() {
        const sql = `
            SELECT i.*, u.username AS owner_username
            FROM items i
            JOIN users u ON i.user_id = u.id
            ORDER BY RAND()
            LIMIT 1
        `;
        const [rows] = await db.execute(sql);
        return rows[0];
    }

    // --- 2. FUNGSI LOGIKA HTTP (CONTROLLER) ---
    
    static async handleGetHomepage(req, res) {
        try {
            const items = await Item.findAllWithLimit(6);
            res.render('index', {
                title: "Selamat Datang di Odt's",
                items: items
            });
        } catch (error) {
             console.error("Error get homepage items:", error);
             const dummyItems = [
                 { id: 1, title: 'Gagal Memuat Data', image_url: 'uploads/placeholder.jpg', owner_username: 'Sistem' },
                 { id: 2, title: 'Coba Lagi Nanti', image_url: 'uploads/placeholder.jpg', owner_username: 'Sistem' }
             ];
             res.render('index', { title: "Selamat Datang di Odt's", items: dummyItems });
        }
    }
    
    static async handleGetNewItemForm(req, res) {
        res.render('newItem', {
            title: 'Upload Item Baru'
        });
    }

    static async handleCreateItem(req, res) {
        try {
            const { title, description, category, size, status, price } = req.body;
            const userId = req.session.userId;
            if (!req.file) {
                return res.status(400).send('Silakan upload sebuah gambar.');
            }
            const imageUrl = req.file.path.replace(/\\/g, "/");
            const newItem = {
                title, description, category, size, status,
                price: status === 'Dijual' ? price : null,
                imageUrl, userId
            };
            await Item.create(newItem);
            res.redirect('/user/profile');
        } catch (error) {
            console.error('Error saat membuat item:', error);
            res.status(500).send('Terjadi error saat membuat item.');
        }
    }

    static async handleGetItemDetails(req, res) {
        try {
            const itemId = req.params.id;
            const item = await Item.findById(itemId);
            if (!item) {
                return res.status(404).send('Item tidak ditemukan.');
            }
            const isOwner = req.session.userId === item.user_id;
            
            let isFavorited = false;
            if (req.session.userId) {
                isFavorited = await Favorite.check(req.session.userId, itemId);
            }

            res.render('itemDetail', {
                title: item.title,
                item: item,
                isOwner: isOwner,
                isFavorited: isFavorited
            });
        } catch (error) {
            console.error("Error get item details:", error);
            res.status(500).send('Error Server');
        }
    }

    static async handleGetEditItemForm(req, res) {
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
    }

    static async handleUpdateItem(req, res) {
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
                title, description, category, size, status,
                price: status === 'Dijual' ? price : null,
                imageUrl: newImageUrl
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
    }

    static async handleDeleteItem(req, res) {
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
    }

    static async handleGetExplorePage(req, res) {
         try {
            const searchQuery = req.query.search;
            let items = [];
            let userResults = [];

            if (searchQuery) {
                userResults = await User.searchByUsername(searchQuery);
            } else {
                items = await Item.findAll();
                items.sort(() => 0.5 - Math.random());
            }

            res.render('explore', {
                title: 'Explore',
                items: items,
                userResults: userResults,
                searchQuery: searchQuery || ''
            });
        } catch (error) {
            console.error("Error get explore page:", error);
            res.status(500).send('Error Server');
        }
    }
}

module.exports = Item;