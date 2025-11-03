const express = require('express');
const path = require('path');
const session = require('express-session');

// Impor Router dari folder src/routes
const itemRoutes = require('./src/routes/itemRoutes');
const authRoutes = require('./src/routes/authRoutes');
const userRoutes = require('./src/routes/userRoutes');
const adminRoutes = require('./src/routes/adminRoutes'); // <-- TAMBAHKAN INI

// Inisialisasi aplikasi Express
const app = express();
const PORT = 3000;

// Konfigurasi Session
app.use(session({
    secret: 'kunciRahasiaSuperAmanUntukAplikasiOdts',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false } // Set ke 'true' jika Anda menggunakan HTTPS
}));

// Pengaturan View Engine menggunakan EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'src/views'));

// Mengizinkan akses ke folder 'public' (untuk CSS, JS) dan 'uploads' (untuk gambar)
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Middleware untuk membaca data dari form (JSON dan URL-encoded)
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Menggunakan Router
// Semua URL yang diawali '/' akan ditangani oleh itemRoutes
app.use('/', itemRoutes);
// Semua URL yang diawali '/auth' akan ditangani oleh authRoutes
app.use('/auth', authRoutes);
// Semua URL yang diawali '/user' akan ditangani oleh userRoutes
app.use('/user', userRoutes);
// Semua URL yang diawali '/admin' akan ditangani oleh adminRoutes
app.use('/admin', adminRoutes); // <-- TAMBAHKAN INI

// Menjalankan server pada port yang ditentukan
app.listen(PORT, () => {
    console.log(`🚀 Server Odt's berhasil berjalan di http://localhost:${PORT}`);
});