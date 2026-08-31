// ============================================================
// MAPEL - pages/monitoring.js
// Render konten halaman Monitoring: kartu ringkasan status +
// filter bar + tabel + pagination. Tipe (Proposal PL / Konsep
// PL) ditentukan dari path saat ini -- keduanya dirender lewat
// satu fungsi generik yang sama karena bentuk datanya identik
// (lihat data/status.js & data/submission-service.js), cukup
// beda judul & sumber data-nya saja.
// ============================================================

import { router } from '../core/router.js';
import { ROLES } from '../core/role.js';
import { proposalService, PROPOSAL_STATUS_META } from '../../data/proposal.js';
import { konsepService, KONSEP_STATUS_META } from '../../data/konsep.js';
import { SUBMISSION_STATUS } from '../../data/status.js';
import { formatDateLongID } from '../core/format.js';

const PAGE_SIZE = 7;

const SEARCH_ICON = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><circle cx="11" cy="11" r="7" stroke="currentColor" stroke-width="1.8"/><path d="m20 20-3.5-3.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>';
const CHEVRON_ICON = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="m6 9 6 6 6-6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const ARROW_LEFT_ICON = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="m14.5 5-7 7 7 7" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const ARROW_RIGHT_ICON = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="m9.5 5 7 7-7 7" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const AKSI_ICON = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M4 6h16M4 12h16M4 18h10" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>';
const PLUS_ICON = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>';

// Proyeksi label+warna badge tabel Monitoring Proposal PL -- status
// mentah yang sudah "digabung" secara tampilan di PROPOSAL_CARD_GROUPS
// (final/pengesahan-satker/legislasi/indeksasi -> "Disetujui",
// koreksi-ortala -> "Proses Reviu") juga perlu tampil dengan label
// gabungan yang sama di badge status tabel, bukan label aslinya per
// status. Status yang tidak disebut di sini tetap pakai label/warna
// asli dari PROPOSAL_STATUS_META (lihat renderTableRows).
const PROPOSAL_STATUS_LABEL_OVERRIDES = {
  [SUBMISSION_STATUS.FINAL]: { label: 'Disetujui', bg: '#E1EFE7', text: '#3C7A5C' },
  [SUBMISSION_STATUS.PENGESAHAN_SATKER]: { label: 'Disetujui', bg: '#E1EFE7', text: '#3C7A5C' },
  [SUBMISSION_STATUS.LEGISLASI]: { label: 'Disetujui', bg: '#E1EFE7', text: '#3C7A5C' },
  [SUBMISSION_STATUS.INDEKSASI]: { label: 'Disetujui', bg: '#E1EFE7', text: '#3C7A5C' },
  [SUBMISSION_STATUS.KOREKSI_ORTALA]: { label: 'Proses Reviu', bg: '#EFE7FA', text: '#6C3FB5' },
  [SUBMISSION_STATUS.TIDAK_DISETUJUI]: { label: 'Tidak Disetujui', bg: '#F8DCD6', text: '#A93226' }
};

