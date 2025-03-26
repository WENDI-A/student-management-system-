const bcrypt = require("bcrypt");

module.exports = (sequelize, DataTypes) => {
  const Teacher = sequelize.define('Teacher', {
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
    grade: {
      type: DataTypes.STRING,
      allowNull: true
    },
    joinDate: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: DataTypes.NOW
    },
    phone: {
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
      defaultValue : "teacher"
    }
  }, {
    timestamps: true,
    hooks: {
      beforeCreate: async (teacher) => {
        if (teacher.password) {
          const salt = await bcrypt.genSalt(10);
          teacher.password = await bcrypt.hash(teacher.password, salt);
        }
      },
      beforeUpdate: async (teacher) => {
        if (teacher.changed('password')) {
          const salt = await bcrypt.genSalt(10);
          teacher.password = await bcrypt.hash(teacher.password, salt);
        }
      }
    }
  });

  Teacher.associate = function(models) {
    // Define associations here if needed
  };
  
  Teacher.prototype.isValidPassword = async function(password) {
    return await bcrypt.compare(password, this.password);
  };

  return Teacher;
};
