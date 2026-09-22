// ============================================================
// MAPEL - pages/reviu-konsep.js
// "Reviu Konsep PL" -- versi Konsep PL dari js/pages/review-proposal.js
// (Reviu Proposal). Dibuka lewat tombol "Reviu"/ikon mata di kartu
// "Hasil Reviu" (js/pages/disposisi-konsep.js, status SELESAI_REVIU
// Kepala Subbagian Ortala), sesuai contoh tampilan "Form reviu".
//
// Beda dari versi Proposal PL:
//   - Checklist-nya berkelompok pakai HURUF (A/B/C, judul grup warna
//     hijau -- lihat DUMMY_CHECKLIST_TEMPLATE_KONSEP), bukan cuma 1
//     "section" nomor kayak Proposal PL. Satu grup bisa punya
//     subsection bernomor sendiri (mis. "B.2 Format Pengetikan") yang
//     nomor sub-itemnya reset dari 1 lagi.
//   - Input "Hasil Reviu" yang masih kosong dikasih tint merah muda
//     (.reviu-proposal__hasil-input--empty) -- penanda visual kolom
//     wajib diisi (header tabelnya juga ada tanda *).
//   - ADA 2 seksi Nota Dinas terpisah (Penyampaian & Permintaan
//     Pengesahan), bukan cuma 1 kayak Proposal PL.
//   - Kartu "Catatan Hasil Reviu" & "Kesimpulan" tetap 2 kartu
//     TERPISAH (bukan digabung jadi 1 kartu "Kesimpulan & Catatan"
//     kayak versi Proposal PL yang sekarang).
//   - Previu di sini dapat 2 tombol aksi ("Koreksi Reviu" + "Kirim
//     Reviu"), bukan cuma "Kirim Reviu" doang kayak versi Proposal PL.
//
// Reuse class CSS .reviu-proposal__* & .review-card yang sama (sudah
// ke-load global lewat css/pages/reviu-proposal.css), + 2 class baru
// (.reviu-proposal__group-row, .reviu-proposal__hasil-input--empty)
// di file yang sama.
//
// TAHAP INI: checklist yang keliatan cuma sampai baris "C.2 Isi
// dokumen:" (persis kayak yang keliatan di contoh tampilan, halaman
// screenshot-nya kepotong di situ) -- belum ada isi lengkap sampai
// halaman 2-4. Karena itemnya masih sedikit (<10), pagination di
// bawah cuma nampilin 1 halaman; mekanismenya (CHECKLIST_PAGE_SIZE,
// dst) sudah generik, otomatis nambah halaman begitu item-nya
// ditambah nanti. Semua tombol (Simpan/Koreksi Reviu/Kirim Reviu)
// juga masih sebatas popup konfirmasi + balik ke Monitoring, sama
// kayak js/pages/review-proposal.js -- belum ada workflow engine
// beneran.
// ============================================================

import { router } from '../core/router.js';
import { ROLES } from '../core/role.js';
import { konsepService } from '../../data/konsep.js';
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
const TEMPLATE_ICON = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none"><rect x="4" y="4" width="16" height="16" rx="2" stroke="currentColor" stroke-width="1.6"/><path d="M8 9h8M8 13h8M8 17h4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>';
const UPLOAD_ICON = '<svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M12 15V4m0 0 4 4m-4-4-4 4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/><path d="M5 15.5v3A2.5 2.5 0 0 0 7.5 21h9a2.5 2.5 0 0 0 2.5-2.5v-3" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>';
const SEND_ICON = '<svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M21 3 3 10.5l7.5 3L14 21l3-8 4-10Z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/><path d="M10.5 13.5 21 3" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>';
const CLIP_ICON = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M8 12.5V7a4 4 0 1 1 8 0v9.5a2.5 2.5 0 0 1-5 0V8.5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';

function getIdFromQuery() {
  return new URLSearchParams(window.location.search).get('id') || '';
}

