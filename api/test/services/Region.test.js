const assert = require('assert');
const app = require('../../src/app');

describe('Region', () => {
  before(async () => app.start());
  after(async () => app.stop());

  const Region = app.service('region');

  const guestParams = { provider: 'test' };
  const userParams = { provider: 'test', user: { id: 32, roles: ['user'] } };
  const adminParams = { provider: 'test', user: { id: 64, roles: ['user', 'admin'] } };

  let regionA = null;

  describe('create', () => {
    it('user DISALLOWED', async () => {
      try {
        await Region.create({ name: 'Дримландия' }, userParams);
        assert.fail('Never get here');
      } catch (e) {
        assert.equal(e.code, 403);
      }
    });

    it('admin ALLOWED', async () => {
      const region = await Region.create({ name: 'Нарния' }, adminParams);
      assert.equal(region.name, 'Нарния');
      regionA = region;
    });
  });

  describe('read', () => {
    describe('list', () => {
      it('guest DISALLOWED', async () => {
        try {
          await Region.find(guestParams);
          assert.fail('Never get here');
        } catch (e) {
          assert.equal(e.code, 403);
        }
      });

      it('user ALLOWED', async () => {
        const regions = await Region.find(userParams);
        assert.equal(regions.total, 1);
        assert.equal(regions.data[0].name, 'Нарния');
      });
    });

    describe('one', () => {
      it('guest DISALLOWED', async () => {
        try {
          await Region.get(regionA.id, guestParams);
          assert.fail('Never get here');
        } catch (e) {
          assert.equal(e.code, 403);
        }
      });

      it('user ALLOWED', async () => {
        const region = await Region.get(regionA.id, userParams);
        assert.equal(region.name, 'Нарния');
      });
    });
  });

  describe('update', () => {
    it('user DISALLOWED', async () => {
      try {
        await Region.patch(regionA.id, { name: 'Дримландия' }, userParams);
        assert.fail('Never get here');
      } catch (e) {
        assert.equal(e.code, 403);
      }
    });

    it('admin ALLOWED', async () => {
      const region = await Region.patch(regionA.id, { name: 'Дримландия' }, adminParams);
      assert.equal(region.name, 'Дримландия');
      regionA = region;
    });
  });

  describe('delete', () => {
    it('user DISALLOWED', async () => {
      try {
        await Region.remove(regionA.id, userParams);
        assert.fail('Never get here');
      } catch (e) {
        assert.equal(e.code, 403);
      }
    });

    it('admin ALLOWED', async () => {
      await Region.remove(regionA.id, adminParams);
      const regions = await Region.find({ id: regionA.id }, adminParams);
      assert.equal(regions.total, 0);
    });
  });
});
