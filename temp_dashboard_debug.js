const { sequelize } = require('./backend/src/config/database');
const { Incoming, Area } = require('./backend/src/models');
const { Op } = require('sequelize');

(async () => {
  try {
    await sequelize.authenticate();
    console.log('DB OK');
    const total = await Incoming.count();
    console.log('total', total);
    const byStatus = {
      REGISTERED: await Incoming.count({ where: { status: 'REGISTERED' } }),
      DISTRIBUTED: await Incoming.count({ where: { status: 'DISTRIBUTED' } }),
      DELIVERED: await Incoming.count({ where: { status: 'DELIVERED' } }),
      ARCHIVED: await Incoming.count({ where: { status: 'ARCHIVED' } }),
    };
    console.log('byStatus', byStatus);
    const urgent = await Incoming.count({ where: { urgencyLevel: 'URGENT' } });
    console.log('urgent', urgent);
    const confidential = await Incoming.count({ where: { isConfidential: true } });
    console.log('confidential', confidential);
    const today = new Date();
    today.setHours(0,0,0,0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate()+1);
    const todayCount = await Incoming.count({ where: {
      receivedAt: {
        [Op.gte]: today,
        [Op.lt]: tomorrow
      }
    }});
    console.log('today', todayCount);
    const byAreaResults = await Incoming.findAll({
      attributes: [
        'recipient_area_id',
        [sequelize.fn('COUNT', sequelize.col('incoming_correspondence.id')), 'count']
      ],
      group: ['recipient_area_id'],
      include: [
        {
          model: Area,
          as: 'recipientArea',
          attributes: ['name']
        }
      ],
      raw: true,
      nest: true
    });
    console.log('byAreaResults', byAreaResults);
  } catch (error) {
    console.error('ERROR', error);
  } finally {
    await sequelize.close();
  }
})();