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
import { proposalService, PROPOSAL_STATUS_META } from '../../data/proposal.js';
import { konsepService, KONSEP_STATUS_META } from '../../data/konsep.js';
import { formatDateLongID } from '../core/format.js';

const PAGE_SIZE = 7;

const SEARCH_ICON = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><circle cx="11" cy="11" r="7" stroke="currentColor" stroke-width="1.8"/><path d="m20 20-3.5-3.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>';
const CHEVRON_ICON = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="m6 9 6 6 6-6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const ARROW_LEFT_ICON = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="m14.5 5-7 7 7 7" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const ARROW_RIGHT_ICON = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="m9.5 5 7 7-7 7" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const AKSI_ICON = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M4 6h16M4 12h16M4 18h10" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>';

// Konfigurasi per tipe monitoring -- cukup tambah entri baru di
// sini kalau nanti ada varian lain, tidak perlu ubah logic render.
const MONITORING_CONFIG = {
  'proposal-pl': {
    service: proposalService,
    statusMeta: PROPOSAL_STATUS_META,
    title: 'Monitoring Proposal Perangkat Lunak',
    subtitle: 'Pantau progres seluruh proposal yang telah diajukan, mulai dari pengajuan hingga persetujuan akhir.',
    searchPlaceholder: 'Cari proposal ...',
    titleColumnLabel: 'Judul Proposal'
  },
  'konsep-pl': {
    service: konsepService,
    statusMeta: KONSEP_STATUS_META,
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

function renderFilterBar({ statusMeta, years, selectedYear, search, selectedStatus, searchPlaceholder }) {
  const yearOptions = years
    .map((y) => `<option value="${y}"${String(y) === String(selectedYear) ? ' selected' : ''}>${y}</option>`)
    .join('');

  const statusOptions = statusMeta
    .filter((meta) => meta.key !== 'draft')
    .map(
      (meta) =>
        `<option value="${meta.key}"${meta.key === selectedStatus ? ' selected' : ''}>${meta.label}</option>`
    )
    .join('');

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
    </div>
  `;
}

function renderTableRows(service, rows, startIndex) {
  if (!rows.length) {
    return `
      <tr>
        <td class="data-table__empty" colspan="8">Tidak ada data yang cocok dengan filter ini.</td>
      </tr>
    `;
  }

  return rows
    .map((item, i) => {
      const meta = service.getStatusMeta(item.status);
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
 */
function initMonitoringTable(root, config) {
  const { service, statusMeta, title, subtitle, searchPlaceholder, titleColumnLabel } = config;
  const state = { search: '', status: '', year: '', page: 1 };
  const years = service.getAvailableYears();

  function renderAll() {
    const { rows, totalPages, page } = service.getFiltered({
      search: state.search,
      status: state.status,
      year: state.year,
      page: state.page,
      pageSize: PAGE_SIZE
    });
    state.page = page;

    const counts = service.getStatusCounts();
    const startIndex = (page - 1) * PAGE_SIZE;

    root.innerHTML = `
      <div class="monitoring-page">
        <div class="monitoring-page__intro">
          <h1 class="monitoring-page__title">${title}</h1>
          <p class="dashboard__subtitle">${subtitle}</p>
        </div>

        ${renderStatCards(statusMeta, counts)}

        <div class="card data-table-card">
          ${renderFilterBar({
            statusMeta,
            years,
            selectedYear: state.year,
            search: state.search,
            selectedStatus: state.status,
            searchPlaceholder
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
                ${renderTableRows(service, rows, startIndex)}
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

  initMonitoringTable(root, config);
}