// Kartu ringkasan khusus Monitoring Proposal PL -- beda dari Konsep
// PL (yang masih pakai 11 kartu 1:1 per status, lihat PROPOSAL_STATUS_META
// di bawah). Beberapa status digabung jadi satu kartu:
// - "Proses Reviu" = PROSES_REVIU + KOREKSI_ORTALA (masih bolak-balik direviu)
// - "Disetujui" = FINAL + PENGESAHAN_SATKER + LEGISLASI + INDEKSASI
//   (semua tahap SETELAH disahkan Kepala Biro Ortala di ujung rantai reviu)
// - "Tidak Disetujui" = TIDAK_DISETUJUI (ditolak final oleh Kepala Biro
//   Ortala di ujung rantai reviu -- beda dari "Ditolak Kasatker" yang
//   gugur di awal, sebelum sempat masuk rantai reviu Ortala)
const PROPOSAL_CARD_GROUPS = [
  { label: 'Konsep', statuses: [SUBMISSION_STATUS.DRAFT], text: '#2B935B', blob: '#E7E9EC' },
  { label: 'Menunggu Persetujuan', statuses: [SUBMISSION_STATUS.MENUNGGU_PERSETUJUAN], text: '#12664D', blob: '#DCF3E7' },
  { label: 'Dikirim', statuses: [SUBMISSION_STATUS.DIKIRIM], text: '#A1721C', blob: '#FBEED0' },
  { label: 'Koreksi Satker', statuses: [SUBMISSION_STATUS.KOREKSI_SATKER], text: '#C15343', blob: '#FBDAD5' },
  { label: 'Ditolak Kasatker', statuses: [SUBMISSION_STATUS.DITOLAK_KASATKER], text: '#9F7327', blob: '#F7E7C4' },
  { label: 'Proses Reviu', statuses: [SUBMISSION_STATUS.PROSES_REVIU, SUBMISSION_STATUS.KOREKSI_ORTALA], text: '#BD5444', blob: '#FBDAD5' },
  {
    label: 'Disetujui',
    statuses: [
      SUBMISSION_STATUS.FINAL,
      SUBMISSION_STATUS.PENGESAHAN_SATKER,
      SUBMISSION_STATUS.LEGISLASI,
      SUBMISSION_STATUS.INDEKSASI
    ],
    text: '#888A92',
    blob: '#EDEEF0'
  },
  { label: 'Tidak Disetujui', statuses: [SUBMISSION_STATUS.TIDAK_DISETUJUI], text: '#C0392B', blob: '#DCF3E7' }
];

// Revisi kartu ringkasan Monitoring Proposal PL KHUSUS role Kepala
// Biro Ortala -- kategorinya beda dari role lain (lihat
// PROPOSAL_CARD_GROUPS di atas) karena dilihat dari sudut pandang
// alur reviu internal Ortala (diterima dari Kasatker -> didisposisi
// -> direviu -> selesai/dikoreksi -> disetujui/tidak), bukan dari
// sudut pandang status mentah proposal itu sendiri.
//
// PENTING: angka-angkanya masih HARDCODE dummy (sama seperti kartu
// KPI di dashboard Kepala Biro Ortala), BUKAN hasil hitungan dari
// service.getStatusCounts() -- belum ada tahap "Diterima/Disposisi/
// Direviu/Selesai Reviu/Koreksi" di data/status.js (itu semua bagian
// dari alur disposisi & reviu Ortala yang belum dimodelkan). TODO:
// ganti jadi hitungan asli begitu js/workflow/disposisi.js &
// reviu.js sudah jalan.
const KARO_PROPOSAL_CARDS = [
  { label: 'Diterima', value: 1, color: '#2B935B' },
  { label: 'Disposisi', value: 7, color: '#2F6FED' },
  { label: 'Direviu', value: 4, color: '#2F6FED' },
  { label: 'Selesai Reviu', value: 5, color: '#2F6FED' },
  { label: 'Koreksi', value: 3, color: '#2F6FED' },
  { label: 'Disetujui', value: 25, color: '#2B935B' },
  { label: 'Tidak Disetujui', value: 1, color: '#D9534F' }
];

// Revisi kartu ringkasan Monitoring KONSEP PL khusus role Kepala
// Biro Ortala -- pasangan dari KARO_PROPOSAL_CARDS di atas, sama-
// sama dilihat dari sudut pandang alur reviu internal Ortala.
// Bedanya di sini 11 kartu (bukan 7) karena konsep punya tahap
// lanjutan setelah disetujui (Pengesahan Satker -> Legislasi ->
// Indeksasi) yang di kartu Proposal cuma digabung jadi "Disetujui".
//
// PENTING: angka & labelnya masih HARDCODE dummy (sama seperti
// KARO_PROPOSAL_CARDS), BUKAN hasil hitungan dari
// service.getStatusCounts() -- tahap "Diterima/Disposisi/Direviu/
// Selesai Reviu/Koreksi/Koreksi dari Ortala/Dicabut" belum
// dimodelkan di data/status.js. TODO: ganti jadi hitungan asli
// begitu js/workflow/disposisi.js & reviu.js sudah jalan.
const KARO_KONSEP_CARDS = [
  { label: 'Diterima', value: 2, color: '#2B935B' },
  { label: 'Disposisi', value: 3, color: '#2F6FED' },
  { label: 'Direviu', value: 0, color: '#2F6FED' },
  { label: 'Selesai Reviu', value: 1, color: '#2F6FED' },
  { label: 'Koreksi', value: 1, color: '#2F6FED' },
  { label: 'Final', value: 5, color: '#2B935B' },
  { label: 'Koreksi dari Ortala', value: 3, color: '#9F7327' },
  { label: 'Pengesahan Satker', value: 10, color: '#2F6FED' },
  { label: 'Legislasi', value: 4, color: '#2F6FED' },
  { label: 'Indeksasi', value: 0, color: '#2F6FED' },
  { label: 'Dicabut', value: 0, color: '#9AA0AA' }
];

