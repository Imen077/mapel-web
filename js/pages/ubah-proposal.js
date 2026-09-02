// ============================================================
// MAPEL - pages/ubah-proposal.js
// Halaman "Ubah Proposal Perangkat Lunak" -- dibuka dari tombol
// "Ubah" di halaman Detail Proposal (lihat detail.js). Form ini
// mirip pengajuan-proposal.js (form ajukan baru), tapi field-nya
// sudah diisi data proposal yang lagi diedit, dan kolom file
// menampilkan nama file yang SUDAH ada saat ini (boleh dikosongkan
// kalau tidak mau diganti).
//
// TAHAP INI: sama seperti pengajuan-proposal.js, baru tampilan +
// kartu pratinjau statis. Data proposal yang diedit dioper lewat
// sessionStorage (DRAFT_HANDOFF_KEY, lihat detail.js) -- belum
// benar-benar baca/tulis ke data/proposal.js. Tombol Simpan/
// Simpan & Kirim baru nampilin popup sukses, belum nyimpen
// perubahan sungguhan.
// ============================================================

import { router } from '../core/router.js';
import { showSuccessModal } from '../components/modal.js';
import { readDraftHandoff, saveDraftHandoff } from './detail.js';
import { UNIT_LIST } from '../../data/proposal.js';

const FILE_ICON = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M13 3.5H7a1 1 0 0 0-1 1v15a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V8.5L13 3.5Z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/><path d="M12.5 3.5V8h4.5" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/></svg>';
const HASH_ICON = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M9.5 4 7 20M17 4l-2.5 16M4 9h16M3.5 15h16" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const UPLOAD_ICON = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M12 15V4m0 0-4 4m4-4 4 4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/><path d="M5 15v4a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>';
const CHEVRON_ICON = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="m6 9 6 6 6-6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const DOC_ICON = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M13 3.5H7a1 1 0 0 0-1 1v15a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V8.5L13 3.5Z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/><path d="M12.5 3.5V8h4.5" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/></svg>';

const JENIS_OPTIONS = ['Instruksi Kerja', 'Juknis', 'Standar Pelayanan', 'Pedoman', 'POS'];
const VERSI_OPTIONS = ['Baru', 'Revisi'];

/** Field teks biasa, boleh diisi value awal (mis. dari data yang lagi diedit). */
function renderTextField({ id, label, required, icon, value = '', placeholder, readonly = false }) {
  return `
    <div class="field">
      <label class="field__label" for="${id}">${label}${required ? ' <span class="field__required">*</span>' : ''}</label>
      <div class="field__control${readonly ? ' field__control--readonly' : ''}">
        ${icon ? `<span class="field__icon">${icon}</span>` : ''}
        <input
          class="field__input"
          type="text"
          id="${id}"
          name="${id}"
          value="${value}"
          placeholder="${placeholder || ''}"
          ${readonly ? 'readonly tabindex="-1"' : ''}
        >
      </div>
    </div>
  `;
}

/** Dropdown dengan opsi terpilih sudah di-set (bukan placeholder kosong). */
function renderSelectField({ id, label, required, options, value }) {
  const optionsHtml = options
    .map((opt) => `<option value="${opt}"${opt === value ? ' selected' : ''}>${opt}</option>`)
    .join('');
  return `
    <div class="field">
      <label class="field__label" for="${id}">${label}${required ? ' <span class="field__required">*</span>' : ''}</label>
      <div class="field__control field__control--select">
        <select class="field__input" id="${id}" name="${id}">${optionsHtml}</select>
        <span class="field__chevron">${CHEVRON_ICON}</span>
      </div>
    </div>
  `;
}

/** Grup radio (mis. Versi Proposal: Baru / Revisi). */
function renderRadioField({ id, label, options, selected }) {
  const radios = options
    .map(
      (opt) => `
        <label class="field__radio">
          <input type="radio" name="${id}" value="${opt}" ${opt === selected ? 'checked' : ''}>
          <span>${opt}</span>
        </label>
      `
    )
    .join('');
  return `
    <div class="field">
      <span class="field__label">${label}</span>
      <div class="field__radio-group">${radios}</div>
    </div>
  `;
}

