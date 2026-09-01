// ============================================================
// MAPEL - pages/monitoring.js
// Render konten halaman Monitoring: kartu ringkasan status +
// filter bar + tabel + pagination. Tipe (Proposal PL / Konsep
// PL) ditentukan dari path saat ini -- keduanya dirender lewat
// satu fungsi generik yang sama karena bentuk datanya identik
// (lihat data/status.js & data/submission-service.js), cukup
// beda judul & sumber data-nya saja.
// ============================================================

import { router } from '../core/router.js';
import { ROLES } from '../core/role.js';
import { proposalService, PROPOSAL_STATUS_META } from '../../data/proposal.js';
import { konsepService, KONSEP_STATUS_META } from '../../data/konsep.js';
import { SUBMISSION_STATUS } from '../../data/status.js';
import { formatDateLongID } from '../core/format.js';

const PAGE_SIZE = 7;

const SEARCH_ICON = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><circle cx="11" cy="11" r="7" stroke="currentColor" stroke-width="1.8"/><path d="m20 20-3.5-3.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>';
const CHEVRON_ICON = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="m6 9 6 6 6-6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const ARROW_LEFT_ICON = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="m14.5 5-7 7 7 7" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const ARROW_RIGHT_ICON = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="m9.5 5 7 7-7 7" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const AKSI_ICON = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M4 6h16M4 12h16M4 18h10" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>';
const PLUS_ICON = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>';

// Proyeksi label+warna badge tabel Monitoring Proposal PL & Konsep PL
// -- status mentah yang sudah "digabung" secara tampilan di
// PROPOSAL_CARD_GROUPS (final/pengesahan-satker/legislasi/indeksasi
// -> "Disetujui", koreksi-ortala -> "Proses Reviu") juga perlu
// tampil dengan label gabungan yang sama di badge status tabel,
// bukan label aslinya per status -- dipakai bareng di kedua halaman
// karena status mentahnya memang sama persis (lihat buildStatusMeta
// di data/status.js). Status yang tidak disebut di sini tetap pakai
// label/warna asli dari statusMeta (lihat renderTableRows).
const STATUS_LABEL_OVERRIDES = {
  [SUBMISSION_STATUS.FINAL]: { label: 'Disetujui', bg: '#E1EFE7', text: '#3C7A5C' },
  [SUBMISSION_STATUS.PENGESAHAN_SATKER]: { label: 'Disetujui', bg: '#E1EFE7', text: '#3C7A5C' },
  [SUBMISSION_STATUS.LEGISLASI]: { label: 'Disetujui', bg: '#E1EFE7', text: '#3C7A5C' },
  [SUBMISSION_STATUS.INDEKSASI]: { label: 'Disetujui', bg: '#E1EFE7', text: '#3C7A5C' },
  [SUBMISSION_STATUS.KOREKSI_ORTALA]: { label: 'Proses Reviu', bg: '#EFE7FA', text: '#6C3FB5' },
  [SUBMISSION_STATUS.TIDAK_DISETUJUI]: { label: 'Tidak Disetujui', bg: '#F8DCD6', text: '#A93226' }
};

