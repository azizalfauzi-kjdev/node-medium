const jwt = require("jsonwebtoken");

// 1. VERIFIKASI TOKEN JWT
exports.verifyToken = async (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res
      .status(401)
      .json({ message: "Akses ditolak! Token tidak ditemukan." });
  }

  try {
    // Cek apakah token sudah di-blacklist (logout)
    const isBlacklisted = await UserModel.isTokenBlacklisted(token);
    if (isBlacklisted) {
      return res.status(401).json({
        message:
          "Token sudah tidak berlaku (Anda telah logout). Silakan login kembali.",
      });
    }

    // Verifikasi JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res
      .status(403)
      .json({ message: "Token tidak valid atau sudah kadaluwarsa!" });
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
