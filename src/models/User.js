const db = require('../../config/db');
const bcrypt = require('bcryptjs');
const fs = require('fs');

class User {

    // --- 1. FUNGSI DATABASE MURNI (MODEL) ---

    static async create(newUser) {
        const { username, email, password, phone_number, profile_picture_url } = newUser;
        const sql = 'INSERT INTO users (username, email, phone_number, password, profile_picture_url) VALUES (?, ?, ?, ?, ?)';
        const [result] = await db.execute(sql, [username, email, phone_number, password, profile_picture_url]);
        return result;
    }

    static async findByEmail(email) {
        const sql = 'SELECT id, username, email, phone_number, password, role, status, profile_picture_url FROM users WHERE email = ?';
        const [rows] = await db.execute(sql, [email]);
        return rows[0];
    }
    
    static async findAll() {
        const sql = 'SELECT id, username, email, phone_number, role, status, created_at FROM users ORDER BY created_at DESC';
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
        const sql = 'SELECT id, username, profile_picture_url FROM users WHERE username LIKE ? LIMIT 20';
        const [rows] = await db.execute(sql, [`%${query}%`]);
        return rows;
    }

    static async findById(id) {
        const sql = 'SELECT id, username, phone_number, created_at, profile_picture_url, email FROM users WHERE id = ? AND status = "active"';
        const [rows] = await db.execute(sql, [id]);
        return rows[0];
    }

    static async updateById(id, data) {
        const fields = [];
        const params = [];

        if (data.username) {
            fields.push('username = ?');
            params.push(data.username);
        }
        if (data.email) {
            fields.push('email = ?');
            params.push(data.email);
        }
        if (data.phone_number) {
            fields.push('phone_number = ?');
            params.push(data.phone_number);
        }
        if (data.profile_picture_url) {
            fields.push('profile_picture_url = ?');
            params.push(data.profile_picture_url);
        }
        if (data.password) {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(data.password, salt);
            fields.push('password = ?');
            params.push(hashedPassword);
        }

        if (fields.length === 0) return true;

        const sql = `UPDATE users SET ${fields.join(', ')} WHERE id = ?`;
        params.push(id);

        const [result] = await db.execute(sql, params);
        return result.affectedRows > 0;
    }

    // --- 2. FUNGSI LOGIKA HTTP (HANDLERS) ---

    // Handler Auth
    static async handleGetLoginPage(req, res) {
        res.render('login', { title: 'Login ke Odt\'s' });
    }

    static async handleGetRegisterPage(req, res) {
        res.render('register', { title: 'Daftar Akun Baru' });
    }

    static async handleRegisterUser(req, res) {
        try {
            const { username, email, password, phone_number } = req.body;
            let profilePictureUrl = null;
            if (req.file) {
                profilePictureUrl = req.file.path.replace(/\\/g, "/");
            }
            const userExists = await User.findByEmail(email);
            if (userExists) {
                return res.status(400).send('Email sudah terdaftar.');
            }
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);
            await User.create({ 
                username, 
                email, 
                password: hashedPassword, 
                phone_number,
                profile_picture_url: profilePictureUrl
            });
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
            req.session.phoneNumber = user.phone_number;
            req.session.profilePicture = user.profile_picture_url;
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

    // Handler Edit Profil
    static async handleGetEditProfilePage(req, res) {
        try {
            const user = await User.findById(req.session.userId); // Ambil data terbaru
            if (!user) {
                return res.redirect('/auth/login');
            }
            res.render('editProfile', {
                title: 'Edit Profil',
                user: user,
                bodyClass: 'page-profile'
            });
        } catch (error) {
            console.error("Error get edit profile page:", error);
            res.status(500).send('Error Server');
        }
    }

    static async handleUpdateProfile(req, res) {
        try {
            const userId = req.session.userId;
            const { username, email, phone_number, password } = req.body;
            const currentUser = await User.findById(userId); // Ambil data lama
            
            const updatedData = {
                username: username,
                email: email,
                phone_number: phone_number
            };

            if (password && password.length > 0) {
                updatedData.password = password;
            }

            if (req.file) {
                const newImageUrl = req.file.path.replace(/\\/g, "/");
                updatedData.profile_picture_url = newImageUrl;
                
                const oldImageUrl = currentUser.profile_picture_url;
                if (oldImageUrl && oldImageUrl !== 'uploads/default-avatar.png' && fs.existsSync(oldImageUrl)) {
                    try { fs.unlinkSync(oldImageUrl); } catch(err){ console.error("Gagal hapus gambar lama:", err); }
                }
            }
            
            await User.updateById(userId, updatedData);

            // Update sesi
            req.session.username = updatedData.username;
            req.session.email = updatedData.email;
            if (updatedData.phone_number) req.session.phoneNumber = updatedData.phone_number;
            if (updatedData.profile_picture_url) req.session.profilePicture = updatedData.profile_picture_url;

            res.redirect('/user/profile');
        } catch (error) {
            console.error("Error update profile:", error);
            res.status(500).send('Terjadi error saat update profil.');
        }
    }
}

module.exports = User;