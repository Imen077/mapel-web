// ============================================================
// MAPEL - pages/detail-proposal-konsep.js
// Halaman "Detail Proposal dan Konsep Perangkat Lunak" -- dibuka
// setelah LO Biro TI klik "Simpan" (bukan "Simpan & Kirim") di form
// Pengajuan Konsep PL (js/pages/pengajuan-konsep.js), sesuai contoh
// tampilan "Ketika klik simpan". Isinya: proposal induk yang sudah
// Disetujui, konsep yang baru disimpan (status Konsep / draft),
// Catatan Revisi, dan tombol Hapus / Ubah / Kirim.
//
// Kartu proposal dibaca dari data/konsep.js (dummy KL-2026-050, id-nya
// dibawa lewat query ?proposalId=...). Kartu konsep dibaca dari data
// yang dititipkan form lewat sessionStorage (DRAFT_HANDOFF_KEY),
// karena konsep baru belum benar-benar disimpan ke data/konsep.js
// (lihat TODO di pengajuan-konsep.js) -- pola yang sama kayak
// js/pages/detail.js buat Detail Proposal draft. Isian form yang
// dikosongkan otomatis diganti nilai contoh dari desain (DEFAULT_DRAFT),
// jadi halaman ini tetap utuh walau form-nya disimpan tanpa diisi atau
// halamannya dibuka langsung.
//
// Kartu "Catatan Revisi" masih dummy statis (DUMMY_CATATAN_REVISI),
// belum ada data catatan beneran. Tombol "Ubah" SENGAJA belum
// diarahkan ke mana pun -- belum ada halaman Ubah Konsep PL.
// ============================================================

import { router } from '../core/router.js';
import { konsepService } from '../../data/konsep.js';
import { formatDateTimeFullID } from '../core/format.js';
import { showSuccessModal, showConfirmModal } from '../components/modal.js';

// Sengaja BUKAN lewat storage.js (scope-nya data entitas app beneran)
// -- ini cuma "titipan" sesaat buat oper data form ke halaman ini.
const DRAFT_HANDOFF_KEY = 'mapel_last_draft_konsep';

// Satu-satunya dummy "proposal yang sudah disetujui" saat ini.
const DEFAULT_PROPOSAL_ID = 'KL-2026-050';

const DETAIL_PROPOSAL_PATH = '/pages/lo-biro-ti/monitoring/detail-konsep.html';
const MONITORING_KONSEP_PATH = '/pages/lo-biro-ti/monitoring/konsep-pl.html';

const DEFAULT_DRAFT = {
  judul: 'POS Pengujian Website',
  satuanKerja: 'Biro Teknologi Informasi',
  fileKonsep: 'konsep-pl.pdf',
  fileNotaDinas: 'nota dinas.pdf',
  nomorNotaDinas: '1532/ND/X.5/06/2026'
};

const DUMMY_CATATAN_REVISI = [
  {
    nama: 'Agustina Ratna Puspitasari',
    peran: 'Kepala Biro',
    tanggal: '2026-08-06T13:52:05',
    isi: 'Revisi telah dilakukan sesuai catatan, ..............sudah ditambahkan pada dokumen konsep terbaru.'
  }
];

const BACK_ICON = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M19 12H5m0 0 6-6m-6 6 6 6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const CHEVRON_UP_ICON = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="m6 15 6-6 6 6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>';

/** Dipanggil dari pengajuan-konsep.js pas tombol "Simpan" diklik. */
export function saveKonsepDraftHandoff(data) {
  try {
    sessionStorage.setItem(DRAFT_HANDOFF_KEY, JSON.stringify(data));
  } catch (err) {
    console.error('[detail-proposal-konsep] Gagal nyimpen draft handoff:', err);
  }
}

/** Isian yang kosong dibuang, supaya nilai contoh di DEFAULT_DRAFT yang dipakai. */
function readKonsepDraftHandoff() {
  try {
    const raw = sessionStorage.getItem(DRAFT_HANDOFF_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    return Object.fromEntries(Object.entries(parsed).filter(([, value]) => typeof value === 'string' && value.trim()));
  } catch (err) {
    console.error('[detail-proposal-konsep] Gagal baca draft handoff:', err);
    return {};
  }
}

function clearKonsepDraftHandoff() {
  try {
    sessionStorage.removeItem(DRAFT_HANDOFF_KEY);
  } catch (err) {
    console.error('[detail-proposal-konsep] Gagal hapus draft handoff:', err);
  }
}

/** Teks dari form (isian user) dimasukkan ke innerHTML, jadi wajib di-escape dulu. */
function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[ch]);
}

