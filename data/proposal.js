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

export const PROPOSAL_STATUS = SUBMISSION_STATUS;
export const PROPOSAL_STATUS_META = buildStatusMeta('Proposal');

const JENIS_LIST = ['Instruksi Kerja', 'Juknis', 'Standar Pelayanan', 'Pedoman', 'POS'];

const UNIT_LIST = [
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

export const proposalService = createSubmissionService({
  statusMeta: PROPOSAL_STATUS_META,
  items: SEED_PROPOSALS
});