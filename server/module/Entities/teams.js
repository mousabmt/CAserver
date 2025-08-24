'use strict';
module.exports = (sequelize, DataTypes) => {
  const Team = sequelize.define('teams', {
    team_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    org_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'organizations', key: 'org_id' },
      onUpdate: 'CASCADE', onDelete: 'CASCADE'
    },
    leader_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true,
      references: { model: 'leaders', key: 'leader_id' },
      onUpdate: 'CASCADE', onDelete: 'CASCADE'
    },
    name: { type: DataTypes.STRING(20), allowNull: false },
    cb_points: { type: DataTypes.BIGINT, defaultValue: 0 },
    desc:{type:DataTypes.STRING(100)}
  });
  return Team;
};
