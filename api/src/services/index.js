const Category = require('./Category/Category.service.js');
const Region = require('./Region/Region.service.js');
const User = require('./User/User.service.js');
const UserRoles = require('./User/UserRoles.service.js');

module.exports = (app) => {
  app.configure(Category);
  app.configure(Region);
  app.configure(User);
  app.configure(UserRoles);
};
