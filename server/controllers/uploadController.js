const multer = require('multer');
const sharp = require('sharp');
const ossService = require('../services/ossService');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB
});

const IMAGE_MIMES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

/**
 * 压缩图片：长边限制 1920px，JPEG quality 80，PNG 无损压缩
 */
async function compressImage(file) {
  if (!IMAGE_MIMES.includes(file.mimetype)) return file;

  let pipeline = sharp(file.buffer).rotate(); // 自动旋转 EXIF

  const meta = await pipeline.metadata();
  const maxDim = 1920;
  if (meta.width > maxDim || meta.height > maxDim) {
    pipeline = pipeline.resize(maxDim, maxDim, { fit: 'inside', withoutEnlargement: true });
  }

  if (file.mimetype === 'image/png') {
    pipeline = pipeline.png({ compressionLevel: 9, adaptiveFiltering: true });
  } else if (file.mimetype === 'image/gif') {
    return file; // GIF 不压缩，保留动图
  } else {
    pipeline = pipeline.jpeg({ quality: 80, mozjpeg: true });
  }

  const buf = await pipeline.toBuffer();
  return { ...file, buffer: buf, size: buf.length };
}

exports.uploadMiddleware = upload.single('file');

exports.upload = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ code: 400, message: '请选择文件', data: null });
    }

    const compressed = await compressImage(req.file);
    const url = await ossService.upload(compressed);
    res.json({ code: 0, data: { url } });
  } catch (err) {
    next(err);
  }
};
