const { Forbidden } = require('@feathersjs/errors');

const authenticate = require('../authenticate.js');

/* eslint-disable no-param-reassign */
module.exports = () => async (context) => {
  if (context.type !== 'before') {
    throw new Error('"checkAccess" hook must be used as a before hook');
  }

  let { service, id } = context;

  if (context.service.parent) {
    service = context.app.service(context.service.parent);
    if (!service) {
      throw new Error('Unknown parent service');
    }
    id = context.params.route.pid;
  }

  if (!id) {
    throw new Error('"checkAccess" hook must be used only in methods which works with id');
  }

  if (!context.params.provider) {
    return context;
  }

  if (!context.params.user) {
    context = await authenticate()(context);
  }

  if (context.params.user.roles.includes('admin')) {
    return context;
  }

  const resource = await service.get(id);
  context.params.resource = resource;

  if (resource.owner && resource.owner === context.params.user.id) {
    return context;
  }

  throw new Forbidden();
};
