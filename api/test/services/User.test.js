const assert = require('assert');
const app = require('../../src/app');

describe('User', () => {
  before(async () => app.start());
  after(async () => app.stop());

  const User = app.service('user');

  const userParams = { provider: 'test', user: { id: 32, roles: ['user'] } };
  const adminParams = { provider: 'test', user: { id: 64, roles: ['user', 'admin'] } };

  let userA;

  describe('create', () => {
    it('guest ALLOWED', async () => {
      const user = await User.create({ email: 'someMail@example.com', password: '123123' }, { provider: 'test' });
      assert.equal(user.email, 'someMail@example.com');
      assert.ok(!user.password);
      userA = user;
    });
  });

  describe('read', () => {
    describe('list', () => {
      it('user DISALLOWED', async () => {
        try {
          await User.find(userParams);
          assert.fail('Never get here');
        } catch (e) {
          assert.equal(e.code, 403);
        }
      });

      it('admin ALLOWED', async () => {
        const users = await User.find(adminParams);
        assert.equal(users.total, 1);
        assert.equal(users.data[0].email, userA.email);
      });
    });
  });

  describe('update', () => {
    it('itself ALLOWED', async () => {
      const user = await User.patch(userA.id, { password: 'qwerty' }, { provider: 'test', user: userA });
      assert.ok(true);
      userA = user;
    });

    it('others DISALLOWED', async () => {
      try {
        await User.patch(userA.id, { password: 'qwerty' }, userParams);
        assert.fail('Never get here');
      } catch (e) {
        assert.equal(e.code, 403);
      }
    });
  });

  describe('delete', () => {
    it('anyone DISALLOWED', async () => {
      try {
        await User.remove(userA.id, { provider: 'test', user: userA });
        assert.fail('Never get here');
      } catch (e) {
        assert.equal(e.code, 405);
      }
    });

    it('system ALLOWED', async () => {
      await User.remove(userA.id);
      const users = await User.find();
      assert.equal(users.total, 0);
    });
  });
});
