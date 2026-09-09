// ============================================================
// MAPEL - pages/disposisi-tujuan.js
// Halaman "Disposisi Proposal PL" -- lanjutan dari Detail Proposal
// (js/pages/disposisi.js), dibuka Kepala Biro Ortala setelah klik
// tombol "Disposisi" di situ. Nampilin ringkasan proposal + daftar
// pejabat tujuan disposisi berikutnya (Kepala Bagian, sesuai
// DISPOSISI_CHAIN di js/core/role.js), tiap baris bisa diisi
// catatan lalu "Pilih" buat neruskan proposal ke pejabat itu.
//
// TAHAP INI: daftar pejabat masih dummy (DUMMY_PEJABAT_TUJUAN di
// bawah, cuma 1 baris sesuai desain), dan tombol "Pilih" BELUM
// beneran ngubah status proposal -- baru validasi + popup feedback +
// balik ke Monitoring, sama kayak halaman-halaman sejenis lainnya.
// ============================================================

import { router } from '../core/router.js';
import { proposalService } from '../../data/proposal.js';
import { formatDateTimeFullID } from '../core/format.js';
import { showSuccessModal } from '../components/modal.js';

const BACK_ICON = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M19 12H5m0 0 6-6m-6 6 6 6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>';

// Daftar pejabat tujuan disposisi -- next di DISPOSISI_CHAIN sesudah
// Kepala Biro Ortala adalah Kepala Bagian, jadi daftarnya orang-orang
// di posisi itu (dummy 1 orang dulu, sesuai desain yang ada).
const DUMMY_PEJABAT_TUJUAN = [
  { nama: 'Telviani Savitri', nip: '240002283', jabatan: 'Kepala Bagian - Biro Organisasi dan Tata Laksana' }
];

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

  const nomorPengajuan = item.nomorPengajuan || item.id;
  // Nomor Nota Dinas belum ada field-nya sendiri di data/proposal.js
  // (beda dari Konsep PL yang sudah punya nomorPengajuan format
  // birokrasi) -- diturunin dari nomorPengajuan biar tetap ada
  // isinya & formatnya konsisten sama contoh desain.
  const nomorNotaDinas = `778/ND/VI.2/${new Date(item.createdAt).getMonth() + 1}/${new Date(item.createdAt).getFullYear()}`;

  const rows = DUMMY_PEJABAT_TUJUAN.map(renderPejabatRow).join('');

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

  bindActions(root, item, backTarget);
}

function bindActions(root, item, backTarget) {
  root.querySelectorAll('[data-pilih-index]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const index = Number(btn.getAttribute('data-pilih-index'));
      const pejabat = DUMMY_PEJABAT_TUJUAN[index];
      const catatanInput = root.querySelector(`[data-catatan-index="${index}"]`);
      const catatan = catatanInput?.value.trim();

      showSuccessModal({
        message: `Proposal "${item.title}" berhasil didisposisikan ke ${pejabat.nama} (${pejabat.jabatan})${catatan ? ` dengan catatan: "${catatan}"` : ''}.`,
        onOk: () => router.navigate(backTarget)
      });
    });
  });
}