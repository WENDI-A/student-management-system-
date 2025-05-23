"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("GradeSummaries", {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID
      },
      student_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "Students",
          key: "id"
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE"
      },
      semester: {
        type: Sequelize.STRING,
        allowNull: false
      },
      total_grade: {
        type: Sequelize.FLOAT,
        allowNull: false
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });
    await queryInterface.addConstraint('GradeSummaries', {
      fields: ['student_id', 'semester'],
      type: 'unique',
      name: 'unique_student_semester'
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("GradeSummaries");
  }
}; 