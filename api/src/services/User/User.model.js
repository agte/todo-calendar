// See http://docs.sequelizejs.com/en/latest/docs/models-definition/
// for more of what you can do here.
const { DataTypes } = require('sequelize');

const Schema = {
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  roles: {
    type: DataTypes.ARRAY(DataTypes.ENUM([
      'user',
      'admin',
      'writer',
      'moderator',
      // + you may meet virtual 'guest' and 'system' in middlewares, but never in the database
    ])),
    defaultValue: ['user'],
    allowNull: false,
  },
  level: {
    type: DataTypes.ENUM([
      'regional',
      'district',
      'federal',
    ]),
    allowNull: false,
    defaultValue: 'regional',
  },
  regions: {
    type: DataTypes.ARRAY(DataTypes.INTEGER),
    allowNull: false,
    defaultValue: [],
  },
};

const hooks = {
  beforeCount(options) {
    options.raw = true; // eslint-disable-line no-param-reassign
  },
};

module.exports = (app) => {
  const sequelizeClient = app.get('sequelizeClient');
  const User = sequelizeClient.define('User', Schema, {
    hooks,
    tableName: 'user',
    timestamps: true,
  });

  return User;
};
