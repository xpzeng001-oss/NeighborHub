const path = require('path');
const crypto = require('crypto');
const COS = require('cos-nodejs-sdk-v5');

const getCosClient = () => new COS({
  SecretId: process.env.TENCENT_SECRET_ID,
  SecretKey: process.env.TENCENT_SECRET_KEY
});

/**
 * 上传文件到腾讯 COS
 * @param {Express.Multer.File} file  multer 内存存储的文件对象
 * @returns {Promise<string>}  COS 图片公网 URL
 */
exports.upload = async (file) => {
  const cos = getCosClient();
  const ext = path.extname(file.originalname) || '.jpg';
  const key = `neighborhub/${Date.now()}_${crypto.randomBytes(4).toString('hex')}${ext}`;
  const bucket = process.env.COS_BUCKET;
  const region = process.env.COS_REGION;

  return new Promise((resolve, reject) => {
    cos.putObject({
      Bucket: bucket,
      Region: region,
      Key: key,
      Body: file.buffer,
      ContentLength: file.size
    }, (err) => {
      if (err) return reject(err);
      resolve(`https://${bucket}.cos.${region}.myqcloud.com/${key}`);
    });
  });
};
