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

  const Region = app.service('region');
  await Region.Model.bulkCreate([
    { id: 77, name: 'Москва' },
    { id: 50, name: 'Московская область' },
    { id: 78, name: 'Санкт-Петербург' },
    { id: 47, name: 'Ленинградская область' },
    { id: 2, name: 'Республика Башкортостан' },
  ], { ignoreDuplicates: true });

  logger.info('Seeding is finished.');
};
