`use strict`
module.exports = (sequelize, DataTypes) => {
  return sequelize.define('joing_req', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    acc_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'acc_id'
      },
      unique: true

    },
    org_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'organizations',
        key: 'org_id'
      }
    },
    status: {
      type: DataTypes.ENUM('pending', 'accepted', 'rejected'),
      defaultValue: 'pending'
    },
    submitted_at: {
      type: DataTypes.DATE,
      defaultValue: sequelize.fn('NOW')
    },
    responded_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    rejected_by: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    reason: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  })
}