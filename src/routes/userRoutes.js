const express = require("express");
const router = express.Router();
const userController = require("../controllers/userControllers");
const { verifyToken, authorizeRoles } = require("../middleware/authMiddleware");

// Semua rute di bawah ini wajib membawa Token JWT
router.use(verifyToken);

// READ & CREATE: Bisa diakses oleh User biasa dan Super Admin
router.get(
  "/",
  authorizeRoles("user", "super_admin"),
  userController.getAllUsers,
);
router.post(
  "/",
  authorizeRoles("user", "super_admin"),
  userController.createUser,
);

// UPDATE & DELETE: Hanya bisa diakses oleh Super Admin
router.put("/:id", authorizeRoles("super_admin"), userController.updateUser);
router.delete("/:id", authorizeRoles("super_admin"), userController.deleteUser);

module.exports = router;
