// ============================================================
// MAPEL - pages/antrian.js
// Render konten halaman Antrian: sub-nav (tab) buat pindah
// antara "Antrian Proposal PL" dan "Antrian Konsep PL", ikutin
// folder role user yang lagi login. Isi tabel antrian sendiri
// (data + aksi disposisi/reviu) menyusul setelah workflow
// engine (js/workflow/*) selesai -- sekarang baru sub-nav +
// placeholder body.
// ============================================================

import { router } from '../core/router.js';

const TABS = [
  { key: 'proposal-pl', label: 'Antrian Proposal PL' },
  { key: 'konsep-pl', label: 'Antrian Konsep PL' }
];

/** @param {string} role @param {string} key */
function buildTabPath(role, key) {
  return `/pages/${role}/antrian/${key}.html`;
}

/** Ambil key tab aktif ('proposal-pl' | 'konsep-pl') dari path saat ini. */
function getActiveTabKey(pathname) {
  const file = pathname.split('/').pop() || '';
  return file.replace('.html', '');
}

/** @param {string} role @param {string} activeKey */
function renderTabs(role, activeKey) {
  const items = TABS.map((tab) => {
    const isActive = tab.key === activeKey;
    return `
      <a
        class="subnav__item${isActive ? ' subnav__item--active' : ''}"
        href="#"
        data-path="${buildTabPath(role, tab.key)}"
        ${isActive ? 'aria-current="page"' : ''}
      >
        ${tab.label}
      </a>
    `;
  }).join('');

  return `
    <nav class="subnav" aria-label="Sub navigasi antrian">
      ${items}
    </nav>
  `;
}

/**
 * @param {HTMLElement} root - elemen tempat konten antrian dipasang
 * @param {Session} user
 */
export function initAntrianPage(root, user) {
  if (!root) return;

  const activeKey = getActiveTabKey(router.getCurrentPath());
  const activeTab = TABS.find((tab) => tab.key === activeKey) || TABS[0];

  root.innerHTML = `
    <div class="page-antrian">
      ${renderTabs(user.role, activeKey)}
      <div class="page-antrian__body">
        <h1 class="page-antrian__title">${activeTab.label}</h1>
        <p class="dashboard__subtitle">Daftar antrian sedang dalam pengembangan.</p>
      </div>
    </div>
  `;

  root.querySelectorAll('.subnav__item[data-path]').forEach((el) => {
    el.addEventListener('click', (event) => {
      event.preventDefault();
      const path = el.getAttribute('data-path');
      if (path) router.navigate(path);
    });
  });
}
