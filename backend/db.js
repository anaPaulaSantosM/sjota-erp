const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:9106@localhost:5432/sjota-erp',
});

module.exports = pool;