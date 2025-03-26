const { Admin, Teacher, Student, Parent } = require('../models'); 
const bcrypt = require('bcryptjs');

exports.updatePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const userId = req.user.id;
    let user = null;

    switch (req.user.role) {
      case 'admin':
        user = await Admin.findByPk(userId); 
        break;
      case 'teacher':
        user = await Teacher.findByPk(userId);
        break;
      case 'student':
        user = await Student.findByPk(userId);
        break;
      case 'parent':
        user = await Parent.findByPk(userId);
        break;
      default:
        return res.status(400).json({ message: 'Invalid role' });
    }

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    const isSamePassword = await bcrypt.compare(newPassword, user.password);
    if (isSamePassword) {
      return res.status(400).json({ message: 'New password cannot be the same as the current password' });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);

    await user.save();

    res.status(200).json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Error updating password:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