// Kartu ringkasan khusus Monitoring Proposal PL -- beda dari Konsep
// PL (yang masih pakai 11 kartu 1:1 per status, lihat PROPOSAL_STATUS_META
// di bawah). Beberapa status digabung jadi satu kartu:
// - "Proses Reviu" = PROSES_REVIU + KOREKSI_ORTALA (masih bolak-balik direviu)
// - "Disetujui" = FINAL + PENGESAHAN_SATKER + LEGISLASI + INDEKSASI
//   (semua tahap SETELAH disahkan Kepala Biro Ortala di ujung rantai reviu)
// - "Tidak Disetujui" = TIDAK_DISETUJUI (ditolak final oleh Kepala Biro
//   Ortala di ujung rantai reviu -- beda dari "Ditolak Kasatker" yang
//   gugur di awal, sebelum sempat masuk rantai reviu Ortala)
const PROPOSAL_CARD_GROUPS = [
  { label: 'Konsep', statuses: [SUBMISSION_STATUS.DRAFT], text: '#2B935B', blob: '#E7E9EC' },
  { label: 'Menunggu Persetujuan', statuses: [SUBMISSION_STATUS.MENUNGGU_PERSETUJUAN], text: '#12664D', blob: '#DCF3E7' },
  { label: 'Dikirim', statuses: [SUBMISSION_STATUS.DIKIRIM], text: '#A1721C', blob: '#FBEED0' },
  { label: 'Koreksi Satker', statuses: [SUBMISSION_STATUS.KOREKSI_SATKER], text: '#C15343', blob: '#FBDAD5' },
  { label: 'Ditolak Kasatker', statuses: [SUBMISSION_STATUS.DITOLAK_KASATKER], text: '#9F7327', blob: '#F7E7C4' },
  { label: 'Proses Reviu', statuses: [SUBMISSION_STATUS.PROSES_REVIU, SUBMISSION_STATUS.KOREKSI_ORTALA], text: '#BD5444', blob: '#FBDAD5' },
  {
    label: 'Disetujui',
    statuses: [
      SUBMISSION_STATUS.FINAL,
      SUBMISSION_STATUS.PENGESAHAN_SATKER,
      SUBMISSION_STATUS.LEGISLASI,
      SUBMISSION_STATUS.INDEKSASI
    ],
    text: '#888A92',
    blob: '#EDEEF0'
  },
  { label: 'Tidak Disetujui', statuses: [SUBMISSION_STATUS.TIDAK_DISETUJUI], text: '#C0392B', blob: '#DCF3E7' }
];

// Kartu ringkasan Monitoring Proposal PL versi rantai Ortala (Kepala
// Biro Ortala, Kepala Bagian, dst) -- beda dari punya LO Biro TI:
// - Dipecah per tahap disposisi/reviu ("Disposisi" = PROSES_REVIU
//   yaitu lagi jalan MAJU di DISPOSISI_CHAIN, "Direviu" = KOREKSI_ORTALA
//   yaitu lagi jalan BALIK di REVIU_CHAIN -- dua ini digabung jadi satu
//   kartu "Proses Reviu" di punya LO, di sini dipisah)
// - "Selesai Reviu" = status baru SELESAI_REVIU, REVIU_CHAIN sudah
//   kelar dibolak-balik, tinggal nunggu keputusan akhir Kabiro Ortala
// - "Koreksi" = KOREKSI_SATKER (namanya dipendekin, sama isinya
//   dengan "Koreksi Satker" di punya LO)
// - "Disetujui"/"Tidak Disetujui" sama persis dengan punya LO
// Warna dasarnya diambil dari palet asli per-status di buildStatusMeta
// (data/status.js) supaya konsisten sama badge status di tabel &
// warna yang sudah dipakai sebelumnya, bukan bikin palet baru.
const ORTALA_CHAIN_CARD_GROUPS = [
  { label: 'Disposisi', statuses: [SUBMISSION_STATUS.PROSES_REVIU], text: '#6C3FB5', blob: '#D9C6F2' },
  { label: 'Direviu', statuses: [SUBMISSION_STATUS.DIREVIU], text: '#2C7DA0', blob: '#BEE0EE' },
  { label: 'Selesai Reviu', statuses: [SUBMISSION_STATUS.SELESAI_REVIU], text: '#0F7A6B', blob: '#B8E4DC' },
  { label: 'Koreksi', statuses: [SUBMISSION_STATUS.KOREKSI_SATKER], text: '#B5601E', blob: '#F5C89B' },
  {
    label: 'Disetujui',
    statuses: [
      SUBMISSION_STATUS.FINAL,
      SUBMISSION_STATUS.PENGESAHAN_SATKER,
      SUBMISSION_STATUS.LEGISLASI,
      SUBMISSION_STATUS.INDEKSASI
    ],
    text: '#888A92',
    blob: '#EDEEF0'
  },
  { label: 'Tidak Disetujui', statuses: [SUBMISSION_STATUS.TIDAK_DISETUJUI], text: '#C0392B', blob: '#DCF3E7' }
];

