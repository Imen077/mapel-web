// ============================================================
// MAPEL - pages/disposisi-konsep.js
// Halaman "Detail Proposal dan Konsep Perangkat Lunak", dipakai
// bareng lewat beberapa pageKey (js/core/app.js) buat 4 skenario
// (lihat resolveRowActionRoute di js/pages/monitoring.js):
//   - Kepala Biro Ortala, status "Diterima" (DIKIRIM) -> tanpa kartu
//     tambahan, tombol "Disposisi" full-page ke js/pages/
//     disposisi-tujuan-konsep.js.
//   - Kepala Bagian Ortala, status "Disposisi" (PROSES_REVIU) -> kartu
//     "Riwayat Disposisi", tombol "Disposisi" -> placeholder kosong.
//   - Kepala Subbagian Ortala, status "Disposisi" (PROSES_REVIU) ->
//     kartu pratinjau dokumen (bukan Riwayat Disposisi), tombol
//     "Disposisi" buka modal 6 pereviu (js/pages/disposisi-tujuan.js).
//   - Kepala Subbagian Ortala, status "Selesai Reviu" (SELESAI_REVIU,
//     KL-2026-040) -> kartu "Riwayat Disposisi" + "Hasil Reviu", tombol
//     berlabel "Reviu" (bukan "Disposisi"), langsung navigate ke
//     checklist Reviu Konsep PL (masih placeholder kosong), sesuai
//     contoh tampilan "Detail Proposal dan Konsep PL - Kepala
//     SubBagian". Polanya niru punya Proposal PL (js/pages/
//     disposisi.js), lihat isKasubbagSelesaiReviu di bawah.
//
// Kartu proposal & konsep memakai potongan yang sama dengan versi LO
// dan Kepala Satker (js/components/proposal-konsep-detail.js). Konsep
// dicari di data/konsep.js lewat query ?id=..., proposal induknya lewat
// item.proposalId. Badge status ikut item.tableStatusOverride.
// ============================================================

import { router } from '../core/router.js';
import { konsepService } from '../../data/konsep.js';
import { proposalService } from '../../data/proposal.js';
import { SUBMISSION_STATUS } from '../../data/status.js';
import { formatDateTimeFullID } from '../core/format.js';
import { ROLES } from '../core/role.js';
import { openDisposisiTujuanModal } from './disposisi-tujuan.js';
import {
  renderBadge,
  renderCollapsibleCard,
  renderKonsepBody,
  renderProposalBody,
  wireCollapsibleCards
} from '../components/proposal-konsep-detail.js';

const BACK_ICON = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M19 12H5m0 0 6-6m-6 6 6 6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const CLIPBOARD_ICON = '<svg width="22" height="22" viewBox="0 0 24 24" fill="none"><rect x="5.5" y="4.5" width="13" height="16" rx="2" stroke="currentColor" stroke-width="1.6"/><path d="M9 4.5V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v.5M9 10h6M9 13.5h6M9 17h3.5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>';
const EYE_ICON = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/><circle cx="12" cy="12" r="2.8" stroke="currentColor" stroke-width="1.6"/></svg>';

// File belum di-upload/disimpan beneran, jadi nama file tetap contoh
// (sama kayak halaman versi LO & Kepala Satker).
const DEFAULT_FILE_KONSEP = 'konsep-pl.pdf';
const DEFAULT_FILE_NOTA_DINAS = 'nota dinas.pdf';

function getIdFromQuery() {
  return new URLSearchParams(window.location.search).get('id') || '';
}

/**
 * Kartu "Riwayat Disposisi". Kalau item belum punya riwayat (lihat
 * field `riwayatDisposisi` di data/konsep.js), tampil empty state
 * seperti sebelumnya -- begitu ada datanya (mis. KL-2026-038, sesuai
 * contoh tampilan Kepala Bagian Ortala), dirender jadi baris tabel
 * beneran. Pola & class CSS-nya (data-table__title/__code) sama
 * persis dengan versi Proposal PL (js/pages/disposisi.js), biar
 * konsisten.
 * @param {Object[]} [entries]
 */
