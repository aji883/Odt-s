const isLoggedIn = (req, res, next) => {
    // Cek apakah ada userId di sesi (tanda sudah login)
    if (req.session.userId) {
        return next();
    }
    // Jika tidak login, arahkan ke halaman login
    res.redirect('/auth/login');
};

const isAdmin = (req, res, next) => {
    // Cek apakah role di sesi adalah 'admin'
    if (req.session.role === 'admin') {
        return next();
    }
    // Jika bukan admin, tolak akses
    res.status(403).send('Akses ditolak. Anda bukan admin.');
};

module.exports = {
    isLoggedIn,
    isAdmin
};