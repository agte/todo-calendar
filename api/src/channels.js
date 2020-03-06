module.exports = function (app) {
  app.on('connection', (connection) => {
    app.channel('guest').join(connection);
  });

  app.on('login', (authResult, { connection }) => {
    if (connection && connection.user) {
      connection.user.roles.forEach((role) => app.channel(role).join(connection));
      app.channel(connection.user.id).join(connection);
    }
  });

  app.on('logout', (authResult, { connection }) => {
    if (connection && connection.user) {
      connection.user.roles.forEach((role) => app.channel(role).leave(connection));
      app.channel(connection.user.id).leave(connection);
    }
  });

  app.publish((data) => {
    let names = [];
    if (data.acl && data.acl.read) {
      names = data.acl.read;
    }
    if (data.owner) {
      names.push(data.owner);
    }

    if (!names.length) {
      return null;
    }
    return app.channel(...names);
  });
};
