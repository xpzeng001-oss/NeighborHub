/**
 * 批量上传本地头像到腾讯云 COS
 *
 * 用法：
 *   node server/scripts/uploadAvatars.js ./avatars
 *
 * 会将文件夹内所有图片按顺序上传为：
 *   neighborhub/avatars/1.png, 2.png, ... N.png
 *
 * 需要 .env 中配置: TENCENT_SECRET_ID, TENCENT_SECRET_KEY, COS_BUCKET, COS_REGION
 */
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });

const fs = require('fs');
const path = require('path');
const COS = require('cos-nodejs-sdk-v5');

const cos = new COS({
  SecretId: process.env.TENCENT_SECRET_ID,
  SecretKey: process.env.TENCENT_SECRET_KEY
});
const bucket = process.env.COS_BUCKET;
const region = process.env.COS_REGION;

const SUPPORTED_EXT = new Set(['.png', '.jpg', '.jpeg', '.webp', '.gif']);

async function upload(filePath, key) {
  return new Promise((resolve, reject) => {
    cos.putObject({
      Bucket: bucket,
      Region: region,
      Key: key,
      Body: fs.createReadStream(filePath),
      ContentLength: fs.statSync(filePath).size
    }, (err) => {
      if (err) return reject(err);
      resolve(`https://${bucket}.cos.${region}.myqcloud.com/${key}`);
    });
  });
}

async function main() {
  const dir = process.argv[2];
  if (!dir) {
    console.error('用法: node uploadAvatars.js <头像文件夹路径>');
    process.exit(1);
  }

  const absDir = path.resolve(dir);
  const files = fs.readdirSync(absDir)
    .filter(f => SUPPORTED_EXT.has(path.extname(f).toLowerCase()))
    .sort();

  console.log(`找到 ${files.length} 张头像图片`);

  for (let i = 0; i < files.length; i++) {
    const filePath = path.join(absDir, files[i]);
    const key = `neighborhub/avatars/${i + 1}.png`;
    try {
      const url = await upload(filePath, key);
      console.log(`[${i + 1}/${files.length}] ✓ ${files[i]} → ${url}`);
    } catch (e) {
      console.error(`[${i + 1}/${files.length}] ✗ ${files[i]}: ${e.message}`);
    }
  }

  console.log(`\n上传完成！共 ${files.length} 张`);
  console.log(`请在 .env 中设置: AVATAR_COUNT=${files.length}`);
}

main();
