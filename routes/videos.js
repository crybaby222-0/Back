const router = require('express').Router();
const db = require('../db');
const { requireAuth } = require('../auth');
const up = require('../upload');

router.get('/', (req, res) => {
  const { playlist } = req.query;
  let sql = 'SELECT * FROM videos';
  const params = [];
  if (playlist) { sql += ' WHERE playlist=?'; params.push(playlist); }
  sql += ' ORDER BY created_at DESC';
  res.json(db.prepare(sql).all(...params));
});

const fields = up.any.fields([
  { name: 'thumb', maxCount: 1 },
  { name: 'video_file', maxCount: 1 },
  { name: 'preview', maxCount: 1 },
]);

router.post('/', requireAuth, fields, (req, res) => {
  const f = req.files || {};
  const { title, youtube_url, playlist } = req.body;
  const thumb    = f.thumb      ? '/uploads/' + f.thumb[0].filename      : null;
  const video    = f.video_file ? '/uploads/' + f.video_file[0].filename : null;
  const preview  = f.preview    ? '/uploads/' + f.preview[0].filename    : null;
  const info = db.prepare(`INSERT INTO videos (title, thumb, video_file, youtube_url, preview, playlist)
    VALUES (?,?,?,?,?,?)`).run(title, thumb, video, youtube_url||'', preview, playlist||'');
  res.json({ id: info.lastInsertRowid });
});

router.delete('/:id', requireAuth, (req, res) => {
  db.prepare('DELETE FROM videos WHERE id=?').run(req.params.id);
  res.json({ ok: true });
});

module.exports = router;
