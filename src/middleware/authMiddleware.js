const jwt = require("jsonwebtoken");

// 1. VERIFIKASI TOKEN JWT
exports.verifyToken = (req, res, next) => {
  // Mengambil token dari header Authorization
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // Format: "Bearer <token>"

  if (!token) {
    return res
      .status(401)
      .json({ message: "Akses ditolak! Token tidak ditemukan." });
  }

  try {
    // Verifikasi token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Menyimpan data user (id & role) ke object request
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
