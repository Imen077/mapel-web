// ============================================================
// MAPEL - data/proposal.js
// Data dummy pengajuan Proposal PL. Dipakai halaman Monitoring
// & Antrian Proposal PL. Prototype tanpa backend -- akan
// disambungkan ke storage asli begitu js/workflow/proposal.js
// jalan. Lihat data/status.js buat katalog status & data/
// submission-service.js buat logic filter/paginate bersama.
// ============================================================

import { SUBMISSION_STATUS, buildStatusMeta } from './status.js';
import { createSubmissionService } from './submission-service.js';
import { ROLES } from '../js/core/role.js';

export const PROPOSAL_STATUS = SUBMISSION_STATUS;
export const PROPOSAL_STATUS_META = buildStatusMeta('Proposal');

const JENIS_LIST = ['Instruksi Kerja', 'Juknis', 'Standar Pelayanan', 'Pedoman', 'POS'];

export const UNIT_LIST = [
  'Biro Teknologi Informasi',
  'Biro Sumber Daya Manusia',
  'Biro Umum',
  'Biro Organisasi dan Tatalaksana',
  'BPK Perwakilan Provinsi Bali',
  'BPK Perwakilan Provinsi Jambi',
  'BPK Perwakilan Provinsi Jawa Barat',
  'BPK Perwakilan Provinsi Sumatera Utara'
];

const NAMA_LIST = [
  'Agustina Ratna Puspitasari',
  'Mohamad Gofur',
  'Made Wirawan',
  'Siti Nurhaliza',
  'Rian Hidayat',
  'Doni Saputra',
  'Wulan Permatasari',
  'Bagus Prasetyo'
];

const JUDUL_LIST = [
  'SIMONEV Kinerja Unit',
  'Aplikasi Presensi Perwakilan',
  'Sistem Informasi Pengaduan Terpadu',
  'Portal Layanan Kepegawaian',
  'Sistem Arsip Digital Terpadu',
  'Modul Evaluasi Kinerja ASN',
  'e-Arsip Kepegawaian Perwakilan',
  'Aplikasi Reservasi Ruang Rapat',
  'Dashboard Monitoring Anggaran',
  'Sistem Antrian Layanan Publik',
  'Portal Pengaduan Masyarakat',
  'Aplikasi Manajemen Aset',
  'Sistem Informasi Perjalanan Dinas',
  'e-Learning Pengembangan Kompetensi',
  'Aplikasi Pelaporan Kinerja Triwulan',
  'Sistem Verifikasi Dokumen Digital',
  'Portal Data Terbuka BPK',
  'Aplikasi Survei Kepuasan Layanan',
  'Sistem Pengelolaan Surat Elektronik',
  'Dashboard Statistik Pemeriksaan',
  'Aplikasi Booking Kendaraan Dinas',
  'Sistem Informasi Tindak Lanjut Rekomendasi',
  'Portal Perpustakaan Digital',
  'Aplikasi Cuti dan Izin Pegawai',
  'Sistem Monitoring Proyek TI',
  'e-Katalog Perangkat Lunak Internal',
  'Aplikasi Helpdesk Layanan TI',
  'Sistem Informasi Kinerja Satker',
  // 2 judul ekstra (di luar STATUS_SEQUENCE) -- khusus jadi draft/
  // "Konsep", lihat DRAFT_COUNT di bawah.
  'Aplikasi Presensi Wajah Pegawai',
  'Sistem Rekonsiliasi Data Keuangan'
];

// Sebaran status dummy -- dibuat manual (bukan acak polos) biar
// jumlah tiap status di kartu ringkasan kelihatan wajar & konsisten
// tiap kali halaman dibuka (bukan berubah-ubah tiap reload).
const STATUS_SEQUENCE = [
  SUBMISSION_STATUS.PROSES_REVIU,
  SUBMISSION_STATUS.MENUNGGU_PERSETUJUAN,
  SUBMISSION_STATUS.FINAL,
  SUBMISSION_STATUS.FINAL,
  SUBMISSION_STATUS.DITOLAK_KASATKER,
  SUBMISSION_STATUS.KOREKSI_SATKER,
  SUBMISSION_STATUS.DIKIRIM,
  SUBMISSION_STATUS.PROSES_REVIU,
  SUBMISSION_STATUS.KOREKSI_ORTALA,
  SUBMISSION_STATUS.MENUNGGU_PERSETUJUAN,
  SUBMISSION_STATUS.PENGESAHAN_SATKER,
  SUBMISSION_STATUS.LEGISLASI,
  SUBMISSION_STATUS.PROSES_REVIU,
  SUBMISSION_STATUS.DIKIRIM,
  SUBMISSION_STATUS.KOREKSI_ORTALA,
  SUBMISSION_STATUS.MENUNGGU_PERSETUJUAN,
  SUBMISSION_STATUS.FINAL,
  SUBMISSION_STATUS.KOREKSI_SATKER,
  SUBMISSION_STATUS.PENGESAHAN_SATKER,
  SUBMISSION_STATUS.PROSES_REVIU,
  SUBMISSION_STATUS.MENUNGGU_PERSETUJUAN,
  SUBMISSION_STATUS.LEGISLASI,
  SUBMISSION_STATUS.KOREKSI_ORTALA,
  SUBMISSION_STATUS.PROSES_REVIU,
  SUBMISSION_STATUS.PENGESAHAN_SATKER,
  SUBMISSION_STATUS.DITOLAK_KASATKER,
  SUBMISSION_STATUS.MENUNGGU_PERSETUJUAN,
  SUBMISSION_STATUS.FINAL
];

