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
      'reader',
      'writer',
      'moderator',
      // + you may meet virtual 'guest' and 'system' in middlewares, but never in the database
    ])),
    defaultValue: ['user'],
    allowNull: false,
  },
};

const hooks = {
  beforeCount(options) {
    options.raw = true; // eslint-disable-line no-param-reassign
  },
};

module.exports = function (app) {
  const sequelizeClient = app.get('sequelizeClient');
  const User = sequelizeClient.define('user', Schema, {
    hooks,
    timestamps: true,
    underscored: true,
  });

  // eslint-disable-next-line no-unused-vars
  User.associate = function (models) {
    // Define associations here
    // See http://docs.sequelizejs.com/en/latest/docs/associations/
  };

  return User;
};
