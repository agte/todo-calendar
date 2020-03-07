const { Service } = require('feathers-sequelize');

const checkRoles = require('../../hooks/authorization/checkRoles.js');

const createModel = require('./Category.model.js');

class Category extends Service {
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
  app.use('/category', new Category(options, app));
  app.service('category').hooks(hooks);
};
