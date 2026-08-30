// ============================================================
// MAPEL - pages/dashboard.js
// Render konten dashboard. Isinya beda per role (lihat spek di
// role.js -> ROLES_WITH_FULL_DASHBOARD), jadi file ini jadi
// router kecil ke masing-masing varian render*Dashboard().
// Varian Pegawai & LO Biro TI sudah diisi; role lain menyusul.
// ============================================================

import { ROLES } from '../core/role.js';
import { libraryService } from '../../data/library.js';

const DOWNLOAD_ICON = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M12 3v12m0 0 4-4m-4 4-4-4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/><path d="M5 17v2a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-2" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>';
const VIEW_ICON = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><circle cx="12" cy="12" r="2.6" stroke="currentColor" stroke-width="1.8"/></svg>';
const ARROW_ICON = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M5 12h14m0 0-5-5m5 5-5 5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';

/** @param {{rank:number, name:string, unit:string, value:number, icon:string}[]} rows */
function renderRankList(rows) {
  return rows
    .map(
      (row) => `
        <li class="rank-list__row">
          <span class="rank-badge${row.rank === 1 ? ' rank-badge--top' : ''}">${row.rank}</span>
          <div class="rank-list__info">
            <span class="rank-list__name">${row.name}</span>
            <span class="rank-list__unit">${row.unit}</span>
          </div>
          <span class="rank-list__value">${row.icon}${row.value.toLocaleString('id-ID')}</span>
        </li>
      `
    )
    .join('');
}

function renderPegawaiDashboard(user) {
  const topDownloads = libraryService.getTopDownloads(5);
  const topViews = libraryService.getTopViews(5);

  const downloadRows = topDownloads.map((item, i) => ({
    rank: i + 1,
    name: item.name,
    unit: item.unit,
    value: item.downloads,
    icon: DOWNLOAD_ICON
  }));

  const viewRows = topViews.map((item, i) => ({
    rank: i + 1,
    name: item.name,
    unit: item.unit,
    value: item.views,
    icon: VIEW_ICON
  }));

  return `
    <div class="dashboard">
      <div class="dashboard__intro">
        <p class="dashboard__greeting">Selamat datang kembali, <strong>${user.name}</strong> 👋</p>
        <h1 class="dashboard__title">Ringkasan Peninjauan Perangkat Lunak</h1>
        <p class="dashboard__subtitle">Status pengajuan perangkat lunak dari seluruh unit pusat dan perwakilan.</p>
      </div>

      <div class="card-feature">
        <p class="eyebrow card-feature__eyebrow">Library Perangkat Lunak</p>
        <h2 class="card-feature__title">Katalog referensi terpusat</h2>
        <p class="card-feature__desc">Telusuri seluruh perangkat lunak yang telah terdaftar dari satuan kerja pusat maupun perwakilan.</p>
        <a class="btn btn-gold" href="#" data-path="/pages/pegawai/library.html">
          Akses library ${ARROW_ICON}
        </a>
      </div>

      <div class="dashboard__grid">
        <section class="card rank-list-card">
          <div class="card__header">
            <h3 class="card__title">Top Download</h3>
          </div>
          <ul class="rank-list">
            ${renderRankList(downloadRows)}
          </ul>
        </section>

        <section class="card rank-list-card">
          <div class="card__header">
            <h3 class="card__title">Top View</h3>
          </div>
          <ul class="rank-list">
            ${renderRankList(viewRows)}
          </ul>
        </section>
      </div>
    </div>
  `;
}

/**
 * Varian dashboard "standar" (Pegawai+): sama seperti Pegawai
 * (Top Download/Top View + ajakan Library), ditambah baris kartu
 * ringkas di atas -- total perangkat lunak yang diajukan, dan
 * kartu Library versi ringkas (bukan banner penuh) berdampingan.
 * Dipakai LO Biro TI & Kepala Satker Biro TI -- spek keduanya
 * sama persis (lihat ROLE_MENUS di core/role.js), cuma beda folder
 * halaman Library-nya masing-masing.
 * @param {Session} user
 * @param {string} libraryPath - path halaman Library milik role ini
 */
