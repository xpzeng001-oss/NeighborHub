const multer = require('multer');
const ossService = require('../services/ossService');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB
});

exports.uploadMiddleware = upload.single('file');

exports.upload = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ code: 400, message: '请选择文件', data: null });
    }

    const url = await ossService.upload(req.file);
    res.json({ code: 0, data: { url } });
  } catch (err) {
    next(err);
  }
};
