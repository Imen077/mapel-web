// ============================================================
// MAPEL - data/konsep.js
// Data dummy pengajuan Konsep PL. Dipakai halaman Monitoring &
// Antrian Konsep PL. Strukturnya identik dengan data/proposal.js
// (lihat data/status.js & data/submission-service.js buat logic
// bersama), ditambah 3 field yang cuma dipakai tabel Antrian
// (nomorPengajuan, koreksiKe, employeeId) -- jumlah tiap status
// di data dummy ini sengaja dibuat sama persis dengan contoh
// tampilan yang sudah disepakati: Konsep 6, Menunggu Persetujuan
// 7, Dikirim 3, Koreksi Satker 2, Ditolak Kasatker 0, Proses
// Reviu 7, Final 3, Koreksi Ortala 4, Pengesahan Satker 5,
// Legislasi 3, Indeksasi 0.
// ============================================================

import { SUBMISSION_STATUS, buildStatusMeta } from './status.js';
import { createSubmissionService } from './submission-service.js';

export const KONSEP_STATUS = SUBMISSION_STATUS;

// Override 2 kartu status, KHUSUS Konsep PL (Proposal PL tetap
// pakai buildStatusMeta('Proposal') apa adanya, tidak ikut
// berubah):
// - Pengesahan Satker disembunyikan dari kartu ringkasan/filter --
//   sekarang sudah punya halaman monitoring sendiri (Monitoring
//   Pengesahan PL, lihat data/pengesahan.js), jadi tidak perlu
//   dobel ditampilkan di sini juga.
// - Tidak Disetujui dimunculkan balik (sebelumnya hidden) dengan
//   nama "Dicabut" + warna netral abu-abu, ganti dari merah.
export const KONSEP_STATUS_META = buildStatusMeta('Konsep').map((meta) => {
  if (meta.key === SUBMISSION_STATUS.PENGESAHAN_SATKER) {
    return { ...meta, hidden: true };
  }
  if (meta.key === SUBMISSION_STATUS.TIDAK_DISETUJUI) {
    return { ...meta, label: 'Dicabut', bg: '#EDEAE0', text: '#9AA0AA', blob: '#DCD5C2', hidden: false };
  }
  return meta;
});

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
  'Konsep SIMONEV Kinerja Unit',
  'Konsep Aplikasi Presensi Perwakilan',
  'Konsep Sistem Informasi Pengaduan Terpadu',
  'Konsep Portal Layanan Kepegawaian',
  'Konsep Sistem Arsip Digital Terpadu',
  'Konsep Modul Evaluasi Kinerja ASN',
  'Konsep e-Arsip Kepegawaian Perwakilan',
  'Konsep Aplikasi Reservasi Ruang Rapat',
  'Konsep Dashboard Monitoring Anggaran',
  'Konsep Sistem Antrian Layanan Publik',
  'Konsep Portal Pengaduan Masyarakat',
  'Konsep Aplikasi Manajemen Aset',
  'Konsep Sistem Informasi Perjalanan Dinas',
  'Konsep e-Learning Pengembangan Kompetensi',
  'Konsep Aplikasi Pelaporan Kinerja Triwulan',
  'Konsep Sistem Verifikasi Dokumen Digital',
  'Konsep Portal Data Terbuka BPK',
  'Konsep Aplikasi Survei Kepuasan Layanan',
  'Konsep Sistem Pengelolaan Surat Elektronik',
  'Konsep Dashboard Statistik Pemeriksaan',
  'Konsep Aplikasi Booking Kendaraan Dinas',
  'Konsep Sistem Informasi Tindak Lanjut Rekomendasi',
  'Konsep Portal Perpustakaan Digital',
  'Konsep Aplikasi Cuti dan Izin Pegawai',
  'Konsep Sistem Monitoring Proyek TI',
  'Konsep e-Katalog Perangkat Lunak Internal',
  'Konsep Aplikasi Helpdesk Layanan TI',
  'Konsep Sistem Informasi Kinerja Satker',
  'Konsep Aplikasi Presensi Wajah Pegawai',
  'Konsep Sistem Rekonsiliasi Data Keuangan',
  'Konsep Portal Layanan Konsultasi Hukum',
  'Konsep Aplikasi Pengendalian Dokumen Mutu',
  'Konsep Sistem Informasi Diklat Pegawai',
  'Konsep Dashboard Realisasi Anggaran Satker',
  'Konsep Aplikasi Pengajuan Lembur Pegawai',
  'Konsep Sistem Pengelolaan Perpustakaan Arsip',
  'Konsep Portal Monitoring Tindak Lanjut Audit',
  'Konsep Aplikasi Reservasi Kendaraan Dinas',
  'Konsep Sistem Informasi Pengelolaan BMN',
  'Konsep Dashboard Kinerja Layanan Publik'
];

