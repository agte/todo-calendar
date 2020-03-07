const assert = require('assert');
const app = require('../src/app');
const utils = require('./utils.js');

const {
  expectError,
  asGuest, asUser, asAdmin,
} = utils;

const User = app.service('user');
const UserRole = app.service('user/:pid/roles');
const UserRegion = app.service('user/:pid/regions');

describe('User', () => {
  before(async () => app.start());
  after(async () => app.stop());

  describe('User main', () => {
    let USER;

    it('create | guest | ok', async () => {
      const user = await User.create({ email: 'AAA@example.com', password: '123123' }, asGuest);
      assert.equal(user.email, 'AAA@example.com');
      assert.ok(!user.password);
      USER = user;
    });
    it('list   | user  | error', () => expectError(403, User.find(asUser)));
    it('list   | admin | ok', async () => {
      const users = await User.find(asAdmin);
      assert.equal(users.total, 1);
      assert.equal(users.data[0].email, USER.email);
    });
    it('update | other | error', () => expectError(403, User.patch(USER.id, { level: 'district' }, asUser)));
    it('update | owner | ok', async () => {
      const user = await User.patch(USER.id, { level: 'district' }, { provider: 'test', user: USER });
      assert.equal(user.level, 'district');
      USER = user;
    });
    it('delete | web   | error', () => expectError(405, User.remove(USER.id, { provider: 'test', user: USER })));
    it('delete | local | ok', async () => {
      await User.remove(USER.id);
      const users = await User.find();
      assert.equal(users.total, 0);
    });
  });

  describe('User roles', () => {
    let USER;

    before(async () => {
      const user = await User.create({ email: 'BBB@example.com', password: '123123' });
      USER = user;
    });

    it('create | admin | ok', async () => {
      await UserRole.create({ id: 'moderator' }, { ...asAdmin, route: { pid: USER.id } });
      const user = await User.get(USER.id);
      assert.ok(user.roles.includes('user'));
      assert.ok(user.roles.includes('moderator'));
    });

    it('delete | admin | ok', async () => {
      await UserRole.remove('moderator', { ...asAdmin, route: { pid: USER.id } });
      const user = await User.get(USER.id);
      assert.ok(user.roles.includes('user'));
      assert.ok(!user.roles.includes('moderator'));
    });
  });

  describe('User regions', () => {
    let USER;
    let REG_ID;

    before(async () => {
      const user = await User.create({ email: 'CCC@example.com', password: '123123' });
      USER = user;
      const region = await app.service('region').create({ name: 'Нарния' });
      REG_ID = region.id;
    });

    it('create | admin | ok', async () => {
      await UserRegion.create({ id: REG_ID }, { ...asAdmin, route: { pid: USER.id } });
      const user = await User.get(USER.id);
      assert.ok(user.regions.includes(REG_ID));
      USER = user;
    });

    it('delete | admin | ok', async () => {
      await UserRegion.remove(REG_ID, { ...asAdmin, route: { pid: USER.id } });
      const user = await User.get(USER.id);
      assert.ok(!user.regions.includes(REG_ID));
      USER = user;
    });
  });
});
