module.exports = (sequelize, DataTypes) => {
  const GradeSummary = sequelize.define(
    "GradeSummary",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
      },
      student_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'Students',
          key: 'id'
        }
      },
      semester: {
        type: DataTypes.STRING,
        allowNull: false
      },
      total_grade: {
        type: DataTypes.FLOAT,
        allowNull: false
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
          fields: ['student_id', 'semester']
        }
      ]
    }
  );

  GradeSummary.associate = function (models) {
    GradeSummary.belongsTo(models.Student, { foreignKey: "student_id" });
  };

  return GradeSummary;
}; 