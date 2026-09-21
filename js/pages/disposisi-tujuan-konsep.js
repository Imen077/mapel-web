// ============================================================
// MAPEL - pages/disposisi-tujuan-konsep.js
// "Disposisi Konsep PL" -- lanjutan dari Detail Konsep
// (js/pages/disposisi-konsep.js), dibuka lewat tombol "Disposisi"
// di situ. Beda dari versi Proposal PL (js/pages/disposisi-tujuan.js):
//   - Selalu tampil sebagai HALAMAN PENUH (bukan modal), sesuai
//     contoh tampilan yang dikasih (breadcrumb "Monitoring >
//     Monitoring Proposal" tetap kelihatan di navbar).
//   - Kartu ringkasannya 3 kolom (bukan 2): Judul/Tanggal/Nomor Nota
//     Dinas, lalu Satker Pengusul/Nomor Pengajuan, lalu File Konsep
//     PL/File Nota Dinas -- konsep punya 2 file (proposal cuma
//     ditampilkan filenya di kartu detailnya sendiri, bukan di sini).
//   - Bar subheader "Disposisi Konsep PL" pakai warna hijau tua
//     (.disposisi-tujuan__subheader--konsep di css/pages/review.css),
//     beda dari bar biru tua punya Proposal PL, biar 2 flow ini
//     kebeda pas dilihat.
//
// Daftar pejabat tujuan masih dummy (sama kayak disposisi-tujuan.js),
// 1 pejabat tetap per role sesuai DISPOSISI_CHAIN (js/core/role.js):
// Kepala Biro Ortala -> Kepala Bagian Ortala berikutnya.
//
// TAHAP INI: tombol "Pilih" BELUM beneran ngubah status konsep --
// baru validasi + popup konfirmasi + sukses + balik ke Monitoring
// Konsep PL, sama kayak pola disposisi-tujuan.js.
// ============================================================

import { router } from '../core/router.js';
import { ROLES } from '../core/role.js';
import { konsepService } from '../../data/konsep.js';
import { formatDateTimeFullID } from '../core/format.js';
import { showSuccessModal, showConfirmModal } from '../components/modal.js';

const BACK_ICON = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M19 12H5m0 0 6-6m-6 6 6 6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>';

// Pejabat tujuan disposisi Konsep PL, per role yang lagi login --
// sama seperti DUMMY_PEJABAT_TUJUAN_BY_ROLE di disposisi-tujuan.js,
// tapi 1 tujuan berikutnya di DISPOSISI_CHAIN (bukan daftar terpisah
// milik Proposal PL, biar 2 flow ini gampang disamain kalau nanti
// datanya sama-sama pakai daftar pejabat asli).
const DUMMY_PEJABAT_TUJUAN_KONSEP_BY_ROLE = {
  [ROLES.KEPALA_BIRO_ORTALA]: [
    { nama: 'Telviani Savitri', nip: '240002283', jabatan: 'Kepala Bagian - Biro Organisasi dan Tata Laksana' }
  ]
};
const DEFAULT_PEJABAT_TUJUAN = DUMMY_PEJABAT_TUJUAN_KONSEP_BY_ROLE[ROLES.KEPALA_BIRO_ORTALA];

function getIdFromQuery() {
  return new URLSearchParams(window.location.search).get('id') || '';
}

function renderRingkasanItem(label, value) {
  return `
    <div class="disposisi-tujuan__item">
      <span class="disposisi-tujuan__label">${label}</span>
      <span class="disposisi-tujuan__sep">:</span>
      <span class="disposisi-tujuan__value">${value}</span>
    </div>
  `;
}

function renderPejabatRow(pejabat, index) {
  return `
    <tr>
      <td>${index + 1}</td>
      <td>${pejabat.nama}</td>
      <td>${pejabat.nip}</td>
      <td>${pejabat.jabatan}</td>
      <td>
        <input type="text" class="disposisi-tujuan__input" placeholder="Keterangan..." data-catatan-index="${index}">
      </td>
      <td>
        <button class="btn btn-dark" type="button" data-pilih-index="${index}">Pilih</button>
      </td>
    </tr>
  `;
}

// File belum di-upload/disimpan beneran, jadi nama file tetap contoh
// (sama kayak js/pages/disposisi-konsep.js).
const DEFAULT_FILE_KONSEP = 'konsep-pl.pdf';
const DEFAULT_FILE_NOTA_DINAS = 'nota dinas.pdf';

