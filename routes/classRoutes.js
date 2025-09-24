const express = require("express");
const router = express.Router();
const { createClass, getAllClasses, updateClass, getClassById, deleteClass } = require("../controllers/classController");
const auth = require("../middleware/auth");

// Only admin or trainer can create a class
router.post("/", auth, createClass);

// Anyone can view all classes
router.get("/", getAllClasses);

// Get single class by ID
router.get("/:id", getClassById);

// Update class
router.put("/:id", auth, updateClass);

// Delete class
router.delete("/:id", auth, deleteClass);

module.exports = router;
