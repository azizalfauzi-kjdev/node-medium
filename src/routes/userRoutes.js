const express = require("express");
const router = express.Router();
const userController = require("../controllers/userControllers");
const { verifyToken, authorizeRoles } = require("../middleware/authMiddleware");

// Verifikasi Token JWT wajib untuk semua rute
router.use(verifyToken);

// GET ALL: Khusus Super Admin
router.get("/", authorizeRoles("super_admin"), userController.getAllUsers);

// GET BY ID: User biasa & Super Admin (User biasa dibatasi hanya bisa liat ID sendiri)
router.get(
  "/:id",
  authorizeRoles("user", "super_admin"),
  userController.getUserById,
);

// CREATE: User biasa & Super Admin
router.post(
  "/",
  authorizeRoles("user", "super_admin"),
  userController.createUser,
);

// UPDATE: Khusus Super Admin
router.put("/:id", authorizeRoles("super_admin"), userController.updateUser);

// DELETE: Khusus Super Admin
router.delete("/:id", authorizeRoles("super_admin"), userController.deleteUser);

module.exports = router;
