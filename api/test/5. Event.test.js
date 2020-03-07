// const assert = require('assert');
const app = require('../src/app');
const utils = require('./utils.js');

const { expectError } = utils;

const Event = app.service('event');
const Category = app.service('category');
const Region = app.service('region');
const User = app.service('user');
const UserRole = app.service('user/:pid/roles');

const testData = {
  name: 'Unknown',
  startDate: (() => {
    const now = new Date();
    now.setDate(now.getDate() + 1);
    return now.toUTCString();
  })(),
  endDate: (() => {
    const now = new Date();
    now.setDate(now.getDate() + 1);
    now.setHours(now.getHours() + 1);
    return now.toUTCString();
  })(),
  regionId: null,
  categoryId: null,
};

let categories;
let regions;
let userReader;
let userWriter;
let userModerator;

const asReader = { provider: 'test', user: null };
const asWriter = { provider: 'test', user: null };
const asModerator = { provider: 'test', user: null };

describe('Event', () => {
  before(async () => {
    await app.start();

    categories = await Promise.all([
      Category.create({ name: 'Праздник' }),
      Category.create({ name: 'Совещание' }),
      Category.create({ name: 'Крестовый поход' }),
    ]);
    testData.categoryId = categories[0].id;

    regions = await Promise.all([
      Region.create({ name: 'Нарния' }),
      Region.create({ name: 'Мордор' }),
      Region.create({ name: 'Дримландия' }),
    ]);
    testData.regionId = regions[0].id;

    userReader = await User.create({ email: 'reader@test.test', password: '123123' });
    userWriter = await User.create({ email: 'writer@test.test', password: '123123' });
    userModerator = await User.create({ email: 'moderator@test.test', password: '123123' });

    await UserRole.create({ id: 'writer' }, { route: { pid: userReader.id } });
    await UserRole.create({ id: 'moderator' }, { route: { pid: userModerator.id } });
    userWriter = await User.get(userWriter.id);
    userModerator = await User.get(userModerator.id);

    asReader.user = userReader;
    asWriter.user = userWriter;
    asModerator.user = userModerator;
  });

  after(async () => app.stop());

  it('create | reader | error', () => expectError(403, Event.create(testData, asReader)));
  // ...
});
