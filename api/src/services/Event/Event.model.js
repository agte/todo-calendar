const { DataTypes } = require('sequelize');

const Schema = {
  name: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  startDate: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  endDate: {
    type: DataTypes.DATE,
    allowNull: false,
  },
};

module.exports = (app) => {
  const sequelizeClient = app.get('sequelizeClient');
  const Event = sequelizeClient.define('Event', Schema, {
    tableName: 'event',
    timestamps: true,
  });

  Event.associate = function (models) {
    this.belongsTo(models.Category, {
      allowNull: false,
      foreignKey: 'category_id',
      onDelete: 'RESTRICT',
      onUpdate: 'CASCADE',
    });

    this.belongsTo(models.Region, {
      allowNull: false,
      foreignKey: 'region_id',
      onDelete: 'RESTRICT',
      onUpdate: 'CASCADE',
    });
  };

  return Event;
};
