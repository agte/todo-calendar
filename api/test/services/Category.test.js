const assert = require('assert');
const app = require('../../src/app');

describe('Category', () => {
  before(async () => app.start());
  after(async () => app.stop());

  const Category = app.service('category');

  const guestParams = { provider: 'test' };
  const userParams = { provider: 'test', user: { id: 32, roles: ['user'] } };
  const adminParams = { provider: 'test', user: { id: 64, roles: ['user', 'admin'] } };

  let categoryA = null;

  describe('create', () => {
    it('user DISALLOWED', async () => {
      try {
        await Category.create({ name: 'Законодательное собрание' }, userParams);
        assert.fail('Never get here');
      } catch (e) {
        assert.equal(e.code, 403);
      }
    });

    it('admin ALLOWED', async () => {
      const category = await Category.create({ name: 'Фракция' }, adminParams);
      assert.equal(category.name, 'Фракция');
      categoryA = category;
    });
  });

  describe('read', () => {
    describe('list', () => {
      it('guest DISALLOWED', async () => {
        try {
          await Category.find(guestParams);
          assert.fail('Never get here');
        } catch (e) {
          assert.equal(e.code, 403);
        }
      });

      it('user ALLOWED', async () => {
        const categories = await Category.find(userParams);
        assert.equal(categories.total, 1);
        assert.equal(categories.data[0].name, 'Фракция');
      });
    });

    describe('one', () => {
      it('guest DISALLOWED', async () => {
        try {
          await Category.get(categoryA.id, guestParams);
          assert.fail('Never get here');
        } catch (e) {
          assert.equal(e.code, 403);
        }
      });

      it('user ALLOWED', async () => {
        const category = await Category.get(categoryA.id, userParams);
        assert.equal(category.name, 'Фракция');
      });
    });
  });

  describe('update', () => {
    it('user DISALLOWED', async () => {
      try {
        await Category.patch(categoryA.id, { name: 'Законодательное собрание' }, userParams);
        assert.fail('Never get here');
      } catch (e) {
        assert.equal(e.code, 403);
      }
    });

    it('admin ALLOWED', async () => {
      const category = await Category.patch(categoryA.id, { name: 'Законодательное собрание' }, adminParams);
      assert.equal(category.name, 'Законодательное собрание');
      categoryA = category;
    });
  });

  describe('delete', () => {
    it('user DISALLOWED', async () => {
      try {
        await Category.remove(categoryA.id, userParams);
        assert.fail('Never get here');
      } catch (e) {
        assert.equal(e.code, 403);
      }
    });

    it('admin ALLOWED', async () => {
      await Category.remove(categoryA.id, adminParams);
      const categories = await Category.find({ id: categoryA.id }, adminParams);
      assert.equal(categories.total, 0);
    });
  });
});
