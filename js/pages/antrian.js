// ============================================================
// MAPEL - pages/antrian.js
// Render konten halaman Antrian: filter bar + tabel + pagination
// (dipola sama seperti js/pages/monitoring.js, komponennya di-
// reuse: filter-bar, data-table, badge, pagination). Bedanya sama
// Monitoring: Antrian menampilkan daftar milik pembuatnya sendiri
// TERMASUK yang masih draft, plus kolom "Nomor Pengajuan" dan
// "Koreksi Ke-".
//
// Baru varian Konsep PL yang diisi; Antrian Proposal PL masih
// placeholder, menyusul.
// ============================================================

import { router } from '../core/router.js';
import { antrianKonsepService } from '../../data/antrian-konsep.js';
import { KONSEP_STATUS_META } from '../../data/konsep.js';
import { formatDateTimeLongID } from '../core/format.js';

const PAGE_SIZE = 10;

const SEARCH_ICON = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><circle cx="11" cy="11" r="7" stroke="currentColor" stroke-width="1.8"/><path d="m20 20-3.5-3.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>';
const CHEVRON_ICON = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="m6 9 6 6 6-6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const AKSI_ICON = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M4 6h16M4 12h16M4 18h10" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>';

/** Ambil key halaman ('proposal-pl' | 'konsep-pl') dari path saat ini. */
function getPageKey(pathname) {
  const file = pathname.split('/').pop() || '';
  return file.replace('.html', '');
}

function renderFilterBar({ years, selectedYear, search, statusMeta, selectedStatus, searchPlaceholder }) {
  const yearOptions = years
    .map((y) => `<option value="${y}"${String(y) === String(selectedYear) ? ' selected' : ''}>${y}</option>`)
    .join('');

  // Beda dari filter status Monitoring: draft ("Konsep") ikut jadi
  // pilihan filter di sini, karena draft memang tampil di tabel Antrian.
  const statusOptions = statusMeta
    .filter((meta) => !meta.hidden)
    .map(
      (meta) => `<option value="${meta.key}"${meta.key === selectedStatus ? ' selected' : ''}>${meta.label}</option>`
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

function renderKoreksiBadge(count) {
  const cls = count > 0 ? 'koreksi-badge koreksi-badge--attention' : 'koreksi-badge';
  return `<span class="${cls}">${count}</span>`;
}

function renderTableRows(service, rows, startIndex) {
  if (!rows.length) {
    return `<tr><td class="data-table__empty" colspan="10">Tidak ada data yang cocok dengan filter ini.</td></tr>`;
  }

  return rows
    .map((item, i) => {
      const meta = service.getStatusMeta(item.status);
      return `
        <tr>
          <td>${startIndex + i + 1}.</td>
          <td>${item.unit}</td>
          <td>${item.nomorPengajuan || '-'}</td>
          <td><span class="data-table__title">${item.title}</span></td>
          <td>${item.jenis}</td>
          <td>${renderKoreksiBadge(item.koreksiKe)}</td>
          <td>${item.employeeId}-${item.createdBy}</td>
          <td>${formatDateTimeLongID(item.createdAt)}</td>
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
      <button class="pagination__text-btn" type="button" data-page="${page - 1}" ${page <= 1 ? 'disabled' : ''}>Previous</button>
      <div class="pagination__pages">${items}</div>
      <button class="pagination__text-btn pagination__text-btn--dark" type="button" data-page="${page + 1}" ${page >= totalPages ? 'disabled' : ''}>Next</button>
    </nav>
  `;
}

/**
 * @param {HTMLElement} root
 * @param {Session} user
 */
function initAntrianKonsepTable(root, user) {
  const service = antrianKonsepService;
  const years = service.getAvailableYears();
  const state = { search: '', status: '', year: '', page: 1 };

  function renderAll() {
    const { rows, totalPages, page } = service.getFiltered({
      search: state.search,
      status: state.status,
      year: state.year,
      page: state.page,
      pageSize: PAGE_SIZE,
      includeDraft: true
    });
    state.page = page;

    const startIndex = (page - 1) * PAGE_SIZE;

    root.innerHTML = `
      <div class="page-antrian">
        <div class="page-antrian__body">
          <h1 class="page-antrian__title">Antrian Konsep Perangkat Lunak</h1>
        </div>

        <div class="card data-table-card data-table-card--compact">
          ${renderFilterBar({
            years,
            selectedYear: state.year,
            search: state.search,
            statusMeta: KONSEP_STATUS_META,
            selectedStatus: state.status,
            searchPlaceholder: 'Cari Konsep ...'
          })}
          <div class="data-table-wrap">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Nomor</th>
                  <th>Satuan Kerja</th>
                  <th>Nomor Pengajuan</th>
                  <th>Judul Konsep</th>
                  <th>Jenis</th>
                  <th>Koreksi Ke-</th>
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

          <div class="data-table-card__footer">
            ${totalPages > 1 ? renderPagination(page, totalPages) : ''}
          </div>
        </div>
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

    root.querySelectorAll('.pagination__page[data-page], .pagination__text-btn[data-page]').forEach((btn) => {
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
 * @param {HTMLElement} root - elemen tempat konten antrian dipasang
 * @param {Session} user
 */
export function initAntrianPage(root, user) {
  if (!root) return;

  const isKonsepPage = getPageKey(router.getCurrentPath()) === 'konsep-pl';

  if (isKonsepPage) {
    initAntrianKonsepTable(root, user);
    return;
  }

  root.innerHTML = `
    <div class="page-antrian">
      <div class="page-antrian__body">
        <h1 class="page-antrian__title">Antrian Proposal PL</h1>
        <p class="dashboard__subtitle">Daftar antrian sedang dalam pengembangan.</p>
      </div>
    </div>
  `;
}