// Konfigurasi per tipe monitoring -- cukup tambah entri baru di
// sini kalau nanti ada varian lain, tidak perlu ubah logic render.
const MONITORING_CONFIG = {
  'proposal-pl': {
    service: proposalService,
    statusMeta: PROPOSAL_STATUS_META,
    cardGroups: PROPOSAL_CARD_GROUPS,
    statusLabelOverrides: PROPOSAL_STATUS_LABEL_OVERRIDES,
    // Toggle "Assign to Me"/"Belum ada Konsep PL" + tombol "Buat
    // Proposal Baru" cuma relevan buat LO Biro TI (yang mengajukan),
    // bukan buat role reviewer lain yang cuma memantau -- dicek lagi
    // pakai user.role saat render, bukan cuma dari config ini.
    loBiroTiControls: true,
    createRoute: '/pages/lo-biro-ti/pengajuan/proposal-pl.html',
    createLabel: 'Buat Proposal Baru',
    // Tabelnya dibikin lebih rapat/kecil, dipola sama seperti tabel
    // Antrian Konsep PL (lihat .data-table-card--compact di
    // css/pages/antrian.css -- classnya sengaja ditaruh di file itu
    // karena dulu pertama kali dibikin buat Antrian, sekarang dipakai
    // bareng di sini juga).
    compactTable: true,
    title: 'Monitoring Proposal Perangkat Lunak',
    subtitle: 'Pantau progres seluruh proposal yang telah diajukan, mulai dari pengajuan hingga persetujuan akhir.',
    searchPlaceholder: 'Cari proposal ...',
    titleColumnLabel: 'Judul Proposal'
  },
  'konsep-pl': {
    service: konsepService,
    statusMeta: KONSEP_STATUS_META,
    // Disamain sama Monitoring Proposal PL biar tabelnya nggak
    // "gede" (judul konsep gak pecah jadi 3 baris) -- lihat komentar
    // compactTable di config 'proposal-pl' di atas.
    compactTable: true,
    title: 'Monitoring Konsep Perangkat Lunak',
    subtitle: 'Pantau progres seluruh konsep perangkat lunak yang telah diajukan, mulai dari konsep hingga persetujuan akhir.',
    searchPlaceholder: 'Cari konsep ...',
    titleColumnLabel: 'Judul Konsep'
  }
};

/** Ambil 'proposal-pl' | 'konsep-pl' dari path saat ini. */
function getMonitoringType(pathname) {
  const file = pathname.split('/').pop() || '';
  return file.replace('.html', '');
}

function renderStatCards(statusMeta, counts) {
  const cards = statusMeta
    .filter((meta) => !meta.hidden)
    .map(
      (meta) => `
        <div class="stat-tile">
          <span class="stat-tile__blob" style="--blob-color:${meta.blob}" aria-hidden="true"></span>
          <span class="stat-tile__value" style="color:${meta.text}">${counts[meta.key] ?? 0}</span>
          <span class="stat-tile__label">${meta.label}</span>
        </div>
      `
    )
    .join('');

  return `<div class="stat-tile-grid">${cards}</div>`;
}

/**
 * Varian kartu ringkasan yang jumlahnya dihitung dari GABUNGAN
 * beberapa status sekaligus (lihat PROPOSAL_CARD_GROUPS), dipakai
 * khusus Monitoring Proposal PL. Beda dari renderStatCards() yang
 * strict 1 kartu = 1 status.
 * @param {{label:string, statuses:string[], text:string, blob:string}[]} cardGroups
 * @param {Record<string, number>} counts
 */
