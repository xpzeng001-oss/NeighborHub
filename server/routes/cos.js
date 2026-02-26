const router = require('express').Router();
const STS = require('qcloud-cos-sts');
const { auth } = require('../middleware/auth');

/**
 * GET /api/cos/sts
 * 返回腾讯 COS 临时凭证，供小程序直传使用（需登录）
 */
router.get('/sts', auth, (req, res) => {
  const bucket      = process.env.COS_BUCKET;
  const region      = process.env.COS_REGION;
  const appId       = bucket.substr(1 + bucket.lastIndexOf('-'));
  const shortName   = bucket.substr(0, bucket.lastIndexOf('-'));
  const allowPrefix = 'neighborhub/*';

  const policy = {
    version: '2.0',
    statement: [{
      action: [
        'name/cos:PutObject',
        'name/cos:PostObject',
        'name/cos:InitiateMultipartUpload',
        'name/cos:ListMultipartUploads',
        'name/cos:ListParts',
        'name/cos:UploadPart',
        'name/cos:CompleteMultipartUpload',
        'name/cos:AbortMultipartUpload',
        'name/cos:HeadObject'
      ],
      effect: 'allow',
      principal: { qcs: ['*'] },
      resource: [
        `qcs::cos:${region}:uid/${appId}:prefix//${appId}/${shortName}/${allowPrefix}`
      ]
    }]
  };

  STS.getCredential(
    {
      secretId:        process.env.TENCENT_SECRET_ID,
      secretKey:       process.env.TENCENT_SECRET_KEY,
      durationSeconds: 1800,
      policy
    },
    function (err, tempKeys) {
      if (err) {
        console.error('STS Error:', err);
        return res.status(500).json({ code: 500, message: '获取上传凭证失败', data: null });
      }
      res.json({
        code: 0,
        data: {
          credentials:  tempKeys.credentials,
          startTime:    tempKeys.startTime,
          expiredTime:  tempKeys.expiredTime,
          bucket,
          region
        }
      });
    }
  );
});

module.exports = router;
