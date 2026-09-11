// ============================================================
// MAPEL - pages/disposisi-tujuan.js
// "Disposisi Proposal PL" -- lanjutan dari Detail Proposal
// (js/pages/disposisi.js), dibuka lewat tombol "Disposisi" di situ.
// SEKARANG tampil sebagai MODAL popup (openDisposisiTujuanModal,
// dipanggil langsung dari disposisi.js) di atas halaman Detail
// Proposal yang lagi dibuka -- bukan navigasi ke halaman baru lagi
// (lihat riwayat git buat versi lamanya yang full-page). Nampilin
// ringkasan proposal + daftar pejabat tujuan disposisi berikutnya
// (sesuai DISPOSISI_CHAIN di js/core/role.js), tiap baris bisa diisi
// catatan lalu "Pilih" buat neruskan proposal ke pejabat itu.
//
// initDisposisiTujuanPage() (versi halaman penuh) SENGAJA masih
// dibiarkan di bawah -- tidak ada lagi yang manggil lewat
// router.navigate(), tapi tetap jalan kalau dibuka langsung lewat
// URL-nya (monitoring/disposisi-tujuan.html), jadi tidak dihapus.
//
// TAHAP INI: daftar pejabat masih dummy (DUMMY_PEJABAT_TUJUAN_BY_ROLE
// di bawah), dan tombol "Pilih" BELUM beneran ngubah status proposal
// -- baru validasi + popup feedback + balik ke Monitoring, sama
// kayak halaman-halaman sejenis lainnya.
// ============================================================

import { router } from '../core/router.js';
import { ROLES } from '../core/role.js';
import { proposalService } from '../../data/proposal.js';
import { formatDateTimeFullID } from '../core/format.js';
import { showSuccessModal, showConfirmModal } from '../components/modal.js';

const BACK_ICON = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M19 12H5m0 0 6-6m-6 6 6 6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const CLOSE_ICON = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M6 6l12 12M18 6 6 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>';

// Daftar pejabat tujuan disposisi -- beda-beda tergantung siapa yang
// lagi login, soalnya tujuannya harus pejabat di LANGKAH BERIKUTNYA
// di DISPOSISI_CHAIN (js/core/role.js), bukan diri sendiri. Masih
// dummy (belum baca data pejabat beneran).
const DUMMY_PEJABAT_TUJUAN_BY_ROLE = {
  [ROLES.KEPALA_BIRO_ORTALA]: [
    { nama: 'Telviani Savitri', nip: '240002283', jabatan: 'Kepala Bagian - Biro Organisasi dan Tata Laksana' }
  ],
  [ROLES.KEPALA_BAGIAN_ORTALA]: [
    { nama: 'Dimas Prasetyo', nip: '240008842', jabatan: 'Kepala Subbagian - Biro Organisasi dan Tata Laksana' }
  ],
  // 6 pilihan pereviu (bukan 1 kayak role lain di atas) -- sesuai
  // contoh tampilan yang dikasih: Kasubbag boleh milih siapa aja dari
  // daftar pereviu Biro Organisasi dan Tata Laksana buat diteruskan,
  // bukan cuma 1 pejabat tetap di langkah berikutnya.
  [ROLES.KEPALA_SUBBAGIAN_ORTALA]: [
    { nama: 'Meilany Mona Riska', nip: '240004009', jabatan: 'Pereviu - Biro Organisasi dan Tata Laksana' },
    { nama: 'Kusmayanti Meilani', nip: '240002867', jabatan: 'Pereviu - Biro Organisasi dan Tata Laksana' },
    { nama: 'Arny Fitriana Satyawati', nip: '240003585', jabatan: 'Pereviu - Biro Organisasi dan Tata Laksana' },
    { nama: 'Mochammad Taufik', nip: '240007477', jabatan: 'Pereviu - Biro Organisasi dan Tata Laksana' },
    { nama: 'Ita Yuliana', nip: '240002781', jabatan: 'Pereviu - Biro Organisasi dan Tata Laksana' },
    { nama: 'Budiyekti Nugrahani', nip: '240004530', jabatan: 'Pereviu - Biro Organisasi dan Tata Laksana' }
  ]
};
const DEFAULT_PEJABAT_TUJUAN = DUMMY_PEJABAT_TUJUAN_BY_ROLE[ROLES.KEPALA_BIRO_ORTALA];

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

