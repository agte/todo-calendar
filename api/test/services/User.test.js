const assert = require('assert');
const app = require('../../src/app');

describe('User', () => {
  before(async () => app.start());
  after(async () => app.stop());

  it('service exists', () => {
    assert.ok(app.service('user'));
  });
});