// Checklist dummy POS -- sengaja disimpan di sini (bukan di
// data/konsep.js langsung), sama alasannya kayak DUMMY_CHECKLIST_TEMPLATE
// di js/pages/review-proposal.js: item Previu harus mulai dari kosong
// (empty state -> "Tambah Reviu" -> keisi ini). row.type:
//   'group'      -> header huruf (A/B/C), judul warna hijau, span 4 kolom
//   'subsection' -> header nomor di DALAM satu grup (mis. "2. Format
//                   Pengetikan"), sama kayak entry.section di Proposal PL
//   'item'       -> baris beneran, ada Hasil Reviu + Check
const DUMMY_CHECKLIST_TEMPLATE_KONSEP = {
  page: 1,
  templateJawabanOptions: [
    'Sudah sesuai dengan ketentuan yang berlaku.',
    'Perlu perbaikan pada bagian substansi dokumen.',
    'Dokumen belum lengkap, mohon dilengkapi.',
    'Perlu penyesuaian redaksional.',
    'Sudah sesuai, dapat dilanjutkan ke tahap berikutnya.'
  ],
  notaDinasPenyampaianFile: '',
  notaDinasPenyampaianNomor: '',
  notaDinasPengesahanFile: '',
  notaDinasPengesahanNomor: '',
  items: [
    { type: 'group', letter: 'A', title: 'Kelengkapan POS' },
    {
      type: 'item',
      no: 1,
      label: 'Apabila memiliki kebijakan (policy) maka kebijakan (policy) bersinergi dengan prosedur, instruksi kerja, dan formulir.',
      hasil: '',
      checked: false
    },
    { type: 'group', letter: 'B', title: 'Tata cara/Sistematika Penulisan POS' },
    {
      type: 'item',
      no: 1,
      label: 'Bahasa Menggunakan bahasa Indonesia yang baik dan benar sesuai dengan Ejaan Yang Disempurnakan (EYD).',
      hasil: '',
      checked: false
    },
    { type: 'subsection', no: 2, label: 'Format Pengetikan' },
    {
      type: 'item',
      no: 1,
      label: 'Sampul Menggunakan sampul depan dan belakang sesuai pedoman POS.',
      hasil: '',
      checked: false,
      indent: true
    },
    {
      type: 'item',
      no: 2,
      label: 'Isi POS Memiliki format ukuran kertas, penggunaan huruf, spasi, dan format pengetikan lainnya sesuai dengan pedoman penulisan laporan (gaya selingkung) BPK RI.',
      hasil: '',
      checked: false,
      indent: true
    },
    { type: 'group', letter: 'C', title: 'Kerangka POS' },
    {
      type: 'item',
      no: 1,
      label: 'Halaman Penetapan berisikan surat keputusan/pengesahan yang menetapkan berlakunya POS tersebut.',
      hasil: '',
      checked: false
    },
    { type: 'subsection', no: 2, label: 'Isi dokumen:' }
  ]
};

// Baris checklist per halaman -- pola sama kayak CHECKLIST_PAGE_SIZE di
// js/pages/review-proposal.js.
const CHECKLIST_PAGE_SIZE = 10;

function renderInfoField(label, valueHtml) {
  return `
    <div class="reviu-proposal__field">
      <p class="reviu-proposal__field-label">${label}</p>
      <p class="reviu-proposal__field-value">${valueHtml}</p>
    </div>
  `;
}

/** Kartu kiri "Informasi Perangkat Lunak" -- ringkasan singkat konsep yang lagi direviu. */
function renderInfoCard(konsep) {
  const statusMeta = { ...konsepService.getStatusMeta(konsep.status), ...(konsep.tableStatusOverride || {}) };
  const tanggalReviu = formatDateTimeFullID(new Date().toISOString());

  return `
    <div class="card review-card reviu-proposal__info">
      <div class="review-card__header">
        <span class="review-card__header-icon">${CALENDAR_ICON}</span>
        <div>
          <h2 class="card__title">Informasi Perangkat Lunak</h2>
          <p class="review-card__header-subtitle">Ringkasan data pengajuan yang sedang direviu</p>
        </div>
      </div>
      <div class="reviu-proposal__info-body">
        ${renderInfoField('Judul Perangkat Lunak', konsep.title)}
        ${renderInfoField('Unit Kerja', konsep.unit)}
        ${renderInfoField('Tanggal Reviu', tanggalReviu)}
        <div class="reviu-proposal__field">
          <p class="reviu-proposal__field-label">Status</p>
          <span class="badge badge--tint" style="--tint-bg:${statusMeta.bg};--tint-text:${statusMeta.text}">${statusMeta.label}</span>
        </div>
        <div class="reviu-proposal__divider"></div>
        ${renderInfoField('File Konsep PL', '<a href="#" data-file-link>konsep-pl.pdf</a>')}
        ${renderInfoField('File Nota Dinas', '<a href="#" data-file-link>nota-dinas.pdf</a>')}
      </div>
    </div>
  `;
}

