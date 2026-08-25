const mysql = require("mysql2");
require("dotenv").config();

// Membuat connection pool ke database MySQL
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Mengubah pool agar menggunakan Promise/async-await
const db = pool.promise();

// Opsional: Cek koneksi saat server pertama kali dijalankan
pool.getConnection((err, connection) => {
  if (err) {
    console.error("Gagal terhubung ke MySQL:", err.message);
  } else {
    console.log("Berhasil terhubung ke database MySQL!");
    connection.release();
  }
});

module.exports = db;
