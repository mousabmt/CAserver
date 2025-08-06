'use strict';
module.exports = (sequelize, DataTypes) => {
  const EmailOTP = sequelize.define('password_reset', {
    email: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: false
    },
    otp: {
      type: DataTypes.STRING(6),
      allowNull: false
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: DataTypes.NOW
    },
    expires_at: {
      type: DataTypes.DATE,
      allowNull: false
    }
  }, {
    timestamps: false,
  });

  return EmailOTP;
};
