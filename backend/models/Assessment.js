module.exports = (sequelize, DataTypes) => {
  const Assessment = sequelize.define(
    "Assessment",
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
      title: {
        type: DataTypes.STRING,
        allowNull: false
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      type: {
        type: DataTypes.ENUM('assignment', 'quiz', 'test', 'exam', 'project', 'other'),
        allowNull: false
      },
      max_score: {
        type: DataTypes.FLOAT,
        allowNull: false,
        defaultValue: 100
      },
      weight: {
        type: DataTypes.FLOAT,
        allowNull: false,
        defaultValue: 1.0,
        comment: "Weight of this assessment in the final grade calculation"
      },
      due_date: {
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
      timestamps: true
    }
  );

  Assessment.associate = function (models) {
    Assessment.belongsTo(models.Course, { foreignKey: "course_id" });
    Assessment.hasMany(models.Grade, { foreignKey: "assessment_id" });
  };

  return Assessment;
};