const db = require("../models");

exports.sendNotification = async (req, res, next) => {
  try {
    const { sender_role, recipient_type, recipient_id, message } = req.body;
    const sender_id = req.user.id;

    if (!sender_id || !sender_role || !recipient_type || !message) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    let recipients = [];

    if (sender_role === "Admin") {
      if (recipient_type === "Students") {
        recipients = await db.Student.findAll({ attributes: ["id"] });
      } else if (recipient_type === "Parents") {
        recipients = await db.Parent.findAll({ attributes: ["id"] });
      }
    } else if (sender_role === "Teacher") {
      const teacher = await db.Teacher.findByPk(sender_id);
      if (!teacher || !teacher.grade) {
        return res.status(404).json({ success: false, message: "Teacher or class not found" });
      }

      if (recipient_type === "Students") {
        recipients = await db.Student.findAll({
          where: { grade: teacher.grade },
          attributes: ["id"],
        });
      } else if (recipient_type === "Parents") {
        recipients = await db.Parent.findAll({
          include: {
            model: db.Student,
            where: { grade: teacher.grade },
          },
          attributes: ["id"],
        });
      }
    } else if (recipient_id) {
      recipients = [{ id: recipient_id }];
    }

    if (!recipients.length) {
      return res.status(400).json({ success: false, message: "No recipients found" });
    }

    const notifications = await db.Notification.bulkCreate(
      recipients.map((recipient) => ({
        sender_id,
        sender_role,
        recipient_type,
        recipient_id: recipient.id,
        message,
      }))
    );

    res.status(201).json({
      success: true,
      message: "Notification(s) sent successfully",
      notifications,
    });
  } catch (error) {
    next(error);
  }
};

exports.getNotificationsByRecipient = async (req, res, next) => {
  try {
    const { recipient_type, recipient_id } = req.params;

    const whereCondition = recipient_id
      ? { recipient_type, recipient_id }
      : { recipient_type };

    const notifications = await db.Notification.findAll({ where: whereCondition });

    res.status(200).json({
      success: true,
      notifications,
    });
  } catch (error) {
    next(error);
  }
};

exports.markNotificationAsRead = async (req, res, next) => {
  try {
    const { id } = req.params;
    const notification = await db.Notification.findByPk(id);

    if (!notification) {
      return res.status(404).json({ success: false, message: "Notification not found" });
    }

    notification.status = "Read";
    await notification.save();

    res.status(200).json({ success: true, message: "Notification marked as read" });
  } catch (error) {
    next(error);
  }
};

exports.deleteNotification = async (req, res, next) => {
  try {
    const { id, recipient_id } = req.params;

    let deleteCondition = { id };

    if (recipient_id) {
      deleteCondition = { id, recipient_id };
    }

    const deleted = await db.Notification.destroy({ where: deleteCondition });

    if (!deleted) {
      return res.status(404).json({ success: false, message: "Notification not found" });
    }

    res.status(200).json({ success: true, message: "Notification deleted" });
  } catch (error) {
    next(error);
  }
};

exports.getNotificationsBySender = async (req, res, next) => {
  try {
    const admin_id = req.user.id;
    if (!admin_id) {
      return res.status(400).json({ success: false, message: "Admin ID is required" });
    }
    
    const notifications = await db.Notification.findAll({
      attributes: [
        'id',
        'message',
        'recipient_type',
        [db.sequelize.fn('COUNT', db.sequelize.col('message')), 'count']
      ],
      where: { sender_id: admin_id },
      group: ['message', 'recipient_type']
    });
    
    res.status(200).json({ success: true, notifications });
  } catch (error) {
    console.error("Error fetching notifications by sender:", error);
    next(error);
  }
};


