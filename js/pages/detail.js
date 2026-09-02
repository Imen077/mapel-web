// ============================================================
// MAPEL - pages/detail.js
// Halaman "Detail Proposal" -- dibuka setelah LO Biro TI klik
// "Simpan" (bukan "Simpan & Kirim") di form Pengajuan Proposal PL,
// nunjukkin proposal yang baru disimpan sebagai draft/Konsep.
//
// TAHAP INI: proposal.js belum benar-benar nyimpen data baru ke
// data/proposal.js (masih dummy-only, lihat TODO di
// pengajuan-proposal.js), jadi halaman ini baca data yang dioper
// lewat sessionStorage (DRAFT_HANDOFF_KEY, diisi oleh
// pengajuan-proposal.js pas tombol "Simpan" diklik) alih-alih dari
// data/proposal.js beneran. Kalau dibuka langsung tanpa lewat form
// (atau sessionStorage-nya kosong/dibersihkan), tampil data contoh
// generik supaya halamannya tidak kosong.
// ============================================================

import { router } from '../core/router.js';
import { proposalService } from '../../data/proposal.js';
import { showSuccessModal } from '../components/modal.js';

// Sengaja BUKAN lewat storage.js (yang scope-nya data entitas app
// beneran seperti daftar proposal) -- ini cuma "titipan" sesaat
// buat oper data form ke halaman berikutnya, jadi sessionStorage
// mentah secukupnya saja.
const DRAFT_HANDOFF_KEY = 'mapel_last_draft_proposal';

const BACK_ICON = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M19 12H5m0 0 6-6m-6 6 6 6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>';

/** Dipanggil dari pengajuan-proposal.js pas tombol "Simpan" diklik. */
export function saveDraftHandoff(data) {
  try {
    sessionStorage.setItem(DRAFT_HANDOFF_KEY, JSON.stringify(data));
  } catch (err) {
    console.error('[detail] Gagal nyimpen draft handoff:', err);
  }
}

function readDraftHandoff() {
  try {
    const raw = sessionStorage.getItem(DRAFT_HANDOFF_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (err) {
    console.error('[detail] Gagal baca draft handoff:', err);
    return null;
  }
}

function renderDetailItem(label, valueHtml) {
  return `
    <div class="detail-grid__item">
      <span class="detail-grid__label">${label}</span>
      ${valueHtml}
    </div>
  `;
}

/**
 * @param {HTMLElement} root
 * @param {Session} user
 */
export function initDetailPage(root, user) {
  if (!root) return;

  const draft = readDraftHandoff() ?? {
    judul: 'Proposal POS Pengujian Website',
    satuanKerja: 'Biro Teknologi Informasi',
    pejabatPengusul: user?.name || '-',
    fileProposal: 'proposal.pdf',
    fileNotaDinas: 'nota dinas.pdf'
  };

  // proposalService.getStatusMeta('draft').label sebenarnya "Proposal"
  // (draftLabel dari buildStatusMeta('Proposal') di data/proposal.js),
  // tapi desain Detail Proposal ini spesifik minta teks "Konsep" buat
  // badge status draft -- warnanya tetap dipakai dari situ biar senada.
  const statusMeta = proposalService.getStatusMeta('draft');
  const statusLabel = 'Konsep';

  root.innerHTML = `
    <div class="detail-page">
      <div class="detail-page__intro">
        <h1 class="detail-page__title">${draft.judul}</h1>
        <p class="detail-page__subtitle">Rincian data proposal yang masih berstatus konsep.</p>
      </div>

      <div class="card detail-card">
        <div class="card__header"><h2 class="card__title">Detail Proposal</h2></div>
        <div class="detail-grid">
          <div class="detail-grid__col">
            ${renderDetailItem('Judul Proposal', `<span class="detail-grid__value">${draft.judul}</span>`)}
            ${renderDetailItem('Nomor Pengajuan', `<span class="detail-grid__value detail-grid__value--muted">&mdash;</span>`)}
            ${renderDetailItem('Tanggal Pengajuan', `<span class="detail-grid__value detail-grid__value--muted">&mdash;</span>`)}
            ${renderDetailItem('Satker Pengusul', `<span class="detail-grid__value">${draft.satuanKerja}</span>`)}
            ${renderDetailItem('Status', `<span class="badge" style="background:${statusMeta.bg};color:${statusMeta.text}">${statusLabel}</span>`)}
          </div>
          <div class="detail-grid__col">
            ${renderDetailItem('Pejabat Pengusul', `<span class="detail-grid__value">${draft.pejabatPengusul}</span>`)}
            ${renderDetailItem('Keterangan', `<span class="detail-grid__value">Konsep</span>`)}
            ${renderDetailItem('File Proposal', `<a class="detail-grid__link" href="#" data-file-link>${draft.fileProposal}</a>`)}
            ${renderDetailItem('File Nota Dinas', `<a class="detail-grid__link" href="#" data-file-link>${draft.fileNotaDinas}</a>`)}
          </div>
        </div>
      </div>

      <div class="card detail-card">
        <div class="card__header"><h2 class="card__title">Catatan Revisi</h2></div>
        <div class="detail-card__body">
          <p class="detail-empty">Belum ada Catatan Revisi</p>
        </div>
      </div>

      <div class="card detail-actions">
        <button class="btn btn-ghost" type="button" id="btn-kembali">${BACK_ICON} Kembali</button>
        <div class="detail-actions__right">
          <button class="btn btn-danger" type="button" id="btn-hapus">Hapus</button>
          <button class="btn btn-gold" type="button" id="btn-ubah">Ubah</button>
          <button class="btn btn-dark" type="button" id="btn-kirim">Kirim</button>
        </div>
      </div>
    </div>
  `;

  bindActions(root);
}

function bindActions(root) {
  // File belum benar-benar di-upload ke mana pun (lihat TODO di
  // pengajuan-proposal.js), jadi link-nya sengaja tidak diarahkan
  // ke mana pun dulu.
  root.querySelectorAll('[data-file-link]').forEach((link) => {
    link.addEventListener('click', (e) => e.preventDefault());
  });

  root.querySelector('#btn-kembali')?.addEventListener('click', () => {
    router.navigate('/pages/lo-biro-ti/antrian/proposal-pl.html');
  });

  root.querySelector('#btn-hapus')?.addEventListener('click', () => {
    const confirmed = window.confirm('Hapus proposal konsep ini? Tindakan ini tidak bisa dibatalkan.');
    if (confirmed) router.navigate('/pages/lo-biro-ti/antrian/proposal-pl.html');
  });

  root.querySelector('#btn-ubah')?.addEventListener('click', () => {
    router.navigate('/pages/lo-biro-ti/pengajuan/proposal-pl.html');
  });

  root.querySelector('#btn-kirim')?.addEventListener('click', () => {
    showSuccessModal({
      message: 'Data berhasil dikirim.',
      onOk: () => router.navigate('/pages/lo-biro-ti/monitoring/proposal-pl.html')
    });
  });
}// MAPEL - placeholder
