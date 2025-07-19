const prisma = require('../../prismaClient');
const bcrypt = require('bcryptjs');

exports.updatePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const userId = req.user.id;
    let user = null;
    let model = null;

    switch (req.user.role) {
      case 'admin':
        model = prisma.admin;
        break;
      case 'teacher':
        model = prisma.teacher;
        break;
      case 'student':
        model = prisma.student;
        break;
      case 'parent':
        model = prisma.parent;
        break;
      case 'director':
        model = prisma.director;
        break;
      default:
        return res.status(400).json({ message: 'Invalid role' });
    }

    user = await model.findUnique({ where: { id: userId } });

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
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    await model.update({
      where: { id: userId },
      data: { password: hashedPassword }
    });

    res.status(200).json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Error updating password:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
