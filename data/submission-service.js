// ============================================================
// MAPEL - data/submission-service.js
// Factory service filter/paginate/hitung-status yang generik --
// dipakai bareng oleh Proposal PL (data/proposal.js) & Konsep PL
// (data/konsep.js) karena keduanya punya bentuk data & alur yang
// identik, cuma beda judul objeknya. Lihat data/status.js buat
// katalog status yang juga dipakai bersama.
// ============================================================

import { SUBMISSION_STATUS, findStatusMeta } from './status.js';

/**
 * @param {Object} params
 * @param {Array} params.statusMeta - hasil buildStatusMeta() dari status.js
 * @param {Array} params.items - daftar item (proposal/konsep), field wajib: id, unit, title, jenis, createdBy, createdAt, status
 */
export function createSubmissionService({ statusMeta, items }) {
  const submittedStatuses = statusMeta
    .filter((s) => s.key !== SUBMISSION_STATUS.DRAFT)
    .map((s) => s.key);

  // Beberapa item dummy sengaja cuma buat testing 1 role tertentu
  // (lihat field `testOnlyFor` di data/proposal.js, mis. dummy
  // "Selesai Reviu" yang cuma buat Kepala Biro Ortala) -- item kayak
  // gini disembunyikan dari role lain, baik di tabel (getFiltered)
  // maupun kartu ringkasan (getStatusCounts).
  function visibleToRole(item, role) {
    return !item.testOnlyFor || item.testOnlyFor === role;
  }

  function getStatusMeta(key) {
    return findStatusMeta(statusMeta, key);
  }

  /**
   * @param {string} [viewerRole] - kalau diisi, item yang `testOnlyFor`-nya
   *   role lain tidak ikut dihitung.
   * @returns {Record<string, number>} jumlah item per status
   */
  function getStatusCounts(viewerRole) {
    const counts = {};
    statusMeta.forEach((meta) => {
      counts[meta.key] = 0;
    });
    items
      .filter((item) => visibleToRole(item, viewerRole))
      .forEach((item) => {
        counts[item.status] = (counts[item.status] || 0) + 1;
      });
    return counts;
  }

  /**
   * @param {Object} params
   * @param {string} [params.search]
   * @param {string} [params.status] - key status, atau '' buat semua
   * @param {string|number} [params.year] - atau '' buat semua tahun
   * @param {string} [params.assignedTo] - nama pembuat (item.createdBy), atau '' buat semua -- dipakai toggle "Assign to Me"
   * @param {string} [params.viewerRole] - role yang lagi lihat, buat nyaring item `testOnlyFor` (lihat visibleToRole di atas)
   * @param {number} [params.page] - 1-indexed
   * @param {number} [params.pageSize]
   * @param {boolean} [params.includeDraft] - ikutkan item berstatus draft juga (default false, dipakai Monitoring). Antrian set true karena draft milik sendiri memang harus tampil di situ.
   */
  function getFiltered({
    search = '',
    status = '',
    year = '',
    assignedTo = '',
    viewerRole,
    page = 1,
    pageSize = 7,
    includeDraft = false
  } = {}) {
    const term = search.trim().toLowerCase();

    let rows = includeDraft
      ? items.slice()
      : items.filter((item) => submittedStatuses.includes(item.status));

    rows = rows.filter((item) => visibleToRole(item, viewerRole));

    if (term) {
      rows = rows.filter(
        (item) => item.title.toLowerCase().includes(term) || item.id.toLowerCase().includes(term)
      );
    }
    if (status) {
      rows = rows.filter((item) => item.status === status);
    }
    if (year) {
      rows = rows.filter((item) => item.createdAt.slice(0, 4) === String(year));
    }
    if (assignedTo) {
      rows = rows.filter((item) => item.createdBy === assignedTo);
    }

    const total = rows.length;
    const totalPages = Math.max(Math.ceil(total / pageSize), 1);
    const safePage = Math.min(Math.max(page, 1), totalPages);
    const start = (safePage - 1) * pageSize;
    const pageRows = rows.slice(start, start + pageSize);

    return { rows: pageRows, total, totalPages, page: safePage };
  }

  /** @returns {number[]} daftar tahun unik yang ada di data, terbaru dulu */
  function getAvailableYears() {
    const years = new Set(items.map((item) => Number(item.createdAt.slice(0, 4))));
    return [...years].sort((a, b) => b - a);
  }

  /** @returns {Object|undefined} item mentah (bukan hasil filter/paginate) berdasarkan id */
  function getById(id) {
    return items.find((item) => item.id === id);
  }

  return { getStatusMeta, getStatusCounts, getFiltered, getAvailableYears, getById };
}