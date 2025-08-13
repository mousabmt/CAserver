// module/socket/notificationsModel/orgNotifications.js
module.exports = (sequelize, DataTypes) => {
  return sequelize.define('OrgNotification', {
    org_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: true, 
    },
    message: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    type: {
      type: DataTypes.ENUM('pending', 'accepted', 'rejected', 'info'),
      allowNull: false,
    },
    seen: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  }, {
    tableName: 'org_notifications',
    timestamps: true,
    indexes: [
      { fields: ['org_id'] },
      { fields: ['type'] },
      { fields: ['seen'] },
    ],
  });
};