/** Baris header grup huruf (A/B/C) -- judul warna hijau, span semua kolom. */
function renderGroupRow(entry) {
  return `
    <tr class="reviu-proposal__section-row reviu-proposal__group-row">
      <td>${entry.letter}.</td>
      <td colspan="3" class="reviu-proposal__group-label">${entry.title}</td>
    </tr>
  `;
}

/** Baris subsection bernomor DI DALAM satu grup (mis. "2. Format Pengetikan") -- header doang. */
function renderSubsectionRow(entry) {
  return `
    <tr class="reviu-proposal__section-row">
      <td>${entry.no}.</td>
      <td colspan="3" class="reviu-proposal__section-label">${entry.label}</td>
    </tr>
  `;
}

/** Dropdown "Template Jawaban" -- sama persis kayak js/pages/review-proposal.js. */
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
  if (entry.type === 'group') return renderGroupRow(entry);
  if (entry.type === 'subsection') return renderSubsectionRow(entry);

  // Kosong = belum diisi -> tint merah muda, sesuai tanda wajib (*)
  // di header kolom "Hasil Reviu".
  const emptyClass = entry.hasil ? '' : ' reviu-proposal__hasil-input--empty';

  return `
    <tr class="${entry.indent ? 'reviu-proposal__row--indent' : ''}">
      <td>${entry.no}.</td>
      <td>${entry.label}</td>
      <td>
        <input type="text" class="reviu-proposal__hasil-input${emptyClass}" data-hasil-input="${index}" value="${entry.hasil || ''}" placeholder="Keterangan...">
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

/** Kartu kanan "Checklist Reviu" -- empty state kalau konsep.checklistReviu belum ada, atau tabel penuh kalau sudah. */
function renderChecklistCard(checklist) {
  if (!checklist || !checklist.items?.length) {
    return `
      <div class="card review-card reviu-proposal__checklist">
        <div class="reviu-proposal__checklist-header">
          <span class="review-card__header-icon review-card__header-icon--success">${CHECK_ICON}</span>
          <div class="reviu-proposal__checklist-heading">
            <h2 class="card__title">Checklist Reviu</h2>
            <p class="review-card__header-subtitle">Belum ada langkah reviu yang dicatat untuk konsep ini</p>
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
          <p class="reviu-proposal__empty-desc">Klik &quot;Tambah Reviu&quot; untuk mulai mengisi langkah-langkah peninjauan konsep ini.</p>
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
          <p class="review-card__header-subtitle">Lengkapi checklist reviu untuk menentukan kelayakan konsep perangkat lunak.</p>
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

/**
 * Satu seksi Nota Dinas (nomor + file) -- dipanggil 2x (Penyampaian &
 * Permintaan Pengesahan), beda dari Proposal PL yang cuma 1.
 * @param {string} title - "Nota Dinas Penyampaian" / "Nota Dinas Permintaan Pengesahan"
 * @param {string} nomorLabel - "No. Nota Dinas Penyampaian:" / "No. Nota Dinas Permintaan Pengesahan:"
 * @param {string} idPrefix - dipakai buat id elemen & data-attr per seksi
 * @param {{nomor:string, file:string}} value
 * @param {boolean} isReadOnly
 */