function getProposalIdFromQuery() {
  return new URLSearchParams(window.location.search).get('proposalId') || '';
}

function renderDetailItem(label, valueHtml) {
  return `
    <div class="detail-grid__item">
      <span class="detail-grid__label">${label}</span>
      ${valueHtml}
    </div>
  `;
}

function renderValue(text) {
  return `<span class="detail-grid__value">${escapeHtml(text)}</span>`;
}

function renderMutedDash() {
  return '<span class="detail-grid__value detail-grid__value--muted">&mdash;</span>';
}

function renderFileLink(name) {
  return `<a class="detail-grid__link" href="#" data-file-link>${escapeHtml(name)}</a>`;
}

function renderBadge(meta, label) {
  return `<span class="badge" style="background:${meta.bg};color:${meta.text}">${escapeHtml(label)}</span>`;
}

/** Kartu yang bisa dilipat lewat tombol panah di pojok kanan header. */
function renderCollapsibleCard({ id, title, bodyHtml }) {
  return `
    <div class="card detail-card" data-collapsible-card>
      <div class="card__header">
        <h2 class="card__title">${title}</h2>
        <button
          class="detail-card__toggle"
          type="button"
          aria-expanded="true"
          aria-controls="${id}"
          aria-label="Ciutkan ${title}"
          data-collapse-toggle="${id}"
          data-title="${title}"
        >${CHEVRON_UP_ICON}</button>
      </div>
      <div id="${id}">${bodyHtml}</div>
    </div>
  `;
}

