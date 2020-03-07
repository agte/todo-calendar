const { DataTypes } = require('sequelize');

const Schema = {
  name: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
};

module.exports = (app) => {
  const sequelizeClient = app.get('sequelizeClient');
  const Category = sequelizeClient.define('Category', Schema, {
    tableName: 'category',
  });

  return Category;
};
