const path = require('path');

const compress = require('compression');
const cors = require('cors');
const favicon = require('serve-favicon');
const helmet = require('helmet');

const configuration = require('@feathersjs/configuration');
const express = require('@feathersjs/express');
const feathers = require('@feathersjs/feathers');
const socketio = require('@feathersjs/socketio');
const { disallow } = require('feathers-hooks-common');

const authentication = require('./authentication');
const channels = require('./channels');
const logger = require('./logger');
const middleware = require('./middleware');
const seed = require('./seed.js');
const sequelize = require('./sequelize');
const services = require('./services');
const toJSON = require('./hooks/toJSON.js');

const app = express(feathers());

app.configure(configuration());
app.set('logger', logger);

app.use(helmet());
app.use(cors());
app.use(compress());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(favicon(path.join(app.get('public'), 'favicon.ico')));
app.use('/', express.static(app.get('public')));

app.configure(express.rest()); // rest provider
app.configure(socketio()); // socketio provider

app.configure(sequelize);
app.configure(middleware);
app.configure(authentication);
app.configure(services); // all routes are here
app.configure(channels);

app.use(express.notFound());
app.use(express.errorHandler({ logger }));

app.hooks({
  before: {
    all: [],
    find: [],
    get: [],
    create: [],
    update: [disallow()],
    patch: [],
    remove: [],
  },
  after: {
    all: [toJSON()],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: [],
  },
  error: {
    all: [],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: [],
  },
});

app.start = async function start() {
  process.on('unhandledRejection', (reason, p) => logger.error('Unhandled Rejection at: Promise ', p, reason));

  if (this.get('web')) {
    const port = this.get('port');
    await new Promise((resolve, reject) => {
      const server = this.listen(port);
      this.set('server', server);
      server.on('listening', () => {
        logger.info('Web server started on http://%s:%d', this.get('host'), server.address().port);
        resolve();
      });
      server.on('error', reject);
    });
  } else {
    this.setup();
  }

  const sequelizeSync = this.get('sequelizeSync');
  if (sequelizeSync) {
    await sequelizeSync;
  }

  if (this.get('seed')) {
    await seed(this);
  }
};

app.stop = async function stop() {
  const server = this.get('server');
  if (server) {
    await new Promise((resolve) => {
      server.close(() => {
        logger.info('Web server has been stopped');
        this.set('server', null);
        resolve();
      });
    });
  }
};

module.exports = app;
