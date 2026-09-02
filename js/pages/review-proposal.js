// ============================================================
// MAPEL - pages/review-proposal.js
// Halaman "Review Proposal" -- dibuka Kepala Satker Biro TI pas
// klik "Lihat" di Monitoring Proposal PL, KHUSUS buat baris yang
// statusnya "Menunggu Persetujuan" (lihat handleLihat di
// js/pages/monitoring.js). Kasatker meninjau detail + berkas
// pendukung, lalu ambil keputusan: Tolak / Revisi / Setuju.
//
// TAHAP INI: sama seperti detail.js, data item yang mau ditinjau
// dioper lewat sessionStorage (REVIEW_HANDOFF_KEY, diisi
// saveReviewHandoff() dari monitoring.js) alih-alih lewat query
// param -- router.navigate() di app ini belum dukung itu. Kalau
// dibuka langsung tanpa lewat klik "Lihat" (atau handoff-nya
// kosong/dibersihkan), tampil data contoh generik supaya halaman
// tidak kosong.
//
// Tombol Tolak/Revisi/Setuju BELUM benar-benar mengubah status item
// di data/proposal.js (workflow engine di js/workflow/* masih
// placeholder) -- baru validasi + popup konfirmasi sesuai desain,
// lalu balik ke Monitoring. Sambungkan ke workflow beneran begitu
// itu sudah digarap.
// ============================================================

import { router } from '../core/router.js';
import { formatDateTimeFullID } from '../core/format.js';
import { showModal, showSuccessModal } from '../components/modal.js';

const REVIEW_HANDOFF_KEY = 'mapel_review_proposal';

const BACK_ICON = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M19 12H5m0 0 6-6m-6 6 6 6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const CLOSE_ICON = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="m6 6 12 12M18 6 6 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>';
const REVISI_ICON = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M4 12a8 8 0 1 1 2.6 5.9" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><path d="M4 20v-5h5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const CHECK_ICON = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="m5 12.5 4.5 4.5L19 7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const FOLDER_ICON = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M4 6.5a1 1 0 0 1 1-1h4.5l2 2.2H19a1 1 0 0 1 1 1V18a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6.5Z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/></svg>';
const FILE_ICON = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M13 3.5H7a1 1 0 0 0-1 1v15a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V8.5L13 3.5Z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/><path d="M12.5 3.5V8h4.5" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/></svg>';
const HASH_ICON = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M9.5 4 7 20M17 4l-2.5 16M4 9h16M3.5 15h16" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const CALENDAR_ICON = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><rect x="4" y="5.5" width="16" height="14.5" rx="1.5" stroke="currentColor" stroke-width="1.6"/><path d="M4 9.5h16M8 3.5v3.5M16 3.5v3.5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>';
const BUILDING_ICON = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M5 20.5V5a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v15.5" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/><path d="M13 10.5h5a1 1 0 0 1 1 1v9" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/><path d="M8 7.5h0M8 11h0M8 14.5h0M8 18h0" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><path d="M3 20.5h18" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>';
const TAG_ICON = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M11.5 4.5H6a1 1 0 0 0-1 1v5.5a1 1 0 0 0 .3.7l8 8a1 1 0 0 0 1.4 0l5.5-5.5a1 1 0 0 0 0-1.4l-8-8a1 1 0 0 0-.7-.3Z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/><circle cx="8.7" cy="8.7" r="1.2" fill="currentColor"/></svg>';
const PERSON_ICON = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="8" r="3.3" stroke="currentColor" stroke-width="1.6"/><path d="M5 20c.8-3.6 3.6-5.5 7-5.5s6.2 1.9 7 5.5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>';
const PENCIL_ICON = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="m14.5 5 4.5 4.5L8.5 20H4v-4.5L14.5 5Z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/></svg>';

/** Dipanggil dari monitoring.js pas "Lihat" diklik di baris yang relevan. */
export function saveReviewHandoff(item) {
  try {
    sessionStorage.setItem(REVIEW_HANDOFF_KEY, JSON.stringify(item));
  } catch (err) {
    console.error('[review-proposal] Gagal nyimpen review handoff:', err);
  }
}