function renderProposalBody(item) {
  const meta = { ...konsepService.getStatusMeta(item.status), ...(item.tableStatusOverride || {}) };
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

function renderKonsepBody(draft) {
  // Label "Konsep" dan warnanya dari katalog status konsep (status draft).
  const meta = konsepService.getStatusMeta('draft');
  return `
    <div class="detail-grid">
      <div class="detail-grid__col">
        ${renderDetailItem('Judul Konsep PL', renderValue(draft.judul))}
        ${renderDetailItem('Nomor Pengajuan', renderMutedDash())}
        ${renderDetailItem('Tanggal Pengajuan', renderMutedDash())}
        ${renderDetailItem('Satker Pengusul', renderValue(draft.satuanKerja))}
        ${renderDetailItem('Status', renderBadge(meta, 'Konsep'))}
        ${renderDetailItem('Koreksi Ke-', '<span class="koreksi-badge">0</span>')}
      </div>
      <div class="detail-grid__col">
        ${renderDetailItem('Pejabat Pengusul', renderValue(draft.pejabatPengusul))}
        ${renderDetailItem('Keterangan', renderValue('Konsep'))}
        ${renderDetailItem('File Konsep PL', renderFileLink(draft.fileKonsep))}
        ${renderDetailItem('File Nota Dinas', renderFileLink(draft.fileNotaDinas))}
        ${renderDetailItem('Nomor Nota Dinas', renderValue(draft.nomorNotaDinas))}
      </div>
    </div>
  `;
}

/** "Kamis, 06 Agustus 2026 · 13:52:05" -- format tanggal + jam sesuai desain Catatan Revisi. */
function formatCatatanTimestamp(iso) {
  return formatDateTimeFullID(iso).replace(/ (\d{2}:\d{2}:\d{2})$/, ' · $1');
}

function renderCatatanRevisiCard() {
  const notes = DUMMY_CATATAN_REVISI.map(
    (note) => `
      <div class="detail-note">
        <div class="detail-note__head">
          <div class="detail-note__who">
            <span class="detail-note__name">${escapeHtml(note.nama)}</span>
            <span class="detail-note__role">${escapeHtml(note.peran)}</span>
          </div>
          <span class="detail-note__time">${formatCatatanTimestamp(note.tanggal)}</span>
        </div>
        <p class="detail-note__text">${escapeHtml(note.isi)}</p>
      </div>
    `
  ).join('');

  return `
    <div class="card detail-card">
      <div class="card__header"><h2 class="card__title">Catatan Revisi</h2></div>
      <div class="detail-card__body">${notes}</div>
    </div>
  `;
}

/**
 * @param {HTMLElement} root
 * @param {Session} user
 */
export function initDetailProposalKonsepPage(root, user) {
  if (!root) return;

  const proposalId = getProposalIdFromQuery() || DEFAULT_PROPOSAL_ID;
  const proposal = konsepService.getById(proposalId);
  const backTarget = `${DETAIL_PROPOSAL_PATH}?id=${encodeURIComponent(proposalId)}`;

  if (!proposal) {
    root.innerHTML = `
      <div class="detail-page">
        <p class="dashboard__subtitle">Proposal tidak ditemukan. Mungkin sudah dipindahkan atau link-nya sudah kedaluwarsa.</p>
        <button class="btn btn-ghost" type="button" id="btn-kembali">${BACK_ICON} Kembali ke Monitoring</button>
      </div>
    `;
    root.querySelector('#btn-kembali')?.addEventListener('click', () => router.navigate(MONITORING_KONSEP_PATH));
    return;
  }

  const draft = {
    ...DEFAULT_DRAFT,
    pejabatPengusul: user?.name || '-',
    ...readKonsepDraftHandoff()
  };

  root.innerHTML = `
    <div class="detail-page">
      <div class="detail-page__intro">
        <h1 class="detail-page__title">Detail Proposal dan Konsep Perangkat Lunak</h1>
        <p class="detail-page__subtitle">Rincian proposal beserta konsep perangkat lunak yang diajukan.</p>
      </div>

      ${renderCollapsibleCard({ id: 'panel-proposal', title: 'Detail Proposal Perangkat Lunak', bodyHtml: renderProposalBody(proposal) })}
      ${renderCollapsibleCard({ id: 'panel-konsep', title: 'Konsep Perangkat Lunak', bodyHtml: renderKonsepBody(draft) })}
      ${renderCatatanRevisiCard()}

      <div class="card detail-actions">
        <button class="btn btn-ghost" type="button" id="btn-kembali">${BACK_ICON} Kembali</button>
        <div class="detail-actions__right">
          <button class="btn btn-danger" type="button" id="btn-hapus">Hapus</button>
          <button class="btn btn-gold" type="button" id="btn-ubah">Ubah</button>
          <button class="btn btn-success" type="button" id="btn-kirim">Kirim</button>
        </div>
      </div>
    </div>
  `;

  bindCollapsibleCards(root);
  bindActions(root, { draft, backTarget });
}

/** Tombol panah di header kartu buka/tutup isinya. */
function bindCollapsibleCards(root) {
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

function bindActions(root, { draft, backTarget }) {
  // File belum benar-benar di-upload ke mana pun (lihat TODO di
  // pengajuan-konsep.js), jadi link-nya sengaja tidak diarahkan dulu.
  root.querySelectorAll('[data-file-link]').forEach((link) => {
    link.addEventListener('click', (e) => e.preventDefault());
  });

  root.querySelector('#btn-kembali')?.addEventListener('click', () => router.navigate(backTarget));

  root.querySelector('#btn-hapus')?.addEventListener('click', () => {
    showConfirmModal({
      title: 'Hapus Konsep',
      subject: draft.judul,
      message: 'Apakah anda yakin?',
      confirmLabel: 'Ya, hapus',
      onConfirm: () => {
        clearKonsepDraftHandoff();
        router.navigate(backTarget);
      }
    });
  });

  // "Ubah" SENGAJA belum diarahkan ke mana pun -- belum ada halaman
  // Ubah Konsep PL yang bisa dituju (lihat header file).

  root.querySelector('#btn-kirim')?.addEventListener('click', () => {
    showSuccessModal({
      message: 'Data berhasil dikirim.',
      onOk: () => {
        clearKonsepDraftHandoff();
        router.navigate(MONITORING_KONSEP_PATH);
      }
    });
  });
}