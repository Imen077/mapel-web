// ============================================================
// MAPEL - pages/detail-proposal-konsep.js
// Halaman "Detail Proposal dan Konsep Perangkat Lunak" -- dibuka
// setelah LO Biro TI klik "Simpan" (bukan "Simpan & Kirim") di form
// Pengajuan Konsep PL (js/pages/pengajuan-konsep.js), sesuai contoh
// tampilan "Ketika klik simpan". Isinya: proposal induk yang sudah
// Disetujui, konsep yang baru disimpan (status Konsep / draft),
// Catatan Revisi, dan tombol Hapus / Ubah / Kirim.
//
// Kartu proposal dibaca dari data/proposal.js (dummy PO-2026-048, id-nya
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
import { proposalService } from '../../data/proposal.js';
import { konsepService } from '../../data/konsep.js';
import { formatDateTimeFullID } from '../core/format.js';
import { showSuccessModal, showConfirmModal } from '../components/modal.js';
import {
  escapeHtml,
  renderBadge,
  renderCollapsibleCard,
  renderKonsepBody,
  renderProposalBody,
  wireCollapsibleCards
} from '../components/proposal-konsep-detail.js';

// Sengaja BUKAN lewat storage.js (scope-nya data entitas app beneran)
// -- ini cuma "titipan" sesaat buat oper data form ke halaman ini.
const DRAFT_HANDOFF_KEY = 'mapel_last_draft_konsep';

// Satu-satunya dummy "proposal yang sudah disetujui" saat ini.
const DEFAULT_PROPOSAL_ID = 'PO-2026-048';

const DETAIL_PROPOSAL_PATH = '/pages/lo-biro-ti/monitoring/detail-konsep.html';
const MONITORING_PROPOSAL_PATH = '/pages/lo-biro-ti/monitoring/proposal-pl.html';
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

function getProposalIdFromQuery() {
  return new URLSearchParams(window.location.search).get('proposalId') || '';
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
  const proposal = proposalService.getById(proposalId);
  const backTarget = `${DETAIL_PROPOSAL_PATH}?id=${encodeURIComponent(proposalId)}`;

  if (!proposal) {
    root.innerHTML = `
      <div class="detail-page">
        <p class="dashboard__subtitle">Proposal tidak ditemukan. Mungkin sudah dipindahkan atau link-nya sudah kedaluwarsa.</p>
        <button class="btn btn-ghost" type="button" id="btn-kembali">${BACK_ICON} Kembali ke Monitoring</button>
      </div>
    `;
    root.querySelector('#btn-kembali')?.addEventListener('click', () => router.navigate(MONITORING_PROPOSAL_PATH));
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
      ${renderCollapsibleCard({ id: 'panel-konsep', title: 'Konsep Perangkat Lunak', bodyHtml: renderKonsepBody(draft, renderBadge(konsepService.getStatusMeta('draft'), 'Konsep')) })}
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

  wireCollapsibleCards(root);
  bindActions(root, { draft, backTarget });
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