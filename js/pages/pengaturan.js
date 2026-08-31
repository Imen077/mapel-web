// ============================================================
// MAPEL - pages/pengaturan.js
// Halaman Pengaturan: kelola akun. Reuse komponen tabel/card yang
// sama seperti Monitoring & Antrian (data-table-card, data-table).
//
// Tombol "+ Tambah Akun" dan Edit/Delete per baris sengaja belum
// di-wire ke aksi apapun (ikut pola tombol lain di app ini yang
// visualnya duluan, logic-nya menyusul).
// ============================================================

import { accountService } from '../../data/accounts.js';

const PLUS_ICON = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>';

/** @param {typeof import('../../data/accounts.js').SEED_ACCOUNTS} rows */
function renderTableRows(rows) {
  if (!rows.length) {
    return '<tr><td class="data-table__empty" colspan="7">Belum ada akun.</td></tr>';
  }

  return rows
    .map(
      (acc) => `
        <tr>
          <td><span class="data-table__title">${acc.nama}</span></td>
          <td>${acc.nip}</td>
          <td>${acc.email}</td>
          <td>${acc.role}</td>
          <td>${acc.kdSatker}</td>
          <td>${acc.nmSatker}</td>
          <td>
            <div class="pengaturan-page__row-actions">
              <button class="btn btn-secondary btn-sm" type="button" data-action="edit" data-id="${acc.id}">Edit</button>
              <button class="btn btn-danger btn-sm" type="button" data-action="delete" data-id="${acc.id}">Delete</button>
            </div>
          </td>
        </tr>
      `
    )
    .join('');
}

/**
 * @param {HTMLElement} root - elemen tempat konten pengaturan dipasang
 * @param {Session} user
 */
export function initPengaturanPage(root, user) {
  if (!root) return;

  const accounts = accountService.getAll();

  root.innerHTML = `
    <div class="pengaturan-page">
      <div class="pengaturan-page__intro">
        <h1 class="pengaturan-page__title">Pengaturan Akun</h1>
        <p class="pengaturan-page__subtitle">Kelola akun pengguna sistem MAPEL.</p>
      </div>

      <div class="card data-table-card">
        <div class="pengaturan-page__toolbar">
          <button class="btn btn-dark" type="button" id="btn-tambah-akun">${PLUS_ICON}Tambah Akun</button>
        </div>
        <div class="data-table-wrap">
          <table class="data-table">
            <thead>
              <tr>
                <th>Nama</th>
                <th>NIP</th>
                <th>Email</th>
                <th>NmRole</th>
                <th>KdSatker</th>
                <th>NmSatker</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              ${renderTableRows(accounts)}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;
}