// Kepala Biro Ortala ada di ujung DEPAN rantai Ortala (langsung
// sesudah Kepala Satker Biro TI), jadi dia masih lihat kartu
// "Diterima" (proposal yang baru dikirim/DIKIRIM ke rantai Ortala) --
// role Ortala di bawahnya (Kabag, Kasubbag, Previu) enggak perlu
// tahu soal ini, buat mereka rantainya baru mulai kelihatan dari
// "Disposisi".
const KARO_ORTALA_PROPOSAL_CARD_GROUPS = [
  { label: 'Diterima', statuses: [SUBMISSION_STATUS.DIKIRIM], text: '#2B5C89', blob: '#C2D8F0' },
  ...ORTALA_CHAIN_CARD_GROUPS
];

// Kartu ringkasan Monitoring KONSEP PL versi Kepala Biro Ortala --
// beda dari punya Proposal PL: di sini Final/Koreksi Ortala/
// Pengesahan Satker/Legislasi/Indeksasi TETAP dipisah per kartu
// (nggak digabung jadi satu kartu "Disetujui"), dan nggak ada kartu
// "Tidak Disetujui" sama sekali. Cuma dummy sesuai desain yang
// dikasih, warnanya diambil dari palet asli per-status di
// buildStatusMeta (data/status.js) biar konsisten.
const KONSEP_ORTALA_CHAIN_CARD_GROUPS = [
  { label: 'Disposisi', statuses: [SUBMISSION_STATUS.PROSES_REVIU], text: '#6C3FB5', blob: '#D9C6F2' },
  { label: 'Direviu', statuses: [SUBMISSION_STATUS.DIREVIU], text: '#2C7DA0', blob: '#BEE0EE' },
  { label: 'Selesai Reviu', statuses: [SUBMISSION_STATUS.SELESAI_REVIU], text: '#0F7A6B', blob: '#B8E4DC' },
  { label: 'Koreksi', statuses: [SUBMISSION_STATUS.KOREKSI_SATKER], text: '#B5601E', blob: '#F5C89B' },
  { label: 'Final', statuses: [SUBMISSION_STATUS.FINAL], text: '#3C7A5C', blob: '#B9DDC7' },
  { label: 'Koreksi dari Ortala', statuses: [SUBMISSION_STATUS.KOREKSI_ORTALA], text: '#B03A6E', blob: '#F5B8D3' },
  { label: 'Pengesahan Satker', statuses: [SUBMISSION_STATUS.PENGESAHAN_SATKER], text: '#3B4F9E', blob: '#C2CCF0' },
  { label: 'Legislasi', statuses: [SUBMISSION_STATUS.LEGISLASI], text: '#7A3FA0', blob: '#DFC0EF' },
  { label: 'Indeksasi', statuses: [SUBMISSION_STATUS.INDEKSASI], text: '#1F8A63', blob: '#A9E8C7' }
];

// Kepala Biro Ortala ada di paling depan rantai Ortala buat Konsep
// PL juga (sama seperti di Proposal PL), jadi masih lihat kartu
// "Diterima" -- role di bawahnya (Kabag/Kasubbag/Previu) enggak.
const KARO_ORTALA_KONSEP_CARD_GROUPS = [
  { label: 'Diterima', statuses: [SUBMISSION_STATUS.DIKIRIM], text: '#2B5C89', blob: '#C2D8F0' },
  ...KONSEP_ORTALA_CHAIN_CARD_GROUPS
];

// Sama polanya kayak KONSEP_ORTALA_CHAIN_CARD_GROUPS, khusus buat
// Monitoring PENGESAHAN PL: kartu "Pengesahan Satker" dibuang
// (halaman ini sendiri representasi pengesahan, jadi kartu itu
// jadi berlebihan/menyesatkan), diganti "Dicabut" di ujung (sesuai
// referensi foto).
const PENGESAHAN_ORTALA_CARD_GROUPS = [
  ...KONSEP_ORTALA_CHAIN_CARD_GROUPS.filter((group) => group.label !== 'Pengesahan Satker'),
  { label: 'Dicabut', statuses: [SUBMISSION_STATUS.TIDAK_DISETUJUI], text: '#9AA0AA', blob: '#DCD5C2' }
];

