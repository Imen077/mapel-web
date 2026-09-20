// ============================================================
// MAPEL - pages/pengajuan-konsep.js
// Form pengajuan Konsep PL -- CUMA dipakai role LO Biro TI. Dibuka
// dari tombol "Buat Konsep PL" di halaman Detail (js/pages/
// detail-konsep.js), sesuai contoh tampilan "Pengajuan Konsep PL -
// LO Biro TI". Layout & class CSS-nya sama persis kayak form
// Pengajuan Proposal PL (js/pages/pengajuan-proposal.js, styling di
// css/pages/pengajuan.css), cuma beda label: Judul Konsep PL, Jenis
// Konsep, Upload File Konsep PL.
//
// Aturan bisnis: Konsep PL cuma boleh diajukan setelah Proposal PL-nya
// disetujui semua pihak -- makanya satu-satunya jalan masuk ke halaman
// ini lewat tombol di halaman Detail proposal yang sudah disetujui
// (id proposal induknya ikut dibawa lewat query ?proposalId=...).
//
// TAHAP INI: sama kayak form proposal -- baru tampilan form + kartu
// pratinjau dokumen statis (skeleton). Belum ada validasi on-submit
// yang jalan (elemen .field__error sudah disiapkan tapi hidden), dan
// tombol Simpan / Simpan & Kirim baru nampilin popup sukses, belum
// nyimpen ke data/konsep.js ataupun mulai alur disposisi (Simpan cuma
// nitipin isi form ke halaman Detail Proposal dan Konsep lewat
// sessionStorage, lihat saveKonsepDraftHandoff). Teks
// placeholder & pesan error sengaja ngikutin contoh tampilan apa
// adanya (termasuk yang masih bertuliskan "proposal").
// ============================================================

import { router } from '../core/router.js';
import { showSuccessModal } from '../components/modal.js';
import { saveKonsepDraftHandoff } from './detail-proposal-konsep.js';

const FILE_ICON = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M13 3.5H7a1 1 0 0 0-1 1v15a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V8.5L13 3.5Z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/><path d="M12.5 3.5V8h4.5" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/></svg>';
const BUILDING_ICON = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M5 20.5V5a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v15.5" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/><path d="M13 10.5h5a1 1 0 0 1 1 1v9" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/><path d="M8 7.5h0M8 11h0M8 14.5h0M8 18h0" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><path d="M3 20.5h18" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>';
const HASH_ICON = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M9.5 4 7 20M17 4l-2.5 16M4 9h16M3.5 15h16" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const UPLOAD_ICON = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M12 15V4m0 0-4 4m4-4 4 4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/><path d="M5 15v4a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>';
const ALERT_ICON = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.8"/><path d="M12 8v5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><circle cx="12" cy="16" r="1" fill="currentColor"/></svg>';
const CHEVRON_ICON = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="m6 9 6 6 6-6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const DOC_ICON = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M13 3.5H7a1 1 0 0 0-1 1v15a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V8.5L13 3.5Z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/><path d="M12.5 3.5V8h4.5" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/></svg>';

const JENIS_OPTIONS = ['Instruksi Kerja', 'Juknis', 'Standar Pelayanan', 'Pedoman', 'POS'];

// LO Biro TI di app ini cuma mewakili satu unit -- field ini
// read-only (bukan diisi manual), sama kayak di form proposal.
const SATUAN_KERJA_PENGUSUL = 'Biro Teknologi Informasi';

const MONITORING_KONSEP_PATH = '/pages/lo-biro-ti/monitoring/konsep-pl.html';
const DETAIL_KONSEP_PATH = '/pages/lo-biro-ti/monitoring/detail-konsep.html';
const DETAIL_PROPOSAL_KONSEP_PATH = '/pages/lo-biro-ti/monitoring/detail-proposal-konsep.html';

/** Field teks biasa (Judul Konsep PL, Nomor Nota Dinas, dst). */
function renderTextField({ id, label, required, icon, placeholder, errorText, readonly = false }) {
  return `
    <div class="field">
      <label class="field__label" for="${id}">${label}${required ? ' <span class="field__required">*</span>' : ''}</label>
      <div class="field__control${readonly ? ' field__control--readonly' : ''}">
        <span class="field__icon">${icon}</span>
        <input
          class="field__input"
          type="text"
          id="${id}"
          name="${id}"
          placeholder="${placeholder || ''}"
          ${readonly ? 'readonly tabindex="-1"' : ''}
        >
      </div>
      ${errorText ? `<p class="field__error" id="${id}-error" hidden>${ALERT_ICON}<span>${errorText}</span></p>` : ''}
    </div>
  `;
}