function readReviewHandoff() {
  try {
    const raw = sessionStorage.getItem(REVIEW_HANDOFF_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (err) {
    console.error('[review-proposal] Gagal baca review handoff:', err);
    return null;
  }
}

/** Kartu pratinjau dokumen (skeleton statis) -- pola sama dengan pengajuan-proposal.js, cuma subtitle-nya beda (ada label "File Proposal ·"/"File Nota Dinas ·" di depan). */
function renderPreviewCard({ headerTitle, subtitleLabel, docTitle }) {
  const lines = Array.from({ length: 6 })
    .map((_, i) => `<span class="doc-preview__line${i === 1 || i === 5 ? ' doc-preview__line--short' : ''}"></span>`)
    .join('');

  return `
    <div class="card doc-preview">
      <div class="doc-preview__header">
        <span class="doc-preview__icon">${FILE_ICON}</span>
        <div>
          <p class="doc-preview__title">${headerTitle}</p>
          <p class="doc-preview__subtitle">${subtitleLabel} &middot; Pratinjau dokumen</p>
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

function renderReviewItem(icon, label, valueHtml) {
  return `
    <div class="review-grid__item">
      <span class="review-grid__icon">${icon}</span>
      <div class="review-grid__body">
        <span class="review-grid__label">${label}</span>
        ${valueHtml}
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

  const handoff = readReviewHandoff();
  const item = handoff ?? {
    id: 'PO-2026-005',
    title: 'Proposal POS Pengujian Website',
    unit: 'Biro Teknologi Informasi',
    createdBy: user?.name || 'Agustina Ratna Puspitasari',
    createdAt: '2026-01-26T08:37:00'
  };

  root.innerHTML = `
    <div class="page-review">
      <div class="page-review__intro">
        <h1 class="page-review__title">${item.title}</h1>
        <p class="page-review__subtitle">Tinjau data pengajuan dan berkas pendukung, lalu berikan keputusan.</p>
      </div>

      <div class="card review-card">
        <div class="card__header">
          <div class="card__header-icon-title">
            <span class="card__header-icon">${FOLDER_ICON}</span>
            <div>
              <h2 class="card__title">Detail Proposal</h2>
              <p class="card__header-subtitle">Informasi lengkap proposal pengajuan</p>
            </div>
          </div>
        </div>
        <div class="review-grid">
          <div class="review-grid__col">
            ${renderReviewItem(FILE_ICON, 'Judul Proposal', `<span class="review-grid__value">${item.title}</span>`)}
            ${renderReviewItem(HASH_ICON, 'Nomor Pengajuan', `<span class="review-grid__value">${item.id}</span>`)}
            ${renderReviewItem(CALENDAR_ICON, 'Tanggal Pengajuan', `<span class="review-grid__value">${formatDateTimeFullID(item.createdAt)}</span>`)}
            ${renderReviewItem(BUILDING_ICON, 'Satker Pengusul', `<span class="review-grid__value">${item.unit}</span>`)}
            ${renderReviewItem(TAG_ICON, 'Status', `<span class="status-dot-badge">Diajukan</span>`)}
          </div>
          <div class="review-grid__col">
            ${renderReviewItem(PERSON_ICON, 'Pejabat Pengusul', `<span class="review-grid__value">${item.createdBy}</span>`)}
            ${renderReviewItem(PENCIL_ICON, 'Keterangan', `<span class="review-grid__value">Diajukan</span>`)}
            ${renderReviewItem(FILE_ICON, 'File Proposal', `<a class="review-grid__link" href="#" data-file-link>proposal.pdf</a>`)}
            ${renderReviewItem(FILE_ICON, 'File Nota Dinas', `<a class="review-grid__link" href="#" data-file-link>nota-dinas.pdf</a>`)}
          </div>
        </div>
      </div>

      <div class="review-preview-grid">
        ${renderPreviewCard({ headerTitle: `Pedoman - file konsep.pdf`, subtitleLabel: 'File Proposal', docTitle: item.title })}
        ${renderPreviewCard({ headerTitle: `Pedoman - file ND konsep.pdf`, subtitleLabel: 'File Nota Dinas', docTitle: `Nota Dinas Pengajuan Proposal ${item.id}` })}
      </div>

      <div class="card review-catatan-card">
        <div class="card__header">
          <h2 class="card__title">Catatan Revisi <span class="review-catatan-hint">(Silahkan diisi apabila ada revisi)</span></h2>
        </div>
        <div class="detail-card__body">
          <textarea class="review-textarea" id="catatan-revisi" placeholder="Beri catatan Revisi"></textarea>
        </div>
      </div>

      <div class="card detail-actions">
        <button class="btn btn-ghost" type="button" id="btn-kembali">${BACK_ICON} Kembali</button>
        <div class="detail-actions__right">
          <button class="btn btn-danger" type="button" id="btn-tolak">${CLOSE_ICON} Tolak</button>
          <button class="btn btn-gold" type="button" id="btn-revisi">${REVISI_ICON} Revisi</button>
          <button class="btn btn-dark" type="button" id="btn-setuju">${CHECK_ICON} Setuju</button>
        </div>
      </div>
    </div>
  `;

  bindActions(root, item);
}

function bindActions(root, item) {
  root.querySelectorAll('[data-file-link]').forEach((link) => {
    link.addEventListener('click', (e) => e.preventDefault());
  });

  const goToMonitoring = () => router.navigate('/pages/kepala-satker-biro-ti/monitoring/proposal-pl.html');

  root.querySelector('#btn-kembali')?.addEventListener('click', goToMonitoring);

  root.querySelector('#btn-tolak')?.addEventListener('click', () => {
    const confirmed = window.confirm(`Tolak proposal "${item.title}"? Tindakan ini tidak bisa dibatalkan.`);
    if (!confirmed) return;
    showSuccessModal({ title: 'Proposal Ditolak', message: 'Keputusan sudah dicatat.', onOk: goToMonitoring });
  });

  root.querySelector('#btn-revisi')?.addEventListener('click', () => {
    const catatan = root.querySelector('#catatan-revisi');
    if (!catatan.value.trim()) {
      catatan.focus();
      showModal({
        variant: 'error',
        title: 'Catatan Revisi Kosong',
        message: 'Isi dulu catatan revisi sebelum mengirim permintaan revisi ke pengaju.',
        okLabel: 'Mengerti'
      });
      return;
    }
    showSuccessModal({ title: 'Permintaan Revisi Terkirim', message: 'Catatan revisi sudah dikirim ke pengaju.', onOk: goToMonitoring });
  });

  root.querySelector('#btn-setuju')?.addEventListener('click', () => {
    const confirmed = window.confirm(`Setujui proposal "${item.title}"?`);
    if (!confirmed) return;
    showSuccessModal({ title: 'Proposal Disetujui', message: 'Proposal dilanjutkan ke tahap berikutnya.', onOk: goToMonitoring });
  });
}