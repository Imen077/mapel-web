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
const CHEVRON_ICON = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="m6 9 6 6 6-6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const DOC_ICON = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M13 3.5H7a1 1 0 0 0-1 1v15a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V8.5L13 3.5Z" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/><path d="M13 3.5V8h4.5" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/></svg>';
const PAGE_ARROW_LEFT = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="m15 6-6 6 6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const PAGE_ARROW_RIGHT = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="m9 6 6 6-6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';

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
 * Dashboard LO Biro TI: sama seperti Pegawai (Top Download/Top
 * View + ajakan Library), ditambah baris kartu ringkas di atas --
 * total perangkat lunak yang diajukan, dan kartu Library versi
 * ringkas (bukan banner penuh) berdampingan.
 * @param {Session} user
 */
function renderLoDashboard(user) {
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
          <a class="btn btn-gold btn-block" href="#" data-path="/pages/lo-biro-ti/library.html">
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

const ESELON_DATA = [
  { unit: 'Biro Sumber Daya Manusia', count: 1 },
  { unit: 'Biro Keuangan', count: 1 },
  { unit: 'Biro Teknologi Informasi', count: 59 },
  { unit: 'Biro Umum', count: 3 },
  { unit: 'Biro Organisasi dan Tatalaksana', count: 1 },
  { unit: 'BPK Perwakilan Provinsi Jambi', count: 1 },
  { unit: 'BPK Perwakilan Provinsi Jawa Barat', count: 1 },
  { unit: 'BPK Perwakilan Provinsi Bali', count: 1 }
];

const JENIS_CHART_DATA = [
  { label: 'Pedoman', value: 13 },
  { label: 'Pos', value: 26 },
  { label: 'Standar Pelayanan', value: 7 },
  { label: 'Instruksi Kerja', value: 12 },
  { label: 'Juknis', value: 3 },
  { label: 'Panduan', value: 8 },
  { label: 'Juklak', value: 2 },
  { label: 'Standar Operasional Lainnya', value: 8 }
];

/** @param {{unit:string, count:number}[]} rows */
function renderEselonList(rows) {
  const max = Math.max(...rows.map((r) => r.count));

  return rows
    .map((row) => {
      const widthPct = Math.max((row.count / max) * 100, 6); // lantai 6% biar nilai kecil tetap keliatan
      return `
        <li class="eselon-row">
          <span class="eselon-row__label">${row.unit}</span>
          <span class="eselon-row__track">
            <span class="eselon-row__fill" style="width:${widthPct}%"></span>
          </span>
          <span class="eselon-row__value">${row.count}</span>
        </li>
      `;
    })
    .join('');
}

/** @param {{label:string, value:number}[]} rows */
function renderJenisChart(rows) {
  const axisMax = 40; // TODO: hitung otomatis dari data asli begitu sudah tersedia
  const gridLines = [40, 30, 20, 10, 0];

  const bars = rows
    .map((row) => {
      const heightPct = (row.value / axisMax) * 100;
      return `
        <div class="jenis-chart__bar-col">
          <span class="jenis-chart__bar-value">${row.value}</span>
          <div class="jenis-chart__bar" style="height:${heightPct}%"></div>
          <span class="jenis-chart__bar-label">${row.label}</span>
        </div>
      `;
    })
    .join('');

  const grid = gridLines
    .map((val) => `<div class="jenis-chart__gridline"><span>${val}</span></div>`)
    .join('');

  return `
    <div class="jenis-chart">
      <div class="jenis-chart__grid">${grid}</div>
      <div class="jenis-chart__bars">${bars}</div>
    </div>
  `;
}

const FLOW_STATUS_META = {
  antrian: { label: 'Antrian', bg: 'var(--color-stamp-soft)', text: 'var(--color-stamp-dark)' },
  proses: { label: 'Proses', bg: 'var(--color-gold-soft)', text: '#8a641f' },
  selesai: { label: 'Selesai', bg: 'var(--color-success-soft)', text: 'var(--color-success)' }
};

const USULAN_PAGE_SIZE = 4;

// 4 item pertama sesuai contoh; sisanya dummy tambahan supaya
// pagination punya beberapa halaman buat dites (lihat pola yang
// sama di data/antrian-konsep.js).
const USULAN_TERBARU_DATA = [
  { title: 'SIMONEV Kinerja Unit', unit: 'Biro Teknologi Informasi', tanggal: '21 Jul 2026', status: 'antrian' },
  { title: 'Aplikasi Presensi Perwakilan', unit: 'BPK Perwakilan Provinsi Bali', tanggal: '20 Jul 2026', status: 'proses' },
  { title: 'Portal Layanan Kepegawaian', unit: 'Biro Sumber Daya Manusia', tanggal: '18 Jul 2026', status: 'selesai' },
  { title: 'Sistem Arsip Digital Terpadu', unit: 'Biro Umum', tanggal: '17 Jul 2026', status: 'antrian' }
];

const USULAN_FILLER_POOL = [
  ['Kebijakan dan Pedoman Manajemen Risiko TI', 'Biro Teknologi Informasi'],
  ['Portal Pengaduan Masyarakat', 'Biro Umum'],
  ['Modul Evaluasi Kinerja ASN', 'Biro Organisasi dan Tatalaksana'],
  ['e-Arsip Kepegawaian Perwakilan', 'BPK Perwakilan Provinsi Jambi'],
  ['Sistem Informasi Perjalanan Dinas', 'BPK Perwakilan Provinsi Bali'],
  ['Dashboard Monitoring Anggaran', 'Biro Keuangan'],
  ['Aplikasi Survei Kepuasan Layanan', 'Biro Umum'],
  ['Portal Onboarding Pegawai Baru', 'Biro Sumber Daya Manusia']
];
const USULAN_STATUS_CYCLE = ['antrian', 'proses', 'selesai'];
USULAN_FILLER_POOL.forEach(([title, unit], i) => {
  for (let j = 0; j < 4; j++) {
    USULAN_TERBARU_DATA.push({
      title: `${title}${j > 0 ? ` (Revisi ${j})` : ''}`,
      unit,
      tanggal: `${10 - j} Jun 2026`,
      status: USULAN_STATUS_CYCLE[(i + j) % USULAN_STATUS_CYCLE.length]
    });
  }
});

/** @param {typeof USULAN_TERBARU_DATA} rows */
function renderUsulanRows(rows) {
  return rows
    .map((item) => {
      const meta = FLOW_STATUS_META[item.status];
      return `
        <li class="usulan-row">
          <span class="usulan-row__icon" style="background:${meta.bg};color:${meta.text}">${DOC_ICON}</span>
          <div class="usulan-row__info">
            <span class="usulan-row__title">${item.title}</span>
            <span class="usulan-row__meta">${item.unit} · ${item.tanggal}</span>
          </div>
          <span class="badge badge--tint" style="--tint-bg:${meta.bg};--tint-text:${meta.text}">${meta.label}</span>
        </li>
      `;
    })
    .join('');
}

/** @param {number} page @param {number} totalPages */
function renderUsulanPagination(page, totalPages) {
  if (totalPages <= 1) return '';

  const pages = new Set([1, totalPages, page, page - 1, page + 1]);
  const sorted = [...pages].filter((p) => p >= 1 && p <= totalPages).sort((a, b) => a - b);

  let lastRendered = 0;
  const items = sorted
    .map((p) => {
      const needsEllipsis = p - lastRendered > 1;
      lastRendered = p;
      const ellipsis = needsEllipsis ? '<span class="pagination__ellipsis">…</span>' : '';
      return `${ellipsis}<button class="pagination__page${p === page ? ' pagination__page--active' : ''}" type="button" data-page="${p}">${p}</button>`;
    })
    .join('');

  return `
    <nav class="pagination" aria-label="Navigasi usulan terbaru">
      <button class="pagination__arrow" type="button" data-page="${page - 1}" ${page <= 1 ? 'disabled' : ''}>${PAGE_ARROW_LEFT}</button>
      ${items}
      <button class="pagination__arrow" type="button" data-page="${page + 1}" ${page >= totalPages ? 'disabled' : ''}>${PAGE_ARROW_RIGHT}</button>
    </nav>
  `;
}

function renderUsulanCardBody(page) {
  const totalPages = Math.ceil(USULAN_TERBARU_DATA.length / USULAN_PAGE_SIZE);
  const start = (page - 1) * USULAN_PAGE_SIZE;
  const rows = USULAN_TERBARU_DATA.slice(start, start + USULAN_PAGE_SIZE);

  return `
    <ul class="usulan-list">${renderUsulanRows(rows)}</ul>
    ${renderUsulanPagination(page, totalPages)}
  `;
}

/** Pasang klik pagination kartu "Usulan terbaru" (dipanggil setelah root.innerHTML terpasang). */
function bindUsulanPagination(root) {
  const body = root.querySelector('#usulan-card-body');
  if (!body) return;

  body.addEventListener('click', (event) => {
    const btn = event.target.closest('button[data-page]');
    if (!btn || btn.disabled) return;
    const page = Number(btn.getAttribute('data-page'));
    if (Number.isNaN(page)) return;
    body.innerHTML = renderUsulanCardBody(page);
  });
}

/**
 * Dashboard "lengkap" (Kepala Biro/Bagian/Subbagian Ortala, Previu Ortala):
 * 4 kartu ringkasan besar di atas (total + status alur reviu), alur
 * peninjauan, Library, grafik per eselon & per jenis, usulan terbaru,
 * lalu Top Download/View seperti role lain.
 *
 * Angka-angka di kartu KPI & usulan terbaru masih dummy (TODO: ganti
 * hitungan asli begitu data proposal/konsep + status reviu per berkas
 * sudah tersedia). Top Download/View sudah pakai data asli dari
 * libraryService, sama seperti dashboard role lain.
 * @param {Session} user
 */
function renderFullDashboard(user) {
  const kpi = {
    total: 68,
    reviuSelesai: 6,
    dalamProses: 9,
    antrianReviu: 10
  };
  const totalAktif = kpi.antrianReviu + kpi.dalamProses + kpi.reviuSelesai;

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

      <div class="dashboard__kpi-grid">
        <section class="stat-card-lg">
          <p class="eyebrow stat-card-lg__eyebrow">Total Perangkat Lunak</p>
          <p class="stat-card-lg__value">${kpi.total}</p>
          <p class="stat-card-lg__desc">Seluruh perangkat lunak yang diajukan</p>
          <p class="stat-card-lg__desc">Pusat &amp; perwakilan</p>
        </section>

        <section class="stat-card-lg stat-card-lg--success">
          <p class="eyebrow stat-card-lg__eyebrow">Reviu Selesai</p>
          <p class="stat-card-lg__value">${kpi.reviuSelesai}</p>
          <p class="stat-card-lg__desc">Telah disetujui pada tahap akhir</p>
          <p class="stat-card-lg__percent">24% dari berkas aktif</p>
        </section>

        <section class="stat-card-lg stat-card-lg--warning">
          <p class="eyebrow stat-card-lg__eyebrow">Dalam Proses</p>
          <p class="stat-card-lg__value">${kpi.dalamProses}</p>
          <p class="stat-card-lg__desc">Sedang ditinjau oleh tim reviewer</p>
          <p class="stat-card-lg__percent">36% dari berkas aktif</p>
        </section>

        <section class="stat-card-lg stat-card-lg--danger">
          <p class="eyebrow stat-card-lg__eyebrow">Antrian Reviu</p>
          <p class="stat-card-lg__value">${kpi.antrianReviu}</p>
          <p class="stat-card-lg__desc">Menunggu giliran peninjauan</p>
          <p class="stat-card-lg__percent">40% dari berkas aktif</p>
        </section>
      </div>

      <div class="dashboard__flow-grid">
        <section class="card review-flow-card">
          <div class="review-flow-card__header">
            <h3 class="card__title">Alur peninjauan — ${totalAktif} berkas aktif</h3>
            <span class="review-flow-card__path">Antrian → Proses → Selesai</span>
          </div>

          <div class="review-flow-card__segments">
            <div class="review-flow-segment review-flow-segment--antrian" style="flex-grow:${kpi.antrianReviu}">
              Antrian · ${kpi.antrianReviu}
            </div>
            <div class="review-flow-segment review-flow-segment--proses" style="flex-grow:${kpi.dalamProses}">
              Proses · ${kpi.dalamProses}
            </div>
            <div class="review-flow-segment review-flow-segment--selesai" style="flex-grow:${kpi.reviuSelesai}">
              Selesai · ${kpi.reviuSelesai}
            </div>
          </div>

          <ul class="review-flow-card__legend">
            <li><span class="review-flow-legend__dot review-flow-legend__dot--antrian"></span>Antrian reviu — belum ditangani</li>
            <li><span class="review-flow-legend__dot review-flow-legend__dot--proses"></span>Proses reviu — sedang berjalan</li>
            <li><span class="review-flow-legend__dot review-flow-legend__dot--selesai"></span>Reviu selesai — siap terbit</li>
          </ul>
        </section>

        <div class="card-feature card-feature--compact">
          <p class="eyebrow card-feature__eyebrow">Library Perangkat Lunak</p>
          <h2 class="card-feature__title">Katalog referensi terpusat</h2>
          <p class="card-feature__desc">Telusuri seluruh perangkat lunak yang telah terdaftar dari satuan kerja pusat maupun perwakilan.</p>
          <a class="btn btn-gold btn-block" href="#" data-path="/pages/${user.role}/library.html">
            Akses library ${ARROW_ICON}
          </a>
        </div>
      </div>

      <div class="dashboard__chart-grid">
        <section class="card eselon-card">
          <div class="card__header">
            <h3 class="card__title">Perangkat lunak per eselon 1</h3>
            <div class="filter-bar__select-wrap">
              <select class="filter-bar__select" aria-label="Filter satuan kerja">
                <option>Semua Satuan Kerja</option>
              </select>
              <span class="filter-bar__select-chevron">${CHEVRON_ICON}</span>
            </div>
          </div>
          <ul class="eselon-list">
            ${renderEselonList(ESELON_DATA)}
          </ul>
        </section>

        <section class="card jenis-card">
          <div class="card__header">
            <h3 class="card__title">Perangkat lunak berdasarkan jenis</h3>
          </div>
          ${renderJenisChart(JENIS_CHART_DATA)}
        </section>
      </div>

      <section class="card usulan-card">
        <div class="card__header">
          <h3 class="card__title">Usulan perangkat lunak terbaru</h3>
        </div>
        <div id="usulan-card-body">${renderUsulanCardBody(1)}</div>
      </section>

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
    case ROLES.KEPALA_SATKER_BIRO_TI:
      root.innerHTML = renderLoDashboard(user);
      break;
    case ROLES.KEPALA_BIRO_ORTALA:
    case ROLES.KEPALA_BAGIAN_ORTALA:
    case ROLES.KEPALA_SUBBAGIAN_ORTALA:
    case ROLES.PREVIU_BIRO_ORTALA:
      root.innerHTML = renderFullDashboard(user);
      bindUsulanPagination(root);
      break;
    default:
      // Semua role sudah tercakup di atas; default ini murni jaga-jaga.
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