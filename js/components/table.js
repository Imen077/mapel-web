// ============================================================
// MAPEL - components/table.js
// Menu aksi ("Lihat" / "Riwayat") untuk kolom Aksi di semua tabel
// data (Monitoring & Antrian). "Riwayat" masih dummy (belum ada
// halaman riwayat). "Lihat" bisa disambungkan ke halaman lain lewat
// callback onLihat di bindAksiDropdowns() -- kalau tidak dioper,
// perilakunya tetap dummy (cuma nutup menu) seperti sebelumnya.
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
 * @param {string} [id] - id item baris ini (mis. item.id), dipakai
 *   bindAksiDropdowns() buat tahu baris mana yang diklik pas
 *   callback onLihat/onRiwayat dipanggil. Opsional -- kalau tidak
 *   dioper, callback tetap jalan tapi dengan id `undefined`.
 */
export function renderAksiCell(id) {
  const menuId = `aksi-menu-${++seq}`;
  return `
    <td class="data-table__aksi-cell">
      <div class="aksi-menu" data-aksi-menu ${id ? `data-aksi-id="${id}"` : ''}>
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
 * @param {HTMLElement} root
 * @param {Object} [options]
 * @param {(id: string|undefined) => void} [options.onLihat] - dipanggil pas item "Lihat" diklik, dioper id baris (dari renderAksiCell). Kalau tidak dioper, "Lihat" cuma nutup menu (perilaku lama).
 * @param {(id: string|undefined) => void} [options.onRiwayat] - sama seperti onLihat, buat item "Riwayat".
 */
export function bindAksiDropdowns(root, { onLihat, onRiwayat } = {}) {
  ensureOutsideHandlers();

  root.querySelectorAll('[data-aksi-menu]').forEach((menu) => {
    const toggle = menu.querySelector('[data-aksi-toggle]');
    const dropdown = menu.querySelector('[data-aksi-dropdown]');
    const id = menu.getAttribute('data-aksi-id') || undefined;

    toggle?.addEventListener('click', (event) => {
      event.stopPropagation();
      const isOpen = !dropdown.hasAttribute('hidden');
      closeAllMenus();
      if (!isOpen) {
        dropdown.removeAttribute('hidden');
        toggle.setAttribute('aria-expanded', 'true');
      }
    });

    menu.querySelectorAll('[data-aksi-action]').forEach((item) => {
      item.addEventListener('click', (event) => {
        event.stopPropagation();
        closeMenu(menu);
        const action = item.getAttribute('data-aksi-action');
        if (action === 'lihat') onLihat?.(id);
        if (action === 'riwayat') onRiwayat?.(id);
      });
    });
  });
}