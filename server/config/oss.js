const OSS = require('ali-oss');

let client = null;

function getOssClient() {
  if (!client) {
    client = new OSS({
      region: process.env.OSS_REGION,
      accessKeyId: process.env.OSS_ACCESS_KEY_ID,
      accessKeySecret: process.env.OSS_ACCESS_KEY_SECRET,
      bucket: process.env.OSS_BUCKET
    });
  }
  return client;
}

module.exports = getOssClient;
