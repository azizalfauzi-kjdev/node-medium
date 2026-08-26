const bcrypt = require("bcryptjs");
const UserModel = require("../models/userModel");

// 1. READ: Mengambil semua user (Dapat diakses oleh User Biasa & Super Admin)
exports.getAllUsers = async (req, res) => {
  try {
    const users = await UserModel.findAll();
    return res.status(200).json({
      message: "Berhasil mengambil daftar user",
      data: users,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Gagal mengambil data user",
      error: error.message,
    });
  }
};

// 2. READ BY ID: Mengambil detail user berdasarkan ID
// User biasa hanya bisa melihat ID-nya sendiri, Super Admin bisa melihat ID siapa saja
exports.getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    // Proteksi Keamanan: Jika bukan Super Admin dan mencoba melihat ID orang lain
    if (req.user.role !== "super_admin" && parseInt(id) !== req.user.id) {
      return res.status(403).json({
        message:
          "Akses ditolak! Anda hanya dapat melihat data profil Anda sendiri.",
      });
    }

    const user = await UserModel.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User tidak ditemukan!" });
    }

    return res.status(200).json({
      message: "Berhasil mengambil data user",
      data: user,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Gagal mengambil data user",
      error: error.message,
    });
  }
};

// 3. CREATE: Menambah user baru (Dapat diakses oleh User Biasa & Super Admin)
exports.createUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Validasi input
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

    // Enkripsi password sebelum disimpan ke database
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Pengaturan Role:
    // Jika yang membuat adalah user biasa, otomatis role diset sebagai 'user' agar user biasa tidak bisa membuat akun 'super_admin'
    let finalRole = role || "user";
    if (req.user.role !== "super_admin") {
      finalRole = "user";
    }

    // Simpan ke database MySQL via Model
    const userId = await UserModel.create({
      name,
      email,
      password: hashedPassword,
      role: finalRole,
    });

    return res.status(201).json({
      message: "User berhasil ditambahkan ke database!",
      data: { id: userId, name, email, role: finalRole },
    });
  } catch (error) {
    return res.status(500).json({
      message: "Gagal menambah user",
      error: error.message,
    });
  }
};

// 4. UPDATE: Memperbarui data user (Khusus Super Admin)
exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, role } = req.body;

    // Cek apakah user target ada di database
    const user = await UserModel.findById(id);
    if (!user) {
      return res
        .status(404)
        .json({ message: "User tidak ditemukan di database!" });
    }

    // Update data di database MySQL via Model
    const isUpdated = await UserModel.update(id, {
      name: name || user.name,
      email: email || user.email,
      role: role || user.role,
    });

    if (isUpdated) {
      return res.status(200).json({
        message: `User dengan ID ${id} berhasil diperbarui!`,
      });
    } else {
      return res.status(400).json({ message: "Gagal meng-update data user." });
    }
  } catch (error) {
    return res.status(500).json({
      message: "Terjadi kesalahan saat meng-update user",
      error: error.message,
    });
  }
};

// 5. DELETE: Menghapus user (Khusus Super Admin)
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Cek apakah user target ada di database
    const user = await UserModel.findById(id);
    if (!user) {
      return res
        .status(404)
        .json({ message: "User tidak ditemukan di database!" });
    }

    // Mencegah Super Admin menghapus akunnya sendiri secara tidak sengaja
    if (parseInt(id) === req.user.id) {
      return res
        .status(400)
        .json({ message: "Anda tidak dapat menghapus akun Anda sendiri!" });
    }

    // Hapus dari database MySQL via Model
    const isDeleted = await UserModel.delete(id);

    if (isDeleted) {
      return res.status(200).json({
        message: `User dengan ID ${id} berhasil dihapus dari database!`,
      });
    } else {
      return res.status(400).json({ message: "Gagal menghapus user." });
    }
  } catch (error) {
    return res.status(500).json({
      message: "Terjadi kesalahan saat menghapus user",
      error: error.message,
    });
  }
};
