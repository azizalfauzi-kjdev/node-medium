const jwt = require("jsonwebtoken");
const UserModel = require("../models/userModel");

exports.verifyToken = async (req, res, next) => {
  const authHeader = req.headers["authorization"];

  // Mengambil token setelah kata 'Bearer '
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res
      .status(401)
      .json({ message: "Akses ditolak! Token tidak ditemukan." });
  }

  try {
    // 1. Cek apakah token sudah di-blacklist (logout)
    const isBlacklisted = await UserModel.isTokenBlacklisted(token);
    if (isBlacklisted) {
      return res.status(401).json({
        message:
          "Token sudah tidak berlaku (Anda telah logout). Silakan login kembali.",
      });
    }

    // 2. Verifikasi JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    // Memberikan respon error yang spesifik berdasarkan tipe kesalahan JWT
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        message:
          "Token sudah kadaluwarsa! Silakan login ulang untuk mendapatkan token baru.",
      });
    }

    return res.status(403).json({
      message: "Token tidak valid!",
      errorDetail: error.message,
    });
  }
};

// 2. OTORISASI ROLE
exports.authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        message:
          "Akses ditolak! Anda tidak memiliki izin untuk mengakses resource ini.",
      });
    }
    next();
  };
};
