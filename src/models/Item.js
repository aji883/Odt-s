// src/models/Item.js
const db = require('../../config/db');

class Item {
    /**
     * Menyimpan item baru ke dalam database.
     * @param {object} newItem - Objek berisi detail item.
     * @returns {Promise<object>} - Hasil dari operasi insert.
     */
    static async create(newItem) {
        const { title, description, category, size, status, price, imageUrl, userId } = newItem;
        const sql = `INSERT INTO items (title, description, category, size, status, price, user_id, image_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
        const [result] = await db.execute(sql, [title, description, category, size, status, price, userId, imageUrl]);
        return result;
    }

    /**
     * Mencari semua item milik satu pengguna berdasarkan ID pengguna.
     * @param {number} userId - ID pengguna.
     * @returns {Promise<Array>} - Array berisi objek-objek item.
     */
    static async findByUserId(userId) {
        const sql = 'SELECT * FROM items WHERE user_id = ? ORDER BY created_at DESC';
        const [rows] = await db.execute(sql, [userId]);
        return rows;
    }

    /**
     * Mencari satu item berdasarkan ID-nya, termasuk username pemilik dan jumlah favorit.
     * @param {number} id - ID item.
     * @returns {Promise<object|undefined>} - Objek item atau undefined jika tidak ditemukan.
     */
    static async findById(id) {
        // Query ini mengambil detail item, username pemilik, DAN jumlah favorit
        // Pastikan Anda sudah membuat tabel 'favorites' dengan kolom 'item_id' dan 'user_id'
        const sql = `
            SELECT
                i.*,
                u.username AS owner_username,
                COUNT(f.user_id) AS favorite_count
            FROM items i
            JOIN users u ON i.user_id = u.id
            LEFT JOIN favorites f ON i.id = f.item_id -- LEFT JOIN agar item tanpa favorit tetap muncul
            WHERE i.id = ?
            GROUP BY i.id, u.username -- Group by untuk memastikan COUNT benar per item
        `;
        const [rows] = await db.execute(sql, [id]);

        // rows[0] sekarang akan memiliki properti tambahan 'favorite_count'
        return rows[0];
    }

    /**
     * Mengupdate detail item di database.
     * @param {number} id - ID item yang akan diupdate.
     * @param {object} itemData - Objek berisi data baru { title, description, ... }.
     * @returns {Promise<boolean>} - True jika update berhasil, false jika tidak.
     */
    static async update(id, itemData) {
        // Ambil data yang mungkin diupdate, termasuk imageUrl opsional
        const { title, description, category, size, status, price, imageUrl } = itemData;

        let sql;
        let params;

        // Cek apakah imageUrl dikirim (artinya gambar baru diupload)
        if (imageUrl !== undefined) {
            sql = `UPDATE items SET title = ?, description = ?, category = ?, size = ?, status = ?, price = ?, image_url = ? WHERE id = ?`;
            params = [title, description, category, size, status, price, imageUrl, id];
        } else {
            // Jika imageUrl tidak ada (undefined), jangan update kolom image_url
            sql = `UPDATE items SET title = ?, description = ?, category = ?, size = ?, status = ?, price = ? WHERE id = ?`;
            params = [title, description, category, size, status, price, id];
        }

        const [result] = await db.execute(sql, params);
        return result.affectedRows > 0; // Mengembalikan true jika ada baris yang terpengaruh
    }

    /**
     * Menghapus item dari database berdasarkan ID.
     * @param {number} id - ID item yang akan dihapus.
     * @returns {Promise<boolean>} - True jika delete berhasil, false jika tidak.
     */
    static async deleteById(id) {
        const sql = 'DELETE FROM items WHERE id = ?';
        const [result] = await db.execute(sql, [id]);
        return result.affectedRows > 0; // Mengembalikan true jika ada baris yang terpengaruh
    }

    /**
     * Mengambil sejumlah item terbaru untuk ditampilkan di homepage.
     * @param {number} limit - Jumlah item yang ingin diambil.
     * @returns {Promise<Array>} - Array berisi objek-objek item terbaru.
     */
    static async findAllWithLimit(limit = 6) {
        // Query ini juga mengambil username pemilik
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
}

module.exports = Item;