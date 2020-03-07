const Sequelize = require('sequelize');

module.exports = function (app) {
  const connectionString = app.get('postgres');
  const sequelize = new Sequelize(connectionString, {
    dialect: 'postgres',
    dialectOptions: {
      useUTC: true, // for reading from database
    },
    timezone: '0', // for writing to database
    logging: false,
    define: {
      underscored: true,
      freezeTableName: true,
      syncOnAssociation: true,
      charset: 'utf8',
      collate: 'utf8_general_ci',
      timestamps: false,
    },
  });
  const oldSetup = app.setup;

  app.set('sequelizeClient', sequelize);

  app.setup = function (...args) { // eslint-disable-line no-param-reassign
    const result = oldSetup.apply(this, args);

    // Set up data relationships
    const { models } = sequelize;
    Object.keys(models).forEach((name) => {
      if ('associate' in models[name]) {
        models[name].associate(models);
      }
    });

    if (app.get('env') === 'test') {
      app.set('sequelizeSync', sequelize.sync({ force: true, match: /_test$/ }));
    } else {
      app.set('sequelizeSync', sequelize.sync({ force: false }));
    }
    return result;
  };
};
