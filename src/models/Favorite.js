const db = require('../../config/db');

class Favorite {

    // --- 1. FUNGSI DATABASE MURNI (MODEL) ---

    static async add(userId, itemId) {
        const sql = 'INSERT INTO favorites (user_id, item_id) VALUES (?, ?)';
        try {
            await db.execute(sql, [userId, itemId]);
            return true;
        } catch (error) {
            // Abaikan error jika favorit sudah ada (duplicate entry)
            if (error.code === 'ER_DUP_ENTRY') return true;
            throw error;
        }
    }

    static async remove(userId, itemId) {
        const sql = 'DELETE FROM favorites WHERE user_id = ? AND item_id = ?';
        const [result] = await db.execute(sql, [userId, itemId]);
        return result.affectedRows > 0;
    }

    static async check(userId, itemId) {
        if (!userId) return false;
        const sql = 'SELECT * FROM favorites WHERE user_id = ? AND item_id = ?';
        const [rows] = await db.execute(sql, [userId, itemId]);
        return rows.length > 0;
    }

    static async findByUserId(userId) {
        const sql = `
            SELECT i.*, u.username AS owner_username
            FROM favorites f
            JOIN items i ON f.item_id = i.id
            JOIN users u ON i.user_id = u.id
            WHERE f.user_id = ?
            ORDER BY f.created_at DESC
        `;
        const [rows] = await db.execute(sql, [userId]);
        return rows;
    }

    // --- 2. FUNGSI LOGIKA HTTP (CONTROLLER) ---

    /**
     * @desc    Menangani toggle (tambah/hapus) favorit
     * @route   POST /items/:id/favorite
     */
    static async handleToggleFavorite(req, res) {
        try {
            const itemId = req.params.id;
            const userId = req.session.userId;

            if (!userId) {
                return res.redirect('/auth/login');
            }

            const isFavorited = await Favorite.check(userId, itemId);

            if (isFavorited) {
                await Favorite.remove(userId, itemId);
            } else {
                await Favorite.add(userId, itemId);
            }

            // --- PERBAIKAN ADA DI SINI ---
            // Mengganti 'back' dengan cara yang lebih aman
            const returnTo = req.get("Referrer") || "/";
            res.redirect(returnTo);
            // ---------------------------

        } catch (error) {
            console.error("Error toggling favorite:", error);
            res.status(500).send('Error Server');
        }
    }

    /**
     * @desc    Menampilkan halaman Item Favorit
     * @route   GET /user/favorites
     */
    static async handleGetFavoritesPage(req, res) {
        try {
            const userId = req.session.userId;
            const favoriteItems = await Favorite.findByUserId(userId);

            res.render('favorites', {
                title: 'Item Favorit Saya',
                items: favoriteItems,
                bodyClass: 'page-profile',
                user: res.locals.user // Mengambil 'user' dari middleware global
            });
        } catch (error) {
            console.error("Error getting favorites page:", error);
            res.status(500).send('Error Server');
        }
    }
}

module.exports = Favorite;