/**
 * Kumpulin data turunan yang dibutuhin baik oleh modal maupun versi
 * halaman penuh (nomorPengajuan, Nomor Nota Dinas, daftar pejabat
 * tujuan) -- dipisah ke sini biar 2 tempat itu tidak duplikasi logic.
 * @param {Object} item - hasil proposalService.getById()
 * @param {Session} user
 */
function buildDisposisiTujuanData(item, user) {
  const nomorPengajuan = item.nomorPengajuan || item.id;
  // Nomor Nota Dinas: dari data/proposal.js kalau item-nya sudah
  // punya field `nomorNotaDinas` sendiri (dummy testing yang perlu
  // angka spesifik, mis. PO-2026-043 buat Kepala Subbagian Ortala),
  // fallback ke rumus generik yang diturunin dari createdAt.
  const nomorNotaDinas =
    item.nomorNotaDinas || `778/ND/VI.2/${new Date(item.createdAt).getMonth() + 1}/${new Date(item.createdAt).getFullYear()}`;
  const pejabatTujuan = DUMMY_PEJABAT_TUJUAN_BY_ROLE[user?.role] ?? DEFAULT_PEJABAT_TUJUAN;
  return { nomorPengajuan, nomorNotaDinas, pejabatTujuan };
}

/**
 * @param {HTMLElement} root
 * @param {Session} user
 */
