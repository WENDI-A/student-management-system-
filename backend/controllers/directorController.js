const { where } = require('sequelize');
const { Director } = require('../models');
const bcrypt = require('bcrypt');
const password = "director123"

// Create a new Director (Admin only)
exports.createDirector = async (req, res) => {
  try {
    const { name, email } = req.body;
    if (!name || !email) {
      return res.status(400).json({ message: 'All fields are required.' });
    }
    const existing = await Director.findOne({ where: { email } });
    if (existing) {
      return res.status(409).json({ message: 'Director with this email already exists.' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const director = await Director.create({ name, email, password: hashedPassword });
    res.status(201).json({ message: 'Director created successfully.', director });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Get all Directors (Admin only)
exports.getAllDirectors = async (req, res) => {
  try {
    const directors = await Director.findAll({ attributes: { exclude: ['password'] } });
    res.json({data: directors});
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.getDirectorsById = async (req, res) => {
    try {
        const { id } = req.params;
        const director = await Director.findByPk(id);
      res.json({data: director});
    } catch (err) {
      res.status(500).json({ message: 'Server error', error: err.message });
    }
  };

// Update a Director (Admin only)
exports.updateDirector = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, password } = req.body;
    const director = await Director.findByPk(id);
    if (!director) return res.status(404).json({ message: 'Director not found.' });
    director.name = name || director.name;
    director.email = email || director.email;
    if (password) director.password = await bcrypt.hash(password, 10);
    await director.save();
    res.json({ message: 'Director updated successfully.', director });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Delete a Director (Admin only)
exports.deleteDirector = async (req, res) => {
  try {
    const { id } = req.params;
    const director = await Director.findByPk(id);
    if (!director) return res.status(404).json({ message: 'Director not found.' });
    await director.destroy();
    res.json({ message: 'Director deleted successfully.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
}; 