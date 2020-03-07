const { Service } = require('feathers-sequelize');
const { disallow } = require('feathers-hooks-common');
const { hashPassword, protect } = require('@feathersjs/authentication-local').hooks;
const checkAccess = require('../../hooks/authorization/checkAccess.js');
const checkRoles = require('../../hooks/authorization/checkRoles.js');
const validate = require('../../hooks/validate.js');

const createModel = require('./User.model.js');
const createSchema = require('./schemas/create.json');
const patchSchema = require('./schemas/patch.json');

class User extends Service {
}

const hooks = {
  before: {
    find: [
      checkRoles('admin'),
    ],
    get: [
      checkRoles('user'),
      checkAccess('id'),
    ],
    create: [
      validate(createSchema),
      hashPassword('password'),
    ],
    patch: [
      checkAccess('id'),
      validate(patchSchema),
      hashPassword('password'),
    ],
    remove: [
      disallow('external'),
    ],
  },

  after: {
    all: [
      protect('password'),
    ],
  },
};

module.exports = (app) => {
  const options = {
    Model: createModel(app),
    paginate: app.get('paginate'),
  };
  app.use('/user', new User(options, app));
  app.service('user').hooks(hooks);
};
