const assert = require('assert');
const app = require('../src/app');
const utils = require('./utils.js');

const {
  expectError,
  asGuest, asUser, asAdmin,
} = utils;

const Category = app.service('category');

describe('Category', () => {
  before(() => app.start());
  after(() => app.stop());

  let CAT_ID;

  it('create | user  | error', () => expectError(403, Category.create({ name: 'Праздники' }, asUser)));
  it('create | admin | ok', async () => {
    const category = await Category.create({ name: 'Праздники' }, asAdmin);
    assert.equal(category.name, 'Праздники');
    CAT_ID = category.id;
  });
  it('list   | guest | error', () => expectError(403, Category.find(asGuest)));
  it('list   | user  | ok', async () => {
    const categories = await Category.find(asUser);
    assert.equal(categories.total, 1);
    assert.equal(categories.data[0].id, CAT_ID);
  });
  it('read   | guest | error', () => expectError(403, Category.get(CAT_ID, asGuest)));
  it('read   | user  | ok', async () => {
    const category = await Category.get(CAT_ID, asUser);
    assert.equal(category.id, CAT_ID);
  });
  it('update | user  | error', () => expectError(403, Category.patch(CAT_ID, { name: 'Похороны' }, asUser)));
  it('update | admin | ok', async () => {
    const category = await Category.patch(CAT_ID, { name: 'Похороны' }, asAdmin);
    assert.equal(category.name, 'Похороны');
  });
  it('delete | user  | error', () => expectError(403, Category.remove(CAT_ID, asUser)));
  it('delete | admin | ok', async () => {
    await Category.remove(CAT_ID, asAdmin);
    const categories = await Category.find({ id: CAT_ID }, asAdmin);
    assert.equal(categories.total, 0);
  });
});
