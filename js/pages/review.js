// ============================================================
// MAPEL - pages/review.js
// Halaman "Review Proposal" -- dibuka Kepala Satker Biro TI dari
// tombol Aksi di Monitoring Proposal PL, KHUSUS buat proposal yang
// masih berstatus "Menunggu Persetujuan" (lihat resolveRowAction di
// monitoring.js, itu yang nentuin kapan tombol Aksi ngarah ke sini).
// Proposal-nya dicari dari data/proposal.js lewat query string
// ?id=... di URL.
//
// TAHAP INI: tombol Tolak/Revisi/Setuju BELUM beneran ngubah status
// proposal di data/proposal.js atau masuk ke alur workflow.js (yang
// masih placeholder) -- baru sebatas validasi catatan revisi +
// popup feedback + balik ke Monitoring, sesuai scope yang sama
// dengan halaman Pengajuan Proposal PL/Detail Proposal.
// ============================================================

import { router } from '../core/router.js';
import { proposalService } from '../../data/proposal.js';
import { formatDateTimeFullID } from '../core/format.js';
import { showSuccessModal, showErrorModal } from '../components/modal.js';

const DOC_ICON = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M13 3.5H7a1 1 0 0 0-1 1v15a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V8.5L13 3.5Z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/><path d="M12.5 3.5V8h4.5" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/></svg>';
const FOLDER_ICON = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M3.5 6.5a1 1 0 0 1 1-1H9l2 2h8.5a1 1 0 0 1 1 1v9.5a1 1 0 0 1-1 1h-15a1 1 0 0 1-1-1V6.5Z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/></svg>';
const PERSON_ICON = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="8" r="3.2" stroke="currentColor" stroke-width="1.6"/><path d="M5 20c1-3.5 4-5.5 7-5.5s6 2 7 5.5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>';
const HASH_ICON = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M9.5 4 7 20M17 4l-2.5 16M4 9h16M3.5 15h16" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const PENCIL_ICON = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M4 20l1-4.2L15.8 5a1.5 1.5 0 0 1 2.1 0l1.1 1.1a1.5 1.5 0 0 1 0 2.1L8.2 19 4 20Z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/></svg>';
const CALENDAR_ICON = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><rect x="4" y="5.5" width="16" height="14.5" rx="1.5" stroke="currentColor" stroke-width="1.6"/><path d="M4 9.5h16M8 3.5v3.5M16 3.5v3.5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>';
const BUILDING_ICON = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M5 20.5V5a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v15.5" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/><path d="M13 10.5h5a1 1 0 0 1 1 1v9" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/><path d="M8 7.5h0M8 11h0M8 14.5h0M8 18h0" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><path d="M3 20.5h18" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>';
const SWATCH_ICON = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="8.5" stroke="currentColor" stroke-width="1.6"/><circle cx="12" cy="12" r="2.5" fill="currentColor"/></svg>';
const BACK_ICON = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M19 12H5m0 0 6-6m-6 6 6 6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const X_ICON = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M6 6l12 12M18 6 6 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>';
const REVISI_ICON = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M4 12a8 8 0 1 1 2.6 5.9" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><path d="M4 19v-5h5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const CHECK_ICON = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="m5 12.5 4 4 10-11" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';

// Ditampilin di badge status halaman ini -- "Menunggu Persetujuan"
// (label asli data/status.js) dipendekin jadi "Diajukan" dari sudut
// pandang reviewer, sesuai desain. Fallback ke label asli kalau
// item-nya bukan status ini (mis. dibuka lewat URL manual).
const REVIEW_STATUS_LABEL_OVERRIDES = {
  'menunggu-persetujuan': 'Diajukan'
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
export function initReviewProposalPage(root, user) {
  if (!root) return;

  const item = proposalService.getById(getIdFromQuery());

  if (!item) {
    root.innerHTML = `
      <div class="review-page">
        <p class="dashboard__subtitle">Proposal tidak ditemukan. Mungkin sudah dipindahkan atau link-nya sudah kedaluwarsa.</p>
        <button class="btn btn-ghost" type="button" id="btn-kembali">${BACK_ICON} Kembali ke Monitoring</button>
      </div>
    `;
    root.querySelector('#btn-kembali')?.addEventListener('click', () => {
      router.navigate('/pages/kepala-satker-biro-ti/monitoring/proposal-pl.html');
    });
    return;
  }

  const statusMeta = proposalService.getStatusMeta(item.status);
  const statusLabel = REVIEW_STATUS_LABEL_OVERRIDES[item.status] ?? statusMeta.label;
  const nomorPengajuan = item.nomorPengajuan || item.id;

  root.innerHTML = `
    <div class="review-page">
      <div class="review-page__intro">
        <h1 class="review-page__title">${item.title}</h1>
        <p class="review-page__subtitle">Tinjau data pengajuan dan berkas pendukung, lalu berikan keputusan.</p>
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

      <div class="card review-notes">
        <div class="review-notes__header">
          <h2 class="card__title">Catatan Revisi</h2>
          <span class="review-notes__required">(Silahkan diisi apabila ada revisi)</span>
        </div>
        <div class="review-notes__body">
          <textarea id="catatan-revisi" class="review-notes__textarea" rows="3" placeholder="Beri catatan Revisi"></textarea>
          <p class="field__error" id="catatan-revisi-error" hidden>Catatan revisi wajib diisi untuk keputusan Tolak atau Revisi.</p>
        </div>
      </div>

      <div class="card review-actions">
        <button class="btn btn-ghost" type="button" id="btn-kembali">${BACK_ICON} Kembali</button>
        <div class="review-actions__right">
          <button class="btn btn-danger" type="button" id="btn-tolak">${X_ICON} Tolak</button>
          <button class="btn btn-gold" type="button" id="btn-revisi">${REVISI_ICON} Revisi</button>
          <button class="btn btn-dark" type="button" id="btn-setuju">${CHECK_ICON} Setuju</button>
        </div>
      </div>
    </div>
  `;

  bindActions(root);
}

function bindActions(root) {
  const backTarget = '/pages/kepala-satker-biro-ti/monitoring/proposal-pl.html';

  root.querySelectorAll('[data-file-link]').forEach((link) => {
    link.addEventListener('click', (e) => e.preventDefault());
  });

  root.querySelector('#btn-kembali')?.addEventListener('click', () => router.navigate(backTarget));

  const textarea = root.querySelector('#catatan-revisi');
  const errorMsg = root.querySelector('#catatan-revisi-error');

  function requireCatatan() {
    const filled = Boolean(textarea?.value.trim());
    errorMsg.hidden = filled;
    if (!filled) textarea?.focus();
    return filled;
  }

  root.querySelector('#btn-tolak')?.addEventListener('click', () => {
    if (!requireCatatan()) return;
    showErrorModal({
      title: 'Proposal Ditolak',
      message: 'Keputusan penolakan sudah dikirim ke LO Biro TI.',
      onOk: () => router.navigate(backTarget)
    });
  });

  root.querySelector('#btn-revisi')?.addEventListener('click', () => {
    if (!requireCatatan()) return;
    showSuccessModal({
      title: 'Revisi Diminta',
      message: 'Catatan revisi sudah dikirim ke LO Biro TI.',
      onOk: () => router.navigate(backTarget)
    });
  });

  root.querySelector('#btn-setuju')?.addEventListener('click', () => {
    showSuccessModal({
      message: 'Proposal berhasil disetujui.',
      onOk: () => router.navigate(backTarget)
    });
  });
}