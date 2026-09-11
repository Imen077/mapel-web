// ============================================================
// MAPEL - pages/disposisi.js
// "Detail Proposal" versi ringkas (cuma 1 tombol aksi: "Disposisi")
// -- dipakai bareng oleh role mana pun yang tugasnya di tahap ini
// cuma NERUSIN proposal (belum berhak/belum waktunya kasih keputusan
// setuju/tolak/revisi), lihat resolveRowActionRoute di
// js/pages/monitoring.js buat daftar kombinasi role+status yang
// ngarah ke sini:
//   - Kepala Biro Ortala, status "Dikirim" (kartu "Diterima" --
//     proposal baru masuk ke rantai Ortala dari Kepala Satker)
//   - Kepala Bagian Ortala, status "Proses Reviu" (kartu "Disposisi"
//     -- baru didisposisikan dari Kepala Biro Ortala)
//   - Kepala Subbagian Ortala, status "Selesai Reviu" (kartu "Selesai
//     Reviu" -- REVIU_CHAIN sudah sampai balik lagi ke dia, tinggal
//     diteruskan ke Previu, BUKAN keputusan final -- final approver
//     cuma Kepala Biro Ortala, lihat FINAL_APPROVER_ROLE di
//     js/core/role.js)
// Beda dari Review Proposal (js/pages/review.js) yang dipakai KHUSUS
// buat status yang butuh keputusan setuju/tolak/revisi beneran.
//
// Halaman ini tetap navigasi biasa (router.navigate ke
// monitoring/detail.html?id=...), BUKAN modal -- tombol "Disposisi"
// di dalamnya yang buka POPUP "Disposisi Proposal PL"
// (openDisposisiTujuanModal, lihat js/pages/disposisi-tujuan.js) di
// atas halaman ini.
//
// TAHAP INI: tombol "Disposisi" BELUM beneran ngubah status proposal
// di data/proposal.js atau masuk ke alur workflow.js (yang masih
// placeholder) -- baru sebatas popup feedback + balik ke Monitoring,
// sama kayak halaman-halaman lain yang sejenis.
// ============================================================

import { router } from '../core/router.js';
import { proposalService } from '../../data/proposal.js';
import { formatDateTimeFullID } from '../core/format.js';
import { openDisposisiTujuanModal } from './disposisi-tujuan.js';

const DOC_ICON = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M13 3.5H7a1 1 0 0 0-1 1v15a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V8.5L13 3.5Z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/><path d="M12.5 3.5V8h4.5" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/></svg>';
const FOLDER_ICON = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M3.5 6.5a1 1 0 0 1 1-1H9l2 2h8.5a1 1 0 0 1 1 1v9.5a1 1 0 0 1-1 1h-15a1 1 0 0 1-1-1V6.5Z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/></svg>';
const PERSON_ICON = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="8" r="3.2" stroke="currentColor" stroke-width="1.6"/><path d="M5 20c1-3.5 4-5.5 7-5.5s6 2 7 5.5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>';
const HASH_ICON = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M9.5 4 7 20M17 4l-2.5 16M4 9h16M3.5 15h16" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const PENCIL_ICON = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M4 20l1-4.2L15.8 5a1.5 1.5 0 0 1 2.1 0l1.1 1.1a1.5 1.5 0 0 1 0 2.1L8.2 19 4 20Z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/></svg>';
const CALENDAR_ICON = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><rect x="4" y="5.5" width="16" height="14.5" rx="1.5" stroke="currentColor" stroke-width="1.6"/><path d="M4 9.5h16M8 3.5v3.5M16 3.5v3.5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>';
const BUILDING_ICON = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M5 20.5V5a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v15.5" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/><path d="M13 10.5h5a1 1 0 0 1 1 1v9" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/><path d="M8 7.5h0M8 11h0M8 14.5h0M8 18h0" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><path d="M3 20.5h18" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>';
const SWATCH_ICON = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="8.5" stroke="currentColor" stroke-width="1.6"/><circle cx="12" cy="12" r="2.5" fill="currentColor"/></svg>';
const BACK_ICON = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M19 12H5m0 0 6-6m-6 6 6 6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>';

// Label + warna badge Status di halaman ini -- underlying status-nya
// tetap "dikirim"/"proses-reviu" (data/status.js), tapi dari sudut
// pandang penerima disposisi (Kepala Biro Ortala buat "dikirim",
// Kepala Bagian Ortala buat "proses-reviu") lebih pas disebut
// "Diterima"/"Disposisi", warna biru senada (bukan warna asli
// status-nya) sesuai desain.
const DISPOSISI_STATUS_META_OVERRIDES = {
  dikirim: { label: 'Diterima', bg: '#E1EAF6', text: '#2B5C89' },
  'proses-reviu': { label: 'Disposisi', bg: '#E1EAF6', text: '#2B5C89' }
};

