const { Admin } = require('../models');
const { sequelize } = require('../models');
const bcrypt = require('bcryptjs');

exports.updateAdmin = async (req, res, next) => {
  try {
    const adminId = req.params.id;
    const isPartialUpdate = req.method === 'PATCH';
    const admin = await Admin.findByPk(adminId);
    if (!admin) return res.status(404).json({ success: false, message: 'Admin not found' });

    const { admin_id, accessLevel, department, firstName, lastName, email, password, phone, address, isActive } = req.body;
    
    if (admin_id && admin_id !== admin.admin_id) {
      const existingAdmin = await Admin.findOne({ where: { admin_id } });
      if (existingAdmin) return res.status(409).json({ success: false, message: 'Admin ID is already in use' });
    }

    if (accessLevel && !['super', 'normal', 'limited'].includes(accessLevel)) {
      return res.status(400).json({ success: false, message: 'Invalid access level' });
    }

    await sequelize.transaction(async (t) => {
      const adminUpdateData = {};
      if (admin_id !== undefined || !isPartialUpdate) adminUpdateData.admin_id = admin_id || admin.admin_id;
      if (accessLevel !== undefined || !isPartialUpdate) adminUpdateData.accessLevel = accessLevel || admin.accessLevel;
      if (department !== undefined || !isPartialUpdate) adminUpdateData.department = department;

      if (Object.keys(adminUpdateData).length) await admin.update(adminUpdateData, { transaction: t });

      // Handle direct update of admin details (firstName, lastName, email, etc.)
      if (firstName !== undefined || lastName !== undefined || email !== undefined || password || phone !== undefined || address !== undefined || isActive !== undefined) {
        const adminUpdateDetails = {};

        if (firstName !== undefined || !isPartialUpdate) adminUpdateDetails.firstName = firstName || admin.firstName;
        if (lastName !== undefined || !isPartialUpdate) adminUpdateDetails.lastName = lastName || admin.lastName;
        if (email !== undefined || !isPartialUpdate) adminUpdateDetails.email = email || admin.email;
        if (phone !== undefined || !isPartialUpdate) adminUpdateDetails.phone = phone;
        if (address !== undefined || !isPartialUpdate) adminUpdateDetails.address = address;
        if (isActive !== undefined) adminUpdateDetails.isActive = isActive;

        if (password) {
          const salt = await bcrypt.genSalt(10);
          adminUpdateDetails.password = await bcrypt.hash(password, salt);
        }

        if (Object.keys(adminUpdateDetails).length) await admin.update(adminUpdateDetails, { transaction: t });
      }
    });

    const updatedAdmin = await Admin.findByPk(adminId);
    return res.status(200).json({ success: true, message: 'Admin updated successfully', data: updatedAdmin });
  } catch (error) {
    if (error.message === 'Email is already in use') return res.status(409).json({ success: false, message: error.message });
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({ success: false, message: 'Validation error', errors: error.errors.map(e => ({ field: e.path, message: e.message })) });
    }
    next(error);
  }
};

exports.getAdminById = async (req, res, next) => {
  try {
    const admin = await Admin.findByPk(req.params.id);
    if (!admin) return res.status(404).json({ success: false, message: 'Admin not found' });
    return res.status(200).json({ success: true, data: admin });
  } catch (error) { next(error); }
};
