const assert = require('assert');
const app = require('../src/app');
const utils = require('./utils.js');

const {
  expectError,
  asGuest, asUser, asAdmin,
} = utils;

const Region = app.service('region');

describe('Region', () => {
  before(() => app.start());
  after(() => app.stop());

  let REG_ID;

  it('create | user  | error', () => expectError(403, Region.create({ name: 'Дримландия' }, asUser)));
  it('create | admin | ok', async () => {
    const region = await Region.create({ name: 'Нарния' }, asAdmin);
    assert.equal(region.name, 'Нарния');
    REG_ID = region.id;
  });
  it('list   | guest | error', () => expectError(403, Region.find(asGuest)));
  it('list   | user  | ok', async () => {
    const regions = await Region.find(asUser);
    assert.equal(regions.total, 1);
    assert.equal(regions.data[0].name, 'Нарния');
  });
  it('read   | guest | error', () => expectError(403, Region.get(REG_ID, asGuest)));
  it('read   | user  | ok', async () => {
    const region = await Region.get(REG_ID, asUser);
    assert.equal(region.name, 'Нарния');
  });
  it('update | user  | error', () => expectError(403, Region.patch(REG_ID, { name: 'Дримландия' }, asUser)));
  it('update | admin | ok', async () => {
    const region = await Region.patch(REG_ID, { name: 'Дримландия' }, asAdmin);
    assert.equal(region.name, 'Дримландия');
  });
  it('delete | user  | error', () => expectError(403, Region.remove(REG_ID, asUser)));
  it('delete | admin | ok', async () => {
    await Region.remove(REG_ID, asAdmin);
    const regions = await Region.find({ id: REG_ID }, asAdmin);
    assert.equal(regions.total, 0);
  });
});
