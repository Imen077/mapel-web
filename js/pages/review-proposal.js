// ============================================================
// MAPEL - pages/reviu-proposal.js
// "Reviu Proposal" -- halaman form reviu buat Previu Biro Ortala
// (ujung rantai disposisi, lihat DISPOSISI_CHAIN/REVIU_CHAIN di
// js/core/role.js), dibuka lewat tombol "Reviu" di halaman Detail
// Proposal (js/pages/disposisi.js). Beda dari Kabiro/Kabag/Kasubbag
// yang cuma NERUSIN proposal (disposisi.js + disposisi-tujuan.js),
// di sini Previu BENERAN ngerjain reviu-nya: catat langkah-langkah
// checklist reviu, lalu kesimpulan & catatan akhir.
//
// Checklist-nya PUNYA 2 tampilan, tergantung ada/tidaknya
// item.checklistReviu di data (lihat data/proposal.js):
//   - Kosong -> empty state "Belum ada checklist reviu" (cuma tombol
//     "+ Tambah Reviu", belum ngisi apa-apa).
//   - Ada isinya -> tabel checklist penuh (Download Checklist, Filter,
//     tiap baris ada input Hasil Reviu + toggle Template Jawaban +
//     Check), plus Nota Dinas Penyampaian, Catatan Hasil Reviu,
//     Kesimpulan, dan Catatan untuk Pereviu (riwayat catatan orang
//     lain, collapsible).
//
// TAHAP INI: checkbox/Template Jawaban/upload file/textarea semua
// interaktif di sisi tampilan (state di memori, ilang kalau halaman
// di-reload), tapi tombol "Kirim Reviu" & pagination "1"/"2" belum
// beneran nyimpen/pindah data -- baru popup konfirmasi generik,
// nunggu workflow engine beneran digarap.
// ============================================================

import { router } from '../core/router.js';
import { proposalService } from '../../data/proposal.js';
import { formatDateTimeFullID } from '../core/format.js';
import { showConfirmModal, showSuccessModal } from '../components/modal.js';

const CALENDAR_ICON = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><rect x="4" y="5.5" width="16" height="14.5" rx="1.5" stroke="currentColor" stroke-width="1.6"/><path d="M4 9.5h16M8 3.5v3.5M16 3.5v3.5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>';
const CHECK_ICON = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.6"/><path d="m8 12.5 2.5 2.5L16 9.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const CHECK_SMALL_ICON = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="m5 12.5 4.5 4.5L19 7" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const PENCIL_ICON = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M4 20l1-4.2L15.8 5a1.5 1.5 0 0 1 2.1 0l1.1 1.1a1.5 1.5 0 0 1 0 2.1L8.2 19 4 20Z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/></svg>';
const CLIPBOARD_ICON = '<svg width="28" height="28" viewBox="0 0 24 24" fill="none"><rect x="5" y="4.5" width="14" height="16" rx="1.5" stroke="currentColor" stroke-width="1.6"/><path d="M9 4.5V3.8a1.3 1.3 0 0 1 1.3-1.3h3.4A1.3 1.3 0 0 1 15 3.8v.7" stroke="currentColor" stroke-width="1.6"/><path d="M8.5 11h7M8.5 14.5h7M8.5 18h4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>';
const PLUS_ICON = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>';
const BACK_ICON = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M19 12H5m0 0 6-6m-6 6 6 6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const DOWNLOAD_ICON = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M12 4v11m0 0 4-4m-4 4-4-4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/><path d="M5 17.5v2a1.5 1.5 0 0 0 1.5 1.5h11a1.5 1.5 0 0 0 1.5-1.5v-2" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>';
const CHEVRON_DOWN_ICON = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="m6 9 6 6 6-6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const TEMPLATE_ICON = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none"><rect x="4" y="4" width="16" height="16" rx="2" stroke="currentColor" stroke-width="1.6"/><path d="M8 9h8M8 13h8M8 17h4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>';
const UPLOAD_ICON = '<svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M12 15V4m0 0 4 4m-4-4-4 4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/><path d="M5 15.5v3A2.5 2.5 0 0 0 7.5 21h9a2.5 2.5 0 0 0 2.5-2.5v-3" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>';
const SEND_ICON = '<svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M12 5v13m0 0-4.5-4.5M12 18l4.5-4.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const CLIP_ICON = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M8 12.5V7a4 4 0 1 1 8 0v9.5a2.5 2.5 0 0 1-5 0V8.5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';

