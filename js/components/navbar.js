// ============================================================
// MAPEL - components/navbar.js
// Navbar atas, generik untuk semua role. Menampilkan judul
// aplikasi, lonceng notifikasi, dan identitas user yang login
// (inisial, nama, label role) -- identitas ini bisa diklik buat
// buka popup kecil berisi tombol "Keluar".
// ============================================================

import { auth } from '../core/auth.js';
import { router } from '../core/router.js';
import { roleService } from '../core/role.js';

const LOGIN_PATH = '/pages/auth/login.html';

const BELL_ICON = `
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M12 3.5c-3.04 0-5.5 2.46-5.5 5.5v3.1c0 .58-.2 1.14-.58 1.58L4.7 15.1c-.7.82-.12 2.08.96 2.08h12.68c1.08 0 1.66-1.26.96-2.08l-1.22-1.42a2.4 2.4 0 0 1-.58-1.58V9c0-3.04-2.46-5.5-5.5-5.5Z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/>
    <path d="M9.5 19a2.5 2.5 0 0 0 5 0" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
  </svg>
`;

const CHEVRON_ICON = `
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="m6 9 6 6 6-6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>
`;

const LOGOUT_ICON = `
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M9 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h3" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M15 8l4 4-4 4M19 12H9" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>
`;

/** @param {string} name */
function getInitials(name) {
  const parts = (name || '').trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  return parts.slice(0, 3).map((p) => p[0]).join('').toUpperCase();
}

function getFormattedToday() {
  const formatted = new Intl.DateTimeFormat('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(new Date());
  // Kapitalkan huruf pertama tiap kata (Intl id-ID kadang lowercase nama hari/bulan).
  return formatted.replace(/\b\p{L}/gu, (ch) => ch.toUpperCase());
}

/** @param {string[]} crumbs - item terakhir dianggap halaman aktif */
function renderBreadcrumb(crumbs) {
  const items = crumbs
    .map((label, i) => {
      const isLast = i === crumbs.length - 1;
      const separator = i === 0 ? '' : '<span class="navbar__breadcrumb-sep">›</span>';
      return `${separator}<span class="navbar__breadcrumb-item${isLast ? ' navbar__breadcrumb-item--active' : ''}">${label}</span>`;
    })
    .join('');

  return `<nav class="navbar__breadcrumb" aria-label="Breadcrumb">${items}</nav>`;
}

/**
 * @param {Session} user
 * @param {{ hasUnread?: boolean, breadcrumb?: string[] }} [options]
 */
function render(user, options = {}) {
  const { hasUnread = false, breadcrumb } = options;

  const titleHtml = breadcrumb && breadcrumb.length
    ? renderBreadcrumb(breadcrumb)
    : '<div class="navbar__title">Manajemen Perangkat Lunak</div>';

  return `
    <header class="navbar">
      ${titleHtml}

      <div class="navbar__end">
        <span class="navbar__date">${getFormattedToday()}</span>

        <button class="navbar__bell" type="button" aria-label="Notifikasi">
          ${BELL_ICON}
          ${hasUnread ? '<span class="navbar__bell-dot" aria-hidden="true"></span>' : ''}
        </button>

        <div class="navbar__account">
          <button
            class="navbar__identity"
            type="button"
            id="navbar-identity-trigger"
            aria-haspopup="true"
            aria-expanded="false"
          >
            <span class="navbar__avatar">${getInitials(user.name)}</span>
            <div class="navbar__identity-text">
              <span class="navbar__name">${user.name}</span>
              <span class="navbar__role">${roleService.getLabel(user.role)}</span>
            </div>
            <span class="navbar__chevron">${CHEVRON_ICON}</span>
          </button>

          <div class="navbar__popup" id="navbar-popup" hidden>
            <div class="navbar__popup-header">
              <span class="navbar__popup-name">${user.name}</span>
              <span class="navbar__popup-role">${roleService.getLabel(user.role)}</span>
            </div>
            <button class="navbar__popup-item navbar__popup-item--danger" type="button" id="navbar-logout">
              ${LOGOUT_ICON}
              <span>Keluar</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  `;
}

/** Pasang interaksi popup akun (buka/tutup + logout). Panggil setelah render() disuntik ke DOM. */
function bindEvents(root) {
  const trigger = root.querySelector('#navbar-identity-trigger');
  const popup = root.querySelector('#navbar-popup');
  const logoutBtn = root.querySelector('#navbar-logout');
  if (!trigger || !popup) return;

  function closePopup() {
    popup.hidden = true;
    trigger.setAttribute('aria-expanded', 'false');
  }

  function openPopup() {
    popup.hidden = false;
    trigger.setAttribute('aria-expanded', 'true');
  }

  trigger.addEventListener('click', (event) => {
    event.stopPropagation();
    if (popup.hidden) openPopup();
    else closePopup();
  });

  // Klik di luar popup -> tutup.
  document.addEventListener('click', (event) => {
    if (!popup.hidden && !popup.contains(event.target) && event.target !== trigger) {
      closePopup();
    }
  });

  // Tombol Esc -> tutup.
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closePopup();
  });

  logoutBtn?.addEventListener('click', () => {
    auth.logout();
    router.navigate(LOGIN_PATH);
  });
}

export const navbar = { render, bindEvents };