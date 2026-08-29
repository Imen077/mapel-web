// ============================================================
// MAPEL - data/library.js
// Data dummy katalog perangkat lunak yang SUDAH TERBIT (hasil
// akhir dari flow proposal -> konsep -> pengesahan). Dipakai
// halaman Library (semua role) dan ringkasan Top Download/Top
// View + statistik ringkas di dashboard. Murni data referensi,
// tidak berubah lewat interaksi user, jadi tidak perlu lewat
// storage/seed.
//
// (Sempat kesasar di js/pages/library.js -- dipindah ke sini
// karena ini data, bukan modul render halaman.)
// ============================================================

export const SOFTWARE_LIBRARY = [
  {
    id: 'sw-01',
    name: 'SIMONEV Kinerja Unit',
    unit: 'Biro Teknologi Informasi',
    downloads: 482,
    views: 1204
  },
  {
    id: 'sw-02',
    name: 'Portal Layanan Kepegawaian',
    unit: 'Biro Sumber Daya Manusia',
    downloads: 367,
    views: 846
  },
  {
    id: 'sw-03',
    name: 'Sistem Arsip Digital Terpadu',
    unit: 'Biro Umum',
    downloads: 295,
    views: 703
  },
  {
    id: 'sw-04',
    name: 'Aplikasi Presensi Perwakilan',
    unit: 'BPK Perwakilan Provinsi Bali',
    downloads: 211,
    views: 958
  },
  {
    id: 'sw-05',
    name: 'Kebijakan dan Pedoman Manajemen Risiko TI',
    unit: 'Biro Teknologi Informasi',
    downloads: 178,
    views: 589
  }
];

// Total seluruh perangkat lunak yang pernah diajukan (bukan cuma
// yang sudah terbit di library). Dipakai kartu statistik ringkas
// di dashboard (LO Biro TI, dan role full-dashboard lainnya nanti).
// Angka dummy -- ganti dengan hitungan asli begitu data proposal
// sungguhan (data/proposal.js) sudah diisi.
export const TOTAL_PERANGKAT_LUNAK = 73;

/** @param {number} limit */
function getTopDownloads(limit = 5) {
  return [...SOFTWARE_LIBRARY]
    .sort((a, b) => b.downloads - a.downloads)
    .slice(0, limit);
}

/** @param {number} limit */
function getTopViews(limit = 5) {
  return [...SOFTWARE_LIBRARY]
    .sort((a, b) => b.views - a.views)
    .slice(0, limit);
}

function getTotalCount() {
  return TOTAL_PERANGKAT_LUNAK;
}

export const libraryService = { getTopDownloads, getTopViews, getTotalCount };