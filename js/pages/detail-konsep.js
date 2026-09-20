// ============================================================
// MAPEL - pages/detail-konsep.js
// Halaman "Detail Konsep" -- dibuka dari baris dummy KL-2026-050 di
// Monitoring Konsep PL (role LO Biro TI, lihat data/konsep.js &
// resolveRowActionRoute di js/pages/monitoring.js).
//
// Layout & class CSS-nya SENGAJA dipola sama persis kayak halaman
// "Detail Proposal" yang lain (js/pages/detail.js: .detail-page,
// .detail-grid, dst) sesuai contoh tampilan yang dikasih -- alur
// Konsep PL memang mirip banget sama Proposal PL, cuma beda judul
// (lihat penjelasan role LO Biro TI). Ditambah 2 kartu baru khusus
// halaman ini: "Hasil Reviu" (ringkasan, dummy statis) dan "Konsep
// Perangkat Lunak" (daftar konsep turunan proposal ini -- masih
// kosong, karena flow bikin konsep dari proposal yang disetujui
// belum digarap).
//
// Field-nya dibaca DINAMIS dari konsepService.getById() (bukan
// hardcode), jadi kalau nanti dummy KL-2026-050 diisi datanya,
// halaman ini otomatis ikut berubah. Badge status ikut
// item.tableStatusOverride kalau ada (pola sama kayak renderTableRows
// di js/pages/monitoring.js), biar konsisten sama badge di tabel.
//
// TOMBOL "Buat Konsep PL" ngarah ke form Pengajuan Konsep PL
// (js/pages/pengajuan-konsep.js). Tombol "Lihat Reviu" SENGAJA belum
// diarahkan ke mana pun (belum ada halamannya) -- sama kayak
// halaman-halaman lain yang sejenis di app ini.
// ============================================================

import { router } from '../core/router.js';
import { konsepService } from '../../data/konsep.js';
import { formatDateTimeFullID } from '../core/format.js';

const BACK_ICON = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M19 12H5m0 0 6-6m-6 6 6 6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const PLUS_ICON = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>';

// Kartu "Hasil Reviu" masih dummy statis (belum ada data beneran di
// data/konsep.js buat ini, sama kayak DUMMY_HASIL_REVIU di
// js/pages/disposisi.js) -- Nama PL-nya tetap ambil dari item.title
// beneran, biar selalu nyambung sama konsep yang lagi dibuka.
const DUMMY_HASIL_REVIU_ROW = { tanggalReviu: '2026-08-06T08:38:52', kesimpulan: 'acc' };

function getIdFromQuery() {
  return new URLSearchParams(window.location.search).get('id') || '';
}

function renderDetailItem(label, valueHtml) {
  return `
    <div class="detail-grid__item">
      <span class="detail-grid__label">${label}</span>
      ${valueHtml}
    </div>
  `;
}

/** Data turunan buat kartu Detail Proposal -- status ikut tableStatusOverride kalau ada (lihat header file). */
function buildDetailData(item) {
  const baseMeta = konsepService.getStatusMeta(item.status);
  const meta = { ...baseMeta, ...(item.tableStatusOverride || {}) };
  return {
    statusLabel: meta.label,
    badgeBg: meta.bg,
    badgeText: meta.text,
    nomorPengajuan: item.nomorPengajuan || item.id
  };
}

function renderDetailCard(item, data) {
  return `
    <div class="card detail-card">
      <div class="card__header"><h2 class="card__title">Detail Proposal</h2></div>
      <div class="detail-grid">
        <div class="detail-grid__col">
          ${renderDetailItem('Judul Proposal', `<span class="detail-grid__value">${item.title}</span>`)}
          ${renderDetailItem('Nomor Pengajuan', `<span class="detail-grid__value">${data.nomorPengajuan}</span>`)}
          ${renderDetailItem('Tanggal Pengajuan', `<span class="detail-grid__value">${formatDateTimeFullID(item.createdAt)}</span>`)}
          ${renderDetailItem('Satker Pengusul', `<span class="detail-grid__value">${item.unit}</span>`)}
          ${renderDetailItem('Status', `<span class="badge" style="background:${data.badgeBg};color:${data.badgeText}">${data.statusLabel}</span>`)}
        </div>
        <div class="detail-grid__col">
          ${renderDetailItem('Pejabat Pengusul', `<span class="detail-grid__value">${item.createdBy}</span>`)}
          ${renderDetailItem('Keterangan', `<span class="detail-grid__value">${data.statusLabel}</span>`)}
          ${renderDetailItem('File Proposal', `<a class="detail-grid__link" href="#" data-file-link>proposal.pdf</a>`)}
          ${renderDetailItem('File Nota Dinas', `<a class="detail-grid__link" href="#" data-file-link>nota dinas.pdf</a>`)}
        </div>
      </div>
    </div>
  `;
}