const KARO_PENGESAHAN_CARD_GROUPS = [
  { label: 'Diterima', statuses: [SUBMISSION_STATUS.DIKIRIM], text: '#2B5C89', blob: '#C2D8F0' },
  ...PENGESAHAN_ORTALA_CARD_GROUPS
];

// Konfigurasi per tipe monitoring -- cukup tambah entri baru di
// sini kalau nanti ada varian lain, tidak perlu ubah logic render.
const MONITORING_CONFIG = {
  'proposal-pl': {
    service: proposalService,
    statusMeta: PROPOSAL_STATUS_META,
    cardGroups: PROPOSAL_CARD_GROUPS,
    // Role-role rantai Ortala lihat kartu ringkasan yang beda dari LO
    // Biro TI (lihat komentar di ORTALA_CHAIN_CARD_GROUPS di atas).
    // Role yang tidak disebut di sini (LO Biro TI, Kepala Satker Biro
    // TI) tetap pakai `cardGroups` default di atas.
    cardGroupsByRole: {
      [ROLES.KEPALA_BIRO_ORTALA]: KARO_ORTALA_PROPOSAL_CARD_GROUPS,
      [ROLES.KEPALA_BAGIAN_ORTALA]: ORTALA_CHAIN_CARD_GROUPS,
      // Sama persis kartunya dengan Kepala Bagian Ortala (6 kartu,
      // tanpa "Diterima") -- desain yang dikasih emang identik.
      [ROLES.KEPALA_SUBBAGIAN_ORTALA]: ORTALA_CHAIN_CARD_GROUPS,
      [ROLES.PREVIU_BIRO_ORTALA]: ORTALA_CHAIN_CARD_GROUPS
    },
    statusLabelOverrides: STATUS_LABEL_OVERRIDES,
    // Toggle "Assign to Me"/"Belum ada Konsep PL" berguna buat semua
    // role yang bisa buka halaman ini (LO maupun reviewer Ortala),
    // tapi tombol "Buat Proposal Baru" cuma relevan buat LO Biro TI
    // yang mengajukan -- dua-duanya dicek terpisah di initMonitoringTable.
    showFilterToggles: true,
    loBiroTiControls: true,
    createRoute: '/pages/lo-biro-ti/pengajuan/proposal-pl.html',
    createLabel: 'Buat Proposal Baru',
    // Tabelnya dibikin lebih rapat/kecil, dipola sama seperti tabel
    // Antrian Konsep PL (lihat .data-table-card--compact di
    // css/pages/antrian.css -- classnya sengaja ditaruh di file itu
    // karena dulu pertama kali dibikin buat Antrian, sekarang dipakai
    // bareng di sini juga).
    compactTable: true,
    title: 'Monitoring Proposal Perangkat Lunak',
    subtitle: 'Pantau progres seluruh proposal yang telah diajukan, mulai dari pengajuan hingga persetujuan akhir.',
    searchPlaceholder: 'Cari proposal ...',
    titleColumnLabel: 'Judul Proposal'
  },
  'konsep-pl': {
    service: konsepService,
    statusMeta: KONSEP_STATUS_META,
    // Cuma Kepala Biro Ortala yang lihat kartu ringkasan beda (lihat
    // KARO_ORTALA_KONSEP_CARD_GROUPS di atas) -- role lain (LO,
    // Kepala Satker, dan role Ortala di bawah Kabiro) belum dikasih
    // desain kartu khusus, jadi tetap pakai 11 kartu default
    // (statusMeta) apa adanya.
    cardGroupsByRole: {
      [ROLES.KEPALA_BIRO_ORTALA]: KARO_ORTALA_KONSEP_CARD_GROUPS,
      // 9 kartu, sama kayak Kabiro tapi tanpa "Diterima" -- lihat
      // KONSEP_ORTALA_CHAIN_CARD_GROUPS di atas. Berlaku juga buat
      // Previu Biro Ortala (rantai Ortala yang sama, di bawah Kabiro).
      [ROLES.KEPALA_BAGIAN_ORTALA]: KONSEP_ORTALA_CHAIN_CARD_GROUPS,
      [ROLES.KEPALA_SUBBAGIAN_ORTALA]: KONSEP_ORTALA_CHAIN_CARD_GROUPS,
      [ROLES.PREVIU_BIRO_ORTALA]: KONSEP_ORTALA_CHAIN_CARD_GROUPS
    },
    // Sama seperti di Monitoring Proposal PL: status Final/Pengesahan
    // Satker/Legislasi/Indeksasi tetap tampil sebagai badge "Disetujui"
    // di tabel (bukan label aslinya masing-masing), dan Koreksi Ortala
    // tampil sebagai "Proses Reviu" -- statusnya sama persis dengan
    // Proposal PL jadi override-nya dipakai bareng.
    statusLabelOverrides: STATUS_LABEL_OVERRIDES,
    // Disamain sama Monitoring Proposal PL biar tabelnya nggak
    // "gede" (judul konsep gak pecah jadi 3 baris) -- lihat komentar
    // compactTable di config 'proposal-pl' di atas.
    compactTable: true,
    title: 'Monitoring Konsep Perangkat Lunak',
    subtitle: 'Pantau progres seluruh konsep perangkat lunak yang telah diajukan, mulai dari konsep hingga persetujuan akhir.',
    searchPlaceholder: 'Cari konsep ...',
    titleColumnLabel: 'Judul Konsep'
  },
  'pengesahan-pl': {
    service: konsepService,
    statusMeta: KONSEP_STATUS_META,
    // Sama pola-nya kayak 'konsep-pl' di atas: cuma role rantai
    // Ortala yang lihat kartu ringkasan khusus (lihat
    // KARO_PENGESAHAN_CARD_GROUPS/PENGESAHAN_ORTALA_CARD_GROUPS),
    // role lain (LO, Kepala Satker) tetap pakai 11 kartu default.
    cardGroupsByRole: {
      [ROLES.KEPALA_BIRO_ORTALA]: KARO_PENGESAHAN_CARD_GROUPS,
      [ROLES.KEPALA_BAGIAN_ORTALA]: PENGESAHAN_ORTALA_CARD_GROUPS,
      [ROLES.KEPALA_SUBBAGIAN_ORTALA]: PENGESAHAN_ORTALA_CARD_GROUPS,
      [ROLES.PREVIU_BIRO_ORTALA]: PENGESAHAN_ORTALA_CARD_GROUPS
    },
    statusLabelOverrides: STATUS_LABEL_OVERRIDES,
    compactTable: true,
    title: 'Monitoring Pengesahan Perangkat Lunak',
    subtitle: 'Pantau progres akhir konsep perangkat lunak yang sudah disetujui hingga resmi diterbitkan.',
    searchPlaceholder: 'Cari pengesahan ...',
    titleColumnLabel: 'Judul Konsep'
  }
};