// Riwayat disposisi masih dummy statis (belum ada data beneran di
// data/proposal.js buat ini) -- disesuaikan per status, biar nyambung
// sama tahapnya: "dikirim" = baru masuk dari Kepala Satker ke Kepala
// Biro Ortala (1 baris), "proses-reviu" = udah diteruskan Kabiro ke
// Kepala Bagian (2 baris). Status lain belum ada riwayatnya.
const DUMMY_RIWAYAT_DISPOSISI = {
  dikirim: [
    {
      waktu: '2026-02-26T08:15:22',
      dariNama: 'Made Wirawan',
      dariJabatan: 'Kepala Satker Biro TI',
      kepadaNama: 'Agustina Ratna Puspitasari',
      kepadaJabatan: 'Kepala Biro',
      catatan: 'Mohon ditindaklanjuti sesuai ketentuan yang berlaku.'
    }
  ],
  'proses-reviu': [
    {
      waktu: '2026-02-26T08:15:22',
      dariNama: 'Agustina Ratna Puspitasari',
      dariJabatan: 'Kepala Biro',
      kepadaNama: 'Telviani Savitri',
      kepadaJabatan: 'Kepala Bagian',
      catatan: 'Mohon direviu kesesuaiannya dengan proses bisnis BPK.'
    },
    {
      waktu: '2026-02-26T09:40:05',
      dariNama: 'Telviani Savitri',
      dariJabatan: 'Kepala Bagian',
      kepadaNama: 'Mochammad Taufik',
      kepadaJabatan: 'Pereviu',
      catatan: 'Diteruskan untuk direviu lebih lanjut, mohon segera ditindaklanjuti.'
    }
  ]
};

function getIdFromQuery() {
  return new URLSearchParams(window.location.search).get('id') || '';
}

/**
 * Data turunan buat kartu Detail Proposal (renderDetailCard di bawah)
 * -- dipisah dari initDisposisiPage supaya lebih ringkas dibaca.
 * @param {Object} item - hasil proposalService.getById()
 */
function buildDetailData(item) {
  const statusMeta = proposalService.getStatusMeta(item.status);
  const override = DISPOSISI_STATUS_META_OVERRIDES[item.status];
  const statusLabel = override?.label ?? statusMeta.label;
  const badgeBg = override?.bg ?? statusMeta.bg;
  const badgeText = override?.text ?? statusMeta.text;
  const nomorPengajuan = item.nomorPengajuan || item.id;
  const riwayat = DUMMY_RIWAYAT_DISPOSISI[item.status] ?? [];
  return { statusLabel, badgeBg, badgeText, nomorPengajuan, riwayat };
}

function renderInfoItem({ icon, label, value }) {
  return `
    <div class="review-grid__item">
      <span class="review-grid__icon">${icon}</span>
      <div>
        <p class="review-grid__label">${label}</p>
        <p class="review-grid__value">${value}</p>
      </div>
    </div>
  `;
}

/**
 * @param {Object[]} entries
 * @returns {string} HTML kartu, atau string kosong kalau belum ada riwayat
 *   sama sekali -- dipakai buat status kayak "Selesai Reviu" (Kepala
 *   Subbagian Ortala) yang di data dummy ini emang belum ada riwayat
 *   disposisinya (lihat DUMMY_RIWAYAT_DISPOSISI di atas), beda dari
 *   dulu yang selalu nampilin kartu + baris "Belum ada riwayat" biar
 *   sesuai sama desain (kartu ini nggak ada sama sekali di desainnya).
 */
function renderRiwayatDisposisiCard(entries) {
  if (!entries.length) return '';

  const rows = entries
    .map(
      (row) => `
            <tr>
              <td>
                <span class="data-table__title">${formatDateTimeFullID(row.waktu)}</span>
              </td>
              <td>
                <span class="data-table__title">${row.dariNama}</span>
                <span class="data-table__code">${row.dariJabatan}</span>
              </td>
              <td>
                <span class="data-table__title">${row.kepadaNama}</span>
                <span class="data-table__code">${row.kepadaJabatan}</span>
              </td>
              <td>${row.catatan}</td>
            </tr>
          `
    )
    .join('');

  return `
    <div class="card review-card">
      <div class="review-card__header">
        <h2 class="card__title">Riwayat Disposisi</h2>
      </div>
      <div class="data-table-wrap">
        <table class="data-table">
          <thead>
            <tr>
              <th>Tanggal &amp; Waktu</th>
              <th>Dari</th>
              <th>Kepada</th>
              <th>Catatan Disposisi</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
    </div>
  `;
}

