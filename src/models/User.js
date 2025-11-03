const db = require('../../config/db');
class User {
    static async create(newUser) {
        const { username, email, password } = newUser;
        const sql = 'INSERT INTO users (username, email, password) VALUES (?, ?, ?)';
        const [result] = await db.execute(sql, [username, email, password]);
        return result;
    }
    static async findByEmail(email) {
        const sql = 'SELECT * FROM users WHERE email = ?';
        const [rows] = await db.execute(sql, [email]);
        return rows[0];
    }
}
module.exports = User;