/** Dropdown Jenis Konsep. */
function renderSelectField({ id, label, required, options, placeholder, errorText }) {
  const optionsHtml = options.map((opt) => `<option value="${opt}">${opt}</option>`).join('');
  return `
    <div class="field">
      <label class="field__label" for="${id}">${label}${required ? ' <span class="field__required">*</span>' : ''}</label>
      <div class="field__control field__control--select">
        <select class="field__input" id="${id}" name="${id}">
          <option value="" selected disabled>${placeholder}</option>
          ${optionsHtml}
        </select>
        <span class="field__chevron">${CHEVRON_ICON}</span>
      </div>
      <p class="field__error" id="${id}-error" hidden>${ALERT_ICON}<span>${errorText}</span></p>
    </div>
  `;
}

/** Tombol "Pilih File" + nama file terpilih (Upload File Konsep PL / Nota Dinas). */
function renderFileField({ id, label, required, errorText }) {
  return `
    <div class="field">
      <label class="field__label" for="${id}">${label}${required ? ' <span class="field__required">*</span>' : ''}</label>
      <div class="field__file">
        <button class="field__file-btn" type="button" data-file-trigger="${id}">${UPLOAD_ICON} Pilih File</button>
        <span class="field__file-name" id="${id}-name">Tidak ada file yang dipilih</span>
        <input class="field__file-input" type="file" id="${id}" name="${id}" hidden>
      </div>
      <p class="field__error" id="${id}-error" hidden>${ALERT_ICON}<span>${errorText}</span></p>
    </div>
  `;
}

