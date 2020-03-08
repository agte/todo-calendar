const Category = require('./Category/Category.service.js');
const Event = require('./Event/Event.service.js');
const EventStatus = require('./Event/EventStatus.service.js');
const Region = require('./Region/Region.service.js');
const User = require('./User/User.service.js');
const UserRegion = require('./User/UserRegion.service.js');
const UserRole = require('./User/UserRole.service.js');

module.exports = (app) => {
  app.configure(Category);
  app.configure(Event);
  app.configure(EventStatus);
  app.configure(Region);
  app.configure(User);
  app.configure(UserRegion);
  app.configure(UserRole);
};
