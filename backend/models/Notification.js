module.exports = (sequelize, DataTypes) => {
  const Notification = sequelize.define(
    "Notification",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      admin_id: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
          model: "Admins",
          key: "id",
        },
      },
      teacher_id: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
          model: "Teachers",
          key: "id",
        },
      },
      type: {
        type: DataTypes.ENUM("Students", "Parents"),
        allowNull: false,
      },
      message: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      status: {
        type: DataTypes.ENUM("Unread", "Read"),
        defaultValue: "Unread",
      },
      date: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      timestamps: true,
    }
  );

  Notification.associate = function (models) {
    Notification.belongsTo(models.Admin, { foreignKey: "admin_id" });
    Notification.belongsTo(models.Teacher, { foreignKey: "teacher_id" });
  };

  return Notification;
};