/**
 * @param {Object} konsep - hasil konsepService.getById()
 */
function buildRingkasanData(konsep) {
  const nomorNotaDinas =
    konsep.nomorNotaDinas || `778/ND/VI.2/${new Date(konsep.createdAt).getMonth() + 1}/${new Date(konsep.createdAt).getFullYear()}`;
  return {
    nomorPengajuan: konsep.nomorPengajuan || konsep.id,
    nomorNotaDinas
  };
}

/**
 * @param {HTMLElement} root
 * @param {Session} user
 */
export function initDisposisiTujuanKonsepPage(root, user) {
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

  const { nomorPengajuan, nomorNotaDinas } = buildRingkasanData(konsep);
  const pejabatTujuan = DUMMY_PEJABAT_TUJUAN_KONSEP_BY_ROLE[user?.role] ?? DEFAULT_PEJABAT_TUJUAN;
  const rows = pejabatTujuan.map(renderPejabatRow).join('');

  root.innerHTML = `
    <div class="review-page">
      <div class="review-page__intro">
        <h1 class="review-page__title">Detail Konsep</h1>
        <p class="review-page__subtitle">Rincian data pengajuan proposal beserta dokumen pendukung.</p>
      </div>

      <div class="card disposisi-tujuan-card">
        <div class="card__header"><h2 class="card__title">Detail Konsep</h2></div>
        <div class="disposisi-tujuan__subheader disposisi-tujuan__subheader--konsep">Disposisi Konsep PL</div>

        <div class="disposisi-tujuan__grid disposisi-tujuan__grid--3col">
          <div class="disposisi-tujuan__col">
            ${renderRingkasanItem('Judul Konsep PL', konsep.title)}
            ${renderRingkasanItem('Tanggal Pengajuan', formatDateTimeFullID(konsep.createdAt))}
            ${renderRingkasanItem('Nomor Nota Dinas', nomorNotaDinas)}
          </div>
          <div class="disposisi-tujuan__col">
            ${renderRingkasanItem('Satker Pengusul', konsep.unit)}
            ${renderRingkasanItem('Nomor Pengajuan', nomorPengajuan)}
          </div>
          <div class="disposisi-tujuan__col">
            ${renderRingkasanItem('File Konsep PL', DEFAULT_FILE_KONSEP)}
            ${renderRingkasanItem('File Nota Dinas', DEFAULT_FILE_NOTA_DINAS)}
          </div>
        </div>

        <div class="data-table-wrap">
          <table class="data-table">
            <thead>
              <tr>
                <th>No</th>
                <th>Nama</th>
                <th>NIP</th>
                <th>Jabatan</th>
                <th>Catatan Disposisi</th>
                <th>Disposisi</th>
              </tr>
            </thead>
            <tbody>
              ${rows}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;

  bindActions(root, pejabatTujuan, backTarget);
}

/**
 * @param {HTMLElement} root
 * @param {Object[]} pejabatTujuan
 * @param {string} backTarget
 */
function bindActions(root, pejabatTujuan, backTarget) {
  root.querySelectorAll('[data-pilih-index]').forEach((btn) => {
    btn.addEventListener('click', () => {
      // index/pejabat/catatan disiapkan buat dipakai begitu tombol
      // "Pilih" ini beneran nyimpen disposisi ke data/konsep.js
      // (belum, lihat catatan TAHAP INI di kepala file) -- sekarang
      // popup sukses-nya masih pesan generik, belum nyebut nama
      // konsep/pejabat tujuannya.
      const index = Number(btn.getAttribute('data-pilih-index'));
      const pejabat = pejabatTujuan[index];
      const catatanInput = root.querySelector(`[data-catatan-index="${index}"]`);
      const catatan = catatanInput?.value.trim();
      void pejabat;
      void catatan;

      showConfirmModal({
        title: 'Apakah anda yakin ingin melakukan disposisi kepada yang bersangkutan?',
        message: 'Data yang didisposisi tidak dapat dikembalikan.',
        cancelLabel: 'Batal',
        confirmLabel: 'Ya',
        onConfirm: () => {
          showSuccessModal({
            message: 'Data berhasil didisposisi.',
            onOk: () => router.navigate(backTarget)
          });
        }
      });
    });
  });
}