const db = require('../../config/db');
const bcrypt = require('bcryptjs');

class User {

    // --- 1. FUNGSI DATABASE MURNI (MODEL) ---

    static async create(newUser) {
        const { username, email, password } = newUser;
        const sql = 'INSERT INTO users (username, email, password) VALUES (?, ?, ?)';
        const [result] = await db.execute(sql, [username, email, password]);
        return result;
    }

    static async findByEmail(email) {
        const sql = 'SELECT id, username, email, password, role, status FROM users WHERE email = ?';
        const [rows] = await db.execute(sql, [email]);
        return rows[0];
    }
    
    static async findAll() {
        const sql = 'SELECT id, username, email, role, status, created_at FROM users ORDER BY created_at DESC';
        const [rows] = await db.execute(sql);
        return rows;
    }
    
    static async deleteById(id) {
        const sql = 'DELETE FROM users WHERE id = ?';
        const [result] = await db.execute(sql, [id]);
        return result.affectedRows > 0;
    }

    static async updateStatus(id, status) {
        const sql = 'UPDATE users SET status = ? WHERE id = ?';
        const [result] = await db.execute(sql, [status, id]);
        return result.affectedRows > 0;
    }

    static async searchByUsername(query) {
        const sql = 'SELECT id, username FROM users WHERE username LIKE ? LIMIT 20';
        const [rows] = await db.execute(sql, [`%${query}%`]);
        return rows;
    }

    /**
     * [BARU] Mencari data pengguna publik berdasarkan ID
     * @param {number} id - ID pengguna
     */
    static async findById(id) {
        // Hanya pilih data yang aman untuk ditampilkan
        const sql = 'SELECT id, username, created_at FROM users WHERE id = ? AND status = "active"';
        const [rows] = await db.execute(sql, [id]);
        return rows[0];
    }

    // --- 2. FUNGSI LOGIKA HTTP (AUTH HANDLERS) ---

    static async handleGetLoginPage(req, res) {
        res.render('login', { title: 'Login ke Odt\'s' });
    }

    static async handleGetRegisterPage(req, res) {
        res.render('register', { title: 'Daftar Akun Baru' });
    }

    static async handleRegisterUser(req, res) {
        try {
            const { username, email, password } = req.body;
            const userExists = await User.findByEmail(email);
            if (userExists) {
                return res.status(400).send('Email sudah terdaftar.');
            }
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);
            await User.create({ username, email, password: hashedPassword });
            res.redirect('/auth/login');
        } catch (error) {
            console.error("Error saat registrasi:", error);
            res.status(500).send('Terjadi error saat registrasi.');
        }
    }

    static async handleLoginUser(req, res) {
        try {
            const { email, password } = req.body;
            const user = await User.findByEmail(email);
            if (!user) {
                return res.status(400).send('Email atau password salah.');
            }
            
            if (user.status === 'banned') {
                return res.status(403).send('Akun Anda telah diblokir.');
            }

            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                return res.status(400).send('Email atau password salah.');
            }
            
            req.session.userId = user.id;
            req.session.username = user.username;
            req.session.email = user.email;
            req.session.role = user.role;
            
            if (user.role === 'admin') {
                res.redirect('/admin/dashboard');
            } else {
                res.redirect('/user/profile');
            }
        } catch (error) {
            console.error("Error saat login:", error);
            res.status(500).send('Terjadi error saat login.');
        }
    }

    static async handleLogoutUser(req, res) {
        req.session.destroy(err => {
            if (err) return res.redirect('/');
            res.clearCookie('connect.sid');
            res.redirect('/auth/login');
        });
    }
}

module.exports = User;