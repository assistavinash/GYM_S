const express = require("express");
const router = express.Router();
const { createClass, getAllClasses, updateClass } = require("../controllers/classController");
const auth = require("../middleware/auth");

// Only admin or trainer can create a class
router.post("/", auth, createClass);

// Anyone can view all classes
router.get("/", getAllClasses);

// Update class
router.put("/:id", auth, updateClass);

module.exports = router;