function renderStatCardsGrouped(cardGroups, counts) {
  const cards = cardGroups
    .map((group) => {
      const total = group.statuses.reduce((sum, key) => sum + (counts[key] ?? 0), 0);
      return `
        <div class="stat-tile">
          <span class="stat-tile__blob" style="--blob-color:${group.blob}" aria-hidden="true"></span>
          <span class="stat-tile__value" style="color:${group.text}">${total}</span>
          <span class="stat-tile__label">${group.label}</span>
        </div>
      `;
    })
    .join('');

  return `<div class="stat-tile-grid">${cards}</div>`;
}

/**
 * Varian polos (tanpa blob dekorasi, angka+label sejajar) khusus
 * revisi Monitoring Proposal PL role Kepala Biro Ortala -- lihat
 * KARO_PROPOSAL_CARDS.
 * @param {{label:string, value:number, color:string}[]} cards
 */
function renderStatCardsPlain(cards) {
  const items = cards
    .map(
      (c) => `
        <div class="stat-tile stat-tile--plain">
          <span class="stat-tile__value stat-tile__value--inline" style="color:${c.color}">${c.value}</span>
          <span class="stat-tile__label stat-tile__label--inline" style="color:${c.color}">${c.label}</span>
        </div>
      `
    )
    .join('');

  return `<div class="stat-tile-grid stat-tile-grid--plain">${items}</div>`;
}

function renderFilterBar({
  statusMeta,
  years,
  selectedYear,
  search,
  selectedStatus,
  searchPlaceholder,
  showLoControls,
  belumAdaKonsep,
  assignToMe,
  createLabel
}) {
  const yearOptions = years
    .map((y) => `<option value="${y}"${String(y) === String(selectedYear) ? ' selected' : ''}>${y}</option>`)
    .join('');

  const statusOptions = statusMeta
    .filter((meta) => meta.key !== 'draft' && !meta.hidden)
    .map(
      (meta) =>
        `<option value="${meta.key}"${meta.key === selectedStatus ? ' selected' : ''}>${meta.label}</option>`
    )
    .join('');

  // Toggle "Belum ada Konsep PL" & tombol "Buat Proposal Baru" cuma
  // buat LO Biro TI (lihat loBiroTiControls di MONITORING_CONFIG +
  // pengecekan role di initMonitoringTable). "Belum ada Konsep PL"
  // untuk sekarang BARU UI-nya saja -- logic filternya nyusul begitu
  // ada relasi proposal<->konsep di data (lihat TODO di bindEvents).
  const loControls = showLoControls
    ? `
      <div class="filter-bar__toggles">
        <label class="toggle">
          <input type="checkbox" class="toggle__input" id="filter-belum-konsep" ${belumAdaKonsep ? 'checked' : ''}>
          <span class="toggle__track"><span class="toggle__thumb"></span></span>
          <span class="toggle__label">Belum ada Konsep PL</span>
        </label>
        <label class="toggle">
          <input type="checkbox" class="toggle__input" id="filter-assign-me" ${assignToMe ? 'checked' : ''}>
          <span class="toggle__track"><span class="toggle__thumb"></span></span>
          <span class="toggle__label">Assign to Me</span>
        </label>
      </div>
      <span class="filter-bar__spacer"></span>
      <button class="btn btn-dark" type="button" id="btn-create-proposal">${PLUS_ICON}${createLabel}</button>
    `
    : '';

  return `
    <div class="filter-bar">
      <div class="filter-bar__select-wrap">
        <select class="filter-bar__select" id="filter-year" aria-label="Filter tahun">
          <option value=""${selectedYear ? '' : ' selected'}>Semua Tahun</option>
          ${yearOptions}
        </select>
        <span class="filter-bar__select-chevron">${CHEVRON_ICON}</span>
      </div>

      <div class="filter-bar__search">
        ${SEARCH_ICON}
        <input type="text" id="filter-search" placeholder="${searchPlaceholder}" value="${search}" autocomplete="off">
      </div>

      <div class="filter-bar__select-wrap filter-bar__select-wrap--status">
        <select class="filter-bar__select" id="filter-status" aria-label="Filter status">
          <option value=""${selectedStatus ? '' : ' selected'}>--- Semua Status ---</option>
          ${statusOptions}
        </select>
        <span class="filter-bar__select-chevron">${CHEVRON_ICON}</span>
      </div>

      ${loControls}
    </div>
  `;
}

