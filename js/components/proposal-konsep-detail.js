// ============================================================
// MAPEL - components/proposal-konsep-detail.js
// Potongan tampilan yang dipakai bareng oleh dua halaman "Detail
// Proposal dan Konsep Perangkat Lunak":
//   - versi LO Biro TI   -> js/pages/detail-proposal-konsep.js
//   - versi Kepala Satker -> js/pages/review-konsep.js
// yaitu kartu "Detail Proposal Perangkat Lunak" & "Konsep Perangkat
// Lunak" (bisa dilipat). Class CSS-nya dari css/pages/detail.css.
// Modul ini BUKAN halaman (tidak didaftarkan di app.js), jadi aman
// ngexport banyak fungsi.
// ============================================================

import { proposalService } from '../../data/proposal.js';
import { formatDateTimeFullID } from '../core/format.js';

const CHEVRON_UP_ICON = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="m6 15 6-6 6 6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>';

/** Teks dari data/form dimasukkan ke innerHTML, jadi wajib di-escape dulu. */
export function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[ch]);
}

export function renderDetailItem(label, valueHtml) {
  return `
    <div class="detail-grid__item">
      <span class="detail-grid__label">${label}</span>
      ${valueHtml}
    </div>
  `;
}

export function renderValue(text) {
  return `<span class="detail-grid__value">${escapeHtml(text)}</span>`;
}

export function renderMutedDash() {
  return '<span class="detail-grid__value detail-grid__value--muted">&mdash;</span>';
}

export function renderFileLink(name) {
  return `<a class="detail-grid__link" href="#" data-file-link>${escapeHtml(name)}</a>`;
}

export function renderBadge(meta, label) {
  return `<span class="badge" style="background:${meta.bg};color:${meta.text}">${escapeHtml(label)}</span>`;
}

/**
 * Kartu yang bisa dilipat lewat tombol panah di pojok kanan header.
 * collapsible=false -> kartu biasa tanpa tombol panah (mis. kartu
 * proposal di halaman Kepala Biro, sesuai contoh tampilannya).
 */
export function renderCollapsibleCard({ id, title, bodyHtml, collapsible = true }) {
  const toggle = collapsible
    ? `
        <button
          class="detail-card__toggle"
          type="button"
          aria-expanded="true"
          aria-controls="${id}"
          aria-label="Ciutkan ${title}"
          data-collapse-toggle="${id}"
          data-title="${title}"
        >${CHEVRON_UP_ICON}</button>`
    : '';
  return `
    <div class="card detail-card" data-collapsible-card>
      <div class="card__header">
        <h2 class="card__title">${title}</h2>${toggle}
      </div>
      <div id="${id}">${bodyHtml}</div>
    </div>
  `;
}

/** Isi kartu "Detail Proposal Perangkat Lunak" -- item dari data/proposal.js. */
export function renderProposalBody(item) {
  const meta = { ...proposalService.getStatusMeta(item.status), ...(item.tableStatusOverride || {}) };
  return `
    <div class="detail-grid">
      <div class="detail-grid__col">
        ${renderDetailItem('Judul Proposal', renderValue(item.title))}
        ${renderDetailItem('Nomor Pengajuan', renderValue(item.nomorPengajuan || item.id))}
        ${renderDetailItem('Tanggal Pengajuan', renderValue(formatDateTimeFullID(item.createdAt)))}
        ${renderDetailItem('Satker Pengusul', renderValue(item.unit))}
        ${renderDetailItem('Status', renderBadge(meta, meta.label))}
      </div>
      <div class="detail-grid__col">
        ${renderDetailItem('Pejabat Pengusul', renderValue(item.createdBy))}
        ${renderDetailItem('Keterangan', renderValue(meta.label))}
        ${renderDetailItem('File Proposal', renderFileLink('proposal.pdf'))}
        ${renderDetailItem('File Nota Dinas', renderFileLink('nota dinas.pdf'))}
        ${renderDetailItem('Nomor Nota Dinas', item.nomorNotaDinas ? renderValue(item.nomorNotaDinas) : renderMutedDash())}
      </div>
    </div>
  `;
}

/**
 * Isi kartu "Konsep Perangkat Lunak".
 * @param {{judul:string, satuanKerja:string, pejabatPengusul:string, fileKonsep:string, fileNotaDinas:string, nomorNotaDinas?:string, nomorPengajuan?:string, tanggalPengajuan?:string}} konsep
 *   nomorPengajuan & tanggalPengajuan opsional -- kosong tampil "-" (konsep yang belum punya nomor).
 * @param {string} statusHtml - badge status yang sudah jadi (beda tiap halaman: LO "Konsep", Kepala Satker "Menunggu Konsep")
 */
export function renderKonsepBody(konsep, statusHtml) {
  return `
    <div class="detail-grid">
      <div class="detail-grid__col">
        ${renderDetailItem('Judul Konsep PL', renderValue(konsep.judul))}
        ${renderDetailItem('Nomor Pengajuan', konsep.nomorPengajuan ? renderValue(konsep.nomorPengajuan) : renderMutedDash())}
        ${renderDetailItem('Tanggal Pengajuan', konsep.tanggalPengajuan ? renderValue(konsep.tanggalPengajuan) : renderMutedDash())}
        ${renderDetailItem('Satker Pengusul', renderValue(konsep.satuanKerja))}
        ${renderDetailItem('Status', statusHtml)}
        ${renderDetailItem('Koreksi Ke-', '<span class="koreksi-badge">0</span>')}
      </div>
      <div class="detail-grid__col">
        ${renderDetailItem('Pejabat Pengusul', renderValue(konsep.pejabatPengusul))}
        ${renderDetailItem('Keterangan', renderValue('Konsep'))}
        ${renderDetailItem('File Konsep PL', renderFileLink(konsep.fileKonsep))}
        ${renderDetailItem('File Nota Dinas', renderFileLink(konsep.fileNotaDinas))}
        ${renderDetailItem('Nomor Nota Dinas', konsep.nomorNotaDinas ? renderValue(konsep.nomorNotaDinas) : renderMutedDash())}
      </div>
    </div>
  `;
}

/** Tombol panah di header kartu buka/tutup isinya. */
export function wireCollapsibleCards(root) {
  root.querySelectorAll('[data-collapse-toggle]').forEach((toggle) => {
    const panel = root.querySelector(`#${toggle.getAttribute('data-collapse-toggle')}`);
    const card = toggle.closest('[data-collapsible-card]');
    const title = toggle.getAttribute('data-title');
    if (!panel) return;

    toggle.addEventListener('click', () => {
      const collapse = toggle.getAttribute('aria-expanded') === 'true';
      panel.hidden = collapse;
      toggle.setAttribute('aria-expanded', String(!collapse));
      toggle.setAttribute('aria-label', `${collapse ? 'Bentangkan' : 'Ciutkan'} ${title}`);
      toggle.classList.toggle('detail-card__toggle--collapsed', collapse);
      card?.classList.toggle('detail-card--collapsed', collapse);
    });
  });
}