function renderNotaDinasSection(title, nomorLabel, idPrefix, value, isReadOnly) {
  const nomorField = isReadOnly
    ? `<div class="reviu-proposal__text-input reviu-proposal__text-input--display">${value.nomor || '-'}</div>`
    : `<input type="text" class="reviu-proposal__text-input" id="${idPrefix}-nomor" placeholder="cth. ND-118/BTI/07/2026" value="${value.nomor || ''}">`;

  const fileField = isReadOnly
    ? `<div class="reviu-proposal__text-input reviu-proposal__text-input--display">${
        value.file ? `<a class="reviu-proposal__file-link-inline" href="#" data-file-link>${CLIP_ICON} ${value.file}</a>` : '-'
      }</div>`
    : `
      <div class="reviu-proposal__file-row">
        <button class="btn btn-ghost" type="button" id="btn-pilih-file-${idPrefix}">${UPLOAD_ICON} Pilih File</button>
        <span class="reviu-proposal__file-hint" id="file-hint-${idPrefix}">Tidak ada file yang dipilih</span>
        <input type="file" id="input-file-${idPrefix}" hidden>
      </div>
      ${value.file ? `<a class="reviu-proposal__file-link" href="#" data-file-link>${CLIP_ICON} ${value.file}</a>` : ''}
    `;

  return `
    <div class="card review-card reviu-proposal__nota-dinas">
      <div class="reviu-proposal__nota-dinas-grid">
        <div class="reviu-proposal__field-group">
          <label class="reviu-proposal__notes-label" for="${idPrefix}-nomor">${nomorLabel}</label>
          ${nomorField}
        </div>
        <div class="reviu-proposal__field-group">
          <label class="reviu-proposal__notes-label">${title}:</label>
          ${fileField}
        </div>
      </div>
    </div>
  `;
}

/** Kartu "Catatan Hasil Reviu" -- TERPISAH dari Kesimpulan (beda dari versi Proposal PL yang digabung). */
function renderCatatanCard(isReadOnly) {
  return `
    <div class="card review-card">
      <div class="review-card__header">
        <span class="review-card__header-icon">${PENCIL_ICON}</span>
        <div><h2 class="card__title">Catatan Hasil Reviu${isReadOnly ? '' : ' (opsional)'}</h2></div>
      </div>
      <div class="review-notes__body reviu-proposal__notes-body">
        <textarea class="review-notes__textarea${isReadOnly ? ' review-notes__textarea--readonly' : ''}" id="reviu-catatan" rows="5"${isReadOnly ? ' readonly' : ''} placeholder="${isReadOnly ? 'Belum ada catatan hasil reviu.' : 'Tuliskan catatan tambahan (opsional)...'}"></textarea>
      </div>
    </div>
  `;
}

/** Kartu "Kesimpulan" -- TERPISAH dari Catatan Hasil Reviu. */
function renderKesimpulanCard(isReadOnly) {
  return `
    <div class="card review-card">
      <div class="review-card__header">
        <span class="review-card__header-icon">${PENCIL_ICON}</span>
        <div><h2 class="card__title">Kesimpulan${isReadOnly ? '' : ' (opsional)'}</h2></div>
      </div>
      <div class="review-notes__body reviu-proposal__notes-body">
        <textarea class="review-notes__textarea${isReadOnly ? ' review-notes__textarea--readonly' : ''}" id="reviu-kesimpulan" rows="5"${isReadOnly ? ' readonly' : ''} placeholder="${isReadOnly ? 'Belum ada kesimpulan reviu.' : 'Tuliskan kesimpulan reviu...'}"></textarea>
      </div>
    </div>
  `;
}

/** Card "Catatan Koreksi untuk Pereviu" -- cuma buat role selain Previu (sama pola kayak review-proposal.js). */
function renderCatatanKoreksiCard() {
  return `
    <div class="card review-card">
      <div class="card__header">
        <h2 class="card__title">Catatan Koreksi untuk Pereviu <span class="reviu-proposal__hint">(Silakan diisi apabila ada koreksi atas reviu)</span></h2>
      </div>
      <div class="review-notes__body reviu-proposal__notes-body">
        <textarea class="review-notes__textarea" id="catatan-koreksi" rows="5" placeholder="Tuliskan catatan tambahan (opsional)..."></textarea>
      </div>
    </div>
  `;
}

/**
 * @param {HTMLElement} root
 * @param {Session} user
 */
