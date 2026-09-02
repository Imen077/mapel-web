// ============================================================
// MAPEL - components/modal.js
// Modal generik yang di-mount langsung ke document.body (bukan ke
// root halaman), jadi bisa dipanggil dari page module manapun tanpa
// perlu tahu struktur DOM halaman itu. Dipakai pertama kali oleh
// pengajuan-proposal.js buat popup "Sukses! Data berhasil dikirim."
// setelah tombol "Simpan & Kirim" ditekan.
// ============================================================

const CHECK_ICON = '<svg width="28" height="28" viewBox="0 0 24 24" fill="none"><path d="m6 12.5 4 4 8-9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const ALERT_ICON = '<svg width="28" height="28" viewBox="0 0 24 24" fill="none"><path d="M12 9v4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><circle cx="12" cy="16" r="1.1" fill="currentColor"/><circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="2"/></svg>';

/**
 * Tampilkan modal generik di tengah layar.
 * @param {Object} options
 * @param {string} [options.icon] - SVG string buat ikon di lingkaran atas. Default centang sukses.
 * @param {'success'|'error'} [options.variant='success'] - Warna lingkaran ikon.
 * @param {string} options.title
 * @param {string} [options.message]
 * @param {string} [options.okLabel='OK']
 * @param {() => void} [options.onOk] - Dipanggil setelah tombol OK ditekan (modal sudah ditutup).
 * @returns {() => void} Fungsi buat nutup modal secara manual (mis. dari luar).
 */
export function showModal({
  icon = CHECK_ICON,
  variant = 'success',
  title,
  message = '',
  okLabel = 'OK',
  onOk
} = {}) {
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = `
    <div class="modal-dialog" role="alertdialog" aria-modal="true" aria-labelledby="modal-dialog-title">
      <div class="modal-dialog__icon${variant === 'error' ? ' modal-dialog__icon--error' : ''}">${icon}</div>
      <h2 class="modal-dialog__title" id="modal-dialog-title">${title}</h2>
      ${message ? `<p class="modal-dialog__message">${message}</p>` : ''}
      <div class="modal-dialog__actions">
        <button type="button" class="btn btn-dark" data-modal-ok>${okLabel}</button>
      </div>
    </div>
  `;

  function close() {
    document.removeEventListener('keydown', onKeydown);
    overlay.remove();
  }

  function onKeydown(event) {
    if (event.key === 'Escape') close();
  }

  overlay.querySelector('[data-modal-ok]').addEventListener('click', () => {
    close();
    onOk?.();
  });
  // Klik area gelap di luar dialog juga menutup modal (tanpa memicu onOk).
  overlay.addEventListener('click', (event) => {
    if (event.target === overlay) close();
  });
  document.addEventListener('keydown', onKeydown);

  document.body.appendChild(overlay);
  overlay.querySelector('[data-modal-ok]').focus();

  return close;
}

/** Shortcut buat popup sukses seperti desain "Sukses! Data berhasil dikirim." */
export function showSuccessModal({ title = 'Sukses!', message = 'Data berhasil dikirim.', okLabel, onOk } = {}) {
  return showModal({ icon: CHECK_ICON, variant: 'success', title, message, okLabel, onOk });
}

/** Shortcut buat popup gagal/error dengan gaya yang senada. */
export function showErrorModal({ title = 'Gagal', message = '', okLabel, onOk } = {}) {
  return showModal({ icon: ALERT_ICON, variant: 'error', title, message, okLabel, onOk });
}

/**
 * Modal konfirmasi 2 tombol (Batal / aksi konfirmasi) -- dipakai buat
 * aksi yang butuh persetujuan eksplisit dulu sebelum jalan, misalnya
 * tombol "Hapus" di halaman Detail Proposal. Menggantikan
 * window.confirm() bawaan browser.
 * @param {Object} options
 * @param {string} [options.icon] - Default ikon "!" (sama kayak ALERT_ICON).
 * @param {'warning'|'error'} [options.variant='warning']
 * @param {string} options.title - Judul, mis. "Hapus Proposal".
 * @param {string} [options.subject] - Nama item yang kena aksi, ditebalkan (mis. judul proposal).
 * @param {string} [options.message='Apakah anda yakin?']
 * @param {string} [options.cancelLabel='Batal']
 * @param {string} [options.confirmLabel='Ya, hapus']
 * @param {() => void} [options.onConfirm] - Dipanggil setelah tombol konfirmasi ditekan (modal sudah ditutup).
 * @param {() => void} [options.onCancel] - Dipanggil kalau dibatalkan (tombol Batal, klik luar, atau Escape).
 * @returns {() => void} Fungsi buat nutup modal secara manual.
 */
export function showConfirmModal({
  icon = ALERT_ICON,
  variant = 'warning',
  title,
  subject = '',
  message = 'Apakah anda yakin?',
  cancelLabel = 'Batal',
  confirmLabel = 'Ya, hapus',
  onConfirm,
  onCancel
} = {}) {
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = `
    <div class="modal-dialog" role="alertdialog" aria-modal="true" aria-labelledby="modal-confirm-title">
      <div class="modal-dialog__icon modal-dialog__icon--${variant}">${icon}</div>
      <h2 class="modal-dialog__title" id="modal-confirm-title">${title}</h2>
      ${subject ? `<p class="modal-dialog__subject">${subject}</p>` : ''}
      <p class="modal-dialog__message modal-dialog__message--tight">${message}</p>
      <div class="modal-dialog__actions modal-dialog__actions--split">
        <button type="button" class="btn btn-muted" data-modal-cancel>${cancelLabel}</button>
        <button type="button" class="btn btn-dark" data-modal-confirm>${confirmLabel}</button>
      </div>
    </div>
  `;

  function close() {
    document.removeEventListener('keydown', onKeydown);
    overlay.remove();
  }

  function onKeydown(event) {
    if (event.key === 'Escape') {
      close();
      onCancel?.();
    }
  }

  overlay.querySelector('[data-modal-cancel]').addEventListener('click', () => {
    close();
    onCancel?.();
  });
  overlay.querySelector('[data-modal-confirm]').addEventListener('click', () => {
    close();
    onConfirm?.();
  });
  // Klik area gelap di luar dialog = batal juga.
  overlay.addEventListener('click', (event) => {
    if (event.target === overlay) {
      close();
      onCancel?.();
    }
  });
  document.addEventListener('keydown', onKeydown);

  document.body.appendChild(overlay);
  overlay.querySelector('[data-modal-cancel]').focus();

  return close;
}