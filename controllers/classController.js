const Class = require("../models/Class");
const Trainer = require("../models/Trainer");

// Create a new class (admin or trainer only)
exports.createClass = async (req, res) => {
  try {
    if (!req.user || !['admin', 'trainer'].includes(req.user.role)) {
      return res.status(403).json({ message: "Access denied. Only admin or trainer can create classes." });
    }
    const { name, description, schedule, trainer } = req.body;
    const newClass = await Class.create({
      name,
      description,
      schedule,
      trainer,
      createdBy: req.user.id, // Use id from JWT payload
      createdByRole: req.user.role // Track who created (admin/trainer)
    });
    res.status(201).json({ message: "Class created successfully", class: newClass });
  } catch (err) {
    res.status(500).json({ message: "Error creating class", error: err.message });
  }
};

// Get all classes
exports.getAllClasses = async (req, res) => {
  try {
    const classes = await Class.find().populate('trainer').populate('createdBy');
    res.json(classes);
  } catch (err) {
    res.status(500).json({ message: "Error fetching classes", error: err.message });
  }
};

// Update class
exports.updateClass = async (req, res) => {
  try {
    const classId = req.params.id;
    // Only admin or trainer can update
    if (!['admin', 'trainer'].includes(req.user.role)) {
      return res.status(403).json({ message: "Access denied. Only admin or trainer can update classes." });
    }
    const updated = await Class.findByIdAndUpdate(classId, req.body, { new: true });
    if (!updated) {
      return res.status(404).json({ message: "Class not found" });
    }
    res.json({ message: "Class updated successfully", class: updated });
  } catch (err) {
    res.status(500).json({ message: "Error updating class", error: err.message });
  }
};


// Get single class by ID
exports.getClassById = async (req, res) => {
  try {
    const classItem = await Class.findById(req.params.id).populate('trainer').populate('createdBy');
    if (!classItem) return res.status(404).json({ message: 'Class not found' });
    res.json(classItem);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching class', error: err.message });
  }
};

// Delete class
exports.deleteClass = async (req, res) => {
  try {
    // Only admin or trainer can delete
    if (!['admin', 'trainer'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Access denied. Only admin or trainer can delete classes.' });
    }
    const classItem = await Class.findById(req.params.id);
    if (!classItem) return res.status(404).json({ message: 'Class not found' });

    // If trainer, only allow if they created the class or are assigned as trainer
    if (req.user.role === 'trainer') {
      if (
        (classItem.createdBy && classItem.createdBy.toString() !== req.user.id) &&
        (classItem.trainer && classItem.trainer.toString() !== req.user.id)
      ) {
        return res.status(403).json({ message: 'Access denied. Trainer can only delete their own classes.' });
      }
    }

    await classItem.deleteOne();
    res.json({ message: 'Class deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting class', error: err.message });
  }
};
