const { Op } = require('sequelize');
const Community = require('../models/Community');

async function getCommunityIdsForDistrict(districtId) {
  if (!districtId) return null;
  const communities = await Community.findAll({
    where: { district_id: districtId, status: 'active' },
    attributes: ['id'],
    raw: true
  });
  return communities.map(c => c.id);
}

async function buildDistrictFilter(districtId) {
  if (!districtId) return {};
  const ids = await getCommunityIdsForDistrict(districtId);
  if (!ids || ids.length === 0) return { community_id: -1 }; // match nothing
  return { community_id: { [Op.in]: ids } };
}

module.exports = { getCommunityIdsForDistrict, buildDistrictFilter };
