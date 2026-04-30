# UTS PPLOS — Sistem Pemesanan Tiket Event

| | |
|---|---|
| **Nama** | [Ricky Satria Atmaja] |
| **NIM** | [2410511070] |
| **Kelas** | B |
| **Studi Kasus** | Sistem Pemesanan Tiket Event (digit NIM: 0) |
| **OAuth** | Google OAuth 2.0 (NIM Genap) |# uts-pplos-b-2410511070

---

## Arsitektur

```
Client / Postman
      │
      ▼
┌─────────────────────────┐
│   API Gateway  :8000    │  JWT validation + rate limit 60 req/min/IP
└────┬──────┬──────┬──────┘
     │      │      │
     ▼      ▼      ▼
  :8001   :8002  :8003
  auth    event  ticket
  (Node)  (CI4)  (Node)
     │      │      │
  auth_db event_db ticket_db
```

## Stack

| Service | Port | Framework | DB |
|---|---|---|---|
| gateway | 8000 | Node.js / Express | — |
| auth-service | 8001 | Node.js / Express | auth_db (MySQL) |
| event-service | 8002 | CodeIgniter 4 (PHP) | event_db (MySQL) |
| ticket-service | 8003 | Node.js / Express | ticket_db (MySQL) |

---

## Cara Menjalankan

### Prasyarat
- Node.js 18+, npm
- PHP 8.2+, Composer
- MySQL 8.0

### 1. Auth Service
```bash
cd services/auth-service
npm install
cp .env.example .env        # isi DB_*, JWT_SECRET, GOOGLE_*
# buat database: CREATE DATABASE auth_db;
# import schema:
node src/db/migrate.js
node src/index.js            # berjalan di :8001
```

### 2. Event Service
```bash
cd services/event-service
composer install
cp .env.example .env         # isi database.* dan JWT_SECRET
# buat database: CREATE DATABASE event_db;
php spark migrate
php spark serve --port=8002
```

### 3. Ticket Service
```bash
cd services/ticket-service
npm install
cp .env.example .env         # isi DB_*, JWT_SECRET, EVENT_SERVICE_URL
# buat database: CREATE DATABASE ticket_db;
node src/db/migrate.js
node src/index.js            # berjalan di :8003
```

### 4. Gateway
```bash
cd gateway
npm install
cp .env.example .env         # isi JWT_SECRET dan URL services
node src/index.js            # berjalan di :8000
```

Semua request dari Postman dikirim ke `http://localhost:8000`.

---

## Peta Endpoint (via Gateway :8000)

### Auth
| Method | Path | Auth | Keterangan |
|---|---|---|---|
| POST | /api/auth/register | FALSE | Registrasi |
| POST | /api/auth/login | FALSE | Login → JWT |
| POST | /api/auth/refresh | FALSE | Refresh token |
| POST | /api/auth/logout | TRUE | Invalidasi token |
| GET | /api/auth/me | TRUE | Profil user |
| GET | /api/auth/google | FALSE | Redirect Google |
| GET | /api/auth/google/callback | FALSE | Callback OAuth |

### Event
| Method | Path | Auth | Keterangan |
|---|---|---|---|
| GET | /api/events | TRUE | List event + pagination + filter |
| POST | /api/events | TRUE | Buat event |
| GET | /api/events/:id | TRUE | Detail event |
| PUT | /api/events/:id | TRUE | Update event |
| DELETE | /api/events/:id | TRUE | Hapus event |
| GET | /api/events/:id/categories | TRUE | List kategori tiket |
| POST | /api/events/:id/categories | TRUE | Buat kategori |
| GET | /api/events/:id/categories/:cid | TRUE | Detail kategori |
| PUT | /api/events/:id/categories/:cid | TRUE | Update kategori |
| DELETE | /api/events/:id/categories/:cid | TRUE | Hapus kategori |

### Ticket
| Method | Path | Auth | Keterangan |
|---|---|---|---|
| POST | /api/checkout | TRUE | Beli tiket → e-ticket + QR |
| GET | /api/tickets | TRUE | List tiket milik user |
| GET | /api/tickets/:id | TRUE | Detail tiket + QR |
| POST | /api/tickets/:code/validate | TRUE | Validasi di pintu masuk |

---

## Database Schema

**auth_db:** `users`, `refresh_tokens`  
**event_db:** `events`, `ticket_categories`  
**ticket_db:** `orders`, `tickets`

---

## Setup Google OAuth

1. Buka [Google Cloud Console](https://console.cloud.google.com)
2. APIs & Services → Credentials → Create OAuth 2.0 Client ID
3. Authorized redirect URI: `http://localhost:8000/api/auth/google/callback`
4. Salin Client ID dan Secret ke `.env` auth-service# UTS PPLOS — Sistem Pemesanan Tiket Event

| | |
|---|---|
| **Nama** | [Ricky Satria Atmaja] |
| **NIM** | [2410511070] |
| **Kelas** | B |
| **Studi Kasus** | Sistem Pemesanan Tiket Event (digit NIM: 0) |
| **OAuth** | Google OAuth 2.0 (NIM Genap) |# uts-pplos-b-2410511070