/** Ambil 'proposal-pl' | 'konsep-pl' dari path saat ini. */
function getMonitoringType(pathname) {
  const file = pathname.split('/').pop() || '';
  return file.replace('.html', '');
}

function renderStatCards(statusMeta, counts) {
  const cards = statusMeta
    .filter((meta) => !meta.hidden)
    .map(
      (meta) => `
        <div class="stat-tile">
          <span class="stat-tile__blob" style="--blob-color:${meta.blob}" aria-hidden="true"></span>
          <span class="stat-tile__value" style="color:${meta.text}">${counts[meta.key] ?? 0}</span>
          <span class="stat-tile__label">${meta.label}</span>
        </div>
      `
    )
    .join('');

  return `<div class="stat-tile-grid">${cards}</div>`;
}

/**
 * Varian kartu ringkasan yang jumlahnya dihitung dari GABUNGAN
 * beberapa status sekaligus (lihat PROPOSAL_CARD_GROUPS), dipakai
 * khusus Monitoring Proposal PL. Beda dari renderStatCards() yang
 * strict 1 kartu = 1 status.
 * @param {{label:string, statuses:string[], text:string, blob:string}[]} cardGroups
 * @param {Record<string, number>} counts
 */
function renderStatCardsGrouped(cardGroups, counts) {
  const cards = cardGroups
    .map((group) => {
      const total = group.statuses.reduce((sum, key) => sum + (counts[key] ?? 0), 0);
      return `
        <div class="stat-tile">
          <span class="stat-tile__blob" style="--blob-color:${group.blob}" aria-hidden="true"></span>
          <span class="stat-tile__value" style="color:${group.text}">${total}</span>
          <span class="stat-tile__label">${group.label}</span>
        </div>
      `;
    })
    .join('');

  return `<div class="stat-tile-grid">${cards}</div>`;
}

