// ============================================================
// MAPEL - core/format.js
// Helper format tanggal/angka yang dipakai berulang di berbagai
// halaman (Monitoring, Antrian, Detail, dst) -- disatukan di
// sini biar formatnya konsisten di seluruh app.
// ============================================================

/**
 * Format tanggal panjang ala Indonesia, mis. "Selasa, 21 Juli 2026".
 * @param {string|number|Date} dateInput - ISO string ('2026-07-21'), timestamp, atau Date
 */
export function formatDateLongID(dateInput) {
  const date = dateInput instanceof Date ? dateInput : new Date(dateInput);
  if (Number.isNaN(date.getTime())) return '-';

  const formatted = new Intl.DateTimeFormat('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(date);

  // Kapitalkan huruf pertama tiap kata (Intl id-ID kadang lowercase nama hari/bulan).
  return formatted.replace(/\b\p{L}/gu, (ch) => ch.toUpperCase());
}

/** @param {string|number|Date} dateInput */
export function getYear(dateInput) {
  const date = dateInput instanceof Date ? dateInput : new Date(dateInput);
  return date.getFullYear();
}
