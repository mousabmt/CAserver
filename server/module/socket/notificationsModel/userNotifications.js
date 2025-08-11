module.exports = (sequelize, DataTypes) => {
  return sequelize.define('UserNotification', {
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
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
    tableName: 'user_notifications',
    timestamps: true,
    indexes: [
      { fields: ['user_id'] },
      { fields: ['type'] },
      { fields: ['seen'] },
    ],
  });
};
