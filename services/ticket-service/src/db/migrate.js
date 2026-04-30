require('dotenv').config();
const mysql = require('mysql2/promise');

async function migrate() {
  const conn = await mysql.createConnection({
    host:     process.env.DB_HOST || 'localhost',
    port:     parseInt(process.env.DB_PORT || '3306'),
    user:     process.env.DB_USER || 'root',
    password: process.env.DB_PASS || '',
  });

  await conn.query(`CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME || 'ticket_db'}\``);
  await conn.query(`USE \`${process.env.DB_NAME || 'ticket_db'}\``);

  await conn.query(`
    CREATE TABLE IF NOT EXISTS orders (
      id          INT AUTO_INCREMENT PRIMARY KEY,
      order_code  VARCHAR(60)   NOT NULL UNIQUE,
      user_id     INT           NOT NULL,
      event_id    INT           NOT NULL,
      category_id INT           NOT NULL,
      quantity    INT           NOT NULL DEFAULT 1,
      total_price DECIMAL(12,2) NOT NULL,
      status      ENUM('pending','paid','cancelled') NOT NULL DEFAULT 'paid',
      created_at  TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
      updated_at  TIMESTAMP     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_user_id (user_id)
    )
  `);

  await conn.query(`
    CREATE TABLE IF NOT EXISTS tickets (
      id           INT AUTO_INCREMENT PRIMARY KEY,
      ticket_code  VARCHAR(120) NOT NULL UNIQUE,
      order_id     INT          NOT NULL,
      user_id      INT          NOT NULL,
      event_id     INT          NOT NULL,
      category_id  INT          NOT NULL,
      qr_data      MEDIUMTEXT,
      is_used      TINYINT(1)   NOT NULL DEFAULT 0,
      used_at      DATETIME     DEFAULT NULL,
      created_at   TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
      updated_at   TIMESTAMP    DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
      INDEX idx_ticket_code (ticket_code),
      INDEX idx_user_id     (user_id)
    )
  `);

  console.log('✓ Tabel orders dan tickets siap.');
  await conn.end();
}

migrate().catch(err => { console.error(err); process.exit(1); });
