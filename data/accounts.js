// ============================================================
// MAPEL - data/accounts.js
// Data dummy daftar akun untuk halaman Pengaturan (kelola akun).
// Terpisah dari data/users.js (kredensial login demo, "sudah jadi"
// -- tidak diubah) karena kebutuhan tabel ini beda: field
// administratif (NIP, email, kode & nama satker) buat ditampilkan
// & dikelola (tambah/edit/hapus), bukan buat proses login.
// ============================================================

export const SEED_ACCOUNTS = [
  {
    id: 'acc-001',
    nama: 'Sandra Willia Gusman',
    nip: '240003865',
    email: 'sandra.gusman@bpk.go.id',
    role: 'Kepala Satker',
    kdSatker: '104104000000',
    nmSatker: 'Direktorat Pemeriksaan IV.D'
  },
  {
    id: 'acc-002',
    nama: 'Subagyo',
    nip: '060085689',
    email: 'subagyo5689@bpk.go.id',
    role: 'Kepala Satker',
    kdSatker: '104328000000',
    nmSatker: 'BPK Perwakilan Provinsi Papua Tengah'
  },
  {
    id: 'acc-003',
    nama: 'Rulando Rahadiyan Rendragraha',
    nip: '240010189',
    email: 'rulando.r@bpk.go.id',
    role: 'Admin',
    kdSatker: '100205000000',
    nmSatker: 'Biro Teknologi Informasi'
  },
  {
    id: 'acc-004',
    nama: 'Frider Sinaga',
    nip: '060082389',
    email: 'frider.sinaga@bpk.go.id',
    role: 'Kepala Satker',
    kdSatker: '104319000000',
    nmSatker: 'BPK Perwakilan Provinsi Sulawesi Barat'
  },
  {
    id: 'acc-005',
    nama: 'Suparwadi',
    nip: '240002195',
    email: 'suparwadi@bpk.go.id',
    role: 'Kepala Satker',
    kdSatker: '104316000000',
    nmSatker: 'BPK Perwakilan Provinsi Nusa Tenggara Barat'
  }
];

function getAll() {
  return SEED_ACCOUNTS;
}

export const accountService = { getAll };