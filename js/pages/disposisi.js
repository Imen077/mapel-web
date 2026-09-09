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
import { showSuccessModal } from '../components/modal.js';

const DOC_ICON = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M13 3.5H7a1 1 0 0 0-1 1v15a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V8.5L13 3.5Z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/><path d="M12.5 3.5V8h4.5" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/></svg>';
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

function renderDetailItem(label, valueHtml) {
  return `
    <div class="detail-grid__item">
      <span class="detail-grid__label">${label}</span>
      ${valueHtml}
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
      <div class="review-page">
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
    <div class="review-page">
      <div class="review-page__intro">
        <h1 class="review-page__title">Detail Proposal</h1>
        <p class="review-page__subtitle">Rincian data pengajuan proposal beserta dokumen pendukung.</p>
      </div>

      <div class="card detail-card">
        <div class="card__header"><h2 class="card__title">Detail Proposal</h2></div>
        <div class="detail-grid">
          <div class="detail-grid__col">
            ${renderDetailItem('Judul Proposal', `<span class="detail-grid__value">${item.title}</span>`)}
            ${renderDetailItem('Nomor Pengajuan', `<span class="detail-grid__value">${nomorPengajuan}</span>`)}
            ${renderDetailItem('Tanggal Pengajuan', `<span class="detail-grid__value">${formatDateTimeFullID(item.createdAt)}</span>`)}
            ${renderDetailItem('Satker Pengusul', `<span class="detail-grid__value">${item.unit}</span>`)}
            ${renderDetailItem('Status', `<span class="badge badge-success">${statusLabel}</span>`)}
          </div>
          <div class="detail-grid__col">
            ${renderDetailItem('Pejabat Pengusul', `<span class="detail-grid__value">${item.createdBy}</span>`)}
            ${renderDetailItem('Keterangan', `<span class="detail-grid__value">${statusLabel}</span>`)}
            ${renderDetailItem('File Proposal', `<a class="detail-grid__link" href="#" data-file-link>proposal.pdf</a>`)}
            ${renderDetailItem('File Nota Dinas', `<a class="detail-grid__link" href="#" data-file-link>nota-dinas.pdf</a>`)}
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
    showSuccessModal({
      message: 'Proposal berhasil didisposisikan.',
      onOk: () => router.navigate(backTarget)
    });
  });
}