/** Mundur N hari dari tanggal acuan, dikembalikan sebagai ISO date string. */
function daysBeforeISO(baseDate, offsetDays) {
  const d = new Date(baseDate);
  d.setDate(d.getDate() - offsetDays);
  return d.toISOString().slice(0, 10);
}

// ID pegawai pembuat (dummy, cuma buat tampilan), dipasangkan sama
// nama (item.employeeId + '-' + item.createdBy) di kolom "Dibuat
// Oleh" tabel Antrian -- indeksnya harus sinkron sama NAMA_LIST.
const EMPLOYEE_ID_LIST = [
  '240004492',
  'K00000118',
  '240015523',
  '240021847',
  'K00003392',
  '240033215',
  '240040567',
  'K00007741'
];

/** @param {number} nameIndex - index di NAMA_LIST/EMPLOYEE_ID_LIST */
function buildEmployeeId(nameIndex) {
  return EMPLOYEE_ID_LIST[nameIndex] || `EMP-${String(nameIndex + 1).padStart(2, '0')}`;
}

/**
 * Jam dummy yang deterministik (bukan acak tiap reload) buat kolom
 * "Tanggal Dibuat" Antrian, yang butuh presisi jam:menit:detik
 * (beda dari Monitoring yang cukup tanggal doang, lihat
 * formatDateTimeFullID di js/core/format.js).
 * @param {number} i - index item di SEED_PROPOSALS
 */
