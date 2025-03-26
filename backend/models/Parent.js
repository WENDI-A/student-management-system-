module.exports = (sequelize, DataTypes) => {
  const Parent = sequelize.define('Parent', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    firstName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true
      }
    },

    password : {
      type : DataTypes.STRING,
      allowNull : false
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: true
    },
    address: {
      type: DataTypes.STRING,
      allowNull: true
    },
    relation: {
      type: DataTypes.ENUM('father', 'mother', 'guardian', 'other'),
      allowNull: false
    },
    occupation: {
      type: DataTypes.STRING,
      allowNull: true
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    role: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue : "parent"
    }
  }, {
    timestamps: true
  });

  Parent.associate = function(models) {
    // Parent can have many students
    Parent.belongsToMany(models.Student, {
      through: 'ParentStudent',
      foreignKey: 'parentId',
      otherKey: 'studentId',
      as: 'students'
    });
  };

  return Parent;
};