function renderFilterBar({
  statusMeta,
  years,
  selectedYear,
  search,
  selectedStatus,
  searchPlaceholder,
  showToggles,
  showCreateButton,
  belumAdaKonsep,
  assignToMe,
  createLabel
}) {
  const yearOptions = years
    .map((y) => `<option value="${y}"${String(y) === String(selectedYear) ? ' selected' : ''}>${y}</option>`)
    .join('');

  const statusOptions = statusMeta
    .filter((meta) => meta.key !== 'draft' && !meta.hidden)
    .map(
      (meta) =>
        `<option value="${meta.key}"${meta.key === selectedStatus ? ' selected' : ''}>${meta.label}</option>`
    )
    .join('');

  // Toggle "Belum ada Konsep PL" & tombol "Buat Proposal Baru" cuma
  // buat LO Biro TI (lihat loBiroTiControls di MONITORING_CONFIG +
  // pengecekan role di initMonitoringTable). "Belum ada Konsep PL"
  // untuk sekarang BARU UI-nya saja -- logic filternya nyusul begitu
  // ada relasi proposal<->konsep di data (lihat TODO di bindEvents).
  const loControls = (showToggles || showCreateButton)
    ? `
      ${
        showToggles
          ? `
      <div class="filter-bar__toggles">
        <label class="toggle">
          <input type="checkbox" class="toggle__input" id="filter-belum-konsep" ${belumAdaKonsep ? 'checked' : ''}>
          <span class="toggle__track"><span class="toggle__thumb"></span></span>
          <span class="toggle__label">Belum ada Konsep PL</span>
        </label>
        <label class="toggle">
          <input type="checkbox" class="toggle__input" id="filter-assign-me" ${assignToMe ? 'checked' : ''}>
          <span class="toggle__track"><span class="toggle__thumb"></span></span>
          <span class="toggle__label">Assign to Me</span>
        </label>
      </div>`
          : ''
      }
      <span class="filter-bar__spacer"></span>
      ${showCreateButton ? `<button class="btn btn-dark" type="button" id="btn-create-proposal">${PLUS_ICON}${createLabel}</button>` : ''}
    `
    : '';

  return `
    <div class="filter-bar">
      <div class="filter-bar__select-wrap">
        <select class="filter-bar__select" id="filter-year" aria-label="Filter tahun">
          <option value=""${selectedYear ? '' : ' selected'}>Semua Tahun</option>
          ${yearOptions}
        </select>
        <span class="filter-bar__select-chevron">${CHEVRON_ICON}</span>
      </div>

      <div class="filter-bar__search">
        ${SEARCH_ICON}
        <input type="text" id="filter-search" placeholder="${searchPlaceholder}" value="${search}" autocomplete="off">
      </div>

      <div class="filter-bar__select-wrap filter-bar__select-wrap--status">
        <select class="filter-bar__select" id="filter-status" aria-label="Filter status">
          <option value=""${selectedStatus ? '' : ' selected'}>--- Semua Status ---</option>
          ${statusOptions}
        </select>
        <span class="filter-bar__select-chevron">${CHEVRON_ICON}</span>
      </div>

      ${loControls}
    </div>
  `;
}

