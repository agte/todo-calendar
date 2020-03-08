const { BadRequest, Conflict, NotFound } = require('@feathersjs/errors');

const checkRoles = require('../../hooks/authorization/checkRoles.js');
const validate = require('../../hooks/validate.js');

const addRegionSchema = require('./schemas/addRegion.json');

class UserRole {
  constructor(options, app) {
    this.options = options || {};
    this.parent = 'user';
    this.User = app.service('user');
    this.app = app;
  }

  async create({ id }, { route }) {
    id = Number(id); // eslint-disable-line no-param-reassign
    try {
      await this.app.service('region').get(id);
    } catch (e) {
      throw new BadRequest(`Region "${id}" is not valid`);
    }

    const user = await this.User.Model.findOne({ where: { id: route.pid } });
    if (!user) {
      throw new NotFound();
    }
    if (user.level === 'regional' && user.regions.length === 1) {
      throw new Conflict('Regional level allows a user to add only one region');
    }
    if (user.regions.includes(id)) {
      throw new Conflict('Duplicate role');
    }
    user.regions = [...user.regions, id];
    await user.save();
    return { id };
  }

  async remove(id, { route }) {
    id = Number(id); // eslint-disable-line no-param-reassign

    const user = await this.User.Model.findOne({ where: { id: route.pid } });
    if (!user) {
      throw new NotFound();
    }
    if (!user.regions.includes(id)) {
      throw new NotFound('Region not found');
    }
    user.regions = user.regions.filter((regionId) => regionId !== id);
    await user.save();
    return { id };
  }
}

const hooks = {
  before: {
    create: [
      checkRoles('admin'),
      validate(addRegionSchema),
    ],
    remove: [
      checkRoles('admin'),
    ],
  },
};

module.exports = (app) => {
  app.use('/user/:pid/regions', new UserRole({}, app));
  const service = app.service('user/:pid/regions');
  service.hooks(hooks);
  service.publish('created', () => null);
  service.publish('removed', () => null);
};
