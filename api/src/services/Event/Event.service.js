const { Service } = require('feathers-sequelize');

const checkRoles = require('../../hooks/authorization/checkRoles.js');
const validate = require('../../hooks/validate.js');

const createModel = require('./Event.model.js');
const createSchema = require('./schemas/create.json');
const patchSchema = require('./schemas/patch.json');

class Event extends Service {
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
      checkRoles('writer', 'moderator'),
      validate(createSchema),
    ],
    patch: [
      checkRoles('moderator'),
      validate(patchSchema),
    ],
    remove: [
      checkRoles('moderator'),
    ],
  },
};

module.exports = (app) => {
  const options = {
    Model: createModel(app),
    paginate: {
      default: 10,
      max: 100,
    },
  };
  app.use('/event', new Event(options, app));
  app.service('event').hooks(hooks);
};
