const Sequelize = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    const User = sequelize.define('User', {
      name: {
        type: DataTypes.STRING
      },
      mobile_no: {
        type:DataTypes.STRING(10),
        unique: true,
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING,
        unique: true
      },
      email_otp:DataTypes.STRING(10),
      email_status: {
        type: DataTypes.ENUM("Verified","Pending"),
        defaultValue: "Pending"
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