function renderHasilReviuCard(item) {
  const row = DUMMY_HASIL_REVIU_ROW;
  return `
    <div class="card detail-card">
      <div class="card__header"><h2 class="card__title">Hasil Reviu</h2></div>
      <div class="data-table-wrap">
        <table class="data-table">
          <thead>
            <tr>
              <th>No</th>
              <th>Nama PL</th>
              <th>Tanggal Reviu</th>
              <th>Hasil Reviu</th>
              <th>Kesimpulan</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>1.</td>
              <td><span class="data-table__title">${item.title}</span></td>
              <td>${formatDateTimeFullID(row.tanggalReviu)}</td>
              <td><span class="badge" style="background:#E1EFE7;color:#3C7A5C">Dibutuhkan</span></td>
              <td>${row.kesimpulan}</td>
              <td><button class="btn btn-dark" type="button" id="btn-lihat-reviu">Lihat Reviu</button></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `;
}

function renderKonsepPlSection() {
  return `
    <div class="card detail-card">
      <div class="card__header">
        <h2 class="card__title">Konsep Perangkat Lunak</h2>
        <button class="btn btn-dark" type="button" id="btn-buat-konsep">${PLUS_ICON}Buat Konsep PL</button>
      </div>
      <div class="data-table-wrap">
        <table class="data-table">
          <thead>
            <tr>
              <th>No</th>
              <th>Nama Konsep PL</th>
              <th>Jenis</th>
              <th>Status</th>
              <th>Pengusul</th>
              <th>Pereviu</th>
              <th>File Dokumen</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td class="data-table__empty" colspan="8">Tidak Ada Data</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `;
}

/**
 * @param {HTMLElement} root
 * @param {Session} user
 */
export function initDetailKonsepPage(root, user) {
  if (!root) return;

  const backTarget = `/pages/${user?.role}/monitoring/konsep-pl.html`;
  const item = konsepService.getById(getIdFromQuery());

  if (!item) {
    root.innerHTML = `
      <div class="detail-page">
        <p class="dashboard__subtitle">Konsep tidak ditemukan. Mungkin sudah dipindahkan atau link-nya sudah kedaluwarsa.</p>
        <button class="btn btn-ghost" type="button" id="btn-kembali">${BACK_ICON} Kembali ke Monitoring</button>
      </div>
    `;
    root.querySelector('#btn-kembali')?.addEventListener('click', () => router.navigate(backTarget));
    return;
  }

  const data = buildDetailData(item);

  root.innerHTML = `
    <div class="detail-page">
      <div class="detail-page__intro">
        <h1 class="detail-page__title">Detail Proposal</h1>
        <p class="detail-page__subtitle">Rincian data pengajuan proposal beserta dokumen pendukung.</p>
      </div>

      ${renderDetailCard(item, data)}
      ${renderHasilReviuCard(item)}
      ${renderKonsepPlSection()}

      <div class="card detail-actions">
        <button class="btn btn-ghost" type="button" id="btn-kembali">${BACK_ICON} Kembali</button>
      </div>
    </div>
  `;

  root.querySelectorAll('[data-file-link]').forEach((link) => link.addEventListener('click', (e) => e.preventDefault()));
  root.querySelector('#btn-kembali')?.addEventListener('click', () => router.navigate(backTarget));

  // "Buat Konsep PL" -> form Pengajuan Konsep PL, id proposal induknya
  // ikut dibawa lewat query supaya tombol "Batal" di form bisa balik
  // ke halaman ini lagi.
  root.querySelector('#btn-buat-konsep')?.addEventListener('click', () => {
    router.navigate(`/pages/lo-biro-ti/pengajuan/konsep-pl.html?proposalId=${encodeURIComponent(item.id)}`);
  });

  // "Lihat Reviu" SENGAJA belum diarahkan ke mana pun -- belum ada
  // halaman Reviu Konsep yang bisa dituju (lihat header file).
}