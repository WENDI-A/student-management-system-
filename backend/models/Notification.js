module.exports = (sequelize, DataTypes) => {
  const Notification = sequelize.define(
    "Notification",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      sender_id: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      sender_role: {
        type: DataTypes.ENUM("Admin", "Teacher"),
        allowNull: false,
      },
      recipient_type: {
        type: DataTypes.ENUM("Students", "Parents"),
        allowNull: false,
      },
      recipient_id: {
        type: DataTypes.UUID,
        allowNull: true, // Null means it's sent to all students or parents
      },
      message: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      status: {
        type: DataTypes.ENUM("Unread", "Read"),
        defaultValue: "Unread",
      },
      createdAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      timestamps: true,
    }
  );

  Notification.associate = function (models) {
    Notification.belongsTo(models.Admin, { foreignKey: "sender_id", constraints: false });
    Notification.belongsTo(models.Teacher, { foreignKey: "sender_id", constraints: false });
    Notification.belongsTo(models.Student, { foreignKey: "recipient_id", constraints: false });
    Notification.belongsTo(models.Parent, { foreignKey: "recipient_id", constraints: false });
  };

  return Notification;
};
