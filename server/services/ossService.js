const path = require('path');
const crypto = require('crypto');
const getOssClient = require('../config/oss');

exports.upload = async (file) => {
  const client = getOssClient();
  const ext = path.extname(file.originalname) || '.jpg';
  const key = `neighborhub/${Date.now()}_${crypto.randomBytes(4).toString('hex')}${ext}`;
  const result = await client.put(key, file.buffer);
  return result.url;
};
