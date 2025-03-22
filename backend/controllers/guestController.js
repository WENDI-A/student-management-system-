const bcrypt = require('bcrypt');
const { Guest } = require('../models');
const { sequelize } = require('../models');

exports.registerGuest = async (req, res, next) => {
  try {
    const { 
      firstName, 
      lastName, 
      email, 
      password, 
      organization,
      purpose,
      visitDuration,
      notes
    } = req.body;

    if (!firstName || !lastName || !email || !password || !purpose) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    const existingGuest = await Guest.findOne({ where: { email } });
    if (existingGuest) {
      return res.status(409).json({ success: false, message: 'Guest with this email already exists' });
    }

    const validPurposes = ['tour', 'meeting', 'event', 'interview', 'other'];
    if (!validPurposes.includes(purpose)) {
      return res.status(400).json({ success: false, message: 'Invalid purpose' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newGuest = await Guest.create({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      organization: organization || null,
      purpose,
      visitDuration: visitDuration || null,
      notes: notes || null,
      status: 'active',
      registrationDate: new Date()
    });

    return res.status(201).json({ success: true, message: 'Guest registered successfully', data: { id: newGuest.id } });
  } catch (error) {
    next(error);
  }
};

exports.updateGuest = async (req, res, next) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { id } = req.params;
    const { 
      firstName, 
      lastName, 
      email, 
      password,
      organization,
      purpose,
      visitDuration,
      status,
      notes
    } = req.body;

    const guest = await Guest.findByPk(id, { transaction });
    if (!guest) {
      await transaction.rollback();
      return res.status(404).json({ success: false, message: 'Guest not found' });
    }

    const validPurposes = ['tour', 'meeting', 'event', 'interview', 'other'];
    if (purpose && !validPurposes.includes(purpose)) {
      await transaction.rollback();
      return res.status(400).json({ success: false, message: 'Invalid purpose' });
    }

    const validStatuses = ['active', 'inactive', 'completed', 'cancelled'];
    if (status && !validStatuses.includes(status)) {
      await transaction.rollback();
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const guestUpdateData = {};
    if (firstName) guestUpdateData.firstName = firstName;
    if (lastName) guestUpdateData.lastName = lastName;
    if (email) guestUpdateData.email = email;
    if (password) guestUpdateData.password = await bcrypt.hash(password, 10);
    if (organization !== undefined) guestUpdateData.organization = organization;
    if (purpose) guestUpdateData.purpose = purpose;
    if (visitDuration !== undefined) guestUpdateData.visitDuration = visitDuration;
    if (status) guestUpdateData.status = status;
    if (notes !== undefined) guestUpdateData.notes = notes;

    if (Object.keys(guestUpdateData).length > 0) {
      await guest.update(guestUpdateData, { transaction });
    }

    await transaction.commit();

    return res.status(200).json({ success: true, message: 'Guest updated successfully' });
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
};

// Delete Guest
exports.deleteGuest = async (req, res, next) => {
  try {
    const { id } = req.params;
    const guest = await Guest.findByPk(id);
    if (!guest) {
      return res.status(404).json({ success: false, message: 'Guest not found' });
    }
    
    await guest.destroy();
    
    return res.status(200).json({ success: true, message: 'Guest deleted successfully' });
  } catch (error) {
    next(error);
  }
};

exports.getAllGuests = async (req, res, next) => {
  try {
    const guests = await Guest.findAll({
      attributes: ['id', 'firstName', 'lastName', 'email', 'organization', 'purpose', 'visitDuration', 'status', 'notes', 'registrationDate'],
    });

    if (guests.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No guests found'
      });
    }

    return res.status(200).json({
      success: true,
      count: guests.length,
      data: guests
    });
  } catch (error) {
    next(error);
  }
};
