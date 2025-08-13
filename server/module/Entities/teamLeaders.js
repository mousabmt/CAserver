'use strict';

const leader = (sequelize, DataTypes) => {
    return sequelize.define("leaders", {
        leader_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            allowNull: false,
            autoIncrement: true

        },
        acc_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: "users",
                key: "acc_id"
            }
        },
        name: {
            type: DataTypes.TEXT,
            allowNull: false,
            references: {
                model: "users",
                key: "name"
            }
        },
        org_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: "organizations",
                key: "org_id"
            }
        },
        team_id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            allowNull: false

        },
        cb_points: {
            type: DataTypes.BIGINT,
            defaultValue:0
        },
        status: {
            type: DataTypes.ENUM('active', 'suspended', 'removed', 'offline')

        },
        joined_at: {
            type: DataTypes.DATE,
            defaultValue: sequelize.fn('NOW')
        },
        left_at:{
            type:DataTypes.DATE,
            allowNull:true
        }
    });
};

module.exports = leader;
