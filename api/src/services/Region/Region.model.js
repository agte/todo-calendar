const { DataTypes } = require('sequelize');

const Schema = {
  name: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
};

module.exports = (app) => {
  const sequelizeClient = app.get('sequelizeClient');
  const Region = sequelizeClient.define('Region', Schema, {
    tableName: 'region',
    underscored: true,
  });

  return Region;
};
