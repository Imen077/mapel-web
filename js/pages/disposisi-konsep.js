// ============================================================
// MAPEL - pages/disposisi-konsep.js
// Halaman "Detail Proposal dan Konsep Perangkat Lunak" versi Kepala
// Biro Ortala -- dibuka dari baris konsep berstatus "Diterima" (status
// DIKIRIM) di Monitoring Konsep PL (lihat resolveRowActionRoute di
// js/pages/monitoring.js), sesuai contoh tampilan "Detail Proposal dan
// Konsep kepala Biro". Isinya: proposal induk yang sudah Disetujui
// (kartu biasa, tanpa tombol lipat), konsep yang diterima (bisa
// dilipat), kartu "Riwayat Disposisi", dan tombol Disposisi.
//
// Kartu proposal & konsep memakai potongan yang sama dengan versi LO
// dan Kepala Satker (js/components/proposal-konsep-detail.js). Konsep
// dicari di data/konsep.js lewat query ?id=..., proposal induknya lewat
// item.proposalId. Badge status ikut item.tableStatusOverride
// ("Diterima", hijau) biar sama dengan badge di tabel.
//
// TAHAP INI: Riwayat Disposisi masih selalu kosong (belum ada data
// disposisi konsep). Tombol "Disposisi" sekarang navigate ke halaman
// "Disposisi Konsep PL" (js/pages/disposisi-tujuan-konsep.js) buat
// milih pejabat tujuan berikutnya -- beda dari Proposal PL yang
// bukanya lewat modal (js/pages/disposisi.js), di sini full-page.
// ============================================================

import { router } from '../core/router.js';
import { konsepService } from '../../data/konsep.js';
import { proposalService } from '../../data/proposal.js';
import { formatDateTimeFullID } from '../core/format.js';
import {
  renderBadge,
  renderCollapsibleCard,
  renderKonsepBody,
  renderProposalBody,
  wireCollapsibleCards
} from '../components/proposal-konsep-detail.js';

const BACK_ICON = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M19 12H5m0 0 6-6m-6 6 6 6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const CLIPBOARD_ICON = '<svg width="22" height="22" viewBox="0 0 24 24" fill="none"><rect x="5.5" y="4.5" width="13" height="16" rx="2" stroke="currentColor" stroke-width="1.6"/><path d="M9 4.5V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v.5M9 10h6M9 13.5h6M9 17h3.5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>';

// File belum di-upload/disimpan beneran, jadi nama file tetap contoh
// (sama kayak halaman versi LO & Kepala Satker).
const DEFAULT_FILE_KONSEP = 'konsep-pl.pdf';
const DEFAULT_FILE_NOTA_DINAS = 'nota dinas.pdf';

function getIdFromQuery() {
  return new URLSearchParams(window.location.search).get('id') || '';
}

/** Kartu "Riwayat Disposisi" -- belum ada data, jadi cuma header tabel + tampilan kosong. */
function renderRiwayatDisposisiCard() {
  return `
    <div class="card detail-card">
      <div class="card__header"><h2 class="card__title">Riwayat Disposisi</h2></div>
      <div class="detail-card__table">
        <div class="data-table-wrap">
          <table class="data-table">
            <thead>
              <tr>
                <th>Tanggal &amp; Waktu</th>
                <th>Dari</th>
                <th>Kepada</th>
                <th>Catatan Disposisi</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colspan="4">
                  <div class="detail-empty-state">
                    <span class="detail-empty-state__icon">${CLIPBOARD_ICON}</span>
                    <p class="detail-empty-state__text">Belum ada riwayat disposisi</p>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;
}

/**
 * @param {HTMLElement} root
 * @param {Session} user
 */
export function initDisposisiKonsepPage(root, user) {
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

  const statusMeta = { ...konsepService.getStatusMeta(konsep.status), ...(konsep.tableStatusOverride || {}) };
  const konsepFields = {
    judul: konsep.title,
    satuanKerja: konsep.unit,
    pejabatPengusul: konsep.createdBy,
    fileKonsep: DEFAULT_FILE_KONSEP,
    fileNotaDinas: DEFAULT_FILE_NOTA_DINAS,
    nomorNotaDinas: konsep.nomorNotaDinas,
    nomorPengajuan: konsep.nomorPengajuan,
    tanggalPengajuan: formatDateTimeFullID(konsep.createdAt)
  };

  root.innerHTML = `
    <div class="detail-page">
      <div class="detail-page__intro">
        <h1 class="detail-page__title">Detail Proposal dan Konsep Perangkat Lunak</h1>
        <p class="detail-page__subtitle">Rincian proposal beserta konsep perangkat lunak yang diajukan.</p>
      </div>

      ${renderCollapsibleCard({ id: 'panel-proposal', title: 'Detail Proposal Perangkat Lunak', bodyHtml: renderProposalBody(proposal), collapsible: false })}
      ${renderCollapsibleCard({ id: 'panel-konsep', title: 'Konsep Perangkat Lunak', bodyHtml: renderKonsepBody(konsepFields, renderBadge(statusMeta, statusMeta.label)) })}
      ${renderRiwayatDisposisiCard()}

      <div class="card detail-actions">
        <button class="btn btn-ghost" type="button" id="btn-kembali">${BACK_ICON} Kembali</button>
        <div class="detail-actions__right">
          <button class="btn btn-dark" type="button" id="btn-disposisi">Disposisi</button>
        </div>
      </div>
    </div>
  `;

  wireCollapsibleCards(root);

  // File belum benar-benar di-upload ke mana pun, jadi link-nya sengaja
  // tidak diarahkan dulu.
  root.querySelectorAll('[data-file-link]').forEach((link) => {
    link.addEventListener('click', (e) => e.preventDefault());
  });

  root.querySelector('#btn-kembali')?.addEventListener('click', () => router.navigate(backTarget));

  // "Disposisi" -> halaman "Disposisi Konsep PL" (js/pages/
  // disposisi-tujuan-konsep.js), tempat pilih pejabat tujuan
  // berikutnya. Beda dari Proposal PL yang bukanya lewat modal --
  // di sini tetap full-page navigate, sesuai contoh tampilan yang
  // dikasih ("Disposisi Kepala Biro").
  root.querySelector('#btn-disposisi')?.addEventListener('click', () => {
    router.navigate(`/pages/${user?.role}/monitoring/disposisi-tujuan-konsep.html?id=${encodeURIComponent(konsep.id)}`);
  });
}