function renderTableRows(service, rows, startIndex, labelOverrides) {
  if (!rows.length) {
    return `
      <tr>
        <td class="data-table__empty" colspan="8">Tidak ada data yang cocok dengan filter ini.</td>
      </tr>
    `;
  }

  return rows
    .map((item, i) => {
      const baseMeta = service.getStatusMeta(item.status);
      const meta = { ...baseMeta, ...(labelOverrides?.[item.status] || {}) };
      return `
        <tr>
          <td>${startIndex + i + 1}.</td>
          <td>${item.unit}</td>
          <td>
            <span class="data-table__title">${item.title}</span>
            <span class="data-table__code">${item.id}</span>
          </td>
          <td>${item.jenis}</td>
          <td>${item.createdBy}</td>
          <td>${formatDateLongID(item.createdAt)}</td>
          <td>
            <span class="badge badge--tint" style="--tint-bg:${meta.bg};--tint-text:${meta.text}">${meta.label}</span>
          </td>
          <td>
            <button class="data-table__aksi" type="button" title="Lihat detail (segera hadir)">${AKSI_ICON}</button>
          </td>
        </tr>
      `;
    })
    .join('');
}

function renderPagination(page, totalPages) {
  if (totalPages <= 1) return '';

  // Bangun daftar nomor halaman dengan elipsis kalau kepanjangan:
  // selalu tampilkan halaman pertama, sekitar halaman aktif, dan
  // halaman terakhir.
  const pages = new Set([1, totalPages, page, page - 1, page + 1]);
  const sorted = [...pages].filter((p) => p >= 1 && p <= totalPages).sort((a, b) => a - b);

  let lastRendered = 0;
  const items = sorted
    .map((p) => {
      const needsEllipsis = p - lastRendered > 1;
      lastRendered = p;
      const ellipsis = needsEllipsis ? '<span class="pagination__ellipsis">…</span>' : '';
      return `${ellipsis}<button class="pagination__page${p === page ? ' pagination__page--active' : ''}" type="button" data-page="${p}">${p}</button>`;
    })
    .join('');

  return `
    <nav class="pagination" aria-label="Navigasi halaman">
      <button class="pagination__arrow" type="button" data-page="${page - 1}" ${page <= 1 ? 'disabled' : ''} aria-label="Halaman sebelumnya">${ARROW_LEFT_ICON}</button>
      ${items}
      <button class="pagination__arrow" type="button" data-page="${page + 1}" ${page >= totalPages ? 'disabled' : ''} aria-label="Halaman berikutnya">${ARROW_RIGHT_ICON}</button>
    </nav>
  `;
}

/**
 * @param {HTMLElement} root
 * @param {{service:Object, statusMeta:Array, title:string, subtitle:string, searchPlaceholder:string}} config
 * @param {Session} user
 */
