const Sequelize = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    const User = sequelize.define('User', {
      name: {
        type: DataTypes.STRING
      },
      mobile_no: {
        type:DataTypes.STRING(10),
        unique: true
      },
      email: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false
      },
      status:{
        type:DataTypes.TINYINT(1),
        defaultValue:1
      }
    });
  
    return User;
  };