function renderTableRows(service, rows, startIndex, labelOverrides) {
  if (!rows.length) {
    return `
      <tr>
        <td class="data-table__empty" colspan="8">Tidak ada data yang cocok dengan filter ini.</td>
      </tr>
    `;
  }

  return rows
    .map((item, i) => {
      const baseMeta = service.getStatusMeta(item.status);
      const meta = { ...baseMeta, ...(labelOverrides?.[item.status] || {}) };
      return `
        <tr>
          <td>${startIndex + i + 1}.</td>
          <td>${item.unit}</td>
          <td>
            <span class="data-table__title">${item.title}</span>
            <span class="data-table__code">${item.id}</span>
          </td>
          <td>${item.jenis}</td>
          <td>${item.createdBy}</td>
          <td>${formatDateLongID(item.createdAt)}</td>
          <td>
            <span class="badge badge--tint" style="--tint-bg:${meta.bg};--tint-text:${meta.text}">${meta.label}</span>
          </td>
          <td>
            <button class="data-table__aksi" type="button" title="Lihat detail (segera hadir)">${AKSI_ICON}</button>
          </td>
        </tr>
      `;
    })
    .join('');
}

function renderPagination(page, totalPages) {
  if (totalPages <= 1) return '';

  // Bangun daftar nomor halaman dengan elipsis kalau kepanjangan:
  // selalu tampilkan halaman pertama, sekitar halaman aktif, dan
  // halaman terakhir.
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
    <nav class="pagination" aria-label="Navigasi halaman">
      <button class="pagination__arrow" type="button" data-page="${page - 1}" ${page <= 1 ? 'disabled' : ''} aria-label="Halaman sebelumnya">${ARROW_LEFT_ICON}</button>
      ${items}
      <button class="pagination__arrow" type="button" data-page="${page + 1}" ${page >= totalPages ? 'disabled' : ''} aria-label="Halaman berikutnya">${ARROW_RIGHT_ICON}</button>
    </nav>
  `;
}

/**
 * @param {HTMLElement} root
 * @param {{service:Object, statusMeta:Array, title:string, subtitle:string, searchPlaceholder:string}} config
 * @param {Session} user
 */
function initMonitoringTable(root, config, user) {
  const {
    service,
    statusMeta,
    cardGroups,
    statusLabelOverrides,
    loBiroTiControls,
    createRoute,
    createLabel,
    compactTable,
    title,
    subtitle,
    searchPlaceholder,
    titleColumnLabel
  } = config;
  const showLoControls = Boolean(loBiroTiControls) && user?.role === ROLES.LO_BIRO_TI;
  const type = getMonitoringType(router.getCurrentPath());
  const state = { search: '', status: '', year: '', page: 1, assignToMe: false, belumAdaKonsep: false };
  const years = service.getAvailableYears();

  function renderAll() {
    const { rows, totalPages, page } = service.getFiltered({
      search: state.search,
      status: state.status,
      year: state.year,
      assignedTo: state.assignToMe ? user?.name : '',
      page: state.page,
      pageSize: PAGE_SIZE
    });
    state.page = page;

    const counts = service.getStatusCounts();
    const startIndex = (page - 1) * PAGE_SIZE;

    // Revisi khusus role Kepala Biro Ortala (lihat komentar
    // KARO_PROPOSAL_CARDS / KARO_KONSEP_CARDS) -- role lain tetap
    // pakai cardGroups/statusMeta seperti biasa.
    const isKaroProposal = type === 'proposal-pl' && user?.role === ROLES.KEPALA_BIRO_ORTALA;
    const isKaroKonsep = type === 'konsep-pl' && user?.role === ROLES.KEPALA_BIRO_ORTALA;
    const statCardsHtml = isKaroProposal
      ? renderStatCardsPlain(KARO_PROPOSAL_CARDS)
      : isKaroKonsep
        ? renderStatCardsPlain(KARO_KONSEP_CARDS)
        : cardGroups
          ? renderStatCardsGrouped(cardGroups, counts)
          : renderStatCards(statusMeta, counts);

    root.innerHTML = `
      <div class="monitoring-page">
        <div class="monitoring-page__intro">
          <h1 class="monitoring-page__title">${title}</h1>
          <p class="dashboard__subtitle">${subtitle}</p>
        </div>

        ${statCardsHtml}

        <div class="card data-table-card${compactTable ? ' data-table-card--compact' : ''}">
          ${renderFilterBar({
            statusMeta,
            years,
            selectedYear: state.year,
            search: state.search,
            selectedStatus: state.status,
            searchPlaceholder,
            showLoControls,
            belumAdaKonsep: state.belumAdaKonsep,
            assignToMe: state.assignToMe,
            createLabel
          })}
          <div class="data-table-wrap">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Nomor</th>
                  <th>Satuan Kerja</th>
                  <th>${titleColumnLabel}</th>
                  <th>Jenis</th>
                  <th>Dibuat Oleh</th>
                  <th>Tanggal Dibuat</th>
                  <th>Status</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                ${renderTableRows(service, rows, startIndex, statusLabelOverrides)}
              </tbody>
            </table>
          </div>
        </div>

        ${renderPagination(page, totalPages)}
      </div>
    `;

    bindEvents();
  }

  function bindEvents() {
    const searchInput = root.querySelector('#filter-search');
    const yearSelect = root.querySelector('#filter-year');
    const statusSelect = root.querySelector('#filter-status');
    const assignMeToggle = root.querySelector('#filter-assign-me');
    const belumKonsepToggle = root.querySelector('#filter-belum-konsep');
    const createBtn = root.querySelector('#btn-create-proposal');

    let debounceTimer;
    searchInput?.addEventListener('input', (event) => {
      clearTimeout(debounceTimer);
      const value = event.target.value;
      debounceTimer = setTimeout(() => {
        state.search = value;
        state.page = 1;
        renderAll();
        const el = root.querySelector('#filter-search');
        if (el) {
          el.focus();
          el.setSelectionRange(el.value.length, el.value.length);
        }
      }, 300);
    });

    yearSelect?.addEventListener('change', (event) => {
      state.year = event.target.value;
      state.page = 1;
      renderAll();
    });

    statusSelect?.addEventListener('change', (event) => {
      state.status = event.target.value;
      state.page = 1;
      renderAll();
    });

    assignMeToggle?.addEventListener('change', (event) => {
      state.assignToMe = event.target.checked;
      state.page = 1;
      renderAll();
    });

    // TODO: belum ada relasi proposal<->konsep di data, jadi toggle
    // ini baru menyimpan state UI-nya saja dan belum benar-benar
    // menyaring tabel. Sambungkan ke logic filter begitu field relasi
    // (mis. proposalId di data/konsep.js) sudah ada.
    belumKonsepToggle?.addEventListener('change', (event) => {
      state.belumAdaKonsep = event.target.checked;
    });

    createBtn?.addEventListener('click', () => {
      if (createRoute) router.navigate(createRoute);
    });

    root.querySelectorAll('.pagination__page[data-page], .pagination__arrow[data-page]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const targetPage = Number(btn.getAttribute('data-page'));
        if (!Number.isNaN(targetPage)) {
          state.page = targetPage;
          renderAll();
        }
      });
    });
  }

  renderAll();
}

/**
 * @param {HTMLElement} root - elemen tempat konten monitoring dipasang
 * @param {Session} user
 */
export function initMonitoringPage(root, user) {
  if (!root) return;

  const type = getMonitoringType(router.getCurrentPath());
  const config = MONITORING_CONFIG[type];

  if (!config) {
    root.innerHTML = '<p class="dashboard__subtitle">Halaman ini sedang dalam pengembangan.</p>';
    return;
  }

  initMonitoringTable(root, config, user);
}