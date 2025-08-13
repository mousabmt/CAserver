'use strict';


const task = (sequelize, DataTypes) => {
  return sequelize.define('leaders_tasks', {
    task_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    cb_points: {
      type: DataTypes.ENUM('25', '50', '75', '100'),
      allowNull: false
    },
    task_name: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    task_details: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    task_startTime: {
      type: DataTypes.DATE,
      defaultValue: sequelize.fn('now')
    },
    task_deadLine: {
      type: DataTypes.DATE,
      allowNull: false
    },
    is_optional: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    team_id: {
      type: DataTypes.INTEGER,
      references: {
        model: "leaders",
        key: "leader_id"
      },
      allowNull: false
    },
    org_id: {
      type: DataTypes.INTEGER,
      references: {
        model: "organizations",
        key: "org_id"
      },
      allowNull: false

    },
    task_images: {
      type: sequelize.ARRAY(sequelize.TEXT),
    }
  })
}