const router = require('express').Router();
const db = require('../db');
const { requireAuth } = require('../auth');
const up = require('../upload');

router.get('/', (req, res) => {
  const { single } = req.query;
  let sql = 'SELECT s.*, a.title AS album_title FROM songs s LEFT JOIN albums a ON a.id=s.album_id';
  const params = [];
  if (single === '1') { sql += ' WHERE s.is_single=1'; }
  sql += ' ORDER BY s.created_at DESC';
  res.json(db.prepare(sql).all(...params));
});

router.get('/:id', (req, res) => {
  const r = db.prepare('SELECT * FROM songs WHERE id=?').get(req.params.id);
  if (!r) return res.status(404).json({ error: 'not found' });
  res.json(r);
});

const fields = up.any.fields([
  { name: 'cover', maxCount: 1 },
  { name: 'audio', maxCount: 1 },
  { name: 'snippet', maxCount: 1 },
]);

router.post('/', requireAuth, fields, (req, res) => {
  const f = req.files || {};
  const { title, album_id, is_single, track_order, lyrics, credits, spotify, youtube, apple } = req.body;
  const cover   = f.cover   ? '/uploads/' + f.cover[0].filename   : null;
  const audio   = f.audio   ? '/uploads/' + f.audio[0].filename   : null;
  const snippet = f.snippet ? '/uploads/' + f.snippet[0].filename : null;
  const info = db.prepare(`INSERT INTO songs (title, album_id, is_single, cover, audio, snippet, track_order, lyrics, credits, spotify, youtube, apple)
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`).run(
    title, album_id || null, is_single?1:0, cover, audio, snippet, parseInt(track_order||0), lyrics||'', credits||'', spotify||'', youtube||'', apple||''
  );
  res.json({ id: info.lastInsertRowid });
});

router.put('/:id', requireAuth, fields, (req, res) => {
  const cur = db.prepare('SELECT * FROM songs WHERE id=?').get(req.params.id);
  if (!cur) return res.status(404).json({ error: 'not found' });
  const f = req.files || {};
  const cover   = f.cover   ? '/uploads/' + f.cover[0].filename   : cur.cover;
  const audio   = f.audio   ? '/uploads/' + f.audio[0].filename   : cur.audio;
  const snippet = f.snippet ? '/uploads/' + f.snippet[0].filename : cur.snippet;
  const { title, album_id, is_single, track_order, lyrics, credits, spotify, youtube, apple } = req.body;
  db.prepare(`UPDATE songs SET title=?, album_id=?, is_single=?, cover=?, audio=?, snippet=?, track_order=?, lyrics=?, credits=?, spotify=?, youtube=?, apple=? WHERE id=?`)
    .run(title||cur.title, album_id||cur.album_id, is_single?1:0, cover, audio, snippet, parseInt(track_order||cur.track_order), lyrics||'', credits||'', spotify||'', youtube||'', apple||'', req.params.id);
  res.json({ ok: true });
});

router.delete('/:id', requireAuth, (req, res) => {
  db.prepare('DELETE FROM songs WHERE id=?').run(req.params.id);
  res.json({ ok: true });
});

module.exports = router;
