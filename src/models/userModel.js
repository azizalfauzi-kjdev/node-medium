const db = require("../config/db");

class UserModel {
  // ----------------------------------------------------
  // 1. FITUR AUTENTIKASI (Register & Login)
  // ----------------------------------------------------

  // Mencari user berdasarkan Email (digunakan saat Login & Pengecekan Duplikat Email)
  static async findByEmail(email) {
    const query = "SELECT * FROM users WHERE email = ?";
    const [rows] = await db.query(query, [email]);
    return rows[0]; // Mengembalikan object user jika ditemukan, atau undefined
  }

  // Membuat User Baru saat Registrasi (Default Role: 'user')
  static async create({ name, email, password, role = "user" }) {
    const query =
      "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)";
    const [result] = await db.query(query, [name, email, password, role]);
    return result.insertId; // Mengembalikan ID user yang baru dibuat
  }

  // ----------------------------------------------------
  // 2. OPERASI CRUD USER
  // ----------------------------------------------------

  // READ: Mengambil semua data user (Password disembunyikan demi keamanan)
  static async findAll() {
    const query = "SELECT id, name, email, role, created_at FROM users";
    const [rows] = await db.query(query);
    return rows;
  }

  // READ: Mengambil satu user berdasarkan ID
  static async findById(id) {
    const query =
      "SELECT id, name, email, role, created_at FROM users WHERE id = ?";
    const [rows] = await db.query(query, [id]);
    return rows[0];
  }

  // UPDATE: Memperbarui data user berdasarkan ID (Khusus Super Admin)
  static async update(id, { name, email, role }) {
    const query = "UPDATE users SET name = ?, email = ?, role = ? WHERE id = ?";
    const [result] = await db.query(query, [name, email, role, id]);
    return result.affectedRows > 0; // Mengembalikan true jika ada baris yang ter-update
  }

  // DELETE: Menghapus user berdasarkan ID (Khusus Super Admin)
  static async delete(id) {
    const query = "DELETE FROM users WHERE id = ?";
    const [result] = await db.query(query, [id]);
    return result.affectedRows > 0; // Mengembalikan true jika berhasil menghapus
  }
}

module.exports = UserModel;
