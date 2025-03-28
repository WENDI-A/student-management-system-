module.exports = (sequelize, DataTypes) => {
  const CourseMaterial = sequelize.define(
    "CourseMaterial",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
      },
      title: {
        type: DataTypes.STRING,
        allowNull: false
      },
      content: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      fileUrl: {
        type: DataTypes.STRING,
        allowNull: true
      },
      course_id: {
        type: DataTypes.UUID,
        allowNull: false
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
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

  CourseMaterial.associate = function (models) {
      CourseMaterial.belongsTo(models.Course, { 
        foreignKey: "course_id", 
        as: "Course",
        onDelete: 'CASCADE'
      });

  };

  return CourseMaterial;
};