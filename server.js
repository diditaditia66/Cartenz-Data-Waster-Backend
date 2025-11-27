// server.js
const express = require('express');
const morgan = require('morgan');

const app = express();

// ====== Konfigurasi lewat environment (bisa diubah tanpa ubah kode) ======
const PORT = process.env.PORT || 3000;

// chunk default untuk download (512 KB)
const DEFAULT_CHUNK_BYTES = parseInt(process.env.DEFAULT_CHUNK_BYTES || `${512 * 1024}`, 10);

// batas maksimum chunk download (4 MB)
const MAX_CHUNK_BYTES = parseInt(process.env.MAX_CHUNK_BYTES || `${4 * 1024 * 1024}`, 10);

// batas maksimum upload per request (dalam MB)
const MAX_UPLOAD_MB = parseInt(process.env.MAX_UPLOAD_MB || '10', 10);

// ====== Middleware umum ======
app.use(morgan('combined'));

// Health check sederhana
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', uptime: process.uptime() });
});

// ====== Endpoint DOWNLOAD ======
// Contoh: GET /waste-download?sizeBytes=524288
app.get('/waste-download', (req, res) => {
  let sizeBytes = parseInt(req.query.sizeBytes, 10);

  if (isNaN(sizeBytes) || sizeBytes <= 0) {
    sizeBytes = DEFAULT_CHUNK_BYTES;
  }

  // Batasi supaya tidak kebablasan
  if (sizeBytes > MAX_CHUNK_BYTES) {
    sizeBytes = MAX_CHUNK_BYTES;
  }

  const buffer = Buffer.alloc(sizeBytes); // isi 0, tapi tetap kirim sebanyak sizeBytes

  res.set('Content-Type', 'application/octet-stream');
  res.set('Content-Length', sizeBytes.toString());
  res.send(buffer);
});

// ====== Endpoint UPLOAD ======
// Gunakan express.raw HANYA untuk route upload ini, bukan global, supaya hemat memori
const uploadRawMiddleware = express.raw({
  type: '*/*',                      // terima semua content-type
  limit: `${MAX_UPLOAD_MB}mb`,      // batas upload per request
});

app.post('/waste-upload', uploadRawMiddleware, (req, res) => {
  const size = req.body ? req.body.length : 0;
  console.log(`[UPLOAD] Received ${size} bytes`);

  // Di sini kita tidak simpan ke disk apa pun, hanya buang data dan balas OK
  res.status(200).send('OK');
});

// ====== Start server ======
app.listen(PORT, () => {
  console.log(`Data Waster backend running on port ${PORT}`);
  console.log(`Default download chunk: ${DEFAULT_CHUNK_BYTES} bytes`);
  console.log(`Max download chunk: ${MAX_CHUNK_BYTES} bytes`);
  console.log(`Max upload per request: ${MAX_UPLOAD_MB} MB`);
});