/** Kartu "Detail Proposal" (info + status). */
function renderDetailCard(item, data) {
  const { statusLabel, badgeBg, badgeText, nomorPengajuan } = data;
  return `
    <div class="card review-card">
      <div class="review-card__header">
        <span class="review-card__header-icon">${FOLDER_ICON}</span>
        <div>
          <h2 class="card__title">Detail Proposal</h2>
          <p class="review-card__header-subtitle">Informasi lengkap proposal pengajuan</p>
        </div>
      </div>
      <div class="review-grid">
        <div class="review-grid__col">
          ${renderInfoItem({ icon: DOC_ICON, label: 'Judul Proposal', value: item.title })}
          ${renderInfoItem({ icon: HASH_ICON, label: 'Nomor Pengajuan', value: nomorPengajuan })}
          ${renderInfoItem({ icon: CALENDAR_ICON, label: 'Tanggal Pengajuan', value: formatDateTimeFullID(item.createdAt) })}
          ${renderInfoItem({ icon: BUILDING_ICON, label: 'Satker Pengusul', value: item.unit })}
          <div class="review-grid__item">
            <span class="review-grid__icon">${SWATCH_ICON}</span>
            <div>
              <p class="review-grid__label">Status</p>
              <span class="badge badge--tint" style="--tint-bg:${badgeBg};--tint-text:${badgeText}">${statusLabel}</span>
            </div>
          </div>
        </div>
        <div class="review-grid__col">
          ${renderInfoItem({ icon: PERSON_ICON, label: 'Pejabat Pengusul', value: item.createdBy })}
          ${renderInfoItem({ icon: PENCIL_ICON, label: 'Keterangan', value: statusLabel })}
          ${renderInfoItem({ icon: DOC_ICON, label: 'File Proposal', value: '<a href="#" data-file-link>test.pdf</a>' })}
          ${renderInfoItem({ icon: DOC_ICON, label: 'File Nota Dinas', value: '<a href="#" data-file-link>test.pdf</a>' })}
        </div>
      </div>
    </div>
  `;
}

/**
 * @param {HTMLElement} root
 * @param {Session} user
 */
export function initDisposisiPage(root, user) {
  if (!root) return;

  // Dipakai bareng lintas role (Kabiro/Kabag/Kasubbag Ortala, lihat
  // komentar header file), jadi "kembali"-nya ngikutin folder role
  // yang lagi login (bukan di-hardcode ke satu role tertentu).
  const backTarget = `/pages/${user?.role}/monitoring/proposal-pl.html`;
  const item = proposalService.getById(getIdFromQuery());

  if (!item) {
    root.innerHTML = `
      <div class="review-page disposisi-page">
        <p class="dashboard__subtitle">Proposal tidak ditemukan. Mungkin sudah dipindahkan atau link-nya sudah kedaluwarsa.</p>
        <button class="btn btn-ghost" type="button" id="btn-kembali">${BACK_ICON} Kembali ke Monitoring</button>
      </div>
    `;
    root.querySelector('#btn-kembali')?.addEventListener('click', () => router.navigate(backTarget));
    return;
  }

  const data = buildDetailData(item);

  root.innerHTML = `
    <div class="review-page disposisi-page">
      <div class="review-page__intro">
        <h1 class="review-page__title">Detail Proposal</h1>
        <p class="review-page__subtitle">Rincian data pengajuan proposal beserta dokumen pendukung.</p>
      </div>

      ${renderDetailCard(item, data)}

      ${renderRiwayatDisposisiCard(data.riwayat)}

      <div class="card detail-actions">
        <button class="btn btn-ghost" type="button" id="btn-kembali">${BACK_ICON} Kembali</button>
        <button class="btn btn-dark" type="button" id="btn-disposisi">Disposisi</button>
      </div>
    </div>
  `;

  root.querySelectorAll('[data-file-link]').forEach((link) => link.addEventListener('click', (e) => e.preventDefault()));
  root.querySelector('#btn-kembali')?.addEventListener('click', () => router.navigate(backTarget));
  // Sekarang tampil sebagai MODAL popup di atas halaman ini (lihat
  // js/pages/disposisi-tujuan.js), bukan pindah ke halaman baru lagi.
  root.querySelector('#btn-disposisi')?.addEventListener('click', () => {
    openDisposisiTujuanModal(item, user);
  });
}