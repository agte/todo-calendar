const assert = require('assert').strict;
const axios = require('axios');
const app = require('../src/app.js');

describe('Application', () => {
  before(async () => {
    app.set('web', true);
    await app.start();
    axios.defaults.baseURL = `http://localhost:${app.get('server').address().port}`;
  });

  after(async () => {
    await app.stop();
    app.set('web', false);
  });

  it('index HTML page', async () => {
    const { data } = await axios.get('/');
    assert.ok(data.includes('<html lang="en">'));
  });

  describe('404', () => {
    it('404 HTML page', async () => {
      try {
        await axios.get('path/to/nowhere', { headers: { Accept: 'text/html' } });
        assert.fail('should never get here');
      } catch (error) {
        const { response } = error;
        assert.equal(response.status, 404);
        assert.ok(response.data.includes('<html>'));
      }
    });

    it('404 JSON error', async () => {
      try {
        await axios.get('path/to/nowhere', { json: true });
        assert.fail('should never get here');
      } catch (error) {
        const { response } = error;
        assert.equal(response.status, 404);
        assert.equal(response.data.code, 404);
        assert.equal(response.data.message, 'Page not found');
        assert.equal(response.data.name, 'NotFound');
      }
    });
  });
});
