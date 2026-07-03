require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// static: frontend + admin + uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/admin', express.static(path.join(__dirname, '..', 'admin')));
app.use('/', express.static(path.join(__dirname, '..', 'frontend')));

// api
app.use('/api/auth',   require('./routes/auth'));
app.use('/api/albums', require('./routes/albums'));
app.use('/api/songs',  require('./routes/songs'));
app.use('/api/videos', require('./routes/videos'));

app.get('/api/health', (_, res) => res.json({ ok: true }));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`\n🎵 Joe Music rodando em http://localhost:${PORT}`);
  console.log(`   Admin: http://localhost:${PORT}/admin`);
});
