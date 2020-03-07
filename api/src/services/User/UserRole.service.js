const { BadRequest, Conflict, NotFound } = require('@feathersjs/errors');

const checkRoles = require('../../hooks/authorization/checkRoles.js');
const validate = require('../../hooks/validate.js');

const addRoleSchema = require('./schemas/addRole.json');

class UserRole {
  constructor(options, app) {
    this.options = options || {};
    this.parent = 'user';
    this.User = app.service('user');
  }

  async create({ id }, { route }) {
    const user = await this.User.Model.findOne({ where: { id: route.pid } });
    if (user.roles.includes(id)) {
      throw new Conflict('Duplicate role');
    }
    user.roles = [...user.roles, id];
    await user.save();
    return { id };
  }

  async remove(id, { route }) {
    const user = await this.User.Model.findOne({ where: { id: route.pid } });
    if (!user.roles.includes(id)) {
      throw new NotFound('Role not found');
    }
    if (id === 'user') {
      throw new BadRequest('Cannot remove a system role.');
    }
    user.roles = user.roles.filter((role) => role !== id);
    await user.save();
    return { id };
  }
}

const hooks = {
  before: {
    create: [
      checkRoles('admin'),
      validate(addRoleSchema),
    ],
    remove: [
      checkRoles('admin'),
    ],
  },
};

module.exports = (app) => {
  app.use('/user/:pid/roles', new UserRole({}, app));
  const service = app.service('user/:pid/roles');
  service.hooks(hooks);
  service.publish('created', () => null);
  service.publish('removed', () => null);
};
