-- 1. Tambah kolom baru tanpa constraint
ALTER TABLE "projects" ADD COLUMN "image_base64" text;

-- 2. Salin data lama ke kolom baru
UPDATE "projects" SET "image_base64" = "image_url" WHERE "image_url" IS NOT NULL;

-- 3. Ubah kolom agar tidak null jika semua baris sudah terisi
ALTER TABLE "projects" ALTER COLUMN "image_base64" SET NOT NULL;

-- 4. Hapus kolom lama
ALTER TABLE "projects" DROP COLUMN "image_url";
