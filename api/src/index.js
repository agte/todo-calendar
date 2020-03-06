const app = require('./app');

app.start()
  .then(() => {
    app.get('logger').info('Application started successfully');
  })
  .catch((e) => {
    app.get('logger').info('Application has been shut down. Reason: %s', e.message);
    process.exit(-1);
  });
