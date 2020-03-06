const User = require('./User/User.service.js');
const UserRoles = require('./User/UserRoles.service.js');

module.exports = function (app) {
  app.configure(User);
  app.configure(UserRoles);
};
