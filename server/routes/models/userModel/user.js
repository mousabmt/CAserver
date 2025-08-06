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
    username: {
      type: DataTypes.STRING(30),
      allowNull: false,
      unique: true
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
    role: {
      type: DataTypes.STRING(20),
      allowNull: true,
      defaultValue: 'user'
    },
    role_title: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    location: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    skills: {
      type: DataTypes.TEXT, 
      allowNull: true
    },
    phone: {
      type: DataTypes.STRING(20),
      allowNull: false
    },
    profile_picture: {
      type: DataTypes.STRING,
      allowNull: true
    },
    bio: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    total_cb: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    org_cb:{
type:DataTypes.INTEGER,
defaultValue:0
    },
    organization_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model:'organizations',
        key: 'org_id'
      }
      
    }
  }, {
    timestamps: true
  });

  return User;
};

module.exports = user;
