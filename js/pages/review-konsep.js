// ============================================================
// MAPEL - pages/review-konsep.js
// Halaman "Detail Proposal dan Konsep Perangkat Lunak" versi Kepala
// Satker Biro TI -- dibuka dari baris konsep berstatus "Menunggu
// Persetujuan" di Monitoring Konsep PL (lihat resolveRowActionRoute di
// js/pages/monitoring.js), sesuai contoh tampilan "Detail proposal dan
// konsep kepala satker". Isinya: proposal induk yang sudah Disetujui,
// konsep yang diajukan LO, kotak Catatan Revisi, dan keputusan Revisi /
// Setuju (Kepala Satker tidak punya tombol Tolak di halaman ini).
//
// Kartu proposal & konsep memakai potongan yang sama dengan versi LO
// (js/components/proposal-konsep-detail.js). Konsep dicari di
// data/konsep.js lewat query ?id=..., proposal induknya lewat
// item.proposalId. Nomor Pengajuan & Tanggal Pengajuan kartu konsep
// sengaja tampil "-" sesuai contoh tampilan, walau item-nya sudah
// punya nomor & tanggal di tabel Monitoring. Badge status "Menunggu
// Konsep" juga teks dari contoh tampilan (bukan label bawaan status).
//
// TAHAP INI: tombol Revisi/Setuju sama kayak Review Proposal (js/pages/
// review.js): baru sebatas validasi catatan + popup + balik ke
// Monitoring Konsep, belum beneran ngubah status di data/konsep.js.
// ============================================================

import { router } from '../core/router.js';
import { konsepService } from '../../data/konsep.js';
import { proposalService } from '../../data/proposal.js';
import { showSuccessModal, showConfirmModal } from '../components/modal.js';
import {
  renderCollapsibleCard,
  renderKonsepBody,
  renderProposalBody,
  wireCollapsibleCards
} from '../components/proposal-konsep-detail.js';

const BACK_ICON = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M19 12H5m0 0 6-6m-6 6 6 6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>';

// Badge outline tanpa titik warna, teks dari contoh tampilan.
const STATUS_KONSEP_HTML = '<span class="badge badge--outline" style="--tint-text:var(--color-ink-900)">Menunggu Konsep</span>';

// File & nomor nota dinas belum di-upload/disimpan beneran, jadi nama
// filenya tetap contoh (sama kayak halaman versi LO).
const DEFAULT_FILE_KONSEP = 'konsep-pl.pdf';
const DEFAULT_FILE_NOTA_DINAS = 'nota dinas.pdf';

function getIdFromQuery() {
  return new URLSearchParams(window.location.search).get('id') || '';
}

/**
 * @param {HTMLElement} root
 * @param {Session} user
 */
export function initReviewKonsepPage(root, user) {
  if (!root) return;

  const backTarget = `/pages/${user?.role}/monitoring/konsep-pl.html`;
  const konsep = konsepService.getById(getIdFromQuery());
  const proposal = konsep?.proposalId ? proposalService.getById(konsep.proposalId) : null;

  if (!konsep || !proposal) {
    root.innerHTML = `
      <div class="detail-page">
        <p class="dashboard__subtitle">Konsep tidak ditemukan. Mungkin sudah dipindahkan atau link-nya sudah kedaluwarsa.</p>
        <button class="btn btn-ghost" type="button" id="btn-kembali">${BACK_ICON} Kembali ke Monitoring</button>
      </div>
    `;
    root.querySelector('#btn-kembali')?.addEventListener('click', () => router.navigate(backTarget));
    return;
  }

  const konsepFields = {
    judul: konsep.title,
    satuanKerja: konsep.unit,
    pejabatPengusul: konsep.createdBy,
    fileKonsep: DEFAULT_FILE_KONSEP,
    fileNotaDinas: DEFAULT_FILE_NOTA_DINAS,
    nomorNotaDinas: konsep.nomorNotaDinas
  };

  root.innerHTML = `
    <div class="detail-page">
      <div class="detail-page__intro">
        <h1 class="detail-page__title">Detail Proposal dan Konsep Perangkat Lunak</h1>
        <p class="detail-page__subtitle">Rincian proposal beserta konsep perangkat lunak yang diajukan.</p>
      </div>

      ${renderCollapsibleCard({ id: 'panel-proposal', title: 'Detail Proposal Perangkat Lunak', bodyHtml: renderProposalBody(proposal) })}
      ${renderCollapsibleCard({ id: 'panel-konsep', title: 'Konsep Perangkat Lunak', bodyHtml: renderKonsepBody(konsepFields, STATUS_KONSEP_HTML) })}

      <div class="card review-notes">
        <div class="review-notes__header">
          <h2 class="card__title">Catatan Revisi</h2>
          <span class="review-notes__required">(Silakan diisi apabila ada revisi)</span>
        </div>
        <div class="review-notes__body">
          <textarea id="catatan-revisi" class="review-notes__textarea" rows="4" aria-label="Catatan Revisi"></textarea>
          <p class="field__error" id="catatan-revisi-error" hidden>Catatan revisi wajib diisi untuk keputusan Revisi.</p>
        </div>
      </div>

      <div class="card detail-actions">
        <button class="btn btn-ghost" type="button" id="btn-kembali">${BACK_ICON} Kembali</button>
        <div class="detail-actions__right">
          <button class="btn btn-gold" type="button" id="btn-revisi">Revisi</button>
          <button class="btn btn-dark" type="button" id="btn-setuju">Setuju</button>
        </div>
      </div>
    </div>
  `;

  wireCollapsibleCards(root);
  bindActions(root, backTarget);
}

function bindActions(root, backTarget) {
  // File belum benar-benar di-upload ke mana pun, jadi link-nya sengaja
  // tidak diarahkan dulu.
  root.querySelectorAll('[data-file-link]').forEach((link) => {
    link.addEventListener('click', (e) => e.preventDefault());
  });

  root.querySelector('#btn-kembali')?.addEventListener('click', () => router.navigate(backTarget));

  const textarea = root.querySelector('#catatan-revisi');
  const errorMsg = root.querySelector('#catatan-revisi-error');

  // Catatan cuma wajib buat Revisi (kalau Setuju, boleh kosong).
  function requireCatatan() {
    const filled = Boolean(textarea?.value.trim());
    errorMsg.hidden = filled;
    if (!filled) textarea?.focus();
    return filled;
  }

  root.querySelector('#btn-revisi')?.addEventListener('click', () => {
    if (!requireCatatan()) return;
    showConfirmModal({
      title: 'Apakah anda yakin akan mengembalikan pengajuan Konsep ini?',
      message: 'Data akan dikembalikan ke LO satker.',
      cancelLabel: 'Batal',
      confirmLabel: 'Ya',
      onConfirm: () => {
        showSuccessModal({
          message: 'Data berhasil dikembalikan ke LO Satker.',
          onOk: () => router.navigate(backTarget)
        });
      }
    });
  });

  root.querySelector('#btn-setuju')?.addEventListener('click', () => {
    showConfirmModal({
      title: 'Apakah anda yakin akan mengirim Konsep?',
      message: 'Data yang dikirim tidak dapat dikembalikan.',
      cancelLabel: 'Batal',
      confirmLabel: 'Ya',
      onConfirm: () => {
        showSuccessModal({
          onOk: () => router.navigate(backTarget)
        });
      }
    });
  });
}