function initMonitoringTable(root, config, user) {
  const {
    service,
    statusMeta,
    cardGroups: defaultCardGroups,
    cardGroupsByRole,
    statusLabelOverrides,
    showFilterToggles,
    loBiroTiControls,
    createRoute,
    createLabel,
    compactTable,
    title,
    subtitle,
    searchPlaceholder,
    titleColumnLabel
  } = config;
  // Beberapa role (Kepala Biro Ortala, Kepala Bagian Ortala, dst)
  // lihat kartu ringkasan yang beda dari default -- lihat
  // cardGroupsByRole di MONITORING_CONFIG.
  const cardGroups = cardGroupsByRole?.[user?.role] ?? defaultCardGroups;
  const showToggles = Boolean(showFilterToggles);
  const showCreateButton = Boolean(loBiroTiControls) && user?.role === ROLES.LO_BIRO_TI;
  const state = { search: '', status: '', year: '', page: 1, assignToMe: false, belumAdaKonsep: false };
  const years = service.getAvailableYears();

  function renderAll() {
    const { rows, totalPages, page } = service.getFiltered({
      search: state.search,
      status: state.status,
      year: state.year,
      assignedTo: state.assignToMe ? user?.name : '',
      page: state.page,
      pageSize: PAGE_SIZE
    });
    state.page = page;

    const counts = service.getStatusCounts();
    const startIndex = (page - 1) * PAGE_SIZE;

    root.innerHTML = `
      <div class="monitoring-page">
        <div class="monitoring-page__intro">
          <h1 class="monitoring-page__title">${title}</h1>
          <p class="dashboard__subtitle">${subtitle}</p>
        </div>

        ${cardGroups ? renderStatCardsGrouped(cardGroups, counts) : renderStatCards(statusMeta, counts)}

        <div class="card data-table-card${compactTable ? ' data-table-card--compact' : ''}">
          ${renderFilterBar({
            statusMeta,
            years,
            selectedYear: state.year,
            search: state.search,
            selectedStatus: state.status,
            searchPlaceholder,
            showToggles,
            showCreateButton,
            belumAdaKonsep: state.belumAdaKonsep,
            assignToMe: state.assignToMe,
            createLabel
          })}
          <div class="data-table-wrap">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Nomor</th>
                  <th>Satuan Kerja</th>
                  <th>${titleColumnLabel}</th>
                  <th>Jenis</th>
                  <th>Dibuat Oleh</th>
                  <th>Tanggal Dibuat</th>
                  <th>Status</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                ${renderTableRows(service, rows, startIndex, statusLabelOverrides)}
              </tbody>
            </table>
          </div>
        </div>

        ${renderPagination(page, totalPages)}
      </div>
    `;

    bindEvents();
  }

  function bindEvents() {
    const searchInput = root.querySelector('#filter-search');
    const yearSelect = root.querySelector('#filter-year');
    const statusSelect = root.querySelector('#filter-status');
    const assignMeToggle = root.querySelector('#filter-assign-me');
    const belumKonsepToggle = root.querySelector('#filter-belum-konsep');
    const createBtn = root.querySelector('#btn-create-proposal');

    let debounceTimer;
    searchInput?.addEventListener('input', (event) => {
      clearTimeout(debounceTimer);
      const value = event.target.value;
      debounceTimer = setTimeout(() => {
        state.search = value;
        state.page = 1;
        renderAll();
        const el = root.querySelector('#filter-search');
        if (el) {
          el.focus();
          el.setSelectionRange(el.value.length, el.value.length);
        }
      }, 300);
    });

    yearSelect?.addEventListener('change', (event) => {
      state.year = event.target.value;
      state.page = 1;
      renderAll();
    });

    statusSelect?.addEventListener('change', (event) => {
      state.status = event.target.value;
      state.page = 1;
      renderAll();
    });

    assignMeToggle?.addEventListener('change', (event) => {
      state.assignToMe = event.target.checked;
      state.page = 1;
      renderAll();
    });

    // TODO: belum ada relasi proposal<->konsep di data, jadi toggle
    // ini baru menyimpan state UI-nya saja dan belum benar-benar
    // menyaring tabel. Sambungkan ke logic filter begitu field relasi
    // (mis. proposalId di data/konsep.js) sudah ada.
    belumKonsepToggle?.addEventListener('change', (event) => {
      state.belumAdaKonsep = event.target.checked;
    });

    createBtn?.addEventListener('click', () => {
      if (createRoute) router.navigate(createRoute);
    });

    root.querySelectorAll('.pagination__page[data-page], .pagination__arrow[data-page]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const targetPage = Number(btn.getAttribute('data-page'));
        if (!Number.isNaN(targetPage)) {
          state.page = targetPage;
          renderAll();
        }
      });
    });
  }

  renderAll();
}

/**
 * @param {HTMLElement} root - elemen tempat konten monitoring dipasang
 * @param {Session} user
 */
export function initMonitoringPage(root, user) {
  if (!root) return;

  const type = getMonitoringType(router.getCurrentPath());
  const config = MONITORING_CONFIG[type];

  if (!config) {
    root.innerHTML = '<p class="dashboard__subtitle">Halaman ini sedang dalam pengembangan.</p>';
    return;
  }

  initMonitoringTable(root, config, user);
}