function getIdFromQuery() {
  return new URLSearchParams(window.location.search).get('id') || '';
}

// Template checklist dummy -- SENGAJA disimpan di sini (bukan di
// data/proposal.js langsung), karena item Previu Biro Ortala harus
// mulai dari kosong (biar transisi empty state -> "Tambah Reviu" ->
// keisi ini kelihatan). Dipakai buat isi item.checklistReviu di
// memori pas tombol "Tambah Reviu" dikonfirmasi (lihat bindActions).
const DUMMY_CHECKLIST_TEMPLATE = {
  page: 1,
  templateJawabanOptions: [
    'Sudah sesuai dengan ketentuan yang berlaku.',
    'Perlu perbaikan pada bagian substansi dokumen.',
    'Dokumen belum lengkap, mohon dilengkapi.',
    'Perlu penyesuaian redaksional.',
    'Sudah sesuai, dapat dilanjutkan ke tahap berikutnya.'
  ],
  notaDinasFile: '13408019557224317.pdf',
  catatanUntukPereviu: [
    { catatan: 'cek lagi ya', nama: 'Arny Fitriana Stayawati', tanggal: '2026-08-10T14:29:14' }
  ],
  items: [
    { no: 1, label: 'Kesesuaian kebutuhan PL dengan Proses Bisnis BPK', hasil: 'Sudah sesuai dengan ketentuan yang berlaku.', checked: true },
    {
      no: 2,
      label: 'Kesesuaian kebutuhan PL dengan uraian jabatan (tugas dan wewenang yang harus dilaksanakan)',
      hasil: 'Sudah sesuai dengan ketentuan yang berlaku.',
      checked: false
    },
    { no: 3, label: 'Kesesuaian kebutuhan PL dengan peraturan perundang-undangan', hasil: 'Sudah sesuai dengan ketentuan yang berlaku.', checked: false },
    { no: 4, label: 'Kesesuaian kebutuhan PL dengan tugas dan fungsi BPK', hasil: 'Sudah sesuai dengan ketentuan yang berlaku.', checked: true },
    { no: 5, label: 'Kesesuaian kebutuhan PL dengan obyek pemeriksaan**)', hasil: 'Sudah sesuai dengan ketentuan yang berlaku.', checked: true },
    { section: true, no: 6, label: 'Skala prioritas kebutuhan PL:' },
    { no: 'a', label: 'Sifat pekerjaan', hasil: 'Sudah sesuai dengan ketentuan yang berlaku.', checked: true, indent: true },
    { no: 'b', label: 'Tujuan', hasil: 'Sudah sesuai dengan ketentuan yang berlaku.', checked: true, indent: true },
    { no: 'c', label: 'Lingkup', hasil: 'Sudah sesuai dengan ketentuan yang berlaku.', checked: true, indent: true },
    { no: 'd', label: 'Kebutuhan organisasi', hasil: 'Sudah sesuai dengan ketentuan yang berlaku.', checked: true, indent: true },
    { no: 'e', label: 'Rencana Strategis dan RIR', hasil: 'Sudah sesuai dengan ketentuan yang berlaku.', checked: true, indent: true },
    { no: 'f', label: 'Keterkaitan dengan pemangku kepentingan', hasil: 'Sudah sesuai dengan ketentuan yang berlaku.', checked: true, indent: true },
    {
      no: 7,
      label: 'Keterkaitan dengan perangkat lunak yang sudah ditetapkan di BPK',
      hasil: 'Sudah sesuai dengan ketentuan yang berlaku.',
      checked: false
    },
    {
      no: 8,
      label: 'Substansi yang diatur bersinergi dengan perangkat lunak lain yang telah ditetapkan baik PL internal maupun eksternal',
      hasil: 'Sudah sesuai dengan ketentuan yang berlaku.',
      checked: false
    },
    {
      no: 9,
      label: 'Kesesuaian substansi perangkat lunak dengan bentuk perangkat lunak',
      hasil: 'Sudah sesuai dengan ketentuan yang berlaku.',
      checked: true
    },
    { no: 10, label: 'Latar belakang diperlukannya PL ini', hasil: 'Sudah sesuai dengan ketentuan yang berlaku.', checked: true }
  ]
};

