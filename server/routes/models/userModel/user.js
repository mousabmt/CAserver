'use strict';

const user = (sequelize, DataTypes) => {
  const User = sequelize.define('users', {
    acc_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    email: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true
    },
    hashed_password: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    total_cb: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    role: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: 'member'
    },
    organization_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
        join_request_status: {
      type: DataTypes.ENUM('none', 'pending', 'rejected', 'accepted'),
      allowNull: false,
      defaultValue: 'none'
    },
    join_request_org_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    }
  }, {
    timestamps: true 
  });

  return User;
};

module.exports = user;
