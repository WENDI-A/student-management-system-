module.exports = (sequelize, DataTypes) => {
  const CourseEnrollment = sequelize.define(
    "CourseEnrollment",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
      },
      course_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'Courses',
          key: 'id'
        }
      },
      student_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'Students',
          key: 'id'
        }
      },
      enrollment_date: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
      status: {
        type: DataTypes.ENUM('active', 'dropped', 'completed', 'pending'),
        defaultValue: 'active'
      },
      final_grade: {
        type: DataTypes.FLOAT,
        allowNull: true
      },
      final_letter_grade: {
        type: DataTypes.STRING,
        allowNull: true
      },
      createdAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
      updatedAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      }
    },
    {
      timestamps: true,
      indexes: [
        {
          unique: true,
          fields: ['course_id', 'student_id']
        }
      ]
    }
  );

  return CourseEnrollment;
};