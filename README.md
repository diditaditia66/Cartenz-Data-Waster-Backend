# Cartenz Data Waster – Backend

Backend sederhana berbasis **Node.js + Express** untuk aplikasi **Cartenz Data Waster**.  
Service ini menghasilkan trafik **download** dan **upload** dalam jumlah besar untuk keperluan
stress test koneksi data (VPN / mobile data).

> ⚠️ **Peringatan:** Service ini dapat menghabiskan bandwidth dan kuota dengan sangat cepat.  
> Gunakan hanya di lingkungan uji yang terkontrol (lab / internal), jangan di jaringan produksi publik.

---

## ✨ Fitur

- Endpoint **health check** untuk monitoring.
- Endpoint **waste-download** yang mengirim data random ke client.
- Endpoint **waste-upload** yang menerima data random dari client.
- Ukuran data fleksibel melalui parameter `sizeBytes`.
- Desain minimalis, mudah di-deploy di VPS / container.
- Cocok dipasang di belakang **Nginx + HTTPS (Let’s Encrypt)**.

---

## 🧩 Endpoint API

### `GET /health`

Health check sederhana untuk memastikan backend hidup.

**Contoh response:**

```json
{
  "status": "ok",
  "uptime": 123.456
}

