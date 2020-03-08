const assert = require('assert');
const app = require('../src/app');
const utils = require('./utils.js');

const { expectError } = utils;

const Event = app.service('event');
const EventStatus = app.service('event/:pid/status');
const Category = app.service('category');
const Region = app.service('region');

const testData = {
  name: 'Unknown',
  startDate: (() => {
    const now = new Date();
    now.setDate(now.getDate() + 1);
    return now.toISOString();
  })(),
  endDate: (() => {
    const now = new Date();
    now.setDate(now.getDate() + 1);
    now.setHours(now.getHours() + 1);
    return now.toISOString();
  })(),
};

let REG_ID;
let EV_ID;
let EV2_ID;

describe('Event', () => {
  before(async () => {
    await app.start();

    const category = await Category.create({ name: 'Праздник' });
    testData.categoryId = category.id;

    const regions = await Promise.all([
      Region.create({ name: 'Нарния' }),
      Region.create({ name: 'Мордор' }),
    ]);
    REG_ID = regions[0].id;

    const events = await Promise.all([
      Event.create({ ...testData, regionId: regions[0].id }),
      Event.create({ ...testData, regionId: regions[1].id }),
    ]);
    EV_ID = events[0].id;
    EV2_ID = events[1].id;
  });

  after(async () => app.stop());

  describe('Regional reader', () => {
    let asReader;
    before(() => {
      asReader = {
        provider: 'test',
        user: {
          id: 1,
          roles: ['user'],
          level: 'regional',
          regions: [REG_ID],
        },
      };
    });

    it('create | own reg | error', () => expectError(403, Event.create({ ...testData, regionId: REG_ID }, asReader)));
    it('list   | own reg | ok', async () => {
      const events = await Event.find(asReader);
      assert.equal(events.total, 1);
      assert.equal(events.data[0].regionId, REG_ID);
    });
    it('read   | own reg | ok', async () => {
      const event = await Event.get(EV_ID, asReader);
      assert.ok(event);
    });
    it('read   | not own | error', () => expectError(403, Event.get(EV2_ID, asReader)));
    it('update | own reg | error', () => expectError(403, Event.patch(EV_ID, { name: 'Any name' }, asReader)));
    it('delete | own reg | error', () => expectError(403, Event.remove(EV_ID, asReader)));

    describe('Event status', () => {
      before(() => {
        asReader.route = { pid: EV_ID };
      });
      it('update | own reg | error', () => expectError(403, EventStatus.update(null, { value: 'approved' }, asReader)));
    });
  });

  describe('Regional writer', () => {
    let asWriter;
    before(() => {
      asWriter = {
        provider: 'test',
        user: {
          id: 1,
          roles: ['user', 'writer'],
          level: 'regional',
          regions: [REG_ID],
        },
      };
    });

    it('create | own reg | ok', async () => {
      const event = await Event.create({ ...testData, regionId: REG_ID }, asWriter);
      assert.equal(event.status, 'draft');
    });
    it('list   | own reg | ok', async () => {
      const events = await Event.find(asWriter);
      assert.equal(events.total, 2);
      assert.equal(events.data[0].regionId, REG_ID);
    });
    it('read   | own reg | ok', async () => {
      const event = await Event.get(EV_ID, asWriter);
      assert.ok(event);
    });
    it('read   | not own | error', () => expectError(403, Event.get(EV2_ID, asWriter)));
    it('update | own reg | error', () => expectError(403, Event.patch(EV_ID, { name: 'Any name' }, asWriter)));
    it('delete | own reg | error', () => expectError(403, Event.remove(EV_ID, asWriter)));

    describe('Event status', () => {
      before(() => {
        asWriter.route = { pid: EV_ID };
      });
      it('update | own reg | error', () => expectError(403, EventStatus.update(null, { value: 'approved' }, asWriter)));
    });
  });

  describe('Regional moderator', () => {
    // ...
  });
});
