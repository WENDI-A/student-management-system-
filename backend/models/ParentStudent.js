module.exports = (sequelize, DataTypes) => {
  const ParentStudent = sequelize.define('ParentStudent', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    parentId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Parents',
        key: 'id'
      }
    },
    studentId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Students',
        key: 'id'
      }
    }
  }, {
    timestamps: true
  });

  return ParentStudent;
};