const { Forbidden, NotFound } = require('@feathersjs/errors');

const checkRoles = require('../../hooks/authorization/checkRoles.js');
const validate = require('../../hooks/validate.js');

const updateStatusSchema = require('./schemas/updateStatus.json');

class EventStatus {
  constructor(options, app) {
    this.options = options || {};
    this.parent = 'event';
    this.Event = app.service('event');
  }

  async update(id, { value }, params) {
    const { provider, user, route } = params;
    const event = await this.Event.Model.findOne({ where: { id: route.pid } });
    if (!event) {
      return new NotFound();
    }
    if (provider && user && user.level !== 'federal') {
      if (!user.regions.includes(event.regionId)) {
        throw new Forbidden();
      }
    }
    if (event.status !== value) {
      event.status = value;
      await event.save();
    }
    this.Event.emit('patched', event.toJSON());
    return { value };
  }
}

const hooks = {
  before: {
    update: [
      checkRoles('moderator'),
      validate(updateStatusSchema),
    ],
  },
};

module.exports = (app) => {
  app.use('/event/:pid/status', new EventStatus({}, app));
  const service = app.service('event/:pid/status');
  service.hooks(hooks);
  service.publish('updated', () => null);
};
