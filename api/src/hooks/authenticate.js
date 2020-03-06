const { authenticate } = require('@feathersjs/authentication').hooks;

/* eslint-disable no-param-reassign */
module.exports = () => (context) => {
  if (context.type !== 'before') {
    throw new Error('authenticate hook must be used as a before hook');
  }

  if (context.params.user) {
    return context;
  }

  const { params: { authentication, headers, provider } } = context;

  if (!provider) {
    context.params.user = {
      id: -1,
      roles: ['system'],
    };
    return context;
  }

  if (!authentication && (!headers || !headers.authorization)) {
    context.params.user = {
      id: 0,
      roles: ['guest'],
    };
    return context;
  }

  return authenticate('jwt')(context);
};
