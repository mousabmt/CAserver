'use strict';
module.exports = (sequelize, DataTypes) => {
  const Member = sequelize.define('members', {
    member_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    team_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'teams', key: 'team_id' },
      onUpdate: 'CASCADE', onDelete: 'CASCADE'
    },
    acc_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'users', key: 'acc_id' },
      onUpdate: 'CASCADE', onDelete: 'CASCADE'
    },
    status: { type: DataTypes.ENUM('active', 'suspended', 'removed'), defaultValue: 'active' },
    cb_points: { type: DataTypes.BIGINT, defaultValue: 0 },
    joined_at: { type: DataTypes.DATE, defaultValue: sequelize.fn('NOW') },
    left_at: { type: DataTypes.DATE },
    warns: { type: DataTypes.INTEGER, defaultValue: 0 }
  });
  return Member;
};
