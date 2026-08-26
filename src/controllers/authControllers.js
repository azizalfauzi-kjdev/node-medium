const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const UserModel = require("../models/userModel");

// 1. REGISTER USER BARU
exports.register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Validasi input sederhana
    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ message: "Nama, email, dan password wajib diisi!" });
    }

    // Cek apakah email sudah terdaftar
    const existingUser = await UserModel.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({ message: "Email sudah digunakan!" });
    }

    // Hash/Enkripsi password dengan bcrypt
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Simpan user ke database via Model (Default role: 'user')
    const userId = await UserModel.create({
      name,
      email,
      password: hashedPassword,
      role: role || "user",
    });

    return res.status(201).json({
      message: "Registrasi berhasil!",
      data: { id: userId, name, email, role: role || "user" },
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Terjadi kesalahan server", error: error.message });
  }
};

// 2. LOGIN USER
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validasi input
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email dan password wajib diisi!" });
    }

    // Cari user berdasarkan email
    const user = await UserModel.findByEmail(email);
    if (!user) {
      return res.status(404).json({ message: "User tidak ditemukan!" });
    }

    // Verifikasi password (membandingkan password plain dengan hashedPassword)
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Password salah!" });
    }

    // Generate Token JWT jika login berhasil
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "1d" },
    );

    return res.status(200).json({
      message: "Login berhasil!",
      token: token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Terjadi kesalahan server", error: error.message });
  }
};

// 3. LOGOUT USER
exports.logout = async (req, res) => {
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
      return res.status(400).json({ message: "Token tidak ditemukan!" });
    }

    // Masukkan token ke daftar blacklist di database
    await UserModel.addTokenToBlacklist(token);

    return res.status(200).json({
      message: "Logout berhasil! Token telah dinonaktifkan.",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Terjadi kesalahan saat logout",
      error: error.message,
    });
  }
};