// Jumlah baris checklist per halaman -- 10 baris pertama (nomor 1-5,
// section 6, sub a-d) di halaman 1, sisanya (sub e-f + nomor 7-10) di
// halaman 2, sesuai desain yang ada.
const CHECKLIST_PAGE_SIZE = 10;

function renderInfoField(label, valueHtml) {
  return `
    <div class="reviu-proposal__field">
      <p class="reviu-proposal__field-label">${label}</p>
      <p class="reviu-proposal__field-value">${valueHtml}</p>
    </div>
  `;
}

/** Kartu kiri "Informasi Proposal" -- ringkasan singkat, BUKAN detail lengkap kayak renderDetailCard di disposisi.js. */
function renderInfoCard(item) {
  const statusMeta = proposalService.getStatusMeta(item.status);
  // Reuse label/warna "Disposisi" yang sama kayak badge Status di
  // halaman Detail Proposal (js/pages/disposisi.js) -- proposal yang
  // sama, cuma beda halaman.
  const isProsesReviu = item.status === 'proses-reviu';
  const badgeBg = isProsesReviu ? '#E1EAF6' : statusMeta.bg;
  const badgeText = isProsesReviu ? '#2B5C89' : statusMeta.text;
  const badgeLabel = isProsesReviu ? 'Disposisi' : statusMeta.label;

  // "Tanggal Reviu" = waktu Previu buka halaman ini buat ngerjain
  // reviu-nya (bukan tanggal pengajuan proposal-nya) -- dihitung pas
  // halaman dirender, sesuai definisi labelnya sendiri.
  const tanggalReviu = formatDateTimeFullID(new Date().toISOString());

  return `
    <div class="card review-card reviu-proposal__info">
      <div class="review-card__header">
        <span class="review-card__header-icon">${CALENDAR_ICON}</span>
        <div>
          <h2 class="card__title">Informasi Proposal</h2>
          <p class="review-card__header-subtitle">Ringkasan data proposal yang didisposisikan</p>
        </div>
      </div>
      <div class="reviu-proposal__info-body">
        ${renderInfoField('Judul Proposal', item.title)}
        ${renderInfoField('Unit Kerja', item.unit)}
        ${renderInfoField('Tanggal Reviu', tanggalReviu)}
        <div class="reviu-proposal__field">
          <p class="reviu-proposal__field-label">Status</p>
          <span class="badge badge--tint" style="--tint-bg:${badgeBg};--tint-text:${badgeText}">${badgeLabel}</span>
        </div>
        <div class="reviu-proposal__divider"></div>
        ${renderInfoField('File Proposal', '<a href="#" data-file-link>proposal.pdf</a>')}
        ${renderInfoField('File Nota Dinas', '<a href="#" data-file-link>nota dinas.pdf</a>')}
      </div>
    </div>
  `;
}

/** Baris section (nomor 6, "Skala prioritas kebutuhan PL:") -- header doang, nggak ada Hasil Reviu/Check. */
function renderSectionRow(entry) {
  return `
    <tr class="reviu-proposal__section-row">
      <td>${entry.no}.</td>
      <td colspan="3" class="reviu-proposal__section-label">${entry.label}</td>
    </tr>
  `;
}

