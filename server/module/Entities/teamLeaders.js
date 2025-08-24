'use strict';
module.exports = (sequelize, DataTypes) => {
  const Leader = sequelize.define('leaders', {
    leader_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    acc_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'users', key: 'acc_id' },
      onUpdate: 'CASCADE', onDelete: 'CASCADE'
    },
    org_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'organizations', key: 'org_id' },
      onUpdate: 'CASCADE', onDelete: 'CASCADE'
    },
    cb_points: { type: DataTypes.BIGINT, defaultValue: 0 },
    status: { type: DataTypes.ENUM('active', 'suspended', 'removed'), defaultValue: 'active' },
    joined_at: { type: DataTypes.DATE, defaultValue: sequelize.fn('NOW') },
    left_at: { type: DataTypes.DATE, allowNull: true },
    warns: { type: DataTypes.INTEGER, defaultValue: 0 }
  });
  return Leader;
};
