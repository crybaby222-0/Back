const router = require('express').Router();
const db = require('../db');
const { requireAuth } = require('../auth');
const up = require('../upload');

router.get('/', (req, res) => {
  const rows = db.prepare('SELECT * FROM albums ORDER BY featured DESC, created_at DESC').all();
  res.json(rows);
});

router.get('/featured', (req, res) => {
  const r = db.prepare('SELECT * FROM albums WHERE featured=1 ORDER BY created_at DESC LIMIT 1').get();
  res.json(r || null);
});

router.get('/:id', (req, res) => {
  const album = db.prepare('SELECT * FROM albums WHERE id=?').get(req.params.id);
  if (!album) return res.status(404).json({ error: 'not found' });
  album.tracks = db.prepare('SELECT * FROM songs WHERE album_id=? ORDER BY track_order ASC, id ASC').all(req.params.id);
  res.json(album);
});

router.post('/', requireAuth, up.covers.single('cover'), (req, res) => {
  const { title, year, featured, spotify, youtube, apple } = req.body;
  const cover = req.file ? '/uploads/covers/' + req.file.filename : null;
  if (featured == '1' || featured === 'true') db.prepare('UPDATE albums SET featured=0').run();
  const info = db.prepare(`INSERT INTO albums (title, year, cover, featured, spotify, youtube, apple)
    VALUES (?, ?, ?, ?, ?, ?, ?)`).run(title, year || '', cover, featured ? 1 : 0, spotify||'', youtube||'', apple||'');
  res.json({ id: info.lastInsertRowid });
});

router.put('/:id', requireAuth, up.covers.single('cover'), (req, res) => {
  const cur = db.prepare('SELECT * FROM albums WHERE id=?').get(req.params.id);
  if (!cur) return res.status(404).json({ error: 'not found' });
  const cover = req.file ? '/uploads/covers/' + req.file.filename : cur.cover;
  const { title, year, featured, spotify, youtube, apple } = req.body;
  if (featured == '1' || featured === 'true') db.prepare('UPDATE albums SET featured=0').run();
  db.prepare(`UPDATE albums SET title=?, year=?, cover=?, featured=?, spotify=?, youtube=?, apple=? WHERE id=?`)
    .run(title||cur.title, year||cur.year, cover, featured?1:0, spotify||'', youtube||'', apple||'', req.params.id);
  res.json({ ok: true });
});

router.delete('/:id', requireAuth, (req, res) => {
  db.prepare('DELETE FROM albums WHERE id=?').run(req.params.id);
  res.json({ ok: true });
});

module.exports = router;