/** Dropdown "Template Jawaban" -- daftar jawaban baku, klik salah satu ngisi input Hasil Reviu baris itu & nutup dropdown-nya lagi. */
function renderTemplateOptions(options, index) {
  const opts = options
    .map(
      (opt, i) => `
        <label class="reviu-proposal__template-option">
          <input type="radio" name="template-pick-${index}" data-template-pick="${index}" value="${i}">
          <span>${opt}</span>
        </label>
      `
    )
    .join('');

  return `<div class="reviu-proposal__template-options" data-template-options="${index}" hidden>${opts}</div>`;
}

function renderChecklistRow(entry, index, templateOptions) {
  if (entry.section) return renderSectionRow(entry);

  return `
    <tr class="${entry.indent ? 'reviu-proposal__row--indent' : ''}">
      <td>${entry.no}.</td>
      <td>${entry.label}</td>
      <td>
        <input type="text" class="reviu-proposal__hasil-input" data-hasil-input="${index}" value="${entry.hasil || ''}" placeholder="Isi hasil reviu...">
        <button class="reviu-proposal__template-toggle" type="button" data-template-toggle="${index}">${TEMPLATE_ICON} Template Jawaban</button>
        ${renderTemplateOptions(templateOptions, index)}
      </td>
      <td>
        <button
          class="reviu-proposal__check-btn${entry.checked ? ' reviu-proposal__check-btn--active' : ''}"
          type="button"
          data-check-toggle="${index}"
          aria-pressed="${entry.checked ? 'true' : 'false'}"
        >${entry.checked ? CHECK_SMALL_ICON : ''}</button>
      </td>
    </tr>
  `;
}

/** Kartu kanan "Checklist Reviu" -- empty state kalau item.checklistReviu belum ada, atau tabel penuh kalau sudah. */
function renderChecklistCard(checklist) {
  if (!checklist || !checklist.items?.length) {
    return `
      <div class="card review-card reviu-proposal__checklist">
        <div class="reviu-proposal__checklist-header">
          <span class="review-card__header-icon review-card__header-icon--success">${CHECK_ICON}</span>
          <div class="reviu-proposal__checklist-heading">
            <h2 class="card__title">Checklist Reviu</h2>
            <p class="review-card__header-subtitle">Belum ada langkah reviu yang dicatat untuk proposal ini</p>
          </div>
          <button class="btn btn-tint-purple" type="button" id="btn-tambah-reviu">${PLUS_ICON}Tambah Reviu</button>
        </div>
        <div class="data-table-wrap">
          <table class="data-table">
            <thead>
              <tr>
                <th>No</th>
                <th>Langkah Reviu</th>
                <th>Hasil Reviu</th>
                <th>Check</th>
              </tr>
            </thead>
            <tbody></tbody>
          </table>
        </div>
        <div class="reviu-proposal__empty">
          <span class="reviu-proposal__empty-icon">${CLIPBOARD_ICON}</span>
          <p class="reviu-proposal__empty-title">Belum ada checklist reviu</p>
          <p class="reviu-proposal__empty-desc">Klik &quot;Tambah Reviu&quot; untuk mulai mengisi langkah-langkah peninjauan proposal ini.</p>
        </div>
        <div class="reviu-proposal__pagination">
          <button class="pagination__text-btn" type="button" disabled>Previous</button>
          <button class="pagination__text-btn" type="button" disabled>Next</button>
        </div>
      </div>
    `;
  }

  const totalPages = Math.max(1, Math.ceil(checklist.items.length / CHECKLIST_PAGE_SIZE));
  const page = Math.min(Math.max(checklist.page || 1, 1), totalPages);
  const startIndex = (page - 1) * CHECKLIST_PAGE_SIZE;
  const pageItems = checklist.items.slice(startIndex, startIndex + CHECKLIST_PAGE_SIZE);
  // Index dipakai buat data-hasil-input/data-check-toggle/dst SENGAJA
  // pakai posisi ASLI-nya di checklist.items (startIndex + i), bukan
  // 0..9 ulang tiap halaman -- biar pas nge-sync balik ke data model
  // (lihat syncChecklistInputs) tetap nunjuk ke baris yang benar,
  // sekalipun sedang di halaman 2.
  const rows = pageItems.map((entry, i) => renderChecklistRow(entry, startIndex + i, checklist.templateJawabanOptions || [])).join('');

  const pageButtons = Array.from({ length: totalPages }, (_, i) => i + 1)
    .map(
      (p) =>
        `<button class="pagination__page${p === page ? ' pagination__page--active' : ''}" type="button" data-checklist-page="${p}">${p}</button>`
    )
    .join('');

  return `
    <div class="card review-card reviu-proposal__checklist">
      <div class="reviu-proposal__checklist-header">
        <span class="review-card__header-icon review-card__header-icon--success">${CHECK_ICON}</span>
        <div class="reviu-proposal__checklist-heading">
          <h2 class="card__title">Checklist Reviu</h2>
          <p class="review-card__header-subtitle">Lengkapi checklist reviu untuk menentukan kelayakan proposal.</p>
        </div>
      </div>

      <div class="reviu-proposal__toolbar">
        <button class="btn btn-dark" type="button" id="btn-download-checklist">${DOWNLOAD_ICON} Download Checklist (*.xlsx)</button>
        <label class="reviu-proposal__filter">
          Filter Checklist:
          <select class="reviu-proposal__filter-select" id="filter-checklist">
            <option value="all">All</option>
            <option value="checked">Sudah Dicek</option>
            <option value="unchecked">Belum Dicek</option>
          </select>
        </label>
      </div>

      <div class="data-table-wrap">
        <table class="data-table reviu-proposal__table">
          <thead>
            <tr>
              <th>No</th>
              <th>Langkah Reviu</th>
              <th>Hasil Reviu <span class="reviu-proposal__required">*</span></th>
              <th>Check</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      </div>

      <div class="reviu-proposal__pagination">
        <button class="pagination__text-btn" type="button" data-checklist-page="prev"${page <= 1 ? ' disabled' : ''}>Previous</button>
        <div class="pagination">${pageButtons}</div>
        <button class="pagination__text-btn" type="button" data-checklist-page="next"${page >= totalPages ? ' disabled' : ''}>Next</button>
        <button class="btn btn-dark" type="button" id="btn-simpan-checklist">Simpan</button>
      </div>
    </div>
  `;
}

