# Cartenz Data Waster – Backend

Backend sederhana berbasis **Node.js + Express** untuk aplikasi **Cartenz Data Waster**.  
Service ini menghasilkan trafik **download** dan **upload** dalam jumlah besar untuk keperluan
stress test koneksi data (VPN / mobile data).

> ⚠️ **Peringatan:** Service ini dapat menghabiskan bandwidth dan kuota dengan sangat cepat.  
> Gunakan hanya di lingkungan uji yang terkontrol (lab / internal), jangan di jaringan produksi publik.

---

## ✨ Fitur

- Endpoint **`/health`** untuk health check & monitoring.
- Endpoint **`/waste-download`** yang mengirim data random ke client.
- Endpoint **`/waste-upload`** yang menerima data random dari client.
- Ukuran data fleksibel dengan parameter query `sizeBytes`.
- Desain minimalis, mudah di-deploy di VPS / container.
- Cocok dipasang di belakang **Nginx + HTTPS (Let’s Encrypt)**.
- Digunakan sebagai pasangan backend resmi aplikasi **Cartenz Data Waster (Flutter)**.

---

## 🧩 Endpoint API

### 1. `GET /health`

Health check sederhana untuk memastikan backend hidup.

Contoh response:

~~~json
{
  "status": "ok",
  "uptime": 123.456
}
~~~

---

### 2. `GET /waste-download?sizeBytes=524288`

Menghasilkan payload random untuk di-download client.

- **Query parameter:**
  - `sizeBytes` _(opsional)_
    - Default: `524288` (512 KB)
    - Diisi dengan jumlah byte yang ingin diunduh (misal `1048576` = 1 MB).
- **Response:**
  - `Status: 200 OK` (jika sukses)
  - `Content-Type: application/octet-stream`
  - Body berisi random bytes dengan panjang `sizeBytes`.

Contoh penggunaan:

~~~bash
curl -v "http://localhost:3000/waste-download?sizeBytes=1048576" -o /dev/null
~~~

---

### 3. `POST /waste-upload`

Menerima payload dari client dan langsung membuangnya (tidak disimpan di disk).

- **Request body:** data biner apa saja (misalnya random bytes dari `/dev/urandom`).
- **Response:**
  - `Status: 200 OK` jika upload diterima.

Contoh penggunaan:

~~~bash
head -c 524288 /dev/urandom | \
curl -v -X POST http://localhost:3000/waste-upload --data-binary @-
~~~

---

## 🏗️ Arsitektur Singkat

- **Runtime:** Node.js  
- **Framework:** Express  
- **Direkomendasikan dengan:**

  - Nginx sebagai reverse proxy
  - HTTPS via Let’s Encrypt / sertifikat internal

Alur umum:

~~~text
Cartenz Data Waster App (Flutter)
          ↓ HTTPS
   Nginx reverse proxy (443 → 3000)
          ↓ HTTP
Cartenz Data Waster Backend (Node.js + Express)
~~~

Pada sisi Flutter, base URL di-set melalui konstanta:

~~~dart
static const String baseUrl = 'https://waster.anya-vpn.my.id';
~~~

---

## 🧑‍💻 Development Setup

### Prasyarat

- Node.js LTS (misal 18.x / 20.x)
- NPM atau Yarn
- Akses ke VPS / server (opsional, untuk deploy)
- Git (untuk clone repository)

### Menjalankan di lokal

1. Clone repo:

   ~~~bash
   git clone https://github.com/diditaditia66/Cartenz-Data-Waster-Backend.git
   cd Cartenz-Data-Waster-Backend
   ~~~

2. Install dependencies:

   ~~~bash
   npm install
   # atau
   # yarn install
   ~~~

3. Jalankan server:

   ~~~bash
   # jika di package.json ada script "start"
   npm start

   # atau langsung
   node server.js
   ~~~

4. Cek health:

   ~~~bash
   curl http://localhost:3000/health
   ~~~

Jika response berisi `"status": "ok"`, backend sudah berjalan dengan benar.

---

## ⚙️ Konfigurasi

Secara default, backend membaca environment berikut:

- `PORT` – port HTTP untuk listen (default: `3000` jika tidak di-set).

Contoh `.env` (jangan di-commit):

~~~env
PORT=3000
~~~

Kamu bisa memuat `.env` via `dotenv` (jika digunakan) atau set environment langsung di:

- service manager (systemd),
- Docker / container env,
- atau `export` di shell.

---

## 🌐 Contoh Konfigurasi Nginx + HTTPS

Misal:

- Domain: `waster.anya-vpn.my.id`
- Backend Node.js listen di `127.0.0.1:3000`

Contoh blok server Nginx:

~~~nginx
server {
    listen 443 ssl http2;
    server_name waster.anya-vpn.my.id;

    # Sertifikat HTTPS (Let’s Encrypt / internal CA)
    ssl_certificate     /etc/letsencrypt/live/waster.anya-vpn.my.id/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/waster.anya-vpn.my.id/privkey.pem;

    # Proxy ke Node.js backend
    location / {
        proxy_pass         http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header   Upgrade $http_upgrade;
        proxy_set_header   Connection "upgrade";
        proxy_set_header   Host $host;
        proxy_set_header   X-Real-IP $remote_addr;
        proxy_set_header   X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
~~~

Setelah itu:

~~~bash
sudo nginx -t
sudo systemctl reload nginx
~~~

---

## 📁 Struktur Folder

Struktur minimal repo:

~~~text
Cartenz-Data-Waster-Backend/
├─ server.js          # Entry point utama
├─ package.json       # Dependency & script
├─ package-lock.json  # Lockfile NPM
└─ .gitignore         # Mengabaikan node_modules, log, dll.
~~~

---

## 🧪 Catatan Penggunaan

- Backend ini dirancang untuk **stress test**, bukan traffic normal.
- Jangan expose ke publik tanpa proteksi (auth / firewall) jika berada di internet.
- Monitor penggunaan bandwidth di VPS / server untuk menghindari over-usage.
- Cocok dipakai bersama aplikasi Flutter **Cartenz Data Waster** untuk:
  - Uji QoS / shaping,
  - Uji kebijakan kuota,
  - Uji stabilitas VPN / jaringan.

---

## 📄 Lisensi

Proyek backend ini merupakan bagian dari **internal tool Cartenz Data Waster**.  
Penggunaan, distribusi, dan modifikasi di luar organisasi mengikuti kebijakan internal Cartenz.
