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
  status: {
    type: DataTypes.ENUM(['draft', 'approved']),
    allowNull: false,
    defaultValue: 'draft',
  },
};

module.exports = (app) => {
  const sequelizeClient = app.get('sequelizeClient');
  const Event = sequelizeClient.define('Event', Schema, {
    tableName: 'event',
    timestamps: true,
    underscored: true,
  });

  Event.associate = function (models) {
    this.belongsTo(models.Category, {
      allowNull: false,
      foreignKey: {
        field: 'category_id',
        name: 'categoryId',
      },
      onDelete: 'RESTRICT',
      onUpdate: 'CASCADE',
    });

    this.belongsTo(models.Region, {
      allowNull: false,
      foreignKey: {
        name: 'regionId',
        field: 'region_id',
      },
      onDelete: 'RESTRICT',
      onUpdate: 'CASCADE',
    });
  };

  return Event;
};