/** 2 kolom: nomor Nota Dinas Penyampaian (input teks) & file-nya (upload). */
function renderNotaDinasSection(checklist) {
  const fileName = checklist?.notaDinasFile || '';

  return `
    <div class="card review-card reviu-proposal__nota-dinas">
      <div class="reviu-proposal__nota-dinas-grid">
        <div class="reviu-proposal__field-group">
          <label class="reviu-proposal__notes-label" for="nota-dinas-nomor">No. Nota Dinas Penyampaian:</label>
          <input type="text" class="reviu-proposal__text-input" id="nota-dinas-nomor" placeholder="cth. ND-118/BTI/07/2026">
        </div>
        <div class="reviu-proposal__field-group">
          <label class="reviu-proposal__notes-label">Nota Dinas Penyampaian:</label>
          <div class="reviu-proposal__file-row">
            <button class="btn btn-ghost" type="button" id="btn-pilih-file">${UPLOAD_ICON} Pilih File</button>
            <span class="reviu-proposal__file-hint" id="file-hint">Tidak ada file yang dipilih</span>
            <input type="file" id="input-file-nota" hidden>
          </div>
          ${fileName ? `<a class="reviu-proposal__file-link" href="#" data-file-link id="file-existing-link">${CLIP_ICON} ${fileName}</a>` : ''}
        </div>
      </div>
    </div>
  `;
}

