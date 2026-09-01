// ============================================================
// MAPEL - components/table.js
// Menu aksi ("Lihat" / "Riwayat") untuk kolom Aksi di semua tabel
// data (Monitoring & Antrian). Dummy dulu -- item menunya belum
// di-link ke halaman detail/riwayat manapun (belum ada
// js/pages/detail.js & konsep riwayat), cuma buka/tutup menunya
// saja. Sambungkan ke router begitu halaman-halaman itu sudah ada.
// ============================================================

const AKSI_ICON =
  '<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M4 6h16M4 12h16M4 18h10" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>';
const EYE_ICON =
  '<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M2 12s3.4-7 10-7 10 7 10 7-3.4 7-10 7-10-7-10-7Z" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/><circle cx="12" cy="12" r="2.6" fill="currentColor"/></svg>';
const CLOCK_ICON =
  '<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.7"/><path d="M12 7.5v4.8l3.2 1.9" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>';

let seq = 0;
let outsideHandlersBound = false;

function closeMenu(menu) {
  const dropdown = menu.querySelector('[data-aksi-dropdown]');
  const toggle = menu.querySelector('[data-aksi-toggle]');
  dropdown?.setAttribute('hidden', '');
  toggle?.setAttribute('aria-expanded', 'false');
}

function closeAllMenus() {
  document.querySelectorAll('[data-aksi-menu]').forEach(closeMenu);
}

// Listener global di-pasang sekali saja per halaman (bukan per
// render tabel), karena ia selalu mencari menu yang lagi kebuka
// langsung dari DOM saat diklik -- jadi tetap benar walau tabelnya
// baru saja di-render ulang (innerHTML diganti).
function ensureOutsideHandlers() {
  if (outsideHandlersBound) return;
  outsideHandlersBound = true;

  document.addEventListener('click', (event) => {
    document.querySelectorAll('[data-aksi-menu]').forEach((menu) => {
      if (!menu.contains(event.target)) closeMenu(menu);
    });
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeAllMenus();
  });
}

/**
 * Markup satu sel "Aksi" (tombol + dropdown Lihat/Riwayat). Dipakai
 * langsung sebagai isi `<td>` di renderTableRows tabel Monitoring &
 * Antrian.
 */
export function renderAksiCell() {
  const menuId = `aksi-menu-${++seq}`;
  return `
    <td class="data-table__aksi-cell">
      <div class="aksi-menu" data-aksi-menu>
        <button
          class="data-table__aksi"
          type="button"
          data-aksi-toggle
          aria-haspopup="true"
          aria-expanded="false"
          aria-controls="${menuId}"
          title="Aksi"
        >${AKSI_ICON}</button>
        <div class="aksi-menu__dropdown" id="${menuId}" data-aksi-dropdown hidden>
          <button class="aksi-menu__item" type="button" data-aksi-action="lihat">
            <span class="aksi-menu__icon aksi-menu__icon--lihat">${EYE_ICON}</span>
            Lihat
          </button>
          <button class="aksi-menu__item" type="button" data-aksi-action="riwayat">
            <span class="aksi-menu__icon aksi-menu__icon--riwayat">${CLOCK_ICON}</span>
            Riwayat
          </button>
        </div>
      </div>
    </td>
  `;
}

/**
 * Pasang event listener untuk semua sel Aksi di dalam `root`. Panggil
 * di akhir bindEvents() setiap halaman tabel, tiap kali tabelnya
 * selesai di-render ulang.
 */
export function bindAksiDropdowns(root) {
  ensureOutsideHandlers();

  root.querySelectorAll('[data-aksi-menu]').forEach((menu) => {
    const toggle = menu.querySelector('[data-aksi-toggle]');
    const dropdown = menu.querySelector('[data-aksi-dropdown]');

    toggle?.addEventListener('click', (event) => {
      event.stopPropagation();
      const isOpen = !dropdown.hasAttribute('hidden');
      closeAllMenus();
      if (!isOpen) {
        dropdown.removeAttribute('hidden');
        toggle.setAttribute('aria-expanded', 'true');
      }
    });

    // Item menu masih dummy -- web ini belum ngelink ke halaman
    // detail/riwayat manapun, jadi cuma nutup menunya waktu diklik.
    menu.querySelectorAll('[data-aksi-action]').forEach((item) => {
      item.addEventListener('click', (event) => {
        event.stopPropagation();
        closeMenu(menu);
      });
    });
  });
}