function renderRiwayatDisposisiCard(entries = []) {
  const body = entries.length
    ? entries
        .map(
          (row) => `
            <tr>
              <td><span class="data-table__title">${formatDateTimeFullID(row.waktu)}</span></td>
              <td>
                <span class="data-table__title">${row.dariNama}</span>
                <span class="data-table__code">${row.dariJabatan}</span>
              </td>
              <td>
                <span class="data-table__title">${row.kepadaNama}</span>
                <span class="data-table__code">${row.kepadaJabatan}</span>
              </td>
              <td>${row.catatan}</td>
            </tr>
          `
        )
        .join('')
    : `
        <tr>
          <td colspan="4">
            <div class="detail-empty-state">
              <span class="detail-empty-state__icon">${CLIPBOARD_ICON}</span>
              <p class="detail-empty-state__text">Belum ada riwayat disposisi</p>
            </div>
          </td>
        </tr>
      `;

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
            <tbody>${body}</tbody>
          </table>
        </div>
      </div>
    </div>
  `;
}

/**
 * Kartu "Hasil Reviu" -- CUMA buat Kepala Subbagian Ortala pas status
 * SELESAI_REVIU (lihat field `hasilReviu` di data/konsep.js, mis.
 * KL-2026-040), ringkasan hasil kerja Previu sebelum Kasubbag
 * neruskan lagi ke atas. Polanya sama kayak renderHasilReviuCard di
 * js/pages/disposisi.js (versi Proposal PL), bedanya kolom "Nama
 * Konsep" (bukan "Nama PL") dan tombol Aksi cuma ikon mata (bukan
 * tombol teks "Lihat Reviu"), sesuai contoh tampilan "Detail Proposal
 * dan Konsep PL - Kepala SubBagian". Klik nama konsep ATAU ikon mata
 * sama-sama buka halaman checklist Reviu Konsep PL yang sama.
 * @param {Object[]} entries
 * @param {string} namaKonsep
 * @param {string} reviuRoute
 */
function renderHasilReviuCard(entries, namaKonsep, reviuRoute) {
  const rows = entries
    .map(
      (row, i) => `
            <tr>
              <td>${i + 1}.</td>
              <td>
                <span class="data-table__title data-table__title--clickable" data-aksi-route="${reviuRoute}" role="button" tabindex="0">${namaKonsep}</span>
              </td>
              <td>${formatDateTimeFullID(row.tanggalReviu)}</td>
              <td>${row.hasilReviu}</td>
              <td>${row.kesimpulan}</td>
              <td><button class="btn btn-dark btn-icon" type="button" data-aksi-route="${reviuRoute}" aria-label="Lihat Reviu">${EYE_ICON}</button></td>
            </tr>
          `
    )
    .join('');

  return `
    <table class="data-table">
      <thead>
        <tr>
          <th>No</th>
          <th>Nama Konsep</th>
          <th>Tanggal Reviu</th>
          <th>Hasil Reviu</th>
          <th>Kesimpulan</th>
          <th>Aksi</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
  `;
}

// Kartu pratinjau dokumen ("Detail Proposal dan Konsep Kasubbag") --
// SAMA POLA-nya kayak renderDocPreview di js/pages/disposisi.js &
// js/pages/review.js (nggak diexport dari sana, jadi disalin di sini),
// tapi cuma dipakai buat Kepala Subbagian Ortala (lihat showFilePreview
// di initDisposisiKonsepPage di bawah).
const DOC_ICON = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M13 3.5H7a1 1 0 0 0-1 1v15a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V8.5L13 3.5Z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/><path d="M12.5 3.5V8h4.5" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/></svg>';

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

/** 2 kartu pratinjau (File Proposal + File Nota Dinas) punya PROPOSAL induk (bukan konsep). */
function renderDocPreviewGrid(proposal) {
  return `
    <div class="review-preview-grid">
      ${renderDocPreview({
        headerTitle: 'Pedoman - PL_Proposal.pdf',
        headerSubtitle: 'File Proposal &middot; Pratinjau dokumen',
        docTitle: proposal.title
      })}
      ${renderDocPreview({
        headerTitle: 'Pedoman - PL_ND.pdf',
        headerSubtitle: 'File Nota Dinas &middot; Pratinjau dokumen',
        docTitle: `Nota Dinas Pengajuan Proposal ${proposal.nomorPengajuan || proposal.id}`
      })}
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

  // Kepala Subbagian Ortala: kartu pratinjau dokumen di paling bawah
  // (sesuai contoh tampilan "Detail Proposal dan Konsep Kasubbag"),
  // dan tombol "Disposisi" buka modal 6 pereviu yang sama kayak
  // dipakai buat Proposal PL (js/pages/disposisi-tujuan.js), BUKAN
  // halaman "Disposisi Konsep PL" penuh punya Kabag/Kabiro di bawah --
  // modul itu belum ngerti daftar pereviu Kasubbagian. TAPI kalau
  // statusnya udah SELESAI_REVIU (KL-2026-040), itu skenario BEDA --
  // sama kayak Proposal PL (js/pages/disposisi.js): bukan pratinjau
  // dokumen, tapi kartu "Hasil Reviu" + tombol "Reviu" (bukan
  // "Disposisi"), sesuai contoh tampilan "Detail Proposal dan Konsep
  // PL - Kepala SubBagian".
  const isKasubbag = user?.role === ROLES.KEPALA_SUBBAGIAN_ORTALA;
  const isKasubbagSelesaiReviu = isKasubbag && konsep.status === SUBMISSION_STATUS.SELESAI_REVIU;
  const showFilePreview = isKasubbag && !isKasubbagSelesaiReviu;
  const actionLabel = isKasubbagSelesaiReviu ? 'Reviu' : 'Disposisi';
  // Belum ada halaman checklist Reviu Konsep PL beneran (analog
  // js/pages/review-proposal.js buat Proposal PL) -- link ini masih
  // ngarah ke placeholder kosong dulu (belum didaftarkan di
  // PAGE_MODULES, js/core/app.js), nyusul begitu form-nya digarap.
  const reviuRoute = `/pages/${user?.role}/monitoring/reviu-konsep-pl.html?id=${encodeURIComponent(konsep.id)}`;

  root.innerHTML = `
    <div class="detail-page">
      <div class="detail-page__intro">
        <h1 class="detail-page__title">Detail Proposal dan Konsep Perangkat Lunak</h1>
        <p class="detail-page__subtitle">Rincian proposal beserta konsep perangkat lunak yang diajukan.</p>
      </div>

      ${renderCollapsibleCard({ id: 'panel-proposal', title: 'Detail Proposal Perangkat Lunak', bodyHtml: renderProposalBody(proposal), collapsible: false })}
      ${renderCollapsibleCard({ id: 'panel-konsep', title: 'Konsep Perangkat Lunak', bodyHtml: renderKonsepBody(konsepFields, renderBadge(statusMeta, statusMeta.label)) })}
      ${renderRiwayatDisposisiCard(konsep.riwayatDisposisi)}

      ${showFilePreview ? renderDocPreviewGrid(proposal) : ''}
      ${isKasubbagSelesaiReviu && konsep.hasilReviu?.length ? renderCollapsibleCard({ id: 'panel-hasil-reviu', title: 'Hasil Reviu', bodyHtml: renderHasilReviuCard(konsep.hasilReviu, konsep.title, reviuRoute) }) : ''}

      <div class="card detail-actions">
        <button class="btn btn-ghost" type="button" id="btn-kembali">${BACK_ICON} Kembali</button>
        <div class="detail-actions__right">
          <button class="btn btn-dark" type="button" id="btn-disposisi">${actionLabel}</button>
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

  // Kartu "Hasil Reviu" -- klik nama konsep ATAU ikon mata sama-sama
  // buka halaman checklist Reviu Konsep PL (masih placeholder kosong,
  // lihat komentar reviuRoute di atas).
  root.querySelectorAll('[data-aksi-route]').forEach((el) => {
    const go = () => router.navigate(el.getAttribute('data-aksi-route'));
    el.addEventListener('click', go);
    el.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        go();
      }
    });
  });

  // "Disposisi"/"Reviu" (lihat actionLabel di atas):
  // - Kepala Subbagian Ortala, status SELESAI_REVIU -> label "Reviu",
  //   langsung navigate ke reviuRoute (bukan modal), sama kayak pola
  //   Proposal PL punya Kasubbag di js/pages/disposisi.js.
  // - Kepala Subbagian Ortala, status lain -> modal 6 pereviu (sama
  //   kayak Proposal PL punya Kasubbag), pakai data PROPOSAL induk
  //   biar nomor nota dinas & nomor pengajuannya konsisten sama kartu
  //   "Detail Proposal Perangkat Lunak" di atas. Sukses -> balik ke
  //   Monitoring Konsep PL (bukan Monitoring Proposal PL, beda dari
  //   modal versi Proposal PL).
  // - Kabag/Kabiro -> tetap halaman "Disposisi Konsep PL" penuh
  //   (js/pages/disposisi-tujuan-konsep.js), sesuai contoh tampilan
  //   "Disposisi Kepala Biro".
  root.querySelector('#btn-disposisi')?.addEventListener('click', () => {
    if (isKasubbagSelesaiReviu) {
      router.navigate(reviuRoute);
      return;
    }
    if (isKasubbag) {
      // Judul modal & baris pertama sengaja bilang \"Konsep\" (bukan
      // \"Proposal\"), pakai judul KONSEP (konsep.title, \"POS Pengujian
      // Website\") -- sisanya (Tanggal Pengajuan, Nomor Pengajuan, Nomor
      // Nota Dinas, daftar pereviu) tetap dari PROPOSAL induk (`proposal`)
      // apa adanya, sesuai contoh tampilan \"Disposisi Konsep PL\".
      openDisposisiTujuanModal(proposal, user, {
        modalTitle: 'Disposisi Konsep PL',
        judulLabel: 'Judul Konsep',
        judulValue: konsep.title,
        onDisposed: () => router.navigate(backTarget)
      });
      return;
    }
    router.navigate(`/pages/${user?.role}/monitoring/disposisi-tujuan-konsep.html?id=${encodeURIComponent(konsep.id)}`);
  });
}