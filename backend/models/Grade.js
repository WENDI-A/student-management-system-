module.exports = (sequelize, DataTypes) => {
  const Grade = sequelize.define(
    "Grade",
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
      assessment_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'Assessments',
          key: 'id'
        }
      },
      score: {
        type: DataTypes.FLOAT,
        allowNull: true,
        validate: {
          min: 0,
          max: 100
        }
      },
      letter_grade: {
        type: DataTypes.STRING,
        allowNull: true
      },
      feedback: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      submitted_at: {
        type: DataTypes.DATE,
        allowNull: true
      },
      graded_at: {
        type: DataTypes.DATE,
        allowNull: true
      },
      is_published: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
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
          fields: ['course_id', 'student_id', 'assessment_id']
        }
      ]
    }
  );

  Grade.associate = function (models) {
    Grade.belongsTo(models.Course, { foreignKey: "course_id" });
    Grade.belongsTo(models.Student, { foreignKey: "student_id" });
    Grade.belongsTo(models.Assessment, { foreignKey: "assessment_id" });
  };

  return Grade;
};