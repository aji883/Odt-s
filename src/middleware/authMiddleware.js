// src/middleware/authMiddleware.js

const isLoggedIn = (req, res, next) => {
    if (req.session.userId) {
        return next();
    }
    res.redirect('/auth/login');
};

const isAdmin = (req, res, next) => {
    if (req.session.role === 'admin') {
        return next();
    }
    res.status(403).send('Akses ditolak. Anda bukan admin.');
};

// PASTIKAN ANDA MENGEKSPOR KEDUANYA
module.exports = {
    isLoggedIn,
    isAdmin
};