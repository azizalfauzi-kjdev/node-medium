const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");

// READ (Semua user / Super Admin)
router.get("/", userController.getAllUsers);

// CREATE (Semua user / Super Admin)
router.post("/", userController.createUser);

// UPDATE (Khusus Super Admin)
router.put("/:id", userController.updateUser);

// DELETE (Khusus Super Admin)
router.delete("/:id", userController.deleteUser);

module.exports = router;