/**
 * Card gabungan "Kesimpulan & Catatan" -- Kesimpulan + Catatan Hasil
 * Reviu ditaro dalam SATU card (bukan 2 card terpisah kayak
 * sebelumnya), sesuai desain yang dikasih. SENGAJA selalu tampil
 * (tidak digate hasChecklist kayak renderNotaDinasSection/
 * renderCatatanUntukPereviu di bawah) -- harus tetep kelihatan
 * meski checklist masih kosong, belum sempat "Tambah Reviu".
 */
function renderKesimpulanCatatanCard() {
  return `
    <div class="card review-card">
      <div class="review-card__header">
        <span class="review-card__header-icon">${PENCIL_ICON}</span>
        <div>
          <h2 class="card__title">Kesimpulan &amp; Catatan</h2>
          <p class="review-card__header-subtitle">Ringkasan akhir hasil peninjauan proposal</p>
        </div>
      </div>
      <div class="review-notes__body reviu-proposal__notes-body">
        <p class="reviu-proposal__notes-label">Kesimpulan</p>
        <textarea class="review-notes__textarea" id="reviu-kesimpulan" rows="5" placeholder="Tuliskan kesimpulan reviu..."></textarea>
        <p class="reviu-proposal__notes-label">Catatan Hasil Reviu (opsional)</p>
        <textarea class="review-notes__textarea" id="reviu-catatan" rows="5" placeholder="Tuliskan catatan tambahan (opsional)..."></textarea>
      </div>
    </div>
  `;
}

/** Format tanggal pendek buat catatan pereviu, mis. "10/8/2026, 14:29:14". */
function formatShortDateTime(dateInput) {
  const date = new Date(dateInput);
  const tanggal = new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'numeric', year: 'numeric' }).format(date);
  const waktu = new Intl.DateTimeFormat('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }).format(date);
  return `${tanggal}, ${waktu}`;
}

/** Card collapsible "Catatan untuk Pereviu" -- riwayat catatan dari orang lain (bukan input Previu sendiri), cuma tampil kalau ada datanya. */
function renderCatatanUntukPereviu(notes) {
  if (!notes?.length) return '';

  const items = notes
    .map(
      (n) => `
        <div class="reviu-proposal__pereviu-note">
          <p class="reviu-proposal__pereviu-note-text">${n.catatan}</p>
          <p class="reviu-proposal__pereviu-note-name">${n.nama}</p>
          <p class="reviu-proposal__pereviu-note-date">${formatShortDateTime(n.tanggal)}</p>
        </div>
      `
    )
    .join('');

  return `
    <div class="card review-card">
      <button class="reviu-proposal__pereviu-toggle" type="button" id="btn-toggle-pereviu" aria-expanded="true">
        <span class="reviu-proposal__section-title">Catatan untuk Pereviu :</span>
        <span class="reviu-proposal__pereviu-chevron">${CHEVRON_DOWN_ICON}</span>
      </button>
      <div class="reviu-proposal__pereviu-body" id="pereviu-body">${items}</div>
    </div>
  `;
}

/**
 * @param {HTMLElement} root
 * @param {Session} user
 */
export function initReviuProposalPage(root, user) {
  if (!root) return;

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

  const checklist = item.checklistReviu;
  const hasChecklist = Boolean(checklist?.items?.length);
  const subtitle = hasChecklist
    ? 'Lengkapi checklist reviu untuk menentukan kelayakan proposal.'
    : 'Proposal ini didisposisikan dan belum memiliki riwayat reviu.';

  root.innerHTML = `
    <div class="review-page">
      <div class="review-page__intro">
        <h1 class="review-page__title">Reviu Atas Kebutuhan Penyusunan/Revisi Perangkat Lunak</h1>
        <p class="review-page__subtitle">${subtitle}</p>
      </div>

      <div class="reviu-proposal__layout">
        ${renderInfoCard(item)}
        ${renderChecklistCard(checklist)}
      </div>

      ${hasChecklist ? renderNotaDinasSection(checklist) : ''}
      ${renderKesimpulanCatatanCard()}
      ${hasChecklist && (checklist.page || 1) === 1 ? renderCatatanUntukPereviu(checklist.catatanUntukPereviu) : ''}

      <div class="card detail-actions">
        <button class="btn btn-ghost" type="button" id="btn-kembali">${BACK_ICON} Kembali</button>
        ${hasChecklist ? `<button class="btn btn-dark" type="button" id="btn-kirim-reviu">${SEND_ICON} Kirim Reviu</button>` : ''}
      </div>
    </div>
  `;

  bindActions(root, backTarget, item, user);
}

