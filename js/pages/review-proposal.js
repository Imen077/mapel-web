// ============================================================
// MAPEL - pages/reviu-proposal.js
// "Reviu Proposal" -- halaman form reviu buat Previu Biro Ortala
// (ujung rantai disposisi, lihat DISPOSISI_CHAIN/REVIU_CHAIN di
// js/core/role.js), dibuka lewat tombol "Reviu" di halaman Detail
// Proposal (js/pages/disposisi.js). Beda dari Kabiro/Kabag/Kasubbag
// yang cuma NERUSIN proposal (disposisi.js + disposisi-tujuan.js),
// di sini Previu BENERAN ngerjain reviu-nya: catat langkah-langkah
// checklist reviu, lalu kesimpulan & catatan akhir.
//
// TAHAP INI: tombol "+ Tambah Reviu" & "Previous"/"Next" pagination
// checklist SENGAJA belum di-wire ke logic apapun -- ikut pola
// tombol lain yang sejenis di app ini (mis. "+ Tambah Akun" di
// js/pages/pengaturan.js): visualnya duluan, logic-nya menyusul.
// Checklist-nya juga masih selalu nampilin empty state (belum ada
// data dummy buat isi checklist-nya).
// ============================================================

import { router } from '../core/router.js';
import { proposalService } from '../../data/proposal.js';
import { formatDateTimeFullID } from '../core/format.js';

const CALENDAR_ICON = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><rect x="4" y="5.5" width="16" height="14.5" rx="1.5" stroke="currentColor" stroke-width="1.6"/><path d="M4 9.5h16M8 3.5v3.5M16 3.5v3.5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>';
const CHECK_ICON = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.6"/><path d="m8 12.5 2.5 2.5L16 9.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const PENCIL_ICON = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M4 20l1-4.2L15.8 5a1.5 1.5 0 0 1 2.1 0l1.1 1.1a1.5 1.5 0 0 1 0 2.1L8.2 19 4 20Z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/></svg>';
const CLIPBOARD_ICON = '<svg width="28" height="28" viewBox="0 0 24 24" fill="none"><rect x="5" y="4.5" width="14" height="16" rx="1.5" stroke="currentColor" stroke-width="1.6"/><path d="M9 4.5V3.8a1.3 1.3 0 0 1 1.3-1.3h3.4A1.3 1.3 0 0 1 15 3.8v.7" stroke="currentColor" stroke-width="1.6"/><path d="M8.5 11h7M8.5 14.5h7M8.5 18h4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>';
const PLUS_ICON = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>';
const BACK_ICON = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M19 12H5m0 0 6-6m-6 6 6 6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>';

function getIdFromQuery() {
  return new URLSearchParams(window.location.search).get('id') || '';
}

function renderInfoField(label, valueHtml) {
  return `
    <div class="reviu-proposal__field">
      <p class="reviu-proposal__field-label">${label}</p>
      <p class="reviu-proposal__field-value">${valueHtml}</p>
    </div>
  `;
}

/** Kartu kiri "Informasi Proposal" -- ringkasan singkat, BUKAN detail lengkap kayak renderDetailCard di disposisi.js. */
function renderInfoCard(item) {
  const statusMeta = proposalService.getStatusMeta(item.status);
  // Reuse label/warna "Disposisi" yang sama kayak badge Status di
  // halaman Detail Proposal (js/pages/disposisi.js) -- proposal yang
  // sama, cuma beda halaman.
  const isProsesReviu = item.status === 'proses-reviu';
  const badgeBg = isProsesReviu ? '#E1EAF6' : statusMeta.bg;
  const badgeText = isProsesReviu ? '#2B5C89' : statusMeta.text;
  const badgeLabel = isProsesReviu ? 'Disposisi' : statusMeta.label;

  // "Tanggal Reviu" = waktu Previu buka halaman ini buat ngerjain
  // reviu-nya (bukan tanggal pengajuan proposal-nya) -- dihitung pas
  // halaman dirender, sesuai definisi labelnya sendiri.
  const tanggalReviu = formatDateTimeFullID(new Date().toISOString());

  return `
    <div class="card review-card reviu-proposal__info">
      <div class="review-card__header">
        <span class="review-card__header-icon">${CALENDAR_ICON}</span>
        <div>
          <h2 class="card__title">Informasi Proposal</h2>
          <p class="review-card__header-subtitle">Ringkasan data proposal yang didisposisikan</p>
        </div>
      </div>
      <div class="reviu-proposal__info-body">
        ${renderInfoField('Judul Proposal', item.title)}
        ${renderInfoField('Unit Kerja', item.unit)}
        ${renderInfoField('Tanggal Reviu', tanggalReviu)}
        <div class="reviu-proposal__field">
          <p class="reviu-proposal__field-label">Status</p>
          <span class="badge badge--tint" style="--tint-bg:${badgeBg};--tint-text:${badgeText}">${badgeLabel}</span>
        </div>
        <div class="reviu-proposal__divider"></div>
        ${renderInfoField('File Proposal', '<a href="#" data-file-link>proposal.pdf</a>')}
        ${renderInfoField('File Nota Dinas', '<a href="#" data-file-link>nota dinas.pdf</a>')}
      </div>
    </div>
  `;
}

