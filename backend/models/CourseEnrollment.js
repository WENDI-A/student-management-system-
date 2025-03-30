module.exports = (sequelize, DataTypes) => {
  const CourseEnrollment = sequelize.define(
    "courseEnrollments",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      course_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: "Courses",
          key: "id",
        },
      },
      student_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: "Students",
          key: "id",
        },
      },
      enrollment_date: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
      status: {
        type: DataTypes.ENUM("approved", "rejected", "pending"),
        defaultValue: "pending",
      }
    },
    {
      timestamps: true,
    }
  );

  CourseEnrollment.associate = function (models) {
    // Association with Course
    CourseEnrollment.belongsTo(models.Course, { 
      foreignKey: "course_id", 
      as: "Course",
      onDelete: 'CASCADE'
    });
    
    // Association with Student
    CourseEnrollment.belongsTo(models.Student, {
      foreignKey: "student_id",
      as: "Student",
      onDelete: 'CASCADE'
    });
  };

  return CourseEnrollment;
};
