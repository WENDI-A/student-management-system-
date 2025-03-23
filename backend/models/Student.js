module.exports = (sequelize, DataTypes) => {
  const Student = sequelize.define('Student', {
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
    student_id: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
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
    dateOfBirth: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    department: {
      type: DataTypes.STRING,
      allowNull: true
    },
    enrollmentYear: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    enrollmentDate: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    currentSemester: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 1
    },
    grade: {
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
      defaultValue : "student"
    }
  }, {
    timestamps: true
  });

  Student.associate = function(models) {
    // Student can have many parents
    Student.belongsToMany(models.Parent, {
      through: 'ParentStudent',
      foreignKey: 'studentId',
      otherKey: 'parentId',
      as: 'parents'
    });
  };

  return Student;
};