/** Kartu kanan "Checklist Reviu" -- masih selalu empty state (belum ada data dummy checklist). */
function renderChecklistCard() {
  return `
    <div class="card review-card reviu-proposal__checklist">
      <div class="reviu-proposal__checklist-header">
        <span class="review-card__header-icon">${CHECK_ICON}</span>
        <div class="reviu-proposal__checklist-heading">
          <h2 class="card__title">Checklist Reviu</h2>
          <p class="review-card__header-subtitle">Belum ada langkah reviu yang dicatat untuk proposal ini</p>
        </div>
        <button class="btn btn-tint-purple" type="button" id="btn-tambah-reviu">${PLUS_ICON}Tambah Reviu</button>
      </div>
      <div class="data-table-wrap">
        <table class="data-table">
          <thead>
            <tr>
              <th>No</th>
              <th>Langkah Reviu</th>
              <th>Hasil Reviu</th>
              <th>Check</th>
            </tr>
          </thead>
          <tbody></tbody>
        </table>
      </div>
      <div class="reviu-proposal__empty">
        <span class="reviu-proposal__empty-icon">${CLIPBOARD_ICON}</span>
        <p class="reviu-proposal__empty-title">Belum ada checklist reviu</p>
        <p class="reviu-proposal__empty-desc">Klik &quot;Tambah Reviu&quot; untuk mulai mengisi langkah-langkah peninjauan proposal ini.</p>
      </div>
      <div class="reviu-proposal__pagination">
        <button class="pagination__text-btn" type="button" disabled>Previous</button>
        <button class="pagination__text-btn" type="button" disabled>Next</button>
      </div>
    </div>
  `;
}

/** Kartu bawah "Kesimpulan & Catatan" -- textarea doang, belum tersambung ke logic simpan apapun. */
function renderKesimpulanCard() {
  return `
    <div class="card review-card">
      <div class="review-card__header">
        <span class="review-card__header-icon">${PENCIL_ICON}</span>
        <div>
          <h2 class="card__title">Kesimpulan & Catatan</h2>
          <p class="review-card__header-subtitle">Ringkasan akhir hasil peninjauan proposal</p>
        </div>
      </div>
      <div class="review-notes__body reviu-proposal__notes-body">
        <label class="reviu-proposal__notes-label" for="reviu-kesimpulan">Kesimpulan</label>
        <textarea class="review-notes__textarea" id="reviu-kesimpulan" rows="3"></textarea>
        <label class="reviu-proposal__notes-label" for="reviu-catatan">Catatan Hasil Reviu (opsional)</label>
        <textarea class="review-notes__textarea" id="reviu-catatan" rows="3"></textarea>
      </div>
    </div>
  `;
}

/**
 * @param {HTMLElement} root
 * @param {Session} user
 */
export function initReviuProposalPage(root, user) {
  if (!root) return;

  const backTarget = `/pages/${user?.role}/monitoring/proposal-pl.html`;
  const item = proposalService.getById(getIdFromQuery());

  if (!item) {
    root.innerHTML = `
      <div class="review-page">
        <p class="dashboard__subtitle">Proposal tidak ditemukan. Mungkin sudah dipindahkan atau link-nya sudah kedaluwarsa.</p>
        <button class="btn btn-ghost" type="button" id="btn-kembali">${BACK_ICON} Kembali ke Monitoring</button>
      </div>
    `;
    root.querySelector('#btn-kembali')?.addEventListener('click', () => router.navigate(backTarget));
    return;
  }

  root.innerHTML = `
    <div class="review-page">
      <div class="review-page__intro">
        <h1 class="review-page__title">Reviu Atas Kebutuhan Penyusunan/Revisi Perangkat Lunak</h1>
        <p class="review-page__subtitle">Proposal ini didisposisikan dan belum memiliki riwayat reviu.</p>
      </div>

      <div class="reviu-proposal__layout">
        ${renderInfoCard(item)}
        ${renderChecklistCard()}
      </div>

      ${renderKesimpulanCard()}

      <div class="card detail-actions">
        <button class="btn btn-ghost" type="button" id="btn-kembali">${BACK_ICON} Kembali</button>
      </div>
    </div>
  `;

  root.querySelectorAll('[data-file-link]').forEach((link) => link.addEventListener('click', (e) => e.preventDefault()));
  root.querySelector('#btn-kembali')?.addEventListener('click', () => router.navigate(backTarget));
}