function buildTimeOfDay(i) {
  const hour = (i * 7 + 8) % 24;
  const minute = (i * 13 + 11) % 60;
  const second = (i * 19 + 29) % 60;
  return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}:${String(second).padStart(2, '0')}`;
}

// Tahap SEBELUM proposal resmi "dikirim" & masuk rantai disposisi --
// item di tahap ini belum punya nomor pengajuan resmi (kolom "Nomor
// Pengajuan" di Antrian dikosongkan). Beda dari Konsep PL yang
// nomorPengajuan-nya keisi lebih awal (lihat data/konsep.js) --
// aturan ini diambil dari contoh desain Antrian Proposal PL yang
// sudah disepakati.
const PRE_SUBMISSION_STATUSES = [
  SUBMISSION_STATUS.DRAFT,
  SUBMISSION_STATUS.MENUNGGU_PERSETUJUAN,
  SUBMISSION_STATUS.KOREKSI_SATKER,
  SUBMISSION_STATUS.DITOLAK_KASATKER
];

const BASE_DATE = '2026-07-22';
const BASE_NUMBER = 41;

export const SEED_PROPOSALS = JUDUL_LIST.slice(0, STATUS_SEQUENCE.length).map((title, i) => {
  const nomor = BASE_NUMBER - i;
  const nameIndex = i % NAMA_LIST.length;
  return {
    id: `PO-2026-${String(nomor).padStart(3, '0')}`,
    unit: UNIT_LIST[i % UNIT_LIST.length],
    title,
    jenis: JENIS_LIST[i % JENIS_LIST.length],
    createdBy: NAMA_LIST[nameIndex],
    employeeId: buildEmployeeId(nameIndex),
    createdAt: `${daysBeforeISO(BASE_DATE, i * 2)}T${buildTimeOfDay(i)}`,
    status: STATUS_SEQUENCE[i]
  };
});

// Satu item tambahan di paling atas (tanggal paling baru), status
// Menunggu Persetujuan -- sengaja ditaruh di sini (bukan di
// STATUS_SEQUENCE) biar gampang dites: selalu jadi baris pertama di
// Monitoring/Antrian Proposal PL, jadi gampang di-klik buat nyoba
// halaman "Review Proposal" (lihat js/pages/review.js).
SEED_PROPOSALS.unshift({
  id: 'PO-2026-042',
  unit: 'Biro Teknologi Informasi',
  title: 'Pendukung Implementasi Sistem Manajemen Keamanan TI (SMKI) Lingkup Data Center',
  jenis: 'Pedoman',
  createdBy: 'Agustina Ratna Puspitasari',
  employeeId: '240004492',
  createdAt: `${BASE_DATE}T08:37:00`,
  status: SUBMISSION_STATUS.MENUNGGU_PERSETUJUAN
});

// JUDUL SAMA PERSIS dengan PO-2026-044 di bawah ("Proposal POS
// Pengujian Website"), tapi status Selesai Reviu -- buat testing
// role Kepala Biro Ortala sebagai FINAL APPROVER (lihat
// FINAL_APPROVER_ROLE di js/core/role.js): REVIU_CHAIN sudah kelar
// dibolak-balik (Previu -> Kasubbag -> Kabag), balik lagi ke Kabiro
// buat keputusan akhir (Setuju/Tolak/Revisi). Klik "Lihat" ngarah ke
// halaman Review Proposal PENUH (js/pages/review.js), sama kayak yang
// dipakai Kepala Satker Biro TI -- lihat resolveRowActionRoute di
// js/pages/monitoring.js (mapping-nya sudah ada dari awal, cuma
// belum ada data dummy yang mengetes kombinasi ini).
//
// SENGAJA ditaruh di sini (bukan lewat unshift() setelah blok
// PO-2026-044) supaya urutannya persis DI BAWAH PO-2026-044 di tabel
// (unshift menaruh elemen baru paling depan array, jadi item yang
// di-unshift belakangan malah muncul lebih dulu -- taruh di sini,
// SEBELUM unshift PO-2026-044 dieksekusi, biar hasil akhirnya PO-2026-044
// tetap di depan, PO-2026-044B pas di bawahnya).
//
// checklistReviu-nya SENGAJA ditempel langsung di sini (sama pola-nya
// kayak PO-2026-045B punya Kepala Bagian Ortala) -- biar begitu tombol
// "Reviu" di halaman Detail Proposal diklik, formnya LANGSUNG kelihatan
// terisi (hasChecklist = true di js/pages/review-proposal.js), TANPA
// harus klik tombol "Tambah Reviu" dulu.
SEED_PROPOSALS.unshift({
  id: 'PO-2026-044B',
  unit: 'Biro Teknologi Informasi',
  title: 'Proposal POS Pengujian Website',
  jenis: 'POS',
  createdBy: 'Agustina Ratna Puspitasari',
  employeeId: '240004492',
  createdAt: '2026-02-27T07:23:47',
  status: SUBMISSION_STATUS.SELESAI_REVIU,
  testOnlyFor: ROLES.KEPALA_BIRO_ORTALA,
  checklistReviu: {
    templateJawabanOptions: [
      'Sudah sesuai dengan ketentuan yang berlaku.',
      'Perlu perbaikan pada bagian substansi dokumen.',
      'Dokumen belum lengkap, mohon dilengkapi.',
      'Perlu penyesuaian redaksional.',
      'Sudah sesuai, dapat dilanjutkan ke tahap berikutnya.'
    ],
    notaDinasFile: '13408019557224317.pdf',
    notaDinasNomor: '7163/ND.X.8/07/2026',
    // Catatan Hasil Reviu dari Previu -- di halaman Reviu Proposal Kepala
    // Biro cuma DITAMPILKAN (read-only), yang bisa diisi Kabiro cuma
    // Kesimpulan & Catatan Koreksi untuk Pereviu.
    catatanHasilReviu:
      'Secara umum kebutuhan penyusunan Proposal POS Pengujian Website sudah sesuai dengan proses bisnis serta tugas dan fungsi BPK. ' +
      'Mohon perhatikan penyesuaian redaksional pada bagian latar belakang sebelum dilanjutkan ke tahap berikutnya.',
    catatanUntukPereviu: [{ catatan: 'cek lagi ya', nama: 'Arny Fitriana Stayawati', tanggal: '2026-08-10T14:29:14' }],
    items: [
      { no: 1, label: 'Kesesuaian kebutuhan PL dengan Proses Bisnis BPK', hasil: 'Sudah sesuai dengan ketentuan yang berlaku.', checked: true },
      {
        no: 2,
        label: 'Kesesuaian kebutuhan PL dengan uraian jabatan (tugas dan wewenang yang harus dilaksanakan)',
        hasil: 'Sudah sesuai dengan ketentuan yang berlaku.',
        checked: false
      },
      { no: 3, label: 'Kesesuaian kebutuhan PL dengan peraturan perundang-undangan', hasil: 'Sudah sesuai dengan ketentuan yang berlaku.', checked: false },
      { no: 4, label: 'Kesesuaian kebutuhan PL dengan tugas dan fungsi BPK', hasil: 'Sudah sesuai dengan ketentuan yang berlaku.', checked: true },
      { no: 5, label: 'Kesesuaian kebutuhan PL dengan obyek pemeriksaan**)', hasil: 'Sudah sesuai dengan ketentuan yang berlaku.', checked: true },
      { section: true, no: 6, label: 'Skala prioritas kebutuhan PL:' },
      { no: 'a', label: 'Sifat pekerjaan', hasil: 'Sudah sesuai dengan ketentuan yang berlaku.', checked: true, indent: true },
      { no: 'b', label: 'Tujuan', hasil: 'Sudah sesuai dengan ketentuan yang berlaku.', checked: true, indent: true },
      { no: 'c', label: 'Lingkup', hasil: 'Sudah sesuai dengan ketentuan yang berlaku.', checked: true, indent: true },
      { no: 'd', label: 'Kebutuhan organisasi', hasil: 'Sudah sesuai dengan ketentuan yang berlaku.', checked: true, indent: true },
      { no: 'e', label: 'Rencana Strategis dan RIR', hasil: 'Sudah sesuai dengan ketentuan yang berlaku.', checked: true, indent: true },
      { no: 'f', label: 'Keterkaitan dengan pemangku kepentingan', hasil: 'Sudah sesuai dengan ketentuan yang berlaku.', checked: true, indent: true },
      {
        no: 7,
        label: 'Keterkaitan dengan perangkat lunak yang sudah ditetapkan di BPK',
        hasil: 'Sudah sesuai dengan ketentuan yang berlaku.',
        checked: false
      },
      {
        no: 8,
        label: 'Substansi yang diatur bersinergi dengan perangkat lunak lain yang telah ditetapkan baik PL internal maupun eksternal',
        hasil: 'Sudah sesuai dengan ketentuan yang berlaku.',
        checked: false
      },
      {
        no: 9,
        label: 'Kesesuaian substansi perangkat lunak dengan bentuk perangkat lunak',
        hasil: 'Sudah sesuai dengan ketentuan yang berlaku.',
        checked: true
      },
      { no: 10, label: 'Latar belakang diperlukannya PL ini', hasil: 'Sudah sesuai dengan ketentuan yang berlaku.', checked: true }
    ]
  }
});

// Satu lagi DI ATAS item PO-2026-042 (unshift menaruhnya paling
// depan) -- status Dikirim (masuk ke kartu "Diterima" di
// KARO_ORTALA_PROPOSAL_CARD_GROUPS, proposal yang baru dikirim/
// diterima ke rantai Ortala), buat testing role Kepala Biro Ortala.
//
// Field-fieldnya (judul, unit, pengusul, tanggal) SENGAJA disamain
// persis sama contoh tampilan halaman Detail Proposal yang dikasih --
// nomorPengajuan-nya juga di-pin manual ke "PO-2026-014" tepat
// setelah loop auto-numbering di bawah, biar nggak ketiban angka
// otomatis (sama pola-nya kayak kasubbagDummy di bawah).
SEED_PROPOSALS.unshift({
  id: 'PO-2026-044',
  unit: 'Biro Teknologi Informasi',
  title: 'Proposal POS Pengujian Website',
  jenis: 'Juknis',
  createdBy: 'Anggit Nendyo Yogantoro',
  employeeId: '240004492',
  createdAt: '2026-02-26T07:23:47',
  status: SUBMISSION_STATUS.DIKIRIM,
  // Cuma boleh kelihatan (tabel & kartu ringkasan) buat role ini --
  // role lain (LO, Kepala Satker, dst) sama sekali nggak lihat item
  // ini, beda dari PO-2026-042 di atas yang emang kelihatan di semua
  // role (lihat visibleToRole di data/submission-service.js).
  testOnlyFor: ROLES.KEPALA_BIRO_ORTALA
});

// Satu lagi DI ATAS PO-2026-044 -- status Proses Reviu (masuk ke
// kartu "Disposisi" di ORTALA_CHAIN_CARD_GROUPS, proposal yang baru
// didisposisikan ke Kepala Bagian Ortala), buat testing role Kepala
// Bagian Ortala. Sama pola-nya kayak PO-2026-044 di atas -- field-
// fieldnya (judul, unit, pengusul, tanggal) disamain persis sama
// contoh tampilan Detail Proposal yang dikasih; nomorPengajuan-nya
// juga di-pin manual ke "PO-2026-014" tepat setelah loop
// auto-numbering di bawah (lihat karoDummy/kasubbagDummy).
SEED_PROPOSALS.unshift({
  id: 'PO-2026-045',
  unit: 'Biro Teknologi Informasi',
  title: 'Proposal POS Pengujian Website',
  jenis: 'POS',
  createdBy: 'Agustina Ratna Puspitasari',
  employeeId: '240004492',
  createdAt: '2026-02-26T07:23:47',
  status: SUBMISSION_STATUS.PROSES_REVIU,
  testOnlyFor: ROLES.KEPALA_BAGIAN_ORTALA
});

// Satu lagi DI ATAS PO-2026-045 -- JUDUL SAMA PERSIS ("Proposal POS
// Pengujian Website") tapi status Selesai Reviu, khusus testing role
// Kepala Bagian Ortala juga (testOnlyFor sama). Dua item ini SENGAJA
// dibedain cuma dari id & status, biar kelihatan gimana tabel
// Monitoring Proposal PL nampilin 2 baris berjudul identik dengan
// status beda ("Disposisi" vs "Selesai Reviu").
//
// checklistReviu-nya SENGAJA ditempel langsung di sini (sama pola-nya
// kayak PO-2026-047 punya Kepala Subbagian Ortala) -- biar begitu
// halaman Reviu Proposal dibuka, formnya LANGSUNG kelihatan terisi
// (hasChecklist = true di js/pages/review-proposal.js), TANPA harus
// klik tombol "Tambah Reviu" dulu (yang cuma muncul kalau checklistnya
// masih kosong).
SEED_PROPOSALS.unshift({
  id: 'PO-2026-045B',
  unit: 'Biro Teknologi Informasi',
  title: 'Proposal POS Pengujian Website',
  jenis: 'POS',
  createdBy: 'Agustina Ratna Puspitasari',
  employeeId: '240004492',
  createdAt: '2026-02-27T07:23:47',
  status: SUBMISSION_STATUS.SELESAI_REVIU,
  testOnlyFor: ROLES.KEPALA_BAGIAN_ORTALA,
  checklistReviu: {
    templateJawabanOptions: [
      'Sudah sesuai dengan ketentuan yang berlaku.',
      'Perlu perbaikan pada bagian substansi dokumen.',
      'Dokumen belum lengkap, mohon dilengkapi.',
      'Perlu penyesuaian redaksional.',
      'Sudah sesuai, dapat dilanjutkan ke tahap berikutnya.'
    ],
    notaDinasFile: '13408019557224317.pdf',
    notaDinasNomor: '7163/ND.X.8/07/2026',
    catatanUntukPereviu: [{ catatan: 'cek lagi ya', nama: 'Arny Fitriana Stayawati', tanggal: '2026-08-10T14:29:14' }],
    items: [
      { no: 1, label: 'Kesesuaian kebutuhan PL dengan Proses Bisnis BPK', hasil: 'Sudah sesuai dengan ketentuan yang berlaku.', checked: true },
      {
        no: 2,
        label: 'Kesesuaian kebutuhan PL dengan uraian jabatan (tugas dan wewenang yang harus dilaksanakan)',
        hasil: 'Sudah sesuai dengan ketentuan yang berlaku.',
        checked: false
      },
      { no: 3, label: 'Kesesuaian kebutuhan PL dengan peraturan perundang-undangan', hasil: 'Sudah sesuai dengan ketentuan yang berlaku.', checked: false },
      { no: 4, label: 'Kesesuaian kebutuhan PL dengan tugas dan fungsi BPK', hasil: 'Sudah sesuai dengan ketentuan yang berlaku.', checked: true },
      { no: 5, label: 'Kesesuaian kebutuhan PL dengan obyek pemeriksaan**)', hasil: 'Sudah sesuai dengan ketentuan yang berlaku.', checked: true },
      { section: true, no: 6, label: 'Skala prioritas kebutuhan PL:' },
      { no: 'a', label: 'Sifat pekerjaan', hasil: 'Sudah sesuai dengan ketentuan yang berlaku.', checked: true, indent: true },
      { no: 'b', label: 'Tujuan', hasil: 'Sudah sesuai dengan ketentuan yang berlaku.', checked: true, indent: true },
      { no: 'c', label: 'Lingkup', hasil: 'Sudah sesuai dengan ketentuan yang berlaku.', checked: true, indent: true },
      { no: 'd', label: 'Kebutuhan organisasi', hasil: 'Sudah sesuai dengan ketentuan yang berlaku.', checked: true, indent: true },
      { no: 'e', label: 'Rencana Strategis dan RIR', hasil: 'Sudah sesuai dengan ketentuan yang berlaku.', checked: true, indent: true },
      { no: 'f', label: 'Keterkaitan dengan pemangku kepentingan', hasil: 'Sudah sesuai dengan ketentuan yang berlaku.', checked: true, indent: true },
      {
        no: 7,
        label: 'Keterkaitan dengan perangkat lunak yang sudah ditetapkan di BPK',
        hasil: 'Sudah sesuai dengan ketentuan yang berlaku.',
        checked: false
      },
      {
        no: 8,
        label: 'Substansi yang diatur bersinergi dengan perangkat lunak lain yang telah ditetapkan baik PL internal maupun eksternal',
        hasil: 'Sudah sesuai dengan ketentuan yang berlaku.',
        checked: false
      },
      {
        no: 9,
        label: 'Kesesuaian substansi perangkat lunak dengan bentuk perangkat lunak',
        hasil: 'Sudah sesuai dengan ketentuan yang berlaku.',
        checked: true
      },
      { no: 10, label: 'Latar belakang diperlukannya PL ini', hasil: 'Sudah sesuai dengan ketentuan yang berlaku.', checked: true }
    ]
  }
});

// Satu lagi DI ATAS PO-2026-045 -- status Selesai Reviu (REVIU_CHAIN
// udah kelar dibolak-balik sampai Previu, balik lagi ke Kepala
// Subbagian Ortala buat lanjut diteruskan), buat testing role Kepala
// Subbagian Ortala. Kasubbag BUKAN final approver (lihat
// FINAL_APPROVER_ROLE di js/core/role.js), jadi klik "Lihat" ngarah
// ke halaman Detail Proposal ringkas (cuma tombol "Disposisi"),
// SAMA POLA-nya kayak PO-2026-044/PO-2026-045 di atas -- bukan
// halaman Review Proposal penuh (Tolak/Revisi/Setuju), soalnya belum
// waktunya dia kasih keputusan final.
//
// Field-fieldnya (judul, unit, jenis, pengusul, tanggal) SENGAJA
// disamain persis sama contoh tampilan yang dikasih (bukan dari
// JUDUL_LIST/NAMA_LIST biasa) -- nomorPengajuan-nya juga di-pin manual
// ke "PO-2026-014" tepat setelah loop auto-numbering di bawah, biar
// nggak ketiban angka otomatis (lihat komentar di dekat
// submittedCounter buat penjelasan loop-nya).
SEED_PROPOSALS.unshift({
  id: 'PO-2026-043',
  unit: 'Biro Teknologi Informasi',
  title: 'Proposal POS Pengujian Website',
  jenis: 'POS',
  createdBy: 'Anggit Nendyo Yogantoro',
  employeeId: '240004492',
  createdAt: '2026-02-26T07:23:47',
  status: SUBMISSION_STATUS.SELESAI_REVIU,
  testOnlyFor: ROLES.KEPALA_SUBBAGIAN_ORTALA,
  // Field khusus buat popup "Disposisi Proposal PL" (lihat
  // buildDisposisiTujuanData di js/pages/disposisi-tujuan.js) --
  // item lain nggak punya field ini, jadi fallback ke rumus generik
  // yang diturunin dari createdAt.
  nomorNotaDinas: '1532/ND/X.5/06/2026',
  // Badge status di tabel (Monitoring & Antrian Proposal PL) SENGAJA
  // ditampilin "Disposisi" khusus buat item dummy ini doang, bukan
  // label asli "Selesai Reviu" -- override per-item, dibaca di
  // renderTableRows (js/pages/monitoring.js & antrian.js), jadi TIDAK
  // ikut ngubah label item lain yang statusnya sama (mis. PO-2026-047
  // di bawah, tetap tampil "Selesai Reviu" apa adanya). Warnanya
  // disamain kayak label "Disposisi" yang sudah dipakai di tempat lain
  // (lihat KEPALA_BAGIAN_STATUS_LABEL_OVERRIDES di monitoring.js).
  tableStatusOverride: { label: 'Disposisi', bg: '#EFE7FA', text: '#6C3FB5' }
});

// Satu lagi DI ATAS PO-2026-043 -- SAMA role+status-nya (Kepala
// Subbagian Ortala, Selesai Reviu), tapi SENGAJA field-nya dikosongin
// (cuma judul & satker yang keisi, sisanya "-") -- buat testing
// tampilan Detail Proposal (js/pages/disposisi.js) versi "kosongan",
// bukan yang udah lengkap kayak PO-2026-043 di atas. Checklist-nya
// SENGAJA ditempel langsung di sini (bukan lewat auto-populate
// generik di review-proposal.js) -- khusus item ini doang yang
// harus langsung kelihatan "Selesai Reviu" pas dibuka, PO-2026-043
// di atas biarin apa adanya (belum ada checklistReviu).
SEED_PROPOSALS.unshift({
  id: 'PO-2026-047',
  unit: 'Biro Teknologi Informasi',
  title: 'Proposal Setelah Reviu',
  jenis: '-',
  createdBy: '-',
  employeeId: '-',
  createdAt: '2026-02-26T07:23:47',
  status: SUBMISSION_STATUS.SELESAI_REVIU,
  testOnlyFor: ROLES.KEPALA_SUBBAGIAN_ORTALA,
  checklistReviu: {
    templateJawabanOptions: [
      'Sudah sesuai dengan ketentuan yang berlaku.',
      'Perlu perbaikan pada bagian substansi dokumen.',
      'Dokumen belum lengkap, mohon dilengkapi.',
      'Perlu penyesuaian redaksional.',
      'Sudah sesuai, dapat dilanjutkan ke tahap berikutnya.'
    ],
    notaDinasFile: '13408019557224317.pdf',
    notaDinasNomor: '7163/ND.X.8/07/2026',
    catatanUntukPereviu: [{ catatan: 'cek lagi ya', nama: 'Arny Fitriana Stayawati', tanggal: '2026-08-10T14:29:14' }],
    items: [
      { no: 1, label: 'Kesesuaian kebutuhan PL dengan Proses Bisnis BPK', hasil: 'Sudah sesuai dengan ketentuan yang berlaku.', checked: true },
      {
        no: 2,
        label: 'Kesesuaian kebutuhan PL dengan uraian jabatan (tugas dan wewenang yang harus dilaksanakan)',
        hasil: 'Sudah sesuai dengan ketentuan yang berlaku.',
        checked: false
      },
      { no: 3, label: 'Kesesuaian kebutuhan PL dengan peraturan perundang-undangan', hasil: 'Sudah sesuai dengan ketentuan yang berlaku.', checked: false },
      { no: 4, label: 'Kesesuaian kebutuhan PL dengan tugas dan fungsi BPK', hasil: 'Sudah sesuai dengan ketentuan yang berlaku.', checked: true },
      { no: 5, label: 'Kesesuaian kebutuhan PL dengan obyek pemeriksaan**)', hasil: 'Sudah sesuai dengan ketentuan yang berlaku.', checked: true },
      { section: true, no: 6, label: 'Skala prioritas kebutuhan PL:' },
      { no: 'a', label: 'Sifat pekerjaan', hasil: 'Sudah sesuai dengan ketentuan yang berlaku.', checked: true, indent: true },
      { no: 'b', label: 'Tujuan', hasil: 'Sudah sesuai dengan ketentuan yang berlaku.', checked: true, indent: true },
      { no: 'c', label: 'Lingkup', hasil: 'Sudah sesuai dengan ketentuan yang berlaku.', checked: true, indent: true },
      { no: 'd', label: 'Kebutuhan organisasi', hasil: 'Sudah sesuai dengan ketentuan yang berlaku.', checked: true, indent: true },
      { no: 'e', label: 'Rencana Strategis dan RIR', hasil: 'Sudah sesuai dengan ketentuan yang berlaku.', checked: true, indent: true },
      { no: 'f', label: 'Keterkaitan dengan pemangku kepentingan', hasil: 'Sudah sesuai dengan ketentuan yang berlaku.', checked: true, indent: true },
      {
        no: 7,
        label: 'Keterkaitan dengan perangkat lunak yang sudah ditetapkan di BPK',
        hasil: 'Sudah sesuai dengan ketentuan yang berlaku.',
        checked: false
      },
      {
        no: 8,
        label: 'Substansi yang diatur bersinergi dengan perangkat lunak lain yang telah ditetapkan baik PL internal maupun eksternal',
        hasil: 'Sudah sesuai dengan ketentuan yang berlaku.',
        checked: false
      },
      {
        no: 9,
        label: 'Kesesuaian substansi perangkat lunak dengan bentuk perangkat lunak',
        hasil: 'Sudah sesuai dengan ketentuan yang berlaku.',
        checked: true
      },
      { no: 10, label: 'Latar belakang diperlukannya PL ini', hasil: 'Sudah sesuai dengan ketentuan yang berlaku.', checked: true }
    ]
  }
});

// Satu lagi DI ATAS PO-2026-043 -- status Proses Reviu (masuk ke
// kartu "Disposisi" di ORTALA_CHAIN_CARD_GROUPS, proposal yang baru
// didisposisikan sampai ke Previu Ortala, tujuan akhir rantai
// disposisi), buat testing role Previu Biro Ortala. Klik "Lihat"
// ngarah ke halaman Detail Proposal yang sama dipakai Kepala Bagian/
// Kepala Subbagian Ortala (js/pages/disposisi.js, cuma tombol
// aksinya jadi "Reviu" bukan "Disposisi" khusus role ini).
//
// Field-fieldnya (judul, unit, pengusul, tanggal) SENGAJA disamain
// persis kayak PO-2026-045 (dummy Kepala Bagian Ortala) -- proposal
// yang sama itu-itu juga yang jalan di sepanjang rantai disposisi
// (Kepala Biro -> Kepala Bagian -> Previu), makanya field & Riwayat
// Disposisinya (DUMMY_RIWAYAT_DISPOSISI['proses-reviu'] di
// disposisi.js, udah berakhir ke "Mochammad Taufik / Pereviu") ikut
// kepakai bareng di sini, sesuai contoh tampilan yang dikasih.
// nomorPengajuan-nya juga di-pin manual ke "PO-2026-014" tepat
// setelah loop auto-numbering di bawah, sama pola-nya kayak
// kasubbagDummy/karoDummy/kabagDummy.
SEED_PROPOSALS.unshift({
  id: 'PO-2026-046',
  unit: 'Biro Teknologi Informasi',
  title: 'Proposal POS Pengujian Website',
  jenis: 'POS',
  createdBy: 'Agustina Ratna Puspitasari',
  employeeId: '240004492',
  createdAt: '2026-02-26T07:23:47',
  status: SUBMISSION_STATUS.PROSES_REVIU,
  testOnlyFor: ROLES.PREVIU_BIRO_ORTALA
});

const DRAFT_COUNT = 2;
JUDUL_LIST.slice(STATUS_SEQUENCE.length).forEach((title, i) => {
  if (i >= DRAFT_COUNT) return;
  const nameIndex = i % NAMA_LIST.length;
  SEED_PROPOSALS.push({
    id: `PO-2026-DRAFT-${String(i + 1).padStart(2, '0')}`,
    unit: UNIT_LIST[i % UNIT_LIST.length],
    title,
    jenis: JENIS_LIST[i % JENIS_LIST.length],
    createdBy: NAMA_LIST[nameIndex],
    employeeId: buildEmployeeId(nameIndex),
    createdAt: `${daysBeforeISO(BASE_DATE, (STATUS_SEQUENCE.length + i) * 2)}T${buildTimeOfDay(STATUS_SEQUENCE.length + i)}`,
    status: SUBMISSION_STATUS.DRAFT
  });
});

// Nomor pengajuan resmi (beda dari "id" internal): SENGAJA dihitung
// terpisah, cuma jalan buat item yang sudah lewat PRE_SUBMISSION_STATUSES
// (lihat definisinya di atas) -- makanya angkanya urut rapat 001, 002,
// 003... tanpa lompat, walau di antara nomor-nomor itu ada baris lain
// yang nomor pengajuannya masih kosong ("-").
let submittedCounter = 0;
SEED_PROPOSALS.forEach((item) => {
  if (PRE_SUBMISSION_STATUSES.includes(item.status)) {
    item.nomorPengajuan = null;
    return;
  }
  submittedCounter += 1;
  item.nomorPengajuan = `PO-2026-${String(submittedCounter).padStart(3, '0')}`;
});

// PO-2026-043 (dummy testing Kepala Subbagian Ortala, lihat di atas)
// nomorPengajuan-nya di-pin manual ke "PO-2026-014" -- SENGAJA nimpa
// hasil auto-numbering barusan, biar sama persis kayak contoh tampilan
// yang dikasih (bukan angka urut sesuai posisinya di SEED_PROPOSALS).
const kasubbagDummy = SEED_PROPOSALS.find((item) => item.id === 'PO-2026-043');
if (kasubbagDummy) kasubbagDummy.nomorPengajuan = 'PO-2026-014';

// PO-2026-044 (dummy testing Kepala Biro Ortala, lihat di atas) --
// sama pola-nya kayak kasubbagDummy di atas, nomorPengajuan-nya
// di-pin manual ke "PO-2026-014" juga (sama persis kayak contoh
// tampilan Detail Proposal yang dikasih) -- kebetulan sama angkanya
// dengan punya PO-2026-043, tapi nggak masalah, dua-duanya beda role
// (testOnlyFor beda) jadi nggak akan pernah kelihatan bareng.
const karoDummy = SEED_PROPOSALS.find((item) => item.id === 'PO-2026-044');
if (karoDummy) karoDummy.nomorPengajuan = 'PO-2026-014';

// PO-2026-044B (dummy baru, judul sama dgn PO-2026-044, status Selesai
// Reviu, testing Kepala Biro Ortala sebagai final approver) -- sama
// pola-nya kayak dummy testing lain, nomorPengajuan-nya di-pin manual
// ke "PO-2026-014" juga biar konsisten (dianggap proposal yang sama
// itu-itu juga yang jalan di sepanjang rantai disposisi & reviu).
const karoDummySelesaiReviu = SEED_PROPOSALS.find((item) => item.id === 'PO-2026-044B');
if (karoDummySelesaiReviu) karoDummySelesaiReviu.nomorPengajuan = 'PO-2026-014';

// PO-2026-045 (dummy testing Kepala Bagian Ortala, lihat di atas) --
// sama pola-nya kayak karoDummy/kasubbagDummy di atas, nomorPengajuan-nya
// di-pin manual ke "PO-2026-014" juga (sama persis kayak contoh
// tampilan Detail Proposal yang dikasih) -- kebetulan sama angkanya
// dengan punya PO-2026-043/PO-2026-044, tapi nggak masalah, ketiganya
// beda role (testOnlyFor beda) jadi nggak akan pernah kelihatan bareng.
const kabagDummy = SEED_PROPOSALS.find((item) => item.id === 'PO-2026-045');
if (kabagDummy) kabagDummy.nomorPengajuan = 'PO-2026-014';

// PO-2026-045B (dummy baru, judul sama dgn PO-2026-045, status Selesai
// Reviu) -- sama pola-nya kayak dummy testing lain, nomorPengajuan-nya
// di-pin manual ke "PO-2026-014" juga biar konsisten (dianggap proposal
// yang sama itu-itu juga yang jalan di sepanjang rantai reviu).
const kabagDummyReviuSelesai = SEED_PROPOSALS.find((item) => item.id === 'PO-2026-045B');
if (kabagDummyReviuSelesai) kabagDummyReviuSelesai.nomorPengajuan = 'PO-2026-014';

// PO-2026-046 (dummy testing Previu Biro Ortala, lihat di atas) --
// sama pola-nya kayak karoDummy/kabagDummy/kasubbagDummy di atas,
// nomorPengajuan-nya di-pin manual ke "PO-2026-014" juga (proposal
// yang sama persis yang jalan di sepanjang rantai disposisi) --
// kebetulan sama angkanya dengan punya PO-2026-043/044/045, tapi
// nggak masalah, keempatnya beda role (testOnlyFor beda) jadi nggak
// akan pernah kelihatan bareng.
const previuDummy = SEED_PROPOSALS.find((item) => item.id === 'PO-2026-046');
if (previuDummy) previuDummy.nomorPengajuan = 'PO-2026-014';

// PO-2026-040 ("Aplikasi Presensi Perwakilan") dihapus dari data
// dummy -- ini baris ke-3 di tabel Monitoring Proposal PL (setelah
// PO-2026-042 & PO-2026-041), sebelumnya juga berstatus "Menunggu
// Persetujuan" kayak PO-2026-042, tapi cukup PO-2026-042 saja yang
// dipakai buat testing alur Review Proposal Kepala Satker Biro TI,
// biar datanya nggak dobel.
const duplicateMenungguIndex = SEED_PROPOSALS.findIndex((item) => item.id === 'PO-2026-040');
if (duplicateMenungguIndex !== -1) SEED_PROPOSALS.splice(duplicateMenungguIndex, 1);

// PO-2026-041 ("SIMONEV Kinerja Unit") dihapus dari data dummy -- ini
// baris ke-3 di tabel Monitoring Proposal PL Kepala Bagian Ortala
// (setelah PO-2026-045 & PO-2026-042), sebelumnya juga berstatus
// "Proses Reviu"/"Disposisi" kayak PO-2026-045 (dummy testing khusus
// role ini), tapi cukup PO-2026-045 saja yang dipakai buat testing
// alur Disposisi Kepala Bagian Ortala, biar datanya nggak dobel --
// sama alasannya kayak penghapusan PO-2026-040 di atas.
const duplicateProsesReviuIndex = SEED_PROPOSALS.findIndex((item) => item.id === 'PO-2026-041');
if (duplicateProsesReviuIndex !== -1) SEED_PROPOSALS.splice(duplicateProsesReviuIndex, 1);

// Dummy buat Monitoring Proposal PL role LO Biro TI, sesuai mockup
// "Detail Konsep PL - LO Biro TI": proposal yang sudah DISETUJUI --
// titik awal LO menekan "Buat Konsep PL" (Konsep PL cuma boleh
// diajukan setelah proposalnya disetujui semua pihak). Klik judulnya
// di tabel buka js/pages/detail-konsep.js (lihat
// resolveRowActionRoute di js/pages/monitoring.js). Dipindah dari
// data/konsep.js (dulu id-nya KL-2026-050).
//
// - id sengaja BUKAN PO-2026-042: id itu sudah dipakai proposal SMKI
//   (dummy testing Kepala Satker Biro TI, lihat atas). nomorPengajuan-
//   nya di-pin manual ke "PO-2026-042" sesuai mockup (pola sama kayak
//   nomorPengajuan yang di-pin di atas: beda dari id internal).
// - Ditaruh PALING AKHIR (setelah loop penomoran otomatis) supaya
//   nomorPengajuan item lain tidak ikut bergeser.
// - Status FINAL = "Disetujui" di tabel (lihat STATUS_LABEL_OVERRIDES di
//   js/pages/monitoring.js), tapi label bawaan proposalService-nya
//   "Final", jadi tableStatusOverride di bawah dipakai biar halaman
//   detail (yang baca item langsung) juga nampilin "Disetujui".
// - nomorNotaDinas dipakai halaman Detail Proposal dan Konsep
//   (js/pages/detail-proposal-konsep.js).
SEED_PROPOSALS.unshift({
  id: 'PO-2026-048',
  unit: 'Biro Teknologi Informasi',
  title: 'Proposal POS Pengujian Website',
  jenis: 'POS',
  createdBy: 'Agustina Ratna Puspitasari',
  employeeId: '240004492',
  nomorPengajuan: 'PO-2026-042',
  nomorNotaDinas: '1532/ND/X.5/06/2026',
  createdAt: '2026-08-05T11:32:40',
  status: SUBMISSION_STATUS.FINAL,
  testOnlyFor: ROLES.LO_BIRO_TI,
  tableStatusOverride: { label: 'Disetujui', bg: '#E1EFE7', text: '#3C7A5C' }
});

// Proposal induk buat KL-2026-040 (data/konsep.js) -- dummy Monitoring
// Konsep PL role Kepala Subbagian Ortala, status "Selesai Reviu".
// id sengaja BUKAN PO-2026-030 (pola sama kayak PO-2026-048 di atas):
// nomorPengajuan-nya di-pin manual ke "PO-2026-030" sesuai contoh
// tampilan "Detail Proposal dan Konsep PL - Kepala SubBagian", testOnlyFor
// biar cuma kelihatan di Monitoring Proposal PL Kepala Subbagian.
SEED_PROPOSALS.unshift({
  id: 'PO-2026-049',
  unit: 'Biro Teknologi Informasi',
  title: 'Proposal POS Pengujian Website',
  jenis: 'IK',
  createdBy: 'Agustina Ratna Puspitasari',
  employeeId: '240004492',
  nomorPengajuan: 'PO-2026-030',
  nomorNotaDinas: '583/ND/BiroTI/2026',
  createdAt: '2026-06-29T10:26:42',
  status: SUBMISSION_STATUS.FINAL,
  testOnlyFor: ROLES.KEPALA_SUBBAGIAN_ORTALA,
  tableStatusOverride: { label: 'Disetujui', bg: '#E1EFE7', text: '#3C7A5C' }
});

export const proposalService = createSubmissionService({
  statusMeta: PROPOSAL_STATUS_META,
  items: SEED_PROPOSALS
});