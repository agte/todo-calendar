const assert = require('assert');

const expectError = (code, promise) => { // eslint-disable-line arrow-body-style
  return promise.then(() => assert.fail('Never get here'), (e) => assert.equal(e.code, code));
};

module.exports = {
  expectError,
  asGuest: { provider: 'test', user: { id: 0, roles: ['guest'] } },
  asUser: { provider: 'test', user: { id: 666, roles: ['user'] } },
  asAdmin: { provider: 'test', user: { id: 999, roles: ['user', 'admin'] } },
};
