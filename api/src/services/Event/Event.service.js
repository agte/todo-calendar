const { Service } = require('feathers-sequelize');
const { disallow } = require('feathers-hooks-common');
const { BadRequest, Forbidden } = require('@feathersjs/errors');

const checkRoles = require('../../hooks/authorization/checkRoles.js');
const validate = require('../../hooks/validate.js');

const createModel = require('./Event.model.js');
const createSchema = require('./schemas/create.json');
const patchSchema = require('./schemas/patch.json');

class Event extends Service {
  async find(params) {
    const { provider, user, query = {} } = params;
    if (provider && user && user.level !== 'federal') {
      if (query.regionId) {
        if (query.regionId.$in) {
          query.regionId.$in = query.regionId.$in.filter((regionId) => user.regions.includes(regionId));
        } else if (Number.isNaN(query.regionId)) {
          query.regionId.$in = user.regions.includes(query.regionId) ? [query.regionId] : [];
        } else {
          query.regionId.$in = user.regions;
        }
      } else {
        query.regionId = { $in: user.regions };
      }
    }
    return super.find({ ...params, query });
  }

  async get(id, params) {
    const { provider, user } = params;
    const result = await super.get(id, params);
    if (provider && user && user.level !== 'federal') {
      if (!user.regions.includes(result.regionId)) {
        throw new Forbidden();
      }
    }
    return result;
  }

  async create(data, params) {
    const { provider, user } = params;
    if (provider && user && user.level !== 'federal') {
      if (!user.regions.includes(data.regionId)) {
        throw new BadRequest('Not allowed region. Choose another.');
      }
    }
    return super.create(data, params);
  }

  async patch(id, data, params) {
    const { provider, user } = params;
    if (provider && user && user.level !== 'federal') {
      if (data.regionId && !user.regions.includes(data.regionId)) {
        throw new BadRequest(`You are not allowed to use region ${data.regionId}`);
      }
      const event = await this.Model.findOne({ where: { id } });
      if (!user.regions.includes(event.regionId)) {
        throw new Forbidden();
      }
    }
    return super.patch(id, data, params);
  }

  async remove(id, params) {
    const { provider, user } = params;
    if (provider && user && user.level !== 'federal') {
      const event = await this.Model.findOne({ where: { id } });
      if (!user.regions.includes(event.regionId)) {
        throw new Forbidden();
      }
    }
    return super.remove(id, params);
  }
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
    update: [
      disallow(),
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