export function initReviuKonsepPage(root, user) {
  if (!root) return;

  const backTarget = `/pages/${user?.role}/monitoring/konsep-pl.html`;
  const konsep = konsepService.getById(getIdFromQuery());

  if (!konsep) {
    root.innerHTML = `
      <div class="review-page">
        <p class="dashboard__subtitle">Konsep tidak ditemukan. Mungkin sudah dipindahkan atau link-nya sudah kedaluwarsa.</p>
        <button class="btn btn-ghost" type="button" id="btn-kembali">${BACK_ICON} Kembali ke Monitoring</button>
      </div>
    `;
    root.querySelector('#btn-kembali')?.addEventListener('click', () => router.navigate(backTarget));
    return;
  }

  const isPreviu = user?.role === ROLES.PREVIU_BIRO_ORTALA;
  const checklist = konsep.checklistReviu;
  const hasChecklist = Boolean(checklist?.items?.length);
  const subtitle = hasChecklist
    ? 'Lengkapi checklist reviu untuk menentukan kelayakan konsep perangkat lunak.'
    : 'Konsep ini didisposisikan dan belum memiliki riwayat reviu.';

  // Sesuai contoh tampilan "Form reviu": Previu DAPAT 2 tombol
  // ("Koreksi Reviu" + "Kirim Reviu"), bukan cuma "Kirim Reviu" doang
  // kayak versi Proposal PL -- role lain (mis. Kasubbag baca hasil
  // kerja Previu) pakai tombol yang sama juga.
  const actionButtons = !hasChecklist
    ? ''
    : `
      <div class="detail-actions__right">
        <button class="btn btn-gold" type="button" id="btn-koreksi-reviu">${PENCIL_ICON} Koreksi Reviu</button>
        <button class="btn btn-dark" type="button" id="btn-kirim-reviu">${SEND_ICON} Kirim Reviu</button>
      </div>
    `;

  root.innerHTML = `
    <div class="review-page">
      <div class="review-page__intro">
        <h1 class="review-page__title">Reviu Atas Kebutuhan Penyusunan/Revisi Konsep Perangkat Lunak</h1>
        <p class="review-page__subtitle">${subtitle}</p>
      </div>

      <div class="reviu-proposal__layout">
        ${renderInfoCard(konsep)}
        ${renderChecklistCard(checklist)}
      </div>

      ${
        hasChecklist
          ? renderNotaDinasSection(
              'Nota Dinas Penyampaian',
              'No. Nota Dinas Penyampaian:',
              'nota-dinas-penyampaian',
              { nomor: checklist.notaDinasPenyampaianNomor, file: checklist.notaDinasPenyampaianFile },
              !isPreviu
            )
          : ''
      }
      ${
        hasChecklist
          ? renderNotaDinasSection(
              'Nota Dinas Permintaan Pengesahan',
              'No. Nota Dinas Permintaan Pengesahan:',
              'nota-dinas-pengesahan',
              { nomor: checklist.notaDinasPengesahanNomor, file: checklist.notaDinasPengesahanFile },
              !isPreviu
            )
          : ''
      }

      ${renderCatatanCard(!isPreviu)}
      ${renderKesimpulanCard(false)}
      ${hasChecklist && !isPreviu ? renderCatatanKoreksiCard() : ''}

      <div class="card detail-actions">
        <button class="btn btn-ghost" type="button" id="btn-kembali">${BACK_ICON} Kembali</button>
        ${actionButtons}
      </div>
    </div>
  `;

  bindActions(root, backTarget, konsep, user);
}

/** Sinkronkan isian Hasil Reviu/Check yang lagi kelihatan balik ke konsep.checklistReviu.items -- sama pola kayak review-proposal.js. */
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

