const multer = require('multer');
const path = require('path');
const fs = require('fs');

function makeStorage(sub) {
  const dir = path.join(__dirname, 'uploads', sub);
  fs.mkdirSync(dir, { recursive: true });
  return multer.diskStorage({
    destination: (_, __, cb) => cb(null, dir),
    filename: (_, file, cb) => {
      const safe = file.originalname.replace(/[^a-z0-9._-]/gi, '_');
      cb(null, Date.now() + '_' + safe);
    }
  });
}

module.exports = {
  covers: multer({ storage: makeStorage('covers') }),
  music:  multer({ storage: makeStorage('music')  }),
  videos: multer({ storage: makeStorage('videos') }),
  thumbs: multer({ storage: makeStorage('thumbs') }),
  any:    multer({ storage: multer.diskStorage({
    destination: (_, __, cb) => cb(null, path.join(__dirname, 'uploads')),
    filename: (_, file, cb) => cb(null, Date.now() + '_' + file.originalname.replace(/[^a-z0-9._-]/gi, '_'))
  })})
};