// Urutan status persis sesuai target jumlah kartu ringkasan:
// Menunggu Persetujuan x7, Dikirim x3, Koreksi Satker x2,
// Ditolak Kasatker x0, Proses Reviu x7, Final x3, Koreksi Ortala
// x4, Pengesahan Satker x5, Legislasi x3, Indeksasi x0 (total 34
// item yang sudah "diajukan" -- muncul di tabel). Disebar
// round-robin (bukan diblok) supaya tiap halaman tabel kelihatan
// variatif, bukan satu status berturut-turut.
function interleaveStatuses(pairs) {
  const pools = pairs.map(([status, count]) => ({ status, remaining: count }));
  const result = [];
  let anyLeft = true;
  while (anyLeft) {
    anyLeft = false;
    for (const pool of pools) {
      if (pool.remaining > 0) {
        result.push(pool.status);
        pool.remaining -= 1;
        anyLeft = true;
      }
    }
  }
  return result;
}

const STATUS_SEQUENCE = interleaveStatuses([
  [SUBMISSION_STATUS.MENUNGGU_PERSETUJUAN, 7],
  [SUBMISSION_STATUS.PROSES_REVIU, 7],
  [SUBMISSION_STATUS.PENGESAHAN_SATKER, 5],
  [SUBMISSION_STATUS.KOREKSI_ORTALA, 4],
  [SUBMISSION_STATUS.DIKIRIM, 3],
  [SUBMISSION_STATUS.FINAL, 3],
  [SUBMISSION_STATUS.LEGISLASI, 3],
  [SUBMISSION_STATUS.KOREKSI_SATKER, 2]
]);

/** Mundur N hari dari tanggal acuan, dikembalikan sebagai ISO date string. */
function daysBeforeISO(baseDate, offsetDays) {
  const d = new Date(baseDate);
  d.setDate(d.getDate() - offsetDays);
  return d.toISOString().slice(0, 10);
}

const MONTH_ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'];

/** Nomor pengajuan resmi (beda dari "id" internal), format birokrasi mis. "032/KL-PL/VII/2026". */
function buildNomorPengajuan(nomor, dateISO) {
  const month = MONTH_ROMAN[new Date(dateISO).getMonth()];
  return `${String(nomor).padStart(3, '0')}/KL-PL/${month}/2026`;
}

/** ID pegawai pembuat, dipasangkan sama nama (item.employeeId + '-' + item.createdBy) di tabel Antrian. */
function buildEmployeeId(nameIndex) {
  return `EMP-${String(nameIndex + 1).padStart(2, '0')}`;
}

// Jumlah koreksi yang pernah dilalui, dipakai badge "Koreksi Ke-"
// di tabel Antrian. Item yang statusnya LAGI di tahap koreksi jelas
// >0; status lain default 0 (belum ada iterasi lain yang dilacak di
// data dummy ini).
function buildKoreksiKe(status) {
  if (status === SUBMISSION_STATUS.KOREKSI_SATKER) return 1;
  if (status === SUBMISSION_STATUS.KOREKSI_ORTALA) return 2;
  return 0;
}

const BASE_DATE = '2026-07-24';
const BASE_NUMBER = 34;

// 34 konsep yang sudah diajukan (tampil di tabel) + 6 konsep yang
// masih draft (tidak tampil di tabel, cuma dihitung di kartu
// ringkasan "Konsep" -- lihat DRAFT_COUNT di bawah).
export const SEED_KONSEP = JUDUL_LIST.slice(0, STATUS_SEQUENCE.length).map((title, i) => {
  const nomor = BASE_NUMBER - i;
  const nameIndex = i % NAMA_LIST.length;
  const createdAt = daysBeforeISO(BASE_DATE, i * 2);
  return {
    id: `KL-2026-${String(nomor).padStart(3, '0')}`,
    unit: UNIT_LIST[i % UNIT_LIST.length],
    title,
    jenis: JENIS_LIST[i % JENIS_LIST.length],
    createdBy: NAMA_LIST[nameIndex],
    employeeId: buildEmployeeId(nameIndex),
    nomorPengajuan: buildNomorPengajuan(nomor, createdAt),
    koreksiKe: buildKoreksiKe(STATUS_SEQUENCE[i]),
    createdAt,
    status: STATUS_SEQUENCE[i]
  };
});

const DRAFT_COUNT = 6;
JUDUL_LIST.slice(STATUS_SEQUENCE.length).forEach((title, i) => {
  if (i >= DRAFT_COUNT) return;
  const nameIndex = i % NAMA_LIST.length;
  SEED_KONSEP.push({
    id: `KL-2026-DRAFT-${String(i + 1).padStart(2, '0')}`,
    unit: UNIT_LIST[i % UNIT_LIST.length],
    title,
    jenis: JENIS_LIST[i % JENIS_LIST.length],
    createdBy: NAMA_LIST[nameIndex],
    employeeId: buildEmployeeId(nameIndex),
    // Draft belum resmi diajukan, jadi belum ada nomor pengajuan
    // ataupun riwayat koreksi -- ditampilkan "-" & 0 di tabel Antrian.
    nomorPengajuan: null,
    koreksiKe: 0,
    createdAt: daysBeforeISO(BASE_DATE, (STATUS_SEQUENCE.length + i) * 2),
    status: SUBMISSION_STATUS.DRAFT
  });
});

export const konsepService = createSubmissionService({
  statusMeta: KONSEP_STATUS_META,
  items: SEED_KONSEP
});