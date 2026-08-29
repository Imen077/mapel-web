// ============================================================
// MAPEL - components/sidebar/sidebar-pegawai.js
// Sidebar kiri. Namanya "sidebar-pegawai" karena ini yang
// pertama dibangun, tapi implementasinya generik untuk SEMUA
// role -- menu diambil dari roleService.getMenu(role) (satu
// sumber kebenaran di role.js), jadi tidak perlu file terpisah
// per role. sidebar-lo.js / sidebar-kasatker-dll.js sengaja
// dibiarkan placeholder kecuali nanti ada kebutuhan visual yang
// benar-benar berbeda per role.
// ============================================================

import { roleService } from '../../core/role.js';
import { router } from '../../core/router.js';

const ICONS = {
  home: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M4 11.5 12 4l8 7.5" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/><path d="M6 10v9a1 1 0 0 0 1 1h3v-5a2 2 0 0 1 2-2h0a2 2 0 0 1 2 2v5h3a1 1 0 0 0 1-1v-9" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/></svg>',
  book: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M5 4.5h6a2 2 0 0 1 2 2V20a2 2 0 0 0-2-1.5H5a1 1 0 0 1-1-1V5.5a1 1 0 0 1 1-1Z" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/><path d="M19 4.5h-6a2 2 0 0 0-2 2V20a2 2 0 0 1 2-1.5h6a1 1 0 0 0 1-1V5.5a1 1 0 0 0-1-1Z" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/></svg>',
  'file-plus': '<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M13 3.5H7a1 1 0 0 0-1 1v15a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V8.5L13 3.5Z" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/><path d="M12.5 13v5M10 15.5h5" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>',
  activity: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M3.5 12.5h4l2-6 4 11 2-8h5" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  'list-checks': '<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="m4 6.5 1.6 1.6L8.5 5" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/><path d="m4 13.5 1.6 1.6L8.5 12" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/><path d="M12 7h8M12 17h8M4 20.5h1.01" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>',
  settings: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M12 15.2a3.2 3.2 0 1 0 0-6.4 3.2 3.2 0 0 0 0 6.4Z" stroke="currentColor" stroke-width="1.7"/><path d="M19.4 13.6c.04-.53.04-1.07 0-1.6l1.6-1.24-1.6-2.77-1.9.62a7.6 7.6 0 0 0-1.4-.8l-.3-1.98H9.9l-.3 1.99c-.5.2-.97.47-1.4.8l-1.9-.63-1.6 2.77 1.6 1.24a7.9 7.9 0 0 0 0 1.6L4.7 14.8l1.6 2.77 1.9-.62c.43.33.9.6 1.4.8l.3 1.98h4.2l.3-1.99c.5-.2.97-.47 1.4-.8l1.9.63 1.6-2.77-1.6-1.24Z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/></svg>'
};

// Panah kecil buat item grup (Monitoring, dst) -- nunjuk ke bawah
// waktu grup terbuka, muter 180deg (lihat CSS) waktu tertutup.
const CHEVRON_ICON = '<svg class="sidebar__item-chevron-icon" width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="m6 9 6 6 6-6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>';

/** @param {{path:string}[]} children @param {string} currentPath */
function isGroupActive(children, currentPath) {
  return children.some((child) => currentPath.endsWith(child.path));
}

/**
 * Render satu item menu. Item dengan "children" jadi grup
 * accordion (tombol buka/tutup + daftar sub-link); item biasa
 * tetap jadi link langsung seperti sebelumnya.
 * @param {Object} item
 * @param {string} currentPath
 */
function renderMenuItem(item, currentPath) {
  const icon = ICONS[item.icon] || ICONS.home;

  if (item.children && item.children.length) {
    const expanded = isGroupActive(item.children, currentPath);
    const subItems = item.children
      .map((child) => {
        const isActive = currentPath.endsWith(child.path);
        return `
          <a
            class="sidebar__subitem${isActive ? ' sidebar__subitem--active' : ''}"
            href="#"
            data-path="${child.path}"
            ${isActive ? 'aria-current="page"' : ''}
          >
            <span class="sidebar__subitem-label">${child.label}</span>
          </a>
        `;
      })
      .join('');

    return `
      <div class="sidebar__group">
        <button
          class="sidebar__item sidebar__item--parent${expanded ? ' sidebar__item--active' : ''}"
          type="button"
          aria-expanded="${expanded}"
        >
          <span class="sidebar__item-icon">${icon}</span>
          <span class="sidebar__item-label">${item.label}</span>
          <span class="sidebar__item-chevron">${CHEVRON_ICON}</span>
        </button>
        <div class="sidebar__submenu"${expanded ? '' : ' hidden'}>
          ${subItems}
        </div>
      </div>
    `;
  }

  const isActive = currentPath.endsWith(item.path);
  return `
    <a
      class="sidebar__item${isActive ? ' sidebar__item--active' : ''}"
      href="#"
      data-path="${item.path}"
      ${isActive ? 'aria-current="page"' : ''}
    >
      <span class="sidebar__item-icon">${icon}</span>
      <span class="sidebar__item-label">${item.label}</span>
    </a>
  `;
}

/**
 * @param {Session} user
 * @returns {string}
 */
function render(user) {
  const currentPath = router.getCurrentPath();
  const menu = roleService.getMenu(user.role);

  const items = menu.map((item) => renderMenuItem(item, currentPath)).join('');

  return `
    <aside class="sidebar">
      <div class="sidebar__brand">
        <img class="sidebar__logo" src="${router.pathToRoot()}assets/img/logo.png" alt="Logo MAPEL" width="36" height="36">
        <div class="sidebar__brand-text">
          <span class="sidebar__wordmark">MAPEL</span>
          <span class="sidebar__tagline">Manajemen Perangkat Lunak</span>
        </div>
      </div>

      <div class="sidebar__body">
        <p class="sidebar__menu-label">Menu</p>
        <nav class="sidebar__menu" aria-label="Menu utama">
          ${items}
        </nav>
      </div>
    </aside>
  `;
}

/** Pasang event listener klik untuk item menu (dipanggil setelah render() disuntik ke DOM). */
function bindEvents(root) {
  // Link biasa (top-level tanpa children, dan sub-link di dalam grup).
  root.querySelectorAll('.sidebar__item[data-path], .sidebar__subitem[data-path]').forEach((el) => {
    el.addEventListener('click', (event) => {
      event.preventDefault();
      const path = el.getAttribute('data-path');
      router.navigate(path);
    });
  });

  // Tombol grup (mis. "Monitoring"): toggle buka/tutup submenu,
  // tidak navigasi ke mana pun.
  root.querySelectorAll('.sidebar__item--parent').forEach((btn) => {
    btn.addEventListener('click', () => {
      const submenu = btn.nextElementSibling;
      const isExpanded = btn.getAttribute('aria-expanded') === 'true';
      btn.setAttribute('aria-expanded', String(!isExpanded));
      if (submenu) submenu.hidden = isExpanded;
    });
  });
}

export const sidebar = { render, bindEvents };