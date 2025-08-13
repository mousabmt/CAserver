`use strict`
const member = (sequelize, DataTypes) => {
    return sequelize.define('members', {
        member_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        name: {
            type: DataTypes.TEXT,
            allowNull: false,
            references: {
                model: "users",
                key: "name"
            }
        },
        leader_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: "leaders",
                key: "leader_id"
            }
        },
        acc_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: "users",
                key: "acc_id"
            }
        },
        joined_at: {
            type: DataTypes.DATE,
            defaultValue: sequelize.fn('now')
        },
        left_at: {
            type: DataTypes.DATE
        },
        status: {
            type: DataTypes.ENUM('active', 'suspended', 'removed', 'offline')

        },
        cb_points: {
            type: DataTypes.BIGINT,
            defaultValue: 0
        },
    })
}