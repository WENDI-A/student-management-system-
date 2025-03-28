module.exports = (sequelize, DataTypes) => {
  const Course = sequelize.define(
    "Course",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
      },
      Course_name: {
        type: DataTypes.STRING,
        allowNull: false
      },
      Course_code: {
        type: DataTypes.STRING,
        allowNull: false
      },
      teacher_id: {
        type: DataTypes.UUID,
        allowNull: true,
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

  Course.associate = function (models) {
    Course.belongsTo(models.Teacher, { foreignKey: "teacher_id", constraints: false });
    Course.hasMany(models.Assessment, { foreignKey: "course_id" });
    Course.hasMany(models.Grade, { foreignKey: "course_id" });
    Course.belongsToMany(models.Student, { 
      through: 'CourseEnrollments',
      foreignKey: 'course_id',
      otherKey: 'student_id'
    });
  };

  return Course;
};