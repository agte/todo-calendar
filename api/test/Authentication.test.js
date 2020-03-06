const assert = require('assert');
const app = require('../src/app.js');

describe('Authentication', () => {
  before(async () => app.start());
  after(async () => app.stop());

  it('service exists', () => {
    assert.ok(app.service('authentication'));
  });

  describe('local strategy', () => {
    const userInfo = {
      email: 'someone@example.com',
      password: 'supersecret',
    };

    it('register', async () => {
      await app.service('user').create(userInfo);
    });

    it('log in', async () => {
      const { user, accessToken } = await app.service('authentication').create({ strategy: 'local', ...userInfo });
      assert.ok(accessToken);
      assert.ok(user);
    });
  });
});
