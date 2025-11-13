# Golang Image Service API Specification

Dokumen ini menjelaskan API yang dibutuhkan oleh Golang Image Service untuk menangani penyimpanan gambar portfolio.

## Base URL
```
http://image-service:8090
```
*(Ganti dengan URL sebenarnya sesuai konfigurasi service. Default port: 8090)*

## Endpoints

### 1. Upload Image
**POST** `/api/images/upload`

Upload gambar dan kembalikan URL untuk mengakses gambar tersebut.

#### Request
- **Content-Type**: `multipart/form-data`
- **Body**:
  - `file`: File gambar (required)
    - Format yang didukung: `image/jpeg`, `image/png`, `image/gif`, `image/webp`
    - Maksimal ukuran: 5MB

#### Response Success (201 Created)
```json
{
  "id": "uuid-string",
  "url": "http://image-service:8090/api/images/uuid-string",
  "filename": "original-filename.jpg",
  "size": 123456,
  "mime_type": "image/jpeg",
  "created_at": "2024-01-01T00:00:00Z"
}
```

#### Response Error (400 Bad Request)
```json
{
  "error": "Invalid file type. Only image files are allowed"
}
```

#### Response Error (413 Payload Too Large)
```json
{
  "error": "File size exceeds maximum limit of 5MB"
}
```

#### Response Error (500 Internal Server Error)
```json
{
  "error": "Failed to upload image"
}
```

---

### 2. Get Image
**GET** `/api/images/{id}`

Mengambil gambar berdasarkan ID.

#### Request
- **Path Parameter**:
  - `id`: UUID dari gambar

#### Response Success (200 OK)
- **Content-Type**: Sesuai dengan mime type gambar (image/jpeg, image/png, dll)
- **Body**: Binary data dari gambar

#### Response Error (404 Not Found)
```json
{
  "error": "Image not found"
}
```

---

### 3. Delete Image (Optional)
**DELETE** `/api/images/{id}`

Menghapus gambar berdasarkan ID.

#### Request
- **Path Parameter**:
  - `id`: UUID dari gambar

#### Response Success (200 OK)
```json
{
  "message": "Image deleted successfully"
}
```

#### Response Error (404 Not Found)
```json
{
  "error": "Image not found"
}
```

---

## Error Response Format
Semua error response mengikuti format:
```json
{
  "error": "Error message description"
}
```

## Contoh Implementasi

### Upload Image (JavaScript/TypeScript)
```typescript
const uploadImage = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch('http://image-service:8090/api/images/upload', {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to upload image');
  }

  const data = await response.json();
  return data.url; // Return URL untuk disimpan di database
};
```

### Get Image URL
Setelah upload, URL yang dikembalikan dapat digunakan langsung di tag `<img>`:
```html
<img src="http://image-service:8090/api/images/uuid-string" alt="Project image" />
```

## Catatan Implementasi

1. **Storage**: Service harus menyimpan gambar di folder lokal (misal: `./uploads/`) atau cloud storage
2. **File Naming**: Gunakan UUID untuk nama file agar menghindari konflik
3. **URL Structure**: URL yang dikembalikan harus dapat diakses langsung untuk ditampilkan di browser
4. **CORS**: Jika service terpisah, pastikan CORS dikonfigurasi dengan benar
5. **Error Handling**: Pastikan semua error ditangani dengan baik dan memberikan pesan yang jelas
6. **Validation**: Validasi file type dan size sebelum menyimpan
7. **Cleanup**: Implementasikan cleanup untuk menghapus gambar yang tidak digunakan (optional)

## Environment Variables
Service dapat menggunakan environment variables untuk konfigurasi:
- `PORT`: Port untuk menjalankan service (default: 8090)
- `UPLOAD_DIR`: Directory untuk menyimpan gambar (default: ./uploads)
- `MAX_FILE_SIZE`: Maximum file size in bytes (default: 5242880 = 5MB)
- `ALLOWED_MIME_TYPES`: Comma-separated list of allowed MIME types