/** Kolom upload buat MENGGANTI file yang sudah ada -- nampilin nama file saat ini + boleh dikosongkan. */
function renderFileFieldEdit({ id, label, currentFileName }) {
  return `
    <div class="field">
      <label class="field__label" for="${id}">${label}</label>
      ${currentFileName ? `<p class="field__current-file">${currentFileName}</p>` : ''}
      <div class="field__file">
        <button class="field__file-btn" type="button" data-file-trigger="${id}">${UPLOAD_ICON} Pilih File</button>
        <span class="field__file-name" id="${id}-name">Tidak ada file yang dipilih</span>
        <input class="field__file-input" type="file" id="${id}" name="${id}" hidden>
      </div>
      <p class="field__hint">Kosongkan jika tidak ingin mengganti.</p>
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

/**
 * @param {HTMLElement} root
 * @param {Session} user
 */
export function initUbahProposalPage(root, user) {
  if (!root) return;

  // Data proposal yang lagi diedit -- dioper dari Detail Proposal
  // (tombol "Ubah") lewat sessionStorage yang sama dengan handoff
  // draft. Kalau dibuka langsung tanpa lewat situ, pakai contoh
  // generik supaya form tidak kosong.
  const draft = readDraftHandoff() ?? {
    judul: 'Proposal POS Pengujian Website',
    satuanKerja: 'Biro Teknologi Informasi',
    pejabatPengusul: user?.name || '-',
    fileProposal: 'test.pdf',
    fileNotaDinas: 'test.pdf'
  };
  const jenisProposal = draft.jenisProposal || 'POS';
  const nomorND = draft.nomorND || '123';
  const versiProposal = draft.versiProposal || 'Baru';

  root.innerHTML = `
    <div class="page-pengajuan">
      <div class="page-pengajuan__intro">
        <h1 class="page-pengajuan__title">Ubah Proposal Perangkat Lunak</h1>
        <p class="page-pengajuan__subtitle">Perbarui data proposal. Kosongkan kolom file jika tidak ingin menggantinya.</p>
      </div>

      <form class="card pengajuan-form" id="ubah-proposal-form" novalidate>
        <div class="pengajuan-form__grid">
          <div class="pengajuan-form__col">
            ${renderTextField({
              id: 'judul-proposal',
              label: 'Judul Proposal',
              required: true,
              icon: FILE_ICON,
              value: draft.judul
            })}
            ${renderSelectField({
              id: 'jenis-proposal',
              label: 'Jenis PL Id',
              required: true,
              options: JENIS_OPTIONS,
              value: jenisProposal
            })}
            ${renderTextField({
              id: 'nomor-nd',
              label: 'Nomor ND Pengajuan',
              required: true,
              icon: HASH_ICON,
              value: nomorND
            })}
            ${renderRadioField({
              id: 'versi-proposal',
              label: 'Versi Proposal',
              options: VERSI_OPTIONS,
              selected: versiProposal
            })}
          </div>
          <div class="pengajuan-form__col">
            ${renderSelectField({
              id: 'satuan-kerja',
              label: 'SatkerId',
              required: true,
              options: UNIT_LIST,
              value: draft.satuanKerja
            })}
            ${renderFileFieldEdit({
              id: 'file-proposal',
              label: 'File Proposal',
              currentFileName: draft.fileProposal
            })}
            ${renderFileFieldEdit({
              id: 'file-nota-dinas',
              label: 'File Nota Dinas',
              currentFileName: draft.fileNotaDinas
            })}
          </div>
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
        ${renderPreviewCard({ title: 'File Proposal', docTitle: 'Dokumen Proposal' })}
        ${renderPreviewCard({ title: 'File Nota Dinas', docTitle: 'Dokumen Nota Dinas' })}
      </div>
    </div>
  `;

  bindFileInputs(root);
  bindFormActions(root, user, draft);

  // TODO (tahap selanjutnya, belum dikerjakan sesuai arahan):
  // - Validasi on-submit
  // - Simpan/Simpan & Kirim beneran nulis perubahan ke data/proposal.js
  //   (sekarang cuma nge-update handoff sessionStorage + popup sukses)
  // - Kartu pratinjau -> render isi file beneran (bukan skeleton statis)
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

function bindFormActions(root, user, draft) {
  root.querySelector('[data-action="batal"]')?.addEventListener('click', () => {
    router.navigate('/pages/lo-biro-ti/antrian/proposal-pl.html');
  });

  /** Kumpulin nilai form saat ini jadi object draft terbaru buat dioper ke halaman berikutnya. */
  function collectFormDraft() {
    const judul = root.querySelector('#judul-proposal')?.value.trim();
    const fileProposalName = root.querySelector('#file-proposal-name')?.textContent.trim();
    const fileNotaDinasName = root.querySelector('#file-nota-dinas-name')?.textContent.trim();
    return {
      ...draft,
      judul: judul || draft.judul,
      pejabatPengusul: user?.name || draft.pejabatPengusul,
      jenisProposal: root.querySelector('#jenis-proposal')?.value || draft.jenisProposal,
      satuanKerja: root.querySelector('#satuan-kerja')?.value || draft.satuanKerja,
      nomorND: root.querySelector('#nomor-nd')?.value.trim() || draft.nomorND,
      versiProposal: root.querySelector('input[name="versi-proposal"]:checked')?.value || draft.versiProposal,
      // File yang dipilih ulang menang; kalau dikosongkan (sesuai
      // niatnya "kosongkan jika tidak ingin mengganti"), tetap pakai
      // nama file yang lama.
      fileProposal: fileProposalName && fileProposalName !== 'Tidak ada file yang dipilih' ? fileProposalName : draft.fileProposal,
      fileNotaDinas: fileNotaDinasName && fileNotaDinasName !== 'Tidak ada file yang dipilih' ? fileNotaDinasName : draft.fileNotaDinas
    };
  }

  root.querySelector('[data-action="simpan"]')?.addEventListener('click', () => {
    saveDraftHandoff(collectFormDraft());
    showSuccessModal({
      message: 'Perubahan data berhasil disimpan',
      onOk: () => router.navigate('/pages/lo-biro-ti/antrian/detail.html')
    });
  });

  root.querySelector('[data-action="simpan-kirim"]')?.addEventListener('click', () => {
    saveDraftHandoff(collectFormDraft());
    showSuccessModal({
      message: 'Perubahan data berhasil dikirim',
      onOk: () => router.navigate('/pages/lo-biro-ti/monitoring/proposal-pl.html')
    });
  });
}