/**
 * Baca isian yang lagi kelihatan di DOM (input Hasil Reviu + tombol
 * Check) balik ke item.checklistReviu.items, berdasarkan index
 * absolut yang nempel di data-hasil-input/data-check-toggle (lihat
 * renderChecklistCard). Dipanggil sebelum ganti halaman checklist,
 * biar isian yang belum di-"Simpan" tetap ke-bawa pas balik lagi ke
 * halaman itu -- tanpa ini, ganti halaman = balik ke data dummy awal.
 */
function syncChecklistInputs(root, checklist) {
  root.querySelectorAll('[data-hasil-input]').forEach((input) => {
    const idx = Number(input.getAttribute('data-hasil-input'));
    if (checklist.items[idx]) checklist.items[idx].hasil = input.value;
  });
  root.querySelectorAll('[data-check-toggle]').forEach((btn) => {
    const idx = Number(btn.getAttribute('data-check-toggle'));
    if (checklist.items[idx]) checklist.items[idx].checked = btn.classList.contains('reviu-proposal__check-btn--active');
  });
}

function bindActions(root, backTarget, item, user) {
  root.querySelectorAll('[data-file-link]').forEach((link) => link.addEventListener('click', (e) => e.preventDefault()));
  root.querySelector('#btn-kembali')?.addEventListener('click', () => router.navigate(backTarget));

  // Empty state: konfirmasi -> isi item.checklistReviu (di memori
  // aja, structuredClone biar row Check per-proposal nggak saling
  // kebagi objek yang sama) -> render ulang halaman ini juga, jadi
  // abis modal sukses ke-OK langsung kelihatan tabel checklist-nya
  // terisi (bukan pindah ke page lain -- masih halaman yang sama,
  // cuma sekarang checklist-nya sudah ada).
  root.querySelector('#btn-tambah-reviu')?.addEventListener('click', () => {
    showConfirmModal({
      title: 'Apakah anda yakin ingin melakukan reviu pada proposal tsb?',
      message: 'Data yang didisposisi tidak dapat dikembalikan.',
      cancelLabel: 'Batal',
      confirmLabel: 'Ya',
      onConfirm: () => {
        showSuccessModal({
          message: 'Data berhasil diubah.',
          onOk: () => {
            item.checklistReviu = structuredClone(DUMMY_CHECKLIST_TEMPLATE);
            initReviuProposalPage(root, user);
          }
        });
      }
    });
  });

  // Checklist terisi: toggle Check per baris -- manipulasi DOM
  // langsung (bukan re-render seluruh halaman), biar isian di
  // textarea/input lain nggak ke-reset waktu satu baris di-klik.
  root.querySelectorAll('[data-check-toggle]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const isActive = btn.classList.toggle('reviu-proposal__check-btn--active');
      btn.setAttribute('aria-pressed', isActive ? 'true' : 'false');
      btn.innerHTML = isActive ? CHECK_SMALL_ICON : '';
    });
  });

  // Ganti halaman checklist (Previous/Next/nomor halaman) -- INI
  // satu-satunya aksi checklist yang beneran re-render (ganti isi
  // <tbody> ke baris halaman lain), jadi hasil ketikan/centang di
  // halaman yang lagi dibuka harus di-sync dulu ke item.checklistReviu
  // SEBELUM render ulang, supaya nggak ke-reset balik ke nilai dummy
  // awal begitu user balik lagi ke halaman itu.
  root.querySelectorAll('[data-checklist-page]').forEach((btn) => {
    btn.addEventListener('click', () => {
      if (btn.disabled || !item.checklistReviu) return;
      const checklist = item.checklistReviu;
      const totalPages = Math.max(1, Math.ceil(checklist.items.length / CHECKLIST_PAGE_SIZE));
      const current = checklist.page || 1;
      const raw = btn.getAttribute('data-checklist-page');
      const target = raw === 'prev' ? current - 1 : raw === 'next' ? current + 1 : Number(raw);
      const nextPage = Math.min(Math.max(target, 1), totalPages);
      if (nextPage === current) return;

      syncChecklistInputs(root, checklist);
      checklist.page = nextPage;
      initReviuProposalPage(root, user);
    });
  });

  // Toggle dropdown "Template Jawaban" per baris -- nutup dropdown
  // baris lain yang lagi kebuka juga, biar nggak numpuk semua kebuka
  // sekaligus.
  root.querySelectorAll('[data-template-toggle]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const index = btn.getAttribute('data-template-toggle');
      const options = root.querySelector(`[data-template-options="${index}"]`);
      const isHidden = options?.hasAttribute('hidden');

      root.querySelectorAll('[data-template-options]').forEach((el) => el.setAttribute('hidden', ''));
      if (isHidden) options?.removeAttribute('hidden');
    });
  });

  // Pilih salah satu opsi template -> isi input Hasil Reviu baris itu
  // dengan teksnya, lalu tutup lagi dropdown-nya.
  root.querySelectorAll('[data-template-pick]').forEach((radio) => {
    radio.addEventListener('change', () => {
      const index = radio.getAttribute('data-template-pick');
      const input = root.querySelector(`[data-hasil-input="${index}"]`);
      const label = radio.closest('.reviu-proposal__template-option')?.querySelector('span')?.textContent || '';
      if (input) input.value = label;
      root.querySelector(`[data-template-options="${index}"]`)?.setAttribute('hidden', '');
    });
  });

  // "Pilih File" -- buka file picker aslinya, tampilkan nama file yg
  // dipilih di sebelahnya (bukan beneran ke-upload ke mana pun).
  const fileInput = root.querySelector('#input-file-nota');
  root.querySelector('#btn-pilih-file')?.addEventListener('click', () => fileInput?.click());
  fileInput?.addEventListener('change', () => {
    const hint = root.querySelector('#file-hint');
    if (hint) hint.textContent = fileInput.files?.[0]?.name || 'Tidak ada file yang dipilih';
  });

  // Collapse/expand "Catatan untuk Pereviu".
  const pereviuToggle = root.querySelector('#btn-toggle-pereviu');
  pereviuToggle?.addEventListener('click', () => {
    const body = root.querySelector('#pereviu-body');
    const isHidden = body?.hasAttribute('hidden');
    if (isHidden) body?.removeAttribute('hidden');
    else body?.setAttribute('hidden', '');
    pereviuToggle.setAttribute('aria-expanded', isHidden ? 'true' : 'false');
    pereviuToggle.classList.toggle('reviu-proposal__pereviu-toggle--collapsed', !isHidden);
  });

  // "Simpan" (checklist) & "Kirim Reviu" -- belum beneran nyimpen
  // apa-apa ke data/proposal.js (workflow engine belum digarap), baru
  // popup konfirmasi + feedback, matching pola tombol serupa di
  // halaman lain (Disposisi, Setuju, dst).
  root.querySelector('#btn-simpan-checklist')?.addEventListener('click', () => {
    showSuccessModal({ message: 'Checklist reviu berhasil disimpan.' });
  });

  root.querySelector('#btn-kirim-reviu')?.addEventListener('click', () => {
    showConfirmModal({
      title: 'Apakah anda yakin ingin mengirim hasil reviu ini?',
      message: 'Data yang sudah dikirim tidak dapat dikembalikan.',
      cancelLabel: 'Batal',
      confirmLabel: 'Ya',
      onConfirm: () => {
        showSuccessModal({ message: 'Hasil reviu berhasil dikirim.', onOk: () => router.navigate(backTarget) });
      }
    });
  });
}