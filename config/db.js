const mysql = require('mysql2');

// Membuat 'pool' koneksi ke database
const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '', // Kosongkan jika password root Anda kosong
    database: 'odts_db',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

console.log("Koneksi ke database MySQL berhasil disiapkan.");

// Mengekspor koneksi agar bisa digunakan di file lain
module.exports = pool.promise();