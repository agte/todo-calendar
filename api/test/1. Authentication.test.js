const assert = require('assert');
const app = require('../src/app.js');

const User = app.service('user');

describe('Authentication', () => {
  const Authentication = app.service('authentication');

  before(async () => {
    await app.start();
    await User.create({ email: 'qwerty', password: 'someone@example.com' });
  });

  after(() => app.stop());

  describe('Local strategy', () => {
    it('log in', async () => {
      const { user, accessToken } = await Authentication.create({
        strategy: 'local',
        email: 'qwerty',
        password: 'someone@example.com',
      });
      assert.ok(accessToken);
      assert.ok(user);
    });
  });
});