function renderStandardDashboard(user, libraryPath) {
  const totalPerangkatLunak = libraryService.getTotalCount();
  const topDownloads = libraryService.getTopDownloads(5);
  const topViews = libraryService.getTopViews(5);

  const downloadRows = topDownloads.map((item, i) => ({
    rank: i + 1,
    name: item.name,
    unit: item.unit,
    value: item.downloads,
    icon: DOWNLOAD_ICON
  }));

  const viewRows = topViews.map((item, i) => ({
    rank: i + 1,
    name: item.name,
    unit: item.unit,
    value: item.views,
    icon: VIEW_ICON
  }));

  return `
    <div class="dashboard">
      <div class="dashboard__intro">
        <p class="dashboard__greeting">Selamat datang kembali, <strong>${user.name}</strong> 👋</p>
        <h1 class="dashboard__title">Ringkasan Peninjauan Perangkat Lunak</h1>
        <p class="dashboard__subtitle">Status pengajuan perangkat lunak dari seluruh unit pusat dan perwakilan.</p>
      </div>

      <div class="dashboard__top-grid">
        <section class="card stat-card">
          <p class="eyebrow stat-card__eyebrow">Total Perangkat Lunak</p>
          <p class="stat-card__value">${totalPerangkatLunak}</p>
          <p class="stat-card__desc">Seluruh perangkat lunak yang diajukan</p>
        </section>

        <div class="card-feature card-feature--compact">
          <p class="eyebrow card-feature__eyebrow">Library Perangkat Lunak</p>
          <h2 class="card-feature__title">Katalog referensi terpusat</h2>
          <p class="card-feature__desc">Telusuri seluruh perangkat lunak yang telah terdaftar dari satuan kerja pusat maupun perwakilan.</p>
          <a class="btn btn-gold btn-block" href="#" data-path="${libraryPath}">
            Akses library ${ARROW_ICON}
          </a>
        </div>
      </div>

      <div class="dashboard__grid">
        <section class="card rank-list-card">
          <div class="card__header">
            <h3 class="card__title">Top Download</h3>
          </div>
          <ul class="rank-list">
            ${renderRankList(downloadRows)}
          </ul>
        </section>

        <section class="card rank-list-card">
          <div class="card__header">
            <h3 class="card__title">Top View</h3>
          </div>
          <ul class="rank-list">
            ${renderRankList(viewRows)}
          </ul>
        </section>
      </div>
    </div>
  `;
}

/**
 * @param {HTMLElement} root - elemen tempat konten dashboard dipasang
 * @param {Session} user
 */
export function initDashboardPage(root, user) {
  if (!root) return;

  switch (user.role) {
    case ROLES.PEGAWAI:
      root.innerHTML = renderPegawaiDashboard(user);
      break;
    case ROLES.LO_BIRO_TI:
      root.innerHTML = renderStandardDashboard(user, '/pages/lo-biro-ti/library.html');
      break;
    case ROLES.KEPALA_SATKER_BIRO_TI:
      root.innerHTML = renderStandardDashboard(user, '/pages/kepala-satker-biro-ti/library.html');
      break;
    default:
      // TODO: varian dashboard role lain (rantai Ortala -- "dashboard
      // lengkap" dengan grafik & data PL) -- menyusul.
      root.innerHTML = `
        <div class="dashboard">
          <p class="dashboard__subtitle">Dashboard untuk role ini sedang dalam pengembangan.</p>
        </div>
      `;
  }

  // Aktifkan link internal (mis. tombol "Akses library") lewat router,
  // bukan reload penuh <a href="#">.
  root.querySelectorAll('a[data-path]').forEach((el) => {
    el.addEventListener('click', (event) => {
      event.preventDefault();
      // Sengaja belum di-wire ke navigasi nyata -- halaman tujuannya
      // masih placeholder. Diaktifkan pas Library dikerjakan.
    });
  });
}