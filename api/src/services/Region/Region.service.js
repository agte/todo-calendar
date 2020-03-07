const { Service } = require('feathers-sequelize');

const checkRoles = require('../../hooks/authorization/checkRoles.js');

const createModel = require('./Region.model.js');

class Region extends Service {
}

const hooks = {
  before: {
    find: [
      checkRoles('user'),
    ],
    get: [
      checkRoles('user'),
    ],
    create: [
      checkRoles('admin'),
    ],
    patch: [
      checkRoles('admin'),
    ],
    remove: [
      checkRoles('admin'),
    ],
  },
};

module.exports = (app) => {
  const options = {
    Model: createModel(app),
    paginate: {
      default: 1000,
      max: 1000,
    },
  };
  app.use('/region', new Region(options, app));
  app.service('region').hooks(hooks);
};