/** Kartu pratinjau dokumen (skeleton statis -- belum baca file beneran). */
function renderPreviewCard({ title, docTitle }) {
  const lines = Array.from({ length: 6 })
    .map((_, i) => `<span class="doc-preview__line${i === 1 || i === 5 ? ' doc-preview__line--short' : ''}"></span>`)
    .join('');

  return `
    <div class="card doc-preview">
      <div class="doc-preview__header">
        <span class="doc-preview__icon">${DOC_ICON}</span>
        <div>
          <p class="doc-preview__title">${title}</p>
          <p class="doc-preview__subtitle">Pratinjau dokumen</p>
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

/** id proposal induk (kalau halaman dibuka dari tombol "Buat Konsep PL" di halaman Detail). */
function getProposalIdFromQuery() {
  return new URLSearchParams(window.location.search).get('proposalId') || '';
}

/**
 * @param {HTMLElement} root
 * @param {Session} user
 */
export function initPengajuanKonsepPage(root, user) {
  if (!root) return;

  root.innerHTML = `
    <div class="page-pengajuan">
      <div class="page-pengajuan__intro">
        <h1 class="page-pengajuan__title">Ajukan Konsep Perangkat Lunak</h1>
        <p class="page-pengajuan__subtitle">Lengkapi data proposal beserta dokumen pendukung untuk memulai proses peninjauan.</p>
      </div>

      <form class="card pengajuan-form" id="pengajuan-konsep-form" novalidate>
        <div class="pengajuan-form__grid">
          ${renderTextField({
            id: 'judul-konsep',
            label: 'Judul Konsep PL',
            required: true,
            icon: FILE_ICON,
            placeholder: 'cth. SIMONEV Kinerja Unit',
            errorText: 'Judul proposal wajib diisi.'
          })}
          ${renderTextField({
            id: 'satuan-kerja',
            label: 'Satuan Kerja Pengusul',
            icon: BUILDING_ICON,
            readonly: true
          })}
          ${renderSelectField({
            id: 'jenis-konsep',
            label: 'Jenis Konsep',
            required: true,
            options: JENIS_OPTIONS,
            placeholder: '-- Pilih Jenis Proposal --',
            errorText: 'Jenis proposal wajib dipilih.'
          })}
          ${renderFileField({
            id: 'file-konsep',
            label: 'Upload File Konsep PL',
            required: true,
            errorText: 'File proposal wajib diunggah.'
          })}
          ${renderTextField({
            id: 'nomor-nota-dinas',
            label: 'Nomor Nota Dinas',
            required: true,
            icon: HASH_ICON,
            placeholder: 'cth. ND-114/BTI/07/2026',
            errorText: 'Nomor ND pengajuan wajib diisi.'
          })}
          ${renderFileField({
            id: 'file-nota-dinas',
            label: 'Upload File Nota Dinas',
            required: true,
            errorText: 'File nota dinas wajib diunggah.'
          })}
        </div>

        <div class="pengajuan-form__footer">
          <button class="btn btn-ghost" type="button" data-action="batal">Batal</button>
          <div class="pengajuan-form__footer-right">
            <button class="btn btn-ghost" type="button" data-action="simpan">Simpan</button>
            <button class="btn btn-dark" type="button" data-action="simpan-kirim">Simpan &amp; Kirim</button>
          </div>
        </div>
      </form>

      <div class="pengajuan-preview-grid">
        ${renderPreviewCard({ title: 'File Konsep PL', docTitle: 'File Konsep PL' })}
        ${renderPreviewCard({ title: 'File Nota Dinas', docTitle: 'Dokumen Nota Dinas' })}
      </div>
    </div>
  `;

  // Satuan Kerja Pengusul: read-only, diisi otomatis dari unit yang
  // diwakili LO Biro TI -- bukan input manual milik user.
  const satuanKerjaInput = root.querySelector('#satuan-kerja');
  if (satuanKerjaInput) satuanKerjaInput.value = SATUAN_KERJA_PENGUSUL;

  bindFileInputs(root);
  bindFormActions(root, user);

  // TODO (tahap selanjutnya, belum dikerjakan):
  // - Validasi on-submit yang beneran nge-toggle .field__error
  // - Tombol "Simpan" -> beneran nyimpen sebagai draft (status DRAFT) ke
  //   data/konsep.js, dengan proposalId induknya
  // - Tombol "Simpan & Kirim" -> beneran nyimpen + mulai alur disposisi
  //   (workflow.js)
  // - Kartu pratinjau -> render isi file beneran (bukan skeleton statis)
}

/**
 * "Batal" balik ke halaman asal, "Simpan" / "Simpan & Kirim" nampilin
 * popup sukses lalu pindah halaman (belum nyimpen data beneran).
 */
function bindFormActions(root, user) {
  const proposalId = getProposalIdFromQuery();

  root.querySelector('[data-action="batal"]')?.addEventListener('click', () => {
    router.navigate(proposalId ? `${DETAIL_KONSEP_PATH}?id=${encodeURIComponent(proposalId)}` : MONITORING_KONSEP_PATH);
  });

  // "Simpan" nitipin isi form ke halaman Detail Proposal dan Konsep
  // (belum data beneran dari data/konsep.js -- lihat header file).
  // Isian yang kosong nanti diganti nilai contoh di halaman tujuan.
  root.querySelector('[data-action="simpan"]')?.addEventListener('click', () => {
    const readValue = (selector) => root.querySelector(selector)?.value.trim() || '';
    const readFileName = (id) => {
      const text = root.querySelector(`#${id}-name`)?.textContent.trim();
      return text && text !== 'Tidak ada file yang dipilih' ? text : '';
    };

    saveKonsepDraftHandoff({
      judul: readValue('#judul-konsep'),
      satuanKerja: readValue('#satuan-kerja'),
      pejabatPengusul: user?.name || '',
      fileKonsep: readFileName('file-konsep'),
      fileNotaDinas: readFileName('file-nota-dinas'),
      nomorNotaDinas: readValue('#nomor-nota-dinas')
    });

    showSuccessModal({
      message: 'Data berhasil disimpan.',
      onOk: () => router.navigate(`${DETAIL_PROPOSAL_KONSEP_PATH}${proposalId ? `?proposalId=${encodeURIComponent(proposalId)}` : ''}`)
    });
  });

  root.querySelector('[data-action="simpan-kirim"]')?.addEventListener('click', () => {
    showSuccessModal({
      message: 'Data berhasil dikirim.',
      onOk: () => router.navigate(MONITORING_KONSEP_PATH)
    });
  });
}

/** Tombol "Pilih File" buka native file picker; nama file dipilih ditampilkan di sebelahnya. */
function bindFileInputs(root) {
  root.querySelectorAll('[data-file-trigger]').forEach((btn) => {
    const targetId = btn.getAttribute('data-file-trigger');
    const input = root.querySelector(`#${targetId}`);
    const nameLabel = root.querySelector(`#${targetId}-name`);
    if (!input) return;

    btn.addEventListener('click', () => input.click());
    input.addEventListener('change', () => {
      const file = input.files && input.files[0];
      if (nameLabel) nameLabel.textContent = file ? file.name : 'Tidak ada file yang dipilih';
    });
  });
}