export function initDisposisiTujuanPage(root, user) {
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

  const { nomorPengajuan, nomorNotaDinas, pejabatTujuan } = buildDisposisiTujuanData(item, user);
  const rows = pejabatTujuan.map(renderPejabatRow).join('');

  root.innerHTML = `
    <div class="review-page">
      <div class="review-page__intro">
        <h1 class="review-page__title">Detail Proposal</h1>
        <p class="review-page__subtitle">Rincian data pengajuan proposal beserta dokumen pendukung.</p>
      </div>

      <div class="card disposisi-tujuan-card">
        <div class="card__header"><h2 class="card__title">Detail Proposal</h2></div>
        <div class="disposisi-tujuan__subheader">Disposisi Proposal PL</div>

        <div class="disposisi-tujuan__grid">
          <div class="disposisi-tujuan__col">
            ${renderRingkasanItem('Judul Proposal', item.title)}
            ${renderRingkasanItem('Tanggal Pengajuan', formatDateTimeFullID(item.createdAt))}
            ${renderRingkasanItem('Nomor Nota Dinas', nomorNotaDinas)}
          </div>
          <div class="disposisi-tujuan__col">
            ${renderRingkasanItem('Satker Pengusul', item.unit)}
            ${renderRingkasanItem('Nomor Pengajuan', nomorPengajuan)}
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
 * @param {HTMLElement} root - scope tempat cari tombol "Pilih" (bisa
 *   root halaman biasa, bisa juga elemen modal).
 * @param {Object[]} pejabatTujuan
 * @param {string} backTarget
 * @param {Object} [options]
 * @param {() => void} [options.onDisposed] - dipanggil pas popup sukses
 *   ditutup (OK), GANTI perilaku default (router.navigate(backTarget)
 *   langsung) -- dipakai versi modal buat nutup modal-nya dulu
 *   sebelum pindah halaman.
 */
function bindActions(root, pejabatTujuan, backTarget, { onDisposed } = {}) {
  root.querySelectorAll('[data-pilih-index]').forEach((btn) => {
    btn.addEventListener('click', () => {
      // index/pejabat/catatan disiapkan buat dipakai begitu tombol
      // "Pilih" ini beneran nyimpen disposisi ke data/proposal.js
      // (belum, lihat catatan TAHAP INI di kepala file) -- sekarang
      // popup sukses-nya masih pesan generik, belum nyebut nama
      // proposal/pejabat tujuannya.
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
            onOk: () => (onDisposed ? onDisposed() : router.navigate(backTarget))
          });
        }
      });
    });
  });
}

/**
 * Buka "Disposisi Proposal PL" sebagai MODAL popup di atas halaman
 * Detail Proposal yang lagi kebuka -- dipanggil langsung dari tombol
 * "Disposisi" di js/pages/disposisi.js. Ini yang SEKARANG dipakai
 * (gantiin router.navigate() ke halaman disposisi-tujuan.html yang
 * lama, lihat initDisposisiTujuanPage di atas -- masih dibiarin buat
 * kompatibilitas kalau halamannya dibuka langsung lewat URL).
 * @param {Object} item - hasil proposalService.getById(), WAJIB sudah
 *   dicek tidak null oleh pemanggil (disposisi.js sudah begitu).
 * @param {Session} user
 * @param {Object} [options]
 * @param {() => void} [options.onDisposed] - opsional, GANTI perilaku
 *   default (nutup modal ini lalu router.navigate(backTarget)) kalau
 *   suatu saat modal ini perlu dibuka dari konteks lain yang nggak
 *   butuh navigate. Sekarang belum ada pemanggil yang pakai ini --
 *   initDisposisiPage (js/pages/disposisi.js) manggil tanpa `options`,
 *   jadi tetap pakai perilaku default (navigate balik ke Monitoring).
 */
export function openDisposisiTujuanModal(item, user, { onDisposed } = {}) {
  const backTarget = `/pages/${user?.role}/monitoring/proposal-pl.html`;
  const { nomorPengajuan, nomorNotaDinas, pejabatTujuan } = buildDisposisiTujuanData(item, user);
  const rows = pejabatTujuan.map(renderPejabatRow).join('');

  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = `
    <div class="modal-dialog modal-dialog--wide" role="dialog" aria-modal="true" aria-labelledby="disposisi-modal-title">
      <button type="button" class="modal-dialog__close" data-modal-close aria-label="Tutup">${CLOSE_ICON}</button>
      <div class="modal-dialog__header">
        <h2 class="modal-dialog__header-title" id="disposisi-modal-title">Disposisi Proposal PL</h2>
      </div>
      <div class="modal-dialog__body">
        <div class="disposisi-modal__grid">
          ${renderRingkasanItem('Judul Proposal', item.title)}
          ${renderRingkasanItem('Satker Pengusul', item.unit)}
          ${renderRingkasanItem('Tanggal Pengajuan', formatDateTimeFullID(item.createdAt))}
          ${renderRingkasanItem('Nomor Pengajuan', nomorPengajuan)}
          ${renderRingkasanItem('Nomor Nota Dinas', nomorNotaDinas)}
          <div class="disposisi-tujuan__item">
            <span class="disposisi-tujuan__label">Prioritas</span>
            <span class="disposisi-tujuan__sep">:</span>
            <label class="toggle">
              <input type="checkbox" class="toggle__input" data-prioritas-toggle>
              <span class="toggle__track"><span class="toggle__thumb"></span></span>
            </label>
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

  function close() {
    document.removeEventListener('keydown', onKeydown);
    overlay.remove();
  }

  function onKeydown(event) {
    if (event.key === 'Escape') close();
  }

  overlay.querySelector('[data-modal-close]').addEventListener('click', close);
  // Klik area gelap di luar dialog juga nutup modal (batal, tanpa efek).
  overlay.addEventListener('click', (event) => {
    if (event.target === overlay) close();
  });
  document.addEventListener('keydown', onKeydown);

  bindActions(overlay, pejabatTujuan, backTarget, {
    onDisposed: () => {
      close();
      if (onDisposed) onDisposed();
      else router.navigate(backTarget);
    }
  });

  document.body.appendChild(overlay);
}