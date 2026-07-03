
const { Pool } = require('pg');
require('dotenv').config();

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL não configurada');
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function init() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS albums (
      id SERIAL PRIMARY KEY,
      title TEXT NOT NULL,
      year TEXT,
      cover TEXT,
      featured INTEGER DEFAULT 0,
      spotify TEXT,
      youtube TEXT,
      apple TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS songs (
      id SERIAL PRIMARY KEY,
      title TEXT NOT NULL,
      album_id INTEGER REFERENCES albums(id) ON DELETE SET NULL,
      is_single INTEGER DEFAULT 0,
      cover TEXT,
      audio TEXT,
      snippet TEXT,
      track_order INTEGER DEFAULT 0,
      lyrics TEXT,
      credits TEXT,
      spotify TEXT,
      youtube TEXT,
      apple TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS videos (
      id SERIAL PRIMARY KEY,
      title TEXT NOT NULL,
      thumb TEXT,
      video_file TEXT,
      youtube_url TEXT,
      preview TEXT,
      playlist TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);
  console.log('PostgreSQL conectado e tabelas verificadas');
}

const ready = init();

function convert(sql) {
  let i = 0;
  return sql.replace(/\?/g, () => '$' + (++i));
}

module.exports = {
  query: async (sql, params=[]) => {
    await ready;
    return pool.query(convert(sql), params);
  },
  prepare(sql) {
    const q = convert(sql);
    return {
      async get(...params) {
        await ready;
        const r = await pool.query(q, params);
        return r.rows[0] || null;
      },
      async all(...params) {
        await ready;
        const r = await pool.query(q, params);
        return r.rows;
      },
      async run(...params) {
        await ready;
        const r = await pool.query(q + ' RETURNING id', params);
        return { lastInsertRowid: r.rows[0]?.id };
      }
    };
  }
};
