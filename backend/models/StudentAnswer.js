const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const StudentAnswer = sequelize.define('StudentAnswer', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    student_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Students',
        key: 'id',
      },
    },
    assessment_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Assessments',
        key: 'id',
      },
    },
    question_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Questions',
        key: 'id',
      },
    },
    answer: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    is_correct: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
    },
    submitted_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  }, {
    timestamps: true,
    tableName: 'StudentAnswers',
  });

  StudentAnswer.associate = (models) => {
    StudentAnswer.belongsTo(models.Student, { foreignKey: 'student_id' });
    StudentAnswer.belongsTo(models.Assessment, { foreignKey: 'assessment_id' });
    StudentAnswer.belongsTo(models.Question, { foreignKey: 'question_id' });
  };

  return StudentAnswer;
}; 