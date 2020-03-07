const { Conflict, NotFound } = require('@feathersjs/errors');

const checkRoles = require('../../hooks/authorization/checkRoles.js');
const validate = require('../../hooks/validate.js');

const createRoleSchema = require('./schemas/createRole.json');

class UserRoles {
  constructor(options, app) {
    this.options = options || {};
    this.parent = 'user';
    this.Users = app.service('user');
  }

  async create({ id }, { route }) {
    const user = await this.Users.Model.findOne({ where: { id: route.pid } });
    if (user.roles.includes(id)) {
      throw new Conflict('Duplicate role');
    }
    user.roles.push(id);
    await user.save();
    return { id };
  }

  async remove(id, { route }) {
    const user = await this.Users.Model.findOne({ where: { id: route.pid } });
    if (!user.roles.includes(id)) {
      throw new NotFound('Role not found');
    }
    user.roles.pull(id);
    await user.save();
    return { id };
  }
}

const hooks = {
  before: {
    create: [
      checkRoles('admin'),
      validate(createRoleSchema),
    ],
    remove: [
      checkRoles('admin'),
    ],
  },
};

module.exports = (app) => {
  app.use('/user/:pid/roles', new UserRoles({}, app));
  const service = app.service('user/:pid/roles');
  service.hooks(hooks);
  service.publish('created', () => null);
  service.publish('removed', () => null);
};
