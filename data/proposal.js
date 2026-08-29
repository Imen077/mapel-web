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
  'Sistem Informasi Kinerja Satker'
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

const BASE_DATE = '2026-07-22';
const BASE_NUMBER = 41;

export const SEED_PROPOSALS = JUDUL_LIST.map((title, i) => {
  const nomor = BASE_NUMBER - i;
  return {
    id: `PO-2026-${String(nomor).padStart(3, '0')}`,
    unit: UNIT_LIST[i % UNIT_LIST.length],
    title,
    jenis: JENIS_LIST[i % JENIS_LIST.length],
    createdBy: NAMA_LIST[i % NAMA_LIST.length],
    createdAt: daysBeforeISO(BASE_DATE, i * 2),
    status: STATUS_SEQUENCE[i % STATUS_SEQUENCE.length]
  };
});

export const proposalService = createSubmissionService({
  statusMeta: PROPOSAL_STATUS_META,
  items: SEED_PROPOSALS
});
