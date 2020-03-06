const logger = require('./logger');

module.exports = async (app) => {
  logger.info('Start seeding...');
  const User = app.service('user');
  const UserRoles = app.service('user/:pid/roles');

  const adminInfo = app.get('adminInfo');
  let admin = await User.Model.findOne({ where: { email: adminInfo.email } });
  if (!admin) {
    admin = await User.Model.create(adminInfo);
  }
  if (!admin.roles.includes('admin')) {
    await UserRoles.create({ id: 'admin' }, { route: { pid: admin.id } });
  }
  logger.info('Seeding is finished.');
};