function bindActions(root, backTarget, konsep, user) {
  root.querySelectorAll('[data-file-link]').forEach((link) => link.addEventListener('click', (e) => e.preventDefault()));
  root.querySelector('#btn-kembali')?.addEventListener('click', () => router.navigate(backTarget));

  root.querySelector('#btn-tambah-reviu')?.addEventListener('click', () => {
    showConfirmModal({
      title: 'Apakah anda yakin ingin melakukan reviu pada konsep tsb?',
      message: 'Data yang didisposisi tidak dapat dikembalikan.',
      cancelLabel: 'Batal',
      confirmLabel: 'Ya',
      onConfirm: () => {
        showSuccessModal({
          message: 'Data berhasil diubah.',
          onOk: () => {
            konsep.checklistReviu = structuredClone(DUMMY_CHECKLIST_TEMPLATE_KONSEP);
            initReviuKonsepPage(root, user);
          }
        });
      }
    });
  });

  root.querySelectorAll('[data-check-toggle]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const isActive = btn.classList.toggle('reviu-proposal__check-btn--active');
      btn.setAttribute('aria-pressed', isActive ? 'true' : 'false');
      btn.innerHTML = isActive ? CHECK_SMALL_ICON : '';
    });
  });

  root.querySelectorAll('[data-checklist-page]').forEach((btn) => {
    btn.addEventListener('click', () => {
      if (btn.disabled || !konsep.checklistReviu) return;
      const checklist = konsep.checklistReviu;
      const totalPages = Math.max(1, Math.ceil(checklist.items.length / CHECKLIST_PAGE_SIZE));
      const current = checklist.page || 1;
      const raw = btn.getAttribute('data-checklist-page');
      const target = raw === 'prev' ? current - 1 : raw === 'next' ? current + 1 : Number(raw);
      const nextPage = Math.min(Math.max(target, 1), totalPages);
      if (nextPage === current) return;

      syncChecklistInputs(root, checklist);
      checklist.page = nextPage;
      initReviuKonsepPage(root, user);
    });
  });

  root.querySelectorAll('[data-template-toggle]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const index = btn.getAttribute('data-template-toggle');
      const options = root.querySelector(`[data-template-options="${index}"]`);
      const isHidden = options?.hasAttribute('hidden');

      root.querySelectorAll('[data-template-options]').forEach((el) => el.setAttribute('hidden', ''));
      if (isHidden) options?.removeAttribute('hidden');
    });
  });

  root.querySelectorAll('[data-template-pick]').forEach((radio) => {
    radio.addEventListener('change', () => {
      const index = radio.getAttribute('data-template-pick');
      const input = root.querySelector(`[data-hasil-input="${index}"]`);
      const label = radio.closest('.reviu-proposal__template-option')?.querySelector('span')?.textContent || '';
      if (input) {
        input.value = label;
        input.classList.remove('reviu-proposal__hasil-input--empty');
      }
      root.querySelector(`[data-template-options="${index}"]`)?.setAttribute('hidden', '');
    });
  });

  // "Pilih File" -- 2x (Penyampaian & Pengesahan), masing-masing punya id sendiri (lihat idPrefix di renderNotaDinasSection).
  ['nota-dinas-penyampaian', 'nota-dinas-pengesahan'].forEach((idPrefix) => {
    const fileInput = root.querySelector(`#input-file-${idPrefix}`);
    root.querySelector(`#btn-pilih-file-${idPrefix}`)?.addEventListener('click', () => fileInput?.click());
    fileInput?.addEventListener('change', () => {
      const hint = root.querySelector(`#file-hint-${idPrefix}`);
      if (hint) hint.textContent = fileInput.files?.[0]?.name || 'Tidak ada file yang dipilih';
    });
  });

  root.querySelector('#btn-simpan-checklist')?.addEventListener('click', () => {
    showConfirmModal({
      title: 'Apakah anda yakin',
      message: '',
      cancelLabel: 'Tidak',
      confirmLabel: 'Ya',
      onConfirm: () => {
        showSuccessModal({ message: 'Data berhasil diubah.' });
      }
    });
  });

  root.querySelector('#btn-koreksi-reviu')?.addEventListener('click', () => {
    showConfirmModal({
      title: 'Apakah anda yakin akan mengembalikan Konsep untuk dimintakan Koreksi Reviu?',
      message: 'Data yang dimintakan Koreksi Reviu tidak dapat dikembalikan.',
      cancelLabel: 'Batal',
      confirmLabel: 'Ya',
      onConfirm: () => {
        showSuccessModal({ message: 'Data berhasil diubah.', onOk: () => router.navigate(backTarget) });
      }
    });
  });

  root.querySelector('#btn-kirim-reviu')?.addEventListener('click', () => {
    showConfirmModal({
      title: 'Apakah anda yakin ingin mengirim data ini untuk proses selanjutnya?',
      message: 'Pastikan data yang anda ubah sudah disimpan sebelum dikirim. Data yang dikirim tidak dapat dikembalikan.',
      cancelLabel: 'Batal',
      confirmLabel: 'Ya',
      onConfirm: () => {
        showSuccessModal({ message: 'Data berhasil dikirim.', onOk: () => router.navigate(backTarget) });
      }
    });
  });
}