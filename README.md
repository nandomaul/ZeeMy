# Jastip di Zeem

Frontend mobile-first untuk katalog dan operasional Jastip di ZeeMy. Versi ini
sengaja memakai data lokal browser agar UI, alur konsumen, dan menu admin bisa
direview penuh sebelum dipindahkan ke Supabase.

## Menjalankan project

Syarat utama: Node.js `>=22.13.0`.

```bash
npm install
npm run dev
```

Build produksi:

```bash
npm run build
npm run deploy
```

Perintah `deploy` akan membuat atau memperbarui branch `gh-pages`. Di GitHub,
pilih **Settings → Pages → Deploy from a branch → gh-pages → /(root)**.

Build static saja tanpa deploy:

```bash
npm run build:pages
```

Hasil static export berada di folder `out/`.

## Mode preview

- **Masuk dengan Google** membuka flow konsumen lokal.
- **Login Admin** membuka dashboard admin lokal.
- Data produk, cart, wishlist, profil, alamat, ongkir, dan pesanan disimpan di
  `localStorage` perangkat yang sedang dipakai.
- Mode **Manage** tersedia untuk produk, pesanan, dan ongkir. Penghapusan data
  meminta konfirmasi Y/N dan PIN preview enam digit: `000000`.
- Tiga profil admin lokal dapat dipilih dan diganti namanya di menu Profil.

## Flow yang sudah hidup

- onboarding bergerak, guideline interaktif, nickname, upload foto profil, dan
  sembilan pilihan avatar pixel;
- katalog, showcase maksimal lima foto, search, filter, sort, rentang harga,
  wishlist, share product, dan cart;
- estimasi barang + fee jastip + pengiriman per wilayah;
- ringkasan pesanan ke WhatsApp `+62 812-2112-1125` dan reset cart;
- status pesanan: menunggu pembayaran, diterima, diproses, pengiriman,
  diterima konsumen, dan dibatalkan;
- membership lima stamp, review satu foto maksimal 1 MB, dan catatan review;
- admin tambah/edit produk, ingat fee terakhir, pin privat, ubah urutan,
  status Ready/Pre Order/Open PO/PO Closed/Sold Out, manage ongkir, dan kelola
  status pesanan;
- nomor konsumen ikut tersimpan dan otomatis masuk ke template WhatsApp;
- label rekomendasi memakai nama salah satu profil admin dan berganti setiap
  12 jam.

## File utama untuk revisi

- `app/JastipApp.tsx` — seluruh flow, state lokal, dan interaksi.
- `app/globals.css` — seluruh visual dan responsive behavior.
- `app/data.ts` — produk awal, nomor WhatsApp, dan default ongkir.
- `app/types.ts` — struktur data yang nanti dipakai saat integrasi Supabase.
- `app/layout.tsx` — metadata share link, title, favicon, dan Open Graph.
- `public/brand/` — logo HD dan sprite avatar pixel.

## Tahap Supabase berikutnya

Struktur lokal yang sekarang bisa dipetakan ke tabel `profiles`, `products`,
`product_images`, `orders`, `order_items`, `reviews`, `shipping_rates`,
`wishlists`, dan `memberships`. Google Auth, Storage, RLS, serta akun admin
allowlist belum diaktifkan pada tahap frontend ini.

Route khusus `/admin` dicatat sebagai tahap routing berikutnya. Pada preview
lokal sekarang, akses admin tetap melalui tombol **Login Admin** agar alur UI
bisa diuji tanpa backend.
