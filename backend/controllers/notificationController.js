const db = require("../models");

exports.sendMessage = async (req, res, next) => {
  try {
    const { admin_id, techer_id, message, type } = req.body;
    if (!message || !type) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }
    const messageSent = await db.Notification.create({
      admin_id,
      techer_id,
      message,
      type,
    });
    res.status(201).json({
      success: true,
      message: "Message Successfully sent",
      messageSent,
    });
  } catch (error) {
    next(error);
  }
};

exports.getAdminMessageById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const adminMessage = await db.Notification.findAll({
      where: { admin_id: id },
    });
    res.status(201).json({ success: true, adminMessage });
  } catch (error) {
    next(error);
  }
};
exports.getTeacherMessageById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const teacherMessage = await db.Notification.findAll({
      where: { teacher_id: id },
    });
    res.status(201).json({ success: true, teacherMessage });
  } catch (error) {
    next(error);
  }
};
exports.getStudentsMessage = async (req, res, next) => {
  try {
    const studentMessage = await db.Notification.findAll({
      where: { type: "Students" },
    });
    res.status(201).json({ success: true, studentMessage });
  } catch (error) {
    next(error);
  }
};
exports.getParentsMessage = async (req, res, next) => {
  try {
    const studentMessage = await db.Notification.findAll({
      where: { type: "Parents" },
    });
    res.status(201).json({ success: true, studentMessage });
  } catch (error) {
    next(error);
  }
};

exports.updateMessage = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { newType, newMessage } = req.body;
    const updatedMessage = await db.Notification.update(
      { type: newType, message: newMessage },
      { where: { id } }
    );
    res.status(201).json({ success: true, updatedMessage });
  } catch (error) {
    next(error);
  }
};

exports.deleteMessage = async (req, res, next) => {
  try {
    const { id } = req.params;
    await db.Notification.destroy({ where: { id } });
  } catch (error) {
    next(error);
  }
};
