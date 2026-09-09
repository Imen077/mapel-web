// ============================================================
// MAPEL - pages/disposisi.js
// Halaman "Detail Proposal" versi ringkas (cuma 1 tombol aksi:
// "Disposisi") -- dibuka Kepala Biro Ortala dari klik judul proposal
// di Monitoring Proposal PL, KHUSUS buat proposal yang berstatus
// "Dikirim" (kartu "Diterima" di kartu ringkasan Kabiro Ortala,
// lihat resolveRowActionRoute di js/pages/monitoring.js). Beda dari
// Review Proposal (js/pages/review.js) yang dipakai buat status
// "Selesai Reviu" -- di tahap ini Kabiro cuma perlu neruskan
// (disposisi) proposalnya ke rantai Ortala, belum ada keputusan
// setuju/tolak/revisi.
//
// TAHAP INI: tombol "Disposisi" BELUM beneran ngubah status proposal
// di data/proposal.js atau masuk ke alur workflow.js (yang masih
// placeholder) -- baru sebatas popup feedback + balik ke Monitoring,
// sama kayak halaman-halaman lain yang sejenis.
// ============================================================

import { router } from '../core/router.js';
import { proposalService } from '../../data/proposal.js';
import { formatDateTimeFullID } from '../core/format.js';

const DOC_ICON = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M13 3.5H7a1 1 0 0 0-1 1v15a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V8.5L13 3.5Z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/><path d="M12.5 3.5V8h4.5" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/></svg>';
const FOLDER_ICON = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M3.5 6.5a1 1 0 0 1 1-1H9l2 2h8.5a1 1 0 0 1 1 1v9.5a1 1 0 0 1-1 1h-15a1 1 0 0 1-1-1V6.5Z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/></svg>';
const PERSON_ICON = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="8" r="3.2" stroke="currentColor" stroke-width="1.6"/><path d="M5 20c1-3.5 4-5.5 7-5.5s6 2 7 5.5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>';
const HASH_ICON = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M9.5 4 7 20M17 4l-2.5 16M4 9h16M3.5 15h16" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const PENCIL_ICON = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M4 20l1-4.2L15.8 5a1.5 1.5 0 0 1 2.1 0l1.1 1.1a1.5 1.5 0 0 1 0 2.1L8.2 19 4 20Z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/></svg>';
const CALENDAR_ICON = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><rect x="4" y="5.5" width="16" height="14.5" rx="1.5" stroke="currentColor" stroke-width="1.6"/><path d="M4 9.5h16M8 3.5v3.5M16 3.5v3.5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>';
const BUILDING_ICON = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M5 20.5V5a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v15.5" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/><path d="M13 10.5h5a1 1 0 0 1 1 1v9" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/><path d="M8 7.5h0M8 11h0M8 14.5h0M8 18h0" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><path d="M3 20.5h18" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>';
const SWATCH_ICON = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="8.5" stroke="currentColor" stroke-width="1.6"/><circle cx="12" cy="12" r="2.5" fill="currentColor"/></svg>';
const BACK_ICON = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M19 12H5m0 0 6-6m-6 6 6 6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>';

// Label badge Status di halaman ini -- underlying status-nya tetap
// "dikirim" (data/status.js), tapi dari sudut pandang Kabiro Ortala
// yang baru nerima, lebih pas disebut "Diterima" sesuai desain.
const DISPOSISI_STATUS_LABEL_OVERRIDES = {
  dikirim: 'Diterima'
};

function getIdFromQuery() {
  return new URLSearchParams(window.location.search).get('id') || '';
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

function renderDocPreview({ headerTitle, headerSubtitle, docTitle }) {
  const lines = Array.from({ length: 6 })
    .map((_, i) => `<span class="doc-preview__line${i === 1 || i === 5 ? ' doc-preview__line--short' : ''}"></span>`)
    .join('');

  return `
    <div class="card doc-preview">
      <div class="doc-preview__header">
        <span class="doc-preview__icon">${DOC_ICON}</span>
        <div>
          <p class="doc-preview__title">${headerTitle}</p>
          <p class="doc-preview__subtitle">${headerSubtitle}</p>
        </div>
      </div>
      <div class="doc-preview__body">
        <div class="doc-preview__sheet">
          <p class="doc-preview__letterhead">Badan Pemeriksa Keuangan Republik Indonesia</p>
          <p class="doc-preview__doc-title">${docTitle}</p>
          <div class="doc-preview__skeleton">${lines}</div>
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

  // Halaman ini cuma dipakai role Kabiro Ortala sekarang, tapi
  // ditulis ngikutin folder role yang login (bukan di-hardcode)
  // biar aman kalau nanti dipakai role lain juga.
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

  const statusMeta = proposalService.getStatusMeta(item.status);
  const statusLabel = DISPOSISI_STATUS_LABEL_OVERRIDES[item.status] ?? statusMeta.label;
  const nomorPengajuan = item.nomorPengajuan || item.id;

  root.innerHTML = `
    <div class="review-page disposisi-page">
      <div class="review-page__intro">
        <h1 class="review-page__title">Detail Proposal</h1>
        <p class="review-page__subtitle">Rincian data pengajuan proposal beserta dokumen pendukung.</p>
      </div>

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
                <span class="badge badge--outline" style="--tint-text:${statusMeta.text}"><span class="badge__dot" style="background:${statusMeta.text}"></span>${statusLabel}</span>
              </div>
            </div>
          </div>
          <div class="review-grid__col">
            ${renderInfoItem({ icon: PERSON_ICON, label: 'Pejabat Pengusul', value: item.createdBy })}
            ${renderInfoItem({ icon: PENCIL_ICON, label: 'Keterangan', value: statusLabel })}
            ${renderInfoItem({ icon: DOC_ICON, label: 'File Proposal', value: '<a href="#" data-file-link>proposal.pdf</a>' })}
            ${renderInfoItem({ icon: DOC_ICON, label: 'File Nota Dinas', value: '<a href="#" data-file-link>nota-dinas.pdf</a>' })}
          </div>
        </div>
      </div>

      <div class="review-preview-grid">
        ${renderDocPreview({
          headerTitle: 'Pedoman - file konsep.pdf',
          headerSubtitle: 'File Proposal &middot; Pratinjau dokumen',
          docTitle: item.title
        })}
        ${renderDocPreview({
          headerTitle: 'Pedoman - file ND konsep.pdf',
          headerSubtitle: 'File Nota Dinas &middot; Pratinjau dokumen',
          docTitle: `Nota Dinas Pengajuan Proposal ${nomorPengajuan}`
        })}
      </div>

      <div class="card detail-actions">
        <button class="btn btn-ghost" type="button" id="btn-kembali">${BACK_ICON} Kembali</button>
        <button class="btn btn-dark" type="button" id="btn-disposisi">Disposisi</button>
      </div>
    </div>
  `;

  root.querySelectorAll('[data-file-link]').forEach((link) => link.addEventListener('click', (e) => e.preventDefault()));
  root.querySelector('#btn-kembali')?.addEventListener('click', () => router.navigate(backTarget));
  root.querySelector('#btn-disposisi')?.addEventListener('click', () => {
    router.navigate(`/pages/${user?.role}/monitoring/disposisi-tujuan.html?id=${encodeURIComponent(item.id)}`);
  });
}