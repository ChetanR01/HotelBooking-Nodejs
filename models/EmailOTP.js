const Sequelize = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    const EmailOTP = sequelize.define('EmailOTP', {
      email: {
        type:DataTypes.STRING(100),
        unique: true,
        allowNull: false
      },
      otp: DataTypes.STRING(4),
      status:{
        type:DataTypes.TINYINT(1),
        defaultValue:0
      }
    });
  
    return EmailOTP;
  };
