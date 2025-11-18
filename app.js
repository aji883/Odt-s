const express = require('express');
const path = require('path');
const session = require('express-session');

// Impor Router
const itemRoutes = require('./src/routes/itemRoutes');
const authRoutes = require('./src/routes/authRoutes');
const userRoutes = require('./src/routes/userRoutes');
const adminRoutes = require('./src/routes/adminRoutes');
const transactionRoutes = require('./src/routes/transactionRoutes'); // Impor rute transaksi

const app = express();
const PORT = 3000;

// Konfigurasi Session
app.use(session({
    secret: 'kunciRahasiaSuperAmanUntukAplikasiOdts',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false } 
}));

// --- MIDDLEWARE: Membuat data user global untuk EJS ---
app.use((req, res, next) => {
    if (req.session.userId) {
        // Jika user login, buat variabel 'user' yang bisa diakses di semua EJS
        res.locals.user = {
            id: req.session.userId,
            username: req.session.username,
            email: req.session.email,
            role: req.session.role,
            phoneNumber: req.session.phoneNumber,
            profilePicture: req.session.profilePicture 
        };
    } else {
        // Jika tidak login, variabel 'user' akan null
        res.locals.user = null;
    }
    next();
});

// Pengaturan View Engine & Aset Statis
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'src/views'));

// Mengizinkan akses ke folder 'public' (CSS, JS) dan 'uploads' (gambar)
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Middleware untuk membaca data dari form
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Menggunakan Router
app.use('/', itemRoutes);
app.use('/auth', authRoutes);
app.use('/user', userRoutes);
app.use('/admin', adminRoutes); 
app.use('/transactions', transactionRoutes); // Daftarkan rute transaksi

// Menjalankan server pada port yang ditentukan
app.listen(PORT, () => {
    console.log(`🚀 Server Odt's berhasil berjalan di http://localhost:${PORT}`);
});