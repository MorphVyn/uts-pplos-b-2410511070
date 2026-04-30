require('dotenv').config();
const mysql = require('mysql2/promise');

async function migrate() {
  const conn = await mysql.createConnection({
    host:     process.env.DB_HOST || 'localhost',
    port:     parseInt(process.env.DB_PORT || '3306'),
    user:     process.env.DB_USER || 'root',
    password: process.env.DB_PASS || '',
  });

  await conn.query(`CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME || 'auth_db'}\``);
  await conn.query(`USE \`${process.env.DB_NAME || 'auth_db'}\``);

  await conn.query(`
    CREATE TABLE IF NOT EXISTS users (
      id             INT AUTO_INCREMENT PRIMARY KEY,
      name           VARCHAR(255) NOT NULL,
      email          VARCHAR(255) NOT NULL UNIQUE,
      password       VARCHAR(255) NOT NULL,
      avatar         VARCHAR(500) DEFAULT NULL,
      google_id      VARCHAR(255) DEFAULT NULL UNIQUE,
      email_verified TINYINT(1)   NOT NULL DEFAULT 0,
      created_at     TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
      updated_at     TIMESTAMP    DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `);

  await conn.query(`
    CREATE TABLE IF NOT EXISTS refresh_tokens (
      id         INT AUTO_INCREMENT PRIMARY KEY,
      user_id    INT          NOT NULL,
      token      VARCHAR(120) NOT NULL UNIQUE,
      expires_at DATETIME     NOT NULL,
      created_at TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      INDEX idx_token      (token),
      INDEX idx_expires_at (expires_at)
    )
  `);

  console.log('✓ Tabel users dan refresh_tokens siap.');
  await conn.end();
}

migrate().catch(err => { console.error(err); process.exit(1); });
